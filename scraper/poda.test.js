// test/poda.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { planificarPoda, aplicarPoda, aplicarPodaAlIndice } from '../poda.js';

const curso = (c) => ({ codigo: c, grupos: [] });
const archivo = (anio, periodo, sede, esc, cursos) => ({ anio, periodo, codigoSede: sede, codigoEscuela: esc, cursos: cursos.map(curso) });

async function armar(previos) {
    const dir = await mkdtemp(path.join(tmpdir(), 'poda-'));
    for (const a of previos) {
        const ruta = path.join(dir, a.anio, a.periodo, a.codigoSede, `${a.codigoEscuela}.json`);
        await mkdir(path.dirname(ruta), { recursive: true });
        await writeFile(ruta, JSON.stringify(a));
    }
    return dir;
}
const nuevos = (dir, lista) => new Map(lista.map((a) => [path.join(dir, a.anio, a.periodo, a.codigoSede, `${a.codigoEscuela}.json`), a]));

test('elimina el archivo de una escuela que el TEC ya no publica', async () => {
    const prev = [archivo('2026', '1V', 'CA', 'IC', ['A', 'B']), archivo('2026', '1V', 'CA', 'AE', ['C', 'D'])];
    const dir = await armar(prev);
    const plan = await planificarPoda(nuevos(dir, [prev[0], archivo('2026', '1V', 'CA', 'X', ['E'])]), { dataDir: dir, anio: '2026', periodosActivos: ['1V'] });
    assert.deepEqual(plan.eliminar.map((f) => path.basename(f)), ['AE.json']);
    await aplicarPoda(plan.eliminar);
    assert.deepEqual((await readdir(path.join(dir, '2026', '1V', 'CA'))).sort(), ['IC.json']);
});

test('no poda un período si el TEC no devolvió nada de él', async () => {
    const prev = [archivo('2026', '1V', 'CA', 'IC', ['A']), archivo('2026', '1', 'CA', 'IC', ['A'])];
    const dir = await armar(prev);
    const plan = await planificarPoda(nuevos(dir, [prev[1]]), { dataDir: dir, anio: '2026', periodosActivos: ['1V'] });
    assert.deepEqual(plan.eliminar, []);
    assert.equal(plan.omitidos.length, 1);
});

test('no poda si la cantidad de cursos cae de forma sospechosa, salvo que se fuerce', async () => {
    const prev = [archivo('2026', '1V', 'CA', 'IC', ['A', 'B', 'C', 'D']), archivo('2026', '1V', 'CA', 'AE', ['E'])];
    const dir = await armar(prev);
    const nuevo = nuevos(dir, [archivo('2026', '1V', 'CA', 'IC', ['A'])]);
    assert.deepEqual((await planificarPoda(nuevo, { dataDir: dir, anio: '2026', periodosActivos: ['1V'] })).eliminar, []);
    const forzado = await planificarPoda(nuevo, { dataDir: dir, anio: '2026', periodosActivos: ['1V'], forzar: true });
    assert.equal(forzado.eliminar.length, 1);
});

test('nunca toca períodos que no estén activos (semestres pasados)', async () => {
    const prev = [archivo('2026', '1', 'CA', 'IC', ['A', 'B']), archivo('2026', '1V', 'CA', 'IC', ['A'])];
    const dir = await armar(prev);
    const plan = await planificarPoda(nuevos(dir, [archivo('2026', '1', 'CA', 'X', ['Z']), prev[1]]), { dataDir: dir, anio: '2026', periodosActivos: ['1V'] });
    assert.deepEqual(plan.eliminar, []);
    assert.deepEqual((await planificarPoda(nuevos(dir, [prev[1]]), { dataDir: dir, anio: '2026', periodosActivos: [] })).eliminar, []);
});

test('el índice reemplaza los períodos podados y conserva los demás', () => {
    const fusionado = { 2026: { 1: { sedes: { CA: { IC: 'x' } } }, '1V': { sedes: { CA: { IC: 'x', AE: 'y' } } } } };
    const nuevo = { 2026: { '1V': { sedes: { CA: { IC: 'x' } } } } };
    const r = aplicarPodaAlIndice(fusionado, nuevo, '2026', ['1V']);
    assert.deepEqual(r[2026]['1V'].sedes.CA, { IC: 'x' });
    assert.ok(r[2026][1]);
});
