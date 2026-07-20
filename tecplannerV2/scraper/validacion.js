// validacion.js
// Única responsabilidad: verificar que los datos ya parseados (formato
// TEC Planner) tengan los campos mínimos esperados antes de guardarlos.
// Nunca lanza ni aborta: solo registra advertencias. Un campo faltante
// e inesperado del TEC no debería tumbar toda la corrida del scraper,
// pero sí queremos enterarnos de que pasó y en qué curso.

const CAMPOS_GRUPO_REQUERIDOS = ['grupo', 'modalidad', 'horario'];
// profesor NO se valida acá: null es un valor legítimo (sin profesor asignado).

function advertir(mensaje) {
    console.warn(`[validacion] ${mensaje}`);
}

function esVacio(valor) {
    return valor === undefined || valor === null || valor === '';
}

function validarGrupo(grupo, curso, contextoSede) {
    CAMPOS_GRUPO_REQUERIDOS.forEach((campo) => {
        if (esVacio(grupo[campo])) {
            advertir(
                `${contextoSede.nombreEscuela} (${contextoSede.nombreSede}, período ${contextoSede.periodo}): ` +
                `curso ${curso.codigo} "${curso.nombre}", grupo ${grupo.grupo ?? '??'} — falta "${campo}".`
            );
        }
    });
}

function validarCurso(curso, contextoSede) {
    if (esVacio(curso.codigo)) {
        advertir(`${contextoSede.nombreEscuela} (${contextoSede.nombreSede}): curso sin código, nombre "${curso.nombre ?? '??'}".`);
    }
    if (esVacio(curso.nombre)) {
        advertir(`${contextoSede.nombreEscuela} (${contextoSede.nombreSede}): curso ${curso.codigo ?? '??'} sin nombre.`);
    }
    if (!curso.grupos || curso.grupos.length === 0) {
        advertir(`${contextoSede.nombreEscuela} (${contextoSede.nombreSede}): curso ${curso.codigo} "${curso.nombre}" no tiene grupos.`);
        return;
    }
    curso.grupos.forEach((grupo) => validarGrupo(grupo, curso, contextoSede));
}

/**
 * Recorre un archivo ya parseado (una combinación sede+período+escuela,
 * tal como los produce parser.js) y registra una advertencia por cada
 * campo faltante. No modifica ni descarta ningún dato.
 */
export function validarArchivo(archivo) {
    archivo.cursos.forEach((curso) => validarCurso(curso, archivo));
}
