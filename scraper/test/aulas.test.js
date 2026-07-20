// test/aulas.test.js
// Cubre el criterio de matching simplificado: mismo IdGrupo dentro de la
// respuesta ya indexada por materia, desempate por año/período más
// reciente, y extracción de edificio/aula del primer bloque del
// itinerario.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emparejarGrupo, enriquecerArchivoConAulas } from '../aulas.js';

function grupoBase(overrides = {}) {
    return {
        grupo: '1',
        profesor: 'Juan Pérez',
        modalidad: 'Regular',
        horario: 'MAR[07:30-09:20] JUE[07:30-09:20]',
        ...overrides,
    };
}

function candidato(overrides = {}) {
    return {
        IdMateria: 'MA1103',
        IdGrupo: 1,
        IdAño: 2026,
        IdPeriodo: 2,
        Itinerario: [
            { Dia: 'K', Inicio: '07:30', Fin: '09:20', Edificio: 'G18', Aula: 2 },
            { Dia: 'J', Inicio: '07:30', Fin: '09:20', Edificio: 'G18', Aula: 2 },
        ],
        ...overrides,
    };
}

test('matching limpio: mismo IdGrupo → asigna edificio/aula', () => {
    const resultado = emparejarGrupo({ grupo: grupoBase(), respuestaMateria: [candidato()] });
    assert.deepEqual(resultado, { edificio: 'G18', aula: '2' });
});

test('IdGrupo distinto (comparación como string, ej. 1 vs "1") → igual coincide', () => {
    const resultado = emparejarGrupo({
        grupo: grupoBase({ grupo: 1 }),
        respuestaMateria: [candidato({ IdGrupo: '1' })],
    });
    assert.deepEqual(resultado, { edificio: 'G18', aula: '2' });
});

test('grupo inexistente → descarta', () => {
    const resultado = emparejarGrupo({
        grupo: grupoBase({ grupo: '9' }),
        respuestaMateria: [candidato()],
    });
    assert.equal(resultado, null);
});

test('varios candidatos con mismo grupo (años distintos) → elige el de mayor IdAño', () => {
    const respuesta = [
        candidato({ IdAño: 2025, IdPeriodo: 2, Itinerario: [{ Edificio: 'VIEJO', Aula: 1 }] }),
        candidato({ IdAño: 2026, IdPeriodo: 1, Itinerario: [{ Edificio: 'NUEVO', Aula: 9 }] }),
    ];
    const resultado = emparejarGrupo({ grupo: grupoBase(), respuestaMateria: respuesta });
    assert.deepEqual(resultado, { edificio: 'NUEVO', aula: '9' });
});

test('varios candidatos mismo año, distinto período → elige el de mayor IdPeriodo', () => {
    const respuesta = [
        candidato({ IdAño: 2026, IdPeriodo: 1, Itinerario: [{ Edificio: 'VIEJO', Aula: 1 }] }),
        candidato({ IdAño: 2026, IdPeriodo: 2, Itinerario: [{ Edificio: 'NUEVO', Aula: 9 }] }),
    ];
    const resultado = emparejarGrupo({ grupo: grupoBase(), respuestaMateria: respuesta });
    assert.deepEqual(resultado, { edificio: 'NUEVO', aula: '9' });
});

test('itinerario sin edificio/aula → descarta', () => {
    const resultado = emparejarGrupo({
        grupo: grupoBase(),
        respuestaMateria: [candidato({ Itinerario: [{ Dia: 'K', Inicio: '07:30', Fin: '09:20', Edificio: null, Aula: null }] })],
    });
    assert.equal(resultado, null);
});

test('itinerario vacío → descarta', () => {
    const resultado = emparejarGrupo({
        grupo: grupoBase(),
        respuestaMateria: [candidato({ Itinerario: [] })],
    });
    assert.equal(resultado, null);
});

test('respuestaMateria null (materia sin sesión o que falló) → descarta sin lanzar', () => {
    const resultado = emparejarGrupo({ grupo: grupoBase(), respuestaMateria: null });
    assert.equal(resultado, null);
});

test('respuestaMateria vacía ([]) → descarta sin lanzar', () => {
    const resultado = emparejarGrupo({ grupo: grupoBase(), respuestaMateria: [] });
    assert.equal(resultado, null);
});

test('enriquecerArchivoConAulas no muta el archivo original', () => {
    const archivo = {
        cursos: [{ codigo: 'MA1103', nombre: 'Cálculo', creditos: 4, grupos: [grupoBase()] }],
    };
    const respuestasPorMateria = new Map([['MA1103', [candidato()]]]);

    const { archivo: resultado, stats } = enriquecerArchivoConAulas(archivo, respuestasPorMateria);

    assert.equal(archivo.cursos[0].grupos[0].edificio, undefined); // original intacto
    assert.equal(resultado.cursos[0].grupos[0].edificio, 'G18');
    assert.deepEqual(stats, { intentados: 1, enriquecidos: 1 });
});

test('enriquecerArchivoConAulas: materia sin respuesta en el Map → grupos quedan en null', () => {
    const archivo = {
        cursos: [{ codigo: 'FI1101', nombre: 'Física', creditos: 3, grupos: [grupoBase()] }],
    };
    const { archivo: resultado, stats } = enriquecerArchivoConAulas(archivo, new Map());

    assert.equal(resultado.cursos[0].grupos[0].edificio, null);
    assert.equal(resultado.cursos[0].grupos[0].aula, null);
    assert.deepEqual(stats, { intentados: 1, enriquecidos: 0 });
});