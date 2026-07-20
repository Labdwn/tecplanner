const careers_information = {
            fisica: {
                name: "Ing. Física",
                icon: "⚛️",
                plan: 2300,
                grado: "Licenciatura",
            },
            biotecnologia: {
                name: "Ing. Biotecnología",
                icon: "🧬",
                plan: 1053,
                grado: "Bachillerato"
            },
            electronica: {
                name: "Ing. Electrónica",
                icon: "🔌",
                plan: 809,
                grado: "Licenciatura"
            },
            computacion: {
                name: "Ing. Computación",
                icon: "💻",
                plan: 412,
                grado: "Bachillerato"
            },
            mecatronica: {
                name: "Ing. Mecatrónica",
                icon: "🤖",
                plan: 2201,
                grado: "Licenciatura"
            },
            administracion: {
                name: "Administración de Empresas",
                icon: "💼",
                plan: 231,
                grado: "Bachillerato",
                modalidad: "Diurna"
            },
            produccion: {
                name: "Ing. Producción Industrial",
                icon: "🏭",
                plan: 1425,
                grado: "Licenciatura",
            },
            mantenimiento: {
                name: "Ing. Mantenimiento Industrial",
                icon: "🔧",
                plan: 1313,
                grado: "Licenciatura",
            },
            computadores: {
                name: "Ing. Computadores",
                icon: "🖥️",
                plan: 2103,
                grado: "Licenciatura",
            },
            diseno: {
                name: "Ing. Diseño Industrial",
                icon: "🎨",
                plan: 707,
                grado: "Bachillerato",
            },
            ambiental: {
                name: "Ing. Ambiental",
                icon: "🍃",
                plan: 1802,
                grado: "Licenciatura",
            },
            ati: {
                name: "Administración de Tecnologías de Información",
                icon: "📊",
                plan: 2053,
                grado: "Licenciatura",
            },
            materiales: {
                name: "Ing. Materiales",
                icon: "🧪",
                plan: 1216,
                grado: "Licenciatura",
            },
            agricola: {
                name: "Ing. Agrícola",
                icon: "🚜",
                plan: 1008,
                grado: "Licenciatura",
            },
            agronegocios: {
                name: "Ing. Agronegocios",
                icon: "🌾",
                plan: 114,
                grado: "Licenciatura",
            },
            e_mate: {
                name: "Enseñanza De La Matemática con Entornos Tecnológicos",
                icon: "♾️",
                plan: 1605,
                grado: "Bachillerato",
            },
            forestal: {
                name: "Ing. Forestal",
                icon: "🌲",
                plan: "910/911",
                grado: "Licenciatura"
            },
            forestal_manejoYproduccion: {
                name: "Ing. Forestal",
                icon: "🌲",
                plan: 910,
                grado: "Licenciatura",
                enfasisNombre: "Manejo y Producción Forestal"
            },
            forestal_conservacionYrestauracion: {
                name: "Ing. Forestal",
                icon: "🌲",
                plan: 911,
                grado: "Licenciatura",
                enfasisNombre: "Conservación y Restauración"
            },
            seguridad: {
                name: "Ing. Seguridad Laboral e Higiene Ambiental",
                icon: "🦺",
                plan: 2151,
                grado: "Licenciatura",
            },
            //pendiente

            arquitectura: {
                name: "Arquitectura y Urbanismo",
                icon: "🏛️",
                plan: 0,
                grado: "Licenciatura",
            },

            biotec_una: {
                name: "Biotecnología (UNA)",
                icon: "🧬",
                plan: 0,
                grado: "Bachillerato"
            },

        };
        
        const curriculums = {
            fisica: [
                // BLOQUE 0 
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, reqs: [], coreqs: [], userSem: 0 },
                // BLOQUE 1 
                { id: 'IF1101', block: 1, name: 'Introducción a la Ingeniería Física', cred: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio Química I', cred: 1, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1230', block: 1, name: 'Inglés I', cred: 2, reqs: ['CI0202'], coreqs: [], userSem: 1 },
                // BLOQUE 2 
                { id: 'MA1102', block: 2, name: 'Cálculo Dif. e Integral', cred: 4, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física I', cred: 1, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, reqs: ['QU1106'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio Química II', cred: 1, reqs: ['QU1102'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'CS2101', block: 2, name: 'Ambiente Humano', cred: 2, reqs: ['IF1101','CI1106'], coreqs: [], userSem: 2 },
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'CI1231', block: 2, name: 'Inglés II', cred: 2, reqs: ['CI1230'], coreqs: [], userSem: 2 },
                // BLOQUE 3 
                { id: 'CA2125', block: 3, name: 'Elementos De Computación', cred: 3, reqs: [], coreqs: [], userSem: 3 },
                { id: 'FI1102', block: 3, name: 'Física General II', cred: 3, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 3 },
                { id: 'FI1202', block: 3, name: 'Laboratorio Física General II', cred: 1, reqs: ['FI1201'], coreqs: ['FI1102'], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'MI2101', block: 3, name: 'Dibujo Técnico', cred: 3, reqs: ['MA0101'], coreqs: [], userSem: 3 },
                { id: 'MI2106', block: 3, name: 'Estática', cred: 3, reqs: ['FI1101'], coreqs: [], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, reqs: [], coreqs: [], userSem: 3 },
                // BLOQUE 4 
                { id: 'FI2103', block: 4, name: 'Física General III', cred: 3, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 4 },
                { id: 'IF3502', block: 4, name: 'Instrumentación I', cred: 1, reqs: [], coreqs: ['MT2001', 'MT2002'], userSem: 4 },
                { id: 'MA2105', block: 4, name: 'Ecuaciones Diferenciales', cred: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'MI3117', block: 4, name: 'Dinámica', cred: 3, reqs: ['MI2106'], coreqs: [], userSem: 4 },
                { id: 'MT2001', block: 4, name: 'Circuitos Eléctricos En Cc Y Ca', cred: 3, reqs: ['FI1102'], coreqs: [], userSem: 4 },
                { id: 'MT2002', block: 4, name: 'Lab. De Circuitos De CC Y CA', cred: 1, reqs: ['MA1102'], coreqs: ['MT2001'], userSem: 4 },
                { id: 'PI2610', block: 4, name: 'Probabilidad Y Estadística I', cred: 3, reqs: ['MA1102'], coreqs: ['CA2125'], userSem: 4 },        
                // BLOQUE 5 
                { id: 'FI2104', block: 5, name: 'Física General IV', cred: 3, reqs: ['FI1102'], coreqs: ['MA2104'], userSem: 5 },
                { id: 'IF3501', block: 5, name: 'Termodinámica I', cred: 3, reqs: ['FI2103'], coreqs: [], userSem: 5 },
                { id: 'IF3503', block: 5, name: 'Instrumentación II', cred: 1, reqs: ['IF3502'], coreqs: [], userSem: 5 },
                { id: 'MA2104', block: 5, name: 'Cálculo Superior', cred: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'MA3106', block: 5, name: 'Métodos Numéricos', cred: 4, reqs: ['MA2105'], coreqs: [], userSem: 5 },
                { id: 'PI3612', block: 5, name: 'Probabilidad Y Estadística II', cred: 3, reqs: ['MA1103', 'PI2610'], coreqs: [], userSem: 5 },
                // BLOQUE 6 
                { id: 'IF3601', block: 6, name: 'Metodología De La Investigación', cred: 3, hrs: 9, reqs: ['PI3612'], coreqs: [], userSem: 6 },
                { id: 'IF3602', block: 6, name: 'Métodos Matemáticos De Física E Ingeniería I', cred: 3, hrs: 9, reqs: ['MA2105'], coreqs: ['IF3603'], userSem: 6 },
                { id: 'IF3603', block: 6, name: 'Óptica', cred: 3, hrs: 9, reqs: ['FI2104'], coreqs: ['IF3604'], userSem: 6 },
                { id: 'IF3604', block: 6, name: 'Laboratorio De Óptica', cred: 1, hrs: 3, reqs: [], coreqs: ['IF3603'], userSem: 6 },
                { id: 'MI3108', block: 6, name: 'Mecánica De Fluidos', cred: 4, hrs: 4, reqs: ['MA2105', 'MI3117'], coreqs: [], userSem: 6 },
                { id: 'PI5302', block: 6, name: 'Diseño De Experimentos', cred: 4, hrs: 4, reqs: ['PI3612'], coreqs: [], userSem: 6 },
                // BLOQUE 7 
                { id: 'CS3404', block: 7, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['IF1101'], coreqs: [], userSem: 7 },
                { id: 'EL4513', block: 7, name: 'Teoría Electromagnética I', cred: 4, hrs: 4, reqs: ['FI1102', 'MA2105'], coreqs: [], userSem: 7 },
                { id: 'IF4701', block: 7, name: 'Métodos Matemáticos De Física E Ingeniería II', cred: 3, hrs: 9, reqs: ['IF3602'], coreqs: [], userSem: 7 },
                { id: 'IF4702', block: 7, name: 'Física Computacional I', cred: 3, hrs: 9, reqs: ['MA3106', 'MI2101'], coreqs: [], userSem: 7 },
                { id: 'IF4703', block: 7, name: 'Análisis De Incertidumbres', cred: 3, hrs: 9, reqs: ['PI5302'], coreqs: [], userSem: 7 },
                { id: 'IF4704', block: 7, name: 'Electiva I', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 7 },
                // BLOQUE 8 
                { id: 'CS4402', block: 8, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 8 },
                { id: 'IF4801', block: 8, name: 'Mecánica Cuántica Para Ingeniería', cred: 3, hrs: 9, reqs: ['IF3603', 'IF4701'], coreqs: [], userSem: 8 },
                { id: 'IF4802', block: 8, name: 'Laboratorio Metrología I', cred: 2, hrs: 6, reqs: [], coreqs: ['IF4803'], userSem: 8 },
                { id: 'IF4803', block: 8, name: 'Metrología Industrial Y Legal', cred: 3, hrs: 9, reqs: ['IF4703'], coreqs: [], userSem: 8 },
                { id: 'IF4804', block: 8, name: 'Física Computacional II', cred: 3, hrs: 9, reqs: ['IF4702'], coreqs: [], userSem: 8 },
                { id: 'MT7001', block: 8, name: 'Análisis Y Simulación De Sistemas', cred: 3, hrs: 4, reqs: ['IF4701', 'MA2105'], coreqs: [], userSem: 8 },
                // BLOQUE 9 
                { id: 'IF5901', block: 9, name: 'Física Experimental', cred: 3, hrs: 9, reqs: ['IF3503', 'IF3604'], coreqs: [], userSem: 9 },
                { id: 'IF5902', block: 9, name: 'Física Contemporánea', cred: 3, hrs: 9, reqs: ['FI2104'], coreqs: [], userSem: 9 },
                { id: 'IF5903', block: 9, name: 'Metrología Científica', cred: 3, hrs: 9, reqs: ['IF4803'], coreqs: [], userSem: 9 },
                { id: 'IF5904', block: 9, name: 'Electiva II', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 9 },
                { id: 'IF5905', block: 9, name: 'Física De La Materia Condensada', cred: 3, hrs: 9, reqs: ['IF4801'], coreqs: [], userSem: 9 },
                { id: 'IF5906', block: 9, name: 'Energía Y Sus Transformaciones', cred: 3, hrs: 9, reqs: ['IF3501'], coreqs: [], userSem: 9 },
                // BLOQUE 10
                { id: 'AE4208', block: 10, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: ['IF3601'], coreqs: [], userSem: 10 },
                { id: 'AE5121', block: 10, name: 'Ingeniería Económica', cred: 3, hrs: 3, reqs: ['IF3601'], coreqs: [], userSem: 10 },
                { id: 'IF5108', block: 10, name: 'Trabajo Final De Graduación', cred: 8, hrs: 24, reqs: ['IF5905'], coreqs: [], userSem: 10 },
                { id: 'PI4802', block: 10, name: 'Administración De Proyectos', cred: 3, hrs: 4, reqs: ['IF4804'], coreqs: [], userSem: 10 }
            ],
            //forestal y sus énfasis
            forestal: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                // BLOQUE 1
                { id: 'BI1101', block: 1, name: 'Biología General', cred: 3, hrs: 9, reqs: [], coreqs: ['BI1102'], userSem: 1 },
                { id: 'BI1102', block: 1, name: 'Laboratorio De Biología General', cred: 1, hrs: 3, reqs: [], coreqs: ['BI1101'], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'FO1103', block: 1, name: 'Introducción A La Ingeniería Forestal', cred: 1, hrs: 2, reqs: [], coreqs: ['FO1104', 'FO2202'], userSem: 1 },
                { id: 'FO1104', block: 1, name: 'Laboratorio Introducción A La Ingeniería Forestal', cred: 2, hrs: 2, reqs: [], coreqs: ['FO1103'], userSem: 1 },
                { id: 'FO2202', block: 1, name: 'Mediciones Forestales', cred: 3, hrs: 4, reqs: [], coreqs: ['FO1103'], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                // BLOQUE 2
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FO1107', block: 2, name: 'Botánica Forestal', cred: 3, hrs: 3, reqs: ['BI1101'], coreqs: ['FO1108'], userSem: 2 },
                { id: 'FO1108', block: 2, name: 'Laboratorio De Botánica Forestal', cred: 1, hrs: 2, reqs: ['BI1102'], coreqs: ['FO1107'], userSem: 2 },
                { id: 'FO2201', block: 2, name: 'Levantamiento Forestal', cred: 3, hrs: 4, reqs: ['FO2202'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                // BLOQUE 3
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'FO2109', block: 3, name: 'Dendrología Tropical', cred: 3, hrs: 4, reqs: ['FO1107', 'FO1108'], coreqs: [], userSem: 3 },
                { id: 'FO2113', block: 3, name: 'Análisis Estadístico', cred: 3, hrs: 4, reqs: ['MA0101'], coreqs: [], userSem: 3 },
                { id: 'FO2115', block: 3, name: 'Laboratorio De Reproducción De Especies Forestales', cred: 1, hrs: 2, reqs: ['FO2201'], coreqs: ['FO2117'], userSem: 3 },
                { id: 'FO2117', block: 3, name: 'Reproducción De Especies Forestales', cred: 2, hrs: 3, reqs: ['QU1106'], coreqs: ['FO2115'], userSem: 3 },
                { id: 'FO3401', block: 3, name: 'Sistemas De Información Geográfica', cred: 3, hrs: 4, reqs: ['FO2201'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                // BLOQUE 4
                { id: 'CS2303', block: 4, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: ['CI1107'], coreqs: [], userSem: 4 },
                { id: 'FI1101', block: 4, name: 'Física General I', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 4 },
                { id: 'FI1201', block: 4, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 4 },
                { id: 'FO1106', block: 4, name: 'Climatología Forestal', cred: 3, hrs: 4, reqs: ['FO3401'], coreqs: [], userSem: 4 },
                { id: 'FO2108', block: 4, name: 'Laboratorio De Suelos Forestales', cred: 1, hrs: 2, reqs: ['QU1106'], coreqs: ['FO4107'], userSem: 4 },
                { id: 'FO3113', block: 4, name: 'Inventarios Forestales', cred: 3, hrs: 4, reqs: ['FO2113', 'FO3401'], coreqs: [], userSem: 4 },
                { id: 'FO4107', block: 4, name: 'Suelos Forestales', cred: 2, hrs: 3, reqs: ['QU1106'], coreqs: ['FO2108'], userSem: 4 },
                { id: 'FO4417', block: 4, name: 'Ecofisiología Forestal', cred: 3, hrs: 4, reqs: ['FO2113'], coreqs: ['FO4107'], userSem: 4 },
                // BLOQUE 5
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS2303'], coreqs: [], userSem: 5 },
                { id: 'FO2114', block: 5, name: 'Ecología Forestal', cred: 3, hrs: 4, reqs: ['FO2109', 'FO3113'], coreqs: [], userSem: 5 },
                { id: 'FO2116', block: 5, name: 'Establecimiento De Plantaciones Forestales', cred: 3, hrs: 4, reqs: ['FO2117', 'FO4107'], coreqs: [], userSem: 5 },
                { id: 'FO3120', block: 5, name: 'Economía Forestal', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: ['FO3130'], userSem: 5 },
                { id: 'FO3130', block: 5, name: 'Métodos De Investigación Forestal', cred: 3, hrs: 5, reqs: ['FO3113'], coreqs: ['FO3120'], userSem: 5 },
                { id: 'FO4203', block: 5, name: 'Hidrología Forestal Y Manejo De Cuencas', cred: 3, hrs: 4, reqs: ['FO1106', 'FO4107'], coreqs: [], userSem: 5 },
            ],
            forestal_manejoYproduccion: [
                // BLOQUE 0 
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                // BLOQUE 1 
                { id: 'BI1101', block: 1, name: 'Biología General', cred: 3, hrs: 9, reqs: [], coreqs: ['BI1102'], userSem: 1 },
                { id: 'BI1102', block: 1, name: 'Laboratorio De Biología General', cred: 1, hrs: 3, reqs: [], coreqs: ['BI1101'], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'FO1103', block: 1, name: 'Introducción A La Ingeniería Forestal', cred: 1, hrs: 2, reqs: [], coreqs: ['FO1104', 'FO2202'], userSem: 1 },
                { id: 'FO1104', block: 1, name: 'Laboratorio Introducción A La Ingeniería Forestal', cred: 2, hrs: 2, reqs: [], coreqs: ['FO1103'], userSem: 1 },
                { id: 'FO2202', block: 1, name: 'Mediciones Forestales', cred: 3, hrs: 4, reqs: [], coreqs: ['FO1103'], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                // BLOQUE 2 
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FO1107', block: 2, name: 'Botánica Forestal', cred: 3, hrs: 3, reqs: ['BI1101'], coreqs: ['FO1108'], userSem: 2 },
                { id: 'FO1108', block: 2, name: 'Laboratorio De Botánica Forestal', cred: 1, hrs: 2, reqs: ['BI1102'], coreqs: ['FO1107'], userSem: 2 },
                { id: 'FO2201', block: 2, name: 'Levantamiento Forestal', cred: 3, hrs: 4, reqs: ['FO2202'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                // BLOQUE 3 
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'FO2109', block: 3, name: 'Dendrología Tropical', cred: 3, hrs: 4, reqs: ['FO1107', 'FO1108'], coreqs: [], userSem: 3 },
                { id: 'FO2113', block: 3, name: 'Análisis Estadístico', cred: 3, hrs: 4, reqs: ['MA0101'], coreqs: [], userSem: 3 },
                { id: 'FO2115', block: 3, name: 'Laboratorio De Reproducción De Especies Forestales', cred: 1, hrs: 2, reqs: ['FO2201'], coreqs: ['FO2117'], userSem: 3 },
                { id: 'FO2117', block: 3, name: 'Reproducción De Especies Forestales', cred: 2, hrs: 3, reqs: ['QU1106'], coreqs: ['FO2115'], userSem: 3 },
                { id: 'FO3401', block: 3, name: 'Sistemas De Información Geográfica', cred: 3, hrs: 4, reqs: ['FO2201'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                // BLOQUE 4 
                { id: 'CS2303', block: 4, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: ['CI1107'], coreqs: [], userSem: 4 },
                { id: 'FI1101', block: 4, name: 'Física General I', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 4 },
                { id: 'FI1201', block: 4, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 4 },
                { id: 'FO1106', block: 4, name: 'Climatología Forestal', cred: 3, hrs: 4, reqs: ['FO3401'], coreqs: [], userSem: 4 },
                { id: 'FO2108', block: 4, name: 'Laboratorio De Suelos Forestales', cred: 1, hrs: 2, reqs: ['QU1106'], coreqs: ['FO4107'], userSem: 4 },
                { id: 'FO3113', block: 4, name: 'Inventarios Forestales', cred: 3, hrs: 4, reqs: ['FO2113', 'FO3401'], coreqs: [], userSem: 4 },
                { id: 'FO4107', block: 4, name: 'Suelos Forestales', cred: 2, hrs: 3, reqs: ['QU1106'], coreqs: ['FO2108'], userSem: 4 },
                { id: 'FO4417', block: 4, name: 'Ecofisiología Forestal', cred: 3, hrs: 4, reqs: ['FO2113'], coreqs: ['FO4107'], userSem: 4 },
                // BLOQUE 5 
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS2303'], coreqs: [], userSem: 5 },
                { id: 'FO2114', block: 5, name: 'Ecología Forestal', cred: 3, hrs: 4, reqs: ['FO2109', 'FO3113'], coreqs: [], userSem: 5 },
                { id: 'FO2116', block: 5, name: 'Establecimiento De Plantaciones Forestales', cred: 3, hrs: 4, reqs: ['FO2117', 'FO4107'], coreqs: [], userSem: 5 },
                { id: 'FO3120', block: 5, name: 'Economía Forestal', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: ['FO3130'], userSem: 5 },
                { id: 'FO3130', block: 5, name: 'Métodos De Investigación Forestal', cred: 3, hrs: 5, reqs: ['FO3113'], coreqs: ['FO3120'], userSem: 5 },
                { id: 'FO4203', block: 5, name: 'Hidrología Forestal Y Manejo De Cuencas', cred: 3, hrs: 4, reqs: ['FO1106', 'FO4107'], coreqs: [], userSem: 5 },
                // BLOQUE 6 
                { id: 'FO2303', block: 6, name: 'Propiedades De La Madera', cred: 3, hrs: 4, reqs: ['FI1101', 'FO1107'], coreqs: ['FO3203'], userSem: 6 },
                { id: 'FO3109', block: 6, name: 'Manejo De Plantaciones Forestales', cred: 3, hrs: 4, reqs: ['FO2116', 'FO3130'], coreqs: ['FO3132', 'FO3203'], userSem: 6 },
                { id: 'FO3118', block: 6, name: 'Silvicultura Bosque Natural', cred: 3, hrs: 4, reqs: ['FO2114'], coreqs: [], userSem: 6 },
                { id: 'FO3132', block: 6, name: 'Entomología Y Patología Forestales', cred: 2, hrs: 2, reqs: ['FO4417'], coreqs: ['FO3109', 'FO3133'], userSem: 6 },
                { id: 'FO3133', block: 6, name: 'Laboratorio De Entomología Y Patología Forestales', cred: 1, hrs: 3, reqs: [], coreqs: ['FO3132'], userSem: 6 },
                { id: 'FO3203', block: 6, name: 'Aprovechamiento Forestal I', cred: 3, hrs: 5, reqs: ['FO3113'], coreqs: ['FO2303', 'FO3109'], userSem: 6 },
                { id: 'FO3210', block: 6, name: 'Gestión De Administración Forestal', cred: 3, hrs: 4, reqs: ['CS2303', 'FO3120'], coreqs: [], userSem: 6 },
                // BLOQUE 7 
                { id: 'FO4114', block: 7, name: 'Manejo Integrado De Plagas', cred: 3, hrs: 4, reqs: ['FO3132', 'FO3133'], coreqs: ['FO5218'], userSem: 7 },
                { id: 'FO4201', block: 7, name: 'Ordenación Forestal', cred: 3, hrs: 4, reqs: ['FO3118'], coreqs: ['FO4204', 'FO4211'], userSem: 7 },
                { id: 'FO4204', block: 7, name: 'Aprovechamiento Forestal II', cred: 3, hrs: 5, reqs: ['FO3203'], coreqs: ['FO4201'], userSem: 7 },
                { id: 'FO4211', block: 7, name: 'Política Y Legislación Ambiental', cred: 3, hrs: 4, reqs: [], coreqs: ['FO4201'], userSem: 7 },
                { id: 'FO4308', block: 7, name: 'Manufactura De Productos Forestales I', cred: 3, hrs: 4, reqs: ['FO2303'], coreqs: [], userSem: 7 },
                { id: 'FO5218', block: 7, name: 'Crecimiento Y Rendimiento', cred: 3, hrs: 5, reqs: ['FO3109', 'MA1102'], coreqs: [], userSem: 7 },
                // BLOQUE 8 
                { id: 'FO3123', block: 8, name: 'Mejora Genética Forestal', cred: 3, hrs: 4, reqs: ['FO5218'], coreqs: [], userSem: 8 },
                { id: 'FO4104', block: 8, name: 'Formulación Y Evaluación De Proyectos', cred: 3, hrs: 4, reqs: ['FO3210', 'MA1103'], coreqs: [], userSem: 8 },
                { id: 'FO4223', block: 8, name: 'Dendroenergía', cred: 3, hrs: 4, reqs: ['FO3109'], coreqs: ['FO4309'], userSem: 8 },
                { id: 'FO4309', block: 8, name: 'Manufactura De Productos Forestales II', cred: 3, hrs: 4, reqs: ['FO4308', 'QU1107'], coreqs: [], userSem: 8 },
                { id: 'FO4412', block: 8, name: 'Mercadeo Y Comercialización De Productos Forestales', cred: 3, hrs: 4, reqs: ['FO3210'], coreqs: [], userSem: 8 },
                { id: 'FO8101', block: 8, name: 'Electiva I Énfasis En Manejo Y Producción Forestal', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 8 },
                // BLOQUE 9 
                { id: 'CS4402', block: 9, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3401'], coreqs: [], userSem: 9 },
                { id: 'FO4102', block: 9, name: 'Gestión De Industrias Forestales', cred: 3, hrs: 4, reqs: ['FO4309', 'FO4412'], coreqs: [], userSem: 9 },
                { id: 'FO4441', block: 9, name: 'Valoración Y Evaluación De Plantaciones Forestales', cred: 3, hrs: 4, reqs: ['FO3123'], coreqs: ['FO5106'], userSem: 9 },
                { id: 'FO5049', block: 9, name: 'Seminario De Graduación', cred: 2, hrs: 3, reqs: ['FO4104'], coreqs: [], userSem: 9 },
                { id: 'FO5101', block: 9, name: 'Extensión Forestal', cred: 3, hrs: 4, reqs: ['FO4201'], coreqs: [], userSem: 9 },
                { id: 'FO5106', block: 9, name: 'Sistemas Agroforestales', cred: 2, hrs: 4, reqs: ['FO3109'], coreqs: ['FO4441'], userSem: 9 },
                { id: 'FO8201', block: 9, name: 'Electiva II Énfasis En Manejo Y Producción Forestal', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 9 },
                // BLOQUE 10 
                { id: 'FO5052', block: 10, name: 'Trabajo Final De Graduación', cred: 10, hrs: 48, reqs: ['BI1101', 'BI1102', 'CI1106', 'CI1107', 'CI1230', 'CI1231', 'CS2303', 'CS3401', 'CS4402', 'FH1000', 'FI1101', 'FI1201', 'FO1103', 'FO1104', 'FO1106', 'FO1107', 'FO1108', 'FO2108', 'FO2109', 'FO2113', 'FO2114', 'FO2115', 'FO2116', 'FO2117', 'FO2201', 'FO2202', 'FO2303', 'FO3109', 'FO3113', 'FO3118', 'FO3120', 'FO3123', 'FO3130', 'FO3132', 'FO3133', 'FO3203', 'FO3210', 'FO3401', 'FO4102', 'FO4104', 'FO4107', 'FO4114', 'FO4201', 'FO4203', 'FO4204', 'FO4211', 'FO4223', 'FO4308', 'FO4309', 'FO4412', 'FO4417', 'FO4441', 'FO5049', 'FO5101', 'FO5106', 'FO5218', 'FO8101', 'FO8201', 'MA0101', 'MA1102', 'MA1103', 'QU1102', 'QU1104', 'QU1106', 'QU1107', 'SE1100', 'SE1200', 'SE1400'], coreqs: [], userSem: 10 },
            ],
            forestal_conservacionYrestauracion: [
                // BLOQUE 0 
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                // BLOQUE 1 
                { id: 'BI1101', block: 1, name: 'Biología General', cred: 3, hrs: 9, reqs: [], coreqs: ['BI1102'], userSem: 1 },
                { id: 'BI1102', block: 1, name: 'Laboratorio De Biología General', cred: 1, hrs: 3, reqs: [], coreqs: ['BI1101'], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'FO1103', block: 1, name: 'Introducción A La Ingeniería Forestal', cred: 1, hrs: 2, reqs: [], coreqs: ['FO1104', 'FO2202'], userSem: 1 },
                { id: 'FO1104', block: 1, name: 'Laboratorio Introducción A La Ingeniería Forestal', cred: 2, hrs: 2, reqs: [], coreqs: ['FO1103'], userSem: 1 },
                { id: 'FO2202', block: 1, name: 'Mediciones Forestales', cred: 3, hrs: 4, reqs: [], coreqs: ['FO1103'], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                // BLOQUE 2 
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FO1107', block: 2, name: 'Botánica Forestal', cred: 3, hrs: 3, reqs: ['BI1101'], coreqs: ['FO1108'], userSem: 2 },
                { id: 'FO1108', block: 2, name: 'Laboratorio De Botánica Forestal', cred: 1, hrs: 2, reqs: ['BI1102'], coreqs: ['FO1107'], userSem: 2 },
                { id: 'FO2201', block: 2, name: 'Levantamiento Forestal', cred: 3, hrs: 4, reqs: ['FO2202'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                // BLOQUE 3 
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'FO2109', block: 3, name: 'Dendrología Tropical', cred: 3, hrs: 4, reqs: ['FO1107', 'FO1108'], coreqs: [], userSem: 3 },
                { id: 'FO2113', block: 3, name: 'Análisis Estadístico', cred: 3, hrs: 4, reqs: ['MA0101'], coreqs: [], userSem: 3 },
                { id: 'FO2115', block: 3, name: 'Laboratorio De Reproducción De Especies Forestales', cred: 1, hrs: 2, reqs: ['FO2201'], coreqs: ['FO2117'], userSem: 3 },
                { id: 'FO2117', block: 3, name: 'Reproducción De Especies Forestales', cred: 2, hrs: 3, reqs: ['QU1106'], coreqs: ['FO2115'], userSem: 3 },
                { id: 'FO3401', block: 3, name: 'Sistemas De Información Geográfica', cred: 3, hrs: 4, reqs: ['FO2201'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                // BLOQUE 4 
                { id: 'CS2303', block: 4, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: ['CI1107'], coreqs: [], userSem: 4 },
                { id: 'FI1101', block: 4, name: 'Física General I', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 4 },
                { id: 'FI1201', block: 4, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 4 },
                { id: 'FO1106', block: 4, name: 'Climatología Forestal', cred: 3, hrs: 4, reqs: ['FO3401'], coreqs: [], userSem: 4 },
                { id: 'FO2108', block: 4, name: 'Laboratorio De Suelos Forestales', cred: 1, hrs: 2, reqs: ['QU1106'], coreqs: ['FO4107'], userSem: 4 },
                { id: 'FO3113', block: 4, name: 'Inventarios Forestales', cred: 3, hrs: 4, reqs: ['FO2113', 'FO3401'], coreqs: [], userSem: 4 },
                { id: 'FO4107', block: 4, name: 'Suelos Forestales', cred: 2, hrs: 3, reqs: ['QU1106'], coreqs: ['FO2108'], userSem: 4 },
                { id: 'FO4417', block: 4, name: 'Ecofisiología Forestal', cred: 3, hrs: 4, reqs: ['FO2113'], coreqs: ['FO4107'], userSem: 4 },
                // BLOQUE 5 
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS2303'], coreqs: [], userSem: 5 },
                { id: 'FO2114', block: 5, name: 'Ecología Forestal', cred: 3, hrs: 4, reqs: ['FO2109', 'FO3113'], coreqs: [], userSem: 5 },
                { id: 'FO2116', block: 5, name: 'Establecimiento De Plantaciones Forestales', cred: 3, hrs: 4, reqs: ['FO2117', 'FO4107'], coreqs: [], userSem: 5 },
                { id: 'FO3120', block: 5, name: 'Economía Forestal', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: ['FO3130'], userSem: 5 },
                { id: 'FO3130', block: 5, name: 'Métodos De Investigación Forestal', cred: 3, hrs: 5, reqs: ['FO3113'], coreqs: ['FO3120'], userSem: 5 },
                { id: 'FO4203', block: 5, name: 'Hidrología Forestal Y Manejo De Cuencas', cred: 3, hrs: 4, reqs: ['FO1106', 'FO4107'], coreqs: [], userSem: 5 },
                // BLOQUE 6 
                { id: 'FO3109', block: 6, name: 'Manejo De Plantaciones Forestales', cred: 3, hrs: 4, reqs: ['FO2116', 'FO3130'], coreqs: ['FO3132', 'FO3203'], userSem: 6 },
                { id: 'FO3118', block: 6, name: 'Silvicultura Bosque Natural', cred: 3, hrs: 4, reqs: ['FO2114'], coreqs: [], userSem: 6 },
                { id: 'FO3132', block: 6, name: 'Entomología Y Patología Forestales', cred: 2, hrs: 2, reqs: ['FO4417'], coreqs: ['FO3109', 'FO3133'], userSem: 6 },
                { id: 'FO3133', block: 6, name: 'Laboratorio De Entomología Y Patología Forestales', cred: 1, hrs: 3, reqs: [], coreqs: ['FO3132'], userSem: 6 },
                { id: 'FO3203', block: 6, name: 'Aprovechamiento Forestal I', cred: 3, hrs: 5, reqs: ['FO3113'], coreqs: ['FO3109', 'FO3307'], userSem: 6 },
                { id: 'FO3210', block: 6, name: 'Gestión De Administración Forestal', cred: 3, hrs: 4, reqs: ['CS2303', 'FO3120'], coreqs: [], userSem: 6 },
                { id: 'FO3307', block: 6, name: 'Biología De La Conservación', cred: 3, hrs: 4, reqs: ['FI1101', 'FO2114'], coreqs: ['FO3203'], userSem: 6 },
                // BLOQUE 7 
                { id: 'FO4001', block: 7, name: 'Bases Y Principios Para La Restauración Ecológica', cred: 3, hrs: 4, reqs: ['FO3307'], coreqs: ['FO4004', 'FO4201'], userSem: 7 },
                { id: 'FO4003', block: 7, name: 'Sistemas De Gestión Ambiental', cred: 3, hrs: 4, reqs: ['FO4203'], coreqs: ['FO4004'], userSem: 7 },
                { id: 'FO4004', block: 7, name: 'Evaluación De Impacto Ambiental', cred: 3, hrs: 5, reqs: ['FO4203'], coreqs: ['FO4001', 'FO4003'], userSem: 7 },
                { id: 'FO4201', block: 7, name: 'Ordenación Forestal', cred: 3, hrs: 4, reqs: ['FO3118'], coreqs: ['FO4204', 'FO4211'], userSem: 7 },
                { id: 'FO4204', block: 7, name: 'Aprovechamiento Forestal II', cred: 3, hrs: 5, reqs: ['FO3203'], coreqs: ['FO4201'], userSem: 7 },
                { id: 'FO4211', block: 7, name: 'Política Y Legislación Ambiental', cred: 3, hrs: 4, reqs: [], coreqs: ['FO4201'], userSem: 7 },
                // BLOQUE 8 
                { id: 'FO4104', block: 8, name: 'Formulación Y Evaluación De Proyectos', cred: 3, hrs: 4, reqs: ['FO3210', 'MA1103'], coreqs: [], userSem: 8 },
                { id: 'FO4220', block: 8, name: 'Restauración De Ecosistemas Tropicales', cred: 3, hrs: 4, reqs: ['FO4001', 'QU1107'], coreqs: [], userSem: 8 },
                { id: 'FO4224', block: 8, name: 'Introducción A La Fauna Silvestre En Ecosistemas Forestales', cred: 3, hrs: 4, reqs: ['FO4211'], coreqs: [], userSem: 8 },
                { id: 'FO4225', block: 8, name: 'Seguimiento Y Auditoría Ambiental', cred: 3, hrs: 4, reqs: ['FO4004'], coreqs: [], userSem: 8 },
                { id: 'FO4418', block: 8, name: 'Cambio Climático: Acciones Y Métricas En Sistemas Terrestres', cred: 3, hrs: 4, reqs: ['FO4001'], coreqs: [], userSem: 8 },
                { id: 'FO7001', block: 8, name: 'Electiva I Énfasis En Conservación Y Restauración De Los Ecosistemas Forestales', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 8 },
                // BLOQUE 9 
                { id: 'CS4402', block: 9, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3401'], coreqs: [], userSem: 9 },
                { id: 'FO5049', block: 9, name: 'Seminario De Graduación', cred: 2, hrs: 3, reqs: ['FO4104'], coreqs: [], userSem: 9 },
                { id: 'FO5103', block: 9, name: 'Gestión De Áreas Silvestres', cred: 2, hrs: 4, reqs: ['FO4224', 'FO4225'], coreqs: ['FO5123'], userSem: 9 },
                { id: 'FO5120', block: 9, name: 'Técnicas De Identificación Y Valoración De Daño Ambiental', cred: 3, hrs: 4, reqs: ['FO4220', 'FO4225'], coreqs: [], userSem: 9 },
                { id: 'FO5121', block: 9, name: 'Restauración Del Paisaje: Áreas Urbanas Y Ecosistemas Agropecuarios', cred: 3, hrs: 4, reqs: ['FO4220'], coreqs: [], userSem: 9 },
                { id: 'FO5123', block: 9, name: 'Monitoreo De Vida Silvestre En Ecosistemas Forestales', cred: 3, hrs: 4, reqs: ['FO4224'], coreqs: ['FO5103'], userSem: 9 },
                { id: 'FO7020', block: 9, name: 'Electiva II Énfasis En Conservación Y Restauración De Ecosistemas Forestales', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 9 },
                // BLOQUE 10 
                { id: 'FO5051', block: 10, name: 'Trabajo Final De Graduación', cred: 10, hrs: 48, reqs: ['BI1101', 'BI1102', 'CI1106', 'CI1107', 'CI1230', 'CI1231', 'CS2303', 'CS3401', 'CS4402', 'FH1000', 'FI1101', 'FI1201', 'FO1103', 'FO1104', 'FO1106', 'FO1107', 'FO1108', 'FO2108', 'FO2109', 'FO2113', 'FO2114', 'FO2115', 'FO2116', 'FO2117', 'FO2201', 'FO2202', 'FO3109', 'FO3113', 'FO3118', 'FO3120', 'FO3130', 'FO3132', 'FO3133', 'FO3203', 'FO3210', 'FO3307', 'FO3401', 'FO4001', 'FO4003', 'FO4004', 'FO4104', 'FO4107', 'FO4201', 'FO4203', 'FO4204', 'FO4211', 'FO4220', 'FO4224', 'FO4225', 'FO4417', 'FO4418', 'FO5049', 'FO5103', 'FO5120', 'FO5121', 'FO5123', 'FO7001', 'FO7020', 'MA0101', 'MA1102', 'MA1103', 'QU1102', 'QU1104', 'QU1106', 'QU1107', 'SE1100', 'SE1200', 'SE1400'], coreqs: [], userSem: 10 },
            ],
            seguridad: [
              // BLOQUE 0
              { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
              { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
          
              // BLOQUE 1
              { id: 'BI5406', block: 1, name: 'Biología General Para Entornos Laborales', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
              { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
              { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
              { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
              { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
              { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
              { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
              { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
              { id: 'SO1102', block: 1, name: 'Dibujo E Interpretación De Planos', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
              { id: 'SO1103', block: 1, name: 'Introducción A La Seguridad Laboral', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
          
              // BLOQUE 2
              { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
              { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
              { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
              { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
              { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
              { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
              { id: 'MI8304', block: 2, name: 'Máquinas Y Equipos', cred: 3, hrs: 9, reqs: ['SO1102', 'SO1103'], coreqs: [], userSem: 2 },
              { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },
              { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
              { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
          
              // BLOQUE 3
              { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
              { id: 'CS2101', block: 3, name: 'Ambiente Humano', cred: 2, hrs: 6, reqs: ['CI1106'], coreqs: [], userSem: 3 },
              { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
              { id: 'PI2608', block: 3, name: 'Análisis Estadístico', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
              { id: 'QU2402', block: 3, name: 'Laboratorio Fundamentos Química Orgánica', cred: 1, hrs: 2, reqs: ['QU1104', 'QU1107'], coreqs: ['QU2407'], userSem: 3 },
              { id: 'QU2407', block: 3, name: 'Fundamentos De Química Orgánica', cred: 3, hrs: 4, reqs: ['QU1104', 'QU1107'], coreqs: ['QU2402'], userSem: 3 },
              { id: 'SO2309', block: 3, name: 'Seguridad En Instalaciones Y Maquinaria', cred: 3, hrs: 9, reqs: ['MI8304'], coreqs: [], userSem: 3 },
          
              // BLOQUE 4
              { id: 'FI2103', block: 4, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 4 },
              { id: 'MA2105', block: 4, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
              { id: 'SO2404', block: 4, name: 'Procesos De Manufactura', cred: 3, hrs: 9, reqs: ['SO2309'], coreqs: [], userSem: 4 },
              { id: 'SO2405', block: 4, name: 'Bioestadística', cred: 3, hrs: 9, reqs: ['PI2608'], coreqs: ['SO2406'], userSem: 4 },
              { id: 'SO2406', block: 4, name: 'Anatomía Y Fisiología Médica', cred: 3, hrs: 9, reqs: [], coreqs: ['SO2405'], userSem: 4 },
              { id: 'SO2407', block: 4, name: 'Legislación Ocupacional Y Ambiental', cred: 2, hrs: 6, reqs: ['CS2101'], coreqs: [], userSem: 4 },
          
              // BLOQUE 5
              { id: 'AE5113', block: 5, name: 'Contabilidad Financiera', cred: 3, hrs: 9, reqs: ['MA2105'], coreqs: [], userSem: 5 },
              { id: 'SO3503', block: 5, name: 'Fundamentos De Medicina Y Toxicología Laboral', cred: 3, hrs: 9, reqs: ['SO2406'], coreqs: ['SO3507'], userSem: 5 },
              { id: 'SO3507', block: 5, name: 'Epidemiología En Salud Ocupacional', cred: 3, hrs: 9, reqs: [], coreqs: ['SO3503'], userSem: 5 },
              { id: 'SO3510', block: 5, name: 'Agentes Ambientales Biológicos', cred: 3, hrs: 9, reqs: ['BI5406'], coreqs: ['SO3604'], userSem: 5 },
              { id: 'SO3513', block: 5, name: 'Seguridad En Procesos Industriales', cred: 3, hrs: 9, reqs: ['SO2404'], coreqs: [], userSem: 5 },
              { id: 'SO3604', block: 5, name: 'Agentes Ambientales Químicos', cred: 3, hrs: 9, reqs: ['QU2407', 'SO2405'], coreqs: ['SO3510'], userSem: 5 },
          
              // BLOQUE 6
              { id: 'AE5122', block: 6, name: 'Ingeniería Financiera', cred: 3, hrs: 9, reqs: ['AE5113'], coreqs: ['SO3506'], userSem: 6 },
              { id: 'MA3106', block: 6, name: 'Métodos Numéricos', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 6 },
              { id: 'SO3506', block: 6, name: 'Metodología Investigación', cred: 3, hrs: 4, reqs: ['CI1231'], coreqs: ['AE5122'], userSem: 6 },
              { id: 'SO3603', block: 6, name: 'Evaluación Y Control De Ruidos Y Vibraciones', cred: 3, hrs: 9, reqs: ['SO3503'], coreqs: [], userSem: 6 },
              { id: 'SO3606', block: 6, name: 'Factores Psicosociales', cred: 3, hrs: 9, reqs: ['SO3507'], coreqs: [], userSem: 6 },
              { id: 'SO4701', block: 6, name: 'Taller De Agentes Ambientales Químicos', cred: 2, hrs: 6, reqs: ['SO3604'], coreqs: [], userSem: 6 },
          
              // BLOQUE 7
              { id: 'SO3508', block: 7, name: 'Seguridad Contra Incendios', cred: 3, hrs: 9, reqs: ['FI2103', 'SO3513'], coreqs: [], userSem: 7 },
              { id: 'SO4703', block: 7, name: 'Evaluación Y Control De Exposición Al Ambiente Térmico', cred: 3, hrs: 9, reqs: ['SO3603'], coreqs: [], userSem: 7 },
              { id: 'SO4705', block: 7, name: 'Control De Los Factores Psicosociales', cred: 3, hrs: 9, reqs: ['SO3606'], coreqs: ['SO4804'], userSem: 7 },
              { id: 'SO4802', block: 7, name: 'Control De Agentes Ambientales Químicos', cred: 3, hrs: 9, reqs: ['SO4701'], coreqs: [], userSem: 7 },
              { id: 'SO4804', block: 7, name: 'Principios De Ergonomía Ocupacional', cred: 3, hrs: 9, reqs: [], coreqs: ['SO4705'], userSem: 7 },
          
              // BLOQUE 8
              { id: 'SO4508', block: 8, name: 'Protección Del Ambiente', cred: 3, hrs: 4, reqs: [], coreqs: ['SO4706'], userSem: 8 },
              { id: 'SO4702', block: 8, name: 'Seguridad Eléctrica', cred: 3, hrs: 11, reqs: ['SO3508'], coreqs: [], userSem: 8 },
              { id: 'SO4706', block: 8, name: 'Seminario De Adaptación Al Cambio Climático', cred: 2, hrs: 6, reqs: [], coreqs: ['SO4508', 'SO4707'], userSem: 8 },
              { id: 'SO4707', block: 8, name: 'Administración De Proyectos', cred: 3, hrs: 9, reqs: ['AE5122', 'SO3506'], coreqs: ['SO4706'], userSem: 8 },
              { id: 'SO4803', block: 8, name: 'Evaluación Y Control De Radiaciones E Iluminación', cred: 3, hrs: 4, reqs: ['SO4703'], coreqs: [], userSem: 8 },
              { id: 'SO5904', block: 8, name: 'Factores Humanos Y Ergonomía Ocupacional', cred: 3, hrs: 9, reqs: ['SO4804'], coreqs: [], userSem: 8 },
          
              // BLOQUE 9
              { id: 'CS3404', block: 9, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['SO2407'], coreqs: [], userSem: 9 },
              { id: 'SO4402', block: 9, name: 'Gerencia De Riesgos', cred: 3, hrs: 4, reqs: [], coreqs: ['SO4801'], userSem: 9 },
              { id: 'SO4801', block: 9, name: 'Gerencia Estratégica', cred: 3, hrs: 9, reqs: ['SO4707'], coreqs: ['SO4402'], userSem: 9 },
              { id: 'SO5903', block: 9, name: 'Gestión Ambiental', cred: 3, hrs: 9, reqs: ['SO4508'], coreqs: ['SO5905'], userSem: 9 },
              { id: 'SO5905', block: 9, name: 'Gestión Integral De Desastres', cred: 3, hrs: 9, reqs: [], coreqs: ['SO5903'], userSem: 9 },
              { id: 'SO5910', block: 9, name: 'Taller De Diseño', cred: 4, hrs: 12, reqs: ['SO4702', 'SO4803'], coreqs: [], userSem: 9 },
          
              // BLOQUE 10
              { id: 'CS4402', block: 10, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 10 },
              { id: 'SO5101', block: 10, name: 'Trabajo Final De Graduación', cred: 10, hrs: 30, reqs: ['SO5905', 'SO5910'], coreqs: [], userSem: 10 },
              { id: 'SO5906', block: 10, name: 'Electiva', cred: 3, hrs: 9, reqs: ['SO4803', 'SO5904'], coreqs: [], userSem: 10 }
          ],
            e_mate: [
                // BLOQUE 0 
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1 
                { id: 'CI1405', block: 1, name: 'Fundamentos De Comunicación Académica', cred: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'EM1401', block: 1, name: 'Introducción A La Pedagogía', cred: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'EM1404', block: 1, name: 'Teorías Psicopedagógicas Del Aprendizaje', cred: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'EM1605', block: 1, name: 'Fundamentos De Matemática I', cred: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA1403', block: 1, name: 'Matemática Discreta', cred: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2 
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'CI1406', block: 2, name: 'Argumentación E Investigación En Comunicación Académica', cred: 3, reqs: ['CI1405'], coreqs: [], userSem: 2 },
                { id: 'EM1600', block: 2, name: 'Tecnologías Digitales Aplicadas A La Matemática Educativa I', cred: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'EM1606', block: 2, name: 'Fundamentos De Matemática II', cred: 4, reqs: ['EM1605'], coreqs: [], userSem: 2 },
                { id: 'EM2408', block: 2, name: 'Aprendizaje Y Didáctica De La Matemática', cred: 2, reqs: ['EM1401'], coreqs: [], userSem: 2 },
                { id: 'EM2604', block: 2, name: 'Geometría I', cred: 4, reqs: ['MA1403'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, reqs: [], coreqs: [], userSem: 2 },
                { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, reqs: [], coreqs: [], userSem: 2 },

                // BLOQUE 3 
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'EM1608', block: 3, name: 'Didáctica Del Álgebra Y Funciones', cred: 3, reqs: ['EM1606', 'EM2408'], coreqs: [], userSem: 3 },
                { id: 'EM2606', block: 3, name: 'Geometría II', cred: 4, reqs: ['EM2604'], coreqs: [], userSem: 3 },
                { id: 'EM3407', block: 3, name: 'Psicología Del Desarrollo', cred: 3, reqs: ['EM1404'], coreqs: [], userSem: 3 },
                { id: 'EM3607', block: 3, name: 'Álgebra Lineal', cred: 5, reqs: ['EM1606'], coreqs: ['EM1608'], userSem: 3 },

                // BLOQUE 4 
                { id: 'CA2125', block: 4, name: 'Elementos De Computación', cred: 3, reqs: [], coreqs: [], userSem: 4 },
                { id: 'EM1607', block: 4, name: 'Didáctica De La Geometría', cred: 3, reqs: ['EM1608', 'EM2606'], coreqs: [], userSem: 4 },
                { id: 'EM2603', block: 4, name: 'Cálculo Y Análisis I', cred: 5, reqs: ['EM3607'], coreqs: [], userSem: 4 },
                { id: 'EM2608', block: 4, name: 'Elementos De Análisis De Datos Y Probabilidad', cred: 3, reqs: ['EM1606'], coreqs: [], userSem: 4 },
                { id: 'EM2610', block: 4, name: 'Módulo Requisito Graduación', cred: 0, reqs: [], coreqs: ['EM1607'], userSem: 4 },
                { id: 'EM3048', block: 4, name: 'Atención A La Diversidad En La Enseñanza Y El Aprendizaje De La Matemática', cred: 3, reqs: ['EM3407'], coreqs: [], userSem: 4 },

                // BLOQUE 5 
                { id: 'EM1609', block: 5, name: 'Didáctica De La Probabilidad Y La Estadística', cred: 3, reqs: ['EM1607', 'EM2608'], coreqs: [], userSem: 5 },
                { id: 'EM1610', block: 5, name: 'Tecnologías Digitales Aplicadas A La Matemática Educativa II', cred: 3, reqs: ['CA2125', 'EM1600'], coreqs: [], userSem: 5 },
                { id: 'EM2607', block: 5, name: 'Cálculo Y Análisis II', cred: 5, reqs: ['EM2603'], coreqs: [], userSem: 5 },
                { id: 'EM3001', block: 5, name: 'Electivo I', cred: 4, reqs: [], coreqs: ['EM1609'], userSem: 5 },
                { id: 'EM3408', block: 5, name: 'Evaluación Del Aprendizaje', cred: 3, reqs: ['EM3048'], coreqs: ['EM1609'], userSem: 5 },

                // BLOQUE 6 
                { id: 'CS3401', block: 6, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, reqs: [], coreqs: [], userSem: 6 },
                { id: 'EM3409', block: 6, name: 'Práctica Docente', cred: 6, reqs: [], coreqs: [], userSem: 6 }, // Requisito: "Ver todos" en origen
                { id: 'EM3608', block: 6, name: 'Cálculo Y Análisis III', cred: 5, reqs: ['EM2607'], coreqs: [], userSem: 6 },
                { id: 'EM3610', block: 6, name: 'Electivo II', cred: 3, reqs: [], coreqs: [], userSem: 6 },

                // BLOQUE 7 
                { id: 'CS4402', block: 7, name: 'Seminario De Estudios Costarricenses', cred: 2, reqs: ['CS3401'], coreqs: [], userSem: 7 },
                { id: 'EM1611', block: 7, name: 'Geometría Analítica', cred: 4, reqs: ['EM2606'], coreqs: [], userSem: 7 },
                { id: 'EM4609', block: 7, name: 'Álgebra', cred: 5, reqs: ['EM3607'], coreqs: [], userSem: 7 },
                { id: 'EM4610', block: 7, name: 'Ecuaciones Diferenciales', cred: 5, reqs: ['EM3608'], coreqs: [], userSem: 7 },

                // BLOQUE 8 
                { id: 'EM1613', block: 8, name: 'Tecnologías Digitales Aplicadas A La Matemática Educativa III', cred: 3, reqs: ['EM1610'], coreqs: [], userSem: 8 },
                { id: 'EM1614', block: 8, name: 'Estadística Inferencial', cred: 4, reqs: ['EM2608'], coreqs: ['EM4612'], userSem: 8 },
                { id: 'EM4001', block: 8, name: 'Electivo III', cred: 4, reqs: ['EM3608'], coreqs: [], userSem: 8 },
                { id: 'EM4612', block: 8, name: 'Métodos Numéricos', cred: 4, reqs: ['EM4610'], coreqs: [], userSem: 8 }
            ],
            agronegocios: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'AN1003', block: 1, name: 'Introducción A La Ingeniería En Agronegocios', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'BI1101', block: 1, name: 'Biología General', cred: 3, hrs: 9, reqs: [], coreqs: ['BI1102'], userSem: 1 },
                { id: 'BI1102', block: 1, name: 'Laboratorio De Biología General', cred: 1, hrs: 3, reqs: [], coreqs: ['BI1101'], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2
                { id: 'AN1004', block: 2, name: 'Gestión En Agronegocios', cred: 3, hrs: 9, reqs: ['AN1003'], coreqs: [], userSem: 2 },
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },

                // BLOQUE 3
                { id: 'AE3103', block: 3, name: 'Contabilidad General', cred: 3, hrs: 4, reqs: ['MA0101'], coreqs: ['AN2002'], userSem: 3 },
                { id: 'AN2002', block: 3, name: 'Agronegocios En El Desarrollo Rural', cred: 2, hrs: 4, reqs: ['AN1004'], coreqs: ['AE3103'], userSem: 3 },
                { id: 'AN2007', block: 3, name: 'Microeconomía En Los Agronegocios', cred: 3, hrs: 9, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'QU2402', block: 3, name: 'Laboratorio Fundamentos Química Orgánica', cred: 1, hrs: 2, reqs: ['QU1104', 'QU1107'], coreqs: ['QU2407'], userSem: 3 },
                { id: 'QU2407', block: 3, name: 'Fundamentos De Química Orgánica', cred: 3, hrs: 4, reqs: ['QU1104', 'QU1107'], coreqs: ['QU2402'], userSem: 3 },

                // BLOQUE 4
                { id: 'AA2302', block: 4, name: 'Contabilidad De Costos Aplicada', cred: 3, hrs: 9, reqs: ['AE3103'], coreqs: ['AA3202'], userSem: 4 },
                { id: 'AA3202', block: 4, name: 'Anatomía Y Fisiología Animal', cred: 3, hrs: 9, reqs: ['BI1101'], coreqs: ['AA2302'], userSem: 4 },
                { id: 'AE4312', block: 4, name: 'Macroeconomía', cred: 3, hrs: 4, reqs: ['AN2007'], coreqs: [], userSem: 4 },
                { id: 'AN2003', block: 4, name: 'Bioquímica Agroalimentaria', cred: 3, hrs: 7, reqs: ['QU2402', 'QU2407'], coreqs: ['AN2004'], userSem: 4 },
                { id: 'AN2004', block: 4, name: 'Laboratorio De Bioquímica Agroalimentaria', cred: 3, hrs: 9, reqs: ['QU2402', 'QU2407'], coreqs: ['AN2003'], userSem: 4 },
                { id: 'AN3008', block: 4, name: 'Probabilidad Y Estadísticas En Los Agronegocios', cred: 3, hrs: 9, reqs: ['MA1103'], coreqs: [], userSem: 4 },

                // BLOQUE 5
                { id: 'AA3203', block: 5, name: 'Nutrición Y Agrostología', cred: 3, hrs: 9, reqs: ['AA3202', 'AN3008'], coreqs: [], userSem: 5 },
                { id: 'AA3328', block: 5, name: 'Mercadeo Agropecuario', cred: 3, hrs: 4, reqs: ['AE4312'], coreqs: [], userSem: 5 },
                { id: 'AN3001', block: 5, name: 'Microbiología Agroalimentaria', cred: 3, hrs: 8, reqs: ['AN2003', 'AN2004'], coreqs: [], userSem: 5 },
                { id: 'AN3003', block: 5, name: 'Gestión Contable En Agronegocios', cred: 3, hrs: 9, reqs: ['AA2302'], coreqs: [], userSem: 5 },
                { id: 'AN3009', block: 5, name: 'Diseño Experimental En Los Agronegocios', cred: 3, hrs: 9, reqs: ['AN3008'], coreqs: [], userSem: 5 },
                { id: 'IA3010', block: 5, name: 'Suelos Y Labranza', cred: 3, hrs: 9, reqs: ['FI1101'], coreqs: [], userSem: 5 },

                // BLOQUE 6
                { id: 'AA4205', block: 6, name: 'Producción Bovina', cred: 3, hrs: 6, reqs: ['AA3203'], coreqs: [], userSem: 6 },
                { id: 'AN3004', block: 6, name: 'Fundamentos De Agroindustria Alimentaria', cred: 3, hrs: 9, reqs: ['AN3001'], coreqs: [], userSem: 6 },
                { id: 'AN3006', block: 6, name: 'Investigación De Operaciones En Agronegocios', cred: 3, hrs: 9, reqs: ['AN3009'], coreqs: [], userSem: 6 },
                { id: 'AN3007', block: 6, name: 'Cultivos Hortícolas', cred: 3, hrs: 9, reqs: ['IA3010'], coreqs: [], userSem: 6 },
                { id: 'AN4002', block: 6, name: 'Mercadeo Productos Agroindustriales', cred: 3, hrs: 4, reqs: ['AA3328'], coreqs: [], userSem: 6 },
                { id: 'AN4008', block: 6, name: 'Sistematización De Datos En Agronegocios', cred: 3, hrs: 9, reqs: ['AN3003'], coreqs: [], userSem: 6 },

                // BLOQUE 7
                { id: 'AN4001', block: 7, name: 'Procesado Productos Agrícolas', cred: 3, hrs: 9, reqs: ['AN3004'], coreqs: ['AN4003'], userSem: 7 },
                { id: 'AN4003', block: 7, name: 'Abastecimiento De Los Agronegocios', cred: 3, hrs: 9, reqs: ['AA4205', 'AN3007'], coreqs: ['AN4001'], userSem: 7 },
                { id: 'AN4004', block: 7, name: 'Cultivos Perennes Y Granos', cred: 3, hrs: 9, reqs: ['AN3007'], coreqs: [], userSem: 7 },
                { id: 'AN4009', block: 7, name: 'Mercadeo Internacional', cred: 3, hrs: 9, reqs: ['AN4002'], coreqs: [], userSem: 7 },
                { id: 'AN4010', block: 7, name: 'Producción Porcina Y Avícola', cred: 3, hrs: 4, reqs: ['AA4205'], coreqs: [], userSem: 7 },
                { id: 'PI3901', block: 7, name: 'Administración De La Producción', cred: 2, hrs: 3, reqs: ['AN3006'], coreqs: [], userSem: 7 },

                // BLOQUE 8
                { id: 'AN3005', block: 8, name: 'Finanzas En Agronegocios', cred: 3, hrs: 4, reqs: ['PI3901'], coreqs: [], userSem: 8 },
                { id: 'AN4005', block: 8, name: 'Procesado Productos Pecuarios', cred: 3, hrs: 9, reqs: ['AN4010'], coreqs: ['AN4006'], userSem: 8 },
                { id: 'AN4006', block: 8, name: 'Gestión Ambiental En Agronegocios', cred: 2, hrs: 5, reqs: ['AN4001'], coreqs: ['AN4005'], userSem: 8 },
                { id: 'AN4007', block: 8, name: 'Cultivos No Tradicionales Y Tecnologías Alternativas', cred: 3, hrs: 9, reqs: ['AN4004'], coreqs: [], userSem: 8 },
                { id: 'AN7000', block: 8, name: 'Electivo', cred: 3, hrs: 7, reqs: [], coreqs: [], userSem: 8 },
                { id: 'CS1308', block: 8, name: 'Derecho Comercial', cred: 2, hrs: 4, reqs: [], coreqs: [], userSem: 8 },
                { id: 'CS3404', block: 8, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: [], coreqs: ['AN4006'], userSem: 8 },

                // BLOQUE 9
                { id: 'AA4113', block: 9, name: 'Control De Calidad De Procesos Agroindustriales', cred: 3, hrs: 4, reqs: ['AN4005'], coreqs: [], userSem: 9 },
                { id: 'AN5001', block: 9, name: 'Seminario De Graduación En Agronegocios', cred: 3, hrs: 9, reqs: [], coreqs: ['AN5002'], userSem: 9 },
                { id: 'AN5002', block: 9, name: 'Gestión De Recursos Humanos En Agronegocios', cred: 3, hrs: 9, reqs: [], coreqs: ['AN5001', 'AN5003'], userSem: 9 },
                { id: 'AN5003', block: 9, name: 'Formulación Y Evaluación De Proyectos', cred: 3, hrs: 9, reqs: ['AN3005', 'AN4009'], coreqs: ['AN5002'], userSem: 9 },
                { id: 'AN5004', block: 9, name: 'Estrategia Empresarial En Agronegocios', cred: 3, hrs: 9, reqs: ['AN3005', 'AN4009'], coreqs: [], userSem: 9 },
                { id: 'CS4402', block: 9, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 9 },

                // BLOQUE 10
                { id: 'AN6001', block: 10, name: 'Trabajo Final De Graduación', cred: 10, hrs: 0, reqs: ['AN5001'], coreqs: [], userSem: 10 }
            ],
            agricola: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'BI1103', block: 1, name: 'Biología Agrícola', cred: 3, hrs: 3, reqs: [], coreqs: ['BI1104'], userSem: 1 },
                { id: 'BI1104', block: 1, name: 'Laboratorio De Biología Agrícola', cred: 1, hrs: 2, reqs: [], coreqs: ['BI1103'], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1230', block: 1, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 1 },
                { id: 'IA1002', block: 1, name: 'Fundamentos De Ingeniería Agrícola', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },

                // BLOQUE 2
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CI1231', block: 2, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 2 },
                { id: 'CS1502', block: 2, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CS3305', block: 2, name: 'Legislación Agrícola', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'IA1203', block: 2, name: 'Dibujo Técnico', cred: 3, hrs: 4, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },

                // BLOQUE 3
                { id: 'FI1101', block: 3, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 3 },
                { id: 'FI1201', block: 3, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 3 },
                { id: 'IA2105', block: 3, name: 'Laboratorio De Edafología', cred: 2, hrs: 3, reqs: [], coreqs: ['IA2107'], userSem: 3 },
                { id: 'IA2107', block: 3, name: 'Edafología', cred: 3, hrs: 9, reqs: ['QU1106'], coreqs: ['IA2105'], userSem: 3 },
                { id: 'IA2204', block: 3, name: 'Programación Aplicada', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'IA3302', block: 3, name: 'Topografía', cred: 3, hrs: 5, reqs: ['IA1203'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'SE1100', block: 3, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },

                // BLOQUE 4
                { id: 'FH1000', block: 4, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },
                { id: 'FI2103', block: 4, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 4 },
                { id: 'IA2106', block: 4, name: 'Sistemas De Producción Agrícola', cred: 4, hrs: 5, reqs: ['BI1103', 'IA2107'], coreqs: [], userSem: 4 },
                { id: 'IA2202', block: 4, name: 'Estática', cred: 3, hrs: 4, reqs: ['FI1101', 'IA1203'], coreqs: [], userSem: 4 },
                { id: 'IA3303', block: 4, name: 'Aplicaciones Topográficas', cred: 3, hrs: 5, reqs: ['IA3302'], coreqs: [], userSem: 4 },
                { id: 'MA2105', block: 4, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'SE1200', block: 4, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },

                // BLOQUE 5
                { id: 'IA3202', block: 5, name: 'Estadística Aplicada', cred: 3, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'IA3206', block: 5, name: 'Resistencia De Materiales', cred: 3, hrs: 4, reqs: ['IA2202'], coreqs: [], userSem: 5 },
                { id: 'IA3208', block: 5, name: 'Electricidad', cred: 3, hrs: 4, reqs: ['FI1101'], coreqs: [], userSem: 5 },
                { id: 'IA3212', block: 5, name: 'Mecánica De Fluidos Aplicada', cred: 3, hrs: 5, reqs: ['FI2103'], coreqs: [], userSem: 5 },
                { id: 'MA3106', block: 5, name: 'Métodos Numéricos', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'SE1400', block: 5, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 5 },

                // BLOQUE 6
                { id: 'CM2103', block: 6, name: 'Termodinámica', cred: 3, hrs: 4, reqs: ['MA1102', 'QU1107'], coreqs: [], userSem: 6 },
                { id: 'IA3105', block: 6, name: 'Relación Suelo-Agua-Planta', cred: 3, hrs: 4, reqs: ['IA2106', 'QU1107'], coreqs: [], userSem: 6 },
                { id: 'IA3203', block: 6, name: 'Hidrología', cred: 3, hrs: 4, reqs: ['IA3202'], coreqs: [], userSem: 6 },
                { id: 'IA3210', block: 6, name: 'Laboratorio De Hidráulica', cred: 1, hrs: 2, reqs: [], coreqs: ['IA3213'], userSem: 6 },
                { id: 'IA3213', block: 6, name: 'Hidráulica De Canales', cred: 3, hrs: 4, reqs: ['IA3212'], coreqs: [], userSem: 6 },
                { id: 'IA3401', block: 6, name: 'Elementos Y Mecanismos De Máquinas Agrícolas', cred: 2, hrs: 3, reqs: ['IA3206', 'IA3208'], coreqs: [], userSem: 6 },
                { id: 'IA5601', block: 6, name: 'Protección Ambiental', cred: 3, hrs: 4, reqs: ['IA2106'], coreqs: [], userSem: 6 },

                // BLOQUE 7
                { id: 'CS3404', block: 7, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['CS1502'], coreqs: [], userSem: 7 },
                { id: 'IA4307', block: 7, name: 'Diseño Estructuras Hidráulicas', cred: 3, hrs: 4, reqs: ['IA3213'], coreqs: [], userSem: 7 },
                { id: 'IA4311', block: 7, name: 'Riego Superficial', cred: 3, hrs: 4, reqs: ['IA3105', 'IA3303'], coreqs: [], userSem: 7 },
                { id: 'IA4312', block: 7, name: 'Drenaje Superficial', cred: 2, hrs: 3, reqs: ['IA3203', 'IA3213'], coreqs: [], userSem: 7 },
                { id: 'IA4402', block: 7, name: 'Motores De Combustión Interna', cred: 3, hrs: 4, reqs: ['CM2103', 'IA3401'], coreqs: [], userSem: 7 },
                { id: 'IA4407', block: 7, name: 'Tractores Agrícolas', cred: 2, hrs: 3, reqs: [], coreqs: ['IA4402'], userSem: 7 },
                { id: 'PI5516', block: 7, name: 'Ingeniería Económica', cred: 3, hrs: 4, reqs: ['MA3106'], coreqs: [], userSem: 7 },

                // BLOQUE 8
                { id: 'CS4402', block: 8, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 8 },
                { id: 'IA3501', block: 8, name: 'Electrificación Rural', cred: 3, hrs: 5, reqs: ['IA3208'], coreqs: [], userSem: 8 },
                { id: 'IA4313', block: 8, name: 'Riego A Presión', cred: 3, hrs: 4, reqs: ['IA3212', 'IA4311'], coreqs: [], userSem: 8 },
                { id: 'IA4314', block: 8, name: 'Drenaje Sub-Superficial', cred: 3, hrs: 4, reqs: ['IA4312'], coreqs: [], userSem: 8 },
                { id: 'IA4315', block: 8, name: 'Manejo De Suelos, Aguas Y Diseño De Obras De Conservación', cred: 3, hrs: 4, reqs: ['IA3203', 'IA4312'], coreqs: [], userSem: 8 },
                { id: 'IA4403', block: 8, name: 'Mecanización Agrícola', cred: 2, hrs: 3, reqs: ['IA4407'], coreqs: [], userSem: 8 },
                { id: 'IA5402', block: 8, name: 'Laboratorio De Tractores Y Mecanización', cred: 2, hrs: 3, reqs: [], coreqs: ['IA4403'], userSem: 8 },

                // BLOQUE 9
                { id: 'AE4208', block: 9, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: ['PI5516'], coreqs: [], userSem: 9 },
                { id: 'IA4004', block: 9, name: 'Electiva I', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 9 },
                { id: 'IA4408', block: 9, name: 'Taller De Diseño', cred: 6, hrs: 18, reqs: ['IA4307', 'IA4313', 'IA4314', 'IA4315', 'IA4403'], coreqs: [], userSem: 9 },
                { id: 'SO4604', block: 9, name: 'Seguridad Y Salud Ocupacional', cred: 3, hrs: 3, reqs: [], coreqs: ['AE4208'], userSem: 9 },

                // BLOQUE 10
                { id: 'IA3004', block: 10, name: 'Trabajo Final De Graduación', cred: 9, hrs: 0, reqs: ['IA4408'], coreqs: [], userSem: 10 },
                { id: 'IA4005', block: 10, name: 'Electiva II', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 10 }
            ],
            materiales: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CM1103', block: 1, name: 'Introducción A La Ciencia E Ingeniería De Los Materiales', cred: 3, hrs: 8, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MI2101', block: 1, name: 'Dibujo Técnico', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2
                { id: 'CA2125', block: 2, name: 'Elementos De Computación', cred: 3, hrs: 4, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },

                // BLOQUE 3
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'CM2103', block: 3, name: 'Termodinámica', cred: 3, hrs: 4, reqs: ['MA1102', 'QU1107'], coreqs: [], userSem: 3 },
                { id: 'FI1102', block: 3, name: 'Física General II', cred: 3, hrs: 4, reqs: ['FI1101', 'FI1201'], coreqs: [], userSem: 3 },
                { id: 'FI1202', block: 3, name: 'Laboratorio Física General II', cred: 1, hrs: 2, reqs: ['FI1101', 'FI1201'], coreqs: ['FI1102'], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'QU2403', block: 3, name: 'Química Orgánica', cred: 3, hrs: 4, reqs: ['QU1104', 'QU1107'], coreqs: ['QU2404'], userSem: 3 },
                { id: 'QU2404', block: 3, name: 'Laboratorio De Química Orgánica', cred: 2, hrs: 4, reqs: ['QU1104', 'QU1107'], coreqs: ['QU2403'], userSem: 3 },
                { id: 'SE1200', block: 3, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },

                // BLOQUE 4
                { id: 'CM2401', block: 4, name: 'Metalurgia Física', cred: 3, hrs: 9, reqs: ['CM2103'], coreqs: ['CM3103'], userSem: 4 },
                { id: 'CM2402', block: 4, name: 'Laboratorio De Metalurgia Física', cred: 1, hrs: 3, reqs: ['CM1103'], coreqs: ['CM2401'], userSem: 4 },
                { id: 'CM3103', block: 4, name: 'Termodinámica De Materiales', cred: 3, hrs: 4, reqs: ['CM2103'], coreqs: [], userSem: 4 },
                { id: 'MA2105', block: 4, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'MI2106', block: 4, name: 'Estática', cred: 3, hrs: 4, reqs: ['FI1101', 'FI1201'], coreqs: [], userSem: 4 },
                { id: 'MI3124', block: 4, name: 'Dibujo Industrial', cred: 4, hrs: 4, reqs: ['MI2101'], coreqs: [], userSem: 4 },
                { id: 'SE1400', block: 4, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },

                // BLOQUE 5
                { id: 'CM3207', block: 5, name: 'Métodos Numéricos Para Ingeniería', cred: 3, hrs: 4, reqs: ['CA2125', 'MA2105'], coreqs: [], userSem: 5 },
                { id: 'CM3501', block: 5, name: 'Materiales Poliméricos', cred: 3, hrs: 9, reqs: ['QU2403', 'QU2404'], coreqs: [], userSem: 5 },
                { id: 'CS2303', block: 5, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: ['CS1502'], coreqs: [], userSem: 5 },
                { id: 'FH1000', block: 5, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 5 },
                { id: 'MI3115', block: 5, name: 'Resistencia De Materiales', cred: 3, hrs: 4, reqs: ['MI2106'], coreqs: [], userSem: 5 },
                { id: 'MI4510', block: 5, name: 'Electrotecnia', cred: 3, hrs: 4, reqs: ['FI1102', 'FI1202'], coreqs: [], userSem: 5 },
                { id: 'PI2609', block: 5, name: 'Probabilidad Y Estadística', cred: 2, hrs: 3, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'SO2601', block: 5, name: 'Fundamentos De Seguridad E Higiene Ocupacional', cred: 1, hrs: 2, reqs: [], coreqs: ['CS2303'], userSem: 5 },
            
                // BLOQUE 6 
                { id: 'CM3208', block: 6, name: 'Metrología Para Ingeniería', cred: 3, hrs: 4, reqs: ['MI3124', 'PI2609'], coreqs: [], userSem: 6 },
                { id: 'CM3601', block: 6, name: 'Mecánica De Fluidos', cred: 3, hrs: 9, reqs: ['CM3103', 'CM3207'], coreqs: [], userSem: 6 },
                { id: 'CM3602', block: 6, name: 'Tecnología De Aleaciones Metálicas', cred: 3, hrs: 9, reqs: ['CM2401', 'CM3103'], coreqs: [], userSem: 6 },
                { id: 'CM3603', block: 6, name: 'Mecánica De Materiales Avanzada', cred: 3, hrs: 9, reqs: ['CM2401', 'MI3115'], coreqs: [], userSem: 6 },
                { id: 'CM4202', block: 6, name: 'Laboratorio Tecnología Aleaciones Metálicas', cred: 2, hrs: 3, reqs: ['CM2401', 'CM3103'], coreqs: ['CM3602'], userSem: 6 },
                { id: 'CM4305', block: 6, name: 'Tecnología De Polímeros', cred: 2, hrs: 3, reqs: ['CM3501'], coreqs: [], userSem: 6 },
                { id: 'CS3404', block: 6, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['CS1502'], coreqs: [], userSem: 6 },

                // BLOQUE 7 
                { id: 'AE5121', block: 7, name: 'Ingeniería Económica', cred: 3, hrs: 3, reqs: ['PI2609'], coreqs: [], userSem: 7 },
                { id: 'CM3205', block: 7, name: 'Tecnología De Maquinado', cred: 3, hrs: 4, reqs: ['CM3208', 'CM3602'], coreqs: ['CM4307'], userSem: 7 },
                { id: 'CM4307', block: 7, name: 'Conformado De Materiales', cred: 4, hrs: 4, reqs: ['CM3603'], coreqs: ['CM3205'], userSem: 7 },
                { id: 'CM4701', block: 7, name: 'Transferencia De Calor Y Masa', cred: 3, hrs: 9, reqs: ['CM3207', 'CM3601'], coreqs: [], userSem: 7 },
                { id: 'CM4702', block: 7, name: 'Materiales Cerámicos Y Compuestos', cred: 3, hrs: 9, reqs: ['CM2401', 'CM4305'], coreqs: [], userSem: 7 },
                { id: 'CS4402', block: 7, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 7 },

                // BLOQUE 8 
                { id: 'CM4101', block: 8, name: 'Modelación Y Simulación', cred: 4, hrs: 4, reqs: ['CM3603', 'CM4701'], coreqs: [], userSem: 8 },
                { id: 'CM4801', block: 8, name: 'Caracterización De Materiales', cred: 4, hrs: 4, reqs: ['CM4305', 'CM4702'], coreqs: [], userSem: 8 },
                { id: 'CM4802', block: 8, name: 'Gestión De Proyectos', cred: 3, hrs: 9, reqs: ['AE5121'], coreqs: [], userSem: 8 },
                { id: 'CM4803', block: 8, name: 'Taller De Diseño En Ciencia E Ingeniería De Los Materiales', cred: 7, hrs: 21, reqs: ['CM3205'], coreqs: ['CM4101', 'CM4802'], userSem: 8 },

                // BLOQUE 9 
                { id: 'CM4309', block: 9, name: 'Corrosión Y Protección De Materiales', cred: 4, hrs: 12, reqs: ['CM3602', 'CM4801'], coreqs: [], userSem: 9 },
                { id: 'CM5104', block: 9, name: 'Diseño De Moldes Y Troqueles', cred: 4, hrs: 4, reqs: ['CM3205', 'CM4305'], coreqs: [], userSem: 9 },
                { id: 'CM5200', block: 9, name: 'Electiva I', cred: 4, hrs: 12, reqs: ['CM4802'], coreqs: [], userSem: 9 },
                { id: 'CM5302', block: 9, name: 'Equipos Auxiliares De Planta', cred: 3, hrs: 4, reqs: ['CM3208', 'CM4701'], coreqs: [], userSem: 9 },
                { id: 'CM5901', block: 9, name: 'Ensayos No Destructivos', cred: 3, hrs: 9, reqs: ['CM4801'], coreqs: [], userSem: 9 },

                // BLOQUE 10
                { id: 'CM5220', block: 10, name: 'Electiva II', cred: 4, hrs: 12, reqs: ['CM4802'], coreqs: [], userSem: 10 },
                { id: 'CM5240', block: 10, name: 'Electiva III', cred: 4, hrs: 12, reqs: ['CM4309'], coreqs: [], userSem: 10 },
                { id: 'CM5300', block: 10, name: 'Proyecto Final De Graduación', cred: 10, hrs: 12, reqs: ['CM4803', 'CM5104'], coreqs: [], userSem: 10 },
                { id: 'PI5101', block: 10, name: 'Gestión De Procesos', cred: 4, hrs: 8, reqs: ['CM4802'], coreqs: [], userSem: 10 }
            ],
            ati: [
                // BLOQUE 0 
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                { id: 'MA0101', block: 0, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 0 },
                // BLOQUE 1 
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA1403', block: 1, name: 'Matemática Discreta', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'TI1102', block: 1, name: 'Información Contable', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'TI1103', block: 1, name: 'Modelos Organizacionales Y Gestión De Ti', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'TI1400', block: 1, name: 'Introducción A La Programación', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'TI1401', block: 1, name: 'Taller De Programación', cred: 3, hrs: 4, reqs: [], coreqs: ['TI1400'], userSem: 1 },
                // BLOQUE 2 
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101', 'MA1403'], coreqs: [], userSem: 2 },
                { id: 'SE1200', block: 2, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'TI1201', block: 2, name: 'Comportamiento Organizacional Y Talento Humano', cred: 3, hrs: 9, reqs: ['TI1103'], coreqs: [], userSem: 2 },
                { id: 'TI2402', block: 2, name: 'Algoritmos Y Estructuras De Datos', cred: 4, hrs: 4, reqs: ['TI1400', 'TI1401'], coreqs: [], userSem: 2 },
                { id: 'TI2404', block: 2, name: 'Organización Y Arquitectura De Computadoras', cred: 3, hrs: 4, reqs: ['TI1401'], coreqs: [], userSem: 2 },
                { id: 'TI4500', block: 2, name: 'Ingeniería De Requerimientos', cred: 3, hrs: 4, reqs: ['TI1400'], coreqs: [], userSem: 2 },
                // BLOQUE 3 
                { id: 'CI3400', block: 3, name: 'Inglés 1 (Ati)', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },
                { id: 'TI2800', block: 3, name: 'Administración De Proyectos I', cred: 3, hrs: 9, reqs: ['TI4500'], coreqs: [], userSem: 3 },
                { id: 'TI3103', block: 3, name: 'Costos En Ambientes Informáticos', cred: 3, hrs: 4, reqs: ['TI1102'], coreqs: [], userSem: 3 },
                { id: 'TI3600', block: 3, name: 'Bases De Datos', cred: 3, hrs: 4, reqs: ['MA1403', 'TI2402'], coreqs: [], userSem: 3 },
                { id: 'TI4200', block: 3, name: 'Economía', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                // BLOQUE 4 
                { id: 'CI4401', block: 4, name: 'Inglés II (Ati)', cred: 2, hrs: 6, reqs: ['CI3400'], coreqs: [], userSem: 4 },
                { id: 'MA2404', block: 4, name: 'Probabilidades', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'TI2201', block: 4, name: 'Programación Orientada A Objetos', cred: 3, hrs: 9, reqs: ['TI3600'], coreqs: [], userSem: 4 },
                { id: 'TI3801', block: 4, name: 'Administración De Proyectos II', cred: 3, hrs: 4, reqs: ['TI2800'], coreqs: [], userSem: 4 },
                { id: 'TI4101', block: 4, name: 'Planificación Y Presupuesto', cred: 2, hrs: 4, reqs: ['TI3103'], coreqs: [], userSem: 4 },
                { id: 'TI4601', block: 4, name: 'Bases De Datos Avanzados', cred: 4, hrs: 4, reqs: ['TI3600'], coreqs: [], userSem: 4 },
                // BLOQUE 5 
                { id: 'CS3404', block: 5, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['TI3801'], coreqs: [], userSem: 5 },
                { id: 'MA3405', block: 5, name: 'Estadística', cred: 4, hrs: 4, reqs: ['MA2404'], coreqs: [], userSem: 5 },
                { id: 'TI3500', block: 5, name: 'Mercadeo En La Era Digital', cred: 3, hrs: 9, reqs: ['MA2404'], coreqs: [], userSem: 5 },
                { id: 'TI3501', block: 5, name: 'Fundamentos De Sistemas Operativos', cred: 3, hrs: 9, reqs: ['TI2201', 'TI2404'], coreqs: [], userSem: 5 },
                { id: 'TI5100', block: 5, name: 'Gestión Y Toma De Decisiones Financieras', cred: 3, hrs: 4, reqs: ['TI4101', 'TI4200'], coreqs: [], userSem: 5 },
                { id: 'TI5501', block: 5, name: 'Diseño De Software', cred: 3, hrs: 4, reqs: ['TI2201', 'TI4500'], coreqs: [], userSem: 5 },
                // BLOQUE 6 
                { id: 'CS2304', block: 6, name: 'Derecho Laboral', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 6 },
                { id: 'TI3601', block: 6, name: 'Modelo De Toma De Decisiones', cred: 2, hrs: 6, reqs: ['MA3405', 'TI5100'], coreqs: [], userSem: 6 },
                { id: 'TI3602', block: 6, name: 'Producción, Logística Y Calidad', cred: 2, hrs: 6, reqs: ['MA3405', 'TI5100'], coreqs: [], userSem: 6 },
                { id: 'TI3603', block: 6, name: 'Calidad En Sistemas De Información', cred: 3, hrs: 9, reqs: ['TI3801', 'TI5501'], coreqs: [], userSem: 6 },
                { id: 'TI3604', block: 6, name: 'Fundamentos De Redes', cred: 3, hrs: 9, reqs: ['TI3501'], coreqs: [], userSem: 6 },
                { id: 'TI6900', block: 6, name: 'Inteligencia De Negocios', cred: 3, hrs: 9, reqs: ['TI4601'], coreqs: [], userSem: 6 },
                { id: 'TI9003', block: 6, name: 'Computación Y Sociedad', cred: 2, hrs: 4, reqs: ['CS3404', 'TI1201'], coreqs: [], userSem: 6 },
                // BLOQUE 7 
                { id: 'CS3405', block: 7, name: 'Derecho Informático Y Mercantil', cred: 3, hrs: 9, reqs: ['TI1201'], coreqs: [], userSem: 7 },
                { id: 'TI4701', block: 7, name: 'Seguridad En Sistemas De Información', cred: 3, hrs: 9, reqs: ['TI3604'], coreqs: [], userSem: 7 },
                { id: 'TI5000', block: 7, name: 'Electiva 1', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 7 },
                { id: 'TI7503', block: 7, name: 'Arquitectura De Aplicaciones', cred: 3, hrs: 9, reqs: ['TI3604', 'TI5501'], coreqs: [], userSem: 7 },
                { id: 'TI7901', block: 7, name: 'Negocios Electrónicos', cred: 3, hrs: 4, reqs: ['TI3603', 'TI6900'], coreqs: [], userSem: 7 },
                { id: 'TI8109', block: 7, name: 'Formulación Y Evaluación De Proyectos De Ti', cred: 3, hrs: 4, reqs: ['TI3500', 'TI3601'], coreqs: [], userSem: 7 },
                // BLOQUE 8 
                { id: 'TI6000', block: 8, name: 'Electiva 2', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 8 },
                { id: 'TI8902', block: 8, name: 'Adquisición De Ti', cred: 3, hrs: 4, reqs: ['TI7503', 'TI8109'], coreqs: [], userSem: 8 },
                { id: 'TI8904', block: 8, name: 'Administración De Procesos De Negocios', cred: 3, hrs: 9, reqs: ['TI7503'], coreqs: [], userSem: 8 },
                { id: 'TI8905', block: 8, name: 'Administración De Servicios De Tecnologías De Información I', cred: 3, hrs: 9, reqs: ['TI4701', 'TI7901'], coreqs: [], userSem: 8 },
                { id: 'TI9805', block: 8, name: 'Auditoría De Ti', cred: 3, hrs: 4, reqs: ['TI4701'], coreqs: [], userSem: 8 },
                { id: 'TI9905', block: 8, name: 'Sistemas De Información Empresarial', cred: 3, hrs: 4, reqs: ['TI7901'], coreqs: [], userSem: 8 },
                // BLOQUE 9 
                { id: 'TI5901', block: 9, name: 'Espíritu Emprendedor Y Creación De Empresas', cred: 3, hrs: 13, reqs: ['TI8109'], coreqs: [], userSem: 9 },
                { id: 'TI5902', block: 9, name: 'Analítica Empresarial', cred: 3, hrs: 9, reqs: ['TI9905'], coreqs: [], userSem: 9 },
                { id: 'TI5903', block: 9, name: 'Planificación Estratégica De Tecnología De Información', cred: 3, hrs: 9, reqs: ['TI8902'], coreqs: [], userSem: 9 },
                { id: 'TI5904', block: 9, name: 'Investigación En Sistemas De Información', cred: 3, hrs: 9, reqs: ['TI8904', 'TI9905'], coreqs: [], userSem: 9 },
                { id: 'TI5905', block: 9, name: 'Fundamentos De Arquitectura Empresarial', cred: 3, hrs: 9, reqs: ['TI8904'], coreqs: [], userSem: 9 },
                { id: 'TI9004', block: 9, name: 'Administración De Servicios De Tecnologías De Información II', cred: 3, hrs: 9, reqs: ['TI8905'], coreqs: [], userSem: 9 },
                // BLOQUE 10
                { id: 'TI9000', block: 10, name: 'Trabajo Final De Graduación', cred: 10, hrs: 0, reqs: ['TI5901', 'TI5902', 'TI5903', 'TI5904', 'TI5905', 'TI9004'], coreqs: [], userSem: 10 }
            ],
            ambiental: [
              // BLOQUE 0 
              { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
              { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
          
              // BLOQUE 1 
              { id: 'AI1100', block: 1, name: 'Introducción A La Ingeniería Ambiental', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
              { id: 'BI1106', block: 1, name: 'Laboratorio De Biología General Para Ingeniería Ambiental', cred: 1, hrs: 3, reqs: [], coreqs: ['BI1107'], userSem: 1 },
              { id: 'BI1107', block: 1, name: 'Biología Para Ingeniería Ambiental', cred: 3, hrs: 9, reqs: [], coreqs: ['BI1106'], userSem: 1 },
              { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
              { id: 'CI1230', block: 1, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 1 },
              { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
              { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
              { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
              { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
          
              // BLOQUE 2 
              { id: 'AI2101', block: 2, name: 'Análisis Estadístico Para Ingeniería Ambiental', cred: 3, hrs: 9, reqs: ['MA0101'], coreqs: [], userSem: 2 },
              { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
              { id: 'CI1231', block: 2, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 2 },
              { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
              { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['FI1201', 'MA1102'], userSem: 2 },
              { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
              { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
              { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },
              { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
          
              // BLOQUE 3 
              { id: 'AI3104', block: 3, name: 'Ecosaneamiento Ambiental', cred: 1, hrs: 3, reqs: ['BI1107'], coreqs: [], userSem: 3 },
              { id: 'CA2125', block: 3, name: 'Elementos De Computación', cred: 3, hrs: 4, reqs: ['AI1100'], coreqs: [], userSem: 3 },
              { id: 'FI2103', block: 3, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 3 },
              { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
              { id: 'QU2604', block: 3, name: 'Química Ambiental Y Analítica', cred: 3, hrs: 9, reqs: ['QU1107'], coreqs: ['QU2605'], userSem: 3 },
              { id: 'QU2605', block: 3, name: 'Laboratorio De Química Ambiental Y Analítica', cred: 3, hrs: 9, reqs: ['AI2101', 'QU1104'], coreqs: ['QU2604'], userSem: 3 },
              { id: 'SE1100', block: 3, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },
          
              // BLOQUE 4 
              { id: 'AI2401', block: 4, name: 'Análisis Topográfico En Ingeniería Ambiental', cred: 3, hrs: 9, reqs: ['MA1102'], coreqs: [], userSem: 4 },
              { id: 'AI3208', block: 4, name: 'Hidráulica Para Ingeniería Ambiental', cred: 3, hrs: 9, reqs: ['FI2103'], coreqs: [], userSem: 4 },
              { id: 'AI3212', block: 4, name: 'Termodinámica Y Cinética Ambiental', cred: 4, hrs: 12, reqs: ['FI2103', 'QU1107'], coreqs: [], userSem: 4 },
              { id: 'CS2101', block: 4, name: 'Ambiente Humano', cred: 2, hrs: 6, reqs: ['CS1502'], coreqs: [], userSem: 4 },
              { id: 'CS4108', block: 4, name: 'Derecho Ambiental', cred: 1, hrs: 3, reqs: ['AI3104'], coreqs: [], userSem: 4 },
              { id: 'QU2409', block: 4, name: 'Química Orgánica Y Bioquímica', cred: 3, hrs: 9, reqs: ['QU1107'], coreqs: ['QU2410'], userSem: 4 },
              { id: 'QU2410', block: 4, name: 'Laboratorio De Química Orgánica Y Bioquímica', cred: 2, hrs: 6, reqs: ['QU1104'], coreqs: ['QU2409'], userSem: 4 },
          
              // BLOQUE 5 
              { id: 'AI3105', block: 5, name: 'Laboratorio De Microbiología Ambiental', cred: 2, hrs: 6, reqs: ['QU2410'], coreqs: ['AI3106'], userSem: 5 },
              { id: 'AI3106', block: 5, name: 'Microbiología Ambiental', cred: 3, hrs: 9, reqs: ['QU2409'], coreqs: ['AI3105'], userSem: 5 },
              { id: 'AI3107', block: 5, name: 'Operaciones Unitarias', cred: 3, hrs: 9, reqs: ['AI3208', 'QU2604'], coreqs: [], userSem: 5 },
              { id: 'AI3108', block: 5, name: 'Dibujo E Interpretación De Planos', cred: 3, hrs: 9, reqs: ['AI2401'], coreqs: [], userSem: 5 },
              { id: 'FO3401', block: 5, name: 'Sistemas De Información Geográfica', cred: 3, hrs: 4, reqs: ['AI2401'], coreqs: [], userSem: 5 },
              { id: 'MA2104', block: 5, name: 'Cálculo Superior', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
          
              // BLOQUE 6 
              { id: 'AI3109', block: 6, name: 'Laboratorio De Tratamiento De Agua Potable Y Residual', cred: 2, hrs: 6, reqs: ['AI3105'], coreqs: ['AI3110', 'AI3112'], userSem: 6 },
              { id: 'AI3110', block: 6, name: 'Diseño De Sistemas De Potabilización De Agua', cred: 3, hrs: 9, reqs: ['AI3107', 'AI3108'], coreqs: ['AI3109'], userSem: 6 },
              { id: 'AI3111', block: 6, name: 'Administración De Proyectos De Infraestructura Ambiental', cred: 3, hrs: 9, reqs: ['AI3108', 'CS2101'], coreqs: [], userSem: 6 },
              { id: 'AI3112', block: 6, name: 'Diseño Y Tratamiento De Aguas Residuales', cred: 3, hrs: 9, reqs: ['AI3106', 'QU2604'], coreqs: ['AI3109'], userSem: 6 },
              { id: 'AI3209', block: 6, name: 'Hidrología', cred: 3, hrs: 9, reqs: ['FO3401'], coreqs: [], userSem: 6 },
              { id: 'MA2105', block: 6, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 6 },
              { id: 'SE1200', block: 6, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 6 },
          
              // BLOQUE 7 
              { id: 'AE5121', block: 7, name: 'Ingeniería Económica', cred: 3, hrs: 3, reqs: ['AI3111'], coreqs: [], userSem: 7 },
              { id: 'AI4101', block: 7, name: 'Gestión Y Diseño En Tratamiento De Residuos Sólidos', cred: 3, hrs: 9, reqs: ['AI3112'], coreqs: [], userSem: 7 },
              { id: 'AI4102', block: 7, name: 'Ingeniería En Emisiones Atmosféricas', cred: 3, hrs: 4, reqs: ['AI3107', 'AI3212'], coreqs: ['AI4103'], userSem: 7 },
              { id: 'AI4103', block: 7, name: 'Laboratorio De Ingeniería En Emisiones Atmosféricas', cred: 2, hrs: 6, reqs: [], coreqs: ['AI4102'], userSem: 7 },
              { id: 'AI4104', block: 7, name: 'Administración De La Energía En La Industria', cred: 3, hrs: 9, reqs: ['AI3212'], coreqs: ['AE5121'], userSem: 7 },
              { id: 'MA3106', block: 7, name: 'Métodos Numéricos', cred: 4, hrs: 4, reqs: ['CA2125', 'MA2105'], coreqs: [], userSem: 7 },
              { id: 'SE1400', block: 7, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 7 },
          
              // BLOQUE 8 
              { id: 'AE4208', block: 8, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: ['AE5121'], coreqs: [], userSem: 8 },
              { id: 'AI5104', block: 8, name: 'Análisis Y Diseño Experimental Para Ingeniería Ambiental', cred: 3, hrs: 9, reqs: ['MA3106'], coreqs: [], userSem: 8 },
              { id: 'AI5105', block: 8, name: 'Consumo Y Producción Sostenible', cred: 3, hrs: 9, reqs: ['AI4101'], coreqs: ['AI5106'], userSem: 8 },
              { id: 'AI5106', block: 8, name: 'Gestión Ambiental', cred: 3, hrs: 9, reqs: ['AI4102', 'AI4104'], coreqs: ['AI5105'], userSem: 8 },
              { id: 'AI5107', block: 8, name: 'Mecánica De Suelos Para Ingeniería Ambiental', cred: 3, hrs: 9, reqs: ['AI3209', 'AI3212'], coreqs: [], userSem: 8 },
              { id: 'CS3404', block: 8, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['AI3111'], coreqs: [], userSem: 8 },
          
              // BLOQUE 9 
              { id: 'AI4304', block: 9, name: 'Formulación Y Evaluación De Proyectos Ambientales', cred: 3, hrs: 3, reqs: ['AE5121', 'AI5106'], coreqs: [], userSem: 9 },
              { id: 'AI5903', block: 9, name: 'Práctica Profesional', cred: 4, hrs: 0, reqs: ['AE4208', 'AE5121', 'AI1100', 'AI2101', 'AI3104', 'AI3105', 'AI3106', 'AI3107', 'AI3108', 'AI3109', 'AI3110', 'AI3111', 'AI3112', 'AI3208', 'AI3209', 'AI3212', 'AI4101', 'AI4102', 'AI4103', 'AI4104', 'AI5104', 'AI5105', 'AI5106', 'AI5107', 'BI1106', 'BI1107', 'CA2125', 'CI1106', 'CI1107', 'CI1230', 'CI1231', 'CS1502', 'CS2101', 'CS3404', 'CS4108', 'FH1000', 'FI1101', 'FI1201', 'FI2103', 'FO3401', 'MA0101', 'MA1102', 'MA1103', 'MA2104', 'MA2105', 'MA3106', 'QU1102', 'QU1104', 'QU1106', 'QU1107', 'QU2409', 'QU2410', 'QU2604', 'QU2605', 'SE1100', 'SE1200', 'SE1400'], coreqs: [], userSem: 9 },
              { id: 'AI6101', block: 9, name: 'Metodología De La Investigación Ambiental', cred: 3, hrs: 9, reqs: ['AI5104'], coreqs: ['AI6102'], userSem: 9 },
              { id: 'AI6102', block: 9, name: 'Huellas Y Métricas Ambientales', cred: 3, hrs: 9, reqs: ['AI5105'], coreqs: [], userSem: 9 },
              { id: 'AI6103', block: 9, name: 'Electiva I', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 9 },
              { id: 'CS2404', block: 9, name: 'Seminario De Problemática Urbana', cred: 1, hrs: 2, reqs: ['AI5106'], coreqs: [], userSem: 9 },
          
              // BLOQUE 10 
              { id: 'AI6104', block: 10, name: 'Seguridad Y Salud Ocupacional En Ingeniería Ambiental', cred: 3, hrs: 9, reqs: ['AI4104'], coreqs: [], userSem: 10 },
              { id: 'AI6105', block: 10, name: 'Evaluación De Impacto Ambiental', cred: 3, hrs: 9, reqs: ['AI6102'], coreqs: [], userSem: 10 },
              { id: 'AI6106', block: 10, name: 'Proyecto De Graduación', cred: 8, hrs: 24, reqs: ['AE4208', 'AE5121', 'AI1100', 'AI2101', 'AI3104', 'AI3105', 'AI3106', 'AI3107', 'AI3108', 'AI3109', 'AI3110', 'AI3111', 'AI3112', 'AI3208', 'AI3209', 'AI3212', 'AI4101', 'AI4102', 'AI4103', 'AI4104', 'AI4304', 'AI5104', 'AI5105', 'AI5106', 'AI5107', 'AI5903', 'AI6101', 'AI6102', 'AI6103', 'BI1106', 'BI1107', 'CA2125', 'CI1106', 'CI1107', 'CI1230', 'CI1231', 'CS1502', 'CS2101', 'CS2404', 'CS3404','CS4108', 'FH1000', 'FI1101', 'FI1201', 'FI2103', 'FO3401', 'MA0101', 'MA1102', 'MA1103', 'MA2104', 'MA2105', 'MA3106', 'QU1102', 'QU1104', 'QU1106', 'QU1107', 'QU2409', 'QU2410', 'QU2604', 'QU2605', 'SE1100', 'SE1200', 'SE1400'], coreqs: [], userSem: 10 }
          ],
            diseno: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'ID1101', block: 1, name: 'Análisis De Producto I', cred: 2, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'ID1102', block: 1, name: 'Teoría Del Diseño I', cred: 3, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'ID1103', block: 1, name: 'Métodos De Desarrollo De Productos', cred: 2, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'ID1201', block: 1, name: 'Representación I', cred: 3, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'ID1104', block: 2, name: 'Análisis De Producto II', cred: 2, hrs: 2, reqs: ['ID1101', 'ID1103'], coreqs: [], userSem: 2 },
                { id: 'ID1105', block: 2, name: 'Teoría Del Diseño II', cred: 3, hrs: 6, reqs: ['ID1102'], coreqs: [], userSem: 2 },
                { id: 'ID1202', block: 2, name: 'Representación II', cred: 3, hrs: 6, reqs: ['ID1201'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },

                // BLOQUE 3
                { id: 'FI2103', block: 3, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 3 },
                { id: 'ID2106', block: 3, name: 'Teoría Del Diseño III', cred: 3, hrs: 6, reqs: ['ID1105'], coreqs: [], userSem: 3 },
                { id: 'ID2203', block: 3, name: 'Representación III', cred: 3, hrs: 6, reqs: ['CI1107', 'ID1202'], coreqs: [], userSem: 3 },
                { id: 'ID2301', block: 3, name: 'Principios Estructurales', cred: 2, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 3 },
                { id: 'ID2401', block: 3, name: 'Ergonomía', cred: 2, hrs: 3, reqs: ['ID1202'], coreqs: [], userSem: 3 },
                { id: 'QU1902', block: 3, name: 'Fundamentos De Química', cred: 4, hrs: 5, reqs: [], coreqs: [], userSem: 3 },

                // BLOQUE 4
                { id: 'CI1230', block: 4, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 4 },
                { id: 'ID2107', block: 4, name: 'Diseño I', cred: 4, hrs: 3, reqs: ['FI2103', 'ID1104'], coreqs: ['ID2108'], userSem: 4 },
                { id: 'ID2108', block: 4, name: 'Diseño II', cred: 4, hrs: 3, reqs: ['ID2106', 'ID2401'], coreqs: ['ID2107', 'ID2302'], userSem: 4 },
                { id: 'ID2204', block: 4, name: 'Herramientas Digitales Para Diseño', cred: 2, hrs: 3, reqs: ['ID2203'], coreqs: [], userSem: 4 },
                { id: 'ID2302', block: 4, name: 'Procesos De Manufactura I', cred: 2, hrs: 3, reqs: ['ID2301', 'QU1902'], coreqs: ['ID2108'], userSem: 4 },
                { id: 'MA2117', block: 4, name: 'Cálculo Y Geometría Analítica', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 4 },
                { id: 'SE1100', block: 4, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },

                // BLOQUE 5
                { id: 'CI1231', block: 5, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 5 },
                { id: 'ID3109', block: 5, name: 'Diseño III', cred: 4, hrs: 3, reqs: ['ID2107', 'ID2301'], coreqs: ['ID3110'], userSem: 5 },
                { id: 'ID3110', block: 5, name: 'Diseño IV', cred: 4, hrs: 3, reqs: ['ID2108', 'ID2204'], coreqs: ['ID3109', 'ID3303'], userSem: 5 },
                { id: 'ID3205', block: 5, name: 'Cultura Material', cred: 3, hrs: 3, reqs: ['ID2108'], coreqs: [], userSem: 5 },
                { id: 'ID3303', block: 5, name: 'Procesos De Manufactura II', cred: 2, hrs: 3, reqs: ['ID2302', 'MA2117'], coreqs: ['ID3110'], userSem: 5 },
                { id: 'PI2608', block: 5, name: 'Análisis Estadístico', cred: 3, hrs: 4, reqs: ['MA2117'], coreqs: [], userSem: 5 },
                { id: 'SE1200', block: 5, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 5 },

                // BLOQUE 6
                { id: 'CA2125', block: 6, name: 'Elementos De Computación', cred: 3, hrs: 4, reqs: ['ID2204'], coreqs: [], userSem: 6 },
                { id: 'ID3111', block: 6, name: 'Diseño V', cred: 4, hrs: 3, reqs: ['ID3109', 'ID3205'], coreqs: ['ID3112'], userSem: 6 },
                { id: 'ID3112', block: 6, name: 'Diseño VI', cred: 4, hrs: 3, reqs: ['ID3110'], coreqs: ['ID3111', 'ID3304'], userSem: 6 },
                { id: 'ID3113', block: 6, name: 'Biónica Y Eco-Diseño', cred: 3, hrs: 3, reqs: ['ID3109'], coreqs: [], userSem: 6 },
                { id: 'ID3304', block: 6, name: 'Procesos De Manufactura III', cred: 2, hrs: 3, reqs: ['ID3303', 'PI2608'], coreqs: ['ID3112'], userSem: 6 },
                { id: 'SE1400', block: 6, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 6 },

                // BLOQUE 7
                { id: 'AE3414', block: 7, name: 'Fundamentos De Mercadeo', cred: 3, hrs: 9, reqs: ['PI2608'], coreqs: [], userSem: 7 },
                { id: 'AE4121', block: 7, name: 'Ingeniería Económica', cred: 3, hrs: 3, reqs: ['CA2125', 'ID3304'], coreqs: [], userSem: 7 },
                { id: 'CS3401', block: 7, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS1502'], coreqs: [], userSem: 7 },
                { id: 'FH1000', block: 7, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 7 },
                { id: 'ID4501', block: 7, name: 'Diseño De Productos VII', cred: 5, hrs: 4, reqs: ['ID3111'], coreqs: ['ID4601'], userSem: 7 },
                { id: 'ID4601', block: 7, name: 'Diseño De Comunicación Visual VII', cred: 5, hrs: 4, reqs: ['ID3112'], coreqs: ['ID4501'], userSem: 7 },

                // BLOQUE 8
                { id: 'CS4402', block: 8, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3401'], coreqs: [], userSem: 8 },
                { id: 'ID4503', block: 8, name: 'Diseño VIII (Proyecto De Graduación)', cred: 10, hrs: 30, reqs: ['ID4501', 'ID4601'], coreqs: [], userSem: 8 },

                // BLOQUE 9
                { id: 'CE5507', block: 9, name: 'Modelación Hardware/Software Con Orientación A Objetos', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 9 },
                { id: 'ID5513', block: 9, name: 'Curso Electivo I', cred: 3, hrs: 4, reqs: ['ID4503'], coreqs: [], userSem: 9 },
                { id: 'ID5604', block: 9, name: 'Manufactura De Empaque / Embalaje', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 9 },
                { id: 'ID5605', block: 9, name: 'Diseño IX (Comunicación Visual)', cred: 5, hrs: 4, reqs: ['ID4503'], coreqs: [], userSem: 9 },
                { id: 'ID5606', block: 9, name: 'Seminario De Investigación (Comunicación Visual)', cred: 3, hrs: 4, reqs: [], coreqs: ['ID5605'], userSem: 9 },

                // BLOQUE 10
                { id: 'ID5114', block: 10, name: 'Gestión De Proyectos', cred: 2, hrs: 2, reqs: ['AE3414', 'AE4121'], coreqs: [], userSem: 10 },
                { id: 'ID5115', block: 10, name: 'Innovación De Productos', cred: 2, hrs: 2, reqs: ['ID5513'], coreqs: [], userSem: 10 },
                { id: 'ID5510', block: 10, name: 'Teoría De Las Interfases E Interactividad', cred: 4, hrs: 4, reqs: ['ID5605'], coreqs: [], userSem: 10 },
                { id: 'ID5514', block: 10, name: 'Curso Electivo II', cred: 3, hrs: 4, reqs: ['ID5513'], coreqs: [], userSem: 10 },
                { id: 'ID5602', block: 10, name: 'Teoría Del Diseño De La Información', cred: 2, hrs: 4, reqs: ['ID5604'], coreqs: [], userSem: 10 },
                { id: 'ID5611', block: 10, name: 'Trabajo Final De Graduación (Comunicación Visual)', cred: 7, hrs: 30, reqs: ['ID5605', 'ID5606'], coreqs: [], userSem: 10 }
],
            computadores: [
                // BLOQUE 0
                { id: 'CI0205', block: 0, name: 'Prueba Avanzada Inglés', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'MA0101', block: 0, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'CE1101', block: 1, name: 'Introducción A La Programación', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CE1104', block: 1, name: 'Fundamentos De Sistemas Computacionales', cred: 3, hrs: 9, reqs: [], coreqs: ['CE1101'], userSem: 1 },
                { id: 'MA1102', block: 1, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 1 },
                { id: 'MA1403', block: 1, name: 'Matemática Discreta', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2
                { id: 'CE1103', block: 2, name: 'Algoritmos Y Estructuras De Datos I', cred: 4, hrs: 12, reqs: ['CE1101', 'CE1104', 'MA1403'], coreqs: [], userSem: 2 },
                { id: 'CE1105', block: 2, name: 'Principios De Modelado En Ingeniería', cred: 3, hrs: 9, reqs: ['CE1104'], coreqs: [], userSem: 2 },
                { id: 'CI1407', block: 2, name: 'Habilidades De Comunicación En Ingeniería', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CS1502', block: 2, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'MA1103', block: 2, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 2 },
                { id: 'SE1400', block: 2, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },

                // BLOQUE 3
                { id: 'CE2103', block: 3, name: 'Algoritmos Y Estructuras De Datos II', cred: 4, hrs: 12, reqs: ['CE1103', 'CE1105'], coreqs: [], userSem: 3 },
                { id: 'CS2101', block: 3, name: 'Ambiente Humano', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 3 },
                { id: 'EL2113', block: 3, name: 'Circuitos Eléctricos En Corriente Continua', cred: 4, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 3 },
                { id: 'FH1000', block: 3, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },
                { id: 'FI1102', block: 3, name: 'Física General II', cred: 3, hrs: 4, reqs: ['FI1101'], coreqs: ['MA1102'], userSem: 3 },
                { id: 'FI1202', block: 3, name: 'Laboratorio Física General II', cred: 1, hrs: 2, reqs: ['FI1201'], coreqs: ['FI1102'], userSem: 3 },
                { id: 'MA2104', block: 3, name: 'Cálculo Superior', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 3 },

                // BLOQUE 4
                { id: 'CE1106', block: 4, name: 'Paradigmas De Programación', cred: 3, hrs: 9, reqs: ['CE2103'], coreqs: [], userSem: 4 },
                { id: 'CE2201', block: 4, name: 'Laboratorio De Circuitos Eléctricos', cred: 1, hrs: 3, reqs: ['FI1202'], coreqs: [], userSem: 4 },
                { id: 'EL2114', block: 4, name: 'Circuitos Eléctricos En Corriente Alterna', cred: 4, hrs: 4, reqs: ['EL2113'], coreqs: ['EL2207'], userSem: 4 },
                { id: 'EL2207', block: 4, name: 'Elementos Activos', cred: 4, hrs: 4, reqs: ['EL2113'], coreqs: [], userSem: 4 },
                { id: 'PI2609', block: 4, name: 'Probabilidad Y Estadística', cred: 2, hrs: 3, reqs: ['MA2104'], coreqs: [], userSem: 4 },
                { id: 'SO4604', block: 4, name: 'Seguridad Y Salud Ocupacional', cred: 3, hrs: 3, reqs: ['FI1102'], coreqs: [], userSem: 4 },
                // BLOQUE 5
                { id: 'CE1107', block: 5, name: 'Fundamentos De Arquitectura De Computadores', cred: 4, hrs: 12, reqs: ['EL2207'], coreqs: [], userSem: 5 },
                { id: 'CE3101', block: 5, name: 'Bases De Datos', cred: 4, hrs: 12, reqs: ['CE1106'], coreqs: [], userSem: 5 },
                { id: 'CE3201', block: 5, name: 'Taller De Diseño Digital', cred: 2, hrs: 6, reqs: ['CE2201'], coreqs: ['CE1107'], userSem: 5 },
                { id: 'MA2105', block: 5, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'PI5516', block: 5, name: 'Ingeniería Económica', cred: 3, hrs: 4, reqs: ['PI2609'], coreqs: [], userSem: 5 },

                // BLOQUE 6
                { id: 'CE1108', block: 6, name: 'Compiladores E Intérpretes', cred: 4, hrs: 12, reqs: ['CE1107'], coreqs: ['CE4301'], userSem: 6 },
                { id: 'CE1109', block: 6, name: 'Circuitos Analógicos', cred: 4, hrs: 12, reqs: ['EL2207', 'SO4604'], coreqs: [], userSem: 6 },
                { id: 'CE1110', block: 6, name: 'Análisis De Señales Mixtas', cred: 4, hrs: 12, reqs: ['EL2114', 'MA2105'], coreqs: [], userSem: 6 },
                { id: 'CE4301', block: 6, name: 'Arquitectura De Computadores I', cred: 4, hrs: 12, reqs: ['CE1107', 'CE3201'], coreqs: [], userSem: 6 },
                { id: 'CI3203', block: 6, name: 'Inglés Especializado Para Ingenierías En Computadores', cred: 2, hrs: 6, reqs: ['CI0205'], coreqs: [], userSem: 6 },

                // BLOQUE 7
                { id: 'CE1111', block: 7, name: 'Análisis Numérico Para La Ingeniería', cred: 3, hrs: 9, reqs: ['MA2105'], coreqs: [], userSem: 7 },
                { id: 'CE1112', block: 7, name: 'Taller De Señales Mixtas', cred: 3, hrs: 9, reqs: ['CE1109', 'CE1110'], coreqs: [], userSem: 7 },
                { id: 'CE1116', block: 7, name: 'Diseño Y Calidad En Productos Tecnológicos', cred: 4, hrs: 12, reqs: ['CE3101', 'CE4301', 'PI5516'], coreqs: [], userSem: 7 },
                { id: 'CE4302', block: 7, name: 'Arquitectura De Computadores II', cred: 4, hrs: 12, reqs: ['CE4301'], coreqs: ['CE4303'], userSem: 7 },
                { id: 'CE4303', block: 7, name: 'Principios De Sistemas Operativos', cred: 4, hrs: 12, reqs: ['CE1108'], coreqs: [], userSem: 7 },

                // BLOQUE 8
                { id: 'AE4208', block: 8, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: ['CS2101'], coreqs: [], userSem: 8 },
                { id: 'CE1113', block: 8, name: 'Sistemas Empotrados', cred: 3, hrs: 9, reqs: ['CE4303'], coreqs: [], userSem: 8 },
                { id: 'CE5301', block: 8, name: 'Redes De Computadores', cred: 4, hrs: 12, reqs: ['CE1116', 'CE4303'], coreqs: [], userSem: 8 },
                { id: 'CE5701', block: 8, name: 'Electiva I', cred: 3, hrs: 9, reqs: ['CE4302', 'CI3203'], coreqs: [], userSem: 8 },
                { id: 'CS3404', block: 8, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['CS2101'], coreqs: [], userSem: 8 },

                // BLOQUE 9
                { id: 'CE1114', block: 9, name: 'Proyecto De Aplicación De La Ingeniería En Computadores', cred: 4, hrs: 12, reqs: ['AE4208', 'CE1112', 'CE1113'], coreqs: [], userSem: 9 },
                { id: 'CE1115', block: 9, name: 'Seguridad De La Información', cred: 3, hrs: 9, reqs: ['CE5301'], coreqs: [], userSem: 9 },
                { id: 'CE1117', block: 9, name: 'Formulación Y Gestión De Proyectos', cred: 3, hrs: 9, reqs: ['CE5301'], coreqs: ['CE1114'], userSem: 9 },
                { id: 'CE5801', block: 9, name: 'Electiva II', cred: 3, hrs: 9, reqs: ['CE5701'], coreqs: [], userSem: 9 },
                { id: 'CE5901', block: 9, name: 'Electiva III', cred: 3, hrs: 9, reqs: ['CE5701'], coreqs: [], userSem: 9 },
                { id: 'CS4402', block: 9, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 9 },

                // BLOQUE 10
                { id: 'CE5601', block: 10, name: 'Trabajo Final De Graduación', cred: 12, hrs: 36, reqs: ['CE1111', 'CE1114', 'CE1115', 'CE1117', 'CE5801', 'CE5901', 'CS4402'], coreqs: [], userSem: 10 }
            ],
            mantenimiento: [
                // BLOQUE 0 
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                // BLOQUE 1 
                { id: 'CA2125', block: 1, name: 'Elementos De Computación', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1230', block: 1, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                // BLOQUE 2 
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'MI2101', block: 2, name: 'Dibujo Técnico', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'SE1100', block: 2, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                // BLOQUE 3 
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'CS2303', block: 3, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 3 },
                { id: 'FI1102', block: 3, name: 'Física General II', cred: 3, hrs: 4, reqs: ['FI1101', 'FI1201', 'MA1102'], coreqs: ['FI1202'], userSem: 3 },
                { id: 'FI1202', block: 3, name: 'Laboratorio Física General II', cred: 1, hrs: 2, reqs: ['FI1201'], coreqs: ['FI1102'], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'MI2106', block: 3, name: 'Estática', cred: 3, hrs: 4, reqs: ['FI1101', 'MI2101'], coreqs: [], userSem: 3 },
                { id: 'MI3103', block: 3, name: 'Procesos De Manufactura', cred: 3, hrs: 3, reqs: ['MI2101'], coreqs: ['MI3104'], userSem: 3 },
                { id: 'MI3104', block: 3, name: 'Laboratorio Procesos De Manufactura', cred: 2, hrs: 4, reqs: [], coreqs: ['MI3103'], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },
                // BLOQUE 4 
                { id: 'FH1000', block: 4, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },
                { id: 'FI2103', block: 4, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 4 },
                { id: 'MA2104', block: 4, name: 'Cálculo Superior', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'MI2202', block: 4, name: 'Laboratorio De Electricidad I', cred: 1, hrs: 2, reqs: [], coreqs: ['MI2205'], userSem: 4 },
                { id: 'MI2205', block: 4, name: 'Electricidad I', cred: 3, hrs: 9, reqs: ['FI1102', 'MA1103'], coreqs: ['MI2202'], userSem: 4 },
                { id: 'MI3117', block: 4, name: 'Dinámica', cred: 3, hrs: 4, reqs: ['MI2106'], coreqs: [], userSem: 4 },
                { id: 'MI3124', block: 4, name: 'Dibujo Industrial', cred: 4, hrs: 4, reqs: ['MI3104'], coreqs: [], userSem: 4 },
                // BLOQUE 5 
                { id: 'MA2105', block: 5, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'ME3208', block: 5, name: 'Tecnología De Materiales', cred: 2, hrs: 3, reqs: ['QU1107'], coreqs: ['ME3209'], userSem: 5 },
                { id: 'ME3209', block: 5, name: 'Laboratorio De Tecnología De Materiales', cred: 1, hrs: 2, reqs: [], coreqs: ['ME3208'], userSem: 5 },
                { id: 'MI2204', block: 5, name: 'Laboratorio De Electricidad II', cred: 1, hrs: 2, reqs: [], coreqs: ['MI2207'], userSem: 5 },
                { id: 'MI2207', block: 5, name: 'Electricidad II', cred: 4, hrs: 4, reqs: ['MI2202', 'MI2205'], coreqs: [], userSem: 5 },
                { id: 'MI3115', block: 5, name: 'Resistencia De Materiales', cred: 3, hrs: 4, reqs: ['MI2106', 'MI3124'], coreqs: [], userSem: 5 },
                { id: 'MI3130', block: 5, name: 'Termodinámica', cred: 4, hrs: 4, reqs: ['FI2103'], coreqs: [], userSem: 5 },
                // BLOQUE 6 
                { id: 'AE5121', block: 6, name: 'Ingeniería Económica', cred: 3, hrs: 3, reqs: [], coreqs: ['PI2609'], userSem: 6 },
                { id: 'CM4108', block: 6, name: 'Transferencia De Calor', cred: 3, hrs: 3, reqs: ['MI3130'], coreqs: [], userSem: 6 },
                { id: 'MI3108', block: 6, name: 'Mecánica De Fluidos', cred: 4, hrs: 4, reqs: ['MA2105', 'MI3117'], coreqs: [], userSem: 6 },
                { id: 'MI3111', block: 6, name: 'Laboratorio De Mecánica De Fluidos', cred: 1, hrs: 2, reqs: ['MI3130'], coreqs: ['MI3108'], userSem: 6 },
                { id: 'MI3206', block: 6, name: 'Laboratorio De Máquinas Eléctricas', cred: 1, hrs: 2, reqs: [], coreqs: ['MI3210'], userSem: 6 },
                { id: 'MI3210', block: 6, name: 'Máquinas Eléctricas', cred: 3, hrs: 9, reqs: ['MI2204', 'MI2207'], coreqs: ['MI3206'], userSem: 6 },
                { id: 'PI2609', block: 6, name: 'Probabilidad Y Estadística', cred: 2, hrs: 3, reqs: ['MA2104'], coreqs: [], userSem: 6 },
                // BLOQUE 7 
                { id: 'AE4208', block: 7, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: ['CS2303'], coreqs: [], userSem: 7 },
                { id: 'CM3207', block: 7, name: 'Métodos Numéricos Para Ingeniería', cred: 3, hrs: 4, reqs: ['PI2609'], coreqs: [], userSem: 7 },
                { id: 'MI3116', block: 7, name: 'Turbo Máquinas', cred: 4, hrs: 4, reqs: ['MI3108', 'MI3111'], coreqs: [], userSem: 7 },
                { id: 'MI3119', block: 7, name: 'Laboratorio De Turbomáquinas', cred: 1, hrs: 2, reqs: ['MI3111'], coreqs: ['MI3116'], userSem: 7 },
                { id: 'MI3209', block: 7, name: 'Electricidad III', cred: 3, hrs: 3, reqs: ['MI2207'], coreqs: [], userSem: 7 },
                { id: 'MI4300', block: 7, name: 'Administración Mantenimiento I', cred: 4, hrs: 4, reqs: ['AE5121', 'MI3210', 'PI2609'], coreqs: [], userSem: 7 },
                { id: 'MI4311', block: 7, name: 'Modelos Cuantitativos Para La Toma De Decisiones', cred: 3, hrs: 9, reqs: ['MA1103', 'PI2609'], coreqs: ['MI4300'], userSem: 7 },
                // BLOQUE 8 
                { id: 'CS3404', block: 8, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['CS2303'], coreqs: [], userSem: 8 },
                { id: 'MI4101', block: 8, name: 'Electiva I', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 8 },
                { id: 'MI4136', block: 8, name: 'Elementas De Máquinas', cred: 4, hrs: 5, reqs: ['MI3115', 'MI3119'], coreqs: [], userSem: 8 },
                { id: 'MI4209', block: 8, name: 'Control Eléctrico', cred: 3, hrs: 9, reqs: ['MI3209', 'MI3210'], coreqs: [], userSem: 8 },
                { id: 'MI4210', block: 8, name: 'Laboratorio De Control Eléctrico', cred: 1, hrs: 2, reqs: [], coreqs: ['MI4209'], userSem: 8 },
                { id: 'MI4305', block: 8, name: 'Administración De Mantenimiento II', cred: 3, hrs: 3, reqs: ['MI4300'], coreqs: [], userSem: 8 },
                { id: 'SO2601', block: 8, name: 'Fundamentos De Seguridad E Higiene Ocupacional', cred: 1, hrs: 2, reqs: ['AE4208'], coreqs: [], userSem: 8 },
                // BLOQUE 9 
                { id: 'CS4402', block: 9, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 9 },
                { id: 'MI4125', block: 9, name: 'Laboratorio De Sistemas De Vapor', cred: 1, hrs: 2, reqs: [], coreqs: ['MI4129'], userSem: 9 },
                { id: 'MI4129', block: 9, name: 'Sistemas De Vapor', cred: 3, hrs: 4, reqs: ['CM4108', 'MI3116', 'MI3119'], coreqs: [], userSem: 9 },
                { id: 'MI4212', block: 9, name: 'Instalaciones Eléctricas', cred: 4, hrs: 4, reqs: ['MI4209'], coreqs: [], userSem: 9 },
                { id: 'MI5102', block: 9, name: 'Electiva II', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 9 },
                { id: 'MI5215', block: 9, name: 'Análisis De Sistemas Eléctricos De Potencia', cred: 4, hrs: 4, reqs: [], coreqs: ['MI4212'], userSem: 9 },
                { id: 'MI6351', block: 9, name: 'Mantenimiento Predictivo', cred: 4, hrs: 4, reqs: ['MI4300'], coreqs: [], userSem: 9 },
                // BLOQUE 10
                { id: 'MI5521', block: 10, name: 'Trabajo Final De Graduación', cred: 12, hrs: 36, reqs: ['MI4305'], coreqs: [], userSem: 10 }
            ],
            produccion: [
                // BLOQUE 0 
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1 
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1230', block: 1, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MI2101', block: 1, name: 'Dibujo Técnico', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2 
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CI1231', block: 2, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },
                { id: 'PI3501', block: 2, name: 'Costos Industriales I', cred: 3, hrs: 3, reqs: ['CS1502', 'MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1107'], userSem: 2 },

                // BLOQUE 3 
                { id: 'CA2125', block: 3, name: 'Elementos De Computación', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 3 },
                { id: 'CS2101', block: 3, name: 'Ambiente Humano', cred: 2, hrs: 6, reqs: ['CI1107'], coreqs: [], userSem: 3 },
                { id: 'FI1102', block: 3, name: 'Física General II', cred: 3, hrs: 4, reqs: ['FI1101', 'FI1201', 'MA1102'], coreqs: ['FI1202'], userSem: 3 },
                { id: 'FI1202', block: 3, name: 'Laboratorio Física General II', cred: 1, hrs: 2, reqs: ['FI1201'], coreqs: ['FI1102'], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'PI3502', block: 3, name: 'Costos Industriales II', cred: 3, hrs: 3, reqs: ['PI3501'], coreqs: [], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },

                // BLOQUE 4 
                { id: 'CS2303', block: 4, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: ['CS2101'], coreqs: [], userSem: 4 },
                { id: 'FI2103', block: 4, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 4 },
                { id: 'MA2104', block: 4, name: 'Cálculo Superior', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'MI2109', block: 4, name: 'Estática', cred: 3, hrs: 9, reqs: ['FI1101', 'FI1201'], coreqs: [], userSem: 4 },
                { id: 'PI2304', block: 4, name: 'Estudio Del Trabajo I', cred: 3, hrs: 4, reqs: ['MI2101', 'PI3501'], coreqs: ['PI2610'], userSem: 4 },
                { id: 'PI2610', block: 4, name: 'Probabilidad Y Estadística I', cred: 3, hrs: 4, reqs: ['CA2125', 'MA1102'], coreqs: [], userSem: 4 },

                // BLOQUE 5 
                { id: 'CS3404', block: 5, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['CS2101'], coreqs: [], userSem: 5 },
                { id: 'MA2105', block: 5, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },
                { id: 'MI3138', block: 5, name: 'Máquinas Y Equipos', cred: 3, hrs: 4, reqs: ['MI2109'], coreqs: [], userSem: 5 },
                { id: 'PI3308', block: 5, name: 'Estudio Del Trabajo II', cred: 3, hrs: 4, reqs: ['PI2304'], coreqs: [], userSem: 5 },
                { id: 'PI3407', block: 5, name: 'Computación Industrial', cred: 3, hrs: 3, reqs: ['CA2125', 'CI1231'], coreqs: [], userSem: 5 },
                { id: 'PI3612', block: 5, name: 'Probabilidad Y Estadística II', cred: 3, hrs: 9, reqs: ['MA1103', 'PI2610'], coreqs: [], userSem: 5 },

                // BLOQUE 6 
                { id: 'CM3207', block: 6, name: 'Métodos Numéricos Para Ingeniería', cred: 3, hrs: 4, reqs: ['MA2105', 'PI3407'], coreqs: [], userSem: 6 },
                { id: 'ME2208', block: 6, name: 'Ciencias De Los Materiales', cred: 3, hrs: 3, reqs: ['FI1102', 'QU1107'], coreqs: [], userSem: 6 },
                { id: 'PI3206', block: 6, name: 'Logística Y Administración De La Cadena De Abastecimiento', cred: 3, hrs: 3, reqs: ['PI3612'], coreqs: ['PI3603'], userSem: 6 },
                { id: 'PI3403', block: 6, name: 'Sistema De Información', cred: 3, hrs: 3, reqs: ['PI3407'], coreqs: [], userSem: 6 },
                { id: 'PI3512', block: 6, name: 'Dirección De Personal', cred: 3, hrs: 4, reqs: ['CS2303', 'PI3308'], coreqs: [], userSem: 6 },
                { id: 'PI3603', block: 6, name: 'Investigación De Operaciones I', cred: 3, hrs: 4, reqs: ['MA2105'], coreqs: [], userSem: 6 },

                // BLOQUE 7 
                { id: 'PI4303', block: 7, name: 'Control De Producción', cred: 4, hrs: 4, reqs: ['PI3206', 'PI3603'], coreqs: [], userSem: 7 },
                { id: 'PI4306', block: 7, name: 'Metrología Y Normalización', cred: 3, hrs: 4, reqs: ['PI3308'], coreqs: ['PI4307'], userSem: 7 },
                { id: 'PI4307', block: 7, name: 'Control De Calidad', cred: 4, hrs: 4, reqs: ['PI3612'], coreqs: ['PI4306'], userSem: 7 },
                { id: 'PI4309', block: 7, name: 'Planeación Y Diseño De Instalaciones', cred: 3, hrs: 4, reqs: ['PI3308'], coreqs: [], userSem: 7 },
                { id: 'PI4505', block: 7, name: 'Análisis Económico', cred: 3, hrs: 4, reqs: ['PI3308', 'PI3502'], coreqs: [], userSem: 7 },

                // BLOQUE 8 
                { id: 'CS4402', block: 8, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3404'], coreqs: [], userSem: 8 },
                { id: 'PI4308', block: 8, name: 'Electiva I', cred: 3, hrs: 3, reqs: ['PI4303', 'PI4307'], coreqs: [], userSem: 8 },
                { id: 'PI4802', block: 8, name: 'Administración De Proyectos', cred: 3, hrs: 4, reqs: ['PI4303'], coreqs: [], userSem: 8 },
                { id: 'PI4803', block: 8, name: 'Gestión De La Innovación', cred: 3, hrs: 4, reqs: ['PI3512'], coreqs: [], userSem: 8 },
                { id: 'PI5707', block: 8, name: 'Ingeniería De La Confiabilidad', cred: 3, hrs: 4, reqs: ['PI4307'], coreqs: [], userSem: 8 },
                { id: 'SO4604', block: 8, name: 'Seguridad Y Salud Ocupacional', cred: 3, hrs: 3, reqs: ['PI3308'], coreqs: [], userSem: 8 },

                // BLOQUE 9 
                { id: 'PI5302', block: 9, name: 'Diseño De Experimentos', cred: 4, hrs: 4, reqs: ['PI5707'], coreqs: [], userSem: 9 },
                { id: 'PI5303', block: 9, name: 'Electiva II', cred: 3, hrs: 4, reqs: ['PI4308'], coreqs: [], userSem: 9 },
                { id: 'PI5401', block: 9, name: 'Simulación Industrial', cred: 4, hrs: 4, reqs: ['PI3206', 'PI5707'], coreqs: [], userSem: 9 },
                { id: 'PI5402', block: 9, name: 'Automatización De Manufactura', cred: 4, hrs: 3, reqs: ['MI3138', 'PI4306'], coreqs: [], userSem: 9 },
                { id: 'PI5601', block: 9, name: 'Diagnóstico Industrial', cred: 3, hrs: 4, reqs: ['PI4303', 'PI4802'], coreqs: [], userSem: 9 },

                // BLOQUE 10
                { id: 'PI5901', block: 10, name: 'Proyecto De Graduación', cred: 12, hrs: 40, reqs: ['CS4402', 'PI4308', 'PI5302', 'PI5303', 'PI5401', 'PI5402', 'PI5601', 'SO4604'], coreqs: [], userSem: 10 }
            ],
            administracion: [
                // BLOQUE 0
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                { id: 'MA0001', block: 0, name: 'Precálculo', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 0 },
            
                // BLOQUE 1
                { id: 'AE1105', block: 1, name: 'Introducción A La Administración', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'AE1106', block: 1, name: 'Legislación I', cred: 3, hrs: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA1101', block: 1, name: 'Matemática Para Administración I', cred: 4, hrs: 5, reqs: ['MA0001'], coreqs: [], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
            
                // BLOQUE 2
                { id: 'AE1208', block: 2, name: 'Contabilidad I', cred: 4, hrs: 4, reqs: ['AE1105'], coreqs: [], userSem: 2 },
                { id: 'AE2107', block: 2, name: 'Legislación II', cred: 3, hrs: 3, reqs: ['AE1106'], coreqs: [], userSem: 2 },
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0202'], coreqs: [], userSem: 2 },
                { id: 'MA2101', block: 2, name: 'Matemática Para Administración II', cred: 4, hrs: 4, reqs: ['MA1101'], coreqs: [], userSem: 2 },
                { id: 'SE1200', block: 2, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
            
                // BLOQUE 3
                { id: 'AE2108', block: 3, name: 'Contabilidad II', cred: 4, hrs: 4, reqs: ['AE1208'], coreqs: [], userSem: 3 },
                { id: 'AE2112', block: 3, name: 'Comportamiento Humano En La Organización', cred: 3, hrs: 4, reqs: ['AE1105'], coreqs: [], userSem: 3 },
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'MA2401', block: 3, name: 'Probabilidad Y Estadística I', cred: 4, hrs: 4, reqs: ['MA2101'], coreqs: [], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },
                { id: 'AE-EL1', block: 3, name: 'Electiva I', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 3 },
            
                // BLOQUE 4
                { id: 'AE2211', block: 4, name: 'Contabilidad De Costos I', cred: 4, hrs: 4, reqs: ['AE2108'], coreqs: [], userSem: 4 },
                { id: 'AE2212', block: 4, name: 'Administración Del Talento Humano', cred: 3, hrs: 4, reqs: ['AE2112'], coreqs: [], userSem: 4 },
                { id: 'MA3401', block: 4, name: 'Probabilidad Y Estadística II', cred: 4, hrs: 4, reqs: ['MA2401'], coreqs: [], userSem: 4 },
                { id: 'CS2101', block: 4, name: 'Ambiente Humano', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 4 },
                { id: 'AE-EL2', block: 4, name: 'Electiva II', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 4 },
            
                // BLOQUE 5
                { id: 'AE3111', block: 5, name: 'Contabilidad De Costos II', cred: 3, hrs: 4, reqs: ['AE2211'], coreqs: [], userSem: 5 },
                { id: 'AE3115', block: 5, name: 'Mercadeo I', cred: 3, hrs: 4, reqs: ['AE1105'], coreqs: [], userSem: 5 },
                { id: 'AE3117', block: 5, name: 'Finanzas I', cred: 4, hrs: 4, reqs: ['AE2108', 'MA2101'], coreqs: [], userSem: 5 },
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS2101'], coreqs: [], userSem: 5 },
                { id: 'AE-EL3', block: 5, name: 'Electiva III', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 5 },
            
                // BLOQUE 6
                { id: 'AE3215', block: 6, name: 'Mercadeo II', cred: 3, hrs: 4, reqs: ['AE3115'], coreqs: [], userSem: 6 },
                { id: 'AE3217', block: 6, name: 'Finanzas II', cred: 4, hrs: 4, reqs: ['AE3117'], coreqs: [], userSem: 6 },
                { id: 'AE3218', block: 6, name: 'Administración De La Producción I', cred: 4, hrs: 4, reqs: ['AE1105', 'MA3401'], coreqs: [], userSem: 6 },
                { id: 'AE4121', block: 6, name: 'Economía Para La Administración I', cred: 3, hrs: 4, reqs: ['MA2101'], coreqs: [], userSem: 6 },
                { id: 'CS4402', block: 6, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3401'], coreqs: [], userSem: 6 },
            
                // BLOQUE 7
                { id: 'AE4119', block: 7, name: 'Administración De La Producción II', cred: 4, hrs: 4, reqs: ['AE3218'], coreqs: [], userSem: 7 },
                { id: 'AE4221', block: 7, name: 'Economía Para La Administración II', cred: 3, hrs: 4, reqs: ['AE4121'], coreqs: [], userSem: 7 },
                { id: 'AE4225', block: 7, name: 'Sistemas De Información Administrativa', cred: 3, hrs: 4, reqs: ['AE1105'], coreqs: [], userSem: 7 },
                { id: 'AE4700', block: 7, name: 'Metodología De La Investigación', cred: 3, hrs: 9, reqs: ['MA3401'], coreqs: [], userSem: 7 },
                { id: 'AE-EL4', block: 7, name: 'Electiva IV', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 7 },
            
                // BLOQUE 8
                { id: 'AE4219', block: 8, name: 'Administración Estratégica', cred: 4, hrs: 4, reqs: ['AE3215', 'AE3217', 'AE4119'], coreqs: [], userSem: 8 },
                { id: 'AE5800', block: 8, name: 'Anteproyecto De Graduación', cred: 3, hrs: 9, reqs: ['AE4700'], coreqs: [], userSem: 8 },
                { id: 'AE-EL5', block: 8, name: 'Electiva V', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 8 },
                { id: 'AE-EL6', block: 8, name: 'Electiva VI', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 8 }
            ],
            electronica: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'CA2125', block: 1, name: 'Elementos De Computación', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'EL1100', block: 1, name: 'Introducción A La Ingeniería', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MI2101', block: 1, name: 'Dibujo Técnico', cred: 3, hrs: 9, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'SE1200', block: 1, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SO4604', block: 1, name: 'Seguridad Y Salud Ocupacional', cred: 3, hrs: 3, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2
                { id: 'CA3125', block: 2, name: 'Análisis Y Diseño De Algoritmos', cred: 3, hrs: 4, reqs: ['CA2125'], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'CI1407', block: 2, name: 'Habilidades De Comunicación En Ingeniería', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 2 },
                { id: 'EL1200', block: 2, name: 'Introducción A La Electrónica', cred: 0, hrs: 2, reqs: ['EL1100'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'FI1101', block: 2, name: 'Física General I', cred: 3, hrs: 4, reqs: [], coreqs: ['MA1102'], userSem: 2 },
                { id: 'FI1201', block: 2, name: 'Laboratorio Física General I', cred: 1, hrs: 2, reqs: [], coreqs: ['FI1101'], userSem: 2 },

                // BLOQUE 3
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'EL2113', block: 3, name: 'Circuitos Eléctricos En Corriente Continua', cred: 4, hrs: 4, reqs: ['EL1200', 'MA1102'], coreqs: ['FI1102'], userSem: 3 },
                { id: 'EL2110', block: 3, name: 'Laboratorio De Mediciones Eléctricas', cred: 1, hrs: 2, reqs: ['FI1201'], coreqs: ['EL2113'], userSem: 3 },
                { id: 'FI1102', block: 3, name: 'Física General II', cred: 3, hrs: 4, reqs: ['FI1101'], coreqs: [], userSem: 3 },
                { id: 'FI2103', block: 3, name: 'Física General III', cred: 3, hrs: 4, reqs: ['FI1101'], coreqs: [], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'SE1100', block: 3, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },

                // BLOQUE 4
                { id: 'CS2303', block: 4, name: 'Relaciones Laborales', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 4 },
                { id: 'EL2114', block: 4, name: 'Circuitos Eléctricos En Corriente Alterna', cred: 4, hrs: 4, reqs: ['EL2113', 'FI2103'], coreqs: [], userSem: 4 },
                { id: 'EL2111', block: 4, name: 'Laboratorio De Circuitos Eléctricos', cred: 1, hrs: 2, reqs: ['EL2110'], coreqs: ['EL2114'], userSem: 4 },
                { id: 'EL2207', block: 4, name: 'Elementos Activos', cred: 4, hrs: 4, reqs: ['EL2113'], coreqs: ['EL2114'], userSem: 4 },
                { id: 'MA2104', block: 4, name: 'Cálculo Superior', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'EL4702', block: 4, name: 'Probabilidad Y Estadística', cred: 3, hrs: 4, reqs: [], coreqs: ['MA2104'], userSem: 4 },
                { id: 'SE1400', block: 4, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },

                // BLOQUE 5
                { id: 'CM3207', block: 5, name: 'Métodos Numéricos Para Ingeniería', cred: 3, hrs: 4, reqs: ['CA3125'], coreqs: ['MA2105'], userSem: 5 },
                { id: 'CS3404', block: 5, name: 'Seminario De Ética Para La Ingeniería', cred: 2, hrs: 5, reqs: ['CS2303'], coreqs: [], userSem: 5 },
                { id: 'EL3212', block: 5, name: 'Circuitos Discretos', cred: 4, hrs: 12, reqs: ['EL2114', 'EL2207'], coreqs: ['EL3215'], userSem: 5 },
                { id: 'EL3215', block: 5, name: 'Laboratorio De Electrónica Analógica', cred: 1, hrs: 2, reqs: ['EL2111'], coreqs: ['EL3212'], userSem: 5 },
                { id: 'EL3307', block: 5, name: 'Diseño Lógico', cred: 4, hrs: 4, reqs: ['CA3125', 'EL2207'], coreqs: [], userSem: 5 },
                { id: 'MA2105', block: 5, name: 'Ecuaciones Diferenciales', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 5 },

                // BLOQUE 6 
                { id: 'EL3216', block: 6, name: 'Circuitos Integrados Analógicos', cred: 3, hrs: 4, reqs: ['EL3212'], coreqs: [], userSem: 6 },
                { id: 'EL3310', block: 6, name: 'Diseño De Sistemas Digitales', cred: 4, hrs: 4, reqs: ['EL3307'], coreqs: [], userSem: 6 },
                { id: 'EL4513', block: 6, name: 'Teoría Electromagnética I', cred: 4, hrs: 4, reqs: ['FI1102', 'MA2104'], coreqs: [], userSem: 6 },
                { id: 'EL4703', block: 6, name: 'Señales Y Sistemas', cred: 4, hrs: 4, reqs: ['EL2114', 'MA2105'], coreqs: ['EL4513'], userSem: 6 },
                { id: 'PI5516', block: 6, name: 'Ingeniería Económica', cred: 3, hrs: 4, reqs: ['EL4702'], coreqs: [], userSem: 6 },

                // BLOQUE 7
                { id: 'EL3217', block: 7, name: 'Taller De Diseño Analógico', cred: 2, hrs: 4, reqs: ['EL3215', 'EL3216'], coreqs: [], userSem: 7 },
                { id: 'EL3313', block: 7, name: 'Taller De Diseño Digital', cred: 3, hrs: 4, reqs: ['EL3215', 'EL3310'], coreqs: [], userSem: 7 },
                { id: 'EL4201', block: 7, name: 'Procesamiento Electrónico De Potencia', cred: 3, hrs: 4, reqs: ['EL3216', 'EL4513'], coreqs: ['EL3217'], userSem: 7 },
                { id: 'EL4419', block: 7, name: 'Análisis Y Control De Sistemas Lineales', cred: 3, hrs: 4, reqs: ['EL4703'], coreqs: [], userSem: 7 },
                { id: 'EL4514', block: 7, name: 'Teoría Electromagnética II', cred: 4, hrs: 4, reqs: ['EL4513', 'EL4702'], coreqs: [], userSem: 7 },
                { id: 'PI4001', block: 7, name: 'Dirección De Personal', cred: 3, hrs: 4, reqs: ['CS2303'], coreqs: [], userSem: 7 },

                // BLOQUE 8
                { id: 'EL4314', block: 8, name: 'Arquitectura De Computadoras I', cred: 4, hrs: 12, reqs: ['EL3313'], coreqs: [], userSem: 8 },
                { id: 'EL4607', block: 8, name: 'Normalización Técnica (Estándares Industriales)', cred: 3, hrs: 4, reqs: ['PI5516', 'SO4604'], coreqs: [], userSem: 8 },
                { id: 'EL5408', block: 8, name: 'Control Automático', cred: 4, hrs: 4, reqs: ['EL4419'], coreqs: [], userSem: 8 },
                { id: 'EL5409', block: 8, name: 'Laboratorio De Control Automático', cred: 2, hrs: 4, reqs: ['EL3217'], coreqs: ['EL5408'], userSem: 8 },
                { id: 'EL5513', block: 8, name: 'Comunicaciones Eléctricas I', cred: 4, hrs: 4, reqs: ['EL4514', 'EL4703'], coreqs: [], userSem: 8 },

                // BLOQUE 9
                { id: 'EL5521', block: 9, name: 'Comunicaciones Eléctricas II', cred: 4, hrs: 4, reqs: ['EL5513'], coreqs: [], userSem: 9 },
                { id: 'EL5522', block: 9, name: 'Taller De Comunicaciones Eléctricas', cred: 3, hrs: 4, reqs: [], coreqs: ['EL5521'], userSem: 9 },
                { id: 'EL5609', block: 9, name: 'Formulación De Proyectos', cred: 2, hrs: 6, reqs: ['EL4607'], coreqs: ['EL5610'], userSem: 9 },
                { id: 'EL5610', block: 9, name: 'Taller Integrador', cred: 3, hrs: 9, reqs: ['EL3313', 'EL5409'], coreqs: [], userSem: 9 },
                { id: 'EL5800', block: 9, name: 'Teoría Electiva I', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 9 },
                { id: 'EL5840', block: 9, name: 'Taller Electivo', cred: 2, hrs: 4, reqs: [], coreqs: [], userSem: 9 },

                // BLOQUE 10
                { id: 'AE4208', block: 10, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: [], coreqs: [], userSem: 10 },
                { id: 'CS5300', block: 10, name: 'Desarrollo Tecnológico Y Sostenibilidad', cred: 3, hrs: 4, reqs: ['CS3404'], coreqs: [], userSem: 10 },
                { id: 'EL5617', block: 10, name: 'Trabajo Final De Graduación', cred: 7, hrs: 20, reqs: [], coreqs: ['CS5300'], userSem: 10 },
                { id: 'EL5830', block: 10, name: 'Teoría Electiva II', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 10 }

                ],
            computacion: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },
                { id: 'MA0101', block: 0, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 0 },
            
                // BLOQUE 1
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'IC1400', block: 1, name: 'Fundamentos De Organización De Computadoras', cred: 3, hrs: 9, reqs: [], coreqs: ['MA1403'], userSem: 1 },
                { id: 'IC1802', block: 1, name: 'Introducción A La Programación', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'IC1803', block: 1, name: 'Taller De Programación', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'MA1403', block: 1, name: 'Matemática Discreta', cred: 4, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
            
                // BLOQUE 2
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'CI1230', block: 2, name: 'Inglés I', cred: 2, hrs: 6, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
                { id: 'IC2001', block: 2, name: 'Estructuras De Datos', cred: 4, hrs: 12, reqs: [], coreqs: ['IC2101'], userSem: 2 },
                { id: 'IC2101', block: 2, name: 'Programación Orientada A Objetos', cred: 3, hrs: 9, reqs: ['IC1802', 'IC1803'], coreqs: [], userSem: 2 },
                { id: 'IC3101', block: 2, name: 'Arquitectura De Computadores', cred: 4, hrs: 4, reqs: ['IC1400', 'IC1803'], coreqs: [], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101', 'MA1403'], coreqs: [], userSem: 2 },
                { id: 'SE1200', block: 2, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },
            
                // BLOQUE 3
                { id: 'CI1231', block: 3, name: 'Inglés II', cred: 2, hrs: 3, reqs: ['CI1230'], coreqs: [], userSem: 3 },
                { id: 'IC3002', block: 3, name: 'Análisis De Algoritmos', cred: 4, hrs: 12, reqs: ['IC2001', 'MA1102'], coreqs: [], userSem: 3 },
                { id: 'IC4301', block: 3, name: 'Bases De Datos I', cred: 4, hrs: 9, reqs: ['IC2001'], coreqs: ['MA1103'], userSem: 3 },
                { id: 'IC5821', block: 3, name: 'Requerimientos De Software', cred: 4, hrs: 12, reqs: [], coreqs: ['IC4301'], userSem: 3 },
                { id: 'MA1103', block: 3, name: 'Cálculo Y Álgebra Lineal', cred: 4, hrs: 4, reqs: ['MA1102'], coreqs: [], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },
            
                // BLOQUE 4
                { id: 'CS2101', block: 4, name: 'Ambiente Humano', cred: 2, hrs: 6, reqs: ['CI1107'], coreqs: [], userSem: 4 },
                { id: 'IC4302', block: 4, name: 'Bases De Datos II', cred: 3, hrs: 9, reqs: ['IC4301'], coreqs: [], userSem: 4 },
                { id: 'IC4700', block: 4, name: 'Lenguajes De Programación', cred: 4, hrs: 4, reqs: ['IC3002', 'IC3101'], coreqs: [], userSem: 4 },
                { id: 'IC6821', block: 4, name: 'Diseño De Software', cred: 4, hrs: 12, reqs: ['IC5821'], coreqs: [], userSem: 4 },
                { id: 'MA2404', block: 4, name: 'Probabilidades', cred: 4, hrs: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
            
                // BLOQUE 5
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS2101'], coreqs: [], userSem: 5 },
                { id: 'IC4810', block: 5, name: 'Administración De Proyectos', cred: 4, hrs: 4, reqs: ['IC5821'], coreqs: [], userSem: 5 },
                { id: 'IC5701', block: 5, name: 'Compiladores E Intérpretes', cred: 4, hrs: 4, reqs: ['IC4700'], coreqs: [], userSem: 5 },
                { id: 'IC6831', block: 5, name: 'Aseguramiento De La Calidad Del Software', cred: 3, hrs: 9, reqs: ['IC6821'], coreqs: ['IC4810'], userSem: 5 },
                { id: 'MA3405', block: 5, name: 'Estadística', cred: 4, hrs: 4, reqs: ['MA2404'], coreqs: [], userSem: 5 },
            
                // BLOQUE 6
                { id: 'CS4402', block: 6, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3401'], coreqs: [], userSem: 6 },
                { id: 'IC4003', block: 6, name: 'Electiva I', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 6 },
                { id: 'IC6400', block: 6, name: 'Investigación De Operaciones', cred: 4, hrs: 4, reqs: ['MA3405'], coreqs: [], userSem: 6 },
                { id: 'IC6600', block: 6, name: 'Principios De Sistemas Operativos', cred: 4, hrs: 4, reqs: ['IC5701'], coreqs: [], userSem: 6 },
                { id: 'IC7900', block: 6, name: 'Computación Y Sociedad', cred: 2, hrs: 7, reqs: ['IC4810'], coreqs: ['CS4402'], userSem: 6 },
                { id: 'IC8071', block: 6, name: 'Seguridad Del Software', cred: 3, hrs: 9, reqs: ['IC4810', 'IC6831'], coreqs: [], userSem: 6 },
            
                // BLOQUE 7
                { id: 'AE4208', block: 7, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: [], coreqs: ['IC7841'], userSem: 7 },
                { id: 'IC5001', block: 7, name: 'Electiva II', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 7 },
                { id: 'IC6200', block: 7, name: 'Inteligencia Artificial', cred: 4, hrs: 4, reqs: ['IC5701', 'IC6400'], coreqs: [], userSem: 7 },
                { id: 'IC7602', block: 7, name: 'Redes', cred: 4, hrs: 12, reqs: ['IC6600'], coreqs: [], userSem: 7 },
                { id: 'IC7841', block: 7, name: 'Proyecto De Ingeniería De Software', cred: 3, hrs: 9, reqs: ['IC4302', 'IC6831', 'IC8071'], coreqs: [], userSem: 7 },
            
                // BLOQUE 8
                { id: 'IC8842', block: 8, name: 'Práctica Profesional', cred: 12, hrs: 40, reqs: ['AE4208', 'FH1000', 'IC4003', 'IC5001', 'IC6200', 'IC7602', 'IC7841', 'SE1100', 'SE1200', 'SE1400'], coreqs: [], userSem: 8 }
            ],
            mecatronica: [
                // BLOQUE 0
                { id: 'CI0205', block: 0, name: 'Prueba Avanzada Inglés', cred: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'MA0101', block: 0, name: 'Matemática General', cred: 2, reqs: [], coreqs: [], userSem: 0 },
                
                // BLOQUE 1
                { id: 'CA2125', block: 1, name: 'Elementos De Computación', cred: 3, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, reqs: [], coreqs: ['CS1502'], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, reqs: [], coreqs: ['CI1106'], userSem: 1 },
                { id: 'FI1101', block: 1, name: 'Física General I', cred: 3, reqs: [], coreqs: ['MA1102'], userSem: 1 },
                { id: 'FI1201', block: 1, name: 'Laboratorio Física General I', cred: 1, reqs: [], coreqs: ['FI1101'], userSem: 1 },
                { id: 'MA1102', block: 1, name: 'Cálculo Diferencial E Integral', cred: 4, reqs: ['MA0101'], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, reqs: [], coreqs: [], userSem: 1 },
            
                // BLOQUE 2
                { id: 'CA3125', block: 2, name: 'Análisis Y Diseño De Algoritmos', cred: 3, reqs: ['CA2125'], coreqs: [], userSem: 2 },
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, reqs: ['CI1106'], coreqs: [], userSem: 2 },
                { id: 'CS2101', block: 2, name: 'Ambiente Humano', cred: 2, reqs: ['CS1502'], coreqs: [], userSem: 2 },
                { id: 'FH1000', block: 2, name: 'Centros De Formación Humanística', cred: 0, reqs: [], coreqs: [], userSem: 2 },
                { id: 'FI1102', block: 2, name: 'Física General II', cred: 3, reqs: ['FI1101', 'FI1201', 'MA1102'], coreqs: ['FI1202'], userSem: 2 },
                { id: 'FI1202', block: 2, name: 'Laboratorio Física General II', cred: 1, reqs: ['FI1201'], coreqs: ['FI1102'], userSem: 2 },
                { id: 'MA1103', block: 2, name: 'Cálculo Y Álgebra Lineal', cred: 4, reqs: ['MA1102'], coreqs: [], userSem: 2 },
                { id: 'MT2001', block: 2, name: 'Circuitos Eléctricos En Cc Y Ca', cred: 3, reqs: ['MA1102'], coreqs: ['MT2002'], userSem: 2 },
                { id: 'MT2002', block: 2, name: 'Laboratorio De Circuitos De Corriente Continua Y Corriente Alterna', cred: 1, reqs: [], coreqs: ['MT2001'], userSem: 2 },
                { id: 'SE1200', block: 2, name: 'Actividad Deportiva I', cred: 0, reqs: [], coreqs: [], userSem: 2 },
            
                // BLOQUE 3
                { id: 'FI2103', block: 3, name: 'Física General III', cred: 3, reqs: ['FI1101', 'MA1102'], coreqs: [], userSem: 3 },
                { id: 'MA2104', block: 3, name: 'Cálculo Superior', cred: 4, reqs: ['MA1103'], coreqs: [], userSem: 3 },
                { id: 'MI2101', block: 3, name: 'Dibujo Técnico', cred: 3, reqs: [], coreqs: [], userSem: 3 },
                { id: 'MT3001', block: 3, name: 'Electrónica Analógica', cred: 3, reqs: ['MT2001'], coreqs: ['MT3002'], userSem: 3 },
                { id: 'MT3002', block: 3, name: 'Laboratorio De Electrónica Analógica', cred: 1, reqs: ['MT2001'], coreqs: ['MA2104', 'MT3001'], userSem: 3 },
                { id: 'MT3003', block: 3, name: 'Máquinas Eléctricas Para Mecatrónica', cred: 3, reqs: ['FI1102', 'MT2001'], coreqs: ['MT3004'], userSem: 3 },
                { id: 'MT3004', block: 3, name: 'Laboratorio De Máquinas Eléctricas Para Mecatrónica', cred: 1, reqs: ['FI1102'], coreqs: ['MT3003'], userSem: 3 },
            
                // BLOQUE 4
                { id: 'MA2105', block: 4, name: 'Ecuaciones Diferenciales', cred: 4, reqs: ['MA1103'], coreqs: [], userSem: 4 },
                { id: 'ME3208', block: 4, name: 'Tecnología De Materiales', cred: 2, reqs: ['MI2101'], coreqs: ['ME3209'], userSem: 4 },
                { id: 'ME3209', block: 4, name: 'Laboratorio De Tecnología De Materiales', cred: 1, reqs: [], coreqs: ['ME3208'], userSem: 4 },
                { id: 'MI2106', block: 4, name: 'Estática', cred: 3, reqs: ['FI1101', 'MI2101'], coreqs: [], userSem: 4 },
                { id: 'MI3103', block: 4, name: 'Procesos De Manufactura', cred: 3, reqs: ['MI2101'], coreqs: ['MI3104'], userSem: 4 },
                { id: 'MI3104', block: 4, name: 'Laboratorio Procesos De Manufactura', cred: 2, reqs: [], coreqs: ['MI3103'], userSem: 4 },
                { id: 'MT4001', block: 4, name: 'Electrónica Digital', cred: 3, reqs: ['CA3125', 'MT3001'], coreqs: ['MT4002'], userSem: 4 },
                { id: 'MT4002', block: 4, name: 'Laboratorio Electrónica Digital', cred: 1, reqs: [], coreqs: ['MT4001'], userSem: 4 },
                { id: 'SE1400', block: 4, name: 'Actividad Cultural-Deportiva', cred: 0, reqs: [], coreqs: [], userSem: 4 },
            
                // BLOQUE 5
                { id: 'CI3202', block: 5, name: 'Inglés Para Mecatrónica', cred: 1, reqs: ['CI0205'], coreqs: [], userSem: 5 },
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, reqs: ['CS2101'], coreqs: [], userSem: 5 },
                { id: 'MI3115', block: 5, name: 'Resistencia De Materiales', cred: 3, reqs: ['MI2106'], coreqs: ['ME3208'], userSem: 5 },
                { id: 'MI3117', block: 5, name: 'Dinámica', cred: 3, reqs: ['MI2106'], coreqs: [], userSem: 5 },
                { id: 'MT5002', block: 5, name: 'Modelos De Sistemas Para Mecatrónica', cred: 3, reqs: ['MA2105', 'MT4001'], coreqs: [], userSem: 5 },
                { id: 'MT5003', block: 5, name: 'Electrónica De Potencia Aplicada', cred: 4, reqs: ['MT3003'], coreqs: ['MT5004'], userSem: 5 },
                { id: 'MT5004', block: 5, name: 'Laboratorio De Electrónica De Potencia Aplicada', cred: 2, reqs: ['MT3004'], coreqs: ['MT5003'], userSem: 5 },
            
                // BLOQUE 6
                { id: 'CM3207', block: 6, name: 'Métodos Numéricos Para Ingeniería', cred: 3, reqs: ['MT5002'], coreqs: ['MT6001'], userSem: 6 },
                { id: 'CS4402', block: 6, name: 'Seminario De Estudios Costarricenses', cred: 2, reqs: ['CS3401', 'FH1000'], coreqs: [], userSem: 6 },
                { id: 'MI3124', block: 6, name: 'Dibujo Industrial', cred: 4, reqs: ['MI3103'], coreqs: [], userSem: 6 },
                { id: 'MT6001', block: 6, name: 'Probabilidad Y Procesos Estocásticos', cred: 3, reqs: ['MA2105', 'MT5002'], coreqs: [], userSem: 6 },
                { id: 'MT6002', block: 6, name: 'Termofluidos', cred: 4, reqs: ['MI3117'], coreqs: ['MT6003'], userSem: 6 },
                { id: 'MT6003', block: 6, name: 'Laboratorio De Termofluidos', cred: 1, reqs: [], coreqs: ['MT6002'], userSem: 6 },
            
                // BLOQUE 7
                { id: 'MT7001', block: 7, name: 'Análisis Y Simulación De Sistemas', cred: 3, reqs: ['MT5002'], coreqs: [], userSem: 7 },
                { id: 'MT7002', block: 7, name: 'Sensores Y Actuadores', cred: 3, reqs: ['MT4001'], coreqs: ['MT7001'], userSem: 7 },
                { id: 'MT7003', block: 7, name: 'Microprocesadores Y Microcontroladores', cred: 3, reqs: ['MT5003'], coreqs: [], userSem: 7 },
                { id: 'MT7004', block: 7, name: 'Neumática Y Oleohidráulica', cred: 3, reqs: ['MT6002'], coreqs: [], userSem: 7 },
                { id: 'MT7006', block: 7, name: 'Diseño Máquinas Y Mecanismos', cred: 4, reqs: ['MI3115', 'MI3124'], coreqs: [], userSem: 7 },
                { id: 'SO4604', block: 7, name: 'Seguridad Y Salud Ocupacional', cred: 3, reqs: ['MT6001'], coreqs: [], userSem: 7 },
            
                // BLOQUE 8
                { id: 'AE4208', block: 8, name: 'Desarrollo De Emprendedores', cred: 4, reqs: ['SO4604'], coreqs: [], userSem: 8 },
                { id: 'MT8001', block: 8, name: 'Teoría De Comunicación Y Procesamiento De Señales', cred: 3, reqs: ['MT7001'], coreqs: [], userSem: 8 },
                { id: 'MT8002', block: 8, name: 'Automatización Y Redes Industriales', cred: 3, reqs: ['MT7002'], coreqs: [], userSem: 8 },
                { id: 'MT8003', block: 8, name: 'Sistemas De Manufactura', cred: 4, reqs: ['MI3103'], coreqs: ['MT8002'], userSem: 8 },
                { id: 'MT8004', block: 8, name: 'Electiva', cred: 4, reqs: ['MT6001', 'MT7003'], coreqs: [], userSem: 8 },
            
                // BLOQUE 9
                { id: 'EL5408', block: 9, name: 'Control Automático', cred: 4, reqs: ['MT7001'], coreqs: ['EL5409'], userSem: 9 },
                { id: 'EL5409', block: 9, name: 'Laboratorio De Control Automático', cred: 2, reqs: [], coreqs: ['EL5408'], userSem: 9 },
                { id: 'MT7005', block: 9, name: 'Formulación De Proyectos', cred: 2, reqs: ['MT8004'], coreqs: ['MT9001'], userSem: 9 },
                { id: 'MT9001', block: 9, name: 'Diseño De Sistemas Mecatrónicos', cred: 4, reqs: ['MT8003'], coreqs: ['MT9002'], userSem: 9 },
                { id: 'MT9002', block: 9, name: 'Mantenimiento De Sistemas Mecatrónicos', cred: 4, reqs: ['MT8003'], coreqs: [], userSem: 9 },
            
                // BLOQUE 10
                { id: 'MT9003', block: 10, name: 'Proyecto Final De Graduación', cred: 10, reqs: ['AE4208', 'EL5408', 'EL5409', 'MT9001', 'MT9002'], coreqs: [], userSem: 10 },
                { id: 'MT9004', block: 10, name: 'Electiva II', cred: 4, reqs: ['MT8004'], coreqs: [], userSem: 10 }
            ],
            biotecnologia: [
                // BLOQUE 0
                { id: 'CI0200', block: 0, name: 'Examen Diagnóstico', cred: 0, hrs: 0, reqs: [], coreqs: [], userSem: 0 },
                { id: 'CI0202', block: 0, name: 'Inglés Básico', cred: 2, hrs: 3, reqs: [], coreqs: [], userSem: 0 },

                // BLOQUE 1
                { id: 'BI1101', block: 1, name: 'Biología General', cred: 3, hrs: 9, reqs: [], coreqs: ['BI1102'], userSem: 1 },
                { id: 'BI1102', block: 1, name: 'Laboratorio De Biología General', cred: 1, hrs: 3, reqs: [], coreqs: ['BI1101'], userSem: 1 },
                { id: 'CI1106', block: 1, name: 'Comunicación Escrita', cred: 2, hrs: 6, reqs: [], coreqs: [], userSem: 1 },
                { id: 'CS1502', block: 1, name: 'Introducción A La Técnica Ciencia Y Tecnología', cred: 1, hrs: 2, reqs: [], coreqs: [], userSem: 1 },
                { id: 'FI1105', block: 1, name: 'Física Para Biotecnología', cred: 3, hrs: 4, reqs: [], coreqs: [], userSem: 1 },
                { id: 'IB1601', block: 1, name: 'Introducción A La Biotecnología', cred: 2, hrs: 3, reqs: [], coreqs: ['BI1101', 'BI1102'], userSem: 1 },
                { id: 'MA0101', block: 1, name: 'Matemática General', cred: 2, hrs: 5, reqs: [], coreqs: [], userSem: 1 },
                { id: 'QU1102', block: 1, name: 'Laboratorio De Química Básica I', cred: 1, hrs: 2, reqs: [], coreqs: ['QU1106'], userSem: 1 },
                { id: 'QU1106', block: 1, name: 'Química Básica I', cred: 3, hrs: 4, reqs: [], coreqs: ['QU1102'], userSem: 1 },
                { id: 'SE1100', block: 1, name: 'Actividad Cultural I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 1 },

                // BLOQUE 2
                { id: 'CI1107', block: 2, name: 'Comunicación Oral', cred: 1, hrs: 3, reqs: [], coreqs: [], userSem: 2 },
                { id: 'CI1202', block: 2, name: 'Inglés Para Biotecnología I', cred: 2, hrs: 3, reqs: ['CI0200', 'CI0202'], coreqs: [], userSem: 2 },
                { id: 'IB2113', block: 2, name: 'Análisis Estadístico Para Biotecnología', cred: 3, hrs: 9, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'IB2203', block: 2, name: 'Anatomía Vegetal', cred: 3, hrs: 4, reqs: ['BI1101', 'BI1102'], coreqs: ['IB2204'], userSem: 2 },
                { id: 'IB2204', block: 2, name: 'Laboratorio De Anatomía Vegetal', cred: 1, hrs: 3, reqs: ['BI1101', 'BI1102'], coreqs: ['IB2203'], userSem: 2 },
                { id: 'MA1102', block: 2, name: 'Cálculo Diferencial E Integral', cred: 4, hrs: 5, reqs: ['MA0101'], coreqs: [], userSem: 2 },
                { id: 'QU1104', block: 2, name: 'Laboratorio De Química Básica II', cred: 1, hrs: 2, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1107'], userSem: 2 },
                { id: 'QU1107', block: 2, name: 'Química Básica II', cred: 3, hrs: 4, reqs: ['QU1102', 'QU1106'], coreqs: ['QU1104'], userSem: 2 },
                { id: 'SE1200', block: 2, name: 'Actividad Deportiva I', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 2 },

                // BLOQUE 3
                { id: 'CI1203', block: 3, name: 'Inglés Para Biotecnología II', cred: 2, hrs: 3, reqs: ['CI1202'], coreqs: [], userSem: 3 },
                { id: 'CS3301', block: 3, name: 'Derecho Ambiental Y Biotecnológico', cred: 2, hrs: 2, reqs: ['CI1107'], coreqs: [], userSem: 3 },
                { id: 'IB2205', block: 3, name: 'Fisiología Vegetal', cred: 3, hrs: 3, reqs: ['IB2203', 'IB2204'], coreqs: ['IB2211'], userSem: 3 },
                { id: 'IB2211', block: 3, name: 'Laboratorio De Fisiología Vegetal', cred: 2, hrs: 3, reqs: ['IB2203', 'IB2204'], coreqs: ['IB2205'], userSem: 3 },
                { id: 'IB2302', block: 3, name: 'Laboratorio De Genética', cred: 1, hrs: 3, reqs: ['BI1101', 'BI1102'], coreqs: ['IB2304'], userSem: 3 },
                { id: 'IB2304', block: 3, name: 'Genética', cred: 3, hrs: 4, reqs: ['BI1101', 'BI1102'], coreqs: ['IB2302'], userSem: 3 },
                { id: 'QU2403', block: 3, name: 'Química Orgánica', cred: 3, hrs: 4, reqs: ['QU1107'], coreqs: ['QU2404'], userSem: 3 },
                { id: 'QU2404', block: 3, name: 'Laboratorio De Química Orgánica', cred: 2, hrs: 4, reqs: ['QU1104'], coreqs: ['QU2403'], userSem: 3 },
                { id: 'SE1400', block: 3, name: 'Actividad Cultural-Deportiva', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 3 },

                // BLOQUE 4
                { id: 'FH1000', block: 4, name: 'Centros De Formación Humanística', cred: 0, hrs: 2, reqs: [], coreqs: [], userSem: 4 },
                { id: 'IB2021', block: 4, name: 'Sistemas Bioinformáticos', cred: 2, hrs: 3, reqs: ['IB2113', 'IB2304'], coreqs: [], userSem: 4 },
                { id: 'IB3210', block: 4, name: 'Sistemas Ecológicos', cred: 3, hrs: 3, reqs: ['IB2113'], coreqs: ['IB2021'], userSem: 4 },
                { id: 'IB3302', block: 4, name: 'Mejoramiento Genético', cred: 3, hrs: 3, reqs: ['IB2302', 'IB2304'], coreqs: [], userSem: 4 },
                { id: 'IB3404', block: 4, name: 'Aplicación De Sistemas De Producción Agrícola', cred: 3, hrs: 3, reqs: ['IB2205', 'IB2211'], coreqs: ['IB3405'], userSem: 4 },
                { id: 'IB3405', block: 4, name: 'Laboratorio Aplicación De Sistemas De Producción Agrícola', cred: 2, hrs: 3, reqs: ['IB2205', 'IB2211'], coreqs: ['IB3404'], userSem: 4 },
                { id: 'IB3601', block: 4, name: 'Bioquímica', cred: 3, hrs: 3, reqs: ['QU2403', 'QU2404'], coreqs: ['IB3603'], userSem: 4 },
                { id: 'IB3603', block: 4, name: 'Laboratorio De Bioquímica', cred: 1, hrs: 3, reqs: ['QU2403', 'QU2404'], coreqs: ['IB3601'], userSem: 4 },

                // BLOQUE 5
                { id: 'CS3401', block: 5, name: 'Seminario De Estudios Filosóficos Históricos', cred: 2, hrs: 3, reqs: ['CS1502'], coreqs: [], userSem: 5 },
                { id: 'IB2105', block: 5, name: 'Microbiología Aplicada', cred: 3, hrs: 3, reqs: ['IB3601'], coreqs: ['IB2106'], userSem: 5 },
                { id: 'IB2106', block: 5, name: 'Laboratorio De Microbiología Aplicada', cred: 1, hrs: 3, reqs: ['IB3603'], coreqs: ['IB2105'], userSem: 5 },
                { id: 'IB3202', block: 5, name: 'Cultivos De Tejidos I', cred: 3, hrs: 3, reqs: ['IB2205', 'IB2211'], coreqs: ['IB3203'], userSem: 5 },
                { id: 'IB3203', block: 5, name: 'Laboratorio De Cultivo De Tejidos I', cred: 2, hrs: 4, reqs: ['IB2205', 'IB2211'], coreqs: ['IB3202'], userSem: 5 },
                { id: 'IB3204', block: 5, name: 'Ingeniería Bioquímica', cred: 4, hrs: 4, reqs: ['FI1105', 'IB3601', 'IB3603'], coreqs: [], userSem: 5 },
                { id: 'IB4803', block: 5, name: 'Tratamiento Biotecnológico De Aguas Residuales', cred: 3, hrs: 3, reqs: ['IB3603'], coreqs: ['IB2105', 'IB2106'], userSem: 5 },

                // BLOQUE 6 
                { id: 'AE4208', block: 6, name: 'Desarrollo De Emprendedores', cred: 4, hrs: 12, reqs: ['CS3301'], coreqs: [], userSem: 6 },
                { id: 'IB3107', block: 6, name: 'Microbiología Industrial', cred: 3, hrs: 3, reqs: ['IB2105', 'IB2106'], coreqs: [], userSem: 6 },
                { id: 'IB4101', block: 6, name: 'Biología Molecular Aplicada', cred: 3, hrs: 3, reqs: ['IB2105', 'IB2106'], coreqs: ['IB4106'], userSem: 6 },
                { id: 'IB4106', block: 6, name: 'Laboratorio De Biología Molecular Aplicada', cred: 2, hrs: 4, reqs: ['IB2105', 'IB2106'], coreqs: ['IB4101'], userSem: 6 },
                { id: 'IB4201', block: 6, name: 'Cultivo De Tejidos II', cred: 3, hrs: 3, reqs: ['IB3202', 'IB3203'], coreqs: ['IB4202'], userSem: 6 },
                { id: 'IB4202', block: 6, name: 'Laboratorio De Cultivo De Tejidos II', cred: 2, hrs: 4, reqs: ['IB3202', 'IB3203'], coreqs: ['IB4201'], userSem: 6 },

                // BLOQUE 7
                { id: 'CS4402', block: 7, name: 'Seminario De Estudios Costarricenses', cred: 2, hrs: 3, reqs: ['CS3401'], coreqs: [], userSem: 7 },
                { id: 'IB3101', block: 7, name: 'Seminario Taller De Formulación, Evaluación Y Gestión De Proyectos', cred: 3, hrs: 3, reqs: ['AE4208', 'IB4201'], coreqs: [], userSem: 7 },
                { id: 'IB4505', block: 7, name: 'Sistemas Biotecnológicos De Producción', cred: 4, hrs: 4, reqs: ['IB3204', 'IB4101'], coreqs: [], userSem: 7 },
                { id: 'IB6001', block: 7, name: 'Electiva I', cred: 3, hrs: 3, reqs: [], coreqs: [], userSem: 7 },
                { id: 'IB6002', block: 7, name: 'Electiva II', cred: 3, hrs: 3, reqs: [], coreqs: [], userSem: 7 },
                { id: 'IB6003', block: 7, name: 'Electiva III', cred: 3, hrs: 3, reqs: [], coreqs: [], userSem: 7 },

                // BLOQUE 8
                { id: 'IB4001', block: 8, name: 'Trabajo Final De Graduación', cred: 10, hrs: 0, reqs: ['IB4505'], coreqs: [], userSem: 8 }
            ],

            biotec_una: [
                // BLOQUE 1 (Nivel I, Ciclo I)
                { id: 'GEN-I', block: 1, name: 'Estudios Generales I', cred: 3, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]
                { id: 'GEN-II', block: 1, name: 'Estudios Generales II', cred: 3, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]
                { id: 'GEN-III', block: 1, name: 'Estudios Generales III', cred: 3, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]
                { id: 'BIJ400', block: 1, name: 'Biología General Teoría', cred: 4, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]
                { id: 'BIJ400L', block: 1, name: 'Biología General Laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]
                { id: 'QUX103', block: 1, name: 'Fundamentos de Química Teoría', cred: 4, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]
                { id: 'QUX103L', block: 1, name: 'Fundamentos de Química Laboratorio', cred: 1, reqs: [], coreqs: [], userSem: 1 }, // [cite: 15]

                // BLOQUE 2 (Nivel I, Ciclo II)
                { id: 'GEN-IV', block: 2, name: 'Estudios Generales IV', cred: 3, reqs: [], coreqs: [], userSem: 2 }, // [cite: 15]
                { id: 'LIX410', block: 2, name: 'Inglés Integrado I', cred: 4, reqs: [], coreqs: [], userSem: 2 }, // [cite: 15]
                { id: 'QUX104', block: 2, name: 'Biorgánica', cred: 3, reqs: [], coreqs: [], userSem: 2 }, // [cite: 15]
                { id: 'QUX104L', block: 2, name: 'Biorgánica Laboratorio', cred: 1, reqs: [], coreqs: [], userSem: 2 }, // [cite: 15]
                { id: 'MAT001', block: 2, name: 'Matemática General', cred: 4, reqs: [], coreqs: [], userSem: 2 }, // [cite: 15]
                { id: 'OPT-1', block: 2, name: 'Optativo libre', cred: 3, reqs: [], coreqs: [], userSem: 2 }, // [cite: 15]

                // BLOQUE 3 (Nivel II, Ciclo I)
                { id: 'LIX411', block: 3, name: 'Inglés Integrado II para otras carreras', cred: 4, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]
                { id: 'QUY427', block: 3, name: 'Elementos de Bioquímica teoría', cred: 4, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]
                { id: 'QUY427L', block: 3, name: 'Elementos de Bioquímica laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]
                { id: 'MAT002', block: 3, name: 'Cálculo I', cred: 4, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]
                { id: 'BIJ402', block: 3, name: 'Comunicación científica', cred: 2, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]
                { id: 'BIJ401', block: 3, name: 'Zoología General I teoría', cred: 4, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]
                { id: 'BIJ401L', block: 3, name: 'Zoología General I laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 3 }, // [cite: 15]

                // BLOQUE 4 (Nivel II, Ciclo II)
                { id: 'BIJ405', block: 4, name: 'Bioestadística I teoría', cred: 3, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ405P', block: 4, name: 'Bioestadística I práctica', cred: 0, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ403', block: 4, name: 'Zoología General II teoría', cred: 4, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ403L', block: 4, name: 'Zoología General II laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'FIY422', block: 4, name: 'Física para Biólogos', cred: 3, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'FIY422L', block: 4, name: 'Física para Biólogos Laboratorio', cred: 1, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ404', block: 4, name: 'Botánica General teoría', cred: 4, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ404L', block: 4, name: 'Botánica General laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ406', block: 4, name: 'Biología de los Microorganismos teoría', cred: 3, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]
                { id: 'BIJ406L', block: 4, name: 'Biología de los Microorganismos laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 4 }, // [cite: 32]

                // BLOQUE 5 (Nivel III, Ciclo I)
                { id: 'BIJ407', block: 5, name: 'Bioestadística II teoría', cred: 3, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ407L', block: 5, name: 'Bioestadística II práctica', cred: 0, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ408', block: 5, name: 'Ecología General teoría', cred: 4, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ408L', block: 5, name: 'Ecología General laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ409', block: 5, name: 'Fisiología Vegetal teoría', cred: 4, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ409L', block: 5, name: 'Fisiología Vegetal laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ410', block: 5, name: 'Genética teoría', cred: 4, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ410L', block: 5, name: 'Genética laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]
                { id: 'BIJ411', block: 5, name: 'Legislación Ambiental', cred: 3, reqs: [], coreqs: [], userSem: 5 }, // [cite: 32]

                // BLOQUE 6 (Nivel III, Ciclo II)
                { id: 'BIJ412', block: 6, name: 'Fisiología Animal', cred: 4, reqs: [], coreqs: [], userSem: 6 }, // [cite: 32]
                { id: 'BIJ412L', block: 6, name: 'Fisiología Animal laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 6 }, // [cite: 32]
                { id: 'BIJ413', block: 6, name: 'Evolución', cred: 3, reqs: [], coreqs: [], userSem: 6 }, // [cite: 49]
                { id: 'BIJ414', block: 6, name: 'Biología Celular', cred: 3, reqs: [], coreqs: [], userSem: 6 }, // [cite: 49]
                { id: 'BIJ450', block: 6, name: 'Biotecnología Ambiental teoría', cred: 3, reqs: [], coreqs: [], userSem: 6 }, // [cite: 49]
                { id: 'BIJ450L', block: 6, name: 'Biotecnología Ambiental laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 6 }, // [cite: 49]
                { id: 'BIJ451', block: 6, name: 'Técnicas de Biología Molecular teoría', cred: 4, reqs: [], coreqs: [], userSem: 6 }, // [cite: 49]
                { id: 'BIJ451L', block: 6, name: 'Técnicas de Biología Molecular laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 6 }, // [cite: 49]

                // BLOQUE 7 (Nivel IV, Ciclo I)
                { id: 'BIJ452', block: 7, name: 'Inmunología y Técnicas Serológicas teoría', cred: 3, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'BIJ452L', block: 7, name: 'Inmunología y Técnicas Serológicas laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'BIJ453', block: 7, name: 'Técnicas de Cultivo de Tejidos Animales teoría', cred: 3, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'BIJ453L', block: 7, name: 'Técnicas de Cultivo de Tejidos Animales laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'BIJ454', block: 7, name: 'Técnicas de Cultivo de Tejidos Vegetales teoría', cred: 3, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'BIJ454L', block: 7, name: 'Técnicas de Cultivo de Tejidos Vegetales laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'OPT-IE1', block: 7, name: 'Optativo I Inter - énfasis', cred: 3, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'OPT-D1', block: 7, name: 'Optativo I Disciplinar', cred: 3, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]
                { id: 'BIJ415', block: 7, name: 'Gestión de Empresas', cred: 3, reqs: [], coreqs: [], userSem: 7 }, // [cite: 49]

                // BLOQUE 8 (Nivel IV, Ciclo II)
                { id: 'BIJ455', block: 8, name: 'Bioinformática teoría', cred: 4, reqs: [], coreqs: [], userSem: 8 }, // [cite: 49]
                { id: 'BIJ455P', block: 8, name: 'Bioinformática práctica', cred: 0, reqs: [], coreqs: [], userSem: 8 }, // [cite: 49]
                { id: 'BIJ456', block: 8, name: 'Fisiología y Biotecnología de Microorganismos teoría', cred: 4, reqs: [], coreqs: [], userSem: 8 }, // [cite: 49]
                { id: 'BIJ456L', block: 8, name: 'Fisiología y Biotecnología de Microorganismos laboratorio', cred: 0, reqs: [], coreqs: [], userSem: 8 }, // [cite: 66]
                { id: 'BIJ416', block: 8, name: 'Práctica Profesional Supervisada', cred: 4, reqs: [], coreqs: [], userSem: 8 }, // [cite: 66]
                { id: 'OPT-D2', block: 8, name: 'Optativo II Disciplinario', cred: 3, reqs: [], coreqs: [], userSem: 8 }, // [cite: 66]
                { id: 'OPT-IE2', block: 8, name: 'Optativo II Inter - énfasis', cred: 3, reqs: [], coreqs: [], userSem: 8 } // [cite: 66]
            ],
        };

        // Versión de cada malla curricular. Incrementar el número correspondiente
        // cada vez que el TEC actualice ese plan de estudios (cursos agregados,
        // eliminados o con id distinto). Esto permite detectar cuando el progreso
        // guardado de un usuario quedó desactualizado respecto al plan vigente,
        // en vez de perder u ocultar datos silenciosamente.
        const CURRICULUM_VERSIONS = {
            fisica: 1,
            biotecnologia: 1,
            electronica: 1,
            computacion: 1,
            mecatronica: 1,
            administracion: 1,
            produccion: 1,
            mantenimiento: 1,
            computadores: 1,
            diseno: 1,
            ambiental: 1,
            ati: 1,
            materiales: 1,
            agricola: 1,
            agronegocios: 1,
            e_mate: 1,
            forestal: 1,
            forestal_manejoYproduccion: 1,
            forestal_conservacionYrestauracion: 1,
            seguridad: 1,

            biotec_una: 1,
        };