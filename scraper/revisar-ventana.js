// revisar-ventana.js
// Corre en un cron diario (ver scrape.yml) y decide, sin tocar red ni
// disco de datos, si hoy corresponde scrapear alguna combinación
// año+período según ventanas.js. No hace scraping — solo emite la
// decisión como output de GitHub Actions para que el job siguiente la
// use en una matrix.
//
// Regla de "hoy toca" (ver debeCorrerHoy en ventanas.js): todos los días,
// desde el sondeo previo hasta 30 días después del fin de la ventana.
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

    // El TEC se consulta por AÑO (una petición por escuela, sea cual sea el
    // período), así que se hace UNA sola corrida por año aunque haya varias
    // ventanas activas: los períodos activos viajan en `podar`.
    const porAnio = new Map();
    for (const v of activas) {
        const anio = String(v.anio);
        if (!porAnio.has(anio)) porAnio.set(anio, new Set());
        if (v.periodo != null) porAnio.get(anio).add(String(v.periodo));
    }
    // Red de seguridad: los lunes se revisa también el año en curso, sin podar
    // nada (solo recoge datos nuevos).
    const anioHoy = hoy.slice(0, 4);
    if (new Date(`${hoy}T00:00:00Z`).getUTCDay() === 1 && !porAnio.has(anioHoy)) {
        porAnio.set(anioHoy, new Set());
        console.log(`[revisar-ventana] ${hoy}: lunes, revisión semanal de ${anioHoy} (sin poda).`);
    }

    const salida = [...porAnio].map(([anio, periodos]) => ({
        anio,
        periodo: '', // sin filtro: una consulta por año
        podar: [...periodos].join(','),
    }));

    const lineaSalida = `ventanas=${JSON.stringify(salida)}`;
    console.log(`[revisar-ventana] output: ${lineaSalida}`);

    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${lineaSalida}\n`);
    }
}

main();
