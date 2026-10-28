// revisar-ventana.js
// Corre en un cron diario (ver scrape.yml) y decide, sin tocar red ni
// disco de datos, si hoy corresponde scrapear alguna combinación
// año+período según ventanas.js. No hace scraping — solo emite la
// decisión como output de GitHub Actions para que el job siguiente la
// use en una matrix.
//
// Regla de "hoy toca" (ver debeCorrerHoy en ventanas.js):
//   - sondeo, antes de la matrícula: todos los días, porque el TEC publica
//     la guía antes de la fecha oficial;
//   - desde el inicio de matrícula: cada 7 días y el último día (fin).
//
// Se puede simular una fecha con la variable de entorno FECHA_SIMULADA
// (formato YYYY-MM-DD), útil para probar ventanas.js sin esperar a que
// llegue la fecha real — ver el input "fecha_simulada" en scrape.yml.

import { appendFileSync } from 'node:fs';
import { VENTANAS, debeCorrerHoy } from './ventanas.js';

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
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
