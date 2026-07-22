// =============================================================================
// TECPLANNER · app.js
// =============================================================================
// Secciones:
//   1. ESTADO GLOBAL
//   2. ARRANQUE Y SELECCIÓN DE CARRERA
//   3. PERSISTENCIA (localStorage)
//   4. RENDERIZADO DEL ÁRBOL
//   5. CONEXIONES SVG Y HOVER
//   6. FILTROS DE SEMESTRE Y STATS DEL HUD
//   7. MODAL DE CURSO (abrir / guardar / cerrar)
//   8. MODO EDICIÓN RÁPIDA
//   9. ÉNFASIS FORESTAL
//  10. PERFIL ACADÉMICO (character sheet)
//  11. PROMEDIO PONDERADO (modal detallado)
//  12. CARGA MASIVA DE NOTAS
//  13. VISTA LISTA
//  14. SIMULADOR DE GRADUACIÓN
//  15. EXPORTAR / IMPORTAR
//  16. MODALES DE INFO (tutorial, acerca de)
//  17. ANÁLITICA (notificaciones Discord)
//  18. GENERADOR DE HORARIO PDF
// =============================================================================


// =============================================================================
// 1. ESTADO GLOBAL
// =============================================================================

let coursesDB          = [];   // Catálogo activo de cursos de la carrera cargada
let currentMajor       = null; // Clave de la carrera activa (ej: 'computacion')
let activeFilterSemester = null; // Semestre activo en el filtro del HUD
let currentCourse      = null; // Curso abierto en el modal de edición
let editMode           = null; // Modo de edición rápida: 'cursando' | 'aprobado' | null
let questLogView       = 'user'; // Vista del quest log: 'user' | 'original'
let viewMode           = 'tree'; // Vista principal: 'tree' | 'list'
let currentSearchQuery = '';

// Mapa de títulos de carrera para el HUD
const MAJOR_TITLES = {
    fisica:                             'ING. FÍSICA',
    biotecnologia:                      'BIOTECNOLOGÍA',
    electronica:                        'ING. ELECTRÓNICA',
    computacion:                        'ING. COMPUTACIÓN',
    mecatronica:                        'ING. MECATRÓNICA',
    administracion:                     'ADMINISTRACIÓN',
    produccion:                         'ING. PRODUCCIÓN',
    mantenimiento:                      'ING. MANTENIMIENTO',
    computadores:                       'ING. COMPUTADORES',
    diseno:                             'ING. DISEÑO',
    ambiental:                          'ING. AMBIENTAL',
    ati:                                'ADM. TEC. INFORMACIÓN',
    materiales:                         'ING. MATERIALES',
    agricola:                           'ING. AGRÍCOLA',
    agronegocios:                       'ING. AGRONEGOCIOS',
    e_mate:                             'ENS. MATEMÁTICA',
    forestal:                           'ING. FORESTAL',
    forestal_manejoYproduccion:         'ING. FORESTAL · MANEJO',
    forestal_conservacionYrestauracion: 'ING. FORESTAL · CONSERVACIÓN',
    seguridad:                          'ING. SEGURIDAD LABORAL',

    biotec_una: 'BIOTEC. (UNA)',
};


// =============================================================================
// 2. ARRANQUE Y SELECCIÓN DE CARRERA
// =============================================================================

// Inicializa las tarjetas de selección de carrera en la pantalla de inicio
document.querySelectorAll('.major-card').forEach(card => {
    const careerKey = card.dataset.career;
    const data = careers_information[careerKey];

    const parts = [
        `Código ${data.plan}`,
        data.grado,
        data.modalidad
    ].filter(Boolean);

    card.innerHTML = `
        <div class="major-icon">${data.icon}</div>
        <div class="major-title">${data.name}</div>
        <div class="major-desc">${parts.join(' | ')}</div>
    `;

    card.onclick = () => selectMajor(careerKey, data.name.toUpperCase());
});

// Rellena la lista de carreras en el modal "Acerca de"
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('careers-list');
    if (!container) return;
    const list = Object.values(careers_information)
        .map(c => `• ${c.name} (Plan ${c.plan})`)
        .join('<br>');
    container.innerHTML = list + '<br>Más carreras pronto.';
});

// Punto de entrada principal: decide si mostrar selector de carrera o cargar directamente
function bootSystem() {
    currentMajor = localStorage.getItem('TecPlanner_ActiveMajor');

    if (currentMajor) {
        const title = MAJOR_TITLES[currentMajor] || currentMajor.toUpperCase();
        loadMajor(currentMajor, title);
    }

    renderEnfasisBtn();
}

// Llamado al hacer clic en una tarjeta de carrera
function selectMajor(majorKey, titleText) {
    document.getElementById('majorSelectionOverlay').style.display = 'none';
    localStorage.setItem('TecPlanner_ActiveMajor', majorKey);
    loadMajor(majorKey, titleText);
    switchAppMode('arbol');

    if (!localStorage.getItem('TecPlanner_TutorialSeen')) {
        startTour();
    }
}

// Carga el plan de estudios de una carrera y arranca la app
function loadMajor(majorKey, titleText) {
    currentMajor = majorKey;
    document.getElementById('hudTitle').innerText = `TEC // ${titleText}`;
    coursesDB = JSON.parse(JSON.stringify(curriculums[majorKey]));

    init();
    renderEnfasisBtn();
    notifyOpen();
}

// Permite cambiar de carrera desde el perfil (sin borrar datos)
function resetMajor() {
    if (confirm('¿Estás seguro de cambiar de carrera? Esto ocultará tu progreso actual (no se borrará, solo se guardará internamente).')) {
        localStorage.removeItem('TecPlanner_ActiveMajor');
        location.reload();
    }
}

// Inicializa listeners y render tras cargar una carrera
function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}
const drawConnectionsDebounced = debounce(drawConnections, 80);

function init() {
    loadFromLocal();
    renderGrid();
    renderButtons();
    loadCourseHistory();
    setTimeout(drawConnections, 100);
    window.addEventListener('resize', drawConnectionsDebounced);
    document.querySelector('.game-area').addEventListener('scroll', drawConnectionsDebounced, { passive: true });
    updateStats(activeFilterSemester);
    checkBackupReminder();
}


// =============================================================================
// 3. PERSISTENCIA (localStorage)
// =============================================================================

// Guarda el estado actual de coursesDB en localStorage, junto con la versión de la malla
function saveToLocal() {
    const payload = {
        version: CURRICULUM_VERSIONS[currentMajor] || 1,
        courses: coursesDB
    };
    localStorage.setItem(`TecPlanner_Data_${currentMajor}`, JSON.stringify(payload));
}

// Aplica un arreglo de cursos guardados (localStorage o import) sobre coursesDB
function applySavedCourses(parsedData) {
    parsedData.forEach(savedCourse => {
        let originalCourse = coursesDB.find(c => c.id === savedCourse.id);

        // Si es un intento (retry) que no existe aún en coursesDB, recrearlo completo
        if (!originalCourse && savedCourse.isRetry) {
            coursesDB.push({ ...savedCourse });
            return;
        }

        if (originalCourse) {
            originalCourse.userSem   = savedCourse.userSem;
            originalCourse.status    = savedCourse.status;
            originalCourse.grade     = savedCourse.grade;
            originalCourse.prof      = savedCourse.prof;
            originalCourse.grupo     = savedCourse.grupo     || '';
            originalCourse.modalidad = savedCourse.modalidad || '';
            originalCourse.horario   = savedCourse.horario   || null;
        }
    });
}

// Carga el estado guardado de la carrera activa y lo aplica a coursesDB.
// Soporta el formato viejo (array plano, sin versión) para no romper datos existentes.
function loadFromLocal() {
    const savedRaw = localStorage.getItem(`TecPlanner_Data_${currentMajor}`);
    if (!savedRaw) return;

    let saved;
    try { saved = JSON.parse(savedRaw); } catch (e) { return; }

    const esFormatoViejo  = Array.isArray(saved);
    const parsedData      = esFormatoViejo ? saved : (saved.courses || []);
    const savedVersion    = esFormatoViejo ? 0 : (saved.version || 0);
    const currentVersion  = CURRICULUM_VERSIONS[currentMajor] || 1;

    applySavedCourses(parsedData);

    if (savedVersion !== currentVersion) {
        warnCurriculumVersionMismatch(parsedData, savedVersion, currentVersion);
    }
}

// Detecta cursos guardados por el usuario que ya no existen en la malla actual
// (por ejemplo, tras una actualización del plan de estudios) y avisa sin borrar nada.
function warnCurriculumVersionMismatch(parsedData, savedVersion, currentVersion) {
    const idsActuales = new Set(coursesDB.map(c => c.id));
    const huerfanos = parsedData.filter(c =>
        !c.isRetry &&
        !idsActuales.has(c.id) &&
        (c.status === 'aprobado' || c.status === 'cursando' || hasSem(c.userSem))
    );

    if (huerfanos.length === 0) return;
    setTimeout(() => showCurriculumMismatchModal(huerfanos, savedVersion, currentVersion), 400);
}

// Modal informativo: cursos guardados que quedaron fuera del plan vigente
function showCurriculumMismatchModal(huerfanos, savedVersion, currentVersion) {
    const modal = document.createElement('div');
    modal.className     = 'modal-overlay';
    modal.style.cssText = 'display:flex; z-index:6500;';
    modal.onclick        = (e) => { if (e.target === modal) modal.remove(); };

    const rows = huerfanos.map(c => `
        <div style="padding:8px 12px; border-bottom:1px solid #27272a; font-size:0.85rem;">
            <span style="color:var(--accent); font-weight:700;">${c.id}</span>
            <span style="color:#fff; margin-left:6px;">${c.name || ''}</span>
            ${hasSem(c.userSem) ? `<span style="color:var(--text-dim); margin-left:6px;">(S${c.userSem})</span>` : ''}
        </div>`).join('');

    modal.innerHTML = `
        <div class="modal-content" style="width:520px;">
            <div class="modal-header">
                <div class="modal-title-code" style="color:#f59e0b;">⚠️ PLAN DE ESTUDIOS ACTUALIZADO</div>
                <div class="modal-title-name" style="font-size:1.3rem;">Algunos cursos guardados ya no existen</div>
            </div>
            <div class="modal-body">
                <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; padding:14px;
                            border-radius:6px; font-size:0.88rem; color:var(--text-dim); line-height:1.6;">
                    Tu malla de <strong style="color:#fff;">${MAJOR_TITLES[currentMajor] || currentMajor}</strong> cambió de versión
                    (guardada: ${savedVersion || 'desconocida'} → actual: ${currentVersion}).
                    Los siguientes cursos que tenías guardados ya no están en el plan vigente, por lo que no aparecen en tu árbol,
                    pero <strong style="color:#fff;">tu progreso no se borró</strong>. Te recomendamos exportar un respaldo antes de seguir.
                </div>
                <div style="background:#09090b; border:1px solid #333; border-radius:6px; margin-top:14px; max-height:220px; overflow-y:auto;">
                    ${rows}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-cancel" onclick="exportJSON()">💾 Exportar respaldo</button>
                <button class="btn-modal btn-confirm" onclick="this.closest('.modal-overlay').remove()">Entendido</button>
            </div>
        </div>`;

    document.body.appendChild(modal);
}

// Exporta el plan actual como archivo JSON descargable
function exportJSON() {
    const payload = {
        version: CURRICULUM_VERSIONS[currentMajor] || 1,
        major:   currentMajor,
        courses: coursesDB
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob    = new Blob([dataStr], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href     = url;
    a.download = `TecPlanner_${currentMajor}_Backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    localStorage.setItem('TecPlanner_LastExportDate', Date.now().toString());
}

// Importa un archivo JSON y aplica sus datos al plan actual.
// Soporta tanto el formato nuevo ({ version, major, courses }) como el
// formato viejo (array plano de cursos) para no romper respaldos antiguos.
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const parsed        = JSON.parse(e.target.result);
            const esFormatoViejo = Array.isArray(parsed);
            const importedData   = esFormatoViejo ? parsed : (parsed.courses || null);

            if (Array.isArray(importedData)) {
                applySavedCourses(importedData);

                saveToLocal();
                renderGrid();
                renderButtons();
                drawConnections();
                updateStats(activeFilterSemester);
                if (document.getElementById('characterSheet').classList.contains('open')) updateCharacterSheet();

                const importedVersion = esFormatoViejo ? 0 : (parsed.version || 0);
                const currentVersion  = CURRICULUM_VERSIONS[currentMajor] || 1;
                if (importedVersion !== currentVersion) {
                    warnCurriculumVersionMismatch(importedData, importedVersion, currentVersion);
                }

                alert('SISTEMA ACTUALIZADO: Los datos se cargaron con éxito.');
            } else {
                alert('ERROR: El archivo no tiene el formato correcto.');
            }
        } catch (err) {
            alert('ERROR CRÍTICO: No se pudo leer el archivo JSON.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Reinicio completo: modal de confirmación con checkbox
function confirmReset() {
    const modal = document.createElement('div');
    modal.className       = 'modal-overlay';
    modal.style.display   = 'flex';
    modal.style.zIndex    = '5000';

    modal.innerHTML = `
        <div class="modal-content" style="width: 500px; max-width: 90vw;">
            <div class="modal-header">
                <div class="modal-title-code" style="color: #ef4444;">⚠️ REINICIAR TODO</div>
                <div class="modal-title-name">¿Estás completamente seguro?</div>
            </div>
            <div class="modal-body">
                <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0 0 15px 0; font-weight: 700; color: #ef4444; font-size: 1.1rem;">Esta acción es IRREVERSIBLE</p>
                    <p style="margin: 0; line-height: 1.6; color: var(--text-main);">Se eliminarán permanentemente:</p>
                    <ul style="margin: 10px 0 0 20px; line-height: 1.8; color: var(--text-dim);">
                        <li>Todos los semestres planificados</li>
                        <li>Todos los estados de cursos (aprobado/cursando)</li>
                        <li>Todas las notas guardadas</li>
                        <li>Información de profesores</li>
                        <li>Tu promedio ponderado</li>
                    </ul>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px;">
                    <p style="margin: 0; color: var(--text-main); font-size: 0.95rem;">
                        💡 <strong>Tip:</strong> Si solo quieres cambiar de carrera, usa el botón
                        <strong style="color: var(--accent);">"CAMBIAR CARRERA"</strong> en tu perfil.
                    </p>
                </div>
                <div style="margin-top: 25px; padding: 15px; background: #09090b; border-radius: 8px; border: 1px solid #333;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="confirmCheckbox" style="width: 20px; height: 20px; cursor: pointer;">
                        <span style="color: var(--text-main); font-size: 0.95rem;">Entiendo que esta acción no se puede deshacer</span>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-cancel" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                <button class="btn-modal" id="btnConfirmReset"
                        style="background: #ef4444; color: #fff; opacity: 0.5; cursor: not-allowed;" disabled>
                    Sí, Reiniciar Todo
                </button>
            </div>
        </div>`;

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);

    const checkbox  = document.getElementById('confirmCheckbox');
    const btnConfirm = document.getElementById('btnConfirmReset');

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            btnConfirm.disabled      = false;
            btnConfirm.style.opacity = '1';
            btnConfirm.style.cursor  = 'pointer';
            btnConfirm.onclick       = () => resetEverything(modal);
        } else {
            btnConfirm.disabled      = true;
            btnConfirm.style.opacity = '0.5';
            btnConfirm.style.cursor  = 'not-allowed';
            btnConfirm.onclick       = null;
        }
    });
}

// Borra todos los datos de TecPlanner del localStorage y recarga la página
function resetEverything(modal) {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('TecPlanner_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    if (modal) modal.remove();

    const successModal = document.createElement('div');
    successModal.className     = 'modal-overlay';
    successModal.style.display = 'flex';
    successModal.style.zIndex  = '5001';
    successModal.innerHTML = `
        <div class="modal-content" style="width: 400px; max-width: 90vw; text-align: center;">
            <div class="modal-body" style="padding: 40px 30px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
                <h2 style="margin: 0 0 15px 0; color: #10b981; font-size: 1.8rem;">¡Reinicio Completo!</h2>
                <p style="margin: 0; color: var(--text-dim); font-size: 1rem; line-height: 1.6;">
                    Todos tus datos han sido eliminados.<br>
                    La página se recargará en <span id="countdown">3</span> segundos...
                </p>
            </div>
        </div>`;
    document.body.appendChild(successModal);

    let countdown = 3;
    const countdownEl = document.getElementById('countdown');
    const interval = setInterval(() => {
        countdown--;
        if (countdownEl) countdownEl.textContent = countdown;
        if (countdown <= 0) { clearInterval(interval); location.reload(); }
    }, 1000);
}


// =============================================================================
// 3b. RECORDATORIO DE RESPALDO
// =============================================================================
// Se revisa en cada entrada a la página, pero solo se muestra si ya pasó al
// menos 1 día completo desde la última vez que se mostró (independientemente
// de cuántas veces haya entrado el usuario en ese lapso).

const BACKUP_REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 día

// Revisa si corresponde mostrar el recordatorio de respaldo
function checkBackupReminder() {
    const ultimaVezMostrado = parseInt(localStorage.getItem('TecPlanner_LastBackupReminder') || '0');
    const ahora             = Date.now();
    if (ahora - ultimaVezMostrado < BACKUP_REMINDER_INTERVAL_MS) return;

    localStorage.setItem('TecPlanner_LastBackupReminder', ahora.toString());
    showBackupReminderToast();
}

// Muestra un aviso no intrusivo sugiriendo descargar un respaldo
function showBackupReminderToast() {
    if (document.getElementById('backupReminderToast')) return;

    const lastExport = parseInt(localStorage.getItem('TecPlanner_LastExportDate') || '0');
    let subtitle;
    if (lastExport > 0) {
        const dias = Math.floor((Date.now() - lastExport) / BACKUP_REMINDER_INTERVAL_MS);
        subtitle = dias <= 0 ? 'Tu último respaldo fue hoy.' : `Tu último respaldo fue hace ${dias} día${dias !== 1 ? 's' : ''}.`;
    } else {
        subtitle = 'Todavía no has descargado un respaldo de tu plan.';
    }

    const toast = document.createElement('div');
    toast.id = 'backupReminderToast';
    toast.style.cssText = `
        position: fixed; bottom: 90px; right: 20px; z-index: 4500;
        background: #18181b; border: 1px solid #333; border-left: 4px solid #10b981;
        border-radius: 8px; padding: 16px 18px; width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6); animation: slideUp 0.3s ease;
        font-family: 'Rajdhani', sans-serif;
    `;
    toast.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div style="font-weight:700; color:#fff; font-size:0.95rem;">💾 Respaldo de tu plan</div>
            <button onclick="dismissBackupReminder()"
                    style="background:none; border:none; color:var(--text-dim); font-size:1.2rem; cursor:pointer; line-height:1; padding:0;">×</button>
        </div>
        <div style="color: var(--text-dim); font-size: 0.82rem; margin: 8px 0 14px; line-height:1.4;">
            ${subtitle} Tus datos viven solo en este navegador y se pueden perder fácilmente.
        </div>
        <div style="display:flex; gap:10px;">
            <button onclick="dismissBackupReminder()"
                    style="flex:1; background:transparent; border:1px solid #444; color:var(--text-dim); padding:8px;
                           border-radius:6px; cursor:pointer; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:0.8rem;">
                Ahora no
            </button>
            <button onclick="exportJSON(); dismissBackupReminder();"
                    style="flex:1; background:#10b981; border:none; color:#000; padding:8px;
                           border-radius:6px; cursor:pointer; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:0.8rem;">
                💾 Descargar
            </button>
        </div>`;

    document.body.appendChild(toast);
}

// Cierra el aviso de respaldo
function dismissBackupReminder() {
    document.getElementById('backupReminderToast')?.remove();
}


// =============================================================================
// 4. RENDERIZADO DEL ÁRBOL
// =============================================================================

// Genera todo el árbol de nodos en pantalla
function renderGrid() {
    const container = document.getElementById('treeGrid');
    const svg       = document.getElementById('connections');

    // Limpiar columnas anteriores (conservar el SVG)
    while (container.childNodes.length > 2) {
        if (container.lastChild !== svg) container.removeChild(container.lastChild);
    }

    // Agrupar cursos por bloque
    const blocks = {};
    coursesDB.forEach(c => {
        if (!blocks[c.block]) blocks[c.block] = [];
        blocks[c.block].push(c);
    });

    Object.keys(blocks).sort((a, b) => a - b).forEach(blockNum => {
        const col = document.createElement('div');
        col.className = 'semester-column';
        col.innerHTML = `<div class="column-header">BLOQUE ${blockNum}</div>`;

        blocks[blockNum].forEach(c => {
            // Clases de timing (adelantado / atrasado / verano)
            let timingClass = '';
            if (hasSem(c.userSem)) {
                if (c.userSem % 1 !== 0)       timingClass = 'timing-verano';
                else if (c.userSem > c.block)   timingClass = 'timing-atrasado';
                else if (c.userSem < c.block)   timingClass = 'timing-adelantado';
            }

            // Badge de curso clave (desbloquea 3+ cursos)
            const unlocksCount = coursesDB.filter(course => course.reqs.includes(c.id)).length;
            const keyBadge = unlocksCount >= 3
                ? `<div class="key-course-badge" title="Desbloquea ${unlocksCount} cursos">🔑 ${unlocksCount}</div>`
                : '';

            const retryBadge = c.isRetry
            ? `<div style="position:absolute;top:-8px;right:-8px;background:#f59e0b;color:#000;font-size:0.6rem;padding:2px 5px;border-radius:8px;font-weight:bold;">🔄 Intento</div>
            <button onclick="event.stopPropagation(); deleteRetryCourse('${c.id}')" title="Eliminar este intento"
                    style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;
                        border:2px solid #18181b;padding:3px 10px;border-radius:12px;display:flex;align-items:center;gap:4px;
                        font-size:0.68rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(239,68,68,0.6);
                        font-family:'Rajdhani',sans-serif;white-space:nowrap;">🗑 Eliminar</button>`
            : '';
            const node       = document.createElement('div');
            const nodeStatus = c.status || 'pendiente';

            node.className       = `node ${hasSem(c.userSem) ? 'in-user-semester' : ''} ${timingClass} status-${nodeStatus}`;
            node.id              = c.id;
            node.dataset.userSem = hasSem(c.userSem) ? c.userSem : '';
            node.innerHTML = `
                <div class="node-code"><span>${c.id}</span> <span class="user-sem-badge">S${c.userSem}</span></div>
                <div class="node-name">${c.name}</div>
                <div class="node-credits">${c.cred} cr</div>
                ${keyBadge}
                ${retryBadge}
            `;

            node.onmouseenter = () => handleHover(c.id, true);
            node.onmouseleave = () => handleHover(c.id, false);
            node.onclick      = () => {
                if (editMode) {
                    c.status = (c.status === editMode) ? 'pendiente' : editMode;
                    saveToLocal();
                    renderGrid();
                    drawConnections();
                    updateStats(activeFilterSemester);
                    if (activeFilterSemester) filterByUserSemester(activeFilterSemester);
                    if (document.getElementById('characterSheet').classList.contains('open')) updateCharacterSheet();
                } else {
                    openModal(c);
                }
            };

            col.appendChild(node);
        });

        container.appendChild(col);

        // Insertar columna de bifurcación forestal entre bloque 5 y 6
        if (parseInt(blockNum) === 5 && esForestal(currentMajor)) {
            container.appendChild(buildEnfasisColumn());
        }
    });

    checkAnomalies();
    if (currentSearchQuery) searchCourse(currentSearchQuery);
}

// Renderiza los botones de semestre en el HUD
function renderButtons() {
    const container = document.getElementById('userSemestersBtn');
    const periods   = [...new Set(coursesDB.map(c => parseFloat(c.userSem)).filter(n => !isNaN(n) && n >= 0))].sort((a, b) => a - b);

    let html = `<button class="btn-sem" id="btnSnull" onclick="filterByUserSemester(null)">TODOS</button>`;
    periods.forEach(p => {
        const isSummer = p % 1 !== 0;
        const label    = isSummer ? `VERANO ${Math.floor(p)}` : `MI S${p}`;
        const btnId    = `btnS${p.toString().replace('.', '_')}`;
        html += `<button class="btn-sem" id="${btnId}" onclick="filterByUserSemester(${p})">${label}</button>`;
    });
    container.innerHTML = html;

    if (activeFilterSemester === null) {
        document.getElementById('btnSnull').classList.add('active');
    } else {
        const activeBtn = document.getElementById(`btnS${activeFilterSemester.toString().replace('.', '_')}`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

// Detecta anomalías de requisitos/correquisitos y marca los nodos afectados
function checkAnomalies() {
    document.querySelectorAll('.anomaly-badge').forEach(e => e.remove());
    document.querySelectorAll('.node').forEach(n => n.classList.remove('anomaly'));

    coursesDB.forEach(c => {
        if (!hasSem(c.userSem)) return;

        let isAnomaly = false;
        const errorMsg = [];

        c.reqs.forEach(reqId => {
            const reqCourse = coursesDB.find(x => x.id === resolveCourseId(reqId));
            if (!reqCourse || reqCourse.status === 'aprobado') return;
            if (!reqCourse.userSem || reqCourse.userSem >= c.userSem) {
                isAnomaly = true;
                errorMsg.push(`Requiere ${reqId} antes del S${c.userSem}`);
            }
        });

        c.coreqs.forEach(coreqId => {
            const coreqCourse = coursesDB.find(x => x.id === resolveCourseId(coreqId));
            if (!coreqCourse || coreqCourse.status === 'aprobado') return;
            if (!coreqCourse.userSem || coreqCourse.userSem > c.userSem) {
                isAnomaly = true;
                errorMsg.push(`El correquisito ${coreqId} no puede ir después del S${c.userSem}`);
            }
        });

        if (isAnomaly) {
            const node = document.getElementById(c.id);
            if (node) {
                node.classList.add('anomaly');
                const badge      = document.createElement('div');
                badge.className  = 'anomaly-badge';
                badge.title      = errorMsg.join(' | ');
                badge.innerText  = '⚠️';
                node.appendChild(badge);
            }
        }
    });
}


// =============================================================================
// 5. CONEXIONES SVG Y HOVER
// =============================================================================

// Redibuja todas las líneas de conexión entre nodos
function drawConnections() {
    const svg       = document.getElementById('connections');
    const container = document.getElementById('treeGrid');
    svg.innerHTML   = '';
    svg.setAttribute('width',  container.scrollWidth);
    svg.setAttribute('height', container.scrollHeight);

    coursesDB.forEach(c => {
        c.reqs.forEach(req    => drawOrthogonalPath(resolveCourseId(req), c.id, svg));
        c.coreqs.forEach(coreq => drawOrthogonalPath(c.id, resolveCourseId(coreq), svg, true));
    });
}

// Dibuja un path SVG entre dos nodos (ortogonal para reqs, diagonal para coreqs)
function drawOrthogonalPath(fromId, toId, svg, isCoreq = false) {
    const startEl = document.getElementById(fromId);
    const endEl   = document.getElementById(toId);
    if (!startEl || !endEl) return;

    const svgRect   = svg.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect   = endEl.getBoundingClientRect();

    const startX = startRect.right  - svgRect.left;
    const startY = startRect.top    + startRect.height / 2 - svgRect.top;
    const endX   = endRect.left     - svgRect.left;
    const endY   = endRect.top      + endRect.height / 2 - svgRect.top;

    let d;
    if (isCoreq) {
        d = `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
        const midX = (startX + endX) / 2;
        d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d',  d);
    path.setAttribute('id', `line-${fromId}-${toId}`);
    svg.appendChild(path);
}

// Activa/desactiva el modo hover sobre un nodo: resalta relaciones
function handleHover(id, active) {
    if (active) {
        document.body.classList.add('hover-mode');
        document.getElementById(id).classList.add('highlight-main');

        const course = coursesDB.find(c => c.id === id);
        course.reqs.forEach(req   => highlightRel(resolveCourseId(req), id, 'path-req',    'highlight-req'));
        course.coreqs.forEach(co  => highlightRel(id, resolveCourseId(co), 'path-coreq',   'highlight-coreq'));
        coursesDB.filter(c => c.reqs.some(r => resolveCourseId(r) === id))
                .forEach(unl     => highlightRel(id, unl.id, 'path-unlock', 'highlight-unlock'));
    } else {
        document.body.classList.remove('hover-mode');
        document.querySelectorAll('.node').forEach(n => {
            n.classList.remove('highlight-main', 'highlight-req', 'highlight-coreq', 'highlight-unlock');
            n.style.opacity = '';
            n.style.filter  = '';
        });
        document.querySelectorAll('path').forEach(p => p.setAttribute('class', ''));
        if (activeFilterSemester) filterByUserSemester(activeFilterSemester);
    }
}

// Aplica clases de resaltado a dos nodos y a la línea entre ellos
function highlightRel(from, to, lineClass, nodeClass) {
    const el1 = document.getElementById(from);
    const el2 = document.getElementById(to);
    if (el1) { el1.classList.add(nodeClass); el1.style.opacity = '1'; el1.style.filter = 'none'; }
    if (el2) { el2.classList.add(nodeClass); el2.style.opacity = '1'; el2.style.filter = 'none'; }
    const line = document.getElementById(`line-${from}-${to}`);
    if (line) line.setAttribute('class', lineClass);
}


// =============================================================================
// 6. FILTROS DE SEMESTRE Y STATS DEL HUD
// =============================================================================

// Activa el filtro de semestre: resalta cursos del semestre y los desbloqueados
function filterByUserSemester(sem) {
    activeFilterSemester = sem;
    updateStats(sem);

    document.querySelectorAll('.btn-sem').forEach(b => b.classList.remove('active', 'active-summer'));

    if (sem !== null) {
        const btnId = `btnS${sem.toString().replace('.', '_')}`;
        const btn   = document.getElementById(btnId);
        if (btn) {
            btn.classList.add('active');
            if (sem % 1 !== 0) btn.classList.add('active-summer');
        }

        document.body.classList.add('filtering-active');

        const passedIds = coursesDB
            .filter(c => c.status === 'aprobado' || (c.userSem !== null && c.userSem <= sem))
            .map(c => c.id);

        document.querySelectorAll('.node').forEach(n => {
            n.classList.remove('filter-selected', 'filter-unlocked');
            const courseUserSem = parseFloat(n.dataset.userSem);
            const cData = coursesDB.find(c => c.id === n.id);

            if (courseUserSem === sem) {
                n.classList.add('filter-selected');
            } else if (isNaN(courseUserSem) || courseUserSem > sem) {
                if (!cData) return;
                const allReqsMet = cData.reqs.length === 0 ||
                    cData.reqs.filter(r => passedIds.includes(resolveCourseId(r))).length === cData.reqs.length;
                const coreqsAvailable = cData.coreqs.every(coId => {
                    const rc = resolveCourseId(coId);
                    if (passedIds.includes(rc)) return true;
                    const coCourse = coursesDB.find(x => x.id === rc);
                    return coCourse && coCourse.reqs.every(r => passedIds.includes(resolveCourseId(r)));
                });
                if (allReqsMet && coreqsAvailable) n.classList.add('filter-unlocked');
            }
        });
    } else {
        document.body.classList.remove('filtering-active');
        document.querySelectorAll('.node').forEach(n => n.classList.remove('filter-selected', 'filter-unlocked'));
        document.getElementById('btnSnull')?.classList.add('active');
    }
}

// Actualiza los contadores de créditos en el HUD
function updateStats(sem) {
    const panel = document.getElementById('statsPanel');
    if (panel) panel.style.display = 'flex';

    const userSpan  = document.getElementById('dispUserCreds');
    const blockSpan = document.getElementById('dispBlockCreds');
    const descUser  = document.getElementById('descUserCreds');
    const descBlock = document.getElementById('descBlockCreds');

    if (sem === null) {
        const totalCreds    = coursesDB.filter(c => !c.isRetry).reduce((sum, c) => sum + c.cred, 0);
        const approvedCreds = coursesDB.filter(c => c.status === 'aprobado').reduce((sum, c) => sum + c.cred, 0);
        if (userSpan)  { userSpan.innerText = approvedCreds; userSpan.className = 'stat-num'; userSpan.style.color = 'var(--filter-unlocked)'; }
        if (blockSpan) blockSpan.innerText = totalCreds;
        if (descUser)  descUser.innerText  = 'Aprobados';
        if (descBlock) descBlock.innerText = 'Total Carrera';
    } else {
        const myCredits      = coursesDB.filter(c => parseFloat(c.userSem) === sem).reduce((sum, c) => sum + c.cred, 0);
        const officialCredits = coursesDB.filter(c => c.block === sem).reduce((sum, c) => sum + c.cred, 0);
        if (userSpan) {
            userSpan.innerText  = myCredits;
            userSpan.className  = 'stat-num';
            userSpan.style.color = '';
            if (myCredits > officialCredits) userSpan.classList.add('over');
            if (myCredits < officialCredits) userSpan.classList.add('under');
        }
        if (blockSpan) blockSpan.innerText = officialCredits;
        if (descUser)  descUser.innerText  = 'Mis Créditos';
        if (descBlock) descBlock.innerText = 'Oficiales';
    }
}

// Búsqueda en tiempo real de cursos por código o nombre
function searchCourse(query) {
    currentSearchQuery = query;
    const nodes     = document.querySelectorAll('.node');
    const resultsEl = document.getElementById('searchResultsCount');

    if (!query.trim()) {
        nodes.forEach(n => { n.style.opacity = '1'; n.style.filter = 'none'; n.style.transform = ''; n.style.boxShadow = ''; });
        if (resultsEl) { resultsEl.style.display = 'none'; resultsEl.textContent = ''; }
        return;
    }

    const q = query.toLowerCase();
    let matchCount = 0;
    let firstMatch = null;

    nodes.forEach(n => {
        const course = coursesDB.find(c => c.id === n.id);
        if (!course) return;
        const matches = course.id.toLowerCase().includes(q) || course.name.toLowerCase().includes(q);

        if (matches) {
            matchCount++;
            n.style.opacity   = '1';
            n.style.filter    = 'none';
            n.style.transform = 'scale(1.1)';
            n.style.boxShadow = '0 0 20px var(--filter-selected)';
            if (!firstMatch) {
                firstMatch = n;
                setTimeout(() => n.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
        } else {
            n.style.opacity   = '0.2';
            n.style.filter    = 'grayscale(80%)';
            n.style.transform = 'scale(1)';
            n.style.boxShadow = '';
        }
    });

    if (resultsEl) {
        resultsEl.style.display = 'block';
        resultsEl.textContent   = matchCount === 0 ? '❌ Sin resultados' : `🔎 ${matchCount} resultado${matchCount !== 1 ? 's' : ''}`;
        resultsEl.style.color   = matchCount === 0 ? '#ef4444' : 'var(--filter-selected)';
    }
}


// =============================================================================
// 7. MODAL DE CURSO (abrir / guardar / cerrar)
// =============================================================================

// Abre el modal de edición de un curso
function openModal(c) {
    currentCourse = c;
    renderAperturaInfo(c.id);
    const modal   = document.getElementById('courseModal');
    document.getElementById('modalCode').innerText   = `${c.id} • ${c.cred} Créditos`;
    document.getElementById('modalName').innerText   = c.name;
    document.getElementById('inpUserSem').value      = c.userSem || '';
    document.getElementById('inpProf').value         = c.prof    || '';
    document.getElementById('inpGrade').value        = (c.grade !== null && c.grade !== undefined) ? c.grade : '';
    document.getElementById('inpGrupo').value        = c.grupo   || '';
    document.getElementById('inpModalidad').value    = c.modalidad || '';
    setStatus(c.status || 'pendiente');

    // Renderizar bloques de horario
    const container = document.getElementById('horarioBlocks');
    container.innerHTML = '';
    const slots = c.horario && Array.isArray(c.horario) ? c.horario : [];
    if (slots.length === 0) {
        addHorarioBlock();
    } else {
        slots.forEach(s => addHorarioBlock(s));
    }

    modal.style.display = 'flex';
}

// Cierra el modal de edición de curso
function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// Actualiza el botón de estado activo en el selector del modal
function setStatus(status) {
    document.getElementById('inpStatus').value = status;
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === status);
    });
}

// Genera un id único para el intento (MA1102 -> MA1102_R2, _R3...)
function nextRetryId(baseId) {
    let n = 2;
    while (coursesDB.some(c => c.id === `${baseId}_R${n}`)) n++;
    return `${baseId}_R${n}`;
}

// Crea una copia independiente del curso como nuevo intento
function addCourseRetry(course) {
    const retry = {
        ...course,
        id: nextRetryId(course.id),
        reqs: [], coreqs: [],
        status: 'pendiente', userSem: null, grade: null,
        prof: '', grupo: '', modalidad: '', horario: null,
        isRetry: true, originalId: course.id
    };
    coursesDB.push(retry);
    saveToLocal();
    renderGrid();
    renderButtons();
    drawConnections();
}

// Pregunta si se desea agregar un intento tras reprobar
function askAddRetry(course) {
    const yaExiste = coursesDB.some(c => c.originalId === course.id && c.status !== 'aprobado');
    if (yaExiste) return;
    if (confirm(`❌ ${course.id} quedó reprobado.\n¿Deseas agregar un nuevo intento como tarjeta individual?`)) {
        addCourseRetry(course);
    }
}

// Elimina una tarjeta de intento
function deleteRetryCourse(id) {
    if (!confirm('¿Eliminar este intento del curso?')) return;
    coursesDB = coursesDB.filter(c => c.id !== id);
    saveToLocal();
    renderGrid();
    renderButtons();
    drawConnections();
    updateStats(activeFilterSemester);
}

// Devuelve el id del intento más reciente de un curso (o el original si no hay reintentos)
function resolveCourseId(baseId) {
    const retries = coursesDB.filter(c => c.originalId === baseId);
    return retries.length ? retries[retries.length - 1].id : baseId;
}

function hasSem(v) {
    return v !== null && v !== undefined && v !== '';
}

// Guarda los datos editados del curso y actualiza la interfaz
function saveCourseData() {
    try {
        const val = document.getElementById('inpUserSem').value;

        if (val !== '') {
            const num       = parseFloat(val);
            const isDecimal = num % 1 !== 0;
            if (isDecimal) {
                const base = Math.floor(num);
                if (base % 2 !== 0) {
                    alert('❌ Verano inválido. Los veranos solo existen después de semestres pares.\nVálidos: 2.5, 4.5, 6.5...\nInválidos: 1.5, 3.5, 5.5...');
                    return;
                }
            }
        }

        currentCourse.userSem    = val !== '' ? parseFloat(val) : null;
        currentCourse.status     = document.getElementById('inpStatus').value;
        currentCourse.prof       = document.getElementById('inpProf').value.trim();
        currentCourse.grupo      = document.getElementById('inpGrupo').value.trim();
        currentCourse.modalidad  = document.getElementById('inpModalidad').value;
        const gradeVal            = document.getElementById('inpGrade').value.trim();
        currentCourse.grade      = gradeVal === '' ? null : gradeVal;

        if (currentCourse.status === 'aprobado' && gradeVal !== '' && parseFloat(gradeVal) < 70) {
            currentCourse.status = 'reprobado';
        }
        if (!currentCourse.isRetry && currentCourse.status === 'reprobado') {
            askAddRetry(currentCourse);
        }

        const horarioSlots = [];
        document.querySelectorAll('.horario-block').forEach(row => {
            const days  = [...row.querySelectorAll('.day-btn.active')].map(b => b.dataset.day);
            const start = row.querySelector('.inp-start').value.trim();
            const end   = row.querySelector('.inp-end').value.trim();
            const aula  = row.querySelector('.inp-aula').value.trim();
            if (days.length > 0 && start && end) {
                horarioSlots.push({ days, start, end, aula });
            }
        });
        currentCourse.horario = horarioSlots.length > 0 ? horarioSlots : null;

        saveToLocal();
        renderGrid();
        renderButtons();
        drawConnections();

        if (activeFilterSemester !== null) filterByUserSemester(activeFilterSemester);
        else updateStats(null);

        if (document.getElementById('characterSheet').classList.contains('open')) updateCharacterSheet();
    } catch (err) {
        console.error('Error guardando curso:', err);
    } finally {
        closeModal();
    }
}


// =============================================================================
// 8. MODO EDICIÓN RÁPIDA
// =============================================================================

// Activa o desactiva el modo de edición rápida (marcar cursando / aprobado con un clic)
function toggleEditMode(mode) {
    if (editMode === mode) {
        editMode = null;
        document.body.classList.remove('edit-mode', `edit-mode-${mode}`);
        document.getElementById(`btnEdit${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.remove(`active-${mode}`);
    } else {
        if (editMode) {
            document.body.classList.remove(`edit-mode-${editMode}`);
            document.getElementById(`btnEdit${editMode.charAt(0).toUpperCase() + editMode.slice(1)}`).classList.remove(`active-${editMode}`);
        }
        editMode = mode;
        document.body.classList.add('edit-mode', `edit-mode-${mode}`);
        document.getElementById(`btnEdit${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add(`active-${mode}`);
    }
}


// =============================================================================
// 9. ÉNFASIS FORESTAL
// =============================================================================

// Retorna true si la carrera activa es cualquier variante de Forestal
function esForestal(key) {
    return key && key.startsWith('forestal');
}

// Retorna la clave del énfasis alternativo (el que no está activo)
function otroEnfasis() {
    if (currentMajor === 'forestal_manejoYproduccion')        return 'forestal_conservacionYrestauracion';
    if (currentMajor === 'forestal_conservacionYrestauracion') return 'forestal_manejoYproduccion';
    return null;
}

// Retorna el nombre legible de un énfasis dado su clave
function nombreEnfasis(key) {
    if (key === 'forestal_manejoYproduccion')        return '🌳 Manejo y Producción';
    if (key === 'forestal_conservacionYrestauracion') return '🍃 Conservación y Restauración';
    return '🌲 Forestal (genérico)';
}

// Actualiza los botones de énfasis en el HUD según la carrera activa
function renderEnfasisBtn() {
    const btnE = document.getElementById('btnEnfasis');
    const btnO = document.getElementById('btnOtroEnfasis');
    if (!btnE || !btnO) return;

    const tieneEnfasis = currentMajor === 'forestal_manejoYproduccion' ||
                         currentMajor === 'forestal_conservacionYrestauracion';

    btnE.style.display = esForestal(currentMajor) ? 'flex' : 'none';
    btnO.style.display = tieneEnfasis ? 'flex' : 'none';

    if (tieneEnfasis) {
        btnE.innerHTML = `${nombreEnfasis(currentMajor).split(' ')[0]} ÉNFASIS`;
        btnE.title     = `Énfasis activo: ${nombreEnfasis(currentMajor)} · Clic para cambiar`;
        btnO.innerHTML = `🔀 ${nombreEnfasis(otroEnfasis()).split(' ')[0]} VER`;
        btnO.title     = `Ver cursos de: ${nombreEnfasis(otroEnfasis())}`;
    } else {
        btnE.innerHTML = '🌿 ÉNFASIS';
        btnE.title     = 'Seleccioná tu énfasis';
    }
}

// Abre el modal para seleccionar o cambiar el énfasis de Forestal
function openEnfasisModal() {
    const activo = currentMajor !== 'forestal' ? currentMajor : null;

    const cardStyle = (key) => {
        const isActivo = activo === key;
        const color    = key === 'forestal_manejoYproduccion' ? '#10b981' : '#3b82f6';
        return `background:#09090b; border:2px solid ${isActivo ? color : '#333'};
                border-left:4px solid ${color}; border-radius:8px; padding:18px;
                cursor:pointer; transition:all 0.2s;
                ${isActivo ? `box-shadow:0 0 15px ${color}33;` : ''}`;
    };

    const badge = (key) => activo === key
        ? `<span style="background:${key === 'forestal_manejoYproduccion' ? '#10b981' : '#3b82f6'};
                        color:${key === 'forestal_manejoYproduccion' ? '#000' : '#fff'};
                        font-size:0.7rem; padding:2px 8px; border-radius:10px; font-weight:700;">
               ACTIVO
           </span>`
        : '';

    const modal         = document.createElement('div');
    modal.id            = 'enfasisModal';
    modal.className     = 'modal-overlay';
    modal.style.cssText = 'display:flex; z-index:5000;';
    modal.onclick       = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="modal-content" style="width:520px;">
            <div class="modal-header">
                <div class="modal-title-code" style="color:#10b981;">🌲 ING. FORESTAL</div>
                <div class="modal-title-name">Seleccioná tu énfasis</div>
            </div>
            <div class="modal-body" style="gap:16px;">
                <div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2);
                            border-radius:6px; padding:12px; font-size:0.88rem; color:var(--text-dim);">
                    💡 El progreso de los bloques 1-5 se conserva al cambiar de énfasis.
                    Los bloques 6-10 son propios de cada énfasis y se guardan por separado.
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div onclick="selectEnfasis('forestal_manejoYproduccion')" style="${cardStyle('forestal_manejoYproduccion')}">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-weight:700; color:#fff; font-size:1.05rem;">🌳 Manejo y Producción Forestal</span>
                            ${badge('forestal_manejoYproduccion')}
                        </div>
                        <div style="color:var(--text-dim); font-size:0.83rem;">Aprovechamiento · Manufactura · Plantaciones · Mercadeo forestal</div>
                    </div>
                    <div onclick="selectEnfasis('forestal_conservacionYrestauracion')" style="${cardStyle('forestal_conservacionYrestauracion')}">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-weight:700; color:#fff; font-size:1.05rem;">🍃 Conservación y Restauración</span>
                            ${badge('forestal_conservacionYrestauracion')}
                        </div>
                        <div style="color:var(--text-dim); font-size:0.83rem;">Restauración ecológica · Fauna silvestre · Impacto ambiental</div>
                    </div>
                    ${activo ? `
                    <div onclick="selectEnfasis('forestal')"
                         style="background:#09090b; border:1px dashed #444; border-radius:8px;
                                padding:12px; cursor:pointer; text-align:center; transition:all 0.2s;"
                         onmouseover="this.style.borderColor='#666'" onmouseout="this.style.borderColor='#444'">
                        <span style="color:#555; font-size:0.85rem;">✕ Quitar énfasis · volver al plan genérico (bloques 1-5)</span>
                    </div>` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-cancel" onclick="document.getElementById('enfasisModal').remove()">Cancelar</button>
            </div>
        </div>`;

    document.body.appendChild(modal);
}

// Cambia al énfasis indicado, migrando el progreso de los cursos comunes
function selectEnfasis(majorKey) {
    document.getElementById('enfasisModal')?.remove();

    const progresoActual = JSON.parse(JSON.stringify(coursesDB));

    localStorage.setItem('TecPlanner_ActiveMajor', majorKey);
    currentMajor = majorKey;
    coursesDB    = JSON.parse(JSON.stringify(curriculums[majorKey]));

    const savedData = localStorage.getItem(`TecPlanner_Data_${majorKey}`);
    if (savedData) {
        // Ya había progreso guardado en este énfasis: restaurarlo
        const parsedSaved = JSON.parse(savedData);
        const savedList    = Array.isArray(parsedSaved) ? parsedSaved : (parsedSaved.courses || []);
        savedList.forEach(saved => {
            const c = coursesDB.find(x => x.id === saved.id);
            if (c) { c.userSem = saved.userSem; c.status = saved.status; c.grade = saved.grade; c.prof = saved.prof; }
        });
    } else {
        // Primera vez en este énfasis: migrar cursos comunes del anterior
        progresoActual.forEach(anterior => {
            const c = coursesDB.find(x => x.id === anterior.id);
            if (c) { c.userSem = anterior.userSem; c.status = anterior.status; c.grade = anterior.grade; c.prof = anterior.prof; }
        });
    }

    const title = MAJOR_TITLES[majorKey] || majorKey.toUpperCase();
    document.getElementById('hudTitle').innerText = `TEC // ${title}`;

    saveToLocal();
    renderGrid();
    renderButtons();
    setTimeout(drawConnections, 150);
    setTimeout(drawConnections, 700);
    updateStats(activeFilterSemester);
    renderEnfasisBtn();

    if (document.getElementById('characterSheet').classList.contains('open')) updateCharacterSheet();
}

// Muestra el panel comparativo del otro énfasis (sin cambiar al activo)
function openOtroEnfasisPanel() {
    const otroKey = otroEnfasis();
    if (!otroKey) return;

    const otroNombre = nombreEnfasis(otroKey);
    const otroPlan   = JSON.parse(JSON.stringify(curriculums[otroKey]));

    // Cargar progreso guardado del otro énfasis si existe
    const savedData = localStorage.getItem(`TecPlanner_Data_${otroKey}`);
    if (savedData) {
        const parsedSaved = JSON.parse(savedData);
        const savedList    = Array.isArray(parsedSaved) ? parsedSaved : (parsedSaved.courses || []);
        savedList.forEach(saved => {
            const c = otroPlan.find(x => x.id === saved.id);
            if (c) { c.userSem = saved.userSem; c.status = saved.status; c.grade = saved.grade; }
        });
    }

    const exclusivos = otroPlan.filter(c => c.block >= 6);
    const bloques    = {};
    exclusivos.forEach(c => {
        if (!bloques[c.block]) bloques[c.block] = [];
        bloques[c.block].push(c);
    });

    const statusColor = (s) => s === 'aprobado' ? '#10b981' : s === 'cursando' ? '#06b6d4' : '#555';
    const statusLabel = (s) => s === 'aprobado' ? '✅ Aprobado' : s === 'cursando' ? '⚡ Cursando' : '⬜ Pendiente';

    const totalCreds = otroPlan.reduce((s, c) => s + c.cred, 0);
    const exclCreds  = exclusivos.reduce((s, c) => s + c.cred, 0);
    const aprobCreds = exclusivos.filter(c => c.status === 'aprobado').reduce((s, c) => s + c.cred, 0);

    let tablasHtml = '';
    Object.keys(bloques).sort((a, b) => a - b).forEach(blk => {
        tablasHtml += `
            <div style="margin-bottom:16px;">
                <div style="font-size:0.75rem; color:var(--accent); text-transform:uppercase;
                            letter-spacing:1px; font-weight:700; margin-bottom:8px; padding-left:4px;">Bloque ${blk}</div>
                <div style="background:#09090b; border:1px solid #27272a; border-radius:6px; overflow:hidden;">`;
        bloques[blk].forEach((c, i) => {
            const borderTop = i > 0 ? 'border-top:1px solid #1a1a1a;' : '';
            tablasHtml += `
                <div style="display:grid; grid-template-columns:1fr 40px 80px 100px; gap:8px; align-items:center; padding:10px 14px; ${borderTop}">
                    <div>
                        <div style="font-size:0.72rem; color:var(--accent); font-weight:700;">${c.id}</div>
                        <div style="font-size:0.88rem; color:#fff;">${c.name}</div>
                    </div>
                    <div style="text-align:center; font-size:0.8rem; color:#555;">${c.cred} cr</div>
                    <div style="text-align:center; font-size:0.75rem; color:#555;">Bloque ${c.block}</div>
                    <div style="text-align:right; font-size:0.78rem; color:${statusColor(c.status || 'pendiente')};">${statusLabel(c.status || 'pendiente')}</div>
                </div>`;
        });
        tablasHtml += `</div></div>`;
    });

    const modal         = document.createElement('div');
    modal.id            = 'otroEnfasisModal';
    modal.className     = 'modal-overlay';
    modal.style.cssText = 'display:flex; z-index:5000;';
    modal.onclick       = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="modal-content" style="width:600px; height:88vh; display:flex; flex-direction:column; overflow:hidden;">
            <div class="modal-header">
                <div>
                    <div class="modal-title-code" style="color:#555;">COMPARACIÓN DE ÉNFASIS</div>
                    <div class="modal-title-name" style="font-size:1.3rem;">${otroNombre}</div>
                </div>
                <button onclick="document.getElementById('otroEnfasisModal').remove()"
                        style="background:none; border:none; color:var(--text-dim); font-size:1.5rem; cursor:pointer; line-height:1; padding:0 4px;">×</button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1px; background:#27272a; border-bottom:1px solid #27272a;">
                <div style="background:#121214; padding:14px; text-align:center;">
                    <div style="font-size:1.4rem; font-weight:700; color:#fff;">${totalCreds}</div>
                    <div style="font-size:0.7rem; color:#555; text-transform:uppercase; margin-top:2px;">Créditos totales</div>
                </div>
                <div style="background:#121214; padding:14px; text-align:center;">
                    <div style="font-size:1.4rem; font-weight:700; color:var(--accent);">${exclCreds}</div>
                    <div style="font-size:0.7rem; color:#555; text-transform:uppercase; margin-top:2px;">Créditos exclusivos</div>
                </div>
                <div style="background:#121214; padding:14px; text-align:center;">
                    <div style="font-size:1.4rem; font-weight:700; color:#10b981;">${aprobCreds}</div>
                    <div style="font-size:0.7rem; color:#555; text-transform:uppercase; margin-top:2px;">Aprobados en este énfasis</div>
                </div>
            </div>
            <div style="overflow-y:auto; flex:1; min-height:0; padding:20px 28px;">
                <div style="font-size:0.78rem; color:#555; margin-bottom:16px; padding:10px 12px;
                            background:#09090b; border-radius:6px; border:1px dashed #333;">
                    Mostrando solo los cursos exclusivos de este énfasis (bloques 6-10).
                    Los bloques 1-5 son comunes y ya los ves en tu árbol principal.
                </div>
                ${tablasHtml}
            </div>
            <div class="modal-footer" style="flex-direction:column; gap:10px;">
                <div style="font-size:0.82rem; color:var(--text-dim); text-align:center;">¿Querés cambiar a este énfasis?</div>
                <div style="display:flex; gap:12px; width:100%;">
                    <button class="btn-modal btn-cancel" onclick="document.getElementById('otroEnfasisModal').remove()">Cerrar</button>
                    <button class="btn-modal btn-confirm"
                            onclick="document.getElementById('otroEnfasisModal').remove(); selectEnfasis('${otroKey}')">
                        Cambiar a este énfasis
                    </button>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);
}

// Construye la columna visual de bifurcación forestal (entre bloque 5 y 6)
function buildEnfasisColumn() {
    const col        = document.createElement('div');
    col.className    = 'semester-column';
    col.id           = 'enfasisColumn';
    col.style.cssText = 'min-width:160px; justify-content:center; align-items:center;';

    const tieneEnfasis = currentMajor !== 'forestal';
    const colorActivo  = currentMajor === 'forestal_manejoYproduccion' ? '#10b981' : '#3b82f6';

    col.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:12px; padding:20px 10px; position:sticky; top:40px;">
            <div style="width:2px; height:40px; background:linear-gradient(to bottom, #333, ${tieneEnfasis ? colorActivo : 'var(--accent)'}); border-radius:2px;"></div>
            <div style="background:${tieneEnfasis ? colorActivo + '18' : 'rgba(130,87,230,0.08)'};
                        border:2px solid ${tieneEnfasis ? colorActivo : 'var(--accent)'};
                        border-radius:12px; padding:18px 14px; text-align:center;
                        box-shadow: 0 0 20px ${tieneEnfasis ? colorActivo + '33' : 'rgba(130,87,230,0.2)'}; min-width:140px;">
                <div style="font-size:1.4rem; margin-bottom:8px;">
                    ${tieneEnfasis ? (currentMajor === 'forestal_manejoYproduccion' ? '🌳' : '🍃') : '🌿'}
                </div>
                <div style="font-size:0.7rem; color:#555; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    ${tieneEnfasis ? 'Énfasis activo' : 'Bifurcación'}
                </div>
                <div style="font-weight:700; color:${tieneEnfasis ? colorActivo : 'var(--accent)'}; font-size:0.85rem; margin-bottom:12px; line-height:1.3;">
                    ${tieneEnfasis ? nombreEnfasis(currentMajor).replace(/^[^\s]+\s/, '') : 'Seleccioná\ntu énfasis'}
                </div>
                ${tieneEnfasis ? `
                <button onclick="openEnfasisModal()"
                        style="background:transparent; border:1px solid ${colorActivo}; color:${colorActivo};
                               padding:5px 12px; border-radius:6px; cursor:pointer; font-family:'Rajdhani',sans-serif;
                               font-weight:700; font-size:0.75rem; width:100%; transition:all 0.2s;"
                        onmouseover="this.style.background='${colorActivo}22'"
                        onmouseout="this.style.background='transparent'">Cambiar</button>` : `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <button onclick="selectEnfasis('forestal_manejoYproduccion')"
                            style="background:rgba(16,185,129,0.08); border:1px solid #10b981; color:#10b981;
                                   padding:7px 10px; border-radius:6px; cursor:pointer; font-family:'Rajdhani',sans-serif;
                                   font-weight:700; font-size:0.75rem; width:100%; transition:all 0.2s;"
                            onmouseover="this.style.background='rgba(16,185,129,0.18)'"
                            onmouseout="this.style.background='rgba(16,185,129,0.08)'">🌳 Manejo</button>
                    <button onclick="selectEnfasis('forestal_conservacionYrestauracion')"
                            style="background:rgba(59,130,246,0.08); border:1px solid #3b82f6; color:#3b82f6;
                                   padding:7px 10px; border-radius:6px; cursor:pointer; font-family:'Rajdhani',sans-serif;
                                   font-weight:700; font-size:0.75rem; width:100%; transition:all 0.2s;"
                            onmouseover="this.style.background='rgba(59,130,246,0.18)'"
                            onmouseout="this.style.background='rgba(59,130,246,0.08)'">🍃 Conservación</button>
                </div>`}
            </div>
            <div style="width:2px; height:40px; background:linear-gradient(to bottom, ${tieneEnfasis ? colorActivo : 'var(--accent)'}, #333); border-radius:2px;"></div>
        </div>`;

    return col;
}


// =============================================================================
// 10. PERFIL ACADÉMICO (character sheet)
// =============================================================================

// Abre o cierra el panel lateral de perfil académico
function toggleCharacterSheet() {
    const sheet = document.getElementById('characterSheet');
    sheet.classList.toggle('open');
    if (sheet.classList.contains('open')) updateCharacterSheet();
}

// Recalcula y renderiza todo el contenido del perfil académico
function updateCharacterSheet() {
    let totalCreds = 0, sumGrades = 0;
    coursesDB.forEach(c => {
        if (c.status === 'aprobado' && c.grade && !isNaN(c.grade) && c.grade.toString().trim() !== '') {
            const gradeNum = parseFloat(c.grade);
            totalCreds += c.cred;
            sumGrades  += gradeNum * c.cred;
        }
    });
    document.getElementById('pondGeneral').innerText = totalCreds > 0 ? (sumGrades / totalCreds).toFixed(2) : '0.00';

    updateProgressDashboard();
    renderQuestLog();
}

// Retorna el color correspondiente a una nota numérica
function getGradeColor(grade) {
    if (grade >= 90) return '#10b981';
    if (grade >= 80) return '#34d399';
    if (grade >= 70) return '#fbbf24';
    if (grade >= 60) return '#fb923c';
    return '#ef4444';
}

// Actualiza la barra de progreso y el gráfico de barras de créditos por semestre
function updateProgressDashboard() {
    const totalCreds    = coursesDB.filter(c => !c.isRetry).reduce((sum, c) => sum + c.cred, 0);
    const approvedCreds = coursesDB.filter(c => c.status === 'aprobado').reduce((sum, c) => sum + c.cred, 0);
    const percentage      = ((approvedCreds / totalCreds) * 100).toFixed(1);

    const bar = document.getElementById('totalProgress');
    if (bar) bar.style.width = `${percentage}%`;

    const stats = document.getElementById('progressStats');
    if (stats) stats.innerText = `${approvedCreds} / ${totalCreds} créditos (${percentage}%)`;

    // Gráfico de barras de créditos por semestre
    const semesterData = {};
    coursesDB.forEach(c => {
        if (hasSem(c.userSem)) {
            if (!semesterData[c.userSem]) semesterData[c.userSem] = 0;
            semesterData[c.userSem] += c.cred;
        }
    });

    const chartContainer = document.getElementById('semesterChart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '';

    Object.keys(semesterData).sort((a, b) => a - b).forEach(sem => {
        const credits    = semesterData[sem];
        const maxCredits = Math.max(...Object.values(semesterData));
        const height     = (credits / maxCredits) * 100;

        const bar = document.createElement('div');
        bar.className  = 'chart-bar';
        bar.style.height = `${height}%`;
        bar.innerHTML  = `<div class="chart-bar-value">${credits}</div><div class="chart-bar-label">S${sem}</div>`;
        bar.title      = `Semestre ${sem}: ${credits} créditos`;
        chartContainer.appendChild(bar);
    });
}

// Cambia la vista del quest log entre el plan del usuario y el plan oficial TEC
function switchQuestLogView(view) {
    questLogView = view;
    document.getElementById('tabUserPlan').classList.toggle('active',    view === 'user');
    document.getElementById('tabOriginalPlan').classList.toggle('active', view === 'original');
    renderQuestLog();
}

// Renderiza el historial de cursos (quest log) en el perfil
function renderQuestLog() {
    const logContainer = document.getElementById('questLogContainer');
    let html = '';

    if (questLogView === 'user') {
        const sems = {};
        coursesDB.forEach(c => {
            if (hasSem(c.userSem)) {
                if (!sems[c.userSem]) sems[c.userSem] = [];
                sems[c.userSem].push(c);
            }
        });

        const sortedSems = Object.keys(sems).sort((a, b) => parseFloat(a) - parseFloat(b));

        if (sortedSems.length === 0) {
            html = `
                <div style="text-align: center; padding: 40px; color: var(--text-dim);">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📅</div>
                    <div style="font-size: 1.1rem; margin-bottom: 5px;">No hay cursos planificados</div>
                    <div style="font-size: 0.9rem;">Haz click en un curso y asigna un semestre</div>
                </div>`;
        } else {
            sortedSems.forEach(semNum => {
                const cursos   = sems[semNum];
                const semInt   = Math.floor(parseFloat(semNum));
                const isVerano = parseFloat(semNum) % 1 !== 0;
                const semName  = isVerano ? `☀️ Verano ${semInt}` : `📖 Semestre ${semInt}`;

                const totalCreds  = cursos.reduce((s, c) => s + c.cred, 0);
                const conNota     = cursos.filter(c => c.status === 'aprobado' && c.grade && c.grade.toString().trim() !== '');
                const credConNota = conNota.reduce((s, c) => s + c.cred, 0);
                const sumaPond    = conNota.reduce((s, c) => s + parseFloat(c.grade) * c.cred, 0);
                const hayProm     = credConNota > 0;
                const promedio    = hayProm ? sumaPond / credConNota : null;

                html += `<div class="ql-semester">`;
                html += `
                    <div class="ql-sem-title" style="display:flex; justify-content:space-between; align-items:center;
                                background: ${isVerano ? 'rgba(255, 107, 53, 0.1)' : 'rgba(130, 87, 230, 0.05)'};
                                border-left: 3px solid ${isVerano ? '#ff6b35' : 'var(--accent)'};">
                        <span>${semName}</span>
                        <span style="display:flex; gap:10px; align-items:center; font-size:0.75rem; color:var(--text-dim); font-weight:600;">
                            <span>${cursos.length} curso${cursos.length !== 1 ? 's' : ''}</span>
                            <span>${totalCreds} cr</span>
                            <span style="color:${hayProm ? getGradeColor(promedio) : '#555'}; font-weight:700; font-size:0.95rem;">
                                ${hayProm ? promedio.toFixed(2) : '—'}
                            </span>
                        </span>
                    </div>`;
                cursos.forEach(c => {
                    let gradeClass = 'none', gradeText = '-';
                    if (c.grade && c.grade.toString().trim() !== '') {
                        gradeText  = parseFloat(c.grade).toFixed(0);
                        gradeClass = parseFloat(c.grade) >= 70 ? 'good' : 'bad';
                    }
                    html += `<div class="ql-course"><span>${c.id} - ${c.name}</span><span class="ql-grade ${gradeClass}">${gradeText}</span></div>`;
                });
                html += `</div>`;
            });
        }

    } else {
        // Vista del plan oficial TEC: agrupado por bloque
        const blocks = {};
        coursesDB.forEach(c => {
            if (!blocks[c.block]) blocks[c.block] = [];
            blocks[c.block].push(c);
        });

        Object.keys(blocks).sort((a, b) => parseInt(a) - parseInt(b)).forEach(blockNum => {
            html += `<div class="ql-semester">`;
            html += `<div class="ql-sem-title" style="background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6;">📚 Bloque ${blockNum} (TEC)</div>`;
            blocks[blockNum].forEach(c => {
                const userSemText = hasSem(c.userSem) ? `<span style="color: var(--accent); font-size: 0.75rem; margin-left: 8px;">(Planeado: S${c.userSem})</span>` : '';
                let gradeClass = 'none', gradeText = '-';
                if (c.grade && c.grade.toString().trim() !== '') {
                    gradeText  = parseFloat(c.grade).toFixed(0);
                    gradeClass = parseFloat(c.grade) >= 70 ? 'good' : 'bad';
                }
                html += `<div class="ql-course"><span>${c.id} - ${c.name} ${userSemText}</span><span class="ql-grade ${gradeClass}">${gradeText}</span></div>`;
            });
            html += `</div>`;
        });
    }

    logContainer.innerHTML = html;
}


// =============================================================================
// 11. PROMEDIO PONDERADO (modal detallado)
// =============================================================================

// Abre el modal con el desglose completo del promedio ponderado por semestre
function openPondModal() {
    const sems = {};
    coursesDB.forEach(c => {
        if (!c.userSem) return;
        if (!sems[c.userSem]) sems[c.userSem] = [];
        sems[c.userSem].push(c);
    });

    const semKeys = Object.keys(sems).sort((a, b) => parseFloat(a) - parseFloat(b));
    const body    = document.getElementById('pondModalBody');

    if (semKeys.length === 0) {
        body.innerHTML = `
            <div style="text-align:center; padding:50px 20px; color:var(--text-dim);">
                <div style="font-size:3rem; margin-bottom:12px;">📅</div>
                <div style="font-size:1.1rem;">No hay cursos planificados aún.</div>
            </div>`;
        document.getElementById('pondModalTotal').textContent = '—';
        document.getElementById('pondModal').classList.add('open');
        return;
    }

    let globalCreds = 0, globalSum = 0;
    let html = '';

    semKeys.forEach(sem => {
        const courses       = sems[sem];
        const totalCredsSem = courses.reduce((s, c) => s + c.cred, 0);
        const conNota       = courses.filter(c =>
            c.status === 'aprobado' && c.grade !== undefined && c.grade !== null && c.grade.toString().trim() !== '');
        const credConNota   = conNota.reduce((s, c) => s + c.cred, 0);
        const sumPond       = conNota.reduce((s, c) => s + parseFloat(c.grade) * c.cred, 0);
        const hayProm       = credConNota > 0;
        const promSem       = hayProm ? sumPond / credConNota : null;

        if (hayProm) { globalCreds += credConNota; globalSum += sumPond; }

        const isSummer = parseFloat(sem) % 1 !== 0;
        const semLabel = isSummer ? `☀️ Verano ${Math.floor(parseFloat(sem))}` : `📖 Semestre ${sem}`;

        html += `<div class="pond-sem-block">
            <div class="pond-sem-header">
                <span class="pond-sem-name">${semLabel}
                    <span style="font-size:0.75rem; color:#555; font-weight:400; margin-left:8px;">${totalCredsSem} cr totales</span>
                </span>
                <span class="pond-sem-avg" style="color:${hayProm ? gradeColor(promSem) : '#555'};">
                    ${hayProm ? promSem.toFixed(2) : '—'}
                </span>
            </div>
            <div class="pond-course-row" style="background:#0d0d0f; border-top:1px solid #27272a;">
                <span class="pond-col-header">Curso</span>
                <span class="pond-col-header" style="text-align:center;">Cr</span>
                <span class="pond-col-header" style="text-align:center;">Peso %</span>
                <span class="pond-col-header" style="text-align:center;">Nota</span>
                <span class="pond-col-header" style="text-align:right;">Aporte</span>
            </div>`;

        courses.forEach(c => {
            const peso      = totalCredsSem > 0 ? (c.cred / totalCredsSem * 100) : 0;
            const tieneNota = c.status === 'aprobado' && c.grade !== undefined && c.grade !== null && c.grade.toString().trim() !== '';

            if (tieneNota) {
                const nota   = parseFloat(c.grade);
                const aporte = nota * c.cred / credConNota;
                html += `<div class="pond-course-row">
                    <span class="pond-col-name" title="${c.name}">${c.id} · ${c.name}</span>
                    <span class="pond-col-cred">${c.cred}</span>
                    <span class="pond-col-peso">${peso.toFixed(1)}%</span>
                    <span class="pond-col-nota" style="color:${gradeColor(nota)};">${nota.toFixed(0)}</span>
                    <span class="pond-col-aporte">${aporte.toFixed(2)} pts</span>
                </div>`;
            } else {
                const dimStyle  = c.status !== 'aprobado' ? 'opacity:0.8;' : 'opacity:0.9;';
                const statusTag = c.status === 'cursando'
                    ? `<span style="font-size:0.68rem; color:var(--status-cursando); margin-left:6px;">cursando</span>`
                    : c.status === 'pendiente'
                    ? `<span style="font-size:0.68rem; color:#555; margin-left:6px;">pendiente</span>`
                    : `<span style="font-size:0.68rem; color:#555; margin-left:6px;">sin nota</span>`;
                html += `<div class="pond-course-row" style="${dimStyle}">
                    <span class="pond-col-name" title="${c.name}">${c.id} · ${c.name} ${statusTag}</span>
                    <span class="pond-col-cred">${c.cred}</span>
                    <span class="pond-col-peso">${peso.toFixed(1)}%</span>
                    <span class="pond-col-nota" style="color:#555;">—</span>
                    <span class="pond-col-aporte" style="color:#555;">—</span>
                </div>`;
            }
        });

        html += `</div>`;
    });

    body.innerHTML = html;

    const total   = globalCreds > 0 ? (globalSum / globalCreds).toFixed(2) : '—';
    const totalEl = document.getElementById('pondModalTotal');
    totalEl.textContent = total;
    totalEl.style.color = globalCreds > 0 ? gradeColor(parseFloat(total)) : '#555';
    document.getElementById('pondModal').classList.add('open');
}

// Cierra el modal de promedio ponderado
function closePondModal() {
    document.getElementById('pondModal').classList.remove('open');
}

// Retorna el color de una nota para el modal de ponderado (usa escala más fina)
function gradeColor(g) {
    if (g >= 90) return '#10b981';
    if (g >= 80) return '#34d399';
    if (g >= 70) return '#fbbf24';
    if (g >= 60) return '#fb923c';
    return '#ef4444';
}


// =============================================================================
// 12. CARGA MASIVA DE NOTAS
// =============================================================================

// Abre el modal de carga masiva para los cursos en estado "cursando"
function openBulkGrades() {
    const cursando  = coursesDB.filter(c => c.status === 'cursando');
    const body      = document.getElementById('bulkGradesBody');
    const subtitle  = document.getElementById('bulkGradesSubtitle');

    if (cursando.length === 0) {
        body.innerHTML  = `
            <div style="text-align:center; padding: 40px; color: var(--text-dim);">
                <div style="font-size: 3rem; margin-bottom: 12px;">🎓</div>
                <div style="font-size: 1.1rem;">No hay cursos marcados como <strong style="color: var(--status-cursando);">Cursando</strong>.</div>
            </div>`;
        subtitle.innerText = 'Sin cursos activos';
        document.getElementById('bulkGradesModal').style.display = 'flex';
        return;
    }

    subtitle.innerText = `${cursando.length} curso${cursando.length !== 1 ? 's' : ''} activo${cursando.length !== 1 ? 's' : ''}`;

    // Agrupar por semestre
    const groups = {};
    cursando.forEach(c => {
        const key = c.userSem ? `S${c.userSem}` : 'Sin semestre';
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
    });

    let html = '';
    Object.keys(groups).sort().forEach(key => {
        html += `<div style="font-size: 0.75rem; color: var(--accent); text-transform: uppercase;
                             letter-spacing: 1px; font-weight: 700; margin: 4px 0 8px 0;">${key}</div>`;
        groups[key].forEach(c => {
            html += `
                <div style="display: flex; align-items: center; gap: 12px;
                            background: #09090b; border: 1px solid #333; border-left: 3px solid var(--status-cursando);
                            border-radius: 6px; padding: 12px 14px; margin-bottom: 8px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.72rem; color: var(--accent); font-weight: 700;">${c.id}</div>
                        <div style="font-size: 0.9rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.name}</div>
                        <div style="font-size: 0.72rem; color: #555; margin-top: 2px;">${c.cred} créditos</div>
                    </div>
                    <input type="number" id="bulk_${c.id}" value="${c.grade || ''}"
                           min="0" max="100" step="0.1" placeholder="0–100"
                           style="width: 90px; background: #18181b; border: 1px solid #444; color: #fff;
                                  padding: 10px; border-radius: 6px; font-family: 'Rajdhani', sans-serif;
                                  font-size: 1.1rem; text-align: center;"
                           oninput="highlightBulkInput(this)">
                </div>`;
        });
    });

    body.innerHTML = html;
    document.getElementById('bulkGradesModal').style.display = 'flex';
}

// Colorea el borde del input de nota según si aprueba o reprueba
function highlightBulkInput(input) {
    const val = parseFloat(input.value);
    if (isNaN(val) || input.value.trim() === '') {
        input.style.borderColor = '#444'; input.style.color = '#fff';
    } else if (val >= 70) {
        input.style.borderColor = 'var(--status-aprobado)'; input.style.color = '#4ade80';
    } else {
        input.style.borderColor = 'var(--anomaly)'; input.style.color = '#f87171';
    }
}

// Guarda todas las notas ingresadas en el modal masivo
function saveBulkGrades() {
    const cursando = coursesDB.filter(c => c.status === 'cursando');
    let changed    = 0;

    cursando.forEach(c => {
        const input = document.getElementById(`bulk_${c.id}`);
        if (!input) return;
        const val = input.value.trim();
        if (val === '') { c.grade = null; changed++; return; }
        const nota = parseFloat(val);
        if (isNaN(nota)) return;
        c.grade = nota;
        if (nota >= 70) c.status = 'aprobado';
        changed++;
    });

    if (changed === 0) { closeBulkGrades(); return; }

    saveToLocal();
    renderGrid();
    renderButtons();
    drawConnections();
    updateStats(activeFilterSemester);
    if (activeFilterSemester) filterByUserSemester(activeFilterSemester);
    if (document.getElementById('characterSheet').classList.contains('open')) updateCharacterSheet();

    closeBulkGrades();
}

// Cierra el modal de carga masiva de notas
function closeBulkGrades() {
    document.getElementById('bulkGradesModal').style.display = 'none';
}


// =============================================================================
// 13. VISTA LISTA
// =============================================================================

// Alterna entre la vista de árbol y la vista de lista
function toggleViewMode() {
    const gameArea = document.querySelector('.game-area');
    const listView = document.getElementById('listView');
    const btn      = document.getElementById('btnViewMode');

    if (viewMode === 'tree') {
        viewMode               = 'list';
        gameArea.style.display = 'none';
        listView.style.display = 'block';
        btn.innerHTML          = '🌳 ÁRBOL';
        renderListView();
    } else {
        viewMode               = 'tree';
        gameArea.style.display = 'block';
        listView.style.display = 'none';
        btn.innerHTML          = '📋 LISTA';
    }
}

// Inicializa la vista de lista: pobla el select de semestres y dibuja la tabla
function renderListView() {
    const filterSem  = document.getElementById('listFilterSem');
    const semesters  = [...new Set(coursesDB.map(c => c.userSem).filter(s => s !== null && s !== undefined))].sort((a, b) => a - b);

    filterSem.innerHTML = '<option value="all">Todos los Semestres</option>';
    semesters.forEach(sem => {
        const isSummer = sem % 1 !== 0;
        const label    = isSummer ? `Verano ${Math.floor(sem)}` : `Semestre ${sem}`;
        filterSem.innerHTML += `<option value="${sem}">${label}</option>`;
    });

    updateListTable();
}

// Redibuja la tabla de lista con los filtros actuales
function updateListTable() {
    const body     = document.getElementById('listBody');
    const filtered = filterListViewData();

    if (filtered.length === 0) {
        body.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--text-dim);">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                <div style="font-size: 1.2rem; font-weight: 700;">No se encontraron cursos</div>
                <div style="margin-top: 8px; font-size: 0.9rem;">Intenta con otros filtros</div>
            </div>`;
        return;
    }

    const groups = {};
    filtered.forEach(c => {
        const key = hasSem(c.userSem) ? c.userSem : 'none';
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
    });

    const semKeys = Object.keys(groups).filter(k => k !== 'none').sort((a, b) => parseFloat(a) - parseFloat(b));
    if (groups['none']) semKeys.push('none');

    let html = '';
    semKeys.forEach(key => {
        const cursos    = groups[key];
        const isNone    = key === 'none';
        const isVerano  = !isNone && parseFloat(key) % 1 !== 0;
        const semLabel  = isNone ? '📋 Sin Semestre Asignado' : (isVerano ? `☀️ Verano ${Math.floor(parseFloat(key))}` : `📖 Semestre ${key}`);

        const totalCreds  = cursos.reduce((s, c) => s + c.cred, 0);
        const aprobados   = cursos.filter(c => c.status === 'aprobado').length;
        const cursando    = cursos.filter(c => c.status === 'cursando').length;
        const conNota     = cursos.filter(c => c.status === 'aprobado' && c.grade && c.grade.toString().trim() !== '');
        const credConNota = conNota.reduce((s, c) => s + c.cred, 0);
        const promedio    = credConNota > 0 ? conNota.reduce((s, c) => s + parseFloat(c.grade) * c.cred, 0) / credConNota : null;

        html += `
        <div class="list-sem-group">
            <div class="list-sem-header" style="${isVerano ? 'border-left-color:#ff6b35;' : ''}">
                <div class="list-sem-title">
                    ${semLabel}
                    <span class="list-sem-badge">${cursos.length} curso${cursos.length !== 1 ? 's' : ''} · ${totalCreds} cr</span>
                </div>
                <div class="list-sem-meta">
                    ${aprobados > 0 ? `<span class="list-sem-pill good">✅ ${aprobados} aprobado${aprobados !== 1 ? 's' : ''}</span>` : ''}
                    ${cursando > 0 ? `<span class="list-sem-pill cursando">⚡ ${cursando} cursando</span>` : ''}
                    ${promedio !== null ? `<span class="list-sem-avg" style="color:${getGradeColor(promedio)};">Prom: ${promedio.toFixed(2)}</span>` : ''}
                </div>
            </div>
            <table class="list-table">
                <thead>
                    <tr>
                        <th>Código</th><th>Nombre</th><th>Créditos</th><th>Bloque</th>
                        <th>Estado</th><th>Nota</th><th>Profesor</th><th>Modalidad</th>
                    </tr>
                </thead><tbody>`;

        cursos.forEach(c => {
            const statusClass = c.status || 'pendiente';
            const statusText  = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
            let gradeText = '-', gradeClass = '';
            if (c.grade && c.grade.toString().trim() !== '') {
                gradeText  = parseFloat(c.grade).toFixed(0);
                gradeClass = parseFloat(c.grade) >= 70 ? 'good' : 'bad';
            }
            let timingBadge = '';
            if (!isNone) {
                if (isVerano) timingBadge = `<span class="list-timing" title="Verano">☀️</span>`;
                else if (parseFloat(key) > c.block) timingBadge = `<span class="list-timing" title="Atrasado">🔻</span>`;
                else if (parseFloat(key) < c.block) timingBadge = `<span class="list-timing" title="Adelantado">🔺</span>`;
            }
            html += `
            <tr onclick="openModal(coursesDB.find(x => x.id === '${c.id}'))" style="cursor: pointer;">
                <td class="list-code">${c.id}</td>
                <td>${c.name} ${timingBadge}</td>
                <td>${c.cred}</td>
                <td>${c.block}</td>
                <td><span class="list-status-badge ${statusClass}">${statusText}</span></td>
                <td><span class="list-grade ${gradeClass}">${gradeText}</span></td>
                <td>${c.prof || '-'}</td>
                <td>${c.modalidad || '-'}</td>
            </tr>`;
        });

        html += `</tbody></table></div>`;
    });

    body.innerHTML = html;
}

// Filtra los cursos de la vista lista según los controles activos
function filterListViewData() {
    const statusFilter = document.getElementById('listFilterStatus')?.value || 'all';
    const semFilter    = document.getElementById('listFilterSem')?.value    || 'all';
    const searchQuery  = document.getElementById('listSearchBox')?.value.toLowerCase() || '';

    return coursesDB.filter(c => {
        const statusMatch = statusFilter === 'all' || (c.status || 'pendiente') === statusFilter;
        const semMatch    = semFilter    === 'all' || (c.userSem !== null && c.userSem !== undefined && parseFloat(c.userSem) === parseFloat(semFilter));
        const searchMatch = searchQuery  === ''    || c.id.toLowerCase().includes(searchQuery) || c.name.toLowerCase().includes(searchQuery);
        return statusMatch && semMatch && searchMatch;
    });
}

// Dispara la actualización de la tabla cuando cambian los filtros (llamado por oninput/onchange en el HTML)
function filterListView() {
    if (viewMode === 'list') updateListTable();
}

// Exporta el plan actual a un archivo Excel (.xls)
function exportToExcel() {
    const plannedCourses = coursesDB.filter(c => c.userSem !== null && c.userSem > 0);
    if (plannedCourses.length === 0) { alert('Primero planea algunos cursos.'); return; }

    const sems = [...new Set(plannedCourses.map(c => c.userSem))].sort((a, b) => a - b);

    let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>Plan de Estudios</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
    </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head><body><table border="1">`;

    sems.forEach(semNum => {
        const coursesInSem   = plannedCourses.filter(c => c.userSem === semNum);
        const plannedCreds   = coursesInSem.reduce((sum, c) => sum + c.cred, 0);
        const officialCreds  = coursesDB.filter(c => c.block === semNum).reduce((sum, c) => sum + c.cred, 0);

        htmlContent += `
        <tr style="background-color: #4CAF50; color: white; font-weight: bold;">
            <td>SEM:</td><td>${semNum}</td><td>Créditos:</td><td>${plannedCreds}</td>
            <td>Original:</td><td>${officialCreds}</td><td colspan="5"></td>
        </tr>
        <tr style="background-color: #f2f2f2; font-weight: bold;">
            <td>#</td><td>Código</td><td>Curso</td><td>Grupo</td><td>Profesor</td>
            <td>Horario</td><td>Aula</td><td>Modalidad</td><td>Créditos</td><td>Nota</td><td>Estado</td>
        </tr>`;

        coursesInSem.forEach((c, index) => {
            let estado = 'Pendiente', bgColor = '';
            if (c.grade && c.grade.toString().trim() !== '') {
                const numGrade = parseFloat(c.grade);
                if (!isNaN(numGrade)) {
                    estado   = numGrade >= 70 ? 'Aprobado' : 'Reprobado';
                    bgColor  = numGrade >= 70 ? '#d4edda'  : '#f8d7da';
                }
            }
            htmlContent += `
            <tr style="background-color: ${bgColor};">
                <td>${index + 1}</td><td>${c.id}</td><td>${c.name}</td><td>-</td>
                <td>${c.prof || ''}</td><td>-</td><td>-</td><td>-</td>
                <td>${c.cred}</td>
                <td>${c.grade !== undefined && c.grade !== null ? c.grade : ''}</td>
                <td>${estado}</td>
            </tr>`;
        });

        htmlContent += `<tr><td colspan="11"></td></tr>`;
    });

    htmlContent += `</table></body></html>`;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href',     url);
    link.setAttribute('download', `Plan_TEC_${currentMajor}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


// =============================================================================
// 14. SIMULADOR DE GRADUACIÓN
// =============================================================================

// Abre el modal del simulador de graduación con estimación y listas de cursos
function openGraduationSimulator() {
    const planeados  = coursesDB.filter(c => c.userSem && c.userSem > 0);
    const pendientes = coursesDB.filter(c => !c.userSem || c.userSem <= 0);

    const semMax      = planeados.length > 0 ? Math.max(...planeados.map(c => parseFloat(c.userSem))) : null;
    const semMaxEnt   = semMax ? Math.ceil(semMax) : null;
    const anios       = semMaxEnt ? (semMaxEnt / 2).toFixed(1) : null;
    const adelantados = planeados.filter(c => parseFloat(c.userSem) < c.block);
    const atrasados   = planeados.filter(c => Math.ceil(parseFloat(c.userSem)) > c.block);
    const semLabel    = semMax && semMax % 1 !== 0 ? `Verano ${Math.floor(semMax)}` : `Semestre ${semMax}`;

    let html = `
        <div class="modal-overlay" style="display:flex; z-index:5000;" onclick="if(event.target===this) this.remove()">
        <div class="modal-content" style="width:620px; height:88vh; display:flex; flex-direction:column; overflow:hidden;">
            <div class="modal-header">
                <div class="modal-title-code" style="color:#10b981;">🎓 SIMULADOR DE GRADUACIÓN</div>
                <div class="modal-title-name">Tu plan actual</div>
            </div>
            <div class="modal-body" style="overflow-y:auto; flex:1; gap:16px; min-height:0;">`;

    // Card de estimación
    if (semMax) {
        html += `
            <div style="background:#09090b; border:1px solid #333; border-left:4px solid #10b981; border-radius:8px; padding:20px; text-align:center;">
                <div style="color:var(--text-dim); font-size:0.85rem; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px;">Con tu distribución actual terminarías en</div>
                <div style="font-size:2.8rem; font-weight:700; color:#10b981; line-height:1;">${semMaxEnt} <span style="font-size:1.2rem; color:var(--text-dim);">semestres</span></div>
                <div style="color:var(--text-dim); font-size:0.9rem; margin-top:6px;">~${anios} años · último curso planeado: <strong style="color:#fff;">${semLabel}</strong></div>
                <div style="margin-top:12px; font-size:0.82rem; color:#555;">
                    ${pendientes.length > 0 ? `⚠️ ${pendientes.length} curso${pendientes.length !== 1 ? 's' : ''} aún sin semestre asignado` : '✅ Todos los cursos tienen semestre asignado'}
                </div>
            </div>`;
    } else {
        html += `
            <div style="background:#09090b; border:1px solid #333; border-radius:8px; padding:30px; text-align:center; color:var(--text-dim);">
                <div style="font-size:2.5rem; margin-bottom:10px;">📅</div>
                <div>No hay cursos planeados aún. Asigná semestres a tus cursos para ver la estimación.</div>
            </div>`;
    }

    // Helper para generar una sección colapsable
    const simSection = (id, titulo, color, bgColor, items, renderItem) => {
        let s = `
            <div style="background:#09090b; border:1px solid #333; border-radius:8px; overflow:hidden; margin-top:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center;
                            padding:14px 18px; cursor:pointer; user-select:none; border-left:4px solid ${color};"
                     onclick="toggleSimSection('${id}')">
                    <div>
                        <span style="font-weight:700; color:#fff;">${titulo}</span>
                        <span style="margin-left:10px; background:${bgColor}; color:${color};
                                     font-size:0.8rem; font-weight:700; padding:2px 10px; border-radius:10px;">${items.length}</span>
                    </div>
                    <span id="${id}-icon" style="color:#555; font-size:0.85rem;">▼ Ver</span>
                </div>
                <div id="${id}" style="display:none; border-top:1px solid #1f1f1f;">`;
        if (items.length === 0) {
            s += `<div style="padding:14px 18px; color:#555; font-size:0.88rem;">Ningún curso.</div>`;
        } else {
            items.forEach(c => { s += renderItem(c); });
        }
        s += `</div></div>`;
        return s;
    };

    const rowItem = (c, color) => `
        <div style="display:flex; justify-content:space-between; align-items:center;
                     padding:10px 18px; border-bottom:1px solid #1a1a1a; font-size:0.87rem;">
            <div>
                <span style="color:var(--accent); font-weight:700; margin-right:8px;">${c.id}</span>
                <span style="color:var(--text-main);">${c.name}</span>
            </div>
            <div style="white-space:nowrap; color:var(--text-dim); font-size:0.8rem;">
                Bloque <strong style="color:#fff;">${c.block}</strong> → planeado en
                <strong style="color:${color};">S${c.userSem}</strong>
            </div>
        </div>`;

    html += simSection('sim-adelantados', '⚡ Adelantados', 'var(--timing-adelantado)', 'rgba(245,158,11,0.15)', adelantados, c => rowItem(c, 'var(--timing-adelantado)'));
    html += simSection('sim-atrasados',   '🐢 Atrasados',   'var(--timing-atrasado)',   'rgba(239,68,68,0.15)',   atrasados,   c => rowItem(c, 'var(--timing-atrasado)'));

    html += `
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-confirm" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
            </div>
        </div></div>`;

    document.body.insertAdjacentHTML('beforeend', html);
}

// Expande o colapsa una sección del simulador de graduación
function toggleSimSection(id) {
    const el   = document.getElementById(id);
    const icon = document.getElementById(`${id}-icon`);
    const open = el.style.display === 'none';
    el.style.display  = open ? 'block' : 'none';
    icon.textContent  = open ? '▲ Ocultar' : '▼ Ver';
    icon.style.color  = open ? 'var(--accent)' : '#555';
}


// =============================================================================
// 15. MODALES DE INFO (tutorial, acerca de)
// =============================================================================

// Abre el tutorial / manual de usuario
function openTutorial() {
    document.getElementById('tutorialModal').style.display = 'flex';
}

// Cierra el tutorial y lo marca como visto
function closeTutorial() {
    document.getElementById('tutorialModal').style.display = 'none';
    localStorage.setItem('TecPlanner_TutorialSeen', 'true');
}

// Abre el modal "Acerca de"
function openAboutModal() {
    document.getElementById('infoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cierra el modal "Acerca de"
function closeAboutModal() {
    document.getElementById('infoModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Cierra el modal "Acerca de" con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAboutModal();
});

// Muestra el modal "Acerca de" en la primera visita (ya no llamado automáticamente)
function checkFirstVisit() {
    if (!localStorage.getItem('TecPlanner_VisitedBefore')) {
        setTimeout(() => openAboutModal(), 2000);
        localStorage.setItem('TecPlanner_VisitedBefore', 'true');
    }
}


// =============================================================================
// 16. ANALÍTICA (notificaciones Discord)
// =============================================================================

// Registra una apertura de la app y notifica por Discord.
// Nota: los contadores numéricos vía JSONBin se quitaron (se desincronizaban y
// dejaron de ser confiables). Ahora solo se reporta si el usuario es nuevo o
// recurrente, junto con la carrera activa.
async function notifyOpen() {
    const WEBHOOK     = 'https://discord.com/api/webhooks/1496671101294481418/zFhuYS-F88Zu9Aahv_FXNEOOHd3IqEb3cXyW7DFerpOEZawcFZNunFqAcM85TA83lIWA';
    const COOLDOWN_MS = 30 * 60 * 1000;

    const ahora     = Date.now();
    const ultimaVez = parseInt(localStorage.getItem('TecPlanner_LastNotify') || '0');
    if (ahora - ultimaVez < COOLDOWN_MS) return;
    localStorage.setItem('TecPlanner_LastNotify', ahora.toString());

    const esNuevo = !localStorage.getItem('TecPlanner_EverOpened');
    if (esNuevo) localStorage.setItem('TecPlanner_EverOpened', 'true');

    const major        = localStorage.getItem('TecPlanner_ActiveMajor') || 'sin_carrera';
    const now           = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
    const tipoUsuario   = esNuevo ? '🆕 **Usuario nuevo**' : '🔄 Usuario recurrente';
    const carreraLabel  = `${careers_information[major]?.icon || ''} ${careers_information[major]?.name || major}`;

    fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            embeds: [{
                title: '👀 TecPlanner fue abierto',
                color: esNuevo ? 0x10b981 : 0x8257e6,
                fields: [
                    {
                        name:   '📋 Detalle',
                        value:  [`🕐 ${now}`, `🎓 Carrera: ${carreraLabel}`, tipoUsuario].join('\n'),
                        inline: false
                    }
                ]
            }]
        })
    }).catch(() => {});
}

// =============================================================================
// 18. GENERADOR DE HORARIO PDF
// =============================================================================

// Genera opciones de tiempo cada 10 minutos entre 07:00 y 22:00
function buildTimeOptions(selectedVal) {
    let opts = '';
    for (let h = 7; h <= 22; h++) {
        for (let m = 0; m < 60; m += 10) {
            if (h === 22 && m > 0) break;
            const hh  = String(h).padStart(2, '0');
            const mm  = String(m).padStart(2, '0');
            const val = `${hh}:${mm}`;
            const sel = val === selectedVal ? 'selected' : '';
            opts += `<option value="${val}" ${sel}>${val}</option>`;
        }
    }
    return opts;
}

function addHorarioBlock(slot) {
    const container = document.getElementById('horarioBlocks');
    const DAYS = ['L','K','M','J','V'];
    const DAY_LABELS = { L:'Lun', K:'Mar', M:'Mié', J:'Jue', V:'Vie' };

    const activeDays = slot?.days || [];
    const daysHtml = DAYS.map(d => {
        const isActive = activeDays.includes(d);
        const style = isActive
            ? 'background:var(--accent);color:#fff;border:1px solid var(--accent);'
            : 'background:transparent;color:var(--text-dim);border:1px solid #444;';
        return `<button type="button" class="day-btn ${isActive ? 'active' : ''}" data-day="${d}"
            onclick="toggleDayBtn(this)"
            style="padding:5px 9px;border-radius:4px;cursor:pointer;font-family:'Rajdhani',sans-serif;
                   font-weight:700;font-size:0.8rem;transition:all 0.15s;${style}"
         >${DAY_LABELS[d]}</button>`;
    }).join('');

    const div = document.createElement('div');
    div.className = 'horario-block';
    div.style.cssText = 'background:#09090b;border:1px solid #333;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:8px;';
    div.innerHTML = `
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            ${daysHtml}
            <button type="button" onclick="this.closest('.horario-block').remove()"
                style="margin-left:auto;background:transparent;border:1px solid #ef4444;color:#ef4444;
                       padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;font-family:'Rajdhani',sans-serif;font-weight:700;">
                ✕
            </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
            <div>
                <div style="font-size:0.7rem;color:#555;text-transform:uppercase;margin-bottom:4px;">Inicio</div>
                <select class="inp-start rpg-input" style="padding:8px;font-size:0.9rem;cursor:pointer;appearance:auto;">
                    ${buildTimeOptions(slot?.start || '07:00')}
                </select>
            </div>
            <div>
                <div style="font-size:0.7rem;color:#555;text-transform:uppercase;margin-bottom:4px;">Fin</div>
                <select class="inp-end rpg-input" style="padding:8px;font-size:0.9rem;cursor:pointer;appearance:auto;">
                    ${buildTimeOptions(slot?.end || '09:00')}
                </select>
            </div>
            <div>
                <div style="font-size:0.7rem;color:#555;text-transform:uppercase;margin-bottom:4px;">Aula</div>
                <input type="text" class="inp-aula rpg-input" placeholder="B3-010"
                    style="padding:8px;font-size:0.9rem;" value="${slot?.aula || ''}">
            </div>
        </div>`;

    container.appendChild(div);
}

function toggleDayBtn(btn) {
    const isActive = btn.classList.toggle('active');
    btn.style.background  = isActive ? 'var(--accent)' : 'transparent';
    btn.style.color       = isActive ? '#fff' : 'var(--text-dim)';
    btn.style.borderColor = isActive ? 'var(--accent)' : '#444';
}

function openScheduleModal() {
    const sems = [...new Set(coursesDB.map(c => parseFloat(c.userSem)).filter(n => !isNaN(n) && n > 0))].sort((a,b)=>a-b);
    if (sems.length === 0) { alert('No hay semestres planificados aún.'); return; }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:flex;z-index:5000;';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };

    const items = sems.map(s => {
        const isSummer = s % 1 !== 0;
        const label    = isSummer ? `☀️ Verano ${Math.floor(s)}` : `📖 Semestre ${s}`;
        return `<div onclick="generateScheduleFile(${s});this.closest('.modal-overlay').remove();"
                     style="padding:14px 18px;cursor:pointer;border-bottom:1px solid #222;
                            display:flex;justify-content:space-between;align-items:center;transition:background 0.15s;"
                     onmouseover="this.style.background='rgba(168,85,247,0.1)'"
                     onmouseout="this.style.background=''">
                    <span style="color:#fff;font-weight:700;">${label}</span>
                    <span style="color:#a855f7;font-size:0.8rem;">Descargar HTML →</span>
                </div>`;
    }).join('');

    modal.innerHTML = `
        <div class="modal-content" style="width:400px;">
            <div class="modal-header">
                <div class="modal-title-code" style="color:#a855f7;">📅 GENERAR HORARIO</div>
                <div class="modal-title-name">Selecciona un semestre</div>
            </div>
            <div style="background:#09090b;border-radius:0 0 12px 12px;overflow:hidden;">${items}</div>
        </div>`;
    document.body.appendChild(modal);
}

function generateScheduleFile(sem) {
    const allCourses = coursesDB.filter(c => parseFloat(c.userSem) === sem);
    const isSummer   = sem % 1 !== 0;
    const semLabel   = isSummer ? `Verano ${Math.floor(sem)}` : `Semestre ${sem}`;
    const majorName  = careers_information[currentMajor]?.name || currentMajor;

    const PALETTE = [
        '#5e4b8b','#2e7d52','#1a5c78','#7a3b1e','#3b5998',
        '#8b4513','#006064','#4a148c','#1b5e20','#bf360c',
        '#37474f','#6a1b9a','#00695c','#e65100','#283593'
    ];
    const DAY_COL = { L:2, K:3, M:4, J:5, V:6 };

    // Detectar rango de horas real para no mostrar horas vacías
    let minH = 22, maxH = 7;
    allCourses.forEach(c => {
        if (!c.horario || !Array.isArray(c.horario)) return;
        c.horario.forEach(slot => {
            const sh = parseInt(slot.start.split(':')[0]);
            const eh = parseInt(slot.end.split(':')[0]);
            if (sh < minH) minH = sh;
            if (eh > maxH) maxH = eh;
        });
    });
    // fallback si no hay cursos con horario
    if (minH > maxH) { minH = 7; maxH = 21; }
    // padding de media hora arriba y abajo
    minH = Math.max(7, minH - 1);
    maxH = Math.min(22, maxH + 1);

    const STEP_MIN   = 10;
    const STEPS_PER_H = 60 / STEP_MIN;
    const TOTAL_STEPS = (maxH - minH) * STEPS_PER_H;

    function timeToRow(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return 2 + (h - minH) * STEPS_PER_H + Math.round(m / STEP_MIN);
    }

    // Bloques de cursos
    const blockHtml = [];
    allCourses.forEach((c, idx) => {
        if (!c.horario || !Array.isArray(c.horario)) return;
        const color = PALETTE[idx % PALETTE.length];
        const extra = [c.prof, c.grupo ? `Gr:${c.grupo}` : '', c.modalidad].filter(Boolean).join(' · ');
        c.horario.forEach(slot => {
            slot.days.forEach(day => {
                const col = DAY_COL[day];
                if (!col) return;
                const startRow = timeToRow(slot.start);
                const endRow   = timeToRow(slot.end);
                const span     = Math.max(endRow - startRow, 1);
                blockHtml.push(
                    `<div class="class-block" style="grid-column:${col};grid-row:${startRow}/span ${span};background-color:${color} !important;">` +
                    `<div class="subject">${c.name}</div>` +
                    `<div class="time-range">${slot.start}&#8211;${slot.end}</div>` +
                    `<div class="details">${extra}</div>` +
                    `<span class="room">${slot.aula || ''}</span>` +
                    `</div>`
                );
            });
        });
    });

    // Etiquetas de hora (cada 6 pasos = 1 hora)
    const timeLabels = [];
    for (let h = minH; h < maxH; h++) {
        const row = 2 + (h - minH) * STEPS_PER_H;
        timeLabels.push(
            `<div class="time-slot" style="grid-column:1;grid-row:${row}/span ${STEPS_PER_H};">${String(h).padStart(2,'0')}:00</div>`
        );
    }

    // Celdas de fondo
    const gridCells = [];
    for (let r = 0; r < TOTAL_STEPS; r++) {
        for (let col = 2; col <= 6; col++) {
            gridCells.push(`<div class="cell" style="grid-column:${col};grid-row:${2+r};"></div>`);
        }
    }

    const noHorario = allCourses.filter(c => !c.horario || !Array.isArray(c.horario) || c.horario.length === 0);
    const warningHtml = noHorario.length
        ? `<div style="margin-top:10px;padding:10px;background:#fff3cd;border-left:4px solid #f59e0b;border-radius:4px;font-size:0.8rem;color:#856404;">` +
          `<strong>Sin horario:</strong> ${noHorario.map(c=>`${c.id} (${c.name})`).join(', ')}` +
          `</div>`
        : '';

    const html =
`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Horario ${semLabel}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:100%;height:100%;}
body{font-family:Arial,sans-serif;background:#fff;padding:12px;}
h1{text-align:center;color:#2c3e50;font-size:1.1rem;margin-bottom:10px;}
.print-btn{display:block;margin:0 auto 10px;background:#8257e6;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:0.9rem;cursor:pointer;}
.schedule-container{
  width:100%;
  display:grid;
  grid-template-columns:44px repeat(5,1fr);
  grid-template-rows:30px repeat(${TOTAL_STEPS},1fr);
  gap:1px;
  background:#ccc;
  border:1px solid #ccc;
}
.header{
  background:#2c3e50 !important;
  color:#fff !important;
  font-weight:700;display:flex;align-items:center;justify-content:center;
  text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
.time-slot{
  background:#f5f5f5 !important;color:#444;font-size:0.6rem;
  display:flex;align-items:flex-start;justify-content:center;
  padding-top:3px;font-weight:bold;grid-column:1;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
.cell{background:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.class-block{
  color:#fff !important;
  font-size:0.65rem;border-radius:3px;
  display:flex;flex-direction:column;overflow:hidden;
  margin:1px;border-left:4px solid rgba(0,0,0,0.25);line-height:1.2;
  padding:3px 5px;
  -webkit-print-color-adjust:exact !important;
  print-color-adjust:exact !important;
}
.subject{font-weight:700;font-size:0.7rem;margin-bottom:1px;}
.time-range{font-size:0.58rem;background:rgba(0,0,0,0.18);border-radius:2px;padding:1px 3px;display:inline-block;align-self:flex-start;margin-bottom:1px;}
.details{font-size:0.58rem;opacity:0.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.room{font-weight:700;margin-top:auto;display:block;text-align:right;font-size:0.56rem;}
@page{size:landscape;margin:8mm;}
@media print{
  body{padding:0;background:#fff;}
  .print-btn{display:none!important;}
  html,body{height:100%;}
  .schedule-container{
    height:calc(100vh - 40px);
    page-break-inside:avoid;
    break-inside:avoid;
  }
  .class-block{
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
  }
  .header{
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
  }
}
</style>
</head>
<body>
<h1>Horario &middot; ${semLabel} &middot; ${majorName}</h1>
<button class="print-btn" onclick="window.print()">&#128438; Imprimir / Guardar PDF</button>
<div class="schedule-container">
  <div class="header" style="grid-column:1;">Hora</div>
  <div class="header">Lunes</div>
  <div class="header">Martes</div>
  <div class="header">Miercoles</div>
  <div class="header">Jueves</div>
  <div class="header">Viernes</div>
  ${timeLabels.join('')}
  ${gridCells.join('')}
  ${blockHtml.join('')}
</div>
${warningHtml}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // No revocamos el URL inmediatamente para que la pestaña pueda cargarlo
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
// =============================================================================
// 18b. HISTORIAL DE APERTURA DE CURSOS (frecuencia por semestre / verano)
// =============================================================================

let courseHistoryData = null;
let courseHistoryPromise = null;

// Carga (una sola vez) el output/history.json generado por el scraper
function loadCourseHistory() {
    if (courseHistoryPromise) return courseHistoryPromise;
    courseHistoryPromise = fetch('scraper/output/history.json')
        .then(res => res.ok ? res.json() : {})
        .then(data => { courseHistoryData = data; return data; })
        .catch(() => { courseHistoryData = {}; return {}; });
    return courseHistoryPromise;
}

// Analiza el arreglo historial (ej: ["2025-1","2025-1V","2026-2"]) y resume
// en qué semestres suele abrirse el curso y si tuvo oferta de verano.
function analizarAperturaCurso(courseId) {
    const entry = courseHistoryData && courseHistoryData[courseId];
    if (!entry || !Array.isArray(entry.historial) || entry.historial.length === 0) return null;

    let sem1 = false, sem2 = false, verano = false;
    entry.historial.forEach(etiqueta => {
        const periodo = etiqueta.split('-')[1]; // "1", "2", "1V", "2V"...
        if (!periodo) return;
        if (periodo.endsWith('V')) verano = true;
        else if (periodo === '1') sem1 = true;
        else if (periodo === '2') sem2 = true;
    });

    let semestreMsg = null;
    if (sem1 && sem2) semestreMsg = 'Este curso normalmente abre todos los semestres.';
    else if (sem1)     semestreMsg = 'Este curso normalmente abre el primer semestre del año.';
    else if (sem2)     semestreMsg = 'Este curso normalmente abre el segundo semestre del año.';

    if (!semestreMsg && !verano) return null;
    return { semestreMsg, verano };
}

// Pinta el aviso minimalista arriba del modal de curso
function renderAperturaInfo(courseId) {
    const cont = document.getElementById('modalAperturaInfo');
    if (!cont) return;

    if (!courseHistoryData) {
        cont.style.display = 'none';
        loadCourseHistory().then(() => renderAperturaInfo(courseId));
        return;
    }

    const info = analizarAperturaCurso(courseId);
    if (!info) { cont.style.display = 'none'; cont.innerHTML = ''; return; }

    cont.style.display = 'flex';
    cont.innerHTML = `
        ${info.semestreMsg ? `<div class="apertura-line">📅 ${info.semestreMsg}</div>` : ''}
        ${info.verano ? `<div class="apertura-line apertura-verano">☀️ Este curso se impartió en verano.</div>` : ''}
    `;
}

// =============================================================================
// 19. TOUR GUIADO INTERACTIVO (con acciones reales en cada paso)
// =============================================================================

let tourDynamicModal   = null; // referencia al modal dinámico abierto por el tour (simulador, horario)
let tourHoverCourseId  = null; // curso resaltado con hover durante el tour

function tourOpenProfileSheet() {
    const s = document.getElementById('characterSheet');
    if (s && !s.classList.contains('open')) toggleCharacterSheet();
}
function tourCloseProfileSheet() {
    const s = document.getElementById('characterSheet');
    if (s && s.classList.contains('open')) toggleCharacterSheet();
}

function tourFirstNode()   { return document.querySelector('.node'); }
function tourFirstPeriod() {
    const periods = [...new Set(coursesDB.map(c => parseFloat(c.userSem)).filter(n => !isNaN(n) && n >= 0))].sort((a, b) => a - b);
    return periods.length ? periods[0] : null;
}

const TOUR_STEPS = [
    {
        target: null,
        title: '👋 ¡Bienvenido a TecPlanner!',
        text: 'Te voy a mostrar cada botón y, después, qué hace al usarlo. Salí cuando quieras con "Saltar" o Esc.<br><br>¿Preferís el manual en texto? <a href="#" onclick="event.preventDefault(); endTour(); openTutorial();" style="color:var(--filter-selected); font-weight:700;">Verlo acá</a>',
        placement: 'center'
    },

    // --- BUSCAR ---
    { target: () => document.getElementById('searchBox'), title: '🔍 Buscar cursos', text: 'Este es el buscador. Escribí un código o nombre y filtra en vivo.', placement: 'bottom' },
    {
        target: () => document.getElementById('searchBox'),
        title: '🔍 Así funciona',
        text: 'Escribí <strong>"física"</strong> y mirá cómo se resaltan los cursos que coinciden.',
        placement: 'bottom',
        onEnter: () => { const b = document.getElementById('searchBox'); if (b) { b.value = 'física'; searchCourse('física'); b.focus(); } },
        onExit:  () => { const b = document.getElementById('searchBox'); if (b) { b.value = ''; searchCourse(''); } }
    },

    // --- ABRIR CURSO ---
    {
        target: () => tourFirstNode(),
        title: '📚 Tu malla curricular',
        text: 'Cada tarjeta es un curso. Hacé clic en cualquiera para ver esto:',
        placement: 'right',
        onEnter: () => tourFirstNode()?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    },
    {
        target: () => document.getElementById('courseModal').style.display === 'flex' ? document.querySelector('#courseModal .modal-content') : null,
        title: '📚 Así se ve',
        text: 'Asigná semestre, nota, profesor, grupo y horario. <em>No hace falta que guardes nada, es solo demostración.</em>',
        placement: 'right',
        onEnter: () => { const n = tourFirstNode(); if (n) { const c = coursesDB.find(x => x.id === n.id); if (c) openModal(c); } },
        onExit:  () => closeModal()
    },

    // --- RELACIONES (hover) ---
    { target: () => tourFirstNode(), title: '🖱️ Relaciones entre cursos', text: 'Pasá el mouse (sin clic) sobre un curso para ver sus conexiones.', placement: 'right' },
    {
        target: () => document.querySelector('.node.highlight-main') || tourFirstNode(),
        title: '🖱️ Así se ve',
        text: '<strong style="color:#ff0066">Rojo</strong> = requisitos, <strong style="color:#ffdd00">amarillo</strong> = correquisitos, <strong style="color:#00ff88">verde</strong> = lo que desbloquea.',
        placement: 'right',
        onEnter: () => { const n = tourFirstNode(); if (n) { tourHoverCourseId = n.id; handleHover(n.id, true); } },
        onExit:  () => { if (tourHoverCourseId) { handleHover(tourHoverCourseId, false); tourHoverCourseId = null; } }
    },

    // --- FILTRO SEMESTRE ---
    { target: () => document.getElementById('userSemestersBtn'), title: '📅 Filtrar por semestre', text: 'Estos botones aparecen según los semestres que planifiques. Fijate en el primero:', placement: 'bottom' },
    {
        target: () => { const p = tourFirstPeriod(); return p !== null ? document.getElementById(`btnS${p.toString().replace('.', '_')}`) : null; },
        title: '📅 Así filtra',
        text: 'Se resalta ese semestre, y en verde punteado lo que ya podrías llevar.',
        placement: 'bottom',
        onEnter: () => { const p = tourFirstPeriod(); if (p !== null) filterByUserSemester(p); },
        onExit:  () => filterByUserSemester(null)
    },

    // --- EDICIÓN RÁPIDA ---
    { target: () => document.querySelector('.quick-actions'), title: '⚡ Edición rápida', text: 'Estos botones activan un modo de marcado rápido.', placement: 'bottom' },
    {
        target: () => document.querySelector('.quick-actions'),
        title: '⚡ Así funciona',
        text: 'Con <strong style="color:#a855f7">CURSANDO</strong> activado, un clic en cualquier curso lo marca (o desmarca) sin abrir el modal.',
        placement: 'bottom',
        onEnter: () => { if (editMode !== 'cursando') toggleEditMode('cursando'); },
        onExit:  () => { if (editMode === 'cursando') toggleEditMode('cursando'); }
    },

    // --- NOTAS MASIVAS ---
    { target: () => document.getElementById('btnNotas'), title: '📝 Carga masiva de notas', text: 'Este botón abre la carga de notas para todos tus cursos "Cursando" a la vez.', placement: 'bottom' },
    {
        target: () => document.getElementById('bulkGradesModal').style.display === 'flex' ? document.querySelector('#bulkGradesModal .modal-content') : null,
        title: '📝 Así se ve',
        text: 'Ingresás todas las notas de una sola vez, sin abrir cada curso.',
        placement: 'bottom',
        onEnter: () => openBulkGrades(),
        onExit:  () => closeBulkGrades()
    },

    // --- CRÉDITOS (sin acción, solo lectura) ---
    { target: () => document.getElementById('statsPanel'), title: '📊 Tus créditos', text: 'Comparás tus créditos contra el total oficial (de la carrera, o del semestre filtrado).', placement: 'bottom' },

    // --- SIMULADOR ---
    { target: () => document.getElementById('btnSimular'), title: '🎓 Simulador de graduación', text: 'Este botón estima en cuántos semestres te graduás según tu plan actual.', placement: 'bottom' },
    {
        target: () => tourDynamicModal ? tourDynamicModal.querySelector('.modal-content') : null,
        title: '🎓 Así se ve',
        text: 'Te muestra semestres estimados y qué cursos llevás adelantado o atrasado.',
        placement: 'right',
        onEnter: () => { openGraduationSimulator(); tourDynamicModal = document.body.lastElementChild; },
        onExit:  () => { tourDynamicModal?.remove(); tourDynamicModal = null; }
    },

    // --- VISTA LISTA ---
    { target: () => document.getElementById('btnViewMode'), title: '📋 Vista de lista', text: 'Este botón cambia el árbol visual por una tabla filtrable.', placement: 'bottom' },
    {
        target: () => document.getElementById('listView'),
        title: '📋 Así se ve',
        text: 'Podés filtrar por semestre, estado, o buscar directamente en la tabla.',
        placement: 'top',
        onEnter: () => { if (viewMode === 'tree') toggleViewMode(); },
        onExit:  () => { if (viewMode === 'list') toggleViewMode(); }
    },

    // --- HORARIO ---
    { target: () => document.getElementById('btnHorario'), title: '📅 Generar horario', text: 'Este botón arma un horario semanal con los bloques que le pusiste a tus cursos.', placement: 'bottom' },
    {
        target: () => tourDynamicModal ? tourDynamicModal.querySelector('.modal-content') : null,
        title: '📅 Así se ve',
        text: 'Elegís un semestre y se genera un horario listo para imprimir.',
        placement: 'right',
        onEnter: () => { if (coursesDB.some(c => !isNaN(parseFloat(c.userSem)) && parseFloat(c.userSem) > 0)) { openScheduleModal(); tourDynamicModal = document.body.lastElementChild; } },
        onExit:  () => { tourDynamicModal?.remove(); tourDynamicModal = null; }
    },

    // --- EXCEL / GUARDAR (solo señalar, no auto-descargar) ---
    {
        target: () => document.getElementById('btnExcel'), title: '📊 Exportar a Excel',
        text: 'Descarga tu plan en .xls. Pruébralo cuando quieras.',
        placement: 'bottom',
        onEnter: () => document.getElementById('btnExcel')?.classList.add('tour-pulse'),
        onExit:  () => document.getElementById('btnExcel')?.classList.remove('tour-pulse')
    },
    {
        target: () => document.getElementById('btnGuardar'), title: '💾 Guardar y cargar',
        text: 'Exportá un respaldo .json de tu progreso, o cargalo de vuelta con "Cargar" al lado.',
        placement: 'bottom',
        onEnter: () => document.getElementById('btnGuardar')?.classList.add('tour-pulse'),
        onExit:  () => document.getElementById('btnGuardar')?.classList.remove('tour-pulse')
    },

    // --- PERFIL ACADÉMICO ---
    { target: () => document.getElementById('btnProfileToggle'), title: '👤 Perfil académico', text: 'Este botón abre tu panel de perfil académico.', placement: 'bottom' },
    {
        target: () => document.getElementById('characterSheet'),
        title: '👤 Así se ve',
        text: 'Tu promedio ponderado, progreso total e historial de cursos.',
        placement: 'left',
        onEnter: () => tourOpenProfileSheet()
    },

    // --- PONDERADO ---
    { target: () => document.getElementById('pondGeneral'), title: '⚖️ Promedio ponderado', text: 'Hacé clic en este número para ver el desglose completo.', placement: 'left' },
    {
        target: () => document.getElementById('pondModal').classList.contains('open') ? document.querySelector('#pondModal .pond-modal') : null,
        title: '⚖️ Así se ve',
        text: 'El peso de cada curso dentro de su semestre, y su aporte a tu nota final.',
        placement: 'left',
        onEnter: () => { tourOpenProfileSheet(); openPondModal(); },
        onExit:  () => closePondModal()
    },

    // --- QUEST LOG ---
    { target: () => document.querySelector('.quest-log-tabs'), title: '📜 Quest Log', text: 'Estas pestañas alternan entre tu plan y el plan oficial del TEC.', placement: 'left' },
    {
        target: () => document.getElementById('questLogContainer'),
        title: '📜 Así se ve',
        text: 'Tu historial de cursos, agrupado por semestre.',
        placement: 'left',
        onExit: () => tourCloseProfileSheet()
    },

    // --- REINICIAR (solo señalar) ---
    {
        target: () => document.getElementById('btnReiniciar'), title: '⟲ Reiniciar todo',
        text: 'Borra todo tu progreso de este navegador. Pide confirmación porque es irreversible.',
        placement: 'bottom',
        onEnter: () => document.getElementById('btnReiniciar')?.classList.add('tour-pulse'),
        onExit:  () => document.getElementById('btnReiniciar')?.classList.remove('tour-pulse')
    },

    {
        target: null,
        title: '🎉 ¡Listo!',
        text: 'Ya conocés cada botón y lo que hace. Repetí el recorrido cuando quieras desde <strong>MANUAL</strong>.',
        placement: 'center'
    }
];

let tourIndex = -1;

function startTour() {
    document.getElementById('tutorialModal').style.display = 'none';
    tourIndex = -1;
    buildTourDOM();
    nextTourStep();
    document.addEventListener('keydown', tourKeyHandler);
}

function buildTourDOM() {
    if (document.getElementById('tourOverlay')) return;
    const wrap = document.createElement('div');
    wrap.id = 'tourOverlay';
    wrap.innerHTML = `
        <div class="tour-frame" id="tourFrameTop"></div>
        <div class="tour-frame" id="tourFrameBottom"></div>
        <div class="tour-frame" id="tourFrameLeft"></div>
        <div class="tour-frame" id="tourFrameRight"></div>
        <div class="tour-spot" id="tourSpot"></div>
        <div class="tour-tooltip" id="tourTooltip">
            <div class="tour-tt-title" id="tourTitle"></div>
            <div class="tour-tt-text" id="tourText"></div>
            <div class="tour-tt-footer">
                <div class="tour-dots" id="tourDots"></div>
                <div class="tour-tt-btns">
                    <button class="tour-btn tour-btn-skip" onclick="endTour()">Saltar</button>
                    <button class="tour-btn tour-btn-back" id="tourBackBtn" onclick="prevTourStep()">← Atrás</button>
                    <button class="tour-btn tour-btn-next" id="tourNextBtn" onclick="nextTourStep()">Siguiente →</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(wrap);
}

function tourKeyHandler(e) {
    if (e.key === 'Escape')    endTour();
    if (e.key === 'ArrowRight') nextTourStep();
    if (e.key === 'ArrowLeft')  prevTourStep();
}

function currentTourStep() { return TOUR_STEPS[tourIndex]; }

function nextTourStep() {
    const prevStep = TOUR_STEPS[tourIndex];
    if (prevStep && prevStep.onExit) prevStep.onExit();
    tourIndex++;
    if (tourIndex >= TOUR_STEPS.length) { endTour(); return; }
    advanceToStep();
}

function prevTourStep() {
    const prevStep = TOUR_STEPS[tourIndex];
    if (prevStep && prevStep.onExit) prevStep.onExit();
    tourIndex--;
    if (tourIndex < 0) { endTour(); return; }
    advanceToStep();
}

// Ejecuta la acción real del paso (onEnter) y RECIÉN DESPUÉS busca el elemento
// a resaltar — así el target puede ser algo que la propia acción acaba de crear
// (un modal, un panel abierto, etc.)
function advanceToStep() {
    const step = TOUR_STEPS[tourIndex];
    if (step.onEnter) step.onEnter();

    const el = step.target ? step.target() : null;
    if (step.target && !el) { nextTourStep(); return; } // nada que mostrar: saltar

    setTimeout(() => renderTourStep(el), el ? 300 : 0);
}

function renderTourStep(el) {
    const step = currentTourStep();
    document.getElementById('tourTitle').innerHTML = step.title;
    document.getElementById('tourText').innerHTML  = step.text;
    document.getElementById('tourBackBtn').style.visibility = tourIndex === 0 ? 'hidden' : 'visible';
    document.getElementById('tourNextBtn').textContent = tourIndex === TOUR_STEPS.length - 1 ? '¡Entendido! ✓' : 'Siguiente →';

    document.getElementById('tourDots').innerHTML = TOUR_STEPS.map((_, i) =>
        `<span class="tour-dot ${i === tourIndex ? 'active' : ''}"></span>`).join('');

    positionTour(el, step.placement || 'bottom');
}

function positionTour(el, placement) {
    const spot    = document.getElementById('tourSpot');
    const tooltip = document.getElementById('tourTooltip');
    const top     = document.getElementById('tourFrameTop');
    const bottom  = document.getElementById('tourFrameBottom');
    const left    = document.getElementById('tourFrameLeft');
    const right   = document.getElementById('tourFrameRight');

    if (!el) {
        spot.style.display = 'none';
        top.style.cssText    = 'top:0; left:0; width:100%; height:100%;';
        bottom.style.cssText = 'display:none;';
        left.style.cssText   = 'display:none;';
        right.style.cssText  = 'display:none;';
        tooltip.style.top       = '50%';
        tooltip.style.left      = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        return;
    }

    const r   = el.getBoundingClientRect();
    const pad = 8;

    spot.style.display = 'block';
    spot.style.top     = `${r.top - pad}px`;
    spot.style.left    = `${r.left - pad}px`;
    spot.style.width   = `${r.width + pad * 2}px`;
    spot.style.height  = `${r.height + pad * 2}px`;

    top.style.cssText    = `top:0; left:0; width:100%; height:${r.top - pad}px;`;
    bottom.style.cssText = `top:${r.bottom + pad}px; left:0; width:100%; height:calc(100% - ${r.bottom + pad}px);`;
    left.style.cssText   = `top:${r.top - pad}px; left:0; width:${r.left - pad}px; height:${r.height + pad * 2}px;`;
    right.style.cssText  = `top:${r.top - pad}px; left:${r.right + pad}px; width:calc(100% - ${r.right + pad}px); height:${r.height + pad * 2}px;`;

    tooltip.style.transform = 'none';
    const ttRect = tooltip.getBoundingClientRect();
    let ttTop, ttLeft;

    if (placement === 'right' && r.right + 20 + ttRect.width < window.innerWidth) {
        ttTop = r.top; ttLeft = r.right + 20;
    } else if (placement === 'left' && r.left - 20 - ttRect.width > 0) {
        ttTop = r.top; ttLeft = r.left - 20 - ttRect.width;
    } else if (placement === 'bottom' && r.bottom + 20 + ttRect.height < window.innerHeight) {
        ttTop = r.bottom + 20; ttLeft = Math.min(Math.max(r.left, 10), window.innerWidth - ttRect.width - 10);
    } else if (r.top - 20 - ttRect.height > 0) {
        ttTop = r.top - 20 - ttRect.height; ttLeft = Math.min(Math.max(r.left, 10), window.innerWidth - ttRect.width - 10);
    } else {
        ttTop = r.bottom + 20; ttLeft = Math.min(Math.max(r.left, 10), window.innerWidth - ttRect.width - 10);
    }
    ttTop = Math.min(Math.max(ttTop, 10), window.innerHeight - ttRect.height - 10);

    tooltip.style.top  = `${ttTop}px`;
    tooltip.style.left = `${ttLeft}px`;
}

function endTour() {
    const step = currentTourStep();
    if (step && step.onExit) step.onExit();
    tourDynamicModal?.remove();
    tourDynamicModal = null;
    document.getElementById('tourOverlay')?.remove();
    document.removeEventListener('keydown', tourKeyHandler);
    tourIndex = -1;
    localStorage.setItem('TecPlanner_TutorialSeen', 'true');
}

window.addEventListener('resize', () => {
    if (tourIndex >= 0) {
        const step = currentTourStep();
        const el   = step && step.target ? step.target() : null;
        positionTour(el, step ? step.placement : 'bottom');
    }
});

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

// Cierra el panel de perfil si se hace clic fuera de él
document.addEventListener('click', (e) => {
    const sheet     = document.getElementById('characterSheet');
    const toggleBtn = document.getElementById('btnProfileToggle');
    if (!sheet || !sheet.classList.contains('open')) return;
    if (sheet.contains(e.target) || (toggleBtn && toggleBtn.contains(e.target))) return;
    if (e.target.closest('#tourOverlay')) return; 
    sheet.classList.remove('open');
});

// ===== Easter Egg: Biotecnología UNA =====
let titleTapCount = 0;
let titleTapTimer = null;

document.addEventListener("DOMContentLoaded", () => {

    const title = document.getElementById("secretTitle");
    if (!title) return;

    title.addEventListener("click", () => {

        titleTapCount++;

        clearTimeout(titleTapTimer);

        titleTapTimer = setTimeout(() => {
            titleTapCount = 0;
        }, 1500);

        if (titleTapCount === 3) {

            titleTapCount = 0;

            const card = document.querySelector(
                '.major-card[data-career="biotec_una"]'
            );

            if (card) {
                card.style.display = "block";
                card.click();
            }

        }

    });

});



// =============================================================================
// 20. HOME / INDEX + MODO ACTIVO PERSISTENTE
// =============================================================================

// Editar esta lista para publicar novedades. `id` debe ser único y estable.
const NEWS_ITEMS = [
    { id: 'horarios-launch', date: '2026-07-11', title: '📅 Nuevo: Generador de Horarios',
      text: 'Ahora podés armar tu horario semanal con datos reales del TEC y detección de choques en vivo.' },
];

function getRecommendations() {
    const recos = [];
    if (!localStorage.getItem('TecPlanner_ActiveMajor')) {
        recos.push({ title: '🎓 Elegí tu carrera', text: 'Seleccioná tu plan de estudios para empezar a planificar.', action: () => switchAppMode('arbol') });
    }
    if (!localStorage.getItem('TecPlanner_TutorialSeen')) {
        recos.push({ title: '📖 Hacé el tour guiado', text: 'Conocé todas las funciones de TecPlanner en 2 minutos.', action: () => { switchAppMode('arbol'); setTimeout(startTour, 300); } });
    }
    return recos;
}

function computeHomeStats() {
    const hasMajor = !!currentMajor;
    const totalCreds = hasMajor ? coursesDB.filter(c => !c.isRetry).reduce((s,c)=>s+c.cred,0) : 0;
    const approvedCreds = hasMajor ? coursesDB.filter(c => c.status === 'aprobado').reduce((s,c)=>s+c.cred,0) : 0;
    const pct = totalCreds > 0 ? Math.round((approvedCreds/totalCreds)*100) : 0;
    const cursando = hasMajor ? coursesDB.filter(c => c.status === 'cursando').length : 0;

    let ponderado = 0, credsConNota = 0, sumaNotas = 0;
    if (hasMajor) {
        coursesDB.forEach(c => {
            if (c.status === 'aprobado' && c.grade && !isNaN(c.grade) && c.grade.toString().trim() !== '') {
                const g = parseFloat(c.grade);
                credsConNota += c.cred;
                sumaNotas += g * c.cred;
            }
        });
        ponderado = credsConNota > 0 ? (sumaNotas / credsConNota) : 0;
    }

    return { hasMajor, totalCreds, approvedCreds, pct, cursando, ponderado };
}

function renderIndexView() {
    const stats = computeHomeStats();
    const majorName = stats.hasMajor ? (careers_information[currentMajor]?.name || currentMajor) : 'Sin carrera';

    // Panel hero: anillo + stats
    const panel = document.getElementById('homeHeroPanel');
    if (panel) {
        panel.innerHTML = `
            <div class="hhp-ring-wrap">
                <div class="hhp-ring" style="--pct:${stats.pct};">
                    <div class="hhp-ring-text">
                        <div class="hhp-ring-pct">${stats.pct}%</div>
                        <div class="hhp-ring-label">Progreso</div>
                    </div>
                </div>
            </div>
            <div class="hhp-stats">
                <div class="hhp-stat">
                    <div class="hhp-stat-num">${majorName}</div>
                    <div class="hhp-stat-label">Carrera activa</div>
                </div>
                <div class="hhp-stat">
                    <div class="hhp-stat-num accent-green">${stats.approvedCreds}<small>/${stats.totalCreds}</small></div>
                    <div class="hhp-stat-label">Créditos aprobados</div>
                </div>
                <div class="hhp-stat">
                    <div class="hhp-stat-num accent-cyan">${stats.cursando} Cursos</div>
                    <div class="hhp-stat-label">Cursando ahora</div>
                </div>
                <div class="hhp-stat">
                    <div class="hhp-stat-num accent-amber">${stats.hasMajor && stats.ponderado > 0 ? stats.ponderado.toFixed(1) : '—'}</div>
                    <div class="hhp-stat-label">Promedio ponderado</div>
                </div>
            </div>`;
    }

    // Barra de accesos rápidos: eliminada — solo quedan las 2 tarjetas grandes de abajo
    const quickbar = document.getElementById('homeQuickbar');
    if (quickbar) { quickbar.style.display = 'none'; quickbar.innerHTML = ''; }

    // Feature cards (solo lo esencial, bien notorio)
    const features = document.getElementById('homeFeatures');
    if (features) {
        features.innerHTML = `
            <div class="home-feature-card home-feature-arbol home-feature-big" onclick="switchAppMode('arbol')">
                <div class="hfc-icon">🌳</div>
                <div class="hfc-title">Planes de Estudio</div>
                <div class="hfc-desc">Mapeá tu carrera completa: progreso, notas, requisitos y promedio.</div>
                <div class="hfc-cta">Entrar al árbol →</div>
            </div>
            <div class="home-feature-card home-feature-horario home-feature-big" onclick="switchAppMode('horarios')">
                <div class="hfc-icon">📅</div>
                <div class="hfc-title">Generar Horario</div>
                <div class="hfc-desc">Armá tu horario semanal con datos reales del TEC y detección de choques.</div>
                <div class="hfc-cta">Armar horario →</div>
            </div>`;
    }

    // Novedades
    const newsList = document.getElementById('indexNewsList');
    newsList.innerHTML = NEWS_ITEMS.slice().reverse().map(n => `
        <div class="home-news-item">
            <div class="hni-title">${n.title}</div>
            <div class="hni-text">${n.text}</div>
            <div class="hni-date">${n.date}</div>
        </div>`).join('') || `<div class="home-empty">Sin novedades por ahora.</div>`;

    // Recomendaciones
    const recos = getRecommendations();
    const recosList = document.getElementById('indexRecosList');
    recosList.innerHTML = recos.map((r, i) => `
        <div class="home-reco-item" onclick="getRecommendations()[${i}].action()">
            <span class="hri-icon">${r.title.split(' ')[0]}</span>
            <div>
                <div class="hri-title">${r.title.replace(/^\S+\s/, '')}</div>
                <div class="hri-text">${r.text}</div>
            </div>
        </div>`).join('') || `<div class="home-empty">Estás al día.</div>`;

    const latest = NEWS_ITEMS.length ? NEWS_ITEMS[NEWS_ITEMS.length - 1].id : null;
    if (latest) localStorage.setItem('TecPlanner_LastSeenNews', latest);
    updateNotifDot();
}

function updateNotifDot() {
    const dot = document.getElementById('modeNotifDot');
    if (!dot) return;
    const lastSeen = localStorage.getItem('TecPlanner_LastSeenNews');
    const latest = NEWS_ITEMS.length ? NEWS_ITEMS[NEWS_ITEMS.length - 1].id : null;
    dot.style.display = (latest && latest !== lastSeen) ? 'block' : 'none';
}

function toggleModeMenu() {
    document.getElementById('modeSwitcher').classList.toggle('open');
}
document.addEventListener('click', (e) => {
    const sw = document.getElementById('modeSwitcher');
    if (sw && !sw.contains(e.target)) sw.classList.remove('open');
});

// El hover CSS puro se rompe al cruzar el hueco entre la bola y los ítems
// del abanico (esa zona no tiene ningún elemento debajo). Por eso se maneja
// la apertura con JS y un pequeño margen de tiempo al salir.
let modeMenuCloseTimer = null;
document.addEventListener('DOMContentLoaded', () => {
    const sw = document.getElementById('modeSwitcher');
    if (!sw) return;
    sw.addEventListener('mouseenter', () => {
        clearTimeout(modeMenuCloseTimer);
        sw.classList.add('open');
    });
    sw.addEventListener('mouseleave', () => {
        clearTimeout(modeMenuCloseTimer);
        modeMenuCloseTimer = setTimeout(() => sw.classList.remove('open'), 350);
    });
});

function switchAppMode(mode) {
    document.getElementById('modeSwitcher')?.classList.remove('open');

    if (mode === 'arbol' && !currentMajor) {
        document.getElementById('majorSelectionOverlay').style.display = 'flex';
        mode = 'index';
    }

    localStorage.setItem('TecPlanner_LastMode', mode);

    const sections = {
        index:    [document.getElementById('indexView')],
        arbol:    [document.querySelector('.hud-panel'), document.querySelector('.game-area')],
        horarios: [document.getElementById('horariosView')],
    };

    Object.entries(sections).forEach(([key, els]) => {
        els.forEach(el => el && (el.style.display = key === mode ? '' : 'none'));
    });
    // .hud-panel usa flex, no bloque vacío
    if (mode === 'arbol') {
        const hud = document.querySelector('.hud-panel');
        if (hud) hud.style.display = 'flex';

        const gameArea = document.querySelector('.game-area');
        const listView = document.getElementById('listView');
        if (viewMode === 'list') {
            gameArea.style.display = 'none';
            listView.style.display = 'block';
        } else {
            gameArea.style.display = 'block';
            listView.style.display = 'none';
        }

        setTimeout(drawConnections, 50);
        setTimeout(drawConnections, 300);
    }

    if (mode === 'index') {
        renderIndexView();
        setTimeout(showModeSwitcherHint, 900);
    }
    if (mode === 'horarios' && typeof initHorarios === 'function') initHorarios();
}

// Al cargar: restaurar el modo donde el usuario se quedó (default: index)
document.addEventListener('DOMContentLoaded', () => {
    updateNotifDot();
    bootSystem();
    const lastMode = localStorage.getItem('TecPlanner_LastMode') || 'index';
    switchAppMode(lastMode);
});

// =============================================================================
// 20b. HINT DEL MODE SWITCHER (primera visita a Home)
// =============================================================================

function showModeSwitcherHint() {
    if (localStorage.getItem('TecPlanner_ModeHintSeen')) return;
    if (document.getElementById('modeHintOverlay')) return;

    const target = document.getElementById('modeSwitcherBtn');
    const switcher = document.getElementById('modeSwitcher');
    if (!target) return;

    const wrap = document.createElement('div');
    wrap.id = 'modeHintOverlay';
    wrap.innerHTML = `
        <div class="tour-frame" id="mhFrameTop"></div>
        <div class="tour-frame" id="mhFrameBottom"></div>
        <div class="tour-frame" id="mhFrameLeft"></div>
        <div class="tour-frame" id="mhFrameRight"></div>
        <div class="tour-spot" id="mhSpot" style="border-radius:50%;"></div>
        <div class="tour-tooltip" id="mhTooltip" style="width:300px;">
            <div class="tour-tt-title">🧭 Así cambiás de sección</div>
            <div class="tour-tt-text">
                Esta bola flotante es tu menú principal. Pasá el mouse sobre ella
                (o tocala en el celular) y elegí entre <strong>Home</strong>,
                <strong>Planes de Estudio</strong> y <strong>Generar Horario</strong>.
            </div>
            <div class="tour-tt-footer">
                <div class="tour-tt-btns" style="justify-content:flex-end;">
                    <button class="tour-btn tour-btn-next" onclick="dismissModeHint()">¡Entendido! ✓</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(wrap);

    switcher?.classList.add('open'); // muestra el abanico de opciones de fondo
    positionModeHint(target);
    window.addEventListener('resize', repositionModeHintIfOpen);
    document.addEventListener('keydown', modeHintKeyHandler);

    // clic afuera del spot también cierra el hint
    ['mhFrameTop', 'mhFrameBottom', 'mhFrameLeft', 'mhFrameRight'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', dismissModeHint);
    });
}

function positionModeHint(el) {
    const spot     = document.getElementById('mhSpot');
    const tooltip  = document.getElementById('mhTooltip');
    const top      = document.getElementById('mhFrameTop');
    const bottom   = document.getElementById('mhFrameBottom');
    const left     = document.getElementById('mhFrameLeft');
    const right    = document.getElementById('mhFrameRight');
    if (!spot || !tooltip) return;

    const r   = el.getBoundingClientRect();
    const pad = 10;

    spot.style.top    = `${r.top - pad}px`;
    spot.style.left   = `${r.left - pad}px`;
    spot.style.width  = `${r.width + pad * 2}px`;
    spot.style.height = `${r.height + pad * 2}px`;

    top.style.cssText    = `top:0; left:0; width:100%; height:${r.top - pad}px;`;
    bottom.style.cssText = `top:${r.bottom + pad}px; left:0; width:100%; height:calc(100% - ${r.bottom + pad}px);`;
    left.style.cssText   = `top:${r.top - pad}px; left:0; width:${r.left - pad}px; height:${r.height + pad * 2}px;`;
    right.style.cssText  = `top:${r.top - pad}px; left:${r.right + pad}px; width:calc(100% - ${r.right + pad}px); height:${r.height + pad * 2}px;`;

    const ttRect = tooltip.getBoundingClientRect();
    let ttTop  = r.top - ttRect.height - 20;
    let ttLeft = r.right - ttRect.width;
    if (ttTop < 10) ttTop = r.bottom + 20;
    ttLeft = Math.min(Math.max(ttLeft, 10), window.innerWidth - ttRect.width - 10);
    ttTop  = Math.min(Math.max(ttTop, 10), window.innerHeight - ttRect.height - 10);

    tooltip.style.top  = `${ttTop}px`;
    tooltip.style.left = `${ttLeft}px`;
}

function repositionModeHintIfOpen() {
    const el = document.getElementById('modeSwitcherBtn');
    if (document.getElementById('modeHintOverlay') && el) positionModeHint(el);
}

function modeHintKeyHandler(e) {
    if (e.key === 'Escape') dismissModeHint();
}

function dismissModeHint() {
    document.getElementById('modeHintOverlay')?.remove();
    document.getElementById('modeSwitcher')?.classList.remove('open');
    localStorage.setItem('TecPlanner_ModeHintSeen', 'true');
    window.removeEventListener('resize', repositionModeHintIfOpen);
    document.removeEventListener('keydown', modeHintKeyHandler);
}