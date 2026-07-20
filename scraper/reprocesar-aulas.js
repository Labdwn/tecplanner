// reprocesar-aulas.js
// Corré esto desde la carpeta scraper/ de tu repo (junto a data/):
//   node --env-file=.env --use-system-ca reprocesar-aulas.js
//
// Vuelve a correr ÚNICAMENTE la Fase 2 (enriquecimiento con aulas) sobre
// los archivos que ya generó una corrida previa de Fase 1, sin volver a
// golpear el endpoint público de escuelas (getdatosEscuelaAno). Útil para
// probar cambios en matricula.js/aulas.js sin repetir todo el scraping.
//
// Solo reescribe los archivos cuyo contenido cambió (mismo criterio que
// scraper.js), así que si tu fix no cambia nada, no se toca ningún archivo.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { RUTAS } from './config.js';
import { obtenerSesion, obtenerHorariosPorMateria } from './matricula.js';
import { enriquecerArchivoConAulas } from './aulas.js';
import { escribirJSONSiCambio } from './utils.js';

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

function extraerMateriasUnicas(archivosConContenido) {
    const codigos = new Set();
    for (const { contenido } of archivosConContenido) {
        contenido.cursos.forEach((curso) => codigos.add(curso.codigo));
    }
    return [...codigos];
}

// Filtro fijo para esta corrida: solo 2026, período 2. Ajustar acá si
// después querés reprocesar otro año/período.
const ANIO_FILTRO = '2026';
const PERIODO_FILTRO = '2';

async function main() {
    const rutasArchivos = await recorrerArchivosJSON(RUTAS.data);
    console.log(`[reprocesar-aulas] ${rutasArchivos.length} archivos encontrados en ${RUTAS.data}/`);

    const todosLosArchivos = await Promise.all(
        rutasArchivos.map(async (ruta) => ({
            ruta,
            contenido: JSON.parse(await readFile(ruta, 'utf-8')),
        }))
    );

    const archivosConContenido = todosLosArchivos.filter(
        ({ contenido }) =>
            String(contenido.anio) === ANIO_FILTRO && String(contenido.periodo) === PERIODO_FILTRO
    );

    console.log(
        `[reprocesar-aulas] ${archivosConContenido.length}/${todosLosArchivos.length} archivos ` +
        `corresponden a ${ANIO_FILTRO}/${PERIODO_FILTRO} (el resto se ignora en esta corrida).`
    );

    if (archivosConContenido.length === 0) {
        console.log('[reprocesar-aulas] nada que procesar, saliendo.');
        return;
    }

    const sesion = await obtenerSesion();
    const materias = extraerMateriasUnicas(archivosConContenido);
    console.log(`[reprocesar-aulas] consultando aulas para ${materias.length} materias únicas...`);

    const respuestasPorMateria = await obtenerHorariosPorMateria(materias, sesion);

    let totalIntentados = 0;
    let totalEnriquecidos = 0;
    let archivosModificados = 0;

    for (const { ruta, contenido } of archivosConContenido) {
        const { archivo, stats } = enriquecerArchivoConAulas(contenido, respuestasPorMateria);
        totalIntentados += stats.intentados;
        totalEnriquecidos += stats.enriquecidos;

        const escribio = await escribirJSONSiCambio(ruta, archivo);
        if (escribio) archivosModificados++;
    }

    console.log(
        `\n[reprocesar-aulas] listo: ${totalEnriquecidos}/${totalIntentados} grupos con aula asignada ` +
        `(${totalIntentados - totalEnriquecidos} quedaron en null).`
    );
    console.log(`[reprocesar-aulas] ${archivosModificados}/${archivosConContenido.length} archivos reescritos.`);
}

main().catch((error) => {
    console.error('[reprocesar-aulas] falló:', error.message);
    process.exitCode = 1;
});