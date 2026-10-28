// fase2.js
// Única responsabilidad: orquestar la Fase 2 completa (enriquecimiento con
// aulas) como una unidad aislada. Si cualquier parte falla —sesión,
// red, parsing— esta función atrapa el error y devuelve los archivos de
// Fase 1 sin tocar, para que scraper.js nunca tenga que saber si Fase 2
// funcionó o no.
//
// Fuente actual: guía de horarios de TEC Digital (guia.js). La fuente
// anterior (matricula.js / ConsultaHorarios) queda en el repo sin usarse.

import { obtenerSesionGuia, obtenerGuiaPorArchivo, claveGuia } from './guia.js';
import { enriquecerArchivoConGuia } from './aulas.js';

/**
 * Corre la Fase 2 completa sobre el Map de archivos producido por Fase 1.
 * Devuelve SIEMPRE un Map de archivos válido para escribir a disco:
 *   - si todo sale bien, con edificio/aula rellenados donde se pudo
 *     emparejar,
 *   - si algo falla en cualquier punto (sesión, red, lo que sea), el
 *     Map original de Fase 1 intacto, sin lanzar.
 *
 * @param {Map<string, object>} archivosFase1
 */
export async function ejecutarFase2(archivosFase1) {
    try {
        const sesion = obtenerSesionGuia();
        console.log(`[fase2] consultando la guía de TEC Digital para ${archivosFase1.size} archivos...`);

        const guiaPorArchivo = await obtenerGuiaPorArchivo(archivosFase1, sesion);

        const archivosEnriquecidos = new Map();
        let totalIntentados = 0;
        let totalEnriquecidos = 0;

        for (const [ruta, archivo] of archivosFase1.entries()) {
            const filas = guiaPorArchivo.get(claveGuia(archivo)) ?? null;
            const { archivo: enriquecido, stats } = enriquecerArchivoConGuia(archivo, filas);
            archivosEnriquecidos.set(ruta, enriquecido);
            totalIntentados += stats.intentados;
            totalEnriquecidos += stats.enriquecidos;
        }

        console.log(
            `[fase2] listo: ${totalEnriquecidos}/${totalIntentados} grupos con aula asignada ` +
            `(${totalIntentados - totalEnriquecidos} quedaron en null por falta de coincidencia).`
        );

        return { archivos: archivosEnriquecidos, stats: { totalIntentados, totalEnriquecidos } };
    } catch (error) {
        console.warn(
            `[fase2] se omite el enriquecimiento con aulas: ${error.message}. ` +
            'Fase 1 continúa sin cambios (edificio/aula quedarán null en todo lo nuevo).'
        );
        return { archivos: archivosFase1, stats: null };
    }
}
