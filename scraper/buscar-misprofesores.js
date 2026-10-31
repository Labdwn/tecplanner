// buscar-misprofesores.js
// Pasos 2 a 4 del llenado de profesores.js.
//
// La página de la escuela en MisProfesores (MISPROFES.escuelaUrl, ver config.js) trae
// embebida la lista completa de sus profesores: id, nombres, apellidos, departamento,
// número de calificaciones y promedio. Entonces:
//   2. se descarga esa página UNA vez (o se usa una copia con --archivo);
//   3. cada profesor del TEC sin URL en profesores.js se cruza contra esa lista:
//      un registro coincide si trae su primer apellido y alguno de sus nombres
//      (lo demás del registro no importa) y entre los que coinciden se elige el que
//      tiene MÁS calificaciones;
//   4. el enlace queda en output/profesores_misprofes.json y, con --aplicar, se copia
//      a profesores.js.
//
// Respeta robots.txt, se identifica con un User-Agent propio y se detiene si el sitio
// bloquea; no intenta esquivar bloqueos. Como mucho 2 solicitudes (robots.txt y la página de la
// escuela), y 0 si ya hay una copia reciente.
//
// Uso (desde scraper/):
//   node buscar-misprofesores.js                       descarga la página y resuelve los pendientes
//   node buscar-misprofesores.js --archivo local/escuela.html   usa una copia ya descargada (sin red)
//   node buscar-misprofesores.js --descargar          fuerza descargar de nuevo (si no, se reutiliza la copia de menos de 6 h)
//   node buscar-misprofesores.js --solo "ACUNA PRADO LUIS"      muestra los candidatos de uno (no guarda)
//   node buscar-misprofesores.js --recalcular          vuelve a calcular también los ya resueltos
//   node buscar-misprofesores.js --aplicar             copia los enlaces "ok" a profesores.js
//   (en npm: npm run profesores -- --aplicar)
//
// profesores.js: --aplicar solo rellena entradas que están en "" y agrega las nuevas en un
// bloque propio. Nunca cambia, reordena ni borra nada de lo que ya tienes.

import { readFile, writeFile, rename, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MISPROFES } from './config.js';
import {
    claveDe, tokensSignificativos, partirNombre, sinTildes,
    leerProfesoresUnicos, evaluarMapaProfesores,
} from './profesores-util.js';

const RUTA_PROFESORES_JS = new URL('../profesores.js', import.meta.url);
const PREFIJO_URL_VALIDA = `${MISPROFES.host}/profesores/`;

// ---------------------------------------------------------------------------
// La lista de profesores de la escuela (funciones puras, con tests)
// ---------------------------------------------------------------------------

const textoPlano = (html) => String(html).replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');

/**
 * Saca de la página los objetos {"i":"13478","n":"Mauricio","a":"Araya Rodriguez","d":"Escuela...","m":"68","c":"6.9265"}
 * (i = id, n = nombres, a = apellidos, d = departamento, m = nº de calificaciones, c = promedio).
 * No depende del orden de las claves ni de cómo esté armado el arreglo que los contiene.
 */
export function extraerListaProfesores(html) {
    const lista = new Map();
    for (const [bruto] of String(html).matchAll(/\{(?:[^{}"]|"(?:[^"\\]|\\.)*")*\}/g)) {
        if (!bruto.includes('"i"')) continue;
        let o;
        try { o = JSON.parse(bruto); } catch { continue; }
        if (!o || typeof o.n !== 'string' || typeof o.a !== 'string') continue;
        const id = String(o.i ?? '');
        if (!/^\d+$/.test(id) || lista.has(id)) continue;
        const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
        lista.set(id, { id, nombres: o.n.trim(), apellidos: o.a.trim(), departamento: String(o.d ?? '').trim(), calificaciones: num(o.m), promedio: num(o.c) });
    }
    return [...lista.values()];
}

/** "Luis Alonso" + "Araya Solano" → "Luis-Alonso-Araya-Solano" (sin tildes, como los enlaces de MisProfesores). */
export function slugPerfil(nombres, apellidos) {
    return sinTildes(`${nombres} ${apellidos}`).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export const urlPerfil = (e) => `${PREFIJO_URL_VALIDA}${slugPerfil(e.nombres, e.apellidos)}_${e.id}`;

/** Índice palabra → registros, para no comparar cada profesor contra los 1800. */
export function indexarLista(lista) {
    const porToken = new Map();
    for (const e of lista) {
        for (const t of new Set(tokensSignificativos(`${e.nombres} ${e.apellidos}`))) {
            if (!porToken.has(t)) porToken.set(t, []);
            porToken.get(t).push(e);
        }
    }
    return porToken;
}

/**
 * ¿El registro de MisProfesores (nombres + apellidos) es este profesor?
 * Sí si trae su primer apellido y alguno de sus nombres; lo demás del registro
 * (otro apellido, segundo nombre, orden) no importa:
 *   "Lilliana Abarca" ↔ "ABARCA GUERRERO LILLIANA", "Ernesto Carrera" ↔ "CARRERA RETANA LUIS ERNESTO".
 * Devuelve null si no, o { cobertura, completo, extras } donde `extras` son las
 * palabras del registro que no están en el nombre del TEC (para auditar).
 */
export function puntuarCoincidencia(nombreProfesor, nombreCandidato) {
    const { apellidos, nombres } = partirNombre(nombreProfesor);
    const P = new Set(tokensSignificativos(nombreProfesor));
    const C = [...new Set(tokensSignificativos(nombreCandidato))];
    if (C.length < 2) return null;
    if (!C.includes(apellidos[0])) return null;
    if (!C.some((t) => nombres.includes(t))) return null;

    const extras = C.filter((t) => !P.has(t));
    return { cobertura: (C.length - extras.length) / P.size, completo: extras.length === 0 && C.length === P.size, extras };
}

/** Entre los candidatos, elige el de más calificaciones y decide el estado. */
export function elegirMejor(candidatos) {
    if (candidatos.length === 0) return { estado: 'sin_resultado', motivo: 'ningún registro coincide con el nombre' };
    const ordenados = [...candidatos].sort((a, b) =>
        (b.calificaciones ?? -1) - (a.calificaciones ?? -1) || b.cobertura - a.cobertura);
    const [top, segundo] = ordenados;
    const elegido = { url: top.url, calificaciones: top.calificaciones };
    if (top.calificaciones == null) return { ...elegido, estado: 'dudoso', motivo: 'no se pudo leer el número de calificaciones' };
    if (top.calificaciones === 0) return { ...elegido, estado: 'sin_calificaciones', motivo: 'los registros encontrados no tienen calificaciones' };
    if (segundo && segundo.calificaciones === top.calificaciones) {
        return { ...elegido, estado: 'dudoso', motivo: `empate de ${top.calificaciones} calificaciones entre ${top.url} y ${segundo.url}` };
    }
    return { ...elegido, estado: 'ok' };
}

/** Cruza un profesor del TEC con la lista de la escuela. */
export function resolverProfesor(nombre, indice, { maxGuardados = 8 } = {}) {
    const { apellidos } = partirNombre(nombre);
    const candidatos = [];
    for (const e of indice.get(apellidos[0]) ?? []) {
        const nombreRegistro = `${e.nombres} ${e.apellidos}`;
        const m = puntuarCoincidencia(nombre, nombreRegistro);
        if (!m) continue;
        candidatos.push({ url: urlPerfil(e), nombre: nombreRegistro, departamento: e.departamento, calificaciones: e.calificaciones, promedio: e.promedio, cobertura: m.cobertura, extras: m.extras });
    }
    const decision = elegirMejor(candidatos);
    const guardados = [...candidatos]
        .sort((a, b) => (b.calificaciones ?? -1) - (a.calificaciones ?? -1))
        .slice(0, maxGuardados)
        .map(({ cobertura, extras, ...resto }) => ({ ...resto, ...(extras.length ? { extras } : {}) }));
    return { ...decision, totalCandidatos: candidatos.length, candidatos: guardados, fecha: new Date().toISOString() };
}

/** Marca como dudosos los profesores distintos que quedaron con la MISMA URL. */
export function detectarColisiones(resultados) {
    const porUrl = new Map();
    for (const [nombre, r] of Object.entries(resultados)) {
        if (r.estado !== 'ok' || !r.url) continue;
        if (!porUrl.has(r.url)) porUrl.set(r.url, []);
        porUrl.get(r.url).push(nombre);
    }
    const afectados = [];
    for (const nombres of porUrl.values()) {
        if (nombres.length < 2) continue;
        for (const n of nombres) {
            resultados[n] = { ...resultados[n], estado: 'dudoso', motivo: `la misma URL quedó para ${nombres.length} profesores: ${nombres.join(' / ')}` };
            afectados.push(n);
        }
    }
    return afectados;
}

// robots.txt ---------------------------------------------------------------

function patronARegex(patron) {
    const fin = patron.endsWith('$');
    const cuerpo = (fin ? patron.slice(0, -1) : patron).split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    return new RegExp('^' + cuerpo + (fin ? '$' : ''));
}

/** ¿robots.txt permite esta ruta a un bot genérico? (gana la regla más larga; empate → Allow). */
export function permitidoPorRobots(textoRobots, ruta, agente = 'tecplanner') {
    const grupos = [];
    let actual = null;
    let leyendoAgentes = false;
    for (const cruda of String(textoRobots).split(/\r?\n/)) {
        const linea = cruda.replace(/#.*/, '').trim();
        const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(linea);
        if (!m) continue;
        const campo = m[1].toLowerCase();
        const valor = m[2].trim();
        if (campo === 'user-agent') {
            if (!leyendoAgentes) { actual = { agentes: [], reglas: [] }; grupos.push(actual); }
            actual.agentes.push(valor.toLowerCase());
            leyendoAgentes = true;
        } else if ((campo === 'allow' || campo === 'disallow') && actual) {
            leyendoAgentes = false;
            if (valor) actual.reglas.push({ permitir: campo === 'allow', patron: valor });
        } else {
            leyendoAgentes = false;
        }
    }
    const propio = grupos.filter((g) => g.agentes.some((a) => a !== '*' && agente.includes(a)));
    const general = grupos.filter((g) => g.agentes.includes('*'));
    const reglas = (propio.length ? propio : general).flatMap((g) => g.reglas);

    let mejor = null;
    for (const r of reglas) {
        if (!patronARegex(r.patron).test(ruta)) continue;
        if (!mejor || r.patron.length > mejor.patron.length || (r.patron.length === mejor.patron.length && r.permitir)) mejor = r;
    }
    return { permitido: !mejor || mejor.permitir, regla: mejor ? `${mejor.permitir ? 'Allow' : 'Disallow'}: ${mejor.patron}` : null };
}

// ---------------------------------------------------------------------------
// Aplicar a profesores.js sin tocar nada más
// ---------------------------------------------------------------------------

/**
 * Rellena las entradas existentes que están en "" y agrega las nuevas en un bloque
 * propio, justo antes del comentario de ejemplo (o del cierre "};").
 * Nunca pisa una URL que ya existe ni reordena/borra líneas.
 * @param {string} codigo contenido de profesores.js
 * @param {Map<string,string>} urls nombre → URL
 */
export function aplicarAProfesores(codigo, urls, fecha = new Date().toISOString().slice(0, 10)) {
    const lineas = codigo.split('\n');
    const ini = lineas.findIndex((l) => /const\s+PROFESORES_MISPROFES\s*=\s*\{/.test(l));
    const fin = lineas.findIndex((l, i) => i > ini && /^\};/.test(l));
    if (ini < 0 || fin < 0) throw new Error('no se encontró PROFESORES_MISPROFES en profesores.js');

    const reEntrada = /^(\s*)"([^"]*)":\s*"([^"]*)"(,?)\s*$/;
    const existentes = new Map(); // clave → índice de línea
    for (let i = ini + 1; i < fin; i++) {
        const m = reEntrada.exec(lineas[i]);
        if (m && m[2].trim()) existentes.set(claveDe(m[2]), i);
    }

    const cambios = { rellenados: [], nuevos: [], yaTenian: [], invalidos: [] };
    const nuevos = [];
    for (const [nombre, url] of urls) {
        if (!url.startsWith(PREFIJO_URL_VALIDA) || /["\\\s]/.test(url)) { cambios.invalidos.push(nombre); continue; }
        const idx = existentes.get(claveDe(nombre));
        if (idx === undefined) { nuevos.push([nombre, url]); cambios.nuevos.push(nombre); continue; }
        const m = reEntrada.exec(lineas[idx]);
        if (m[3] !== '') { cambios.yaTenian.push(nombre); continue; }
        lineas[idx] = `${m[1]}"${m[2]}": ${JSON.stringify(url)}${m[4] || ','}`;
        cambios.rellenados.push(nombre);
    }

    if (nuevos.length > 0) {
        let pos = lineas.findIndex((l, i) => i > ini && i < fin && /^\s*\/\/\s*"Nombre Exacto/.test(l));
        if (pos < 0) pos = fin;
        const bloque = [
            `    // --- Agregados automáticamente (npm run profesores -- --aplicar, ${fecha}) ---`,
            ...nuevos.map(([n, u]) => `    ${JSON.stringify(n)}: ${JSON.stringify(u)},`),
            '',
        ];
        lineas.splice(pos, 0, ...bloque);
    }
    return { codigo: lineas.join('\n'), cambios };
}

// ---------------------------------------------------------------------------
// Red, almacenamiento y CLI
// ---------------------------------------------------------------------------

export class BloqueoError extends Error {}

/**
 * ¿La respuesta es un bloqueo? Por código HTTP (403/429/503) o porque es una página
 * de desafío (título "Just a moment", "Attention Required"...). Que una página normal
 * mencione "captcha" (un script de reCAPTCHA, por ejemplo) NO cuenta como bloqueo.
 */
export function esRespuestaDeBloqueo(status, texto) {
    if ([403, 429, 503].includes(status)) return true;
    const titulo = /<title[^>]*>\s*([^<]*)/i.exec(String(texto).slice(0, 6000))?.[1] ?? '';
    return /^(just a moment|attention required|un momento|access denied|verificando)/i.test(titulo.trim());
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const pausaAleatoria = () => esperar(MISPROFES.pausaMinMs + Math.random() * (MISPROFES.pausaMaxMs - MISPROFES.pausaMinMs));

export function crearCliente({ pausar = pausaAleatoria, fetchFn = globalThis.fetch, esperaBloqueo = (n) => esperar(30000 * n) } = {}) {
    let primera = true;
    let bloqueosSeguidos = 0;

    async function pedir(url) {
        for (let intento = 1; intento <= 3; intento++) {
            if (!primera) await pausar();
            primera = false;

            const controlador = new AbortController();
            const timer = setTimeout(() => controlador.abort(), MISPROFES.timeoutMs);
            try {
                const res = await fetchFn(url, {
                    headers: { 'User-Agent': MISPROFES.userAgent, 'Accept-Language': 'es', Accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
                    signal: controlador.signal,
                });
                clearTimeout(timer);
                const texto = await res.text();
                if (esRespuestaDeBloqueo(res.status, texto)) {
                    if (++bloqueosSeguidos >= MISPROFES.bloqueosMax) {
                        throw new BloqueoError(`el sitio bloqueó ${bloqueosSeguidos} solicitudes seguidas (HTTP ${res.status}). Se detiene para no empeorarlo; reintenta más tarde.`);
                    }
                    await esperaBloqueo(bloqueosSeguidos);
                    continue;
                }
                bloqueosSeguidos = 0;
                if (res.status >= 500 && intento < 3) continue;
                return { status: res.status, texto };
            } catch (error) {
                clearTimeout(timer);
                if (error instanceof BloqueoError) throw error;
                if (intento === 3) return { status: 599, texto: '' };
            }
        }
        return { status: 599, texto: '' };
    }
    return { pedir };
}

async function leerJSON(ruta, porDefecto) {
    try { return JSON.parse(await readFile(ruta, 'utf-8')); } catch { return porDefecto; }
}
async function escribirAtomico(ruta, contenido) {
    await mkdir(path.dirname(ruta), { recursive: true });
    const tmp = `${ruta}.tmp`;
    await writeFile(tmp, contenido, 'utf-8');
    await rename(tmp, ruta);
}
const cargarAlmacen = async () => {
    const a = await leerJSON(MISPROFES.archivoResultados, null);
    return a?.profesores ? a : { escuela: { id: MISPROFES.escuelaId, url: MISPROFES.escuelaUrl }, actualizado: null, profesores: {} };
};
const guardarAlmacen = (a) => {
    a.actualizado = new Date().toISOString();
    a.escuela = { id: MISPROFES.escuelaId, url: MISPROFES.escuelaUrl };
    return escribirAtomico(MISPROFES.archivoResultados, JSON.stringify(a, null, 2));
};

// Estadísticas estáticas para la web: así el modal de calificaciones funciona sin proxies.
// Formato: { actualizado, p: { "<id>": [promedio, nº calificaciones, departamento] } }
async function guardarEstadisticas(lista) {
    const p = {};
    for (const e of lista) p[e.id] = [e.promedio, e.calificaciones, e.departamento];
    await escribirAtomico('output/profesores_stats.json', JSON.stringify({ actualizado: new Date().toISOString(), p }));
    console.log(`[buscar] estadísticas de ${lista.length} profesores guardadas en output/profesores_stats.json`);
}

const VIGENCIA_COPIA_MS = 6 * 60 * 60 * 1000; // una copia de la página con menos de 6 h se reutiliza sin pedir nada

async function copiaVigente() {
    try { return Date.now() - (await stat(MISPROFES.archivoPagina)).mtimeMs < VIGENCIA_COPIA_MS; } catch { return false; }
}

/**
 * Obtiene el HTML de la página de la escuela con el mínimo de solicitudes:
 *   - con --archivo, lee esa copia (0 solicitudes);
 *   - si ya hay una copia descargada hace menos de 6 h, la reutiliza (0 solicitudes), salvo --descargar;
 *   - si no, descarga: robots.txt + la página (2 solicitudes).
 */
async function obtenerPagina({ archivo, forzar }) {
    if (archivo) {
        console.log(`[buscar] usando la copia local ${archivo} (sin red)`);
        return readFile(archivo, 'utf-8');
    }
    if (!forzar && await copiaVigente()) {
        console.log(`[buscar] reutilizando ${MISPROFES.archivoPagina} (descargada hace menos de 6 h; --descargar la fuerza). Sin solicitudes.`);
        return readFile(MISPROFES.archivoPagina, 'utf-8');
    }
    const cliente = crearCliente();
    const robots = await cliente.pedir(`${MISPROFES.host}/robots.txt`);
    if (robots.status >= 400 && robots.status !== 404) throw new Error(`no se pudo leer robots.txt (HTTP ${robots.status}); no se corre sin poder verificarlo.`);
    if (robots.status < 400) {
        const ruta = new URL(MISPROFES.escuelaUrl).pathname;
        const v = permitidoPorRobots(robots.texto, ruta);
        if (!v.permitido) throw new Error(`robots.txt de MisProfesores prohíbe ${ruta} (${v.regla}). No se descarga.`);
    }
    const r = await cliente.pedir(MISPROFES.escuelaUrl);
    if (r.status !== 200) throw new Error(`la página de la escuela respondió HTTP ${r.status}.`);
    await escribirAtomico(MISPROFES.archivoPagina, r.texto);
    console.log(`[buscar] página descargada (${r.texto.length} bytes), copia en ${MISPROFES.archivoPagina}`);
    return r.texto;
}

async function modoBuscar({ archivo, solo, recalcular, forzar }) {
    const html = await obtenerPagina({ archivo, forzar });
    const lista = extraerListaProfesores(html);
    const declarado = Number(/N[uú]mero de profesores:?\s*(\d+)/i.exec(textoPlano(html))?.[1]) || null;
    if (lista.length === 0) {
        throw new Error('no se encontró la lista de profesores dentro de la página (¿cambió el formato?). Revisa local/escuela.html.');
    }
    console.log(`[buscar] lista de MisProfesores: ${lista.length} profesores${declarado ? ` (la página declara ${declarado})` : ''}`);
    if (declarado && lista.length < declarado * 0.9) console.warn(`[buscar] ATENCIÓN: se leyeron bastantes menos (${lista.length}) de los declarados (${declarado}); el formato pudo cambiar.`);
    await guardarEstadisticas(lista);
    const indice = indexarLista(lista);

    if (solo) {
        const r = resolverProfesor(solo, indice, { maxGuardados: 15 });
        console.log(`\n${solo} → ${r.estado}${r.motivo ? ` (${r.motivo})` : ''}${r.url ? `\n  elegido: ${r.url}  (${r.calificaciones} calif.)` : ''}`);
        console.log(`  candidatos (${r.totalCandidatos}):`);
        for (const c of r.candidatos) console.log(`    ${String(c.calificaciones ?? '?').padStart(4)} calif.  ${c.nombre}  [${c.departamento}]${c.extras ? `  (de más: ${c.extras.join(' ')})` : ''}\n          ${c.url}`);
        return;
    }

    const { profesores } = await leerProfesoresUnicos('data');
    const mapa = evaluarMapaProfesores(await readFile(RUTA_PROFESORES_JS, 'utf-8'));
    const conUrl = new Set(Object.entries(mapa).filter(([n, u]) => n.trim() && u).map(([n]) => claveDe(n)));
    const almacen = await cargarAlmacen();
    const yaResueltos = new Set(Object.entries(almacen.profesores)
        .filter(([, r]) => recalcular ? false : r.estado !== 'sin_resultado') // los "sin_resultado" se recalculan siempre: la lista del sitio crece
        .map(([n]) => claveDe(n)));

    const cola = [...profesores.values()].map((p) => p.nombre).sort((a, b) => a.localeCompare(b))
        .filter((n) => !conUrl.has(claveDe(n)) && !yaResueltos.has(claveDe(n)));
    console.log(`[buscar] ${profesores.size} profesores únicos en los datos; ${conUrl.size ? `${[...profesores.keys()].filter((c) => conUrl.has(c)).length} ya tienen URL en profesores.js; ` : ''}${cola.length} por resolver ahora.`);

    const cuenta = {};
    for (const nombre of cola) {
        const r = resolverProfesor(nombre, indice);
        almacen.profesores[nombre] = r;
        cuenta[r.estado] = (cuenta[r.estado] ?? 0) + 1;
    }
    detectarColisiones(almacen.profesores);
    await guardarAlmacen(almacen);

    console.log('[buscar] resultado de esta corrida:', cuenta);
    console.log(`[buscar] guardado en ${MISPROFES.archivoResultados}. Para pasarlo a profesores.js:  npm run profesores -- --aplicar`);
}

async function modoAplicar({ incluirDudosos }) {
    const almacen = await cargarAlmacen();
    detectarColisiones(almacen.profesores);
    const validos = incluirDudosos ? ['ok', 'dudoso'] : ['ok'];
    const urls = new Map(Object.entries(almacen.profesores).filter(([, r]) => validos.includes(r.estado) && r.url).map(([n, r]) => [n, r.url]));

    const original = await readFile(RUTA_PROFESORES_JS, 'utf-8');
    const { codigo, cambios } = aplicarAProfesores(original, urls);
    evaluarMapaProfesores(codigo); // si el resultado no es JavaScript válido, lanza ANTES de escribir
    if (codigo !== original) await writeFile(RUTA_PROFESORES_JS, codigo, 'utf-8');

    console.log(`[aplicar] profesores.js: ${cambios.rellenados.length} rellenados (estaban en ""), ${cambios.nuevos.length} nuevos, ${cambios.yaTenian.length} ya tenían URL (no se tocaron)${cambios.invalidos.length ? `, ${cambios.invalidos.length} descartados por URL inválida` : ''}.`);

    const aRevisar = Object.entries(almacen.profesores).filter(([, r]) => !validos.includes(r.estado) || !r.url);
    const lineas = aRevisar.map(([n, r]) => {
        const cand = (r.candidatos ?? []).map((c) => `    - ${c.url}  (${c.calificaciones ?? '?'} calif.)  ${c.nombre}  [${c.departamento ?? ''}]`).join('\n');
        return `${n}  [${r.estado}] ${r.motivo ?? ''}${cand ? '\n' + cand : ''}`;
    });
    await mkdir('local', { recursive: true });
    await writeFile('local/profesores_revision.txt', lineas.join('\n') + '\n');
    console.log(`[aplicar] ${aRevisar.length} para revisar a mano → local/profesores_revision.txt`);
    await guardarAlmacen(almacen);
}

async function main() {
    const args = process.argv.slice(2);
    const valor = (nombre) => { const i = args.indexOf(`--${nombre}`); return i !== -1 ? args[i + 1] : null; };
    if (args.includes('--aplicar')) return modoAplicar({ incluirDudosos: args.includes('--incluir-dudosos') });
    return modoBuscar({ archivo: valor('archivo'), solo: valor('solo'), recalcular: args.includes('--recalcular'), forzar: args.includes('--descargar') });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((error) => { console.error('[misprofes] falló:', error.message); process.exitCode = process.exitCode || 1; });
}
