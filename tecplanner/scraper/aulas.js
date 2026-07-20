// aulas.js
// Única responsabilidad: matching puro entre los grupos ya parseados por
// Fase 1 (formato interno de TEC Planner) y la respuesta cruda de
// ConsultaHorarios (Fase 2). No hace fetch, no conoce sesiones, no escribe
// archivos. Funciones puras: mismos argumentos → mismo resultado, sin
// efectos secundarios ni mutación de lo que recibe.
//
// Criterio de matching (deliberadamente simple): la Fase 1 ya es la fuente
// oficial de horarios/sede/período. ConsultaHorarios es solo una fuente
// auxiliar para edificio+aula. Como respuestasPorMateria ya viene indexado
// por IdMateria (ver matricula.js), acá solo hace falta emparejar por
// IdGrupo. Si hay varios candidatos (ej. registros de distintos años o
// períodos mezclados en la misma respuesta), se toma el más reciente:
// mayor IdAño primero, y dentro del mismo año, mayor IdPeriodo.

/**
 * Elige, entre varios candidatos con el mismo IdGrupo, el más reciente
 * según año y período.
 */
function elegirMasReciente(candidatos) {
    return candidatos.reduce((mejor, actual) => {
        if (!mejor) return actual;
        if (actual.IdAño !== mejor.IdAño) {
            return actual.IdAño > mejor.IdAño ? actual : mejor;
        }
        return actual.IdPeriodo > mejor.IdPeriodo ? actual : mejor;
    }, null);
}

/**
 * Intenta emparejar un grupo puntual (ya parseado en Fase 1) con su
 * entrada correspondiente en la respuesta cruda de ConsultaHorarios para
 * esa materia. Devuelve { edificio, aula } o null.
 *
 * @param {object} params
 * @param {object} params.grupo - grupo ya parseado { grupo, profesor, modalidad, horario }
 * @param {Array|null} params.respuestaMateria - respuesta cruda (arreglo Horario) de ConsultaHorarios para esa materia (o null/[] si falló/no hubo sesión)
 */
export function emparejarGrupo({ grupo, respuestaMateria }) {
    if (!Array.isArray(respuestaMateria) || respuestaMateria.length === 0) return null;

    const candidatos = respuestaMateria.filter(
        (g) => String(g.IdGrupo) === String(grupo.grupo)
    );

    if (candidatos.length === 0) return null;

    const elegido = elegirMasReciente(candidatos);

    const edificio = elegido.Itinerario?.[0]?.Edificio;
    const aula = elegido.Itinerario?.[0]?.Aula;

    if (edificio == null || aula == null) return null;

    return { edificio, aula: String(aula) };
}

/**
 * Enriquece un archivo completo (una combinación sede+período+escuela, tal
 * como lo produce parser.js) con edificio/aula por grupo. No muta el
 * archivo original — devuelve uno nuevo.
 *
 * @param {object} archivo - un elemento de agregador.obtenerArchivos()
 * @param {Map<string, Array|null>} respuestasPorMateria - Map de matricula.obtenerHorariosPorMateria()
 * @returns {{ archivo: object, stats: { intentados: number, enriquecidos: number } }}
 */
export function enriquecerArchivoConAulas(archivo, respuestasPorMateria) {
    let intentados = 0;
    let enriquecidos = 0;

    const cursos = archivo.cursos.map((curso) => {
        const respuestaMateria = respuestasPorMateria.get(curso.codigo) ?? null;

        const grupos = curso.grupos.map((grupo) => {
            intentados++;
            const resultado = emparejarGrupo({ grupo, respuestaMateria });
            if (resultado) enriquecidos++;

            return {
                ...grupo,
                edificio: resultado?.edificio ?? null,
                aula: resultado?.aula ?? null,
            };
        });

        return { ...curso, grupos };
    });

    return {
        archivo: { ...archivo, cursos },
        stats: { intentados, enriquecidos },
    };
}