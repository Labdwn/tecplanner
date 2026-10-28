// ventanas.js
// Decide cuándo se scrapea cada período. Ya no se editan fechas a mano:
// las ventanas se derivan de output/calendario.json, que genera calendario.js
// a partir del calendario oficial del TEC y se actualiza solo (ver calendario.yml).
//
// Cada ventana tiene tres fechas:
//   - sondeoDesde: 14 días antes de la primera publicación del ciclo (guía de
//     horarios, cursos posibles o citas). El TEC publica ANTES de la fecha
//     oficial (el Verano 2026-2027 salió el 25-10 con fecha oficial 02-11),
//     así que desde acá se scrapea a diario y lo que manda es que existan
//     datos, no la fecha. El scraper ya no escribe nada si no hay datos o no
//     hubo cambios, por lo que sondear no genera commits vacíos.
//   - inicio: primer día de matrícula ordinaria de regulares (si el calendario
//     todavía no la trae, la primera publicación).
//   - fin: último día de apelaciones e inclusiones (si no está, la última
//     fecha conocida del período).
// Entre sondeoDesde e inicio corre a diario; de inicio a fin, semanal más el
// último día (ver debeCorrerHoy).
//
// anio/periodo se pasan tal cual a SCRAPER_ANIO / SCRAPER_PERIODO (config.js).

import { readFileSync } from 'node:fs';

export const DIAS_SONDEO = 14;

// Se usa SOLO si calendario.json no existe o está vacío (primera instalación).
const RESPALDO = [
    { nombre: 'I Semestre 2026', anio: '2026', periodo: '1', sondeoDesde: '2026-01-15', inicio: '2026-01-29', fin: '2026-02-27' },
    { nombre: 'II Semestre 2026', anio: '2026', periodo: '2', sondeoDesde: '2026-06-08', inicio: '2026-07-21', fin: '2026-08-14' },
    { nombre: 'Verano 2026-2027', anio: '2026', periodo: '1V', sondeoDesde: '2026-10-19', inicio: '2026-12-14', fin: '2026-12-17' },
];

// Correcciones manuales de emergencia: misma forma que arriba; reemplazan a
// la ventana derivada del mismo anio+periodo. Normalmente va vacío.
const MANUALES = [];

export function sumarDias(iso, dias) {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
}

function diffDias(fechaA, fechaB) {
    return Math.round((new Date(`${fechaB}T00:00:00Z`) - new Date(`${fechaA}T00:00:00Z`)) / 86_400_000);
}

const minimo = (fechas) => fechas.reduce((a, b) => (b < a ? b : a));
const maximo = (fechas) => fechas.reduce((a, b) => (b > a ? b : a));

/** Ventanas de scraping a partir de la lista de eventos de calendario.json. */
export function construirVentanas(eventos) {
    const porPeriodo = new Map();
    for (const e of eventos) {
        const clave = `${e.anio}|${e.periodo}`;
        if (!porPeriodo.has(clave)) porPeriodo.set(clave, []);
        porPeriodo.get(clave).push(e);
    }

    const ventanas = [];
    for (const lista of porPeriodo.values()) {
        const de = (...tipos) => lista.filter((e) => tipos.includes(e.tipo));

        const publicaciones = de('guia_horarios', 'cursos_posibles', 'citas_preliminar');
        const matriculas = de('matricula_ordinaria', 'matricula_extraordinaria');
        const referencia = publicaciones.length ? publicaciones : matriculas;
        if (referencia.length === 0) continue; // sin ancla no se puede armar una ventana

        const ancla = minimo(referencia.map((e) => e.inicio));
        const inicio = de('matricula_ordinaria')[0]?.inicio ?? ancla;
        const apelaciones = de('apelaciones_inclusiones')[0];
        const fin = apelaciones?.fin ?? maximo(lista.flatMap((e) => [e.inicio, e.fin]));

        ventanas.push({
            nombre: lista[0].etiquetaPeriodo,
            anio: lista[0].anio,
            periodo: lista[0].periodo,
            sondeoDesde: sumarDias(ancla, -DIAS_SONDEO),
            inicio,
            fin: fin < inicio ? inicio : fin,
        });
    }
    return ventanas;
}

/**
 * ¿Hoy toca scrapear esta ventana?
 *   - antes de `inicio` (sondeo): todos los días, porque el TEC puede publicar
 *     antes de la fecha oficial;
 *   - desde `inicio`: cada 7 días contados desde `inicio`, y el último día.
 */
export function debeCorrerHoy(ventana, hoy) {
    const desde = ventana.sondeoDesde ?? ventana.inicio;
    if (hoy < desde || hoy > ventana.fin) return false;
    if (hoy < ventana.inicio) return true;
    if (hoy === ventana.fin) return true;
    return diffDias(ventana.inicio, hoy) % 7 === 0;
}

function leerEventos() {
    try {
        const ruta = new URL('./output/calendario.json', import.meta.url);
        return JSON.parse(readFileSync(ruta, 'utf-8')).eventos ?? [];
    } catch {
        return [];
    }
}

function combinar(derivadas, manuales) {
    const clave = (v) => `${v.anio}|${v.periodo}`;
    const mapa = new Map(derivadas.map((v) => [clave(v), v]));
    for (const v of manuales) mapa.set(clave(v), v);
    return [...mapa.values()];
}

const derivadas = construirVentanas(leerEventos());
export const VENTANAS = combinar(derivadas.length > 0 ? derivadas : RESPALDO, MANUALES);
