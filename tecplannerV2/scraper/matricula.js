// matricula.js
// Única responsabilidad: hablar con el sistema autenticado de matrícula
// (ConsultaHorarios) para obtener edificio/aula por materia. No sabe nada
// de "grupos ya parseados", "matching" ni del formato final de TEC Planner
// — eso vive en aulas.js. Este módulo solo hace la llamada HTTP y devuelve
// la respuesta cruda del TEC (o null si esa materia puntual falló).
//
// El único hueco intencional es obtenerSesion(): cómo se consigue una
// sesión autenticada válida es una decisión que le corresponde al dueño
// de la cuenta, no a este módulo. Todo lo demás (reintentos, concurrencia,
// pausas, tolerancia a fallos) ya está resuelto acá.

import { ENDPOINTS_MATRICULA, AULAS } from './config.js';

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ============================================================================
 * HUECO INTENCIONAL — implementar esto es responsabilidad del dueño de la
 * cuenta de estudiante, no de este módulo.
 * ============================================================================
 *
 * Debe devolver lo que necesite fetchConSesion() para autenticar cada
 * request (ej. un header Cookie con el ASP.NET_SessionId + token anti-CSRF
 * si el TEC lo pide, o lo que sea que capture el login real).
 *
 * Forma esperada del retorno (ajustar si el TEC pide algo distinto):
 *   { headers: { Cookie: '...', ... } }
 *
 * Mientras esto no esté implementado, todo el resto del pipeline sigue
 * funcionando: simplemente cada consulta fallará "a propósito" y las
 * materias quedarán con edificio: null, aula: null — que es exactamente
 * el comportamiento de fallback que ya pide el diseño.
 */

/**
 * Opción A: sesión capturada manualmente del navegador.
 *
 * Cómo renovarla cuando expire:
 *   1. Iniciar sesión vos mismo en frmMatricula.aspx desde el navegador.
 *   2. DevTools → Network → cualquier request → copiar el header "Cookie" completo.
 *   3. Guardarlo como variable de entorno AULAS_SESSION_COOKIE (local) o como
 *      secret de GitHub Actions del mismo nombre (ver scrape.yml).
 *
 * Este módulo nunca ve ni loguea el valor de la cookie — solo la reenvía
 * como header en cada request a ConsultaHorarios.
 */
export async function obtenerSesion() {
    const cookie = process.env.AULAS_SESSION_COOKIE;
    if (!cookie) {
        throw new Error(
            '[matricula] falta AULAS_SESSION_COOKIE. Fase 2 se omite; ' +
            'Fase 1 continúa normalmente con edificio/aula en null.'
        );
    }
    return { headers: { Cookie: cookie } };
}

/**
 * Hace el POST autenticado a ConsultaHorarios para una materia puntual.
 * Reintentos cortos (AULAS.maxIntentos) porque si una materia falla, el
 * costo de perderla es bajo (queda en null) — no vale la pena insistir
 * tanto como en la Fase 1 pública.
 *
 * Devuelve la respuesta cruda del TEC (array de grupos con Itinerario), o
 * null si no se pudo obtener tras los reintentos. Nunca lanza.
 */
async function consultarHorarioMateria(idMateria, sesion) {
    for (let intento = 1; intento <= AULAS.maxIntentos; intento++) {
        const controlador = new AbortController();
        const timeout = setTimeout(() => controlador.abort(), AULAS.timeoutMs);

        try {
            const respuesta = await fetch(ENDPOINTS_MATRICULA.consultaHorarios, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sesion?.headers || {}),
                },
                body: JSON.stringify({ idMateria }),
                signal: controlador.signal,
            });
            clearTimeout(timeout);

            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }

            const cuerpo = await respuesta.json();
            // El TEC envuelve la respuesta en { d: "<json string>" }, igual
            // que los endpoints públicos (ver api.js). A diferencia de esos,
            // acá el JSON interno no es el arreglo directamente sino un
            // objeto { EstadoCita, EsBloqueado, Horario: [...] } — lo único
            // que nos interesa de acá es Horario. Si por algo Horario no
            // viene como arreglo (respuesta inesperada), se devuelve []
            // en vez de reventar: una materia rara no debe tumbar la corrida.
            const datos = typeof cuerpo.d === 'string' ? JSON.parse(cuerpo.d) : cuerpo.d;
            return Array.isArray(datos?.Horario) ? datos.Horario : [];
        } catch (error) {
            clearTimeout(timeout);
            console.warn(`[matricula] intento ${intento}/${AULAS.maxIntentos} falló para ${idMateria}: ${error.message}`);
            if (intento < AULAS.maxIntentos) await esperar(500);
        }
    }
    return null; // se agotaron los intentos: esta materia queda sin aula, no rompe nada
}

/**
 * Consulta ConsultaHorarios para una lista de materias únicas, con
 * concurrencia limitada y pausas entre lotes (ver AULAS en config.js).
 *
 * Devuelve un Map<idMateria, respuestaCruda|null>. Las materias que
 * fallaron quedan con valor null — quien consuma este Map decide qué
 * hacer (en nuestro caso, aulas.js las deja en edificio/aula: null).
 *
 * Si sesion es null/undefined (porque obtenerSesion() no está implementado
 * o falló), se registra un aviso una sola vez y se devuelve un Map vacío
 * de inmediato, sin gastar ninguna llamada HTTP.
 */
export async function obtenerHorariosPorMateria(idsMateria, sesion) {
    const resultados = new Map();

    if (!sesion) {
        console.warn('[matricula] sin sesión autenticada: se omite la Fase 2 por completo.');
        return resultados;
    }

    const cola = [...idsMateria];
    let procesadas = 0;

    async function trabajador() {
        while (cola.length > 0) {
            const idMateria = cola.shift();
            const resultado = await consultarHorarioMateria(idMateria, sesion);
            resultados.set(idMateria, resultado);

            procesadas++;
            if (procesadas % 50 === 0) {
                console.log(`[matricula] ${procesadas}/${idsMateria.length} materias consultadas`);
            }
            await esperar(AULAS.pausaMs);
        }
    }

    const trabajadores = Array.from({ length: AULAS.concurrencia }, () => trabajador());
    await Promise.all(trabajadores);

    return resultados;
}