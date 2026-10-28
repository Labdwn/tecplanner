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
import { leerJSONSiExiste } from './utils.js';

/**
 * La Fase 1 no trae edificio/aula. Si la Fase 2 no corre (sin cookie, sesión
 * vencida, el cron) o no encuentra un grupo, el archivo se reescribiría sin
 * aula y se perdería lo que ya había. Acá se rescata del archivo que está en
 * disco: solo rellena grupos que quedaron sin aula, nunca pisa uno nuevo.
 * Si algo falla al leer, devuelve los archivos tal cual.
 */
export async function conservarAulasPrevias(archivos) {
    const resultado = new Map();
    let conservadas = 0;

    try {
        for (const [ruta, archivo] of archivos.entries()) {
            const previo = await leerJSONSiExiste(ruta, null);
            const previas = new Map();
            for (const curso of previo?.cursos ?? []) {
                for (const g of curso.grupos ?? []) {
                    if (g.edificio != null && g.aula != null) {
                        previas.set(`${curso.codigo}|${Number(g.grupo)}`, { edificio: g.edificio, aula: g.aula });
                    }
                }
            }
            if (previas.size === 0) {
                resultado.set(ruta, archivo);
                continue;
            }

            const cursos = archivo.cursos.map((curso) => ({
                ...curso,
                grupos: curso.grupos.map((g) => {
                    if (g.edificio != null && g.aula != null) return g;
                    const previa = previas.get(`${curso.codigo}|${Number(g.grupo)}`);
                    if (!previa) return g;
                    conservadas++;
                    return { ...g, ...previa };
                }),
            }));
            resultado.set(ruta, { ...archivo, cursos });
        }
    } catch (error) {
        console.warn(`[fase2] no se pudieron conservar las aulas previas: ${error.message}`);
        return archivos;
    }

    if (conservadas > 0) console.log(`[fase2] ${conservadas} grupos conservaron el aula que ya tenían en disco.`);
    return resultado;
}

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

        return { archivos: await conservarAulasPrevias(archivosEnriquecidos), stats: { totalIntentados, totalEnriquecidos } };
    } catch (error) {
        console.warn(
            `[fase2] se omite el enriquecimiento con aulas: ${error.message}. ` +
            'Fase 1 continúa sin cambios (edificio/aula quedarán null en todo lo nuevo).'
        );
        return { archivos: await conservarAulasPrevias(archivosFase1), stats: null };
    }
}
