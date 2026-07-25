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
    "VALVERDE SANCHEZ SAMUEL": "https://costarica.misprofesores.com/profesores/Samuel-Valverde-Sanchez_48832",
    "ACUÑA PRADO LUIS": "https://costarica.misprofesores.com/profesores/Luis-Acuna_13248",
    "BRENES GOMEZ  RANDALL": "https://costarica.misprofesores.com/profesores/Randall-Brenes_13309",
    "CALDERON SOLANO MANUEL": "https://costarica.misprofesores.com/profesores/Manuel-Calderon-Solano_13380",
    "CARRERA RETANA LUIS ERNESTO": "https://costarica.misprofesores.com/profesores/Ernesto-Carrera_13364",
    "CHAVARRIA MOLINA JEFFRY": "https://costarica.misprofesores.com/profesores/Jeffry-Chavarria_13372",
    "CHINCHILLA VALVERDE JORGE LUIS": "https://costarica.misprofesores.com/profesores/Jorge-Luis-Chinchilla_35311",
    "FIGUEROA MATA GEOVANNI": "https://costarica.misprofesores.com/profesores/Geovanni-Figueroa_13310",
    "FREER PANIAGUA DYLANA": "https://costarica.misprofesores.com/profesores/Dylana-Freer_36977",
    "GUTIERREZ MONTENEGRO MARCO VINICIO": "https://costarica.misprofesores.com/profesores/Marco-Vinicio-Gutierrez-Montenegro_13263",
    "JIMENEZ ROMERO ALEJANDRA": "https://costarica.misprofesores.com/profesores/Alejandra-Jimenez-Romero_13366",
    "LOPEZ MORA VERONICA": "https://costarica.misprofesores.com/profesores/Veronica-Lopez-Mora_36407",
    "MORA PICADO LUIS FERNANDO": "https://costarica.misprofesores.com/profesores/Luis-Fernando-Mora_13313",
    "NAVARRO AGUIRRE JESSICA": "https://costarica.misprofesores.com/profesores/Jessica-Navarro-Aguirre_36110",
    "OVIEDO UGALDE NORBERTO": "https://costarica.misprofesores.com/profesores/Norberto-Oviedo_13283",
    "PARRA RODRIGUEZ EMMANUELLE": "https://costarica.misprofesores.com/profesores/Emmanuelle-Parra-Rodriguez_52272",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",

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
