// =============================================================================
// DESCARGAS DE PLANES DE ESTUDIO (PDF y Excel)
// =============================================================================
// Menú "DESCARGAR" de Planes de Estudio con 4 salidas:
//   1. PDF  · plan de estudios original (malla oficial por semestre)
//   2. PDF  · plan del usuario (estados, notas, alertas, avance)
//   3. Excel · plan de estudios original
//   4. Excel · plan del usuario (editable, con fórmulas que se recalculan)
//
// Las librerías pesadas (ExcelJS y el plugin de tablas de jsPDF) se cargan SOLO
// cuando el usuario pide una descarga. jsPDF ya viene en index.html.
// =============================================================================

const DL_LIBS = {
    jspdf:     'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    autotable: 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/jspdf.plugin.autotable.min.js',
    exceljs:   'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
};

const DL_COLOR = {
    marca:   [130, 87, 230],   // morado TecPlanner
    oscuro:  [24, 24, 27],
    gris:    [107, 114, 128],
    claro:   [243, 244, 246],
    estado: {
        aprobado:  { fill: [209, 250, 229], texto: [6, 95, 70],   hex: 'FFD1FAE5', hexTxt: 'FF065F46' },
        cursando:  { fill: [207, 250, 254], texto: [21, 94, 117], hex: 'FFCFFAFE', hexTxt: 'FF155E75' },
        reprobado: { fill: [254, 226, 226], texto: [153, 27, 27], hex: 'FFFEE2E2', hexTxt: 'FF991B1B' },
        pendiente: { fill: [255, 255, 255], texto: [55, 65, 81],  hex: 'FFFFFFFF', hexTxt: 'FF374151' },
    },
};

const DL_ESTADO_TXT = { aprobado: 'Aprobado', cursando: 'Cursando', reprobado: 'Reprobado', pendiente: 'Pendiente' };
const DL_AVISO = 'Documento generado por TecPlanner, una herramienta no oficial del TEC. Confirmá siempre tu plan y tu matrícula con la Escuela o el DAR.';

// -----------------------------------------------------------------------------
// Carga perezosa de librerías
// -----------------------------------------------------------------------------
const dlScripts = {};
function dlCargarScript(url) {
    if (!dlScripts[url]) {
        dlScripts[url] = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.onload = resolve;
            s.onerror = () => { delete dlScripts[url]; reject(new Error('No se pudo cargar ' + url)); };
            document.head.appendChild(s);
        });
    }
    return dlScripts[url];
}

async function dlAsegurarPdf() {
    if (!window.jspdf) await dlCargarScript(DL_LIBS.jspdf);
    const { jsPDF } = window.jspdf;
    if (typeof jsPDF.API.autoTable !== 'function') await dlCargarScript(DL_LIBS.autotable);
    return jsPDF;
}

async function dlAsegurarExcel() {
    if (!window.ExcelJS) await dlCargarScript(DL_LIBS.exceljs);
    return window.ExcelJS;
}

// -----------------------------------------------------------------------------
// Datos
// -----------------------------------------------------------------------------
const dlHoy = () => new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Costa_Rica' });
const dlHoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });

function dlInfoCarrera() {
    const info = (typeof careers_information !== 'undefined' && careers_information[currentMajor]) || {};
    const titulo = info.name || (typeof MAJOR_TITLES !== 'undefined' && MAJOR_TITLES[currentMajor]) || String(currentMajor);
    const extra = [];
    if (info.plan)      extra.push(`Plan ${info.plan}`);
    if (info.grado)     extra.push(info.grado);
    if (info.modalidad) extra.push(info.modalidad);
    return { titulo, detalle: extra.join(' · '), plan: info.plan, grado: info.grado };
}

const dlNum = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

function dlEtiquetaBloque(n) {
    return n === 0 ? 'Bloque 0 (previo al semestre 1)' : `Semestre ${n}`;
}
function dlEtiquetaSem(n) {
    if (n === null || n === undefined) return 'Sin semestre asignado';
    if (n % 1 !== 0) return `Verano (S${n})`;
    return n === 0 ? 'Semestre 0' : `Semestre ${n}`;
}
function dlSemCorto(n) {
    return n === null || n === undefined ? '' : (n % 1 !== 0 ? `V${n}` : `S${n}`);
}

// Cursos "desbloqueados" por cada curso (los que lo tienen como requisito)
function dlDesbloquea(lista) {
    const mapa = {};
    lista.forEach(c => { mapa[c.id] = []; });
    lista.forEach(c => (c.reqs || []).forEach(r => { if (mapa[r]) mapa[r].push(c.id); }));
    return mapa;
}

// Plan oficial: la malla tal cual la define el TEC (no depende de lo que el usuario planeó)
function dlPlanOriginal() {
    const base = JSON.parse(JSON.stringify(curriculums[currentMajor] || coursesDB.filter(c => !c.isRetry)));
    const cursos = base.sort((a, b) => a.block - b.block || a.id.localeCompare(b.id));
    const grupos = [];
    cursos.forEach(c => {
        let g = grupos.find(x => x.bloque === c.block);
        if (!g) { g = { bloque: c.block, cursos: [], creditos: 0 }; grupos.push(g); }
        g.cursos.push(c);
        g.creditos += c.cred;
    });
    return {
        cursos, grupos,
        desbloquea: dlDesbloquea(cursos),
        totalCreditos: cursos.reduce((s, c) => s + c.cred, 0),
        // La columna Horas solo sale si TODOS los cursos la tienen (si está a medias se vería incompleta)
        tieneHoras: cursos.every(c => c.hrs !== undefined && c.hrs !== null),
    };
}

function dlIntento(c) {
    const m = /_R(\d+)$/.exec(c.id);
    return c.isRetry ? Number(m ? m[1] : 2) : 1;
}
const dlCodigo = (c) => (c.isRetry ? (c.originalId || c.id.replace(/_R\d+$/, '')) : c.id);

// Copia de la lógica de checkAnomalies() para poder listar los problemas en el documento
function dlAnomalias() {
    const res = {};
    coursesDB.forEach(c => {
        if (!hasSem(c.userSem)) return;
        const msgs = [];
        (c.reqs || []).forEach(reqId => {
            const r = coursesDB.find(x => x.id === resolveCourseId(reqId));
            if (!r || r.status === 'aprobado') return;
            if (!r.userSem || r.userSem >= c.userSem) msgs.push(`Requiere ${reqId} antes del ${dlSemCorto(c.userSem)}`);
        });
        (c.coreqs || []).forEach(coId => {
            const r = coursesDB.find(x => x.id === resolveCourseId(coId));
            if (!r || r.status === 'aprobado') return;
            if (!r.userSem || r.userSem > c.userSem) msgs.push(`El correquisito ${coId} no puede ir después del ${dlSemCorto(c.userSem)}`);
        });
        if (msgs.length) res[c.id] = msgs;
    });
    return res;
}

function dlTiming(c) {
    if (!hasSem(c.userSem)) return '';
    const u = Number(c.userSem);
    if (u % 1 !== 0) return 'Verano';
    if (u > c.block) return `Atrasado (+${u - c.block})`;
    if (u < c.block) return `Adelantado (-${c.block - u})`;
    return 'En su bloque';
}

// Plan del usuario: lo que hay hoy en pantalla
function dlPlanUsuario() {
    const todos = coursesDB.map(c => ({ ...c, status: c.status || 'pendiente' }));
    const oficiales = todos.filter(c => !c.isRetry);
    const anomalias = dlAnomalias();

    const asignados = todos.filter(c => hasSem(c.userSem))
        .sort((a, b) => Number(a.userSem) - Number(b.userSem) || a.block - b.block || a.id.localeCompare(b.id));
    const sinAsignar = todos.filter(c => !hasSem(c.userSem))
        .sort((a, b) => a.block - b.block || a.id.localeCompare(b.id));

    const semestres = [];
    asignados.forEach(c => {
        const sem = Number(c.userSem);
        let g = semestres.find(x => x.sem === sem);
        if (!g) {
            const oficial = Number.isInteger(sem) ? oficiales.filter(o => o.block === sem).reduce((s, o) => s + o.cred, 0) : null;
            g = { sem, cursos: [], creditos: 0, oficial };
            semestres.push(g);
        }
        g.cursos.push(c);
        g.creditos += c.cred;
    });
    semestres.forEach(g => { g.ponderado = dlPonderado(g.cursos); });

    const sumar = (arr) => arr.reduce((s, c) => s + c.cred, 0);
    const credAprobados = sumar(todos.filter(c => c.status === 'aprobado'));
    const credCursando  = sumar(todos.filter(c => c.status === 'cursando'));
    const credTotal     = sumar(oficiales);
    const conteo = (e) => todos.filter(c => c.status === e).length;

    return {
        todos, oficiales, asignados, sinAsignar, semestres, anomalias,
        credAprobados, credCursando,
        credPendientes: Math.max(0, credTotal - credAprobados - credCursando),
        credTotal,
        avance: credTotal > 0 ? credAprobados / credTotal : 0,
        ponderado: dlPonderado(todos),
        nAprobados: conteo('aprobado'), nCursando: conteo('cursando'), nReprobados: conteo('reprobado'), nPendientes: conteo('pendiente'),
        ultimoSem: semestres.length ? Math.max(...semestres.map(s => s.sem)) : null,
        promCredSem: semestres.length ? sumar(asignados) / semestres.length : 0,
    };
}

// Promedio ponderado TEC: solo cursos aprobados con nota numérica (igual que el perfil)
function dlPonderado(cursos) {
    let cr = 0, suma = 0;
    cursos.forEach(c => {
        if (c.status === 'aprobado' && c.grade !== null && c.grade !== undefined && String(c.grade).trim() !== '' && !isNaN(c.grade)) {
            cr += c.cred; suma += parseFloat(c.grade) * c.cred;
        }
    });
    return cr > 0 ? suma / cr : null;
}

const dlLista = (arr) => (arr && arr.length ? arr.join(', ') : '-');

// -----------------------------------------------------------------------------
// Menú de descargas
// -----------------------------------------------------------------------------
function toggleMenuDescargas(ev) {
    ev?.stopPropagation();
    const existente = document.getElementById('dlMenu');
    if (existente) { existente.remove(); return; }

    const btn = document.getElementById('btnExcel');
    const r = btn.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'dlMenu';
    menu.className = 'dl-menu';
    menu.innerHTML = `
        <div class="dl-grupo">PLAN DE ESTUDIOS ORIGINAL</div>
        <button class="dl-op" data-dl="pdf-original"><span class="dl-ico dl-pdf">PDF</span><span><b>Plan original</b><small>Presentación formal de la carrera, por semestre, con requisitos y correquisitos</small></span></button>
        <button class="dl-op" data-dl="xlsx-original"><span class="dl-ico dl-xls">XLSX</span><span><b>Plan original</b><small>Malla en Excel con totales por semestre y filtros</small></span></button>
        <div class="dl-grupo">MI PLAN</div>
        <button class="dl-op" data-dl="pdf-usuario"><span class="dl-ico dl-pdf">PDF</span><span><b>Mi plan</b><small>Estados, notas, avance y cursos sin planear</small></span></button>
        <button class="dl-op" data-dl="xlsx-usuario"><span class="dl-ico dl-xls">XLSX</span><span><b>Mi plan</b><small>Editable, con fórmulas que se recalculan solas</small></span></button>`;
    document.body.appendChild(menu);

    const ancho = menu.offsetWidth;
    menu.style.top  = `${Math.min(r.bottom + 8, window.innerHeight - menu.offsetHeight - 8)}px`;
    menu.style.left = `${Math.max(8, Math.min(r.right - ancho, window.innerWidth - ancho - 8))}px`;

    menu.addEventListener('click', (e) => {
        const op = e.target.closest('[data-dl]');
        if (!op) return;
        e.stopPropagation();
        ejecutarDescarga(op.dataset.dl, op);
    });
    // Precarga en segundo plano para que la descarga sea inmediata
    dlAsegurarPdf().catch(() => {});
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('dlMenu');
    if (menu && !menu.contains(e.target)) menu.remove();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.getElementById('dlMenu')?.remove(); });

async function ejecutarDescarga(tipo, boton) {
    if (!currentMajor || !coursesDB.length) { alert('Primero elegí tu carrera.'); return; }
    if ((tipo.endsWith('usuario')) && !coursesDB.some(c => hasSem(c.userSem))) {
        alert('Todavía no tenés cursos con semestre asignado. Planeá algunos primero (o descargá el plan original).');
        return;
    }
    const original = boton.innerHTML;
    boton.disabled = true;
    boton.querySelector('small').textContent = 'Generando…';
    try {
        if (tipo === 'pdf-original')        await descargarPdfOriginal();
        else if (tipo === 'pdf-usuario')    await descargarPdfUsuario();
        else if (tipo === 'xlsx-original')  await descargarExcelOriginal();
        else if (tipo === 'xlsx-usuario')   await descargarExcelUsuario();
        if (typeof umami !== 'undefined') umami.track('descarga_plan', { tipo, carrera: currentMajor });
        document.getElementById('dlMenu')?.remove();
    } catch (err) {
        console.error(err);
        boton.innerHTML = original;
        boton.disabled = false;
        alert('No se pudo generar el archivo. Revisá tu conexión (se cargan librerías la primera vez) e intentá de nuevo.');
    }
}

// =============================================================================
// PDF
// =============================================================================

function dlPdfBase(jsPDF, orientacion, titulo, subtitulo) {
    const doc = new jsPDF({ orientation: orientacion, unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...DL_COLOR.oscuro);
    doc.rect(0, 0, W, 78, 'F');
    doc.setFillColor(...DL_COLOR.marca);
    doc.rect(0, 78, W, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(titulo, 36, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(209, 213, 219);
    doc.text(subtitulo, 36, 56);
    doc.setFontSize(9);
    doc.text(`Generado el ${dlHoy()}`, W - 36, 56, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DL_COLOR.marca);
    doc.text('TecPlanner', W - 36, 36, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    return doc;
}

// Pie de página con numeración y aviso, en TODAS las páginas (se llama al final)
function dlPdfPies(doc) {
    const total = doc.internal.getNumberOfPages();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setDrawColor(229, 231, 235);
        doc.line(36, H - 34, W - 36, H - 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...DL_COLOR.gris);
        doc.text(DL_AVISO, 36, H - 22, { maxWidth: W - 140 });
        doc.text(`Página ${i} de ${total}`, W - 36, H - 22, { align: 'right' });
    }
}

// Cajitas de cifras (KPI) en fila
function dlPdfKpis(doc, y, items) {
    const W = doc.internal.pageSize.getWidth();
    const margen = 36, gap = 10;
    const ancho = (W - margen * 2 - gap * (items.length - 1)) / items.length;
    items.forEach((it, i) => {
        const x = margen + i * (ancho + gap);
        doc.setFillColor(...DL_COLOR.claro);
        doc.roundedRect(x, y, ancho, 46, 5, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(17);
        doc.setTextColor(...(it.color || DL_COLOR.oscuro));
        doc.text(String(it.valor), x + ancho / 2, y + 22, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...DL_COLOR.gris);
        doc.text(it.etiqueta, x + ancho / 2, y + 36, { align: 'center' });
    });
    doc.setTextColor(0, 0, 0);
    return y + 46;
}

// Título de sección dentro del PDF (con salto de página si no cabe)
function dlPdfSeccion(doc, y, texto, necesario = 80) {
    const H = doc.internal.pageSize.getHeight();
    y += 10;
    if (y + necesario > H - 50) { doc.addPage(); y = 50; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...DL_COLOR.oscuro);
    doc.text(texto, 36, y);
    doc.setDrawColor(...DL_COLOR.marca);
    doc.setLineWidth(1.5);
    doc.line(36, y + 5, 36 + Math.min(doc.getTextWidth(texto) + 8, 300), y + 5);
    doc.setLineWidth(0.5);
    return y + 18;
}

const DL_TABLA_BASE = {
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 4, lineColor: [229, 231, 235], lineWidth: 0.4, textColor: [31, 41, 55], overflow: 'linebreak' },
    margin: { left: 36, right: 36, bottom: 46 },
};

// ---------- 1. PDF · Plan de estudios original ----------
// Presentación formal de la carrera: sin datos del usuario, sin colores de estado ni notas.
const DL_ORDINALES = ['', 'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo', 'Duodécimo'];
const dlOrdinalSem = (n) => (n === 0 ? 'Cursos previos al primer semestre' : `${DL_ORDINALES[n] ? DL_ORDINALES[n] + ' semestre' : 'Semestre ' + n}`);
const DL_NAVY = [30, 58, 95];

function dlPdfFormalBase(jsPDF, car) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...DL_NAVY);
    doc.rect(0, 0, W, 118, 'F');
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('INSTITUTO TECNOLÓGICO DE COSTA RICA', 36, 34);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Plan de Estudios', 36, 66);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.text(car.titulo, 36, 90);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.6);
    doc.line(36, 100, W - 36, 100);
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text(car.detalle || '', 36, 112 - 1);
    doc.setTextColor(0, 0, 0);
    return doc;
}

function dlPdfFormalPies(doc) {
    const total = doc.internal.getNumberOfPages();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setDrawColor(203, 213, 225);
        doc.line(36, H - 34, W - 36, H - 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...DL_COLOR.gris);
        doc.text('Elaborado con TecPlanner a partir del plan de estudios vigente. Documento informativo, no oficial.', 36, H - 22);
        doc.text(`Página ${i} de ${total}`, W - 36, H - 22, { align: 'right' });
    }
}

async function descargarPdfOriginal() {
    const jsPDF = await dlAsegurarPdf();
    const car = dlInfoCarrera();
    const plan = dlPlanOriginal();
    const doc = dlPdfFormalBase(jsPDF, car);
    const W = doc.internal.pageSize.getWidth();

    const semestresReales = plan.grupos.filter(g => g.bloque > 0);
    const datos = [
        ['Carrera', car.titulo],
        ...(car.grado ? [['Grado académico', car.grado]] : []),
        ...(car.plan ? [['Plan de estudios', String(car.plan)]] : []),
        ['Duración', `${semestresReales.length} semestres`],
        ['Total de cursos', String(plan.cursos.length)],
        ['Total de créditos', String(plan.totalCreditos)],
    ];
    doc.autoTable({
        startY: 138,
        body: datos,
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: { top: 3, bottom: 3, left: 0, right: 8 }, textColor: [31, 41, 55] },
        columnStyles: { 0: { cellWidth: 120, fontStyle: 'bold', textColor: DL_NAVY } },
        margin: { left: 36, right: 36 },
        tableWidth: W - 72,
    });
    let y = doc.lastAutoTable.finalY + 22;

    const conHoras = plan.tieneHoras;
    plan.grupos.forEach(g => {
        const cols = ['Código', 'Nombre del curso', 'Créditos'];
        if (conHoras) cols.push('Horas');
        cols.push('Requisitos', 'Correquisitos');
        const n = cols.length;
        const filas = g.cursos.map(c => {
            const fila = [c.id, c.name, c.cred];
            if (conHoras) fila.push(c.hrs ?? '');
            fila.push(dlLista(c.reqs).replace(/^-$/, ''), dlLista(c.coreqs).replace(/^-$/, ''));
            return fila;
        });
        const pie = [{ content: 'Total de créditos', colSpan: 2, styles: { halign: 'right' } }, g.creditos];
        for (let i = 3; i < n; i++) pie.push('');

        doc.autoTable({
            ...DL_TABLA_BASE,
            startY: y,
            head: [
                [{ content: dlOrdinalSem(g.bloque), colSpan: n, styles: { fillColor: DL_NAVY, textColor: 255, fontStyle: 'bold', fontSize: 10.5, halign: 'left' } }],
                cols.map(c => ({ content: c, styles: { fillColor: [226, 232, 240], textColor: DL_NAVY, fontStyle: 'bold', halign: c === 'Créditos' || c === 'Horas' ? 'center' : 'left' } })),
            ],
            body: filas,
            foot: [pie],
            showHead: 'everyPage', showFoot: 'lastPage', pageBreak: 'avoid',
            footStyles: { fillColor: [241, 245, 249], textColor: DL_NAVY, fontStyle: 'bold' },
            columnStyles: conHoras
                ? { 0: { cellWidth: 52, fontStyle: 'bold' }, 2: { cellWidth: 44, halign: 'center' }, 3: { cellWidth: 34, halign: 'center' }, 4: { cellWidth: 90 }, 5: { cellWidth: 80 } }
                : { 0: { cellWidth: 52, fontStyle: 'bold' }, 2: { cellWidth: 44, halign: 'center' }, 3: { cellWidth: 100 }, 4: { cellWidth: 90 } },
        });
        y = doc.lastAutoTable.finalY + 16;
    });

    dlPdfFormalPies(doc);
    doc.save(`Plan_de_Estudios_${currentMajor}.pdf`);
}

// ---------- 2. PDF · Plan del usuario ----------
async function descargarPdfUsuario() {
    const jsPDF = await dlAsegurarPdf();
    const car = dlInfoCarrera();
    const p = dlPlanUsuario();
    const doc = dlPdfBase(jsPDF, 'landscape', `Mi plan de estudios - ${car.titulo}`, car.detalle || 'Plan personal');
    const W = doc.internal.pageSize.getWidth();

    let y = dlPdfKpis(doc, 100, [
        { valor: p.credAprobados, etiqueta: 'CRÉDITOS APROBADOS', color: DL_COLOR.estado.aprobado.texto },
        { valor: p.credCursando, etiqueta: 'CRÉDITOS CURSANDO', color: DL_COLOR.estado.cursando.texto },
        { valor: p.credPendientes, etiqueta: 'CRÉDITOS PENDIENTES' },
        { valor: p.credTotal, etiqueta: 'TOTAL DE LA CARRERA', color: DL_COLOR.marca },
        { valor: p.ponderado === null ? '-' : p.ponderado.toFixed(2), etiqueta: 'PROMEDIO PONDERADO', color: DL_COLOR.marca },
        { valor: p.ultimoSem === null ? '-' : dlSemCorto(p.ultimoSem), etiqueta: 'ÚLT. SEM. PLANEADO' },
    ]);

    // Barra de avance
    y += 14;
    const anchoBarra = W - 72;
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(36, y, anchoBarra, 10, 5, 5, 'F');
    const aprobado = anchoBarra * p.avance;
    const cursando = anchoBarra * (p.credTotal ? p.credCursando / p.credTotal : 0);
    if (aprobado > 1) { doc.setFillColor(16, 185, 129); doc.roundedRect(36, y, Math.max(aprobado, 8), 10, 5, 5, 'F'); }
    if (cursando > 1) { doc.setFillColor(6, 182, 212); doc.rect(36 + aprobado, y, cursando, 10, 'F'); }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DL_COLOR.gris);
    doc.text(`Avance: ${(p.avance * 100).toFixed(1)}% aprobado  |  ${p.nAprobados} aprobados, ${p.nCursando} cursando, ${p.nReprobados} reprobados, ${p.nPendientes} pendientes  |  ${p.semestres.length} periodos planeados, con veranos (${p.promCredSem.toFixed(1)} créditos por periodo en promedio)`, 36, y + 24);
    y += 42;

    const cols = ['Código', 'Curso', 'Cr.', 'Estado', 'Nota', 'Vs. plan oficial', 'Requisitos'];
    const estiloEstado = (c, d) => {
        const e = DL_COLOR.estado[c.status];
        return { content: DL_ESTADO_TXT[c.status], styles: { fillColor: e.fill, textColor: e.texto, fontStyle: 'bold', halign: 'center' } };
    };
    const filaCurso = (c) => {
        const cod = dlCodigo(c) + (c.isRetry ? ` (intento ${dlIntento(c)})` : '');
        return [
            { content: cod, styles: { fontStyle: 'bold' } },
            c.name, c.cred, estiloEstado(c),
            c.grade !== null && c.grade !== undefined && String(c.grade).trim() !== '' ? c.grade : '',
            dlTiming(c), dlLista(c.reqs),
        ];
    };
    const anchos = { 0: { cellWidth: 80 }, 2: { cellWidth: 30, halign: 'center' }, 3: { cellWidth: 62 }, 4: { cellWidth: 36, halign: 'center' }, 5: { cellWidth: 92 }, 6: { cellWidth: 150 } };

    p.semestres.forEach(g => {
        const dif = g.oficial === null ? '' : `  (oficial: ${g.oficial})`;
        const titulo = `${dlEtiquetaSem(g.sem)}  -  ${g.creditos} créditos planeados${dif}`;
        const pie = [{ content: 'Total del semestre', colSpan: 2, styles: { halign: 'right' } }, g.creditos,
            { content: g.ponderado === null ? '' : `Prom. ponderado: ${g.ponderado.toFixed(2)}`, colSpan: 4, styles: { halign: 'left' } }];
        doc.autoTable({
            ...DL_TABLA_BASE,
            startY: y,
            head: [
                [{ content: titulo, colSpan: cols.length, styles: { fillColor: DL_COLOR.marca, textColor: 255, fontStyle: 'bold', fontSize: 10, halign: 'left' } }],
                cols.map(c => ({ content: c, styles: { fillColor: DL_COLOR.oscuro, textColor: 255, fontStyle: 'bold' } })),
            ],
            body: g.cursos.map(filaCurso),
            foot: [pie],
            showHead: 'everyPage', showFoot: 'lastPage', pageBreak: 'avoid',
            footStyles: { fillColor: DL_COLOR.claro, textColor: [31, 41, 55], fontStyle: 'bold' },
            columnStyles: anchos,
        });
        y = doc.lastAutoTable.finalY + 14;
    });

    if (p.sinAsignar.length) {
        y = dlPdfSeccion(doc, y, `Cursos sin semestre asignado (${p.sinAsignar.length})`, 100);
        doc.autoTable({
            ...DL_TABLA_BASE,
            startY: y,
            head: [['Código', 'Curso', 'Cr.', 'Estado', 'Bloque oficial', 'Requisitos', 'Correquisitos']],
            body: p.sinAsignar.map(c => [
                { content: dlCodigo(c) + (c.isRetry ? ` (intento ${dlIntento(c)})` : ''), styles: { fontStyle: 'bold' } },
                c.name, c.cred, estiloEstado(c), c.block, dlLista(c.reqs), dlLista(c.coreqs)]),
            headStyles: { fillColor: DL_COLOR.oscuro, textColor: 255 },
            columnStyles: { 0: { cellWidth: 74 }, 2: { cellWidth: 26, halign: 'center' }, 3: { cellWidth: 56 }, 4: { cellWidth: 60, halign: 'center' } },
        });
        y = doc.lastAutoTable.finalY + 14;
    }

    dlPdfPies(doc);
    doc.save(`Mi_Plan_${currentMajor}.pdf`);
}

// =============================================================================
// EXCEL (ExcelJS: archivo .xlsx real, con varias hojas, filtros y fórmulas)
// =============================================================================

const DL_XL_NAVY = 'FF1E3A5F';
const DL_XL = {
    marca:   'FF8257E6',
    oscuro:  'FF18181B',
    gris:    'FFF3F4F6',
    blanco:  'FFFFFFFF',
    borde:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

function dlXlEncabezado(fila, color = DL_XL.oscuro) {
    fila.eachCell(cell => {
        cell.font = { bold: true, color: { argb: DL_XL.blanco } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: DL_XL.borde, left: DL_XL.borde, bottom: DL_XL.borde, right: DL_XL.borde };
    });
    fila.height = 22;
}
function dlXlBordes(fila) {
    fila.eachCell({ includeEmpty: true }, cell => {
        cell.border = { top: DL_XL.borde, left: DL_XL.borde, bottom: DL_XL.borde, right: DL_XL.borde };
        cell.alignment = { vertical: 'middle', wrapText: true, horizontal: cell.alignment?.horizontal };
    });
}
function dlXlTitulo(hoja, texto, sub, colFin, color = DL_XL.oscuro) {
    hoja.mergeCells(1, 1, 1, colFin);
    const t = hoja.getCell(1, 1);
    t.value = texto;
    t.font = { bold: true, size: 16, color: { argb: DL_XL.blanco } };
    t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    t.alignment = { vertical: 'middle' };
    hoja.getRow(1).height = 30;
    hoja.mergeCells(2, 1, 2, colFin);
    const s = hoja.getCell(2, 1);
    s.value = sub;
    s.font = { italic: true, color: { argb: 'FF6B7280' } };
}
async function dlGuardarXlsx(wb, nombre) {
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------- 3. Excel · Plan de estudios original ----------
async function descargarExcelOriginal() {
    const ExcelJS = await dlAsegurarExcel();
    const car = dlInfoCarrera();
    const plan = dlPlanOriginal();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'TecPlanner';
    wb.created = new Date();

    // --- Hoja Malla (datos) ---
    const malla = wb.addWorksheet('Malla', { views: [{ state: 'frozen', ySplit: 4 }] });
    dlXlTitulo(malla, `Plan de Estudios - ${car.titulo}`, `Instituto Tecnológico de Costa Rica${car.detalle ? ' · ' + car.detalle : ''}`, plan.tieneHoras ? 8 : 7, DL_XL_NAVY);
    const cabecera = ['Semestre', 'Código', 'Curso', 'Créditos'];
    if (plan.tieneHoras) cabecera.push('Horas');
    cabecera.push('Requisitos', 'Correquisitos', 'Desbloquea (cursos)');
    malla.addRow([]);
    dlXlEncabezado(malla.addRow(cabecera), DL_XL_NAVY);
    const filaCab = 4;
    plan.cursos.forEach((c, i) => {
        const fila = [c.block, c.id, c.name, c.cred];
        if (plan.tieneHoras) fila.push(c.hrs ?? '');
        fila.push(dlLista(c.reqs).replace(/^-$/, ''), dlLista(c.coreqs).replace(/^-$/, ''), plan.desbloquea[c.id].length);
        const r = malla.addRow(fila);
        dlXlBordes(r);
        r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        if (c.block % 2 === 0) r.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }; });
    });
    const ultima = filaCab + plan.cursos.length;
    const anchosMalla = plan.tieneHoras ? [11, 12, 46, 10, 8, 26, 24, 14] : [11, 12, 46, 10, 26, 24, 14];
    anchosMalla.forEach((w, i) => { malla.getColumn(i + 1).width = w; });
    malla.autoFilter = { from: { row: filaCab, column: 1 }, to: { row: ultima, column: anchosMalla.length } };

    // --- Hoja Resumen (fórmulas sobre Malla) ---
    const res = wb.addWorksheet('Resumen');
    dlXlTitulo(res, `Plan de Estudios - ${car.titulo}`, `Instituto Tecnológico de Costa Rica${car.detalle ? ' · ' + car.detalle : ''}`, 4, DL_XL_NAVY);
    res.addRow([]);
    const rango = (col) => `Malla!$${col}$5:$${col}$${ultima}`;
    const nSem = plan.grupos.filter(g => g.bloque > 0).length;
    const datos = [
        ['Carrera', car.titulo],
        ['Grado y plan', car.detalle || '-'],
        ['Créditos totales', { formula: `SUM(${rango('D')})`, result: plan.totalCreditos }],
        ['Cursos', { formula: `COUNTA(${rango('B')})`, result: plan.cursos.length }],
        ['Semestres (sin bloque 0)', nSem],
        ['Créditos por semestre (promedio)', { formula: `IFERROR(B6/B8,0)`, result: nSem ? plan.totalCreditos / nSem : 0 }],
    ];
    datos.forEach(d => {
        const r = res.addRow(d);
        r.getCell(1).font = { bold: true };
        r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DL_XL.gris } };
        dlXlBordes(r);
        r.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
    });
    res.getCell('B9').numFmt = '0.0';
    res.addRow([]);
    dlXlEncabezado(res.addRow(['Semestre', 'Cursos', 'Créditos', '% de la carrera']), DL_XL_NAVY);
    plan.grupos.forEach(g => {
        const fila = res.rowCount + 1;
        const r = res.addRow([
            g.bloque === 0 ? 'Cursos previos al primer semestre' : dlOrdinalSem(g.bloque),
            { formula: `COUNTIF(${rango('A')},${g.bloque})`, result: g.cursos.length },
            { formula: `SUMIF(${rango('A')},${g.bloque},${rango('D')})`, result: g.creditos },
            { formula: `IFERROR(C${fila}/$B$6,0)`, result: plan.totalCreditos ? g.creditos / plan.totalCreditos : 0 },
        ]);
        dlXlBordes(r);
        r.getCell(4).numFmt = '0.0%';
        [2, 3, 4].forEach(i => { r.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' }; });
    });
    [28, 34, 14, 16].forEach((w, i) => { res.getColumn(i + 1).width = w; });
    res.getColumn(2).width = 40;

    res.orderNo = -1;   // Resumen como primera pestaña
    wb.views = [{ activeTab: 0 }];
    await dlGuardarXlsx(wb, `Plan_de_Estudios_${currentMajor}.xlsx`);
}

// ---------- 4. Excel · Plan del usuario ----------
async function descargarExcelUsuario() {
    const ExcelJS = await dlAsegurarExcel();
    const car = dlInfoCarrera();
    const p = dlPlanUsuario();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'TecPlanner';
    wb.created = new Date();

    // Orden de la hoja de datos: por semestre planeado; los sin asignar al final
    const filas = [...p.asignados, ...p.sinAsignar];
    const PRIMERA = 5;                       // primera fila de datos
    const ULTIMA = PRIMERA + filas.length - 1;
    const R = (col) => `'Mi plan'!$${col}$${PRIMERA}:$${col}$${ULTIMA}`;

    // --- Hoja Mi plan (datos editables) ---
    const hoja = wb.addWorksheet('Mi plan', { views: [{ state: 'frozen', ySplit: 4 }] });
    dlXlTitulo(hoja, `Mi plan de estudios - ${car.titulo}`, `${car.detalle ? car.detalle + ' · ' : ''}Generado el ${dlHoy()} · Podés editar Semestre, Estado y Nota: el Resumen y "Por semestre" se recalculan solos.`, 14);
    hoja.addRow([]);
    dlXlEncabezado(hoja.addRow(['Sem. planeado', 'Sem. oficial', 'Diferencia', 'Vs. plan oficial', 'Código', 'Curso', 'Cr.', 'Estado', 'Nota', 'Profesor', 'Modalidad', 'Requisitos', 'Correquisitos', 'Alerta']));
    filas.forEach((c, i) => {
        const n = PRIMERA + i;
        const sem = hasSem(c.userSem) ? Number(c.userSem) : null;
        const dif = sem === null ? '' : sem - c.block;
        const timing = dlTiming(c).replace(/ \(.*\)/, '');
        const nota = c.grade !== null && c.grade !== undefined && String(c.grade).trim() !== '' && !isNaN(c.grade) ? parseFloat(c.grade) : null;
        const r = hoja.addRow([
            sem,
            c.block,
            { formula: `IF(A${n}="","",A${n}-B${n})`, result: dif },
            { formula: `IF(A${n}="","",IF(MOD(A${n},1)<>0,"Verano",IF(C${n}>0,"Atrasado",IF(C${n}<0,"Adelantado","En su bloque"))))`, result: timing },
            dlCodigo(c) + (c.isRetry ? ` (intento ${dlIntento(c)})` : ''),
            c.name, c.cred, DL_ESTADO_TXT[c.status], nota, c.prof || '', c.modalidad || '',
            dlLista(c.reqs).replace(/^-$/, ''), dlLista(c.coreqs).replace(/^-$/, ''),
            (p.anomalias[c.id] || []).join(' | '),
        ]);
        dlXlBordes(r);
        [1, 2, 3, 4, 7, 8, 9].forEach(k => { r.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' }; });
        r.getCell(9).numFmt = '0.##';
        if (p.anomalias[c.id]) { r.getCell(5).font = { bold: true, color: { argb: 'FFB91C1C' } }; r.getCell(14).font = { color: { argb: 'FFB91C1C' } }; }
        r.getCell(8).dataValidation = { type: 'list', allowBlank: false, formulae: ['"Pendiente,Cursando,Aprobado,Reprobado"'] };
        r.getCell(9).dataValidation = { type: 'decimal', operator: 'between', allowBlank: true, formulae: [0, 100], showErrorMessage: true, errorTitle: 'Nota inválida', error: 'Ingresá una nota entre 0 y 100.' };
        r.getCell(11).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Regular,Semipresencial,Virtual"'] };
    });
    [13, 12, 11, 16, 20, 44, 6, 12, 8, 30, 14, 24, 22, 44].forEach((w, i) => { hoja.getColumn(i + 1).width = w; });
    hoja.autoFilter = { from: { row: 4, column: 1 }, to: { row: ULTIMA, column: 14 } };
    // Color por estado (se actualiza si el usuario cambia el Estado)
    Object.entries(DL_ESTADO_TXT).forEach(([clave, txt]) => {
        if (clave === 'pendiente') return;
        const e = DL_COLOR.estado[clave];
        hoja.addConditionalFormatting({
            ref: `H${PRIMERA}:H${ULTIMA}`,
            rules: [{ type: 'expression', formulae: [`$H${PRIMERA}="${txt}"`], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: e.hex } }, font: { color: { argb: e.hexTxt }, bold: true } } }],
        });
    });

    // --- Hoja Por semestre ---
    const por = wb.addWorksheet('Por semestre');
    dlXlTitulo(por, 'Resumen por semestre', 'Créditos planeados vs. oficiales, aprobados y promedio ponderado de cada semestre.', 7);
    por.addRow([]);
    dlXlEncabezado(por.addRow(['Semestre', 'Cursos', 'Créditos planeados', 'Créditos oficiales', 'Diferencia', 'Créditos aprobados', 'Prom. ponderado']), DL_XL.marca);
    p.semestres.forEach(g => {
        const n = por.rowCount + 1;
        const aprob = g.cursos.filter(c => c.status === 'aprobado').reduce((s, c) => s + c.cred, 0);
        const pond = g.ponderado;
        const cond = `(${R('A')}=A${n})*(${R('H')}="Aprobado")*(${R('I')}<>"")`;
        const r = por.addRow([
            g.sem,
            { formula: `COUNTIF(${R('A')},A${n})`, result: g.cursos.length },
            { formula: `SUMIF(${R('A')},A${n},${R('G')})`, result: g.creditos },
            g.oficial === null ? 'Verano' : g.oficial,
            g.oficial === null ? '' : { formula: `C${n}-D${n}`, result: g.creditos - g.oficial },
            { formula: `SUMIFS(${R('G')},${R('A')},A${n},${R('H')},"Aprobado")`, result: aprob },
            { formula: `IFERROR(SUMPRODUCT(${cond}*${R('I')}*${R('G')})/SUMPRODUCT(${cond}*${R('G')}),"")`, result: pond === null ? '' : pond },
        ]);
        dlXlBordes(r);
        [1, 2, 3, 4, 5, 6, 7].forEach(k => { r.getCell(k).alignment = { horizontal: 'center', vertical: 'middle' }; });
        r.getCell(7).numFmt = '0.00';
    });
    const nSin = p.sinAsignar.length;
    const rs = por.addRow(['Sin asignar', { formula: `COUNTBLANK(${R('A')})`, result: nSin }, { formula: `SUMIF(${R('A')},"",${R('G')})`, result: p.sinAsignar.reduce((s, c) => s + c.cred, 0) }, '', '', '', '']);
    dlXlBordes(rs);
    rs.eachCell(c => { c.font = { italic: true, color: { argb: 'FF6B7280' } }; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
    [14, 10, 20, 18, 12, 18, 16].forEach((w, i) => { por.getColumn(i + 1).width = w; });

    // --- Hoja Resumen (primera) ---
    const res = wb.addWorksheet('Resumen');
    dlXlTitulo(res, `Resumen - ${car.titulo}`, `${car.detalle ? car.detalle + ' · ' : ''}Generado el ${dlHoy()}`, 3);
    res.addRow([]);
    const st = R('H'), cr = R('G');
    const cond = `(${st}="Aprobado")*(${R('I')}<>"")`;
    const items = [
        ['Créditos aprobados',  { formula: `SUMIF(${st},"Aprobado",${cr})`, result: p.credAprobados }],
        ['Créditos cursando',   { formula: `SUMIF(${st},"Cursando",${cr})`, result: p.credCursando }],
        ['Créditos reprobados', { formula: `SUMIF(${st},"Reprobado",${cr})`, result: p.todos.filter(c => c.status === 'reprobado').reduce((s, c) => s + c.cred, 0) }],
        ['Créditos de la carrera (plan oficial)', p.credTotal],
        ['Créditos pendientes', { formula: `MAX(0,B8-B5-B6)`, result: p.credPendientes }],
        ['Avance (aprobados / carrera)', { formula: `IFERROR(B5/B8,0)`, result: p.avance }],
        ['Promedio ponderado', { formula: `IFERROR(SUMPRODUCT(${cond}*${R('I')}*${cr})/SUMPRODUCT(${cond}*${cr}),"")`, result: p.ponderado === null ? '' : p.ponderado }],
        ['Cursos aprobados',  { formula: `COUNTIF(${st},"Aprobado")`, result: p.nAprobados }],
        ['Cursos cursando',   { formula: `COUNTIF(${st},"Cursando")`, result: p.nCursando }],
        ['Cursos reprobados', { formula: `COUNTIF(${st},"Reprobado")`, result: p.nReprobados }],
        ['Cursos pendientes', { formula: `COUNTIF(${st},"Pendiente")`, result: p.nPendientes }],
        ['Periodos planeados (incluye veranos)', p.semestres.length],
        ['Último semestre planeado', p.ultimoSem === null ? '' : p.ultimoSem],
        ['Cursos con alertas', Object.keys(p.anomalias).length],
        ['Cursos sin semestre asignado', { formula: `COUNTBLANK(${R('A')})`, result: p.sinAsignar.length }],
    ];
    dlXlEncabezado(res.addRow(['Indicador', 'Valor']), DL_XL.marca);
    items.forEach(it => {
        const r = res.addRow(it);
        r.getCell(1).font = { bold: true };
        r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DL_XL.gris } };
        dlXlBordes(r);
        r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    });
    res.getCell('B10').numFmt = '0.0%';
    res.getCell('B11').numFmt = '0.00';
    res.getColumn(1).width = 40; res.getColumn(2).width = 18; res.getColumn(3).width = 4;

    res.orderNo = -1;   // Resumen como primera pestaña
    wb.views = [{ activeTab: 0 }];
    await dlGuardarXlsx(wb, `Mi_Plan_${currentMajor}.xlsx`);
}