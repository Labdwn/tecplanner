// calendario.js
// Lee el calendario académico oficial (https://www.tec.ac.cr/semestre-verano)
// y lo convierte en output/calendario.json: una lista plana de eventos con
// fechas ISO. Ese archivo alimenta dos cosas:
//   - ventanas.js: de ahí salen las ventanas de scraping (ya no se editan a mano),
//   - la tarjeta "Próximas fechas del TEC" del Home.
//
// El parseo es estructural: expande colspan/rowspan de cada tabla, ubica la
// fila de encabezado con los períodos ("II Semestre 2026", "Verano 2026-2027"...)
// y lee cada actividad contra las columnas de su período. Una celda que abarca
// las dos columnas Inicio/Fin es una fecha única (inicio = fin).
//
// Si la página cambia de forma y no se logra leer con confianza, el script
// falla SIN escribir nada: el calendario.json anterior queda intacto.
//
// Uso:
//   node calendario.js                       descarga la página y actualiza output/calendario.json
//   node calendario.js --archivo pagina.html  usa un HTML guardado (para probar sin red)

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchConReintentos, leerJSONSiExiste, escribirJSONSiCambio } from './utils.js';

export const URL_CALENDARIO = 'https://www.tec.ac.cr/semestre-verano';
export const RUTA_CALENDARIO = 'output/calendario.json';

// Si se leen menos eventos que esto, se asume que la página cambió de forma.
const MIN_EVENTOS_ESPERADOS = 10;

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------

function decodificarEntidades(texto) {
    return texto
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&amp;/gi, '&');
}

function limpiar(html) {
    return decodificarEntidades(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}

/** "22-06-26", "14/12/26", "5/10/2026" → "2026-06-22" (o null si no hay fecha válida). */
export function parsearFecha(texto) {
    const m = /(\d{1,2})[-/](\d{1,2})[-/](\d{4}|\d{2})/.exec(texto);
    if (!m) return null;
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    const anio = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
    const iso = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    // descarta fechas imposibles como 31-02
    return new Date(`${iso}T00:00:00Z`).getUTCDate() === dia ? iso : null;
}

/** "II Semestre 2026" → { anio: '2026', periodo: '2' }; "Verano 2026-2027" → { anio: '2026', periodo: '1V' }. */
export function claveDePeriodo(etiqueta) {
    const t = normalizar(etiqueta);
    let m = /^(I|II) SEMESTRE (\d{4})$/.exec(t);
    if (m) return { anio: m[2], periodo: m[1] === 'I' ? '1' : '2' };
    m = /^VERANO (\d{4})-(\d{4})$/.exec(t);
    // El Verano se registra bajo el año en que arranca (ver ventanas.js / parser.js).
    if (m) return { anio: m[1], periodo: '1V' };
    return null;
}

const TIPOS = [
    [/PUBLICACION GUIA DE HORARIOS/, 'guia_horarios'],
    [/CURSOS POSIBLES A MATRICULAR/, 'cursos_posibles'],
    [/PUBLICACION PRELIMINAR DE CITAS/, 'citas_preliminar'],
    [/APELACIONES AL PADRON/, 'apelaciones_padron'],
    [/PUBLICACION DEFINITIVA/, 'citas_definitivas'],
    [/MATRICULA ORDINARIA DE ESTUDIANTES REGULARES/, 'matricula_ordinaria'],
    [/MATRICULA EXTRAORDINARIA TODOS/, 'matricula_extraordinaria'],
    [/APELACIONES E INCLUSIONES/, 'apelaciones_inclusiones'],
    [/^PERIODO LECTIVO$/, 'periodo_lectivo'],
    [/^EVALUACIONES Y ACTIVIDADES FINALES/, 'evaluaciones_finales'],
];

// Tipos que se muestran en el Home.
const TIPOS_RELEVANTES = new Set([
    'guia_horarios', 'cursos_posibles', 'citas_preliminar', 'citas_definitivas',
    'matricula_ordinaria', 'matricula_extraordinaria', 'apelaciones_inclusiones',
    'periodo_lectivo', 'evaluaciones_finales',
]);

function clasificar(actividad) {
    const t = normalizar(actividad);
    return TIPOS.find(([re]) => re.test(t))?.[1] ?? 'otro';
}

// ---------------------------------------------------------------------------
// Tablas HTML → grilla (expande colspan/rowspan)
// ---------------------------------------------------------------------------

function atributoNumerico(atributos, nombre) {
    const m = new RegExp(`${nombre}\\s*=\\s*["']?(\\d+)`, 'i').exec(atributos);
    return m ? Math.max(1, Number(m[1])) : 1;
}

function extraerTablas(html) {
    return [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map(([tabla]) => {
        const caption = limpiar(/<caption[^>]*>([\s\S]*?)<\/caption>/i.exec(tabla)?.[1] ?? '');
        const filas = [...tabla.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map(([fila]) =>
            [...fila.matchAll(/<(t[hd])([^>]*)>([\s\S]*?)<\/\1>/gi)].map(([, tag, attrs, contenido]) => ({
                esTh: tag.toLowerCase() === 'th',
                texto: limpiar(contenido),
                colspan: atributoNumerico(attrs, 'colspan'),
                rowspan: atributoNumerico(attrs, 'rowspan'),
            }))
        );
        return { caption, filas };
    });
}

function construirGrilla(filas) {
    const grilla = [];
    filas.forEach((fila, r) => {
        grilla[r] ??= [];
        let c = 0;
        for (const celda of fila) {
            while (grilla[r][c]) c++;
            for (let dr = 0; dr < celda.rowspan; dr++) {
                grilla[r + dr] ??= [];
                for (let dc = 0; dc < celda.colspan; dc++) grilla[r + dr][c + dc] = celda;
            }
            c += celda.colspan;
        }
    });
    return grilla;
}

/** Celdas únicas (por identidad) de una fila de la grilla en un rango de columnas. */
function celdasEnRango(filaGrilla, desde, hasta) {
    const vistas = [];
    for (let c = desde; c < hasta; c++) {
        const celda = filaGrilla[c];
        if (celda && !vistas.includes(celda)) vistas.push(celda);
    }
    return vistas;
}

// ---------------------------------------------------------------------------
// Parseo principal
// ---------------------------------------------------------------------------

/**
 * @returns {{ titulo: string, eventos: Array, tablasLeidas: number, tablasOmitidas: string[], avisos: string[] }}
 */
export function parsearCalendario(html) {
    const titulo = limpiar(/<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').replace(/\s*\|\s*TEC\s*$/i, '');
    const eventos = [];
    const tablasOmitidas = [];
    const avisos = [];
    let tablasLeidas = 0;

    for (const { caption, filas } of extraerTablas(html)) {
        const grilla = construirGrilla(filas);

        // Fila de encabezado: la primera que contiene <th> con etiquetas de período.
        const indiceEncabezado = grilla.findIndex((fila, r) =>
            filas[r]?.some((c) => c.esTh && claveDePeriodo(c.texto))
        );
        if (indiceEncabezado === -1) {
            tablasOmitidas.push(caption || '(sin título)');
            continue;
        }

        const periodos = [];
        const filaEnc = grilla[indiceEncabezado];
        for (let c = 0; c < filaEnc.length; c++) {
            const celda = filaEnc[c];
            if (!celda || periodos.some((p) => p.celda === celda)) continue;
            const clave = celda.esTh ? claveDePeriodo(celda.texto) : null;
            if (clave) periodos.push({ celda, etiqueta: celda.texto, clave, desde: c, hasta: c + celda.colspan });
        }

        const primeraFilaCuerpo = filas.findIndex((fila) => fila.length > 0 && fila.every((c) => !c.esTh));
        if (primeraFilaCuerpo === -1) {
            tablasOmitidas.push(caption || '(sin título)');
            continue;
        }
        tablasLeidas++;

        for (let r = primeraFilaCuerpo; r < grilla.length; r++) {
            const actividad = grilla[r]?.[0]?.texto ?? '';
            if (!actividad) continue;

            for (const p of periodos) {
                const celdas = celdasEnRango(grilla[r], p.desde, p.hasta);
                const conTexto = celdas.filter((c) => c.texto);
                if (conTexto.length === 0) continue;

                // Una celda con fecha que se extiende más allá de su período es ambigua.
                const desborda = conTexto.find((c) => c.colspan > p.hasta - p.desde);
                if (desborda) {
                    avisos.push(`"${actividad}" (${p.etiqueta}): celda con fecha que abarca varios períodos, se omite.`);
                    continue;
                }

                const fechas = celdas.map((c) => parsearFecha(c.texto)).filter(Boolean);
                if (fechas.length === 0) continue;

                const inicio = fechas[0];
                const fin = fechas[1] ?? fechas[0];
                if (fin < inicio) {
                    avisos.push(`"${actividad}" (${p.etiqueta}): fin anterior al inicio, se omite.`);
                    continue;
                }

                const tipo = clasificar(actividad);
                eventos.push({
                    anio: p.clave.anio,
                    periodo: p.clave.periodo,
                    etiquetaPeriodo: p.etiqueta,
                    tipo,
                    actividad,
                    tabla: caption,
                    inicio,
                    fin,
                    relevante: TIPOS_RELEVANTES.has(tipo),
                });
            }
        }
    }

    return { titulo, eventos, tablasLeidas, tablasOmitidas, avisos };
}

// ---------------------------------------------------------------------------
// Fusión con lo ya guardado
// ---------------------------------------------------------------------------

const claveEvento = (e) => `${e.anio}|${e.periodo}|${e.tabla}|${normalizar(e.actividad)}`;

/**
 * La página solo muestra el ciclo vigente; al cambiar de año desaparecen los
 * períodos viejos. Se conserva lo ya guardado y lo nuevo gana en caso de
 * coincidir, para no perder el historial ni las ventanas pasadas.
 */
export function fusionarEventos(previos, nuevos) {
    const mapa = new Map(previos.map((e) => [claveEvento(e), e]));
    for (const e of nuevos) mapa.set(claveEvento(e), e);
    return [...mapa.values()].sort(
        (a, b) => a.inicio.localeCompare(b.inicio) || a.actividad.localeCompare(b.actividad)
    );
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
    const i = process.argv.indexOf('--archivo');
    const html = i !== -1
        ? await readFile(process.argv[i + 1], 'utf-8')
        : await (await fetchConReintentos(URL_CALENDARIO)).text();

    const { titulo, eventos, tablasLeidas, tablasOmitidas, avisos } = parsearCalendario(html);

    avisos.forEach((a) => console.warn(`[calendario] aviso: ${a}`));
    console.log(`[calendario] "${titulo}": ${eventos.length} eventos de ${tablasLeidas} tablas (${tablasOmitidas.length} omitidas por no tener períodos).`);

    if (tablasLeidas === 0 || eventos.length < MIN_EVENTOS_ESPERADOS) {
        throw new Error(
            `solo se leyeron ${eventos.length} eventos (mínimo esperado ${MIN_EVENTOS_ESPERADOS}). ` +
            'La página probablemente cambió de estructura; no se escribió nada.'
        );
    }

    const previo = await leerJSONSiExiste(RUTA_CALENDARIO, { eventos: [] });
    const escribio = await escribirJSONSiCambio(RUTA_CALENDARIO, {
        fuente: URL_CALENDARIO,
        titulo,
        eventos: fusionarEventos(previo.eventos ?? [], eventos),
    });
    console.log(escribio ? '[calendario] calendario.json actualizado.' : '[calendario] sin cambios.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        console.error('[calendario] falló:', error.message);
        process.exitCode = 1;
    });
}
