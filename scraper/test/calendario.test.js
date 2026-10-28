// test/calendario.test.js
// Parseo del calendario oficial del TEC (HTML real guardado como fixture),
// derivación de ventanas de scraping y fusión de índices.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsearCalendario, parsearFecha, claveDePeriodo, fusionarEventos } from '../calendario.js';
import { construirVentanas, debeCorrerHoy } from '../ventanas.js';
import { fusionarIndices } from '../agregador.js';

const HTML = readFileSync(new URL('./fixtures/semestre-verano-2026-2027.html', import.meta.url), 'utf-8');
const { titulo, eventos, tablasLeidas } = parsearCalendario(HTML);

const buscar = (periodo, anio, tipo) => eventos.find((e) => e.periodo === periodo && e.anio === anio && e.tipo === tipo);

test('lee título y tablas con períodos; omite las que no tienen encabezado de períodos', () => {
    assert.equal(titulo, 'Semestre y Verano 2026-2027');
    assert.equal(tablasLeidas, 7);
    assert.ok(eventos.length >= 60);
});

test('parsearFecha: guiones, barras, año de 2 y 4 dígitos, inválidas', () => {
    assert.equal(parsearFecha('22-06-26'), '2026-06-22');
    assert.equal(parsearFecha('14/12/26'), '2026-12-14');
    assert.equal(parsearFecha('5/10/2026'), '2026-10-05');
    assert.equal(parsearFecha('31-02-26'), null);
    assert.equal(parsearFecha(''), null);
});

test('claveDePeriodo: semestres y Verano (se registra bajo el año en que arranca)', () => {
    assert.deepEqual(claveDePeriodo('II Semestre 2026'), { anio: '2026', periodo: '2' });
    assert.deepEqual(claveDePeriodo('I Semestre 2027'), { anio: '2027', periodo: '1' });
    assert.deepEqual(claveDePeriodo('Verano 2026-2027'), { anio: '2026', periodo: '1V' });
    assert.equal(claveDePeriodo('Bimestre 5'), null);
});

test('guía de horarios del Verano: celda que abarca Inicio y Fin = fecha única 02-11-26', () => {
    const e = buscar('1V', '2026', 'guia_horarios');
    assert.equal(e.inicio, '2026-11-02');
    assert.equal(e.fin, '2026-11-02');
});

test('guía de horarios del I Semestre 2027 queda en su propia columna (09-11-26)', () => {
    assert.equal(buscar('1', '2027', 'guia_horarios').inicio, '2026-11-09');
});

test('fechas con barras y celdas combinadas: matrícula ordinaria del Verano 14/12/26', () => {
    const e = buscar('1V', '2026', 'matricula_ordinaria');
    assert.equal(e.inicio, '2026-12-14');
});

test('rangos Inicio/Fin: apelaciones y período lectivo del Verano', () => {
    const ap = buscar('1V', '2026', 'apelaciones_inclusiones');
    assert.deepEqual([ap.inicio, ap.fin], ['2026-12-15', '2026-12-17']);
    const pl = buscar('1V', '2026', 'periodo_lectivo');
    assert.deepEqual([pl.inicio, pl.fin], ['2026-12-15', '2027-01-30']);
});

test('celdas vacías no generan eventos (matrícula de nuevos solo existe en I Semestre 2026)', () => {
    const nuevos = eventos.filter((e) => /estudiantes nuevos/i.test(e.actividad));
    assert.equal(nuevos.length, 1);
    assert.equal(nuevos[0].periodo, '1');
    assert.equal(nuevos[0].anio, '2026');
});

test('HTML sin tablas de períodos → 0 eventos (calendario.js se niega a escribir)', () => {
    const r = parsearCalendario('<html><title>x</title><table><tr><td>hola</td></tr></table></html>');
    assert.equal(r.eventos.length, 0);
    assert.equal(r.tablasLeidas, 0);
});

test('fusionarEventos: lo nuevo gana y lo que ya no está en la página se conserva', () => {
    const viejo = { anio: '2025', periodo: '2', tabla: 'T', actividad: 'Periodo lectivo', inicio: '2025-08-04', fin: '2025-11-22' };
    const previo = [viejo, { ...eventos[0], fin: '2099-01-01' }];
    const r = fusionarEventos(previo, [eventos[0]]);
    assert.ok(r.includes(viejo));
    assert.equal(r.find((e) => e.actividad === eventos[0].actividad && e.anio === eventos[0].anio && e.periodo === eventos[0].periodo && e.tabla === eventos[0].tabla).fin, eventos[0].fin);
});

test('ventanas: sondeo desde 14 días antes de la primera publicación', () => {
    const v = construirVentanas(eventos);
    const por = (anio, periodo) => v.find((x) => x.anio === anio && x.periodo === periodo);

    assert.deepEqual(
        [por('2026', '1V').sondeoDesde, por('2026', '1V').inicio, por('2026', '1V').fin],
        ['2026-10-19', '2026-12-14', '2026-12-17']
    );
    assert.deepEqual(
        [por('2026', '2').sondeoDesde, por('2026', '2').inicio, por('2026', '2').fin],
        ['2026-06-08', '2026-07-21', '2026-08-14']
    );
    // I Semestre 2027 todavía no trae matrícula en el calendario: usa la primera publicación y la última fecha conocida
    assert.deepEqual(
        [por('2027', '1').sondeoDesde, por('2027', '1').inicio, por('2027', '1').fin],
        ['2026-10-26', '2026-11-09', '2026-11-20']
    );
});

test('debeCorrerHoy: el Verano ya se sondea el 27-10 (antes de la fecha oficial) y no el 18-10', () => {
    const verano = construirVentanas(eventos).find((x) => x.periodo === '1V');
    assert.equal(debeCorrerHoy(verano, '2026-10-18'), false);
    assert.equal(debeCorrerHoy(verano, '2026-10-19'), true);
    assert.equal(debeCorrerHoy(verano, '2026-10-27'), true);
    assert.equal(debeCorrerHoy(verano, '2026-11-20'), true);   // sondeo: diario
    assert.equal(debeCorrerHoy(verano, '2026-12-14'), true);   // inicio de matrícula
    assert.equal(debeCorrerHoy(verano, '2026-12-15'), false);  // ya en cadencia semanal
    assert.equal(debeCorrerHoy(verano, '2026-12-17'), true);   // último día
    assert.equal(debeCorrerHoy(verano, '2026-12-18'), false);
});

test('fusionarIndices: una corrida filtrada a 1V no borra los demás períodos del índice', () => {
    const previo = { 2026: { 1: { sedes: { CA: { FI: 'ESCUELA DE FISICA' } } }, 2: { sedes: { CA: { FI: 'ESCUELA DE FISICA' } } } } };
    const nuevo = { 2026: { '1V': { sedes: { CA: { FI: 'ESCUELA DE FISICA' } } } } };
    const r = fusionarIndices(previo, nuevo);
    assert.deepEqual(Object.keys(r[2026]), ['1', '2', '1V']);
    assert.deepEqual(fusionarIndices(previo, {}), previo);
});
