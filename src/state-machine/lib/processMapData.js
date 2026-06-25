export const PHASES = [
  {
    id: 'concepto',
    label: 'Concepto',
    icon: '💡',
    color: '#8B5CF6',
    processes: [
      {
        id: 'aprobacion_disenos',
        label: 'Aprobación de Diseños',
        activities: [
          'Conceptualización textil: Creación de concepto creativo por medio de elementos de inspiración para el desarrollo de la colección.',
        ],
      },
      {
        id: 'solicitud_sampling',
        label: 'Solicitud de Sampling y Laboratorios',
        activities: [
          'Diseño de Prints: Elaboración de propuestas y diseños digitales.',
          'Diseño de Special Developments: Creación de artes y paneles para diseños especiales de la colección. (Paquetes completos)',
        ],
      },
      {
        id: 'llegada_sampling',
        label: 'Llegada de Sampling',
        activities: [
          'Sampling de Prints: Entregable del proceso de desarrollo al proveedor — Requerimiento de ilustración de prints para la estampación textil.',
          'Sampling Special Developments: Entregable del proceso de desarrollo al proveedor — Requerimiento de ilustración de paneles bordados/textiles de paquetes completos.',
        ],
      },
    ],
  },
  {
    id: 'diseno',
    label: 'Diseño',
    icon: '✏️',
    color: '#3B82F6',
    processes: [
      {
        id: 'inicio_coleccion',
        label: 'Inicio de Colección',
        activities: [
          'Moodboard Inspiración: Desarrollo de propuestas de prints sobre biblioteca de siluetas, con el fin de generar inicio prototipos.',
          'Creación de Modelos: Creación de codificación del modelo en SAP.',
          'Actualización de Modelos: Actualización de la información del modelo en SAP.',
        ],
      },
      {
        id: 'prototipos_md',
        label: 'Prototipos (muestras MD)',
        activities: [
          'Creación molderia base',
        ],
      },
      {
        id: 'corte_md',
        label: 'Corte',
        activities: [
          'Corte de muestras de colección (MD)',
          'Corte de paquetes completos',
          'Descarga de telas',
        ],
      },
      {
        id: 'confeccion_md',
        label: 'Confección',
        activities: [
          'Confección de muestras de colección (MD)',
          'Confección de Paquetes completos',
        ],
        subprocesses: [
          {
            id: 'terminaciones_md',
            label: 'Terminaciones',
            activities: [
              'Arreglos',
              'Terminación',
              'Manualidad',
              'Montaje maniquí',
            ],
          },
        ],
      },
      {
        id: 'bordado_md',
        label: 'Bordado',
        activities: [
          'Laboratorios de Bordado',
          'Bordados de Colección',
        ],
      },
      {
        id: 'medicion_md',
        label: 'Medición',
        activities: [
          'Medición colección',
        ],
      },
      {
        id: 'fotos_internas',
        label: 'Fotos Internas',
        activities: [
          'Fotos internas',
        ],
      },
      {
        id: 'despacho_muestras',
        label: 'Despacho Muestras de Diseño',
        activities: [
          'Salida prendas a Foto Producto',
        ],
      },
    ],
  },
  {
    id: 'costeo',
    label: 'Costeo',
    icon: '💰',
    color: '#F59E0B',
    processes: [
      {
        id: 'foto_producto',
        label: 'Foto Producto',
        activities: [
          'Foto Producto',
        ],
      },
      {
        id: 'costeo_proceso',
        label: 'Costeo',
        activities: [
          'Análisis de colección (posibles Mod-artes)',
        ],
        subprocesses: [
          {
            id: 'creativos',
            label: 'Creativos',
            activities: [
              'Creación molderia base aprobada',
              'Entrega molderia base',
              'Ingreso telas usadas y en referencias',
              'Ingreso consumos creativos',
            ],
          },
          {
            id: 'tecnicos',
            label: 'Técnicos',
            activities: [
              'Ingreso consumos técnicos',
            ],
          },
          {
            id: 'trazador',
            label: 'Trazador',
            activities: [
              'Ingreso consumos trazador',
            ],
          },
        ],
      },
      {
        id: 'cierre_costeo',
        label: 'Cierre Costeo',
        activities: [
          'Cierre de costeo',
        ],
      },
      {
        id: 'gestion_mod_arte',
        label: 'Gestión de Modificaciones de Arte',
        activities: [
          'Envío de Modificaciones de arte',
          'Creación de Modificaciones de arte',
          'Revisión de Modificaciones de arte',
          'Entrega final de Modificaciones de arte',
        ],
      },
      {
        id: 'ubicaciones_trazo',
        label: 'Gestión de Ubicaciones de Trazo',
        activities: [
          'Registro de Ubicaciones de trazo',
        ],
      },
      {
        id: 'cierre_coleccion',
        label: 'Cierre de Colección',
        activities: [
          'Inventario post-colección',
          'Cierre de Colección',
          'Novedades de Costeo',
        ],
      },
    ],
  },
  {
    id: 'industrializacion',
    label: 'Industrialización',
    icon: '🏭',
    color: '#EF4444',
    processes: [
      {
        id: 'final_buy',
        label: 'Final Buy',
        activities: [
          'Reporte unidades vendidas',
        ],
      },
      {
        id: 'alistamiento',
        label: 'Alistamiento',
        activities: [
          'Alistamiento MP contramuestras',
          'Alistamiento MP paquetes completos',
        ],
      },
      {
        id: 'industrializacion_proceso',
        label: 'Industrialización',
        activities: [
          'Inicio contramuestras (Explosión)',
          'Programación de prioridades de contramuestras',
          'Asignación de contramuestras',
          'Asignación de paquetes completos',
        ],
      },
      {
        id: 'corte_cm',
        label: 'Corte',
        activities: [
          'Corte de contramuestras',
          'Corte de paquetes completos',
        ],
      },
      {
        id: 'confeccion_cm',
        label: 'Confección',
        activities: [
          'Confección de contramuestras',
          'Confección de Paquetes completos',
        ],
        subprocesses: [
          {
            id: 'terminaciones_cm',
            label: 'Terminaciones',
            activities: [
              'Arreglos',
              'Terminación',
              'Manualidad',
              'Montaje maniquí',
            ],
          },
        ],
      },
      {
        id: 'bordado_cm',
        label: 'Bordado',
        activities: [
          'Bordado Contramuestra',
          'Bordado paquete completo',
        ],
      },
      {
        id: 'medicion_cm',
        label: 'Medición',
        activities: [
          'Medición contramuestras',
          'Medición paquetes completos',
        ],
      },
      {
        id: 'inventario_cm',
        label: 'Inventario',
        activities: [
          'Inventario post-contramuestras',
        ],
      },
    ],
  },
  {
    id: 'produccion',
    label: 'Producción',
    icon: '👗',
    color: '#10B981',
    processes: [
      {
        id: 'entrega_produccion',
        label: 'Entrega Colección a Producción',
        activities: [
          'Entrega de documentación técnica',
          'Traspaso de fichas técnicas',
        ],
      },
      {
        id: 'produccion_proceso',
        label: 'Producción',
        activities: [
          'Coordinación de órdenes de producción',
          'Seguimiento de tiempos de confección',
        ],
      },
      {
        id: 'feedback_produccion',
        label: 'Feedback Producción',
        activities: [
          'Revisión de calidad',
          'Retroalimentación a diseño e industrialización',
        ],
      },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: '🛒',
    color: '#6366F1',
    processes: [
      {
        id: 'entrega_comercial',
        label: 'Entrega a Comercial',
        activities: [
          'Entrega de muestras finales',
          'Entrega de fichas técnicas comerciales',
        ],
      },
      {
        id: 'feed_comercial',
        label: 'Feed Comercial',
        activities: [
          'Recepción de feedback del cliente',
          'Ajustes post-venta',
        ],
      },
    ],
  },
];

export function buildProcessMapMermaid() {
  const lines = ['graph LR'];
  const styleLines = [];

  PHASES.forEach((phase, pIdx) => {
    const phaseId = `PH${pIdx}`;
    phase.processes.forEach((proc, prIdx) => {
      const procId = `${phaseId}_P${prIdx}`;
      const shortLabel = proc.label.length > 25 ? proc.label.slice(0, 23) + '…' : proc.label;
      lines.push(`  ${procId}["${shortLabel}"]`);
      styleLines.push(`  style ${procId} fill:${phase.color}20,stroke:${phase.color},stroke-width:1px`);

      lines.push(`  ${phaseId} --> ${procId}`);
      lines.push(`  ${procId} --> ${phaseId}`);
    });

    const phaseLabel = `${phase.icon} ${phase.label}`;
    lines.push(`  ${phaseId}["${phaseLabel}"]`);
    styleLines.push(`  style ${phaseId} fill:${phase.color},stroke:${phase.color},color:#ffffff,font-weight:bold`);

    if (pIdx < PHASES.length - 1) {
      const nextId = `PH${pIdx + 1}`;
      lines.push(`  ${phaseId} --> ${nextId}`);
    }
  });

  lines.push('');
  lines.push(...styleLines);

  return lines.join('\n');
}

export function getAllNodeMeta() {
  const meta = {};
  PHASES.forEach((phase, pIdx) => {
    const phaseId = `PH${pIdx}`;
    meta[phaseId] = {
      type: 'phase',
      label: phase.label,
      icon: phase.icon,
      color: phase.color,
      processes: phase.processes.map(p => ({
        label: p.label,
        activities: p.activities,
        subprocesses: p.subprocesses,
      })),
    };

    phase.processes.forEach((proc, prIdx) => {
      const procId = `${phaseId}_P${prIdx}`;
      meta[procId] = {
        type: 'process',
        label: proc.label,
        phaseLabel: phase.label,
        icon: '🔧',
        color: phase.color,
        activities: proc.activities,
        subprocesses: proc.subprocesses,
      };
    });
  });
  return meta;
}
