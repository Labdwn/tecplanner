// revisar-ventana.js
// Corre en un cron diario (ver scrape.yml) y decide, sin tocar red ni
// disco de datos, si hoy corresponde scrapear alguna combinación
// año+período según ventanas.js. No hace scraping — solo emite la
// decisión como output de GitHub Actions para que el job siguiente la
// use en una matrix.
//
// Regla de "hoy toca": dentro de la ventana [inicio, fin], y además
//   - es el primer día (inicio), o
//   - pasó una semana exacta desde el inicio (cadencia semanal), o
//   - es el último día (fin) — para asegurar una captura final aunque
//     no calce con el ciclo semanal.
//
// Se puede simular una fecha con la variable de entorno FECHA_SIMULADA
// (formato YYYY-MM-DD), útil para probar ventanas.js sin esperar a que
// llegue la fecha real — ver el input "fecha_simulada" en scrape.yml.

import { appendFileSync } from 'node:fs';
import { VENTANAS } from './ventanas.js';

function diffDias(fechaA, fechaB) {
    const a = new Date(`${fechaA}T00:00:00Z`);
    const b = new Date(`${fechaB}T00:00:00Z`);
    return Math.round((b - a) / 86_400_000);
}

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

function debeCorrerHoy(ventana, hoy) {
    if (hoy < ventana.inicio || hoy > ventana.fin) return false;
    if (hoy === ventana.fin) return true;
    const dias = diffDias(ventana.inicio, hoy);
    return dias % 7 === 0;
}

function main() {
    const hoy = process.env.FECHA_SIMULADA || hoyISO();

    const activas = VENTANAS.filter((v) => debeCorrerHoy(v, hoy));

    if (activas.length === 0) {
        console.log(`[revisar-ventana] ${hoy}: ninguna ventana activa, no se scrapea hoy.`);
    } else {
        for (const v of activas) {
            console.log(`[revisar-ventana] ${hoy}: activa "${v.nombre}" (anio=${v.anio}, periodo=${v.periodo ?? '(todos)'})`);
        }
    }

    const salida = activas.map((v) => ({
        anio: v.anio,
        // GitHub Actions matrix no maneja bien `null`; se usa '' y
        // config.js ya trata '' como "sin filtro" (`'' || null` → null).
        periodo: v.periodo ?? '',
    }));

    const lineaSalida = `ventanas=${JSON.stringify(salida)}`;
    console.log(`[revisar-ventana] output: ${lineaSalida}`);

    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${lineaSalida}\n`);
    }
}

main();
