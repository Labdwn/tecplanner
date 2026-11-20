// poda.js
// El scraper trabaja como una FOTO COMPLETA del TEC, no como un acumulado:
// lo que el TEC ya no publica (un curso, un grupo, una escuela entera) tiene
// que desaparecer también de data/ e indice.json. Sin esto los archivos solo
// "crecían" y un curso eliminado del Verano se quedaba para siempre.
//
// Alcance de la poda: SOLO los períodos activos que se le indican (los que
// están dentro de su ventana de matrícula). Semestres pasados, años anteriores
// y cualquier período no listado NO se tocan jamás: quedan como archivo.
//
// Salvaguardas (para que una caída o respuesta rara del TEC nunca borre datos):
//   - un período que hoy no trae NINGÚN archivo no se poda;
//   - si la cantidad de cursos cae por debajo de UMBRAL_CAIDA de lo que había,
//     ese período no se poda (se avisa en el log). Se puede forzar con
//     SCRAPER_FORZAR_PODA=1 cuando la caída es legítima.

import { readdir, rm, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { leerJSONSiExiste } from './utils.js';

export const UMBRAL_CAIDA = 0.5;

async function listarJSON(dir) {
    const salida = [];
    let entradas;
    try {
        entradas = await readdir(dir, { withFileTypes: true });
    } catch {
        return salida;
    }
    for (const e of entradas) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) salida.push(...await listarJSON(p));
        else if (e.name.endsWith('.json')) salida.push(p);
    }
    return salida;
}

const normalizar = (ruta) => ruta.split(path.sep).join('/');

/**
 * @param {Map<string, object>} archivosNuevos ruta → contenido (esta corrida)
 * @param {{dataDir:string, anio:string, periodosActivos:string[], forzar?:boolean}} opts
 * @returns {{eliminar:string[], periodosPodados:string[], omitidos:string[]}}
 */
export async function planificarPoda(archivosNuevos, { dataDir, anio, periodosActivos, forzar = false }) {
    const dirAnio = path.join(dataDir, String(anio));
    const nuevosPorPeriodo = new Map(); // periodo → {rutas:Set, cursos:number}
    for (const [ruta, contenido] of archivosNuevos) {
        const p = String(contenido.periodo);
        if (String(contenido.anio) !== String(anio)) continue;
        if (!nuevosPorPeriodo.has(p)) nuevosPorPeriodo.set(p, { rutas: new Set(), cursos: 0 });
        const e = nuevosPorPeriodo.get(p);
        e.rutas.add(normalizar(ruta));
        e.cursos += contenido.cursos?.length ?? 0;
    }

    const periodos = (periodosActivos ?? []).map(String); // solo lo que se pide; lo demás no se toca nunca

    const eliminar = [];
    const periodosPodados = [];
    const omitidos = [];

    for (const p of periodos) {
        const nuevo = nuevosPorPeriodo.get(p);
        if (!nuevo || nuevo.rutas.size === 0) {
            omitidos.push(`${anio}/${p}: el TEC no devolvió datos, no se poda`);
            continue;
        }
        const previos = await listarJSON(path.join(dirAnio, p));
        let cursosPrevios = 0;
        for (const f of previos) cursosPrevios += (await leerJSONSiExiste(f, null))?.cursos?.length ?? 0;

        if (!forzar && cursosPrevios > 0 && nuevo.cursos < cursosPrevios * UMBRAL_CAIDA) {
            omitidos.push(`${anio}/${p}: cursos ${cursosPrevios} → ${nuevo.cursos} (caída sospechosa), no se poda`);
            continue;
        }
        periodosPodados.push(p);
        for (const f of previos) if (!nuevo.rutas.has(normalizar(f))) eliminar.push(f);
    }
    return { eliminar, periodosPodados, omitidos };
}

/** Borra los archivos y los directorios que queden vacíos. */
export async function aplicarPoda(rutas) {
    for (const f of rutas) {
        await rm(f, { force: true });
        let dir = path.dirname(f);
        for (let i = 0; i < 3; i++) {
            try { await rmdir(dir); } catch { break; } // falla si no está vacío: ahí paramos
            dir = path.dirname(dir);
        }
    }
}

/** Índice final: los períodos podados se reemplazan por el nuevo; el resto se fusiona. */
export function aplicarPodaAlIndice(indiceFusionado, indiceNuevo, anio, periodosPodados) {
    const salida = { ...indiceFusionado };
    if (!periodosPodados.length) return salida;
    salida[anio] = { ...(salida[anio] ?? {}) };
    for (const p of periodosPodados) {
        if (indiceNuevo[anio]?.[p]) salida[anio][p] = indiceNuevo[anio][p];
        else delete salida[anio][p];
    }
    return salida;
}
