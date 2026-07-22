// build-history-multianual.js
// Script puntual (no corre en el cron): recorre varios años para enriquecer
// output/history.json con la frecuencia real de apertura de cada curso,
// sin generar los archivos de sede/escuela de Fase 1 ni tocar indice.json.
//
// Periodo 1 y 2 ya incluyen sus variantes de Verano automáticamente
// (ver parser.periodoEfectivo): no hace falta pedirlas por separado.
//
// Uso: node --env-file=.env --use-system-ca build-history-multianual.js

import { RUTAS, esPosgrado, esPeriodoBaseValido } from './config.js';
import { obtenerEscuelas, obtenerCursos } from './api.js';
import { parsearEscuelas, parsearCursosPorEscuela } from './parser.js';
import { actualizarHistorial } from './history.js';
import { escribirJSONSiCambio, leerJSONSiExiste } from './utils.js';

const ANIOS = [2025, 2026];

async function recolectarPorAnio(anio) {
    const todasLasEscuelas = parsearEscuelas(await obtenerEscuelas());
    const escuelas = todasLasEscuelas.filter((e) => !esPosgrado(e.nombre));

    console.log(`[build-history] ${anio}: ${escuelas.length} escuelas de grado`);

    // periodo efectivo ("1", "2", "1V", "2V") -> arreglo de {codigo,nombre,creditos}
    const cursosPorPeriodo = new Map();

    for (const escuela of escuelas) {
        let sesiones;
        try {
            sesiones = await obtenerCursos(escuela.codigo, anio);
        } catch (error) {
            console.warn(`[build-history] ${anio}/${escuela.codigo}: fallo al obtener cursos (${error.message}), se omite.`);
            continue;
        }

        sesiones = sesiones.filter(esPeriodoBaseValido);
        if (sesiones.length === 0) continue;

        const resultados = parsearCursosPorEscuela(sesiones, escuela.codigo);
        for (const bloque of resultados) {
            const periodo = bloque.periodo;
            if (!cursosPorPeriodo.has(periodo)) cursosPorPeriodo.set(periodo, []);
            cursosPorPeriodo.get(periodo).push(
                ...bloque.cursos.map(({ codigo, nombre, creditos }) => ({ codigo, nombre, creditos }))
            );
        }
    }

    return cursosPorPeriodo;
}

async function main() {
    let historial = await leerJSONSiExiste(RUTAS.history, {});

    for (const anio of ANIOS) {
        const cursosPorPeriodo = await recolectarPorAnio(anio);
        for (const [periodo, cursos] of cursosPorPeriodo) {
            historial = actualizarHistorial(historial, cursos, anio, periodo);
        }
        console.log(`[build-history] ${anio}: períodos detectados -> ${[...cursosPorPeriodo.keys()].join(', ') || '(ninguno)'}`);
    }

    const escribio = await escribirJSONSiCambio(RUTAS.history, historial);
    console.log(escribio ? '[build-history] history.json actualizado.' : '[build-history] sin cambios respecto al historial actual.');
}

main().catch((error) => {
    console.error('[build-history] la ejecución falló:', error);
    process.exitCode = 1;
});