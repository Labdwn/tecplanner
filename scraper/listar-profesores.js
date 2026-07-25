// listar-profesores.js
// Script puntual (no corre en el cron): recorre TODOS los archivos ya
// generados en scraper/data/{año}/{periodo}/{sede}/{escuela}.json y arma un
// listado de profesores únicos por curso. Solo lee, no modifica ni escribe
// nada dentro de data/.
//
// Normaliza los nombres antes de compararlos, para que un mismo profesor
// escrito de formas distintas entre escuelas o años (ej. "Rojas, Francisco"
// vs "ROJAS, Francisco " vs "Rojas,Francisco.") NUNCA aparezca dos veces en
// la lista final. La normalización (ver normalizarClave) ignora
// mayúsculas/minúsculas, tildes, espacios repetidos y puntuación al final;
// NO intenta resolver abreviaturas de apellidos distintos (ej. "Rojas,
// Francisco" vs "Rojas Vega, Francisco" siguen siendo tratados como personas
// distintas, porque no hay forma segura de saber si son la misma persona
// solo con el string).
//
// También descarta "profesores fantasma": grupos donde el campo `profesor`
// no está vacío pero tampoco es un nombre real (ej. "POR ASIGNAR", "SIN
// ASIGNAR", "PENDIENTE"). Antes esto colaba como si fuera un profesor más.
//
// Para que puedas auditar qué se está descartando y por qué, el script
// escribe output/diagnostico_profesores.json con el detalle de grupos
// sin profesor válido, por archivo. Y output/variantes_detectadas.json con,
// para cada nombre "canónico" elegido, todas las formas originales que se
// agruparon bajo él.
//
// En la lista por curso (profesores_por_curso.txt/.json), si un profesor ya
// apareció en un curso anterior (en orden alfabético de código), se marca
// "(r)" junto a su nombre para que sea fácil ver quién repite curso.
//
// Uso (desde la carpeta scraper/):
//   node listar-profesores.js
//   node listar-profesores.js --anio 2026 --periodo 2

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Filtro por año/período: por defecto 2026-2, pero se puede sobreescribir:
//   node listar-profesores.js --anio 2026 --periodo 2
const args = process.argv.slice(2);
function getArg(nombre, porDefecto) {
    const i = args.indexOf(`--${nombre}`);
    return (i !== -1 && args[i + 1]) ? args[i + 1] : porDefecto;
}
const ANIO = getArg('anio', '2026');
const PERIODO = getArg('periodo', '2');

const DATA_DIR = path.join('data', ANIO, PERIODO);
const OUTPUT_DIR = 'output';

// Valores que aparecen en el campo `profesor` pero que NO son un profesor
// real (grupo todavía sin asignar). Se comparan ya normalizados (sin
// tildes, en minúsculas), así que basta con escribirlos en una forma.
const PLACEHOLDERS = new Set([
    'por asignar',
    'sin asignar',
    'pendiente',
    'no asignado',
    'sin profesor',
    'por definir',
    'tba',
    'n/a',
    'na',
    '-',
]);

async function listarArchivosJSON(dir) {
    const entradas = await readdir(dir, { withFileTypes: true });
    let archivos = [];
    for (const entrada of entradas) {
        const ruta = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            archivos = archivos.concat(await listarArchivosJSON(ruta));
        } else if (entrada.name.endsWith('.json')) {
            archivos.push(ruta);
        }
    }
    return archivos;
}

// Normaliza un nombre para efectos de COMPARACIÓN (no para mostrar):
// - quita espacios sobrantes al inicio/fin y colapsa espacios internos
// - pasa todo a minúsculas
// - quita tildes/diacríticos (á->a, é->e)
// - quita puntuación final sobrante (comas/puntos repetidos al final)
function normalizarClave(nombre) {
    return nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita diacríticos
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[.,]+$/g, '')
        .trim();
}

function esPlaceholder(clave) {
    return PLACEHOLDERS.has(clave);
}

// Dado un conjunto de variantes textuales para la misma clave normalizada,
// elige cuál mostrar: la más frecuente y, en caso de empate, la más larga
// (heurística: suele ser la más completa, ej. incluye ambos apellidos).
function elegirNombreCanonico(conteoVariantes) {
    let mejor = null;
    for (const [variante, count] of conteoVariantes.entries()) {
        if (
            !mejor ||
            count > mejor.count ||
            (count === mejor.count && variante.length > mejor.variante.length)
        ) {
            mejor = { variante, count };
        }
    }
    return mejor.variante;
}

async function main() {
    let archivos;
    try {
        archivos = await listarArchivosJSON(DATA_DIR);
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.error(`[listar-profesores] La carpeta ${DATA_DIR}/ no existe.`);
            console.error(`[listar-profesores] Revisá qué años/períodos sí tenés scrapeados dentro de data/.`);
            process.exitCode = 1;
            return;
        }
        throw e;
    }

    console.log(`[listar-profesores] ${archivos.length} archivos encontrados en ${DATA_DIR}/`);

    // codigo del curso -> { nombre, profesores: Map<claveNormalizada, Map<variante, count>> }
    const cursos = new Map();

    // Diagnóstico: por qué un grupo terminó sin profesor válido.
    // archivo -> { totalGrupos, sinProfesor, placeholders, detalle: [...] }
    const diagnostico = new Map();
    let totalGruposGlobal = 0;
    let gruposValidosGlobal = 0;

    for (const archivo of archivos) {
        let data;
        try {
            data = JSON.parse(await readFile(archivo, 'utf-8'));
        } catch {
            console.warn(`[listar-profesores] no se pudo leer ${archivo}, se omite.`);
            continue;
        }

        const diagArchivo = { totalGrupos: 0, sinProfesor: 0, placeholders: 0, detalle: [] };

        for (const curso of data.cursos || []) {
            if (!curso.codigo) continue;

            if (!cursos.has(curso.codigo)) {
                cursos.set(curso.codigo, { nombre: curso.nombre || curso.codigo, profesores: new Map() });
            }
            const entrada = cursos.get(curso.codigo);

            for (const grupo of curso.grupos || []) {
                diagArchivo.totalGrupos++;
                totalGruposGlobal++;

                const nombreProf = grupo.profesor?.trim();
                if (!nombreProf) {
                    diagArchivo.sinProfesor++;
                    diagArchivo.detalle.push({ curso: curso.codigo, grupo: grupo.grupo, motivo: 'vacio' });
                    continue;
                }

                const clave = normalizarClave(nombreProf);
                if (!clave) {
                    diagArchivo.sinProfesor++;
                    diagArchivo.detalle.push({ curso: curso.codigo, grupo: grupo.grupo, motivo: 'vacio' });
                    continue;
                }

                if (esPlaceholder(clave)) {
                    diagArchivo.placeholders++;
                    diagArchivo.detalle.push({ curso: curso.codigo, grupo: grupo.grupo, motivo: 'placeholder', valor: nombreProf });
                    continue;
                }

                gruposValidosGlobal++;

                if (!entrada.profesores.has(clave)) {
                    entrada.profesores.set(clave, new Map());
                }
                const variantes = entrada.profesores.get(clave);
                variantes.set(nombreProf, (variantes.get(nombreProf) || 0) + 1);
            }
        }

        if (diagArchivo.sinProfesor > 0 || diagArchivo.placeholders > 0) {
            diagnostico.set(archivo, diagArchivo);
        }
    }

    const codigosOrdenados = [...cursos.keys()].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

    let salidaTexto = '';
    const salidaJSON = {};
    // clave normalizada global -> Map<variante, count>, para el reporte de auditoría
    const variantesGlobales = new Map();
    // clave normalizada global -> Set<"codigo - nombre">, para la lista maestra sin duplicados
    const cursosPorClave = new Map();
    // claves ya vistas en un curso anterior (en el orden en que se imprimen
    // los cursos), para poder marcar "(r)" cuando un profesor repite.
    const clavesVistas = new Set();

    for (const codigo of codigosOrdenados) {
        const { nombre, profesores } = cursos.get(codigo);

        const nombresCanonicos = [];
        for (const [clave, variantes] of profesores.entries()) {
            const canonico = elegirNombreCanonico(variantes);
            const repite = clavesVistas.has(clave);
            nombresCanonicos.push({ nombre: canonico, clave, repite });
            clavesVistas.add(clave);

            if (!variantesGlobales.has(clave)) {
                variantesGlobales.set(clave, new Map());
            }
            const globalVariantes = variantesGlobales.get(clave);
            for (const [variante, count] of variantes.entries()) {
                globalVariantes.set(variante, (globalVariantes.get(variante) || 0) + count);
            }

            if (!cursosPorClave.has(clave)) {
                cursosPorClave.set(clave, new Set());
            }
            cursosPorClave.get(clave).add(`${codigo} - ${nombre}`);
        }

        nombresCanonicos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        salidaTexto += `${codigo} - ${nombre}:\n`;
        nombresCanonicos.forEach(({ nombre: p, repite }) => {
            salidaTexto += `  - ${p}${repite ? ' (r)' : ''}\n`;
        });
        salidaTexto += '\n';

        salidaJSON[codigo] = {
            nombre,
            profesores: nombresCanonicos.map(({ nombre: p, repite }) => ({ nombre: p, repetido: repite })),
        };
    }

    console.log('\n' + salidaTexto);

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'profesores_por_curso.txt'), salidaTexto, 'utf-8');
    await writeFile(path.join(OUTPUT_DIR, 'profesores_por_curso.json'), JSON.stringify(salidaJSON, null, 2), 'utf-8');

    // Lista maestra: cada profesor aparece UNA sola vez, con la lista de
    // cursos que imparte (así un profesor de Precálculo y Cálculo, por
    // ejemplo, sale una sola vez con ambos cursos en su lista).
    const listaMaestra = [...variantesGlobales.keys()]
        .map(clave => ({
            nombre: elegirNombreCanonico(variantesGlobales.get(clave)),
            cursos: [...cursosPorClave.get(clave)].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    let salidaMaestraTexto = '';
    for (const { nombre, cursos: cursosDelProfesor } of listaMaestra) {
        salidaMaestraTexto += `${nombre}:\n`;
        cursosDelProfesor.forEach(c => { salidaMaestraTexto += `  - ${c}\n`; });
        salidaMaestraTexto += '\n';
    }

    await writeFile(path.join(OUTPUT_DIR, 'profesores_unicos.txt'), salidaMaestraTexto, 'utf-8');
    await writeFile(
        path.join(OUTPUT_DIR, 'profesores_unicos.json'),
        JSON.stringify(listaMaestra, null, 2),
        'utf-8'
    );

    // Reporte de auditoría: solo incluye claves donde hubo más de una variante
    // textual distinta, para que sea fácil revisar qué se fusionó.
    const variantesDetectadas = {};
    for (const [clave, variantes] of variantesGlobales.entries()) {
        if (variantes.size > 1) {
            const canonico = elegirNombreCanonico(variantes);
            variantesDetectadas[canonico] = [...variantes.keys()].sort((a, b) => a.localeCompare(b, 'es'));
        }
    }
    await writeFile(
        path.join(OUTPUT_DIR, 'variantes_detectadas.json'),
        JSON.stringify(variantesDetectadas, null, 2),
        'utf-8'
    );

    // Diagnóstico: grupos que NO terminaron con un profesor válido, por
    // archivo, para poder confirmar si "faltan profesores" es un problema
    // real de datos o si simplemente esos grupos no tienen profesor
    // asignado todavía en el sistema del TEC.
    const diagnosticoJSON = {
        resumen: {
            totalGrupos: totalGruposGlobal,
            gruposConProfesorValido: gruposValidosGlobal,
            gruposDescartados: totalGruposGlobal - gruposValidosGlobal,
        },
        porArchivo: Object.fromEntries(diagnostico),
    };
    await writeFile(
        path.join(OUTPUT_DIR, 'diagnostico_profesores.json'),
        JSON.stringify(diagnosticoJSON, null, 2),
        'utf-8'
    );

    const totalProfesoresUnicos = variantesGlobales.size;

    console.log(
        `[listar-profesores] ${cursos.size} cursos, ${totalProfesoresUnicos} profesores únicos (normalizados).`
    );
    console.log(
        `[listar-profesores] ${totalGruposGlobal} grupos totales, ${gruposValidosGlobal} con profesor válido, ${totalGruposGlobal - gruposValidosGlobal} descartados (sin asignar / placeholder).`
    );
    console.log(
        `[listar-profesores] ${Object.keys(variantesDetectadas).length} nombres con variantes fusionadas — revisá output/variantes_detectadas.json.`
    );
    if (diagnostico.size > 0) {
        console.log(
            `[listar-profesores] ${diagnostico.size} archivos con grupos descartados — revisá output/diagnostico_profesores.json.`
        );
    }
    console.log('[listar-profesores] guardado en output/profesores_por_curso.txt, output/profesores_por_curso.json, output/profesores_unicos.txt, output/profesores_unicos.json, output/variantes_detectadas.json y output/diagnostico_profesores.json');
}

main().catch((error) => {
    console.error('[listar-profesores] la ejecución falló:', error);
    process.exitCode = 1;
});