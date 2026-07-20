// test/scraper.test.js
// Casos límite del pipeline de parseo/validación/historial/metadata.
// No toca red ni disco real (salvo metadata.js, que es pura y recibe
// la fecha inyectada).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parsearCursosPorEscuela, periodoEfectivo } from '../parser.js';
import { actualizarHistorial } from '../history.js';
import { construirMetadata } from '../metadata.js';
import { validarArchivo } from '../validacion.js';
import { esPosgrado, esPeriodoBaseValido } from '../config.js';

function sesionBase(overrides = {}) {
    return {
        DSC_SEDE: 'CAMPUS TECNOLOGICO CENTRAL CARTAGO',
        DSC_DEPTO: 'Matemática',
        IDE_PER_MOD: 1,
        NUM_ANO: 2026,
        IDE_MATERIA: 'MA1102',
        DSC_MATERIA: 'Cálculo Diferencial e Integral',
        CAN_CREDITOS: 4,
        IDE_GRUPO: '1',
        NOM_PROFESOR: 'Juan Pérez',
        // TIPO_CURSO = modalidad de entrega (Regular/Semipresencial/Virtual).
        // DSC_MODALIDAD / IDE_MODALIDAD = tipo de período (Semestre/Verano);
        // acá se asume "S" para semestre regular ya que no tengo confirmado
        // ese valor exacto — lo único confirmado con dato real es "V"/"VERANO".
        TIPO_CURSO: 'Regular',
        IDE_MODALIDAD: 'S',
        DSC_MODALIDAD: 'SEMESTRE',
        NOM_DIA: 'LUNES',
        HINICIO: '07:00',
        HFIN: '08:50',
        ...overrides,
    };
}

test('respuesta vacía ([]) no genera sedes ni tira error', () => {
    const resultado = parsearCursosPorEscuela([], 'MA');
    assert.deepEqual(resultado, []);
});

test('escuela sin cursos se comporta igual que respuesta vacía', () => {
    const resultado = parsearCursosPorEscuela([], 'QU');
    assert.equal(resultado.length, 0);
});

test('curso con un único horario', () => {
    const [sede] = parsearCursosPorEscuela([sesionBase()], 'MA');
    const [curso] = sede.cursos;
    const [grupo] = curso.grupos;
    assert.equal(grupo.horario, 'LUN[07:00-08:50]');
});

test('la modalidad de entrega viene de TIPO_CURSO, no de DSC_MODALIDAD', () => {
    // Caso real confirmado: una sesión de Verano tiene DSC_MODALIDAD:"VERANO"
    // pero TIPO_CURSO:"Semipresencial" — el grupo debe mostrar "Semipresencial",
    // no "VERANO" (ese es el bug que corrigió esta prueba).
    const [sede] = parsearCursosPorEscuela(
        [sesionBase({ IDE_MODALIDAD: 'V', DSC_MODALIDAD: 'VERANO', TIPO_CURSO: 'Semipresencial' })],
        'MA'
    );
    assert.equal(sede.cursos[0].grupos[0].modalidad, 'Semipresencial');
});

test('curso con varios horarios se fusiona en un solo grupo', () => {
    const sesiones = [sesionBase(), sesionBase({ NOM_DIA: 'MIERCOLES' })];
    const [sede] = parsearCursosPorEscuela(sesiones, 'MA');
    const [curso] = sede.cursos;
    assert.equal(curso.grupos.length, 1);
    assert.equal(curso.grupos[0].horario, 'LUN[07:00-08:50] MIE[07:00-08:50]');
});

test('profesor sin asignar se normaliza a null', () => {
    const [sede] = parsearCursosPorEscuela(
        [sesionBase({ NOM_PROFESOR: 'Sin profesor asignado' })],
        'MA'
    );
    assert.equal(sede.cursos[0].grupos[0].profesor, null);
});

test('sede desconocida genera slug temporal sin tronar la ejecución', () => {
    const [sede] = parsearCursosPorEscuela(
        [sesionBase({ DSC_SEDE: 'Centro Académico Nuevo' })],
        'MA'
    );
    assert.equal(sede.codigoSede, 'CENTRO-ACADE');
});

test('un año con varios períodos mezclados no se fusiona', () => {
    const sesiones = [
        sesionBase({ IDE_PER_MOD: 1 }),
        sesionBase({ IDE_PER_MOD: 2, IDE_MATERIA: 'MA1103', DSC_MATERIA: 'Álgebra Lineal' }),
    ];
    const resultado = parsearCursosPorEscuela(sesiones, 'MA');
    assert.equal(resultado.length, 2);
    assert.deepEqual(resultado.map((r) => String(r.periodo)).sort(), ['1', '2']);
});

test('Verano comparte IDE_PER_MOD con el semestre regular pero no se fusiona (caso real confirmado)', () => {
    const sesionRegular = sesionBase({ IDE_PER_MOD: 1 }); // IDE_MODALIDAD:"S", DSC_MODALIDAD:"SEMESTRE"
    const sesionVerano = sesionBase({
        IDE_PER_MOD: 1,
        IDE_MODALIDAD: 'V',
        DSC_MODALIDAD: 'VERANO',
        TIPO_CURSO: 'Semipresencial',
        IDE_MATERIA: 'FI2103',
        DSC_MATERIA: 'Física general III',
        NOM_DIA: 'MARTES',
        HINICIO: '13:00',
        HFIN: '16:50',
    });

    const resultado = parsearCursosPorEscuela([sesionRegular, sesionVerano], 'MA');

    assert.equal(resultado.length, 2);
    const periodos = resultado.map((r) => r.periodo).sort();
    assert.deepEqual(periodos, ['1', '1V']);

    const sedeVerano = resultado.find((r) => r.periodo === '1V');
    assert.equal(sedeVerano.cursos[0].codigo, 'FI2103');
});

test('periodoEfectivo detecta Verano por IDE_MODALIDAD="V" (caso real confirmado)', () => {
    const sesionVerano = {
        DSC_SEDE: 'CAMPUS TECNOLOGICO CENTRAL CARTAGO',
        IDE_MATERIA: 'FI2103',
        DSC_MATERIA: 'Física general III',
        IDE_GRUPO: 1,
        DSC_DEPTO: 'ESCUELA DE FISICA',
        CAN_CREDITOS: 3,
        NOM_DIA: 'MARTES',
        IDE_MODALIDAD: 'V',
        IDE_PER_MOD: 1,
        NUM_ANO: 2025,
        DSC_MODALIDAD: 'VERANO',
        TIPO_CURSO: 'Semipresencial',
        HINICIO: '13:00',
        HFIN: '16:50',
        NOM_PROFESOR: 'CAMBRONERO CORDERO MICHAEL',
    };
    assert.equal(periodoEfectivo(sesionVerano), '1V');
});

test('validarArchivo advierte sobre campos faltantes sin lanzar error', () => {
    const avisos = [];
    const originalWarn = console.warn;
    console.warn = (msg) => avisos.push(msg);
    try {
        validarArchivo({
            nombreEscuela: 'Matemática',
            nombreSede: 'Cartago',
            periodo: 1,
            cursos: [
                {
                    codigo: 'MA1102',
                    nombre: 'Cálculo',
                    grupos: [{ grupo: '1', modalidad: 'Regular', horario: '' }],
                },
            ],
        });
    } finally {
        console.warn = originalWarn;
    }
    assert.equal(avisos.length, 1);
    assert.match(avisos[0], /horario/);
});

test('validarArchivo no advierte cuando profesor es null (es válido)', () => {
    const avisos = [];
    const originalWarn = console.warn;
    console.warn = (msg) => avisos.push(msg);
    try {
        validarArchivo({
            nombreEscuela: 'Matemática',
            nombreSede: 'Cartago',
            periodo: 1,
            cursos: [
                {
                    codigo: 'MA1102',
                    nombre: 'Cálculo',
                    grupos: [{ grupo: '1', profesor: null, modalidad: 'Regular', horario: 'LUN[07:00-08:50]' }],
                },
            ],
        });
    } finally {
        console.warn = originalWarn;
    }
    assert.equal(avisos.length, 0);
});

test('actualizarHistorial no duplica el mismo período si se llama dos veces', () => {
    let historial = {};
    const curso = { codigo: 'MA1102', nombre: 'Cálculo', creditos: 4 };
    historial = actualizarHistorial(historial, [curso], 2026, 1);
    historial = actualizarHistorial(historial, [curso], 2026, 1);
    assert.deepEqual(historial.MA1102.historial, ['2026-1']);
});

test('construirMetadata ordena los períodos numéricamente', () => {
    const metadata = construirMetadata({
        anio: 2026,
        periodos: [2, 1],
        totalEscuelas: 1,
        totalCursos: 1,
        totalArchivos: 1,
        fecha: new Date('2026-07-10T00:00:00Z'),
    });
    assert.deepEqual(metadata.periodos, [1, 2]);
});

test('construirMetadata ordena "1V" (Verano) después de "1" y antes de "2"', () => {
    const metadata = construirMetadata({
        anio: 2026,
        periodos: ['2', '1V', '1'],
        totalEscuelas: 1,
        totalCursos: 1,
        totalArchivos: 1,
        fecha: new Date('2026-07-10T00:00:00Z'),
    });
    assert.deepEqual(metadata.periodos, ['1', '1V', '2']);
});

test('esPosgrado detecta el caso real de una maestría', () => {
    assert.equal(esPosgrado('MAESTRIA EN DESARROLLO ECONOMICO LOCAL'), true);
});

test('esPosgrado detecta variantes con tildes y "POSGRADO"/"DOCTORADO"', () => {
    assert.equal(esPosgrado('Maestría en Administración de Empresas'), true);
    assert.equal(esPosgrado('Doctorado en Ciencias Naturales'), true);
    assert.equal(esPosgrado('Sistema de Estudios de Posgrado'), true);
});

test('esPosgrado no marca escuelas de grado normales', () => {
    assert.equal(esPosgrado('ADMINISTRACION DE EMPRESAS'), false);
    assert.equal(esPosgrado('INGENIERIA EN COMPUTACION'), false);
});

test('esPeriodoBaseValido acepta período 1 y 2, incluyendo sus variantes de Verano', () => {
    assert.equal(esPeriodoBaseValido({ IDE_PER_MOD: 1 }), true);
    assert.equal(esPeriodoBaseValido({ IDE_PER_MOD: '2' }), true);
    // Verano I: mismo IDE_PER_MOD que el semestre regular, distinto IDE_MODALIDAD.
    assert.equal(esPeriodoBaseValido({ IDE_PER_MOD: 1, IDE_MODALIDAD: 'V' }), true);
});

test('esPeriodoBaseValido rechaza períodos de calendarios especiales (caso real: 3-7)', () => {
    assert.equal(esPeriodoBaseValido({ IDE_PER_MOD: 3 }), false);
    assert.equal(esPeriodoBaseValido({ IDE_PER_MOD: 7 }), false);
});