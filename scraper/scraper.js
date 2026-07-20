// scraper.js
// Punto de entrada y orquestador. Descarga, transforma y arma todo en
// memoria; únicamente toca el disco si el proceso completo (descarga +
// parseo + historial + metadata) terminó sin errores. Si algo falla a
// mitad de camino, no se escribe ni se modifica ningún archivo.
//
// Además: cada archivo se valida (validacion.js) antes de guardarse, y
// solo se reescribe si su contenido cambió respecto a lo que ya había en
// disco (utils.escribirJSONSiCambio). metadata.json solo se regenera si
// hubo algún cambio real en datos o historial — si no, ni su timestamp
// se toca, para no generar commits vacíos en el workflow.

import { ANIO, RUTAS, PERIODO, esPosgrado, esPeriodoBaseValido } from './config.js';
import { obtenerEscuelas, obtenerCursos } from './api.js';
import { parsearEscuelas, parsearCursosPorEscuela, periodoEfectivo } from './parser.js';
import { actualizarHistorial } from './history.js';
import { construirMetadata } from './metadata.js';
import { crearAgregador } from './agregador.js';
import { validarArchivo } from './validacion.js';
import { escribirJSON, escribirJSONSiCambio, leerJSONSiExiste } from './utils.js';
import { ejecutarFase2 } from './fase2.js';

/**
 * Descarga y parsea todas las escuelas. Todo el resultado queda en
 * memoria dentro del agregador; esta función nunca toca el disco.
 * Si obtenerCursos falla tras sus reintentos (ver utils.js), la excepción
 * sube sin capturarse: preferimos abortar toda la corrida antes que
 * publicar un conjunto de datos incompleto.
 */
async function recolectarDatos() {
    const todasLasEscuelas = parsearEscuelas(await obtenerEscuelas());
    const escuelas = todasLasEscuelas.filter((e) => !esPosgrado(e.nombre));
    const excluidas = todasLasEscuelas.length - escuelas.length;

    console.log(
        `[scraper] ${escuelas.length} escuelas de grado para el año ${ANIO}` +
        `${PERIODO ? `, período ${PERIODO}` : ' (períodos 1, 2 y sus variantes de Verano)'} ` +
        `(${excluidas} de posgrado excluidas)`
    );

    const agregador = crearAgregador();
    let descartadasPorCalendario = 0;

    for (const escuela of escuelas) {
        console.log(`[scraper] procesando ${escuela.codigo} - ${escuela.nombre}`);
        let sesiones = await obtenerCursos(escuela.codigo, ANIO);

        const totalCrudo = sesiones.length;
        sesiones = sesiones.filter(esPeriodoBaseValido);
        descartadasPorCalendario += totalCrudo - sesiones.length;

        if (PERIODO) {
            sesiones = sesiones.filter((s) => String(periodoEfectivo(s)) === PERIODO);
        }

        if (sesiones.length === 0) {
            console.log(`[scraper]   sin cursos para ${escuela.codigo}${PERIODO ? ` en período ${PERIODO}` : ''}, se omite`);
            continue;
        }

        const resultados = parsearCursosPorEscuela(sesiones, escuela.codigo);
        agregador.agregarEscuela(resultados);
    }

    if (descartadasPorCalendario > 0) {
        console.log(
            `[scraper] ${descartadasPorCalendario} sesiones descartadas por pertenecer a ` +
            'períodos fuera de 1/2 (calendarios ejecutivos/trimestrales/etc.).'
        );
    }

    return { escuelas, agregador };
}

/**
 * Aplica actualizarHistorial() una vez por cada período detectado, para
 * no mezclar cursos de distintos semestres bajo la misma etiqueta.
 */
function actualizarHistorialCompleto(historialPrevio, cursosPorPeriodo) {
    let historial = historialPrevio;
    for (const [periodo, cursos] of cursosPorPeriodo) {
        historial = actualizarHistorial(historial, cursos, ANIO, periodo);
    }
    return historial;
}

function contarCursosUnicos(cursosPorPeriodo) {
    const codigos = new Set();
    for (const cursos of cursosPorPeriodo.values()) {
        cursos.forEach((curso) => codigos.add(curso.codigo));
    }
    return codigos.size;
}

/**
 * Único punto donde el scraper escribe en disco. Se llama una sola vez,
 * al final, con todo ya calculado y validado en memoria.
 *
 * @param {Map<string, object>} archivos - ruta → contenido, de agregador.js
 * @param {object} historial - historial ya actualizado
 * @param {() => object} construirMetadataFinal - fábrica perezosa: solo se
 *   invoca (y solo se escribe su resultado) si hubo cambios reales.
 */
async function escribirTodo(archivos, historial, construirMetadataFinal) {
    let huboCambios = false;

    for (const [ruta, contenido] of archivos.entries()) {
        validarArchivo(contenido);
        const escribio = await escribirJSONSiCambio(ruta, contenido);
        if (escribio) huboCambios = true;
    }

    const escribioHistorial = await escribirJSONSiCambio(RUTAS.history, historial);
    if (escribioHistorial) huboCambios = true;

    const { construirIndice } = await import('./agregador.js');
    const escribioIndice = await escribirJSONSiCambio('output/indice.json', construirIndice(archivos));
    if (escribioIndice) huboCambios = true;

    if (huboCambios) {
        await escribirJSON(RUTAS.metadata, construirMetadataFinal());
        console.log('[scraper] hubo cambios: metadata.json actualizado.');
    } else {
        console.log('[scraper] sin cambios respecto a la corrida anterior; no se reescribió nada.');
    }

    return huboCambios;
}

async function main() {
    const { escuelas, agregador } = await recolectarDatos();

    const cursosPorPeriodo = agregador.obtenerCursosPorPeriodo();
    // Fase 2: enriquecimiento con aulas. Aislada por completo — si falla,
    // archivos queda exactamente igual al de Fase 1 (ver fase2.js).
    const { archivos } = await ejecutarFase2(agregador.obtenerArchivos());

    const historialPrevio = await leerJSONSiExiste(RUTAS.history, {});
    const historialActualizado = actualizarHistorialCompleto(historialPrevio, cursosPorPeriodo);

    // Perezoso: si no hay cambios, ni siquiera se construye el objeto metadata
    // (evita que su timestamp exista "de más" en memoria sin usarse).
    const construirMetadataFinal = () => construirMetadata({
        anio: ANIO,
        periodos: cursosPorPeriodo.keys(),
        totalEscuelas: escuelas.length,
        totalCursos: contarCursosUnicos(cursosPorPeriodo),
        totalArchivos: archivos.size,
    });

    const huboCambios = await escribirTodo(archivos, historialActualizado, construirMetadataFinal);

    console.log(
        `[scraper] listo: ${archivos.size} archivos evaluados, ` +
        `${huboCambios ? 'con cambios' : 'sin cambios'}.`
    );
}

main().catch((error) => {
    console.error('[scraper] la ejecución falló, no se escribió ningún archivo:', error);
    process.exitCode = 1;
});