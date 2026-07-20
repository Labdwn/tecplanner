// history.js
// Única responsabilidad: mantener el historial de apertura de cursos.
// No conoce el endpoint del TEC, ni sedes, grupos, horarios o profesores.
// Recibe cursos ya procesados (codigo, nombre, creditos) y devuelve un
// historial actualizado. Es una función pura: no lee ni escribe archivos,
// no muta sus argumentos.

function formatearPeriodo(anio, periodo) {
    return `${anio}-${periodo}`;
}

/**
 * Devuelve una entrada de historial actualizada para un curso puntual.
 * Si el período ya estaba registrado, el arreglo `historial` se conserva
 * tal cual (mismo contenido, sin duplicar).
 */
function registrarApertura(entradaExistente, curso, etiquetaPeriodo) {
    const historialPrevio = entradaExistente?.historial ?? [];
    const yaRegistrado = historialPrevio.includes(etiquetaPeriodo);

    return {
        nombre: curso.nombre,
        creditos: curso.creditos,
        historial: yaRegistrado ? historialPrevio : [...historialPrevio, etiquetaPeriodo],
    };
}

/**
 * Actualiza el historial de apertura de cursos a partir de una lista de
 * cursos ya procesados para un año/período dado. Función pura: recibe el
 * historial actual y devuelve uno nuevo, sin efectos secundarios ni I/O.
 *
 * Nota: si el mismo curso aparece más de una vez en `cursos` (por ejemplo
 * porque se ofrece en varias sedes), el período se registra una sola vez;
 * llamar esta función repetidas veces con el mismo año/período tampoco
 * duplica entradas.
 *
 * @param {object} historialExistente - contenido actual de history.json
 * @param {Array<{codigo: string, nombre: string, creditos: number}>} cursos
 * @param {number|string} anio
 * @param {number|string} periodo
 * @returns {object} un historial nuevo, con las entradas actualizadas
 */
export function actualizarHistorial(historialExistente, cursos, anio, periodo) {
    const etiquetaPeriodo = formatearPeriodo(anio, periodo);
    const historialActualizado = { ...historialExistente };

    for (const curso of cursos) {
        historialActualizado[curso.codigo] = registrarApertura(
            historialActualizado[curso.codigo],
            curso,
            etiquetaPeriodo
        );
    }

    return historialActualizado;
}
