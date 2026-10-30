// test/misprofes.test.js
// Lista de profesores embebida en la página de la escuela de MisProfesores, cruce con los
// profesores del TEC (primer apellido + un nombre), elección por más calificaciones,
// robots.txt, bloqueo del sitio y aplicación a profesores.js. Todo con datos simulados.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
    extraerListaProfesores, slugPerfil, urlPerfil, indexarLista, puntuarCoincidencia, elegirMejor,
    resolverProfesor, detectarColisiones, permitidoPorRobots, aplicarAProfesores,
    crearCliente, BloqueoError, esRespuestaDeBloqueo,
} from '../buscar-misprofesores.js';
import { evaluarMapaProfesores, claveDe } from '../profesores-util.js';

const H = 'https://costarica.misprofesores.com';

// Fragmento real de la página (con escapes \u y objetos pegados), más registros inventados para los casos.
const PAGINA = `<html><head><title>ITCR - MisProfesores.com</title></head><body>
<p>Número de profesores: 1828</p><table></table>
<script>var PROFS = [{"i":"13478","n":"Mauricio","a":"Araya Rodriguez","d":"Escuela de ingenieria en construccion","m":"68","c":"6.9265"},{"i":"55314","n":"Luis Alonso","a":"Araya Solano","d":"Escuela de Fisica","m":"3","c":"6.0000"},{"i":"36250","n":"Emmanuel","a":"Araya Valverde","d":"Escuela de Biolog\\u00eda","m":"3","c":"8.0000"},{"i":"13332","n":"Armando","a":"Arce","d":"Computaci\\u00f3n","m":"86","c":"4.3837"},{"i":"13477","n":"Armando","a":"Arce","d":"Ing. Computacion","m":"14","c":"3.9286"},
{"c":"7.5","m":"5","d":"Matem\\u00e1tica","a":"Abarca","n":"Lilliana","i":"49591"},
{"i":"49592","n":"Lilliana","a":"Abarca Guerrero","d":"Matem\\u00e1tica","m":"20","c":"8.1"},
{"i":"49593","n":"Luis","a":"Mora","d":"Fisica","m":"99","c":"5.0"},
{"i":"13248","n":"Luis","a":"Acu\\u00f1a","d":"Computaci\\u00f3n","m":"32","c":"7.7"},
{"i":"13248","n":"Repetido","a":"Mismo Id","d":"x","m":"1","c":"1"}];
function f(){ return {a: 1}; } var otro = {"clave": "valor"};</script></body></html>`;

test('extraerListaProfesores: lee el JSON embebido, decodifica \\u, no depende del orden y no repite ids', () => {
    const lista = extraerListaProfesores(PAGINA);
    assert.equal(lista.length, 9);                                   // 10 objetos con "i", uno repetido; {"clave"} y {a:1} se ignoran
    const biologia = lista.find((e) => e.id === '36250');
    assert.equal(biologia.departamento, 'Escuela de Biología');
    assert.deepEqual(lista.find((e) => e.id === '13478'), {
        id: '13478', nombres: 'Mauricio', apellidos: 'Araya Rodriguez',
        departamento: 'Escuela de ingenieria en construccion', calificaciones: 68, promedio: 6.9265,
    });
    assert.equal(lista.find((e) => e.id === '49591').calificaciones, 5); // claves en otro orden
    assert.equal(lista.find((e) => e.id === '13248').nombres, 'Luis');   // el primero gana, no "Repetido"
});

test('extraerListaProfesores: página sin lista → arreglo vacío', () => {
    assert.deepEqual(extraerListaProfesores('<html><body>nada</body></html>'), []);
});

test('slugPerfil / urlPerfil: igual que los enlaces que ya están en profesores.js', () => {
    assert.equal(urlPerfil({ id: '48832', nombres: 'Samuel', apellidos: 'Valverde Sanchez' }), `${H}/profesores/Samuel-Valverde-Sanchez_48832`);
    assert.equal(urlPerfil({ id: '13248', nombres: 'Luis', apellidos: 'Acuña' }), `${H}/profesores/Luis-Acuna_13248`);
    assert.equal(urlPerfil({ id: '13338', nombres: 'Felix', apellidos: 'Nuñez' }), `${H}/profesores/Felix-Nunez_13338`);
    assert.equal(urlPerfil({ id: '15303', nombres: 'CRISTIAN', apellidos: 'Paez Paez' }), `${H}/profesores/CRISTIAN-Paez-Paez_15303`);
    assert.equal(slugPerfil('Jorge Luis', "De la O"), 'Jorge-Luis-De-la-O');
});

test('puntuarCoincidencia: basta el primer apellido y un nombre; lo demás del registro no importa', () => {
    assert.ok(puntuarCoincidencia('ABARCA GUERRERO LILLIANA', 'Lilliana Abarca'));
    assert.ok(puntuarCoincidencia('CARRERA RETANA LUIS ERNESTO', 'Ernesto Carrera'));
    const extra = puntuarCoincidencia('ACUÑA PRADO LUIS', 'Luis Fernando Acuna');
    assert.ok(extra);
    assert.deepEqual(extra.extras, ['fernando']);
    assert.ok(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Luis Acuna Zamora'));
    assert.equal(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Luis Acuna Prado').completo, true);
});

test('puntuarCoincidencia: rechaza lo que no tiene su primer apellido y uno de sus nombres', () => {
    assert.equal(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Luis Mora'), null);
    assert.equal(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Acuna'), null);
    assert.equal(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Prado Luis'), null);
    assert.equal(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Acuna Prado'), null);
    assert.equal(puntuarCoincidencia('ACUÑA PRADO LUIS', 'Fernando Acuna Prado'), null);
});

test('elegirMejor: el de más calificaciones; vacío, ceros, nulos y empates se marcan', () => {
    const c = (url, calificaciones, cobertura = 1) => ({ url, calificaciones, cobertura });
    assert.deepEqual(elegirMejor([c('a', 3), c('b', 32), c('c', 7)]), { url: 'b', calificaciones: 32, estado: 'ok' });
    assert.equal(elegirMejor([]).estado, 'sin_resultado');
    assert.equal(elegirMejor([c('a', 0), c('b', 0)]).estado, 'sin_calificaciones');
    assert.equal(elegirMejor([c('a', null)]).estado, 'dudoso');
    assert.equal(elegirMejor([c('a', 10), c('b', 10)]).estado, 'dudoso');
});

// --- cruce con la lista -----------------------------------------------------------------

const indice = indexarLista(extraerListaProfesores(PAGINA));

test('resolverProfesor: dos registros de la misma persona → el de más calificaciones (caso Abarca, Lilliana)', () => {
    const r = resolverProfesor('ABARCA GUERRERO LILLIANA', indice);
    assert.equal(r.estado, 'ok');
    assert.equal(r.url, `${H}/profesores/Lilliana-Abarca-Guerrero_49592`);
    assert.equal(r.calificaciones, 20);
    assert.equal(r.totalCandidatos, 2);                              // "Luis Mora" ni entra
    assert.equal(r.candidatos[0].departamento, 'Matemática');
    assert.deepEqual(r.candidatos[1].url, `${H}/profesores/Lilliana-Abarca_49591`);
});

test('resolverProfesor: un solo registro; sin registro; empate; sin calificaciones', () => {
    assert.equal(resolverProfesor('ACUÑA PRADO LUIS', indice).url, `${H}/profesores/Luis-Acuna_13248`);
    assert.equal(resolverProfesor('ZAMORA LEON PEDRO JOSE', indice).estado, 'sin_resultado');
    // dos "Armando Arce" con distinto número de calificaciones → gana el de 86
    assert.equal(resolverProfesor('ARCE SOLIS ARMANDO', indice).calificaciones, 86);
    const empate = indexarLista([
        { id: '1', nombres: 'Ana', apellidos: 'Rojas', departamento: '', calificaciones: 7, promedio: 7 },
        { id: '2', nombres: 'Ana', apellidos: 'Rojas', departamento: '', calificaciones: 7, promedio: 6 },
    ]);
    assert.equal(resolverProfesor('ROJAS VEGA ANA', empate).estado, 'dudoso');
    const ceros = indexarLista([{ id: '3', nombres: 'Ana', apellidos: 'Rojas', departamento: '', calificaciones: 0, promedio: null }]);
    assert.equal(resolverProfesor('ROJAS VEGA ANA', ceros).estado, 'sin_calificaciones');
});

test('resolverProfesor: guarda las palabras de más (extras) para auditar', () => {
    const lista = indexarLista([{ id: '9', nombres: 'Luis', apellidos: 'Acuña Zamora', departamento: 'X', calificaciones: 5, promedio: 5 }]);
    const r = resolverProfesor('ACUÑA PRADO LUIS', lista);
    assert.deepEqual(r.candidatos[0].extras, ['zamora']);
});

test('detectarColisiones: dos profesores con la misma URL pasan a dudosos', () => {
    const r = {
        'ACUÑA PRADO LUIS': { estado: 'ok', url: 'u1' },
        'ACUÑA CHACON LUIS': { estado: 'ok', url: 'u1' },
        'SOLO UNO': { estado: 'ok', url: 'u2' },
    };
    assert.deepEqual(detectarColisiones(r).sort(), ['ACUÑA CHACON LUIS', 'ACUÑA PRADO LUIS']);
    assert.equal(r['SOLO UNO'].estado, 'ok');
    assert.equal(r['ACUÑA PRADO LUIS'].estado, 'dudoso');
});

// --- robots.txt y bloqueo ----------------------------------------------------------------

test('permitidoPorRobots: Disallow, Allow más específico, grupo propio y comodines', () => {
    const robots = 'User-agent: *\nDisallow: /search\nDisallow: /admin/\nAllow: /search/public\n\nUser-agent: GPTBot\nDisallow: /\n';
    assert.equal(permitidoPorRobots(robots, '/search?query=x').permitido, false);
    assert.equal(permitidoPorRobots(robots, '/search/public/x').permitido, true);
    assert.equal(permitidoPorRobots(robots, '/escuelas/ITCR_1135').permitido, true);
    assert.equal(permitidoPorRobots('User-agent: *\nDisallow: /*?query=', '/escuelas/X_1?query=a').permitido, false);
    assert.equal(permitidoPorRobots('', '/escuelas/X_1').permitido, true);
});

test('esRespuestaDeBloqueo: por código y por página de desafío, pero no por mencionar captcha', () => {
    assert.equal(esRespuestaDeBloqueo(429, ''), true);
    assert.equal(esRespuestaDeBloqueo(403, 'x'), true);
    assert.equal(esRespuestaDeBloqueo(200, '<html><title>Just a moment...</title></html>'), true);
    assert.equal(esRespuestaDeBloqueo(200, '<html><head><title>ITCR - MisProfesores.com</title><script src="https://www.google.com/recaptcha/api.js"></script></head></html>'), false);
    assert.equal(esRespuestaDeBloqueo(404, '<title>No encontrado</title>'), false);
});

test('cliente: 3 respuestas 429 seguidas → BloqueoError (se detiene, no insiste)', async () => {
    let llamadas = 0;
    const cliente = crearCliente({
        pausar: async () => {}, esperaBloqueo: async () => {},
        fetchFn: async () => { llamadas++; return { status: 429, text: async () => 'Too Many Requests' }; },
    });
    await assert.rejects(() => cliente.pedir(`${H}/escuelas/x_1135`), BloqueoError);
    assert.equal(llamadas, 3);
});

test('cliente: una página de desafío con HTTP 200 cuenta como bloqueo; una respuesta buena reinicia el contador', async () => {
    const respuestas = [
        { status: 200, texto: '<title>Just a moment...</title>' },
        { status: 200, texto: '<html>ok</html>' },
    ];
    const cliente = crearCliente({
        pausar: async () => {}, esperaBloqueo: async () => {},
        fetchFn: async () => { const r = respuestas.shift(); return { status: r.status, text: async () => r.texto }; },
    });
    const r = await cliente.pedir(`${H}/x`);
    assert.deepEqual([r.status, r.texto], [200, '<html>ok</html>']);
});

// --- aplicar a profesores.js ---------------------------------------------------------------

test('aplicarAProfesores sobre el profesores.js real: rellena "", agrega nuevos, no toca lo demás', async () => {
    const original = await readFile(new URL('../../profesores.js', import.meta.url), 'utf-8');
    const antes = evaluarMapaProfesores(original);

    const urls = new Map([
        ['AZOFEIFA CUBERO ROBERTO', `${H}/profesores/Roberto-Azofeifa_1`],
        ['VALVERDE SANCHEZ SAMUEL', `${H}/profesores/Otro-Distinto_2`],
        ['SAMUEL VALVERDE SANCHEZ', `${H}/profesores/Otro-Distinto_2`],
        ['ZAMORA LEON PEDRO JOSE', `${H}/profesores/Pedro-Zamora_3`],
        ['MALO MALO', 'javascript:alert(1)'],
    ]);
    const { codigo, cambios } = aplicarAProfesores(original, urls, '2026-10-29');
    assert.deepEqual(cambios.rellenados, ['AZOFEIFA CUBERO ROBERTO']);
    assert.deepEqual(cambios.nuevos, ['ZAMORA LEON PEDRO JOSE']);
    assert.equal(cambios.yaTenian.length, 2);
    assert.deepEqual(cambios.invalidos, ['MALO MALO']);

    const despues = evaluarMapaProfesores(codigo);
    assert.equal(despues['AZOFEIFA CUBERO ROBERTO'], `${H}/profesores/Roberto-Azofeifa_1`);
    assert.equal(despues['ZAMORA LEON PEDRO JOSE'], `${H}/profesores/Pedro-Zamora_3`);
    for (const [nombre, url] of Object.entries(antes)) {
        if (nombre !== 'AZOFEIFA CUBERO ROBERTO' && nombre !== '') assert.equal(despues[nombre], url, nombre);
    }
    const a = original.split('\n');
    const b = codigo.split('\n');
    assert.equal(b.length - a.length, 3);
    const cambiadas = a.filter((l) => !b.includes(l));
    assert.equal(cambiadas.length, 1);
    assert.match(cambiadas[0], /AZOFEIFA/);
});

test('aplicarAProfesores: sin nuevos ni rellenos devuelve el archivo idéntico', async () => {
    const original = await readFile(new URL('../../profesores.js', import.meta.url), 'utf-8');
    const { codigo } = aplicarAProfesores(original, new Map([['VALVERDE SANCHEZ SAMUEL', `${H}/profesores/X_1`]]));
    assert.equal(codigo, original);
    assert.equal(claveDe('Valverde Sánchez Samuel'), claveDe('SAMUEL VALVERDE SANCHEZ'));
});
