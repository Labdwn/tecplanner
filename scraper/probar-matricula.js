// probar-matricula.js
// Prueba rápida y desechable: consulta 1-2 materias reales contra
// ConsultaHorarios (con tu cookie real) para confirmar que el fix de
// matricula.js desempaqueta bien el arreglo Horario. Correr desde la
// carpeta scraper/ con:
//   node --env-file=.env probar-matricula.js MA1103 CI1107

import { obtenerSesion, obtenerHorariosPorMateria } from './matricula.js';

async function main() {
    const materias = process.argv.slice(2);
    if (materias.length === 0) {
        console.error('Uso: node probar-matricula.js CODIGO1 [CODIGO2 ...]');
        process.exit(1);
    }

    const sesion = await obtenerSesion();
    const resultados = await obtenerHorariosPorMateria(materias, sesion);

    for (const [materia, respuesta] of resultados.entries()) {
        console.log(`\n=== ${materia} ===`);
        console.log('esArray:', Array.isArray(respuesta));
        console.log('cantidad de grupos:', respuesta?.length);
        console.log(JSON.stringify(respuesta, null, 2));
    }
}

main().catch((error) => {
    console.error('Error:', error.message);
});