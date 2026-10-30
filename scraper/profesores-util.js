// profesores-util.js
// Utilidades compartidas por pendientes-profesores.js y buscar-misprofesores.js:
// normalización de nombres, lectura de los profesores únicos desde data/ y
// lectura del mapa actual de profesores.js.

import { readdir, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const PLACEHOLDERS = new Set(['por asignar', 'sin asignar', 'pendiente', 'no asignado', 'sin profesor', 'por definir', 'tba', 'n/a', 'na', '-']);
// Partículas que no cuentan al comparar nombres ("de la", "del", "van der"...).
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'van', 'der', 'von']);

export const sinTildes = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
export const limpiar = (s) => sinTildes(s).toLowerCase().replace(/[.,;()]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Tokens del nombre, sin tildes y en el orden original. */
export const tokens = (nombre) => limpiar(nombre).split(' ').filter(Boolean);
/** Igual, sin partículas. */
export const tokensSignificativos = (nombre) => tokens(nombre).filter((t) => !PARTICULAS.has(t));
/** Clave de unicidad: mismos tokens en cualquier orden = misma persona. */
export const claveDe = (nombre) => tokens(nombre).sort().join(' ');

/** "ACUÑA PRADO LUIS" → { apellidos: ['acuna','prado'], nombres: ['luis'] } (convención: 2 apellidos primero). */
export function partirNombre(nombre) {
    const t = tokensSignificativos(nombre);
    const nAp = t.length >= 3 ? 2 : Math.min(1, t.length);
    return { apellidos: t.slice(0, nAp), nombres: t.slice(nAp) };
}

export function esNombreReal(nombre) {
    const n = String(nombre ?? '').trim();
    return !!n && !PLACEHOLDERS.has(limpiar(n)) && !/^\(.*\)$/.test(n); // notas tipo "(SE IMPARTE EN IDIOMA INGLES)"
}

async function archivosJSON(dir) {
    const salida = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const ruta = path.join(dir, e.name);
        if (e.isDirectory()) salida.push(...await archivosJSON(ruta));
        else if (e.name.endsWith('.json')) salida.push(ruta);
    }
    return salida;
}

/** Map clave → { nombre, cursos:Set, sedes:Set, periodos:Set } con todos los profesores reales de data/. */
export async function leerProfesoresUnicos(raiz = 'data', anio = null) {
    const anios = anio ? [anio] : (await readdir(raiz)).filter((a) => /^\d{4}$/.test(a));
    const profesores = new Map();
    let grupos = 0;
    for (const a of anios) {
        for (const ruta of await archivosJSON(path.join(raiz, a))) {
            const archivo = JSON.parse(await readFile(ruta, 'utf-8'));
            for (const curso of archivo.cursos ?? []) {
                for (const g of curso.grupos ?? []) {
                    if (!esNombreReal(g.profesor)) continue;
                    grupos++;
                    const nombre = g.profesor.trim();
                    const clave = claveDe(nombre);
                    if (!profesores.has(clave)) profesores.set(clave, { nombre, cursos: new Set(), sedes: new Set(), periodos: new Set() });
                    const p = profesores.get(clave);
                    p.cursos.add(curso.codigo);
                    p.sedes.add(archivo.codigoSede);
                    p.periodos.add(`${archivo.anio}-${archivo.periodo}`);
                }
            }
        }
    }
    return { profesores, grupos };
}

/** Ejecuta profesores.js en un sandbox y devuelve PROFESORES_MISPROFES (nombre → url). */
export function evaluarMapaProfesores(codigo) {
    const sandbox = {};
    vm.runInNewContext(codigo + ';globalThis.__P = PROFESORES_MISPROFES;', sandbox);
    return sandbox.__P ?? {};
}

export async function leerMapaProfesores(ruta = new URL('../profesores.js', import.meta.url)) {
    return evaluarMapaProfesores(await readFile(ruta, 'utf-8'));
}
