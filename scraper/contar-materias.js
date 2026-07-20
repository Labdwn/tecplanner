// contar-materias.js
// Corré esto desde la carpeta scraper/ de tu repo (junto a data/):
//   node contar-materias.js
//
// Cuenta cuántos códigos de materia ÚNICOS hay por período, recorriendo
// los archivos que ya generó tu scraper. Esto es lo que determina cuántas
// llamadas a ConsultaHorarios harían falta en la primera corrida de cada
// ventana de matrícula.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const RUTA_DATA = 'data';

async function recorrerArchivosJSON(dir) {
    const archivos = [];
    const entradas = await readdir(dir, { withFileTypes: true });
    for (const entrada of entradas) {
        const rutaCompleta = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            archivos.push(...await recorrerArchivosJSON(rutaCompleta));
        } else if (entrada.name.endsWith('.json')) {
            archivos.push(rutaCompleta);
        }
    }
    return archivos;
}

async function main() {
    const archivos = await recorrerArchivosJSON(RUTA_DATA);
    console.log(`Encontrados ${archivos.length} archivos de escuela.\n`);

    // periodo -> Set de códigos únicos
    const porPeriodo = new Map();
    // periodo -> Set de "codigo::escuela" (para detectar si una materia
    // aparece en más de una escuela, lo cual no debería afectar el conteo
    // de llamadas ya que ConsultaHorarios es por código, no por escuela)
    let totalFilas = 0;

    for (const rutaArchivo of archivos) {
        const contenido = JSON.parse(await readFile(rutaArchivo, 'utf-8'));
        const periodo = `${contenido.anio}/${contenido.periodo}`;

        if (!porPeriodo.has(periodo)) porPeriodo.set(periodo, new Set());
        const set = porPeriodo.get(periodo);

        for (const curso of contenido.cursos) {
            set.add(curso.codigo);
            totalFilas++;
        }
    }

    console.log('=== Códigos únicos por período ===\n');
    const periodosOrdenados = [...porPeriodo.keys()].sort();
    for (const periodo of periodosOrdenados) {
        console.log(`${periodo}: ${porPeriodo.get(periodo).size} materias únicas`);
    }

    // Unión de todos los períodos encontrados (por si tenés varios años/periodos
    // mezclados en data/, útil para ver el peor caso combinado)
    const todosLosCodigos = new Set();
    for (const set of porPeriodo.values()) {
        for (const codigo of set) todosLosCodigos.add(codigo);
    }

    console.log(`\nTotal de filas curso+escuela procesadas: ${totalFilas}`);
    console.log(`Total de códigos únicos combinando todos los períodos en data/: ${todosLosCodigos.size}`);
    console.log('\n(Lo que importa para ConsultaHorarios es el número por período individual de arriba,');
    console.log(' ya que cada ventana de matrícula solo necesita las materias de ESE período.)');
}

main().catch((error) => {
    console.error('Error:', error.message);
    console.error('¿Corriste esto desde la carpeta que contiene data/? (la carpeta scraper/ de tu repo)');
});
