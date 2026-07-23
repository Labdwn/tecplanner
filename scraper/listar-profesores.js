// listar-profesores.js
// Script puntual (no corre en el cron): recorre TODOS los archivos ya
// generados en scraper/data/{año}/{periodo}/{sede}/{escuela}.json y arma un
// listado de profesores únicos por curso. Solo lee, no modifica ni escribe
// nada dentro de data/.
//
// IMPORTANTE: este listado es "crudo" — el mismo profesor puede aparecer
// escrito de formas distintas entre escuelas o incluso años (ej. "Rojas,
// Francisco" vs "Rojas Vega, Francisco"). Este script NO intenta resolver
// eso, solo agrupa por string exacto. La deduplicación por similitud queda
// para un paso posterior.
//
// Uso (desde la carpeta scraper/):
//   node listar-profesores.js

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
    console.log('[listar-profesores] Escuelas (sedes/archivos) encontradas:');
    archivos.forEach(a => console.log(`  - ${a}`));
    if (!archivos.some(a => /matem[aá]tica/i.test(a))) {
        console.warn('[listar-profesores] ⚠️  No se encontró ningún archivo con "matemática" en el nombre. Si esperabas Cálculo/MA1102 ahí, revisá si esa escuela se scrapeó para este año/período.');
    }

    // codigo del curso -> { nombre, profesores: Set<string> }
    const cursos = new Map();

    for (const archivo of archivos) {
        let data;
        try {
            data = JSON.parse(await readFile(archivo, 'utf-8'));
        } catch {
            console.warn(`[listar-profesores] no se pudo leer ${archivo}, se omite.`);
            continue;
        }

        for (const curso of data.cursos || []) {
            if (!curso.codigo) continue;

            if (!cursos.has(curso.codigo)) {
                cursos.set(curso.codigo, { nombre: curso.nombre || curso.codigo, profesores: new Set() });
            }
            const entrada = cursos.get(curso.codigo);

            for (const grupo of curso.grupos || []) {
                const nombreProf = grupo.profesor?.trim();
                if (nombreProf) entrada.profesores.add(nombreProf);
            }
        }
    }

    const codigosOrdenados = [...cursos.keys()].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

    let salidaTexto = '';
    const salidaJSON = {};

    for (const codigo of codigosOrdenados) {
        const { nombre, profesores } = cursos.get(codigo);
        const listaProfesores = [...profesores].sort((a, b) => a.localeCompare(b, 'es'));

        salidaTexto += `${codigo} - ${nombre}:\n`;
        listaProfesores.forEach(p => { salidaTexto += `  - ${p}\n`; });
        salidaTexto += '\n';

        salidaJSON[codigo] = { nombre, profesores: listaProfesores };
    }

    console.log('\n' + salidaTexto);

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'profesores_por_curso.txt'), salidaTexto, 'utf-8');
    await writeFile(path.join(OUTPUT_DIR, 'profesores_por_curso.json'), JSON.stringify(salidaJSON, null, 2), 'utf-8');

    const totalProfesoresUnicos = new Set(
        [...cursos.values()].flatMap(c => [...c.profesores])
    ).size;

    console.log(
        `[listar-profesores] ${cursos.size} cursos, ${totalProfesoresUnicos} nombres de profesor únicos (sin deduplicar variantes).`
    );
    console.log('[listar-profesores] guardado en output/profesores_por_curso.txt y output/profesores_por_curso.json');
}

main().catch((error) => {
    console.error('[listar-profesores] la ejecución falló:', error);
    process.exitCode = 1;
});