// guia.js
// Única responsabilidad: hablar con la guía de horarios del Expediente
// Estudiantil (TEC Digital) y devolver filas ya parseadas: código, grupo,
// horario y aula. No conoce el formato interno de TEC Planner ni escribe
// archivos; el cruce con los grupos de Fase 1 vive en aulas.js.
//
// Requiere sesión iniciada. La cookie se pasa en TECDIGITAL_COOKIE con el
// formato:  ad_user_login=...; ad_session_id=...
// (ambas son HttpOnly: se copian desde DevTools → Application → Cookies, o
// del header Cookie de cualquier request en la pestaña Network).
// Este módulo nunca loguea el valor de la cookie.

import { GUIA_TEC, SEDES } from './config.js';
import { fetchConReintentos } from './utils.js';

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizar(texto) {
    return String(texto ?? '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase().replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Parseo (funciones puras)
// ---------------------------------------------------------------------------

function decodificarEntidades(texto) {
    return texto
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&amp;/gi, '&');
}

function limpiarCelda(html) {
    return decodificarEntidades(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** "Martes - 13:0:16:50" → { dia: 'Martes', inicio: '13:00', fin: '16:50' } */
export function parsearHorarioGuia(texto) {
    const m = /^(.+?)\s*-\s*(\d{1,2}):(\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(texto.trim());
    if (!m) return null;
    const hhmm = (h, min) => `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    return { dia: m[1].trim(), inicio: hhmm(m[2], m[3]), fin: hhmm(m[4], m[5]) };
}

/**
 * "B2-010" → { edificio: 'B2', aula: '10' }. Mismo formato que ya tienen los
 * JSON existentes (aula numérica sin ceros a la izquierda). Devuelve null si
 * no hay edificio y aula separables.
 */
export function parsearAula(texto) {
    const m = /^([^-\s]+)\s*-\s*(\S.*)$/.exec(texto.trim());
    if (!m) return null;
    const aula = /^\d+$/.test(m[2]) ? String(Number(m[2])) : m[2];
    return { edificio: m[1], aula };
}

/**
 * Convierte el HTML de tabla_guia_horario en filas
 * { codigo, grupo, horario: {dia, inicio, fin}|null, aula: {edificio, aula}|null }.
 * Solo usa las filas con 11 celdas <td> (los encabezados usan <th>).
 */
export function parsearTablaGuia(html) {
    const filas = [];
    for (const [, fila] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
        const celdas = [...fila.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => limpiarCelda(c[1]));
        if (celdas.length < 11) continue;
        const grupo = Number(celdas[2]);
        if (!celdas[0] || Number.isNaN(grupo)) continue;
        filas.push({
            codigo: celdas[0],
            grupo,
            horario: parsearHorarioGuia(celdas[4]),
            aula: parsearAula(celdas[5]),
        });
    }
    return filas;
}

/** <span value='CA'>Campus ...</span> → [{ valor: 'CA', texto: 'Campus ...' }] */
export function parsearOpciones(html) {
    return [...html.matchAll(/<span\s+value=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/span>/gi)]
        .map(([, valor, texto]) => ({ valor, texto: limpiarCelda(texto) }));
}

/**
 * Busca la clave de período de la guía (ej. "2026_V_1") que corresponde a un
 * período de TEC Planner ("1", "2", "1V", "2V"). Devuelve null si no existe.
 */
export function resolverClavePeriodo(periodosGuia, anio, periodo) {
    const n = String(periodo).match(/\d+/)?.[0];
    const esVerano = /V$/i.test(String(periodo));
    const candidatos = periodosGuia.filter(({ key }) => new RegExp(`^${anio}_[A-Z]_${n}$`).test(key));

    const elegido = candidatos.find(({ key, data }) =>
        esVerano ? key.includes('_V_') : /SEMESTRE/.test(normalizar(data))
    );
    return elegido?.key ?? null;
}

/** Map<código corto nuestro (CA, SJ...), valor de sede en la guía> por nombre. */
export function resolverCodigosSede(opcionesSedes) {
    const porNombre = new Map(opcionesSedes.map(({ valor, texto }) => [normalizar(texto), valor]));
    const resultado = new Map();
    for (const [nombreCompleto, codigo] of Object.entries(SEDES)) {
        const valor = porNombre.get(normalizar(nombreCompleto));
        if (valor) resultado.set(codigo, valor);
    }
    return resultado;
}

// ---------------------------------------------------------------------------
// Red
// ---------------------------------------------------------------------------

export function obtenerSesionGuia() {
    const cookie = process.env.TECDIGITAL_COOKIE;
    if (!cookie) {
        throw new Error(
            '[guia] falta TECDIGITAL_COOKIE. Fase 2 se omite; ' +
            'Fase 1 continúa con edificio/aula en null.'
        );
    }
    return { headers: { Cookie: cookie } };
}

async function pedirTexto(url, params, sesion) {
    const cuerpo = new URLSearchParams(params).toString();
    const esGet = GUIA_TEC.metodo === 'GET';
    const respuesta = await fetchConReintentos(esGet && cuerpo ? `${url}?${cuerpo}` : url, {
        method: GUIA_TEC.metodo,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            Referer: GUIA_TEC.referer,
            ...(sesion?.headers || {}),
        },
        ...(esGet ? {} : { body: cuerpo }),
    });
    return respuesta.text();
}

/** Lista de períodos de la guía. Si no es JSON, la sesión venció. */
export async function listarPeriodos(sesion) {
    const texto = await pedirTexto(GUIA_TEC.endpoints.periodos, {}, sesion);
    try {
        const periodos = JSON.parse(texto);
        if (!Array.isArray(periodos)) throw new Error('no es un arreglo');
        return periodos;
    } catch {
        throw new Error('[guia] respuesta inesperada al listar períodos: la sesión de TEC Digital venció o la cookie es inválida.');
    }
}

export async function listarSedes(sesion) {
    return parsearOpciones(await pedirTexto(GUIA_TEC.endpoints.sedes, {}, sesion));
}

/** Filas de la guía para una combinación sede + carrera + período. Nunca lanza: devuelve null si falla. */
async function consultarTabla({ sede, carrera, periodo }, sesion) {
    try {
        const html = await pedirTexto(GUIA_TEC.endpoints.tabla, { sede, carrera, periodo }, sesion);
        return parsearTablaGuia(html);
    } catch (error) {
        console.warn(`[guia] falló ${sede}/${carrera}/${periodo}: ${error.message}`);
        return null;
    }
}

/**
 * Consulta la guía una vez por cada combinación única sede+escuela+período de
 * los archivos de Fase 1, con concurrencia limitada y pausas.
 *
 * @returns {Promise<Map<string, Array|null>>} clave "codigoSede|codigoEscuela|anio|periodo" → filas
 */
export async function obtenerGuiaPorArchivo(archivos, sesion) {
    const [periodosGuia, sedesGuia] = await Promise.all([listarPeriodos(sesion), listarSedes(sesion)]);
    const codigosSede = resolverCodigosSede(sedesGuia);

    const combos = new Map();
    for (const a of archivos.values()) {
        const clave = claveGuia(a);
        if (combos.has(clave)) continue;

        const periodoGuia = resolverClavePeriodo(periodosGuia, a.anio, a.periodo);
        const sedeGuia = codigosSede.get(a.codigoSede);
        if (!periodoGuia || !sedeGuia) {
            combos.set(clave, { omitir: true, a, periodoGuia, sedeGuia });
            continue;
        }
        combos.set(clave, { sede: sedeGuia, carrera: a.codigoEscuela, periodo: periodoGuia });
    }

    const omitidos = [...combos.values()].filter((c) => c.omitir);
    if (omitidos.some((c) => !c.periodoGuia)) {
        console.warn(
            '[guia] no se encontró el período en la guía para algún archivo. Períodos disponibles: ' +
            periodosGuia.map((p) => p.key).join(', ')
        );
    }
    if (omitidos.some((c) => !c.sedeGuia)) {
        console.warn('[guia] alguna sede no se encontró por nombre en la guía; esos archivos quedan sin aula.');
    }

    const resultados = new Map();
    const cola = [...combos.entries()].filter(([, c]) => !c.omitir);
    let hechas = 0;

    async function trabajador() {
        while (cola.length > 0) {
            const [clave, params] = cola.shift();
            resultados.set(clave, await consultarTabla(params, sesion));
            hechas++;
            if (hechas % 25 === 0) console.log(`[guia] ${hechas}/${hechas + cola.length} consultas`);
            await esperar(GUIA_TEC.pausaMs);
        }
    }
    await Promise.all(Array.from({ length: GUIA_TEC.concurrencia }, trabajador));

    const vacias = [...resultados.entries()].filter(([, filas]) => Array.isArray(filas) && filas.length === 0);
    if (vacias.length > 0) {
        console.warn(`[guia] ${vacias.length} consultas devolvieron 0 filas (ej. ${vacias.slice(0, 3).map(([k]) => k).join(', ')}).`);
    }
    return resultados;
}

export function claveGuia(archivo) {
    return `${archivo.codigoSede}|${archivo.codigoEscuela}|${archivo.anio}|${archivo.periodo}`;
}
