// test/fase2.test.js
// conservarAulasPrevias: la Fase 1 no trae aulas; lo que ya estaba en disco
// no se debe perder cuando la Fase 2 no corre o no encuentra un grupo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { conservarAulasPrevias } from '../fase2.js';

async function conArchivoPrevio(contenido, fn) {
    const dir = await mkdtemp(path.join(tmpdir(), 'tecplanner-'));
    const ruta = path.join(dir, 'FI.json');
    if (contenido) await writeFile(ruta, JSON.stringify(contenido));
    try { return await fn(ruta); } finally { await rm(dir, { recursive: true, force: true }); }
}

const previo = {
    cursos: [{ codigo: 'FI1101', grupos: [
        { grupo: 1, profesor: 'A', modalidad: 'Regular', horario: 'MAR[13:00-16:50]', edificio: 'B2', aula: '10' },
        { grupo: 2, profesor: 'B', modalidad: 'Regular', horario: 'MIE[13:00-16:50]', edificio: null, aula: null },
    ] }],
};

test('rellena el aula previa de grupos que quedaron sin aula (grupo 1 ↔ "001")', async () => {
    await conArchivoPrevio(previo, async (ruta) => {
        const nuevo = { cursos: [{ codigo: 'FI1101', grupos: [{ grupo: 1, horario: 'x' }, { grupo: 2, horario: 'y' }] }] };
        const r = await conservarAulasPrevias(new Map([[ruta, nuevo]]));
        const grupos = r.get(ruta).cursos[0].grupos;
        assert.deepEqual([grupos[0].edificio, grupos[0].aula], ['B2', '10']);
        assert.equal(grupos[1].edificio, undefined); // no había aula previa para el grupo 2
    });
});

test('nunca pisa un aula nueva con una previa', async () => {
    await conArchivoPrevio(previo, async (ruta) => {
        const nuevo = { cursos: [{ codigo: 'FI1101', grupos: [{ grupo: 1, edificio: 'C4', aula: '1' }] }] };
        const r = await conservarAulasPrevias(new Map([[ruta, nuevo]]));
        assert.deepEqual([r.get(ruta).cursos[0].grupos[0].edificio, r.get(ruta).cursos[0].grupos[0].aula], ['C4', '1']);
    });
});

test('sin archivo previo en disco → devuelve el archivo tal cual', async () => {
    await conArchivoPrevio(null, async (ruta) => {
        const nuevo = { cursos: [{ codigo: 'FI1101', grupos: [{ grupo: 1 }] }] };
        const r = await conservarAulasPrevias(new Map([[ruta, nuevo]]));
        assert.deepEqual(r.get(ruta), nuevo);
    });
});
