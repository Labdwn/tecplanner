// utils.js
// Utilidades genéricas sin conocimiento del dominio de TEC Planner:
// red con reintentos y escritura de archivos. No sabe qué es un curso,
// una escuela ni un grupo.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { RED } from './config.js';

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ejecuta un fetch con reintentos y backoff exponencial.
 * Solo hace la llamada HTTP; no interpreta el contenido de la respuesta.
 * Si se agotan los intentos, lanza — quien llame decide si eso aborta
 * toda la corrida (en scraper.js, sí: la excepción sube hasta main().catch()
 * y como escribirTodo() es lo último en ejecutarse, nunca se escribe nada
 * a medias).
 */
export async function fetchConReintentos(url, options = {}, intentos = RED.maxIntentos) {
    let ultimoError;

    for (let intento = 1; intento <= intentos; intento++) {
        const controlador = new AbortController();
        const timeout = setTimeout(() => controlador.abort(), RED.timeoutMs);

        try {
            const respuesta = await fetch(url, { ...options, signal: controlador.signal });
            clearTimeout(timeout);

            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status} en ${url}`);
            }
            return respuesta;
        } catch (error) {
            clearTimeout(timeout);
            ultimoError = error;
            console.warn(`[fetch] intento ${intento}/${intentos} falló para ${url}: ${error.message}`);

            if (intento < intentos) {
                await esperar(RED.esperaBaseMs * 2 ** (intento - 1));
            }
        }
    }

    throw new Error(`No se pudo completar la solicitud a ${url} tras ${intentos} intentos: ${ultimoError.message}`);
}

/**
 * Realiza un POST con cuerpo JSON y devuelve el objeto de respuesta ya
 * parseado (todavía en el formato crudo del servidor, con su propiedad "d").
 */
export async function postJSON(url, payload) {
    const respuesta = await fetchConReintentos(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return respuesta.json();
}

/**
 * Escribe un objeto como JSON en disco, creando las carpetas intermedias
 * si no existen.
 */
export async function escribirJSON(rutaArchivo, datos) {
    await mkdir(path.dirname(rutaArchivo), { recursive: true });
    await writeFile(rutaArchivo, JSON.stringify(datos, null, 2), 'utf-8');
}

/**
 * Lee un JSON de disco; devuelve `valorPorDefecto` si el archivo no existe
 * o no se puede parsear. Útil para history.js al cargar el historial previo.
 */
export async function leerJSONSiExiste(rutaArchivo, valorPorDefecto = {}) {
    try {
        const { readFile } = await import('node:fs/promises');
        const contenido = await readFile(rutaArchivo, 'utf-8');
        return JSON.parse(contenido);
    } catch {
        return valorPorDefecto;
    }
}

/**
 * Compara el contenido que se va a escribir contra lo que ya existe en
 * disco. Devuelve true si son idénticos (nada que hacer), false si el
 * archivo no existía o cambió.
 *
 * Nota: compara vía JSON.stringify sobre el objeto ya parseado (no el
 * texto crudo), así que diferencias de formato/espaciado del archivo en
 * disco no cuentan como "cambio" — solo diferencias de contenido real.
 */
export async function contenidoIgual(rutaArchivo, datosNuevos) {
    const actual = await leerJSONSiExiste(rutaArchivo, null);
    if (actual === null) return false;
    return JSON.stringify(actual) === JSON.stringify(datosNuevos);
}

/**
 * Escribe solo si el contenido difiere del archivo existente.
 * Devuelve true si escribió (hubo cambio real), false si no hizo nada.
 * Esto es lo que evita commits vacíos en el workflow de GitHub Actions.
 */
export async function escribirJSONSiCambio(rutaArchivo, datos) {
    if (await contenidoIgual(rutaArchivo, datos)) return false;
    await escribirJSON(rutaArchivo, datos);
    return true;
}
