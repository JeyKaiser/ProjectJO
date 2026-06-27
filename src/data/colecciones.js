// Datos simulados para el explorador de colecciones

export const colecciones = [
  {
    id: 'winter-sun',
    nombre: 'Winter Sun',
    imagen: '/images/colecciones/winter_sun.png',
    borderColor: '#EAB308',
    anios: [
      {
        anio: 2026,
        resumen: { total: 45, enProceso: 18, pausadas: 2, completadas: 25 },
        referencias: [
          {
            id: 'REF-001', codigoMD: 'MD-001', codigoPT: 'PT03402',
            nombre: 'ECRU/SAND FEMININITY DRAMATIC PANT',
            tipoPrenda: 'Pantalón', color: 'Ecru/Sand', codigoColor: 'EC-04',
            imagen: '/prendas/boceto1.png',
            linea: 'Ready To Wear', sublinea: 'Bottoms',
            tallaje: 'XS-S-M-L', largo: 'Full Length', closure: 'Cremallera lateral',
            faseActual: 2.4, subfaseNombre: 'Confeccion',
            responsable: 'María López', tiempoFase: '4h 15m',
            clasificacion: 'Sólida',
            prioridadFirstBuy: 'A',
            dropEntrega: 'C',
            enviarMaquila: false,
            complejidadCorte: 'Media', complejidadConfeccion: 'Alta',
            tieneBordado: false, tieneSemielaborado: false,
            montajeManiqui: 'No aplica', tirasContinuas: false,
            includes: 'Cinturón', tipoEmpaque: 'Individual',
            telas: [
              {
                id: 'TEL-01', codigoMaterial: 'EC-SAND-01', descripcion: 'SAND LINEN BLEND',
                ancho: '1.50m', baseTextil: 'Lino/Algodón', usoEnPrenda: 'Tela Lucir',
                consumoCreativo: 1.80, consumoTecnico: 1.75,
                consumoTrazador: { solido: 1.72, modArte: null, ubicTrazo: null },
                consumoContramuestra: 1.70, unidad: 'mts',
              },
              {
                id: 'TEL-02', codigoMaterial: 'EC-FORRO-01', descripcion: 'ECRU CUPRO LINING',
                ancho: '1.40m', baseTextil: 'Cupro', usoEnPrenda: 'Forro',
                consumoCreativo: 1.20, consumoTecnico: 1.15,
                consumoTrazador: { solido: 1.12, modArte: null, ubicTrazo: null },
                consumoContramuestra: 1.10, unidad: 'mts',
              },
            ],
            insumos: [
              { id: 'INS-01', codigo: 'CR-001', descripcion: 'Cremallera Invisible 20cm', unidad: 'Unidad', cantidad: 1 },
              { id: 'INS-02', codigo: 'HB-002', descripcion: 'Hebilla dorada 2cm', unidad: 'Unidad', cantidad: 2 },
              { id: 'INS-03', codigo: 'ET-003', descripcion: 'Elástico 3cm', unidad: 'Mts', cantidad: 0.25 },
            ],
            historialFases: [
              { fase: '1.1 Aprobacion de Diseños', responsable: 'Coordinadora JO', fechaIngreso: '2026-01-10', fechaSalida: '2026-01-11', estado: 'Terminado', comentarios: 'Referencia creada. Códigos MD/PT asignados.' },
              { fase: '2.1 Inicio de Coleccion', responsable: 'Creativo JO', fechaIngreso: '2026-01-11', fechaSalida: '2026-01-12', estado: 'Terminado', comentarios: 'Estimación visual: ~1.80 mts tela lucir.' },
              { fase: '2.2 Prototipos (Moldería)', responsable: 'Patronista Jefe', fechaIngreso: '2026-01-12', fechaSalida: '2026-01-15', estado: 'Terminado', comentarios: 'Patrón base en talla S completado.' },
              { fase: '2.3 Corte', responsable: 'Bodega', fechaIngreso: '2026-01-16', fechaSalida: '2026-01-16', estado: 'Terminado', comentarios: 'Sin novedades de calidad.' },
              { fase: '2.3 Corte', responsable: 'Carlos Cortador', fechaIngreso: '2026-01-17', fechaSalida: '2026-01-17', estado: 'Terminado', comentarios: '' },
              { fase: '2.4 Confeccion', responsable: 'María López', fechaIngreso: '2026-01-18', fechaSalida: null, estado: 'En Proceso', comentarios: 'En ensamblaje del pantalón.' },
            ],
            mediciones: [
              { numero: 1, fecha: '2026-01-20', resultado: 'Aprobada con comentarios', observaciones: 'Ajustar largo 2cm, angostar pierna.' },
            ],
            procesosEspeciales: [],
            marquilla: {
              descUSA: 'ECRU/SAND, 68% Linen, 32% Cotton', descUK: 'ECRU/SAND, 68% Lin, 32% Cot',
              fiberComposition: '68% Linen, 32% Cotton',
              wovenKnitted: 'Woven', inside: 'Contrasting lining: 100% Cupro',
              include: 'Remove before wearing belt', observaciones: '',
            },
            cuidados: [
              { categoria: 'Lavado', instruccion: 'Lavar a mano en agua fría', icono: '🫧' },
              { categoria: 'Desmanche', instruccion: 'No usar blanqueador', icono: '🚫' },
              { categoria: 'Secado', instruccion: 'Secar a la sombra', icono: '🌤️' },
              { categoria: 'Planchado', instruccion: 'Planchar a temperatura media-baja', icono: '👕' },
            ],
            contramuestra: null,
          },
          {
            id: 'REF-002', codigoMD: 'MD-002', codigoPT: 'PT03405',
            nombre: 'IVORY DRAMATIC MAXI DRESS',
            tipoPrenda: 'Vestido', color: 'Ivory', codigoColor: 'IV-01',
            imagen: '/prendas/boceto2.png',
            linea: 'Ready To Wear', sublinea: 'Dresses',
            tallaje: 'XS-S-M-L', largo: 'Maxi', closure: 'Cierre posterior',
             faseActual: 2.6, subfaseNombre: 'Medicion',
            responsable: 'Directora Creativa', tiempoFase: '1 día',
            clasificacion: 'Mod. Arte',
            prioridadFirstBuy: 'A', dropEntrega: 'A', enviarMaquila: false,
            complejidadCorte: 'Alta', complejidadConfeccion: 'Alta',
            tieneBordado: true, tieneSemielaborado: false,
            montajeManiqui: 'Drapeado', tirasContinuas: false,
            includes: '', tipoEmpaque: 'Individual',
            telas: [
              {
                id: 'TEL-03', codigoMaterial: 'IV-SILK-01', descripcion: 'IVORY SILK CHARMEUSE',
                ancho: '1.15m', baseTextil: 'Seda', usoEnPrenda: 'Tela Lucir',
                consumoCreativo: 3.50, consumoTecnico: 3.40,
                consumoTrazador: { solido: null, modArte: 3.35, ubicTrazo: null },
                consumoContramuestra: 3.30, unidad: 'mts',
              },
            ],
            insumos: [
              { id: 'INS-04', codigo: 'CR-002', descripcion: 'Cremallera Invisible 55cm', unidad: 'Unidad', cantidad: 1 },
              { id: 'INS-05', codigo: 'PC-001', descripcion: 'Aplique bordado floral', unidad: 'Unidad', cantidad: 3 },
            ],
             historialFases: [
              { fase: '1.1 Aprobacion de Diseños', responsable: 'Coordinadora JO', fechaIngreso: '2026-01-05', fechaSalida: '2026-01-06', estado: 'Terminado', comentarios: '' },
              { fase: '2.1 Inicio de Coleccion', responsable: 'Creativo JO', fechaIngreso: '2026-01-06', fechaSalida: '2026-01-07', estado: 'Terminado', comentarios: '~3.50 mts estimados.' },
              { fase: '2.2 Prototipos (Moldería)', responsable: 'Patronista Jefe', fechaIngreso: '2026-01-07', fechaSalida: '2026-01-12', estado: 'Terminado', comentarios: '' },
              { fase: '2.3 Corte', responsable: 'Bodega', fechaIngreso: '2026-01-13', fechaSalida: '2026-01-13', estado: 'Terminado', comentarios: '' },
              { fase: '2.3 Corte', responsable: 'Carlos Cortador', fechaIngreso: '2026-01-14', fechaSalida: '2026-01-14', estado: 'Terminado', comentarios: '' },
              { fase: '2.4 Confeccion', responsable: 'Sofía Modista', fechaIngreso: '2026-01-15', fechaSalida: '2026-01-20', estado: 'Terminado', comentarios: 'Drapeado frontal terminado.' },
              { fase: '2.5 Bordado', responsable: 'Bordados El Arte', fechaIngreso: '2026-01-21', fechaSalida: '2026-01-28', estado: 'Terminado', comentarios: '3 apliques bordados floral aplicados.' },
              { fase: '2.6 Medicion', responsable: 'Directora Creativa', fechaIngreso: '2026-01-29', fechaSalida: null, estado: 'En Proceso', comentarios: '' },
            ],
            mediciones: [],
            procesosEspeciales: [
              { proveedor: 'Bordados El Arte', descripcion: 'Aplique floral bordado a mano', estado: 'Completado', costo: 45000 },
            ],
            marquilla: null,
            cuidados: [],
            contramuestra: null,
          },
           { id: 'REF-003', codigoMD: 'MD-003', codigoPT: 'PT03407', nombre: 'SAND RELAXED LINEN BLAZER', tipoPrenda: 'Blazer', color: 'Sand', faseActual: 2.1, subfaseNombre: 'Inicio de Coleccion', responsable: 'Creativo JO', tiempoFase: '2h', clasificacion: 'Sólida', codigoColor: 'SD-02', linea: 'Ready To Wear', sublinea: 'Jackets', tallaje: 'XS-S-M-L', largo: 'Hip', closure: 'Sin cierre', prioridadFirstBuy: 'B', dropEntrega: 'D', enviarMaquila: false, complejidadCorte: 'Media', complejidadConfeccion: 'Media', tieneBordado: false, tieneSemielaborado: false, montajeManiqui: 'No aplica', tirasContinuas: false, includes: '', tipoEmpaque: 'Individual', telas: [], insumos: [], historialFases: [{ fase: '1.1 Aprobacion de Diseños', responsable: 'Coordinadora JO', fechaIngreso: '2026-02-01', fechaSalida: '2026-02-01', estado: 'Terminado', comentarios: '' }, { fase: '2.1 Inicio de Coleccion', responsable: 'Creativo JO', fechaIngreso: '2026-02-02', fechaSalida: null, estado: 'En Proceso', comentarios: '' }], mediciones: [], procesosEspeciales: [], marquilla: null, cuidados: [], contramuestra: null },
           { id: 'REF-004', codigoMD: 'MD-004', codigoPT: 'PT03409', nombre: 'ECRU/SAND UNFOLDED MOMENT JACKET', tipoPrenda: 'Jacket', color: 'Ecru/Sand', faseActual: 2.5, subfaseNombre: 'Bordado', responsable: 'Lavandería Ext.', tiempoFase: '2 días', clasificacion: 'Sólida', codigoColor: 'EC-04', linea: 'Ready To Wear', sublinea: 'Jackets', tallaje: 'XS-S-M-L', largo: 'Hip', closure: 'Botones', prioridadFirstBuy: 'A', dropEntrega: 'B', enviarMaquila: true, complejidadCorte: 'Alta', complejidadConfeccion: 'Alta', tieneBordado: false, tieneSemielaborado: false, montajeManiqui: 'No aplica', tirasContinuas: false, includes: '', tipoEmpaque: 'Individual', telas: [], insumos: [], historialFases: [], mediciones: [], procesosEspeciales: [{ proveedor: 'Lavandería Textil XYZ', descripcion: 'Stone wash enzimático', estado: 'En Proceso', costo: 12000 }], marquilla: null, cuidados: [], contramuestra: null },
           { id: 'REF-005', codigoMD: 'MD-005', codigoPT: 'PT03411', nombre: 'CREAM FLOWING SILK SKIRT', tipoPrenda: 'Falda', color: 'Cream', faseActual: 3.6, subfaseNombre: 'Cierre de Coleccion', responsable: 'Equipo Cierre', tiempoFase: '30m', clasificacion: 'Sólida', codigoColor: 'CR-01', linea: 'Ready To Wear', sublinea: 'Bottoms', tallaje: 'XS-S-M-L', largo: 'Midi', closure: 'Elástico', prioridadFirstBuy: 'A', dropEntrega: 'A', enviarMaquila: false, complejidadCorte: 'Baja', complejidadConfeccion: 'Media', tieneBordado: false, tieneSemielaborado: false, montajeManiqui: 'No aplica', tirasContinuas: false, includes: '', tipoEmpaque: 'Individual', telas: [], insumos: [], historialFases: [], mediciones: [], procesosEspeciales: [], marquilla: null, cuidados: [], contramuestra: { OT: 'OT-2026-011', notaSAP: null, talla: 'S', colorContramuestra: 'Cream', fechaTrasladoSAP: null, fechaDespachoZF: null } },
        ]
      },
      {
        anio: 2025,
        resumen: { total: 38, enProceso: 0, pausadas: 0, completadas: 38 },
        referencias: [
           { id: 'REF-101', codigoMD: 'MD-101', codigoPT: 'PT03200', nombre: 'SAND CLASSIC TRENCH COAT', tipoPrenda: 'Abrigo', color: 'Sand', faseActual: 5.2, subfaseNombre: 'Produccion', responsable: 'Coordinación Produccion', tiempoFase: 'Completado', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
  {
    id: 'resort-rtw',
    nombre: 'Resort RTW',
    imagen: '/images/colecciones/resort_rtw.png',
    borderColor: '#3B82F6',
    anios: [
      {
        anio: 2026,
        resumen: { total: 32, enProceso: 10, pausadas: 1, completadas: 21 },
        referencias: [
           { id: 'REF-201', codigoMD: 'MD-201', codigoPT: 'PT03500', nombre: 'TURQUOISE RESORT WRAP DRESS', tipoPrenda: 'Vestido', color: 'Turquoise', faseActual: 3.5, subfaseNombre: 'Ubicaciones de Trazo', responsable: 'Osman Trazador', tiempoFase: '6h', clasificacion: 'Ubicación Trazo' },
           { id: 'REF-202', codigoMD: 'MD-202', codigoPT: 'PT03501', nombre: 'WHITE LINEN PALAZZO PANTS', tipoPrenda: 'Pantalón', color: 'White', faseActual: 2.3, subfaseNombre: 'Corte', responsable: 'Carlos Cortador', tiempoFase: '1h 30m', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
  {
    id: 'spring-summer',
    nombre: 'Spring Summer',
    imagen: '/images/colecciones/spring_summer.png',
    borderColor: '#22C55E',
    anios: [
      {
        anio: 2026,
        resumen: { total: 50, enProceso: 22, pausadas: 3, completadas: 25 },
        referencias: [
           { id: 'REF-301', codigoMD: 'MD-301', codigoPT: 'PT03600', nombre: 'BLUSH FLORAL MIDI SKIRT', tipoPrenda: 'Falda', color: 'Blush', faseActual: 2.2, subfaseNombre: 'Prototipos (Moldería)', responsable: 'Patronista Jefe', tiempoFase: '3h', clasificacion: 'Mod. Arte' },
        ]
      }
    ]
  },
  {
    id: 'summer-vacation',
    nombre: 'Summer Vacation',
    imagen: '/images/colecciones/summer_vacation.png',
    borderColor: '#F97316',
    anios: [
      {
        anio: 2026,
        resumen: { total: 28, enProceso: 5, pausadas: 0, completadas: 23 },
        referencias: [
           { id: 'REF-401', codigoMD: 'MD-401', codigoPT: 'PT03700', nombre: 'CORAL SUNSET JUMPSUIT', tipoPrenda: 'Jumpsuit', color: 'Coral', faseActual: 4.3, subfaseNombre: 'Industrializacion (Explosion)', responsable: 'Equipo Consumos', tiempoFase: '45m', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
  {
    id: 'prefall',
    nombre: 'Pre-Fall',
    imagen: '/images/colecciones/prefall.png',
    borderColor: '#A855F7',
    anios: [
      {
        anio: 2026,
        resumen: { total: 35, enProceso: 15, pausadas: 1, completadas: 19 },
        referencias: [
           { id: 'REF-501', codigoMD: 'MD-501', codigoPT: 'PT03800', nombre: 'BURGUNDY VELVET BLAZER', tipoPrenda: 'Blazer', color: 'Burgundy', faseActual: 3.2, subfaseNombre: 'Costeo', responsable: 'Daniela García', tiempoFase: '5h', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
  {
    id: 'fall-winter',
    nombre: 'Fall Winter',
    imagen: '/images/colecciones/fallwinter.png',
    borderColor: '#DC2626',
    anios: [
      {
        anio: 2026,
        resumen: { total: 42, enProceso: 8, pausadas: 2, completadas: 32 },
        referencias: [
           { id: 'REF-601', codigoMD: 'MD-601', codigoPT: 'PT03900', nombre: 'CHARCOAL WOOL OVERCOAT', tipoPrenda: 'Abrigo', color: 'Charcoal', faseActual: 2.3, subfaseNombre: 'Corte', responsable: 'Bodega', tiempoFase: '1h', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
];

// Mapeo de subfase numérica a porcentaje de avance (0-100)
export const subfaseToProgress = {
  1.1: 4,  1.2: 8,  1.3: 12,
  2.1: 16, 2.2: 19, 2.3: 22, 2.4: 26,
  2.5: 30, 2.6: 33, 2.7: 36, 2.8: 38,
  3.1: 42, 3.2: 48, 3.3: 52,
  3.4: 56, 3.5: 59, 3.6: 62,
  4.1: 65, 4.2: 68, 4.3: 72, 4.4: 75,
  4.5: 78, 4.6: 81, 4.7: 84, 4.8: 85,
  5.1: 89, 5.2: 93, 5.3: 96,
  6.1: 98, 6.2: 100,
};

// Determinar fase macro desde subfase (6 fases)
const FASES_CONFIG = [
  { fase: 1, nombre: 'Concepto',             tempVar: 'frost' },
  { fase: 2, nombre: 'Diseño',               tempVar: 'cold' },
  { fase: 3, nombre: 'Costeo',               tempVar: 'warm' },
  { fase: 4, nombre: 'Industrializacion',    tempVar: 'hot' },
  { fase: 5, nombre: 'Produccion',           tempVar: 'fire' },
  { fase: 6, nombre: 'Comercial',            tempVar: 'blaze' },
];

export const getFaseMacro = (subfase) => {
  const f = Math.floor(subfase);
  return FASES_CONFIG[f - 1] || FASES_CONFIG[0];
};
