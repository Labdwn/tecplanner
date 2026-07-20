// buscar-curso.js
// Uso: node buscar-curso.js MA1103
// Corré esto desde la carpeta scraper/ de tu repo (junto a data/).
//
// Busca un código de curso en todos los archivos ya scrapeados, sin
// necesidad de saber a qué escuela pertenece. Útil para pruebas manuales
// contra la guía pública (que sí exige escuela) o simplemente para ubicar
// rápido en qué archivo/sede/período vive un curso.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const RUTA_DATA = 'data';

async function recorrerArchivosJSON(dir) {
    const archivos = [];
    const entradas = await readdir(dir, { withFileTypes: true });
    for (const entrada of entradas) {
        const rutaCompleta = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            archivos.push(...await recorrerArchivosJSON(rutaCompleta));
        } else if (entrada.name.endsWith('.json')) {
            archivos.push(rutaCompleta);
        }
    }
    return archivos;
}

async function main() {
    const codigoBuscado = process.argv[2];
    if (!codigoBuscado) {
        console.error('Uso: node buscar-curso.js CODIGO   (ej. node buscar-curso.js MA1103)');
        process.exit(1);
    }

    const codigoNormalizado = codigoBuscado.trim().toUpperCase();
    const archivos = await recorrerArchivosJSON(RUTA_DATA);

    let encontrados = 0;

    for (const rutaArchivo of archivos) {
        const contenido = JSON.parse(await readFile(rutaArchivo, 'utf-8'));
        const curso = contenido.cursos.find((c) => c.codigo.toUpperCase() === codigoNormalizado);

        if (curso) {
            encontrados++;
            console.log(`\n✅ Encontrado en: ${rutaArchivo}`);
            console.log(`   Escuela: ${contenido.codigoEscuela} - ${contenido.nombreEscuela}`);
            console.log(`   Sede: ${contenido.nombreSede} (${contenido.codigoSede})`);
            console.log(`   Período: ${contenido.anio}/${contenido.periodo}`);
            console.log(`   Nombre: ${curso.nombre} (${curso.creditos} créditos, ${curso.grupos.length} grupo(s))`);
        }
    }

    if (encontrados === 0) {
        console.log(`❌ "${codigoBuscado}" no se encontró en ningún archivo de data/.`);
    } else {
        console.log(`\nTotal: encontrado en ${encontrados} combinación(es) sede/período.`);
    }
}

main().catch((error) => {
    console.error('Error:', error.message);
    console.error('¿Corriste esto desde la carpeta que contiene data/?');
});
