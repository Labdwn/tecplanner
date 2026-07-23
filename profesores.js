// =============================================================================
// TECPLANNER · profesores.js
// =============================================================================
// Mapa manual: nombre EXACTO del profesor tal como aparece en los datos del
// scraper de horarios (g.profesor) -> URL de su página en misprofesores.com.
//
// Agregá una línea por cada profesor que quieras que tenga el botón ⭐ en la
// tarjeta de grupo. Si el nombre no coincide exactamente (mayúsculas, orden
// de apellidos, etc.) el botón simplemente no aparece para ese profesor —
// no rompe nada, solo no se muestra.
//
// Ejemplo real (ITCR, Ingeniería en Computación):
const PROFESORES_MISPROFES = {
    "Francisco Torres": "https://costarica.misprofesores.com/profesores/Francisco-Torres_13257",
    "VALVERDE SANCHEZ SAMUEL": "https://costarica.misprofesores.com/profesores/Samuel-Valverde-Sanchez_48832",
    "Jose Castro": "https://costarica.misprofesores.com/profesores/Jose-Castro_13349",
    "Eddy Ramirez Jimenez": "https://costarica.misprofesores.com/profesores/Eddy-Ramirez-Jimenez_13271",
    "Mauricio Aviles": "https://costarica.misprofesores.com/profesores/Mauricio-Aviles_13273",

    // "Nombre Exacto Como Aparece En El Horario": "https://costarica.misprofesores.com/profesores/Nombre-Apellido_ID",
};

// Busca la URL de un profesor por nombre, con fallback case-insensitive
// por si hay pequeñas diferencias de mayúsculas/espacios.
function buscarUrlProfesor(nombre) {
    if (!nombre) return null;
    if (PROFESORES_MISPROFES[nombre]) return PROFESORES_MISPROFES[nombre];

    const normalizar = (s) => s.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quita tildes

    const tokensNombre = normalizar(nombre).split(/\s+/).filter(Boolean).sort();

    for (const [clave, url] of Object.entries(PROFESORES_MISPROFES)) {
        const tokensClave = normalizar(clave).split(/\s+/).filter(Boolean).sort();
        if (tokensNombre.length === tokensClave.length &&
            tokensNombre.every((t, i) => t === tokensClave[i])) {
            return url;
        }
    }
    return null;
}
