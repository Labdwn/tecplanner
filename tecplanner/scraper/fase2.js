// fase2.js
// Única responsabilidad: orquestar la Fase 2 completa (enriquecimiento con
// aulas) como una unidad aislada. Si cualquier parte falla —sesión,
// red, parsing— esta función atrapa el error y devuelve los archivos de
// Fase 1 sin tocar, para que scraper.js nunca tenga que saber si Fase 2
// funcionó o no.

import { obtenerSesion, obtenerHorariosPorMateria } from './matricula.js';
import { enriquecerArchivoConAulas } from './aulas.js';

/**
 * Extrae los códigos de materia únicos presentes en el conjunto de
 * archivos ya generados por Fase 1.
 */
function extraerMateriasUnicas(archivos) {
    const codigos = new Set();
    for (const contenido of archivos.values()) {
        contenido.cursos.forEach((curso) => codigos.add(curso.codigo));
    }
    return [...codigos];
}

/**
 * Corre la Fase 2 completa sobre el Map de archivos producido por Fase 1.
 * Devuelve SIEMPRE un Map de archivos válido para escribir a disco:
 *   - si todo sale bien, con edificio/aula rellenados donde se pudo
 *     emparejar con confianza,
 *   - si algo falla en cualquier punto (sesión, red, lo que sea), el
 *     Map original de Fase 1 intacto, sin lanzar.
 *
 * También devuelve estadísticas para loguear, o null si Fase 2 no corrió.
 *
 * @param {Map<string, object>} archivosFase1
 */
export async function ejecutarFase2(archivosFase1) {
    try {
        const sesion = await obtenerSesion();

        const materias = extraerMateriasUnicas(archivosFase1);
        console.log(`[fase2] consultando aulas para ${materias.length} materias únicas...`);

        const respuestasPorMateria = await obtenerHorariosPorMateria(materias, sesion);

        const archivosEnriquecidos = new Map();
        let totalIntentados = 0;
        let totalEnriquecidos = 0;

        for (const [ruta, archivo] of archivosFase1.entries()) {
            const { archivo: archivoEnriquecido, stats } = enriquecerArchivoConAulas(archivo, respuestasPorMateria);
            archivosEnriquecidos.set(ruta, archivoEnriquecido);
            totalIntentados += stats.intentados;
            totalEnriquecidos += stats.enriquecidos;
        }

        console.log(
            `[fase2] listo: ${totalEnriquecidos}/${totalIntentados} grupos con aula asignada ` +
            `(${totalIntentados - totalEnriquecidos} quedaron en null por falta de coincidencia confiable).`
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