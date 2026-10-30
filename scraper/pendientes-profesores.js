// pendientes-profesores.js
// Script puntual (no corre en el cron). Paso 1 del llenado de profesores.js:
// arma la lista de profesores ÚNICOS que aparecen en los datos del scraper
// (todos los períodos y sedes de grado que ya tenemos en data/) y la compara
// con PROFESORES_MISPROFES para saber cuáles todavía no tienen URL.
// Solo lee; no toca data/ ni profesores.js. Escribe en local/ (ignorado por git).
//
// Unicidad: dos nombres son la misma persona si tienen los mismos tokens sin
// tildes ni mayúsculas, en cualquier orden (la misma regla que usa
// buscarUrlProfesor en profesores.js).
//
// Uso (desde scraper/):
//   node pendientes-profesores.js
//   node pendientes-profesores.js --anio 2026

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const i = process.argv.indexOf('--anio');
const ANIO = i !== -1 ? process.argv[i + 1] : null; // null = todos los años
const PLACEHOLDERS = new Set(['por asignar', 'sin asignar', 'pendiente', 'no asignado', 'sin profesor', 'por definir', 'tba', 'n/a', 'na', '-']);

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const limpiar = (s) => sinTildes(String(s)).toLowerCase().replace(/[.,;]+/g, ' ').replace(/\s+/g, ' ').trim();
const claveDe = (nombre) => limpiar(nombre).split(' ').filter(Boolean).sort().join(' ');

async function archivosJSON(dir) {
    const salida = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const ruta = path.join(dir, e.name);
        if (e.isDirectory()) salida.push(...await archivosJSON(ruta));
        else if (e.name.endsWith('.json')) salida.push(ruta);
    }
    return salida;
}

async function cargarMapaActual() {
    const codigo = await readFile(new URL('../profesores.js', import.meta.url), 'utf-8');
    const sandbox = {};
    vm.runInNewContext(codigo + ';globalThis.__P = PROFESORES_MISPROFES;', sandbox);
    return sandbox.__P ?? {};
}

async function main() {
    const raiz = path.join('data');
    const anios = ANIO ? [ANIO] : (await readdir(raiz)).filter((a) => /^\d{4}$/.test(a));

    const profesores = new Map(); // clave → { nombre, cursos:Set, sedes:Set, periodos:Set }
    let grupos = 0;
    for (const anio of anios) {
        for (const ruta of await archivosJSON(path.join(raiz, anio))) {
            const archivo = JSON.parse(await readFile(ruta, 'utf-8'));
            for (const curso of archivo.cursos ?? []) {
                for (const g of curso.grupos ?? []) {
                    const nombre = (g.profesor ?? '').trim();
                    if (!nombre || PLACEHOLDERS.has(limpiar(nombre)) || /^\(.*\)$/.test(nombre)) continue; // notas tipo "(SE IMPARTE EN IDIOMA INGLES)"
                    grupos++;
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

    const mapa = await cargarMapaActual();
    const conUrl = new Set();
    const vacios = new Set();
    for (const [nombre, url] of Object.entries(mapa)) {
        if (!nombre.trim()) continue;
        (url ? conUrl : vacios).add(claveDe(nombre));
    }

    const todos = [...profesores.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));
    const pendientes = todos.filter(([clave]) => !conUrl.has(clave));
    const obsoletos = [...conUrl].filter((c) => !profesores.has(c));

    await mkdir('local', { recursive: true });
    const fila = ([, p]) => ({ nombre: p.nombre, cursos: [...p.cursos].sort(), sedes: [...p.sedes].sort(), periodos: [...p.periodos].sort() });
    await writeFile('local/profesores_pendientes.json', JSON.stringify(pendientes.map(fila), null, 2));
    await writeFile('local/profesores_pendientes.txt', pendientes.map(([, p]) => p.nombre).join('\n') + '\n');

    console.log(`[pendientes] ${grupos} grupos con profesor real → ${profesores.size} profesores únicos`);
    console.log(`[pendientes] con URL en profesores.js: ${todos.length - pendientes.length}`);
    console.log(`[pendientes] sin URL (faltan o están en ""): ${pendientes.length}  (${[...vacios].filter((c) => profesores.has(c)).length} ya listados con "")`);
    if (obsoletos.length) console.log(`[pendientes] ${obsoletos.length} nombres de profesores.js que ya no aparecen en los datos (no se tocan).`);
    console.log('[pendientes] escrito: local/profesores_pendientes.json y .txt');
}

main().catch((e) => { console.error('[pendientes] falló:', e); process.exitCode = 1; });
