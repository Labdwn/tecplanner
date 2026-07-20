// agregador.js
// Única responsabilidad: organizar en memoria lo que el parser ya
// produjo. Decide la ruta de cada archivo de salida y arma la lista de
// cursos agrupados por período para alimentar a history.js. No hace
// llamadas HTTP ni escribe archivos: scraper.js decide cuándo persistir.

import path from 'node:path';
import { RUTAS } from './config.js';

function construirRutaArchivo({ anio, periodo, codigoSede, codigoEscuela }) {
    return path.join(RUTAS.data, String(anio), String(periodo), codigoSede, `${codigoEscuela}.json`);
}

/**
 * Crea un agregador nuevo, con su propio estado interno (dos Map). Se usa
 * una instancia por corrida del scraper.
 */
export function crearAgregador() {
    const archivos = new Map();         // ruta de archivo → contenido completo
    const cursosPorPeriodo = new Map(); // periodo → arreglo de {codigo, nombre, creditos}

    /**
     * Vuelca los resultados de una escuela (uno o más bloques sede+período,
     * tal como los devuelve parser.parsearCursosPorEscuela) al estado del
     * agregador.
     */
    function agregarEscuela(resultadosPorSedePeriodo) {
        for (const resultado of resultadosPorSedePeriodo) {
            const ruta = construirRutaArchivo(resultado);
            archivos.set(ruta, resultado);

            if (!cursosPorPeriodo.has(resultado.periodo)) {
                cursosPorPeriodo.set(resultado.periodo, []);
            }
            cursosPorPeriodo.get(resultado.periodo).push(
                ...resultado.cursos.map(({ codigo, nombre, creditos }) => ({ codigo, nombre, creditos }))
            );
        }
    }

    return {
        agregarEscuela,
        obtenerArchivos: () => archivos,
        obtenerCursosPorPeriodo: () => cursosPorPeriodo,
    };
}

export function construirIndice(archivos) {
    const indice = {};
    for (const contenido of archivos.values()) {
        const { anio, periodo, codigoSede, codigoEscuela, nombreEscuela } = contenido;
        indice[anio] ??= {};
        indice[anio][periodo] ??= { sedes: {} };
        indice[anio][periodo].sedes[codigoSede] ??= {};
        indice[anio][periodo].sedes[codigoSede][codigoEscuela] = nombreEscuela;
    }
    return indice;
}