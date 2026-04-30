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
          { id: 'REF-001', codigoMD: 'MD-001', codigoPT: 'PT03402', nombre: 'ECRU/SAND FEMININITY DRAMATIC PANT', tipoPrenda: 'Pantalón', color: 'Ecru/Sand', faseActual: 2.3, subfaseNombre: 'Confección Muestra', responsable: 'María López', tiempoFase: '4h 15m', clasificacion: 'Sólida' },
          { id: 'REF-002', codigoMD: 'MD-002', codigoPT: 'PT03405', nombre: 'IVORY DRAMATIC MAXI DRESS', tipoPrenda: 'Vestido', color: 'Ivory', faseActual: 3.1, subfaseNombre: 'Medición y Tallaje', responsable: 'Ana García', tiempoFase: '1 día', clasificacion: 'Mod. Arte' },
          { id: 'REF-003', codigoMD: 'MD-003', codigoPT: 'PT03407', nombre: 'SAND RELAXED LINEN BLAZER', tipoPrenda: 'Blazer', color: 'Sand', faseActual: 1.2, subfaseNombre: 'Consumo Base', responsable: 'Claudia Ríos', tiempoFase: '2h', clasificacion: 'Sólida' },
          { id: 'REF-004', codigoMD: 'MD-004', codigoPT: 'PT03409', nombre: 'ECRU/SAND UNFOLDED MOMENT JACKET', tipoPrenda: 'Jacket', color: 'Ecru/Sand', faseActual: 2.4, subfaseNombre: 'Procesos Especiales', responsable: 'Ext: Lavandería', tiempoFase: '2 días', clasificacion: 'Sólida' },
          { id: 'REF-005', codigoMD: 'MD-005', codigoPT: 'PT03411', nombre: 'CREAM FLOWING SILK SKIRT', tipoPrenda: 'Falda', color: 'Cream', faseActual: 4.1, subfaseNombre: 'Cierre Ficha Final', responsable: 'Equipo Ficha', tiempoFase: '30m', clasificacion: 'Sólida' },
        ]
      },
      {
        anio: 2025,
        resumen: { total: 38, enProceso: 0, pausadas: 0, completadas: 38 },
        referencias: [
          { id: 'REF-101', codigoMD: 'MD-101', codigoPT: 'PT03200', nombre: 'SAND CLASSIC TRENCH COAT', tipoPrenda: 'Abrigo', color: 'Sand', faseActual: 4.3, subfaseNombre: 'Nota de Fabricación SAP', responsable: 'Coordinación', tiempoFase: 'Completado', clasificacion: 'Sólida' },
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
          { id: 'REF-201', codigoMD: 'MD-201', codigoPT: 'PT03500', nombre: 'TURQUOISE RESORT WRAP DRESS', tipoPrenda: 'Vestido', color: 'Turquoise', faseActual: 3.4, subfaseNombre: 'Trazos de Producción', responsable: 'Osman Trazador', tiempoFase: '6h', clasificacion: 'Ubicación Trazo' },
          { id: 'REF-202', codigoMD: 'MD-202', codigoPT: 'PT03501', nombre: 'WHITE LINEN PALAZZO PANTS', tipoPrenda: 'Pantalón', color: 'White', faseActual: 2.2, subfaseNombre: 'Corte de Muestra', responsable: 'Carlos Cortador', tiempoFase: '1h 30m', clasificacion: 'Sólida' },
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
          { id: 'REF-301', codigoMD: 'MD-301', codigoPT: 'PT03600', nombre: 'BLUSH FLORAL MIDI SKIRT', tipoPrenda: 'Falda', color: 'Blush', faseActual: 1.3, subfaseNombre: 'Moldería Base', responsable: 'Patronista Jefe', tiempoFase: '3h', clasificacion: 'Mod. Arte' },
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
          { id: 'REF-401', codigoMD: 'MD-401', codigoPT: 'PT03700', nombre: 'CORAL SUNSET JUMPSUIT', tipoPrenda: 'Jumpsuit', color: 'Coral', faseActual: 4.2, subfaseNombre: 'Explosión Contramuestra', responsable: 'Equipo Consumos', tiempoFase: '45m', clasificacion: 'Sólida' },
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
          { id: 'REF-501', codigoMD: 'MD-501', codigoPT: 'PT03800', nombre: 'BURGUNDY VELVET BLAZER', tipoPrenda: 'Blazer', color: 'Burgundy', faseActual: 3.3, subfaseNombre: 'Escalado y Consumo Técnico', responsable: 'Daniela García', tiempoFase: '5h', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
  {
    id: 'fall-winter',
    nombre: 'Fall Winter',
    borderColor: '#DC2626',
    imagen: null,
    anios: [
      {
        anio: 2026,
        resumen: { total: 42, enProceso: 8, pausadas: 2, completadas: 32 },
        referencias: [
          { id: 'REF-601', codigoMD: 'MD-601', codigoPT: 'PT03900', nombre: 'CHARCOAL WOOL OVERCOAT', tipoPrenda: 'Abrigo', color: 'Charcoal', faseActual: 2.1, subfaseNombre: 'Alistamiento', responsable: 'Bodega', tiempoFase: '1h', clasificacion: 'Sólida' },
        ]
      }
    ]
  },
];

// Mapeo de subfase numérica a porcentaje de avance (0-100)
export const subfaseToProgress = {
  1.1: 5, 1.2: 12, 1.3: 20,
  2.1: 28, 2.2: 38, 2.3: 48, 2.4: 58,
  3.1: 65, 3.2: 72, 3.3: 80, 3.4: 88,
  4.1: 92, 4.2: 96, 4.3: 100,
};

// Determinar fase macro desde subfase
export const getFaseMacro = (subfase) => {
  if (subfase < 2) return { fase: 1, nombre: 'Ideación y Diseño', tempVar: 'cold' };
  if (subfase < 3) return { fase: 2, nombre: 'Laboratorio', tempVar: 'warm' };
  if (subfase < 4) return { fase: 3, nombre: 'Validación Técnica', tempVar: 'hot' };
  return { fase: 4, nombre: 'Industrialización', tempVar: 'fire' };
};
