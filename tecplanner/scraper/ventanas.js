// ventanas.js
// Único archivo que hay que tocar cada semestre/verano nuevo: acá viven
// las fechas de matrícula publicadas por el DAR. revisar-ventana.js las
// lee para decidir, día a día, si hoy toca scrapear.
//
// Cada ventana representa el rango [inicio, fin] durante el cual tiene
// sentido scrapear un año+período dado:
//   - inicio: primer día de matrícula ordinaria (es cuando el TEC empieza
//     a publicar horarios con datos reales; antes de eso el scraper solo
//     traería escuelas vacías).
//   - fin: último día de apelaciones e inclusiones (último día en que el
//     horario de un estudiante todavía puede cambiar). Después de esa
//     fecha ya no tiene sentido seguir actualizando.
//
// anio/periodo son los valores que se pasan tal cual a SCRAPER_ANIO /
// SCRAPER_PERIODO (ver config.js). periodo: null = no filtrar por
// período (trae todos los que devuelva el TEC para ese año).
//
// Fuente: "Matrícula y Periodo Lectivo: Programas Modalidad Semestre y
// Verano" (DAR-TEC), tabla compartida el 2026-07-11.

export const VENTANAS = [
    {
        nombre: 'I Semestre 2026',
        anio: '2026',
        periodo: '1',
        inicio: '2026-01-29', // matrícula ordinaria estudiantes nuevos
        fin: '2026-02-27',    // fin de apelaciones e inclusiones
    },
    {
        nombre: 'II Semestre 2026',
        anio: '2026',
        periodo: '2',
        inicio: '2026-07-21', // matrícula ordinaria regulares
        fin: '2026-08-14',    // fin de apelaciones e inclusiones
    },

    // --- Verano 2026-2027 ---
    // Los cursos de Verano se registran bajo el período 1 (regular) del
    // año en que arranca el período lectivo — no bajo el año siguiente
    // aunque el nombre del Verano cruce dos años calendario. Acá el
    // período lectivo arranca en diciembre 2026, así que va bajo
    // anio: '2026'. periodoEfectivo() ya le agrega el sufijo "V" a estas
    // sesiones (comparten IDE_PER_MOD con el semestre regular, ver
    // parser.js), por eso periodo: '1V' y no '1'.
    {
        nombre: 'Verano 2026-2027',
        anio: '2026',
        periodo: '1V',
        inicio: '2026-12-14', // matrícula ordinaria regulares
        fin: '2026-12-17',    // fin de apelaciones e inclusiones
    },

    // TODO: agregar "I Semestre 2027" en cuanto el DAR publique sus
    // fechas (todavía no estaban en la tabla compartida). Estimado
    // preliminar basado en el patrón de años anteriores (mismas fechas
    // +/- unos días respecto a 2026) — AJUSTAR con la fecha oficial en
    // cuanto salga, esto es solo un placeholder para no dejar un hueco:
    // {
    //     nombre: 'I Semestre 2027',
    //     anio: '2027',
    //     periodo: '1',
    //     inicio: '2027-01-28',
    //     fin: '2027-02-26',
    // },
];