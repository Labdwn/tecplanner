// =============================================================================
// TECPLANNER · horarios.js  (v2 — rediseño completo)
// =============================================================================
// Secciones:
//   1. ESTADO GLOBAL Y CONSTANTES
//   2. UTILIDADES DE HORARIO (parseo / choques)
//   3. PERSISTENCIA (selección, favoritos, filtros, config de grilla)
//   4. INIT Y LAYOUT PRINCIPAL
//   5. FILTROS DE ÁREA (año/período/sede/escuela)
//   6. BÚSQUEDA Y CHIPS DE FILTRO RÁPIDO
//   7. LISTA DE CURSOS DISPONIBLES
//   8. FAVORITOS
//   9. SELECCIÓN DE CURSOS (agregar/quitar/deshacer/limpiar)
//  10. GRILLA SEMANAL (render + preview fantasma + línea de "ahora")
//  11. STATS / RESUMEN
//  12. EXPORTAR HORARIO
// =============================================================================


// =============================================================================
// 1. ESTADO GLOBAL Y CONSTANTES
// =============================================================================

const SEDE_NOMBRES = { CA: 'Cartago', SJ: 'San José', SC: 'San Carlos', AL: 'Alajuela', LM: 'Limón' };
const HOR_PALETTE = ['#8257e6','#06b6d4','#10b981','#f59e0b','#ef4444','#a855f7','#3b82f6','#ec4899','#84cc16','#f97316'];
const DIAS_ORDEN = ['LUN','MAR','MIE','JUE','VIE','SAB'];
const DIA_LABEL = { LUN:'Lunes', MAR:'Martes', MIE:'Miércoles', JUE:'Jueves', VIE:'Viernes', SAB:'Sábado' };
const DIA_JS_MAP = { 1:'LUN', 2:'MAR', 3:'MIE', 4:'JUE', 5:'VIE', 6:'SAB' }; // Date.getDay()
const ICON_USERS = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
const ICON_PROF = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
const ICON_LOC = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

let horGridConfig = { dias: ['LUN','MAR','MIE','JUE','VIE','SAB'], horaIni: 7, horaFin: 21 };
let horariosIndice = null;
let horariosSeleccion = { anio: null, periodo: null, sede: null, escuela: null };
let horEscuelasDisponibles = {};
let horariosCursosDisponibles = [];
let horariosCursosElegidos = []; // { curso, grupo, color }
let horariosBusqueda = '';
let horariosFavoritos = new Set();   // "codigo::grupo"
let horHoverPreview = null;          // { curso, grupo } — grupo bajo el mouse (aún no elegido)
let horUltimoEliminado = null;       // para "deshacer"
let horUndoTimer = null;
let horFiltros = { favoritos: false, sinChoques: false };
let horFiltroDias = new Set();       // días activos en los chips de filtro (distinto de horGridConfig.dias)
let horCursosColapsados = new Set(); // códigos de curso plegados


function nombreSede(codigo) { return SEDE_NOMBRES[codigo] || codigo; }
function nombrePeriodo(p) {
    if (p.endsWith('V')) return `Verano ${p.slice(0, -1)}`;
    return `Semestre ${p}`;
}


// =============================================================================
// 2. UTILIDADES DE HORARIO
// =============================================================================

function parseHorario(horarioStr) {
    if (!horarioStr) return [];
    const bloques = [];
    const regex = /([A-Z]+)\[(\d{2}:\d{2})-(\d{2}:\d{2})\]/g;
    let m;
    while ((m = regex.exec(horarioStr)) !== null) {
        bloques.push({ dia: m[1], inicio: m[2], fin: m[3] });
    }
    return bloques;
}

function horasAMin(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

function bloquesChocan(a, b) {
    if (a.dia !== b.dia) return false;
    return horasAMin(a.inicio) < horasAMin(b.fin) && horasAMin(b.inicio) < horasAMin(a.fin);
}

// Evalúa si un horario candidato (string) chocaría con la selección actual.
// Devuelve { choca, contras: [{curso, grupo}] } sin modificar nada.
function evaluarChoqueCandidato(horarioStr) {
    const bloquesCandidato = parseHorario(horarioStr);
    const contras = [];
    horariosCursosElegidos.forEach(s => {
        const bloquesExist = parseHorario(s.grupo.horario);
        const choca = bloquesCandidato.some(a => bloquesExist.some(b => bloquesChocan(a, b)));
        if (choca) contras.push(s);
    });
    return { choca: contras.length > 0, contras };
}


// =============================================================================
// 3. PERSISTENCIA
// =============================================================================

function restoreHorSeleccion() {
    try { horariosCursosElegidos = JSON.parse(localStorage.getItem('TecPlanner_HorSeleccion') || '[]'); }
    catch { horariosCursosElegidos = []; }

    try { horariosFavoritos = new Set(JSON.parse(localStorage.getItem('TecPlanner_HorFavoritos') || '[]')); }
    catch { horariosFavoritos = new Set(); }

    try {
        const savedFiltros = JSON.parse(localStorage.getItem('TecPlanner_HorFiltrosSel') || 'null');
        if (savedFiltros) horariosSeleccion = savedFiltros;
    } catch { /* noop */ }

    try {
        const savedGrid = JSON.parse(localStorage.getItem('TecPlanner_HorGridConfig') || 'null');
        if (savedGrid) horGridConfig = savedGrid;
    } catch { /* noop */ }
}
function saveHorSeleccion() {
    localStorage.setItem('TecPlanner_HorSeleccion', JSON.stringify(horariosCursosElegidos));
}
function saveHorFavoritos() {
    localStorage.setItem('TecPlanner_HorFavoritos', JSON.stringify([...horariosFavoritos]));
}
function saveHorFiltrosSel() {
    localStorage.setItem('TecPlanner_HorFiltrosSel', JSON.stringify(horariosSeleccion));
}
function saveHorGridConfig() {
    localStorage.setItem('TecPlanner_HorGridConfig', JSON.stringify(horGridConfig));
}


// =============================================================================
// 4. INIT Y LAYOUT PRINCIPAL
// =============================================================================

async function initHorarios() {
    const view = document.getElementById('horariosView');
    view.innerHTML = `<div class="hor-empty hor-empty-loading">⏳ Cargando índice de horarios...</div>`;

    if (!horariosIndice) {
        try {
            const res = await fetch('scraper/output/indice.json');
            horariosIndice = await res.json();
        } catch (e) {
            view.innerHTML = `<div class="hor-empty" style="color:#ef4444;">⚠️ No se pudo cargar el índice de horarios. Verificá tu conexión e intentá de nuevo.</div>`;
            return;
        }
    }
    restoreHorSeleccion();
    renderHorariosLayout();

    // Si había una selección guardada de año/período/sede/escuela, restaurarla.
    setTimeout(restaurarFiltrosGuardados, 0);
}

function renderHorariosLayout() {
    const view = document.getElementById('horariosView');
    const anios = horariosIndice ? Object.keys(horariosIndice).sort() : [];

    view.innerHTML = `
        <div class="hor-container">

            <div class="hor-topbar">
                <h2 class="hor-title">📅 GENERAR HORARIO</h2>
                <div class="hor-stats" id="horStats">
                    <div class="hor-stat">
                        <span class="hor-stat-num" id="horStatCursos">0</span>
                        <span class="hor-stat-label">Cursos</span>
                    </div>
                    <div class="hor-stat">
                        <span class="hor-stat-num" id="horStatCreditos">0</span>
                        <span class="hor-stat-label">Créditos</span>
                    </div>
                    <div class="hor-stat hor-stat-warn" id="horStatChoques" style="display:none;">
                        <span class="hor-stat-num" id="horStatChoquesNum">0</span>
                        <span class="hor-stat-label">Choques</span>
                    </div>
                </div>
            </div>

            

            <div class="hor-filtros">
                <select id="horAnio" class="list-select" onchange="onHorFiltroChange()">
                    <option value="">Año</option>
                    ${anios.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
                <select id="horPeriodo" class="list-select" onchange="onHorFiltroChange()"><option value="">Período</option></select>
                <select id="horSede" class="list-select" onchange="onHorFiltroChange()"><option value="">Sede</option></select>
                <div class="hor-escuela-combo" id="horEscuelaCombo">
                    <input type="text" id="horEscuelaInput" class="list-select" placeholder="Escuela" autocomplete="off"
                           oninput="filterEscuelaOptions(this.value)" onfocus="showEscuelaDropdown()" disabled>
                    <div id="horEscuelaDropdown" class="hor-escuela-dropdown"></div>
                </div>
            </div>

            <div class="hor-search-row">
                <div class="search-container" style="flex:1; min-width:220px;">
                    <input type="text" id="horBusqueda" class="search-input hor-search"
                           placeholder="🔍 Buscar curso por nombre o código..." oninput="filterHorCursos(this.value)">
                </div>
                <div class="hor-chips" id="horChips">
                    <button class="hor-chip" data-chip="favoritos" onclick="toggleHorChip('favoritos')">⭐ Favoritos</button>
                    <button class="hor-chip" data-chip="sinChoques" onclick="toggleHorChip('sinChoques')">✅ Sin choques</button>
                    ${DIAS_ORDEN.map(d => `<button class="hor-chip hor-chip-day" data-day="${d}" onclick="toggleHorDiaFiltro('${d}')">${DIA_LABEL[d].slice(0,3)}</button>`).join('')}
                </div>
            </div>

            <div class="hor-layout">
                <div id="horListaCursos" class="hor-lista"><div class="hor-empty">Elegí sede y escuela para ver cursos.</div></div>
                <div class="hor-sidebar">
                    <div class="hor-sidebar-actions">
                        <button class="hor-btn-ghost" id="horBtnUndo" style="display:none;" onclick="undoRemoveHorCurso()">↩ Deshacer</button>
                        <button class="btn-export" onclick="exportHorarioComoImagen()">🖼️ PNG</button>
                        <button class="btn-export" onclick="exportHorarioComoPDF()">📄 PDF</button>
                        <button class="btn-export" onclick="exportHorarioJSON()">💾 GUARDAR</button>
                        <label class="btn-export" style="cursor:pointer;">
                            📂 CARGAR
                            <input type="file" accept=".json" style="display:none;" onchange="importHorarioJSON(event)">
                        </label>
                        <button class="btn-action" id="horBtnLimpiar" style="border-color:#ef4444; color:#ef4444;" onclick="confirmClearHorario()">
                            🗑️ LIMPIAR
                        </button>
                    </div>
                    <div class="hor-grid-controls">
                        <div class="hor-days-toggle">
                            ${DIAS_ORDEN.map(d => `
                                <button class="hor-day-btn ${horGridConfig.dias.includes(d) ? 'active' : ''}"
                                    onclick="toggleHorDia('${d}')" title="Mostrar/ocultar ${DIA_LABEL[d]}">${DIA_LABEL[d].slice(0,3)}</button>`).join('')}
                        </div>
                        <div class="hor-hours-range">
                            <label>De</label>
                            <select id="horHoraIni" class="list-select" onchange="onHorHoraChange()">
                                ${buildHoraOptions(horGridConfig.horaIni)}
                            </select>
                            <label>a</label>
                            <select id="horHoraFin" class="list-select" onchange="onHorHoraChange()">
                                ${buildHoraOptions(horGridConfig.horaFin)}
                            </select>
                        </div>
                    </div>
                    <div id="horGrid" class="hor-grid-wrap"></div>
                    <div id="horChoques"></div>
                    
                </div>
            </div>
        </div>`;

    renderHorarioGrid();
    renderSeleccionados();
    updateHorStats();
    updateChipsUI();
}

function buildHoraOptions(selected) {
    let opts = '';
    for (let h = 5; h <= 23; h++) {
        opts += `<option value="${h}" ${h === selected ? 'selected' : ''}>${String(h).padStart(2,'0')}:00</option>`;
    }
    return opts;
}

function toggleHorDia(d) {
    const idx = horGridConfig.dias.indexOf(d);
    if (idx !== -1) {
        if (horGridConfig.dias.length === 1) return; // al menos un día
        horGridConfig.dias.splice(idx, 1);
    } else {
        horGridConfig.dias.push(d);
        horGridConfig.dias.sort((a, b) => DIAS_ORDEN.indexOf(a) - DIAS_ORDEN.indexOf(b));
    }
    document.querySelectorAll('.hor-day-btn').forEach(btn => {
        const dia = DIAS_ORDEN.find(x => DIA_LABEL[x].slice(0,3) === btn.textContent);
        btn.classList.toggle('active', horGridConfig.dias.includes(dia));
    });
    saveHorGridConfig();
    renderHorarioGrid();
}

function onHorHoraChange() {
    const ini = parseInt(document.getElementById('horHoraIni').value);
    const fin = parseInt(document.getElementById('horHoraFin').value);
    if (ini >= fin) { alert('La hora de inicio debe ser menor a la de fin.'); return; }
    horGridConfig.horaIni = ini;
    horGridConfig.horaFin = fin;
    saveHorGridConfig();
    renderHorarioGrid();
}


// =============================================================================
// 5. FILTROS DE ÁREA (año/período/sede/escuela)
// =============================================================================

function onHorFiltroChange() {
    const anio = document.getElementById('horAnio').value;
    const periodoSel = document.getElementById('horPeriodo');
    const sedeSel = document.getElementById('horSede');
    const escInput = document.getElementById('horEscuelaInput');

    if (anio !== horariosSeleccion.anio) {
        horariosSeleccion = { anio, periodo: null, sede: null, escuela: null };
        const periodos = anio ? Object.keys(horariosIndice[anio]) : [];
        periodoSel.innerHTML = `<option value="">Período</option>` + periodos.map(p => `<option value="${p}">${nombrePeriodo(p)}</option>`).join('');
        sedeSel.innerHTML = `<option value="">Sede</option>`;
        horEscuelasDisponibles = {};
        escInput.value = '';
        escInput.disabled = true;
        saveHorFiltrosSel();
        return;
    }
    const periodo = periodoSel.value;
    if (periodo !== horariosSeleccion.periodo) {
        horariosSeleccion.periodo = periodo;
        horariosSeleccion.sede = null;
        horariosSeleccion.escuela = null;
        const sedes = (anio && periodo) ? Object.keys(horariosIndice[anio][periodo].sedes) : [];
        sedeSel.innerHTML = `<option value="">Sede</option>` + sedes.map(s => `<option value="${s}">${nombreSede(s)}</option>`).join('');
        horEscuelasDisponibles = {};
        escInput.value = '';
        escInput.disabled = true;
        saveHorFiltrosSel();
        return;
    }
    const sede = sedeSel.value;
    horariosSeleccion.sede = sede;
    horariosSeleccion.escuela = null;
    horEscuelasDisponibles = (anio && periodo && sede) ? horariosIndice[anio][periodo].sedes[sede] : {};
    escInput.value = '';
    escInput.disabled = Object.keys(horEscuelasDisponibles).length === 0;
    document.getElementById('horListaCursos').innerHTML = `<div class="hor-empty">Elegí sede y escuela para ver cursos.</div>`;
    saveHorFiltrosSel();
}

function showEscuelaDropdown() {
    filterEscuelaOptions(document.getElementById('horEscuelaInput').value);
}

function filterEscuelaOptions(q) {
    const dd = document.getElementById('horEscuelaDropdown');
    const query = q.trim().toLowerCase();
    const entries = Object.entries(horEscuelasDisponibles)
        .filter(([cod, nom]) => !query || nom.toLowerCase().includes(query) || cod.toLowerCase().includes(query));

    dd.innerHTML = entries.length === 0
        ? `<div class="hor-escuela-opt hor-escuela-empty">Sin resultados</div>`
        : entries.map(([cod, nom]) => `<div class="hor-escuela-opt" onmousedown="selectEscuelaOption('${cod}')">${nom}</div>`).join('');
    dd.style.display = 'block';
}

function selectEscuelaOption(cod) {
    const nombre = horEscuelasDisponibles[cod];
    document.getElementById('horEscuelaInput').value = nombre || '';
    document.getElementById('horEscuelaDropdown').style.display = 'none';
    horariosSeleccion.escuela = cod;
    saveHorFiltrosSel();
    onHorEscuelaChange();
}

document.addEventListener('click', (e) => {
    const combo = document.getElementById('horEscuelaCombo');
    if (combo && !combo.contains(e.target)) {
        const dd = document.getElementById('horEscuelaDropdown');
        if (dd) dd.style.display = 'none';
    }
});

async function onHorEscuelaChange() {
    const { anio, periodo, sede, escuela } = horariosSeleccion;
    if (!anio || !periodo || !sede || !escuela) return;

    const cont = document.getElementById('horListaCursos');
    cont.innerHTML = `<div class="hor-empty hor-empty-loading">⏳ Cargando cursos...</div>`;

    try {
        const res = await fetch(`scraper/data/${anio}/${periodo}/${sede}/${escuela}.json`);
        const data = await res.json();
        horariosCursosDisponibles = data.cursos || [];
        renderHorariosCursos();
    } catch (e) {
        cont.innerHTML = `<div class="hor-empty" style="color:#ef4444;">⚠️ No se encontraron cursos para esa combinación.</div>`;
    }
}

// Intenta restaurar automáticamente año/período/sede/escuela de la última visita.
function restaurarFiltrosGuardados() {
    const { anio, periodo, sede, escuela } = horariosSeleccion;
    if (!anio || !horariosIndice || !horariosIndice[anio]) return;

    const anioSel = document.getElementById('horAnio');
    if (!anioSel) return;
    anioSel.value = anio;

    const periodos = Object.keys(horariosIndice[anio]);
    const periodoSel = document.getElementById('horPeriodo');
    periodoSel.innerHTML = `<option value="">Período</option>` + periodos.map(p => `<option value="${p}">${nombrePeriodo(p)}</option>`).join('');
    if (!periodo || !horariosIndice[anio][periodo]) return;
    periodoSel.value = periodo;

    const sedes = Object.keys(horariosIndice[anio][periodo].sedes);
    const sedeSel = document.getElementById('horSede');
    sedeSel.innerHTML = `<option value="">Sede</option>` + sedes.map(s => `<option value="${s}">${nombreSede(s)}</option>`).join('');
    if (!sede || !horariosIndice[anio][periodo].sedes[sede]) return;
    sedeSel.value = sede;

    const escuelas = horariosIndice[anio][periodo].sedes[sede];
    horEscuelasDisponibles = escuelas;
    const escInput = document.getElementById('horEscuelaInput');
    escInput.disabled = false;
    if (!escuela || !escuelas[escuela]) return;
    escInput.value = escuelas[escuela];

    onHorEscuelaChange();
}


// =============================================================================
// 6. BÚSQUEDA Y CHIPS DE FILTRO RÁPIDO
// =============================================================================

function filterHorCursos(q) {
    horariosBusqueda = q;
    renderHorariosCursos();
}

function toggleHorChip(name) {
    horFiltros[name] = !horFiltros[name];
    updateChipsUI();
    renderHorariosCursos();
}

function toggleHorDiaFiltro(dia) {
    if (horFiltroDias.has(dia)) horFiltroDias.delete(dia);
    else horFiltroDias.add(dia);
    updateChipsUI();
    renderHorariosCursos();
}

function updateChipsUI() {
    const favBtn = document.querySelector('.hor-chip[data-chip="favoritos"]');
    const choquesBtn = document.querySelector('.hor-chip[data-chip="sinChoques"]');
    if (favBtn) favBtn.classList.toggle('active', horFiltros.favoritos);
    if (choquesBtn) choquesBtn.classList.toggle('active', horFiltros.sinChoques);
    document.querySelectorAll('.hor-chip-day').forEach(btn => {
        btn.classList.toggle('active', horFiltroDias.has(btn.dataset.day));
    });
}


// =============================================================================
// 7. LISTA DE CURSOS DISPONIBLES
// =============================================================================

function isGrupoElegido(codigo, grupoId) {
    return horariosCursosElegidos.some(s => s.curso.codigo === codigo && s.grupo.grupo === grupoId);
}

function renderHorariosCursos() {
    const cont = document.getElementById('horListaCursos');
    const q = horariosBusqueda.toLowerCase();

    const filtrados = horariosCursosDisponibles
        .filter(c => !q || c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q))
        .slice()
        .sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true }))
        .map(c => {
            let grupos = ordenarGrupos(c.grupos);

            if (horFiltroDias.size > 0) {
                grupos = grupos.filter(g => {
                    if (isGrupoElegido(c.codigo, g.grupo)) return true; // nunca ocultar lo ya elegido
                    const bloques = parseHorario(g.horario);
                    return bloques.some(b => horFiltroDias.has(b.dia));
                });
            }
            if (horFiltros.sinChoques) {
                grupos = grupos.filter(g => {
                    if (isGrupoElegido(c.codigo, g.grupo)) return true;
                    return !evaluarChoqueCandidato(g.horario).choca;
                });
            }
            if (horFiltros.favoritos) {
                grupos = grupos.filter(g => isGrupoFavorito(c.codigo, g.grupo) || isGrupoElegido(c.codigo, g.grupo));
            }
            return { ...c, grupos };
        })
        .filter(c => c.grupos.length > 0);

    if (filtrados.length === 0) {
        cont.innerHTML = `<div class="hor-empty">😕 Sin cursos que coincidan con los filtros actuales.</div>`;
        return;
    }

    cont.innerHTML = filtrados.map(c => {
        const colapsado = horCursosColapsados.has(c.codigo);
        return `
        <div class="hor-curso-block">
            <div class="hor-curso-title hor-curso-title-toggle" onclick="toggleHorCursoColapso('${c.codigo}')">
                <svg class="hor-curso-arrow ${colapsado ? 'is-collapsed' : ''}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                <span>${c.codigo} - ${c.nombre}</span>
            </div>
            <div class="hor-curso-meta">${c.creditos} Créditos · ${c.grupos.length} grupo${c.grupos.length !== 1 ? 's' : ''}</div>
            <div class="hor-grupos-grid" style="${colapsado ? 'display:none;' : ''}">
                ${c.grupos.map(g => {
                    const elegido = isGrupoElegido(c.codigo, g.grupo);
                    const favorito = isGrupoFavorito(c.codigo, g.grupo);
                    const otroElegido = !elegido && horariosCursosElegidos.some(s => s.curso.codigo === c.codigo && s.grupo.grupo !== g.grupo);
                    const { choca, contras } = (elegido || otroElegido) ? { choca: false, contras: [] } : evaluarChoqueCandidato(g.horario);
                    const contrasTxt = contras.map(s => `${s.curso.codigo} (Gr.${s.grupo.grupo})`).join(', ');
                    return `
                    <div class="hor-grupo-card ${elegido ? 'is-selected' : ''} ${choca ? 'has-choque' : ''} ${otroElegido ? 'is-disabled' : ''}"
                         onmouseenter="previewHorGrupo(${JSON.stringify(c.codigo)}, ${JSON.stringify(g.grupo)}, true)"
                         onmouseleave="previewHorGrupo(${JSON.stringify(c.codigo)}, ${JSON.stringify(g.grupo)}, false)">
                        <div class="hor-grupo-top">
                            <span class="hor-grupo-badge">Grupo ${g.grupo}</span>
                            ${choca ? `<span class="hor-choque-badge" data-tooltip="Choca con: ${contrasTxt}">⚠️</span>` : ''}
                            <button class="hor-fav-btn ${favorito ? 'is-fav' : ''}"
                                onclick='toggleHorFavorito(${JSON.stringify(c.codigo)}, ${JSON.stringify(g.grupo)})'
                                title="${favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}">${favorito ? '★' : '☆'}</button>
                            <span class="hor-grupo-modalidad">${g.modalidad || ''}</span>
                        </div>
                        <div class="hor-grupo-line hor-grupo-prof">
                            👤 ${g.profesor || 'Sin profesor'}
                            ${buscarUrlProfesor(g.profesor) ? `<button class="hor-prof-btn" title="Ver calificaciones en MisProfesores"
                                onclick='event.stopPropagation(); abrirPanelProfesor(${JSON.stringify(g.profesor)}, ${JSON.stringify(buscarUrlProfesor(g.profesor))})'>⭐</button>` : ''}
                        </div>
                        <div class="hor-grupo-line">🕐 ${g.horario || 'Sin horario definido'}</div>
                        ${g.aula ? `<div class="hor-grupo-line">📍 ${g.edificio ? `${g.edificio}-${g.aula}` : g.aula}</div>` : ''}
                         <button class="hor-btn-select ${elegido ? 'is-selected' : ''}"
                            onclick='toggleHorCurso(${JSON.stringify(c.codigo)}, ${JSON.stringify(g.grupo)})'
                            ${otroElegido ? 'disabled' : ''}>
                            ${elegido ? '✓ Seleccionado' : otroElegido ? '🔒 Otro grupo elegido' : (choca ? '⚠️ Agregar de todos modos' : 'Seleccionar')}
                        </button>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');
}

function toggleHorCursoColapso(codigo) {
    if (horCursosColapsados.has(codigo)) horCursosColapsados.delete(codigo);
    else horCursosColapsados.add(codigo);
    renderHorariosCursos();
}


// =============================================================================
// 8. FAVORITOS
// =============================================================================

function favKey(codigo, grupoId) { return `${codigo}::${grupoId}`; }
function isGrupoFavorito(codigo, grupoId) { return horariosFavoritos.has(favKey(codigo, grupoId)); }

function toggleHorFavorito(codigo, grupoId) {
    const key = favKey(codigo, grupoId);
    if (horariosFavoritos.has(key)) horariosFavoritos.delete(key);
    else horariosFavoritos.add(key);
    saveHorFavoritos();
    renderHorariosCursos();
}


// =============================================================================
// 9. SELECCIÓN DE CURSOS
// =============================================================================

function toggleHorCurso(codigo, grupoId) {
    const idx = horariosCursosElegidos.findIndex(s => s.curso.codigo === codigo && s.grupo.grupo === grupoId);
    if (idx !== -1) {
        removeHorCurso(codigo, grupoId);
        return;
    }

    const otroGrupo = horariosCursosElegidos.find(s => s.curso.codigo === codigo && s.grupo.grupo !== grupoId);
    if (otroGrupo) {
        alert(`Ya tenés el Grupo ${otroGrupo.grupo.grupo} de ${codigo} seleccionado.\nQuitalo primero si querés elegir otro grupo.`);
        return;
    }

    const curso = horariosCursosDisponibles.find(c => c.codigo === codigo);
    const grupo = curso.grupos.find(g => g.grupo === grupoId);
    const usedColors = horariosCursosElegidos.map(s => s.color);
    const color = HOR_PALETTE.find(c => !usedColors.includes(c)) || HOR_PALETTE[horariosCursosElegidos.length % HOR_PALETTE.length];
    horariosCursosElegidos.push({ curso: { codigo: curso.codigo, nombre: curso.nombre, creditos: curso.creditos }, grupo, color });

    saveHorSeleccion();
    renderHorariosCursos();
    renderHorarioGrid();
    renderSeleccionados();
    updateHorStats();
}

function removeHorCurso(codigo, grupoId) {
    const item = horariosCursosElegidos.find(s => s.curso.codigo === codigo && s.grupo.grupo === grupoId);
    if (item) {
        horUltimoEliminado = item;
        mostrarBotonDeshacer();
    }
    horariosCursosElegidos = horariosCursosElegidos.filter(s => !(s.curso.codigo === codigo && s.grupo.grupo === grupoId));
    saveHorSeleccion();
    renderHorariosCursos();
    renderHorarioGrid();
    renderSeleccionados();
    updateHorStats();
}

function mostrarBotonDeshacer() {
    const btn = document.getElementById('horBtnUndo');
    if (!btn) return;
    btn.style.display = 'inline-flex';
    clearTimeout(horUndoTimer);
    horUndoTimer = setTimeout(() => { btn.style.display = 'none'; horUltimoEliminado = null; }, 6000);
}

function undoRemoveHorCurso() {
    if (!horUltimoEliminado) return;
    const yaExiste = isGrupoElegido(horUltimoEliminado.curso.codigo, horUltimoEliminado.grupo.grupo);
    if (!yaExiste) horariosCursosElegidos.push(horUltimoEliminado);
    horUltimoEliminado = null;
    document.getElementById('horBtnUndo').style.display = 'none';
    clearTimeout(horUndoTimer);

    saveHorSeleccion();
    renderHorariosCursos();
    renderHorarioGrid();
    renderSeleccionados();
    updateHorStats();
}

function confirmClearHorario() {
    if (horariosCursosElegidos.length === 0) return;
    if (!confirm('¿Quitar todos los cursos seleccionados de este horario?')) return;
    horariosCursosElegidos = [];
    saveHorSeleccion();
    renderHorariosCursos();
    renderHorarioGrid();
    renderSeleccionados();
    updateHorStats();
}

function detectarChoques() {
    const todos = [];
    horariosCursosElegidos.forEach(s => {
        parseHorario(s.grupo.horario).forEach(b => todos.push({ ...b, ref: s }));
    });
    const choques = [];
    for (let i = 0; i < todos.length; i++) {
        for (let j = i + 1; j < todos.length; j++) {
            if (todos[i].ref === todos[j].ref) continue;
            if (bloquesChocan(todos[i], todos[j])) choques.push([todos[i], todos[j]]);
        }
    }
    return choques;
}


// =============================================================================
// 10. GRILLA SEMANAL
// =============================================================================

function previewHorGrupo(codigo, grupoId, show) {
    if (isGrupoElegido(codigo, grupoId)) return; // ya está en la grilla, no hace falta preview
    if (show) {
        const curso = horariosCursosDisponibles.find(c => c.codigo === codigo);
        const grupo = curso?.grupos.find(g => g.grupo === grupoId);
        if (!grupo) return;
        horHoverPreview = { curso: { codigo: curso.codigo, nombre: curso.nombre, creditos: curso.creditos }, grupo };
    } else {
        horHoverPreview = null;
    }
    renderHorarioGrid();
}

function renderHorarioGrid() {
    const wrap = document.getElementById('horGrid');
    if (!wrap) return;

    const todosBloques = [];
    horariosCursosElegidos.forEach(s => {
        parseHorario(s.grupo.horario).forEach(b => todosBloques.push({ ...b, ref: s }));
    });

    const bloquesPreview = [];
    if (horHoverPreview) {
        parseHorario(horHoverPreview.grupo.horario).forEach(b => bloquesPreview.push({ ...b, ref: horHoverPreview }));
    }

    const dias = horGridConfig.dias;
    const minH = horGridConfig.horaIni;
    const maxH = horGridConfig.horaFin;
    const totalHoras = maxH - minH;
    const choques = detectarChoques();
    const chocaIds = new Set();
    choques.forEach(([a, b]) => { chocaIds.add(a); chocaIds.add(b); });

    let html = `<div class="hor-week-grid" style="grid-template-columns:38px repeat(${dias.length}, 1fr); grid-template-rows:22px repeat(${totalHoras * 2}, 1fr);">`;
    html += `<div class="hor-cell-header" style="grid-column:1; grid-row:1;"></div>`;
    dias.forEach((d, i) => html += `<div class="hor-cell-header" style="grid-column:${i+2}; grid-row:1;">${DIA_LABEL[d].slice(0,3)}</div>`);

    for (let h = minH; h < maxH; h++) {
        const row = 2 + (h - minH) * 2;
        html += `<div class="hor-time-label" style="grid-column:1; grid-row:${row}/span 2;">${String(h).padStart(2,'0')}:00</div>`;
        dias.forEach((d, i) => {
            html += `<div class="hor-cell" style="grid-column:${i+2}; grid-row:${row}/span 2;"></div>`;
        });
    }

    // Línea de "ahora"
    const ahora = new Date();
    const diaHoy = DIA_JS_MAP[ahora.getDay()];
    const horaActualFloat = ahora.getHours() + ahora.getMinutes() / 60;
    if (diaHoy && dias.includes(diaHoy) && horaActualFloat >= minH && horaActualFloat < maxH) {
        const rowNow = 2 + Math.round((horaActualFloat - minH) * 2);
        const colNow = dias.indexOf(diaHoy) + 2;
        html += `<div class="hor-now-line" style="grid-column:2/-1; grid-row:${rowNow};"></div>`;
        html += `<div class="hor-now-dot" style="grid-column:${colNow}; grid-row:${rowNow};" title="Ahora: ${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}"></div>`;
    }

    const pintarBloque = (b, esPreview) => {
        const col = dias.indexOf(b.dia);
        if (col === -1) return '';
        const bIniH = horasAMin(b.inicio) / 60;
        const bFinH = horasAMin(b.fin) / 60;
        if (bFinH <= minH || bIniH >= maxH) return '';
        const startRow = 2 + Math.round((Math.max(bIniH, minH) - minH) * 2);
        const endRow = 2 + Math.round((Math.min(bFinH, maxH) - minH) * 2);
        const isChoque = !esPreview && chocaIds.has(b);
        const claseExtra = esPreview ? 'hor-block-preview' : (isChoque ? 'is-choque' : '');
        const color = esPreview ? '#ffffff' : (isChoque ? '#ef4444' : b.ref.color);
        const span = endRow - startRow;
        const extra = !esPreview && span >= 2
            ? `<div class="hor-block-extra">
                 <div class="hor-block-extra-line">${ICON_USERS}${b.ref.grupo.grupo}${b.ref.grupo.aula ? ` · ${ICON_LOC}${b.ref.grupo.edificio ? `${b.ref.grupo.edificio}-${b.ref.grupo.aula}` : b.ref.grupo.aula}` : ''}</div>
                 ${b.ref.grupo.profesor ? `<div class="hor-block-extra-line">${ICON_PROF}<span>${abreviarProfesor(b.ref.grupo.profesor)}</span></div>` : ''}
               </div>`
            : '';
        const controles = !esPreview ? `
                <button class="hor-block-remove" title="Quitar"
                    onclick='event.stopPropagation(); removeHorCurso(${JSON.stringify(b.ref.curso.codigo)}, ${JSON.stringify(b.ref.grupo.grupo)})'>✕</button>
                <input type="color" class="hor-block-colorpick" value="${b.ref.color}" title="Cambiar color"
                    onclick="event.stopPropagation()"
                    onchange='setHorColor(${JSON.stringify(b.ref.curso.codigo)}, ${JSON.stringify(b.ref.grupo.grupo)}, this.value)'>`
            : '';
        return `
            <div class="hor-block ${claseExtra}"
                 style="grid-column:${col+2}; grid-row:${startRow}/${endRow}; --block-color:${color};">
                ${controles}
                <div class="hor-block-code">${b.ref.curso.nombre}</div>
                <div class="hor-block-time">${b.inicio}-${b.fin}</div>
                ${extra}
            </div>`;
    };

    todosBloques.forEach(b => { html += pintarBloque(b, false); });
    bloquesPreview.forEach(b => { html += pintarBloque(b, true); });

    html += `</div>`;
    wrap.innerHTML = html;

    const choquesEl = document.getElementById('horChoques');
    choquesEl.innerHTML = choques.length > 0
        ? `<div class="hor-warning">⚠️ ${choques.length} choque${choques.length !== 1 ? 's' : ''} de horario detectado${choques.length !== 1 ? 's' : ''}</div>`
        : '';

    updateHorStats();
}


// =============================================================================
// 11. STATS / RESUMEN
// =============================================================================

function updateHorStats() {
    const cursosEl = document.getElementById('horStatCursos');
    const credsEl = document.getElementById('horStatCreditos');
    const choquesWrap = document.getElementById('horStatChoques');
    const choquesNum = document.getElementById('horStatChoquesNum');
    if (!cursosEl) return;

    const totalCreds = horariosCursosElegidos.reduce((s, x) => s + (x.curso.creditos || 0), 0);
    cursosEl.textContent = horariosCursosElegidos.length;
    credsEl.textContent = totalCreds;

    const choques = detectarChoques();
    if (choques.length > 0) {
        choquesWrap.style.display = 'flex';
        choquesNum.textContent = choques.length;
    } else {
        choquesWrap.style.display = 'none';
    }
}

function renderSeleccionados() { /* panel eliminado: controles ahora viven en cada bloque de la grilla */ }

function setHorColor(codigo, grupoId, color) {
    const item = horariosCursosElegidos.find(s => s.curso.codigo === codigo && s.grupo.grupo === grupoId);
    if (!item) return;
    item.color = color;
    saveHorSeleccion();
    renderHorariosCursos();
    renderHorarioGrid();
    renderSeleccionados();
}

function ordenarGrupos(grupos) {
    return [...grupos].sort((a, b) => parseInt(a.grupo) - parseInt(b.grupo));
}


// =============================================================================
// 12. EXPORTAR HORARIO
// =============================================================================

function exportHorarioImagen() {
    if (horariosCursosElegidos.length === 0) { alert('Primero seleccioná al menos un curso.'); return; }

    const PALETTE_EXPORT = HOR_PALETTE;
    const DAY_COL = { LUN:2, MAR:3, MIE:4, JUE:5, VIE:6, SAB:7 };

    let minH = 22, maxH = 7;
    horariosCursosElegidos.forEach(s => {
        parseHorario(s.grupo.horario).forEach(b => {
            const sh = parseInt(b.inicio.split(':')[0]);
            const eh = parseInt(b.fin.split(':')[0]);
            if (sh < minH) minH = sh;
            if (eh > maxH) maxH = eh;
        });
    });
    if (minH > maxH) { minH = 7; maxH = 21; }
    minH = Math.max(5, minH - 1);
    maxH = Math.min(23, maxH + 1);

    const STEP_MIN = 10;
    const STEPS_PER_H = 60 / STEP_MIN;
    const TOTAL_STEPS = (maxH - minH) * STEPS_PER_H;

    function timeToRow(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return 2 + (h - minH) * STEPS_PER_H + Math.round(m / STEP_MIN);
    }

    const diasUsados = new Set();
    horariosCursosElegidos.forEach(s => parseHorario(s.grupo.horario).forEach(b => diasUsados.add(b.dia)));
    const diasActivos = DIAS_ORDEN.filter(d => diasUsados.size === 0 || diasUsados.has(d));
    const diasFinal = diasActivos.length > 0 ? diasActivos : DIAS_ORDEN.slice(0, 5);

    const blockHtml = [];
    horariosCursosElegidos.forEach((s, idx) => {
        const color = s.color || PALETTE_EXPORT[idx % PALETTE_EXPORT.length];
        parseHorario(s.grupo.horario).forEach(b => {
            const col = DAY_COL[b.dia];
            if (!col || !diasFinal.includes(b.dia)) return;
            const startRow = timeToRow(b.inicio);
            const endRow = timeToRow(b.fin);
            const span = Math.max(endRow - startRow, 1);
            blockHtml.push(
                `<div class="class-block" style="grid-column:${col};grid-row:${startRow}/span ${span};background-color:${color} !important;">` +
                `<div class="subject">${s.curso.nombre}</div>` +
                `<div class="tags">` +
                    `<span class="tag">Gr.${s.grupo.grupo}</span>` +
                    (s.grupo.aula ? `<span class="tag">${s.grupo.edificio ? `${s.grupo.edificio}-${s.grupo.aula}` : s.grupo.aula}</span>` : '') +
                `</div>` +
                `<div class="time-range">${b.inicio}&#8211;${b.fin}</div>` +
                (s.grupo.profesor ? `<div class="details">${s.grupo.profesor}</div>` : '') +
                `</div>`
            );
        });
    });

    const timeLabels = [];
    for (let h = minH; h < maxH; h++) {
        const row = 2 + (h - minH) * STEPS_PER_H;
        timeLabels.push(`<div class="time-slot" style="grid-column:1;grid-row:${row}/span ${STEPS_PER_H};">${String(h).padStart(2,'0')}:00</div>`);
    }
    const gridCells = [];
    for (let r = 0; r < TOTAL_STEPS; r++) {
        for (let col = 2; col <= diasFinal.length + 1; col++) {
            gridCells.push(`<div class="cell" style="grid-column:${col};grid-row:${2+r};"></div>`);
        }
    }
    const headerCols = diasFinal.map(d => `<div class="header">${DIA_LABEL[d]}</div>`).join('');

    const totalCreds = horariosCursosElegidos.reduce((s, x) => s + (x.curso.creditos || 0), 0);

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Mi Horario TEC</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,sans-serif;background:#fff;padding:14px;}
h1{text-align:center;color:#2c3e50;font-size:1.15rem;margin-bottom:2px;}
h2{text-align:center;color:#666;font-size:0.85rem;font-weight:normal;margin-bottom:10px;}
.print-btn{display:block;margin:0 auto 12px;background:#8257e6;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:0.9rem;cursor:pointer;}
.schedule-container{
  width:100%; display:grid;
  grid-template-columns:48px repeat(${diasFinal.length}, 1fr);
  grid-template-rows:30px repeat(${TOTAL_STEPS},1fr);
  gap:1px; background:#ccc; border:1px solid #ccc;
}
.header{ background:#2c3e50 !important; color:#fff !important; font-weight:700; display:flex; align-items:center; justify-content:center;
  text-transform:uppercase; font-size:0.7rem; letter-spacing:0.5px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.time-slot{ background:#f5f5f5 !important; color:#444; font-size:0.6rem; display:flex; align-items:flex-start; justify-content:center;
  padding-top:3px; font-weight:bold; grid-column:1; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.cell{background:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.class-block{ color:#fff !important; font-size:0.65rem; border-radius:3px; display:flex; flex-direction:column; overflow:visible;
  margin:1px; border-left:4px solid rgba(0,0,0,0.25); line-height:1.25; padding:3px 5px;
  -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
.subject{font-weight:700;font-size:0.68rem;margin-bottom:1px;}
.tags{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:2px;}
.tag{background:rgba(255,255,255,0.28);border-radius:2px;padding:0 4px;font-size:0.52rem;font-weight:700;letter-spacing:0.2px;}
.time-range{font-size:0.58rem;background:rgba(0,0,0,0.18);border-radius:2px;padding:1px 3px;display:inline-block;align-self:flex-start;margin-bottom:1px;}
.details{font-size:0.56rem;opacity:0.92;white-space:normal;overflow:visible;font-weight:600;}
@page{size:landscape;margin:8mm;}
@media print{ body{padding:0;} .print-btn{display:none!important;} }
</style></head>
<body>
<h1>Mi Horario · TecPlanner</h1>
<h2>${horariosCursosElegidos.length} cursos · ${totalCreds} créditos</h2>
<button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
<div class="schedule-container">
  <div class="header" style="grid-column:1;">Hora</div>
  ${headerCols}
  ${timeLabels.join('')}
  ${gridCells.join('')}
  ${blockHtml.join('')}
</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function abreviarProfesor(nombre) {
    if (!nombre) return '';
    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length <= 2) return nombre;
    const primerApellido = palabras[0];
    const primerNombre = palabras.length >= 3 ? palabras[2] : palabras[1];
    return `${primerApellido} ${primerNombre}`;
}

// =============================================================================
// 13. GUARDAR / CARGAR HORARIO EN JSON
// =============================================================================

function exportHorarioJSON() {
    if (horariosCursosElegidos.length === 0) { alert('Primero seleccioná al menos un curso.'); return; }
    const payload = {
        version: 1,
        seleccion: horariosSeleccion,
        cursos: horariosCursosElegidos,
        gridConfig: horGridConfig
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TecPlanner_Horario.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importHorarioJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data.cursos)) throw new Error('formato inválido');
            horariosCursosElegidos = data.cursos;
            if (data.gridConfig) horGridConfig = data.gridConfig;
            saveHorSeleccion();
            saveHorGridConfig();
            renderHorariosCursos();
            renderHorarioGrid();
            updateHorStats();
            alert('Horario cargado con éxito.');
        } catch (err) {
            alert('ERROR: El archivo no tiene el formato correcto.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// =============================================================================
// 14. EXPORTAR EXACTO (PNG / PDF)
// =============================================================================
// html2canvas no soporta bien CSS moderno (color-mix, backdrop-filter, inputs
// type=color, position:sticky). Por eso NO capturamos el DOM visible: armamos
// una versión "limpia" de la grilla fuera de pantalla, la capturamos, y la
// borramos. Esto es mucho más confiable.

function buildExportGridElement() {
    const dias = horGridConfig.dias;
    const minH = horGridConfig.horaIni;
    const maxH = horGridConfig.horaFin;
    const totalHoras = maxH - minH;
    const rowH = 28; // px por cada media hora

    const wrap = document.createElement('div');
    wrap.style.cssText = `
        position:fixed; left:-99999px; top:0; z-index:-1;
        width:${70 + dias.length * 150}px;
        background:#09090b; padding:16px; box-sizing:border-box;
        font-family:Arial,Helvetica,sans-serif;
        border:1px solid #333; border-radius:10px;
    `;

    let html = `<div style="display:grid;
        grid-template-columns:50px repeat(${dias.length}, 1fr);
        grid-template-rows:32px repeat(${totalHoras * 2}, ${rowH}px);
        gap:2px; background:#222;">`;

    html += `<div style="grid-column:1; grid-row:1; background:#18181b;"></div>`;
    dias.forEach((d, i) => {
        html += `<div style="grid-column:${i + 2}; grid-row:1; background:#18181b; color:#8257e6;
            font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;
            text-transform:uppercase; letter-spacing:0.5px;">${DIA_LABEL[d].slice(0, 3)}</div>`;
    });

    for (let h = minH; h < maxH; h++) {
        const row = 2 + (h - minH) * 2;
        html += `<div style="grid-column:1; grid-row:${row} / span 2; background:#121214; color:#888;
            font-size:10px; display:flex; align-items:flex-start; justify-content:center; padding-top:2px;">
            ${String(h).padStart(2, '0')}:00</div>`;
        dias.forEach((d, i) => {
            html += `<div style="grid-column:${i + 2}; grid-row:${row} / span 2; background:#0d0d0f;"></div>`;
        });
    }

    horariosCursosElegidos.forEach(s => {
        parseHorario(s.grupo.horario).forEach(b => {
            const col = dias.indexOf(b.dia);
            if (col === -1) return;
            const bIniH = horasAMin(b.inicio) / 60;
            const bFinH = horasAMin(b.fin) / 60;
            if (bFinH <= minH || bIniH >= maxH) return;
            const startRow = 2 + Math.round((Math.max(bIniH, minH) - minH) * 2);
            const endRow = 2 + Math.round((Math.min(bFinH, maxH) - minH) * 2);
            const span = endRow - startRow;
            const aulaTxt = s.grupo.aula ? (s.grupo.edificio ? `${s.grupo.edificio}-${s.grupo.aula}` : s.grupo.aula) : '';
            const profLine = s.grupo.profesor
                ? `<div style="display:flex; align-items:center; gap:3px; opacity:0.92; font-size:8.5px; margin-top:2px; font-weight:600;">${ICON_PROF}<span>${abreviarProfesor(s.grupo.profesor)}</span></div>`
                : '';
            html += `
                <div style="grid-column:${col + 2}; grid-row:${startRow} / ${endRow};
                    background-color:${s.color}; border-radius:4px; border-left:3px solid rgba(0,0,0,0.35);
                    color:#fff; font-size:10px; padding:4px 6px; margin:1px; overflow:hidden;
                    box-sizing:border-box; display:flex; flex-direction:column;">
                    <div style="font-weight:bold; font-size:10.5px; line-height:1.2;">${s.curso.nombre}</div>
                    <div style="opacity:0.9; font-size:9px; margin-top:2px; background:rgba(0,0,0,0.18);
                        border-radius:2px; padding:1px 3px; display:inline-block; align-self:flex-start;">${b.inicio}&#8211;${b.fin}</div>
                    ${span >= 2 ? `
                    <div style="display:flex; align-items:center; gap:3px; opacity:0.9; font-size:8.5px; margin-top:2px;">${ICON_USERS}<span>Gr.${s.grupo.grupo}${aulaTxt ? ' · ' + aulaTxt : ''}</span></div>
                    ${profLine}` : ''}
                </div>`;
        });
    });

    html += `</div>`;
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    return wrap;
}

async function capturarGridComoCanvas() {
    if (typeof html2canvas !== 'function') {
        alert('La librería de exportación aún no cargó. Esperá unos segundos e intentá de nuevo.');
        return null;
    }
    const el = buildExportGridElement();
    try {
        await new Promise(r => setTimeout(r, 60)); // dejar que el navegador aplique el layout
        return await html2canvas(el, {
            backgroundColor: '#09090b',
            scale: 2,
            useCORS: true,
            logging: false,
        });
    } finally {
        el.remove();
    }
}

async function exportHorarioComoImagen() {
    if (horariosCursosElegidos.length === 0) { alert('Primero seleccioná al menos un curso.'); return; }
    try {
        const canvas = await capturarGridComoCanvas();
        if (!canvas) return;
        const a = document.createElement('a');
        a.download = 'TecPlanner_Horario.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
    } catch (e) {
        console.error('Error exportando PNG:', e);
        alert('No se pudo generar la imagen. Probá de nuevo.');
    }
}

async function exportHorarioComoPDF() {
    if (horariosCursosElegidos.length === 0) { alert('Primero seleccioná al menos un curso.'); return; }
    if (typeof window.jspdf === 'undefined') {
        alert('La librería de PDF aún no cargó. Esperá unos segundos e intentá de nuevo.');
        return;
    }
    try {
        const canvas = await capturarGridComoCanvas();
        if (!canvas) return;
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('TecPlanner_Horario.pdf');
    } catch (e) {
        console.error('Error exportando PDF:', e);
        alert('No se pudo generar el PDF. Probá de nuevo.');
    }
}

// =============================================================================
// 15. MISPROFESORES.COM — calificaciones en vivo + comparador
// =============================================================================
// Se consulta EN EL MOMENTO en que el usuario hace clic, directo a la URL
// específica asignada al profesor (ver profesores.js). Como el navegador no
// puede hacer fetch() cross-origin a misprofesores.com (no manda cabeceras
// CORS), se pasa por un proxy público. Si un proxy falla o está caído,
// se intenta con el siguiente de la lista.

const MISPROFES_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

let misprofesCache = {}; // url -> datos ya parseados, evita re-consultar en la misma sesión

async function fetchConTimeout(url, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`status ${res.status}`);
        return await res.text();
    } finally {
        clearTimeout(timer);
    }
}

// Lanza TODOS los proxies a la vez y se queda con el que responda primero.
// Si uno se cuelga, el timeout lo aborta sin frenar a los demás.
async function fetchHtmlViaProxy(url) {
    const intentos = MISPROFES_PROXIES.map(construir => fetchConTimeout(construir(url)));
    try {
        return await Promise.any(intentos);
    } catch {
        throw new Error('No se pudo contactar ningún proxy (todos fallaron o tardaron demasiado)');
    }
}

// Extrae los 4 datos numéricos del HTML de la página del profesor.
// Estrategia: recorrer todos los nodos de texto en orden (igual que ve el
// usuario en pantalla) y, para cada etiqueta conocida, tomar el siguiente
// texto no vacío como su valor. Es resistente a cambios de clases/CSS,
// pero depende de que las etiquetas en español no cambien.
function parseMisprofesHTML(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, noscript').forEach(n => n.remove());

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
    const lines = [];
    let node;
    while ((node = walker.nextNode())) {
        const t = node.textContent.replace(/\s+/g, ' ').trim();
        if (t) lines.push(t);
    }

    const valorDespuesDe = (etiqueta) => {
        const idx = lines.findIndex(l => l === etiqueta);
        if (idx === -1) return null;
        for (let i = idx + 1; i < lines.length; i++) {
            if (lines[i]) return lines[i];
        }
        return null;
    };

    let numCalificaciones = null;
    for (const line of lines) {
        const m = line.match(/^(\d+)\s+Calificaciones de Estudiantes/i);
        if (m) { numCalificaciones = parseInt(m[1], 10); break; }
    }

    return {
        calidadGeneral: valorDespuesDe('Calidad General'),
        nivelDificultad: valorDespuesDe('Nivel de Dificultad'),
        loRecomiendan: valorDespuesDe('Lo Recomiendan'),
        numCalificaciones,
        url
    };
}

async function obtenerDatosMisprofes(url) {
    if (misprofesCache[url]) return misprofesCache[url];
    const html = await fetchHtmlViaProxy(url);
    const datos = parseMisprofesHTML(html, url);
    misprofesCache[url] = datos;
    return datos;
}

function renderMetricasMisprofesHTML(datos) {
    const metrica = (label, val, color) => `
        <div style="background:#09090b; border:1px solid #333; border-radius:8px; padding:14px; text-align:center;">
            <div style="font-size:1.5rem; font-weight:700; color:${color};">${datos ? (val ?? '—') : '—'}</div>
            <div style="font-size:0.68rem; color:var(--text-dim); text-transform:uppercase; margin-top:4px; letter-spacing:0.5px;">${label}</div>
        </div>`;
    return `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            ${metrica('Calidad General', datos?.calidadGeneral, '#10b981')}
            ${metrica('Nivel de Dificultad', datos?.nivelDificultad, '#ef4444')}
            ${metrica('Lo Recomiendan', datos?.loRecomiendan, '#3b82f6')}
            ${metrica('# Calificaciones', datos?.numCalificaciones, '#fbbf24')}
        </div>`;
}

// --- Panel individual ---

async function abrirPanelProfesor(nombre, url) {
    document.getElementById('profesorModal')?.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'profesorModal';
    modal.style.cssText = 'display:flex; z-index:6500;';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="modal-content" style="width:460px;">
            <div class="modal-header">
                <div class="modal-title-code" style="color:#fbbf24;">⭐ CALIFICACIONES</div>
                <div class="modal-title-name" style="font-size:1.35rem;">${nombre}</div>
            </div>
            <div class="modal-body" id="profesorModalBody">
                <div style="text-align:center; padding:30px; color:var(--text-dim);">⏳ Consultando MisProfesores...</div>
            </div>
            <div class="modal-footer" style="flex-direction:column; gap:10px;">
                <a href="${url}" target="_blank" rel="noopener" class="btn-modal btn-confirm"
                   style="text-decoration:none; text-align:center; display:block;">Ver perfil completo en MisProfesores →</a>
                <div style="display:flex; gap:10px; width:100%;">
                    <button class="btn-modal btn-cancel" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
                    <button class="btn-modal btn-cancel" onclick='abrirComparadorProfesores(${JSON.stringify(nombre)}, ${JSON.stringify(url)})'>⚖️ Comparar</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    try {
        const datos = await obtenerDatosMisprofes(url);
        const body = document.getElementById('profesorModalBody');
        if (body) body.innerHTML = renderMetricasMisprofesHTML(datos);
    } catch (e) {
        const body = document.getElementById('profesorModalBody');
        if (body) body.innerHTML = `
            <div style="text-align:center; padding:10px; color:#ef4444; font-size:0.88rem;">
                ⚠️ No se pudo obtener la información en este momento.<br>
                <span style="color:var(--text-dim); font-size:0.8rem;">Probá de nuevo o abrí el perfil completo con el botón de abajo.</span>
            </div>`;
    }
}

// --- Comparador ---

function abrirComparadorProfesores(nombreActual, urlActual) {
    document.getElementById('profesorModal')?.remove();
    document.getElementById('comparadorModal')?.remove();

    const opciones = Object.keys(PROFESORES_MISPROFES)
        .filter(n => n !== nombreActual)
        .sort((a, b) => a.localeCompare(b, 'es'));

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'comparadorModal';
    modal.style.cssText = 'display:flex; z-index:6500;';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="modal-content" style="width:640px;">
            <div class="modal-header">
                <div class="modal-title-code" style="color:#fbbf24;">⚖️ COMPARAR PROFESORES</div>
                <div class="modal-title-name" style="font-size:1.25rem;">${nombreActual} vs otro profesor</div>
            </div>
            <div class="modal-body">
                <select id="comparadorSelect" class="rpg-input" style="cursor:pointer; appearance:auto;">
                    <option value="">Elegí un profesor para comparar</option>
                    ${opciones.map(n => `<option value="${n}">${n}</option>`).join('')}
                </select>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
                    <div>
                        <div style="text-align:center; font-weight:700; color:#fff; margin-bottom:10px;">${nombreActual}</div>
                        <div id="comparadorColA">${renderMetricasMisprofesHTML(null)}</div>
                    </div>
                    <div>
                        <div id="comparadorColBTitulo" style="text-align:center; font-weight:700; color:var(--text-dim); margin-bottom:10px;">—</div>
                        <div id="comparadorColB" style="text-align:center; color:var(--text-dim); padding:30px 10px; font-size:0.85rem;">Elegí un profesor arriba ↑</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-confirm" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    obtenerDatosMisprofes(urlActual)
        .then(datos => {
            const colA = document.getElementById('comparadorColA');
            if (colA) colA.innerHTML = renderMetricasMisprofesHTML(datos);
        })
        .catch(() => {
            const colA = document.getElementById('comparadorColA');
            if (colA) colA.innerHTML = `<div style="text-align:center; color:#ef4444; font-size:0.85rem;">⚠️ Error al consultar</div>`;
        });

    document.getElementById('comparadorSelect').onchange = async (e) => {
        const nombre = e.target.value;
        const colB = document.getElementById('comparadorColB');
        const tituloB = document.getElementById('comparadorColBTitulo');
        if (!nombre) {
            tituloB.textContent = '—';
            colB.innerHTML = 'Elegí un profesor arriba ↑';
            return;
        }
        const url = PROFESORES_MISPROFES[nombre];
        tituloB.textContent = nombre;
        tituloB.style.color = '#fff';
        colB.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-dim);">⏳ Consultando...</div>`;
        try {
            const datos = await obtenerDatosMisprofes(url);
            colB.innerHTML = renderMetricasMisprofesHTML(datos);
        } catch {
            colB.innerHTML = `<div style="text-align:center; color:#ef4444; font-size:0.85rem;">⚠️ Error al consultar</div>`;
        }
    };
}