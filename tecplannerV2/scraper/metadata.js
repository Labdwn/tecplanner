// metadata.js
// Única responsabilidad: construir el objeto metadata.json. Función pura
// (la fecha es inyectable) para que sea fácil de probar sin depender del
// reloj del sistema ni de correr el scraper completo.

/**
 * @param {object} datos
 * @param {number|string} datos.anio
 * @param {Iterable<number|string>} datos.periodos - períodos detectados en la corrida
 * @param {number} datos.totalEscuelas
 * @param {number} datos.totalCursos - cursos únicos (por código) en toda la corrida
 * @param {number} datos.totalArchivos
 * @param {Date} [datos.fecha] - inyectable para pruebas; por defecto "ahora"
 */
export function construirMetadata({ anio, periodos, totalEscuelas, totalCursos, totalArchivos, fecha = new Date() }) {
    return {
        anio: Number(anio),
        // Sort numérico simple (a-b) rompe con valores mixtos como "1V"
        // (Verano dentro del período 1): parseFloat("1V") = 1, y ahí se
        // desempata alfabéticamente para que quede "1" antes que "1V".
        periodos: [...periodos].sort((a, b) => {
            const diferencia = parseFloat(a) - parseFloat(b);
            return diferencia !== 0 ? diferencia : String(a).localeCompare(String(b));
        }),
        totalEscuelas,
        totalCursos,
        totalArchivos,
        ultimaActualizacion: fecha.toISOString(),
    };
}