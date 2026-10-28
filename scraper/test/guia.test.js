// test/guia.test.js
// Parseo de la guía de TEC Digital (HTML real pegado de DevTools) y cruce
// directo por código + grupo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    parsearTablaGuia, parsearHorarioGuia, parsearAula, parsearOpciones,
    resolverClavePeriodo, resolverCodigosSede,
} from '../guia.js';
import { enriquecerArchivoConGuia } from '../aulas.js';

const fila = (cod, nom, grupo, hor, aula, prof) => `
    <tr>
        <td class='c1'>${cod}</td><td class='ajuste_materia'>${nom}</td><td>${grupo}</td>
        <td class='c1'>3</td><td class='ajuste_horario'>${hor}</td><td>${aula}</td>
        <td>${prof}</td><td class='c1'>40</td><td>Curso Unico</td><td class='c7'>Regular</td><td>0</td>
    </tr>`;

const HTML = `<table id='tguiaHorario' class='table table-striped table-bordered'>
    <thead>
        <th id='replaceCod'>Código</th><th>Materia</th><th>Grupo
</ msg></ th><th id='replaceCred'>Créditos</th>
<th>Horario</th><th>Aula</th><th>Profesor</th><th>Cupo</th><th>Tipo Materia</th><th>Tipo Grupo</th><th>Reservados</th>
</ thead>
<tbody>${fila('FI1101', 'Física general I', '001', 'Martes - 13:0:16:50', 'B2-010', 'Segura Carvajal Marcos')}
${fila('FI1101', 'Física general I', '001', 'Miercoles - 13:0:16:50', 'B2-010', 'Segura Carvajal Marcos')}
${fila('FI1201', 'Laboratorio física general I', '001', 'Martes - 8:30:11:20', 'C4-001', 'Gutierrez Chaves Carlos Roberto')}
</tbody></table>`;

test('parsearTablaGuia: ignora encabezados y extrae filas', () => {
    const filas = parsearTablaGuia(HTML);
    assert.equal(filas.length, 3);
    assert.deepEqual(filas[0], {
        codigo: 'FI1101',
        grupo: 1,
        horario: { dia: 'Martes', inicio: '13:00', fin: '16:50' },
        aula: { edificio: 'B2', aula: '10' },
    });
    assert.deepEqual(filas[2].aula, { edificio: 'C4', aula: '1' });
});

test('parsearHorarioGuia: normaliza minutos sin cero', () => {
    assert.deepEqual(parsearHorarioGuia('Jueves - 8:30:10:20'), { dia: 'Jueves', inicio: '08:30', fin: '10:20' });
    assert.equal(parsearHorarioGuia('basura'), null);
});

test('parsearAula: edificio-aula, sin aula separable → null', () => {
    assert.deepEqual(parsearAula('G18-002'), { edificio: 'G18', aula: '2' });
    assert.equal(parsearAula(''), null);
    assert.equal(parsearAula('VIRTUAL'), null);
});

test('resolverClavePeriodo: verano por clave, semestre por etiqueta', () => {
    const periodos = [
        { key: '2026_B_5', data: '2026 - Bimestre 5' },
        { key: '2026_S_1', data: '2026 - Semestre 1' },
        { key: '2026_S_2', data: '2026 - Semestre 2' },
        { key: '2026_V_1', data: '2026 - Verano 1' },
    ];
    assert.equal(resolverClavePeriodo(periodos, 2026, '1V'), '2026_V_1');
    assert.equal(resolverClavePeriodo(periodos, 2026, '2'), '2026_S_2');
    assert.equal(resolverClavePeriodo(periodos, 2027, '1'), null);
});

test('resolverCodigosSede: empareja por nombre sin importar tildes ni mayúsculas', () => {
    const opciones = parsearOpciones(
        "<span value='AL'>Centro Academico De Alajuela</span>" +
        "<span value='CA'>Campus Tecnologico Central Cartago</span>"
    );
    const mapa = resolverCodigosSede(opciones);
    assert.equal(mapa.get('CA'), 'CA');
    assert.equal(mapa.get('AL'), 'AL');
    assert.equal(mapa.has('SJ'), false);
});

test('enriquecerArchivoConGuia: cruza por código+grupo (001 ↔ 1) y deja null lo que no coincide', () => {
    const archivo = {
        cursos: [
            { codigo: 'FI1101', grupos: [{ grupo: 1 }, { grupo: 2 }] },
            { codigo: 'FI9999', grupos: [{ grupo: 1 }] },
        ],
    };
    const { archivo: res, stats } = enriquecerArchivoConGuia(archivo, parsearTablaGuia(HTML));
    assert.deepEqual(res.cursos[0].grupos[0], { grupo: 1, edificio: 'B2', aula: '10' });
    assert.equal(res.cursos[0].grupos[1].aula, null);
    assert.equal(res.cursos[1].grupos[0].edificio, null);
    assert.deepEqual(stats, { intentados: 3, enriquecidos: 1 });
    assert.equal(archivo.cursos[0].grupos[0].edificio, undefined); // no muta
});

test('enriquecerArchivoConGuia: filas null (consulta falló) → todo null sin lanzar', () => {
    const archivo = { cursos: [{ codigo: 'FI1101', grupos: [{ grupo: 1 }] }] };
    const { stats } = enriquecerArchivoConGuia(archivo, null);
    assert.deepEqual(stats, { intentados: 1, enriquecidos: 0 });
});
