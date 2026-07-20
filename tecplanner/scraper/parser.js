// parser.js
// Única responsabilidad: transformar los datos crudos del TEC al formato
// interno de TEC Planner. No hace llamadas HTTP, no escribe archivos.

import { resolverCodigoSede } from './config.js';

const DIAS = {
    LUNES: 'LUN',
    MARTES: 'MAR',
    MIERCOLES: 'MIE',
    MIÉRCOLES: 'MIE',
    JUEVES: 'JUE',
    VIERNES: 'VIE',
    SABADO: 'SAB',
    SÁBADO: 'SAB',
    DOMINGO: 'DOM',
};

function abreviarDia(nombreDia) {
    const clave = nombreDia?.trim().toUpperCase();
    const abreviatura = DIAS[clave];
    if (!abreviatura) {
        console.warn(`[parser] día desconocido: "${nombreDia}", se conserva sin abreviar`);
        return nombreDia;
    }
    return abreviatura;
}

function normalizarProfesor(nombre) {
    if (!nombre || nombre.trim().toUpperCase() === 'SIN PROFESOR ASIGNADO') return null;
    return nombre.trim();
}

function normalizarTexto(texto) {
    return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

/**
 * Detecta sesiones de Verano.
 *
 * IMPORTANTE — el TEC tiene DOS campos que se confunden fácil:
 * - IDE_MODALIDAD / DSC_MODALIDAD: tipo de PERÍODO (ej. "V"/"VERANO",
 *   presumiblemente algo como "S"/"SEMESTRE" para el resto). Esto es lo
 *   que usamos acá para separar Verano de Semestre regular, ya que ambos
 *   comparten el mismo IDE_PER_MOD.
 * - TIPO_CURSO: modalidad de ENTREGA del curso (Regular/Semipresencial/
 *   Virtual) — no tiene nada que ver con el período. Ese es el campo que
 *   se usa como curso.grupos[].modalidad más abajo.
 *
 * Confirmado con un caso real: IDE_MODALIDAD:"V", DSC_MODALIDAD:"VERANO",
 * TIPO_CURSO:"Semipresencial", los tres en la misma sesión.
 */
function esVerano(sesion) {
    if (sesion.IDE_MODALIDAD !== undefined && sesion.IDE_MODALIDAD !== null && sesion.IDE_MODALIDAD !== '') {
        return normalizarTexto(sesion.IDE_MODALIDAD) === 'V';
    }
    // Fallback por si alguna sesión no trae IDE_MODALIDAD.
    return normalizarTexto(sesion.DSC_MODALIDAD).includes('VERANO');
}

/**
 * Período "efectivo" de una sesión: el IDE_PER_MOD crudo del TEC, salvo
 * que sea Verano, en cuyo caso se le agrega el sufijo "V" (ej. "1" -> "1V")
 * para no fusionarlo con el semestre regular del mismo período.
 */
export function periodoEfectivo(sesion) {
    return esVerano(sesion) ? `${sesion.IDE_PER_MOD}V` : String(sesion.IDE_PER_MOD);
}

function obtenerOCrearSede(sedes, sesion, codigoEscuela) {
    // El endpoint recibe año pero no período: una sola llamada puede traer
    // sesiones de varios períodos (I, II, verano) para la misma sede. Si
    // agrupáramos solo por sede, cursos de períodos distintos se
    // fusionarían por error, así que la clave combina sede + período
    // efectivo (que ya distingue Verano del semestre regular).
    const periodo = periodoEfectivo(sesion);
    const clave = `${sesion.DSC_SEDE}::${periodo}`;
    if (!sedes.has(clave)) {
        sedes.set(clave, {
            codigoEscuela,
            nombreEscuela: sesion.DSC_DEPTO,
            nombreSede: sesion.DSC_SEDE,
            codigoSede: resolverCodigoSede(sesion.DSC_SEDE),
            anio: sesion.NUM_ANO,
            periodo,
            cursos: new Map(),
        });
    }
    return sedes.get(clave);
}

function obtenerOCrearCurso(cursos, sesion) {
    const clave = sesion.IDE_MATERIA;
    if (!cursos.has(clave)) {
        cursos.set(clave, {
            codigo: sesion.IDE_MATERIA,
            nombre: sesion.DSC_MATERIA,
            creditos: sesion.CAN_CREDITOS,
            grupos: new Map(),
        });
    }
    return cursos.get(clave);
}

function obtenerOCrearGrupo(grupos, sesion) {
    const clave = sesion.IDE_GRUPO;
    if (!grupos.has(clave)) {
        grupos.set(clave, {
            grupo: sesion.IDE_GRUPO,
            profesor: normalizarProfesor(sesion.NOM_PROFESOR),
            // TIPO_CURSO ("Regular"/"Semipresencial"/"Virtual"), NO
            // DSC_MODALIDAD (eso es tipo de período, ver esVerano arriba).
            modalidad: sesion.TIPO_CURSO,
            bloques: [],
        });
    }
    return grupos.get(clave);
}

/**
 * Convierte los Maps intermedios (usados solo para agrupar en una sola
 * pasada) a los arreglos planos que espera el formato final de TEC Planner.
 */
function construirSalida(sedes) {
    return Array.from(sedes.values()).map((sede) => ({
        codigoEscuela: sede.codigoEscuela,
        nombreEscuela: sede.nombreEscuela,
        codigoSede: sede.codigoSede,
        nombreSede: sede.nombreSede,
        anio: sede.anio,
        periodo: sede.periodo,
        cursos: Array.from(sede.cursos.values()).map((curso) => ({
            codigo: curso.codigo,
            nombre: curso.nombre,
            creditos: curso.creditos,
            grupos: Array.from(curso.grupos.values()).map((grupo) => ({
                grupo: grupo.grupo,
                profesor: grupo.profesor,
                modalidad: grupo.modalidad,
                horario: grupo.bloques.join(' '),
            })),
        })),
    }));
}

/**
 * Agrupa las sesiones crudas de una escuela en sede → curso → grupo,
 * fusionando en un único horario las sesiones que comparten grupo pero
 * caen en días distintos. Recorre el arreglo de sesiones una sola vez.
 *
 * @param {Array<object>} sesiones - respuesta cruda de api.obtenerCursos()
 * @param {string} codigoEscuela - código de la escuela consultada (ej. 'QU')
 * @returns {Array<object>} un objeto por sede+período, listo para escribirse como archivo
 */
export function parsearCursosPorEscuela(sesiones, codigoEscuela) {
    const sedes = new Map();

    for (const sesion of sesiones) {
        const sede = obtenerOCrearSede(sedes, sesion, codigoEscuela);
        const curso = obtenerOCrearCurso(sede.cursos, sesion);
        const grupo = obtenerOCrearGrupo(curso.grupos, sesion);
        grupo.bloques.push(`${abreviarDia(sesion.NOM_DIA)}[${sesion.HINICIO}-${sesion.HFIN}]`);
    }

    return construirSalida(sedes);
}

/**
 * Transforma la respuesta cruda de cargaEscuelas al formato interno
 * { codigo, nombre } usado por el scraper para iterar escuelas sin
 * mantener una lista escrita a mano.
 */
export function parsearEscuelas(escuelasCrudas) {
    return escuelasCrudas.map((escuela) => ({
        codigo: escuela.IDE_DEPTO,
        nombre: escuela.DSC_DEPTO,
    }));
}