// config.js
// Configuración centralizada del scraper. Ningún otro módulo debe
// hardcodear URLs, años o parámetros de red: todos los valores ajustables
// viven acá.

const BASE_URL = 'https://tec-appsext.itcr.ac.cr/guiahorarios/escuela.aspx';

export const ENDPOINTS = {
    cursos: `${BASE_URL}/getdatosEscuelaAno`,
    escuelas: `${BASE_URL}/cargaEscuelas`,
    modalidadesPeriodos: `${BASE_URL}/cargaModalidadPeriodos`,
};

// Año objetivo del scraping. Se puede sobreescribir con la variable de
// entorno SCRAPER_ANIO (útil para correr el workflow manualmente contra
// otro año sin tocar código).
export const ANIO = process.env.SCRAPER_ANIO || new Date().getFullYear().toString();

// Período objetivo (opcional). Si se especifica, solo se conservan las
// sesiones cuyo período efectivo (ver parser.periodoEfectivo) coincida
// exactamente con este valor — ej. "1" (I Semestre), "2" (II Semestre),
// "1V" (Verano dentro del período 1). Si no se especifica, se procesan
// todos los períodos que devuelva el TEC para ese año.
export const PERIODO = process.env.SCRAPER_PERIODO || null;

export const RED = {
    maxIntentos: 3,
    esperaBaseMs: 1000, // backoff exponencial: 1s, 2s, 4s...
    timeoutMs: 15000,
};

export const RUTAS = {
    data: 'data',
    output: 'output',
    history: 'output/history.json',
    metadata: 'output/metadata.json',
};

// Nombre completo de sede (tal como lo devuelve DSC_SEDE) → código corto
// usado para nombrar carpetas. Mantener esta tabla actualizada cuando el
// TEC agregue una sede nueva.
export const SEDES = {
    'CAMPUS TECNOLOGICO CENTRAL CARTAGO': 'CA',
    'CAMPUS TECNOLOGICO LOCAL SAN JOSE': 'SJ',
    'CAMPUS TECNOLOGICO LOCAL SAN CARLOS': 'SC',
    'CENTRO ACADEMICO DE ALAJUELA': 'AL',
    'CENTRO ACADEMICO DE LIMON': 'LM',
};

/**
 * Resuelve el código corto de una sede a partir de su nombre completo.
 * Si aparece una sede que todavía no está en SEDES, la ejecución no se
 * detiene: se registra una advertencia y se usa un slug generado a partir
 * del nombre como código temporal, para que baste con agregar la sede a
 * la tabla más adelante.
 */
export function resolverCodigoSede(nombreSede) {
    const codigo = SEDES[nombreSede];
    if (codigo) return codigo;

    const slug = generarSlugSede(nombreSede);
    console.warn(
        `[config] sede desconocida "${nombreSede}", usando slug temporal "${slug}". ` +
        'Agregala a SEDES en config.js cuando puedas.'
    );
    return slug;
}

function generarSlugSede(nombreSede) {
    return nombreSede
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toUpperCase()
        .slice(0, 12);
}

// Palabras que, si aparecen en el nombre de la escuela, indican que es un
// programa de posgrado (maestría, doctorado, etc.). TecPlanner solo cubre
// carreras de grado (semestres/veranos), así que estas escuelas se excluyen
// antes de scrapear sus cursos. Comparación sin tildes y en mayúsculas.
const PALABRAS_POSGRADO = [
    'MAESTRIA',
    'DOCTORADO',
    'POSGRADO',
    'POSTGRADO',
    'ESPECIALIDAD',
    'ESPECIALIZACION',
];

function normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

/**
 * Determina si el nombre de una escuela corresponde a un programa de
 * posgrado, según las palabras clave de PALABRAS_POSGRADO. Si el TEC agrega
 * un nombre de posgrado que no contenga ninguna de estas palabras, no se
 * detecta automáticamente — hay que sumarla a la lista.
 */
export function esPosgrado(nombreEscuela) {
    const nombre = normalizar(nombreEscuela);
    return PALABRAS_POSGRADO.some((palabra) => nombre.includes(normalizar(palabra)));
}

// Períodos "base" que TecPlanner soporta: I y II Semestre. El TEC devuelve
// además otros IDE_PER_MOD (3, 4, 5, 6, 7...) que corresponden a programas
// con calendario propio (ejecutivos, trimestrales, cuatrimestrales) sin
// importar si el nombre de la escuela "suena" a carrera de grado normal
// (ej. "LICENCIATURA EN ADMINISTRACION DE EMPRESAS" apareció en período 5).
// Filtrar por el código crudo de período es más confiable que intentar
// detectar esto por nombre.
//
// Verano NO se filtra acá: Verano I comparte IDE_PER_MOD=1 con el semestre
// regular (se diferencian después vía periodoEfectivo/IDE_MODALIDAD), así
// que dejar pasar "1" y "2" ya incluye sus variantes de Verano.
const PERIODOS_BASE_VALIDOS = ['1', '2'];

/**
 * Determina si una sesión pertenece a un período base soportado (I o II
 * Semestre, incluyendo sus variantes de Verano). Sesiones de otros
 * calendarios (ejecutivos, trimestrales, etc.) devuelven false.
 */
export function esPeriodoBaseValido(sesion) {
    return PERIODOS_BASE_VALIDOS.includes(String(sesion.IDE_PER_MOD));
}

// === Fase 2: enriquecimiento con aulas (config.js, agregar al final) ===

// Endpoint autenticado de ConsultaHorarios. Vive en un dominio/base distinto
// al de la guía pública (frmMatricula, no escuela.aspx).
const MATRICULA_BASE_URL = 'https://tec-appsext.itcr.ac.cr/matricula/frmMatricula.aspx';

export const ENDPOINTS_MATRICULA = {
    consultaHorarios: `${MATRICULA_BASE_URL}/ConsultaHorarios`,
};

// Parámetros de concurrencia para la Fase 2. Deliberadamente conservadores:
// ~730 materias con concurrencia 3 y 300ms de pausa entre lotes toma unos
// pocos minutos, sin acercarse a saturar el sistema del TEC.
export const AULAS = {
    concurrencia: Number(process.env.AULAS_CONCURRENCIA) || 3,
    pausaMs: Number(process.env.AULAS_PAUSA_MS) || 300,
    timeoutMs: 15000,
    maxIntentos: 2, // más bajo que RED.maxIntentos: si falla, preferimos null antes que insistir mucho
};