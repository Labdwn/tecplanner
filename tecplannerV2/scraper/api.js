// api.js
// Única responsabilidad: comunicarse con los endpoints del TEC.
// No transforma datos al formato de TEC Planner, no escribe archivos,
// no conoce la estructura final que consume el frontend.

import { ENDPOINTS, ANIO } from './config.js';
import { postJSON } from './utils.js';

/**
 * Descifra la respuesta típica del servicio ASMX: { d: "<json string>" }.
 *
 * El TEC no siempre devuelve JSON ahí adentro: cuando una escuela no tiene
 * datos para el año/período consultado, `d` puede venir como el string
 * plano "NO DATOS" en vez de "[]". En ese caso (o cualquier otro que no
 * sea JSON válido) se registra una advertencia y se devuelve
 * `valorPorDefecto`, en vez de abortar toda la corrida por una escuela
 * que simplemente no tiene información.
 */
function desempaquetar(respuesta, valorPorDefecto = null) {
    try {
        return JSON.parse(respuesta.d);
    } catch {
        console.warn(`[api] respuesta no es JSON válido: "${respuesta.d}". Se usa valor por defecto.`);
        return valorPorDefecto;
    }
}

/**
 * Obtiene la lista cruda de escuelas tal como la devuelve el TEC.
 */
export async function obtenerEscuelas() {
    const respuesta = await postJSON(ENDPOINTS.escuelas, {});
    return desempaquetar(respuesta, []);
}

/**
 * Obtiene modalidades y períodos disponibles, tal como los devuelve el TEC.
 */
export async function obtenerModalidadesPeriodos() {
    const respuesta = await postJSON(ENDPOINTS.modalidadesPeriodos, {});
    return desempaquetar(respuesta, []);
}

/**
 * Obtiene los cursos crudos de una escuela para un año dado.
 * Si la escuela no tiene datos (el TEC responde "NO DATOS" en vez de un
 * JSON de cursos), devuelve un arreglo vacío — scraper.js ya sabe tratar
 * eso como "sin cursos, se omite" en vez de un error.
 *
 * @param {string} codigoEscuela - ej. 'MA', 'QU'
 * @param {string} [anio] - ej. '2026'; por defecto usa config.ANIO
 */
export async function obtenerCursos(codigoEscuela, anio = ANIO) {
    const respuesta = await postJSON(ENDPOINTS.cursos, {
        escuela: codigoEscuela,
        ano: anio,
    });
    return desempaquetar(respuesta, []);
}