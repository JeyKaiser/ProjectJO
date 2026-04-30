// ============================================
// COMPONENTES UI - GESTIÓN DE COLECCIONES JO
// ============================================

// ============================================
// COMPONENTE: DASHBOARD
// ============================================
class DashboardComponent {
    static render(referencias) {
        const stats = Statistics.obtenerEstadisticasGenerales(referencias);
        const recientes = Statistics.obtenerReferenciasRecientes(referencias, 5);
        const prioritarias = Statistics.obtenerReferenciasPrioritarias(referencias, 5);

        return `
      <div class="dashboard">
        <div class="dashboard-header">
          <h1>Dashboard de Colecciones</h1>
          <p class="text-gray">Resumen general del estado de las referencias</p>
        </div>
        
        <!-- KPIs Principales -->
        <div class="grid grid-cols-4 mb-6">
          ${this.renderKPI('Total Referencias', stats.total, '📊', 'primary')}
          ${this.renderKPI('Total Unidades', stats.totalUnidades, '📦', 'success')}
          ${this.renderKPI('Con Bordado', stats.conBordado, '🎨', 'warning')}
          ${this.renderKPI('Con Semielaborado', stats.conSemielaborado, '✂️', 'info')}
        </div>
        
        <!-- Gráficos de Distribución -->
        <div class="grid grid-cols-2 mb-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Por Status</h3>
            </div>
            <div class="card-body">
              ${this.renderDistribucion(stats.porStatus)}
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Por Colección</h3>
            </div>
            <div class="card-body">
              ${this.renderDistribucion(stats.porColeccion)}
            </div>
          </div>
        </div>
        
        <!-- Tablas de Referencias -->
        <div class="grid grid-cols-2">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Referencias Recientes</h3>
            </div>
            <div class="card-body">
              ${this.renderTablaRecientes(recientes)}
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Referencias Prioritarias</h3>
            </div>
            <div class="card-body">
              ${this.renderTablaPrioritarias(prioritarias)}
            </div>
          </div>
        </div>
      </div>
    `;
    }

    static renderKPI(titulo, valor, icono, tipo) {
        return `
      <div class="card card-glass">
        <div class="flex items-center gap-4">
          <div style="font-size: 3rem;">${icono}</div>
          <div>
            <div class="text-gray" style="font-size: 0.875rem; margin-bottom: 0.25rem;">${titulo}</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--${tipo}-600);">${valor}</div>
          </div>
        </div>
      </div>
    `;
    }

    static renderDistribucion(datos) {
        const total = Object.values(datos).reduce((sum, val) => sum + val, 0);

        return `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${Object.entries(datos).map(([key, value]) => {
            const porcentaje = ((value / total) * 100).toFixed(1);
            return `
            <div>
              <div class="flex justify-between mb-2">
                <span style="font-weight: 500;">${key}</span>
                <span class="text-gray">${value} (${porcentaje}%)</span>
              </div>
              <div style="background: var(--gray-200); height: 8px; border-radius: 999px; overflow: hidden;">
                <div style="background: var(--gradient-primary); height: 100%; width: ${porcentaje}%; transition: width 0.5s;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    }

    static renderTablaRecientes(referencias) {
        if (referencias.length === 0) {
            return '<p class="text-gray text-center">No hay referencias recientes</p>';
        }

        return `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${referencias.map(ref => `
          <div class="flex justify-between items-center" style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; cursor: pointer;" onclick="app.verDetalle('${ref.id}')">
            <div>
              <div style="font-weight: 600;">${ref.nombreReferencia}</div>
              <div class="text-gray" style="font-size: 0.875rem;">${ref.ref} - ${ref.coleccion}</div>
            </div>
            <span class="badge badge-${this.getStatusColor(ref.status)}">${ref.status}</span>
          </div>
        `).join('')}
      </div>
    `;
    }

    static renderTablaPrioritarias(referencias) {
        if (referencias.length === 0) {
            return '<p class="text-gray text-center">No hay referencias prioritarias</p>';
        }

        return `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${referencias.map(ref => `
          <div class="flex justify-between items-center" style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; cursor: pointer;" onclick="app.verDetalle('${ref.id}')">
            <div>
              <div style="font-weight: 600;">${ref.nombreReferencia}</div>
              <div class="text-gray" style="font-size: 0.875rem;">${ref.ref} - ${ref.coleccion}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-error">P${ref.prioridadFirstBuy}</span>
              <span class="badge badge-${this.getStatusColor(ref.status)}">${ref.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    }

    static getStatusColor(status) {
        const colores = {
            'En Diseño': 'info',
            'En Muestra': 'warning',
            'En Contramuestra': 'warning',
            'En Producción': 'primary',
            'Completado': 'success',
            'Pausado': 'gray',
            'Cancelado': 'error'
        };
        return colores[status] || 'gray';
    }
}

// ============================================
// COMPONENTE: LISTA DE REFERENCIAS
// ============================================
class ListaReferenciasComponent {
    static render(referencias, filtros = {}) {
        return `
      <div class="lista-referencias">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1>Referencias</h1>
            <p class="text-gray">Gestión de todas las referencias de colecciones</p>
          </div>
          <button class="btn btn-primary" onclick="app.mostrarFormularioNuevo()">
            <span>➕</span>
            Nueva Referencia
          </button>
        </div>
        
        <!-- Filtros -->
        ${this.renderFiltros(filtros)}
        
        <!-- Tabla -->
        <div class="card mt-6">
          ${this.renderTabla(referencias)}
        </div>
      </div>
    `;
    }

    static renderFiltros(filtros) {
        return `
      <div class="card">
        <div class="grid grid-cols-4 gap-4">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Colección</label>
            <select class="form-select" id="filtro-coleccion" onchange="app.aplicarFiltros()">
              <option value="">Todas</option>
              ${COLECCIONES.map(col => `
                <option value="${col}" ${filtros.coleccion === col ? 'selected' : ''}>${col}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Status</label>
            <select class="form-select" id="filtro-status" onchange="app.aplicarFiltros()">
              <option value="">Todos</option>
              ${STATUS_OPTIONS.map(status => `
                <option value="${status}" ${filtros.status === status ? 'selected' : ''}>${status}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Línea</label>
            <select class="form-select" id="filtro-linea" onchange="app.aplicarFiltros()">
              <option value="">Todas</option>
              ${LINEAS.map(linea => `
                <option value="${linea}" ${filtros.linea === linea ? 'selected' : ''}>${linea}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Ordenar por</label>
            <select class="form-select" id="filtro-orden" onchange="app.aplicarFiltros()">
              <option value="ref">Referencia</option>
              <option value="nombreReferencia">Nombre</option>
              <option value="status">Status</option>
              <option value="prioridadFirstBuy">Prioridad</option>
            </select>
          </div>
        </div>
      </div>
    `;
    }

    static renderTabla(referencias) {
        if (referencias.length === 0) {
            return `
        <div style="padding: 3rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
          <h3>No hay referencias</h3>
          <p class="text-gray">No se encontraron referencias con los filtros aplicados</p>
        </div>
      `;
        }

        return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Nombre</th>
              <th>Colección</th>
              <th>Color</th>
              <th>Línea</th>
              <th>Status</th>
              <th>Prioridad</th>
              <th>Unidades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${referencias.map(ref => `
              <tr>
                <td><strong>${ref.ref}</strong></td>
                <td>${ref.nombreReferencia}</td>
                <td><span class="badge badge-primary">${ref.coleccion}</span></td>
                <td>${ref.color}</td>
                <td>${ref.linea}</td>
                <td><span class="badge badge-${DashboardComponent.getStatusColor(ref.status)}">${ref.status}</span></td>
                <td>
                  ${ref.prioridadFirstBuy > 0 ? `<span class="badge badge-error">P${ref.prioridadFirstBuy}</span>` : '-'}
                </td>
                <td>${ref.unidadesProduccion.total || 0}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary" onclick="app.verDetalle('${ref.id}')" title="Ver detalle">👁️</button>
                    <button class="btn btn-sm btn-secondary" onclick="app.editarReferencia('${ref.id}')" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-secondary" onclick="app.eliminarReferencia('${ref.id}')" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="padding: 1rem; border-top: 1px solid var(--gray-200); text-align: center; color: var(--gray-500);">
        Mostrando ${referencias.length} referencia${referencias.length !== 1 ? 's' : ''}
      </div>
    `;
    }
}

// ============================================
// COMPONENTE: DETALLE DE REFERENCIA
// ============================================
class DetalleReferenciaComponent {
    static render(referencia) {
        if (!referencia) {
            return '<div class="card"><p>Referencia no encontrada</p></div>';
        }

        return `
      <div class="detalle-referencia">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1>${referencia.nombreReferencia}</h1>
            <p class="text-gray">Ref: ${referencia.ref} | ${referencia.coleccion}</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" onclick="app.volverLista()">← Volver</button>
            <button class="btn btn-primary" onclick="app.editarReferencia('${referencia.id}')">✏️ Editar</button>
          </div>
        </div>
        
        <!-- Información Principal -->
        <div class="grid grid-cols-3 mb-6">
          ${this.renderInfoCard('Status General', referencia.status, 'badge-' + DashboardComponent.getStatusColor(referencia.status))}
          ${this.renderInfoCard('Status Taller', referencia.statusTaller, 'badge-info')}
          ${this.renderInfoCard('Prioridad', referencia.prioridadFirstBuy > 0 ? `P${referencia.prioridadFirstBuy}` : 'Sin prioridad', 'badge-error')}
        </div>
        
        <!-- Secciones Colapsables -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${this.renderSeccion('Información Básica', this.renderInfoBasica(referencia), true)}
          ${this.renderSeccion('Características de la Prenda', this.renderCaracteristicas(referencia))}
          ${this.renderSeccion('Tela de Lucir', this.renderTela(referencia))}
          ${this.renderSeccion('Procesos Especiales', this.renderProcesos(referencia))}
          ${this.renderSeccion('Unidades de Producción', this.renderUnidades(referencia))}
          ${this.renderSeccion('Moldería y Corte', this.renderMolderia(referencia))}
          ${this.renderSeccion('Confección', this.renderConfeccion(referencia))}
          ${this.renderSeccion('Contramuestras', this.renderContramuestras(referencia))}
        </div>
      </div>
    `;
    }

    static renderInfoCard(titulo, valor, badgeClass) {
        return `
      <div class="card card-glass text-center">
        <div class="text-gray" style="font-size: 0.875rem; margin-bottom: 0.5rem;">${titulo}</div>
        <span class="badge ${badgeClass}" style="font-size: 1rem; padding: 0.5rem 1rem;">${valor}</span>
      </div>
    `;
    }

    static renderSeccion(titulo, contenido, abierto = false) {
        const id = titulo.replace(/\s+/g, '-').toLowerCase();
        return `
      <div class="card">
        <div class="card-header" style="cursor: pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
          <h3 class="card-title">${titulo}</h3>
          <span style="font-size: 1.5rem;">▼</span>
        </div>
        <div class="card-body ${abierto ? '' : 'hidden'}" id="${id}">
          ${contenido}
        </div>
      </div>
    `;
    }

    static renderInfoBasica(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Referencia', ref.ref)}
        ${this.renderCampo('Código MD', ref.codigoMD)}
        ${this.renderCampo('Código PT', ref.codigoPT)}
        ${this.renderCampo('Nombre', ref.nombreReferencia)}
        ${this.renderCampo('Color', ref.color)}
        ${this.renderCampo('Código Color', ref.codColor)}
        ${this.renderCampo('Colección', ref.coleccion)}
        ${this.renderCampo('Cápsula', ref.capsula)}
        ${this.renderCampo('Diseñador', ref.disenador)}
        ${this.renderCampo('Modista', ref.modista)}
      </div>
    `;
    }

    static renderCaracteristicas(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Línea', ref.linea)}
        ${this.renderCampo('Sublínea', ref.sublinea)}
        ${this.renderCampo('Tipo Referencia', ref.tipoRef)}
        ${this.renderCampo('Tallaje', ref.tallaje)}
        ${this.renderCampo('Largo', ref.largo)}
        ${this.renderCampo('Closure', ref.closure)}
        ${this.renderCampo('Includes', ref.includes || 'N/A')}
      </div>
    `;
    }

    static renderTela(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Código Tela', ref.codigoTelaLucir)}
        ${this.renderCampo('Descripción', ref.descripcionTela)}
        ${this.renderCampo('Ancho Tela', ref.anchoTela)}
        ${this.renderCampo('Base Textil', ref.baseTextil)}
        ${this.renderCampo('Ubicación en Trazo', ref.ubicacionEnTrazo ? 'Sí' : 'No')}
        ${this.renderCampo('Modificación de Arte', ref.modificacionArte ? 'Sí' : 'No')}
        ${this.renderCampo('All Over', ref.allOver ? 'Sí' : 'No')}
      </div>
    `;
    }

    static renderProcesos(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Bordado', ref.bordadoAplica ? 'Sí' : 'No')}
        ${this.renderCampo('Descripción Bordado', ref.bordadoDescripcion || 'N/A')}
        ${this.renderCampo('Status Bordado', ref.bordadoStatus || 'N/A')}
        ${this.renderCampo('Semielaborado', ref.semielaboradoAplica ? 'Sí' : 'No')}
        ${this.renderCampo('Descripción Semielaborado', ref.semielaboradoDescripcion || 'N/A')}
        ${this.renderCampo('Proveedor Proceso Externo', ref.procesoExternoProveedor || 'N/A')}
        ${this.renderCampo('Proceso Externo', ref.procesoExternoDescripcion || 'N/A')}
        ${this.renderCampo('Costo Proceso Externo', ref.procesoExternoCosto ? `$${ref.procesoExternoCosto}` : 'N/A')}
      </div>
    `;
    }

    static renderUnidades(ref) {
        const u = ref.unidadesProduccion;
        return `
      <div class="grid grid-cols-4 gap-4">
        ${u.talla0 > 0 ? this.renderCampo('Talla 0', u.talla0) : ''}
        ${u.talla2 > 0 ? this.renderCampo('Talla 2', u.talla2) : ''}
        ${u.talla4 > 0 ? this.renderCampo('Talla 4', u.talla4) : ''}
        ${u.talla6 > 0 ? this.renderCampo('Talla 6', u.talla6) : ''}
        ${u.talla8 > 0 ? this.renderCampo('Talla 8', u.talla8) : ''}
        ${u.talla10 > 0 ? this.renderCampo('Talla 10', u.talla10) : ''}
        ${u.talla12 > 0 ? this.renderCampo('Talla 12', u.talla12) : ''}
        ${u.tallaXS > 0 ? this.renderCampo('Talla XS', u.tallaXS) : ''}
        ${u.tallaS > 0 ? this.renderCampo('Talla S', u.tallaS) : ''}
        ${u.tallaM > 0 ? this.renderCampo('Talla M', u.tallaM) : ''}
        ${u.tallaL > 0 ? this.renderCampo('Talla L', u.tallaL) : ''}
        ${u.tallaXL > 0 ? this.renderCampo('Talla XL', u.tallaXL) : ''}
      </div>
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--gray-200);">
        <strong style="font-size: 1.25rem;">Total: ${u.total} unidades</strong>
      </div>
    `;
    }

    static renderMolderia(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Fecha Inicio Moldería', ref.fechaInicioMolderia || 'N/A')}
        ${this.renderCampo('Fecha Fin Moldería', ref.fechaFinMolderia || 'N/A')}
        ${this.renderCampo('Comentarios Moldería', ref.comentariosMolderia || 'N/A')}
        ${this.renderCampo('Fecha Corte #1', ref.corteFecha1 || 'N/A')}
        ${this.renderCampo('Tipo Corte #1', ref.corteTipo1 || 'N/A')}
        ${this.renderCampo('Total Cortes Piezas', ref.totalCortesPiezas)}
        ${this.renderCampo('Total Cortes Muestras', ref.totalCortesMuestras)}
      </div>
    `;
    }

    static renderConfeccion(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Modista Contramuestra', ref.modistaContramuestra || 'N/A')}
        ${this.renderCampo('Fecha Inicio', ref.fechaInicioConfeccion || 'N/A')}
        ${this.renderCampo('Fecha Entrega', ref.fechaEntregaConfeccion || 'N/A')}
        ${this.renderCampo('Status Confección', ref.statusConfeccion || 'N/A')}
        ${this.renderCampo('Tiempo Confección', ref.tiempoConfeccion ? `${ref.tiempoConfeccion} min` : 'N/A')}
        ${this.renderCampo('Fecha Medición Fase 1', ref.medicionFase1 || 'N/A')}
        ${this.renderCampo('Comentarios Medición', ref.comentariosMedicion1 || 'N/A')}
        ${this.renderCampo('Foto Contramuestra', ref.fotoContramuestra ? 'Sí' : 'No')}
      </div>
    `;
    }

    static renderContramuestras(ref) {
        return `
      <div class="grid grid-cols-2 gap-4">
        ${this.renderCampo('Nombre Contramuestra', ref.nombreContramuestra || 'N/A')}
        ${this.renderCampo('Talla Contramuestra', ref.tallaContramuestra || 'N/A')}
        ${this.renderCampo('Código OT', ref.codigoOT || 'N/A')}
        ${this.renderCampo('Prioridad', ref.prioridadContramuestra || 'N/A')}
        ${this.renderCampo('Fecha Meta Entrega', ref.fechaMetaEntrega || 'N/A')}
        ${this.renderCampo('Status Contramuestra', ref.statusContramuestra || 'N/A')}
        ${this.renderCampo('Fecha Traslado SAP', ref.fechaTrasladoSAP || 'N/A')}
        ${this.renderCampo('Fecha Despacho ZF', ref.fechaDespachoZF || 'N/A')}
      </div>
    `;
    }

    static renderCampo(label, valor) {
        return `
      <div>
        <div class="text-gray" style="font-size: 0.875rem; margin-bottom: 0.25rem;">${label}</div>
        <div style="font-weight: 500;">${valor}</div>
      </div>
    `;
    }
}

// ============================================
// COMPONENTE: FORMULARIO
// ============================================
class FormularioReferenciaComponent {
    static render(referencia = null) {
        const esNuevo = !referencia;
        const ref = referencia || new Referencia();

        return `
      <div class="formulario-referencia">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1>${esNuevo ? 'Nueva Referencia' : 'Editar Referencia'}</h1>
            <p class="text-gray">${esNuevo ? 'Crear una nueva referencia' : `Editando: ${ref.nombreReferencia}`}</p>
          </div>
          <button class="btn btn-secondary" onclick="app.volverLista()">← Cancelar</button>
        </div>
        
        <form id="form-referencia" onsubmit="app.guardarReferencia(event, '${ref.id}')">
          <!-- Información Básica -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Información Básica</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-4">
                ${this.renderInput('ref', 'Referencia', ref.ref, 'text', true)}
                ${this.renderInput('nombreReferencia', 'Nombre Referencia', ref.nombreReferencia, 'text', true)}
                ${this.renderInput('codigoMD', 'Código MD', ref.codigoMD, 'text')}
                ${this.renderInput('codigoPT', 'Código PT', ref.codigoPT, 'text')}
                ${this.renderSelect('coleccion', 'Colección', COLECCIONES, ref.coleccion, true)}
                ${this.renderInput('capsula', 'Cápsula', ref.capsula, 'text')}
                ${this.renderInput('color', 'Color', ref.color, 'text', true)}
                ${this.renderInput('codColor', 'Código Color', ref.codColor, 'text')}
              </div>
            </div>
          </div>
          
          <!-- Status -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Status</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-4">
                ${this.renderSelect('status', 'Status General', STATUS_OPTIONS, ref.status, true)}
                ${this.renderSelect('disenador', 'Diseñador', DISEÑADORES, ref.disenador)}
                ${this.renderSelect('statusTaller', 'Status Taller', STATUS_TALLER, ref.statusTaller)}
                ${this.renderSelect('modista', 'Modista', MODISTAS, ref.modista)}
              </div>
            </div>
          </div>
          
          <!-- Características -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Características de la Prenda</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-4">
                ${this.renderSelect('linea', 'Línea', LINEAS, ref.linea, true)}
                ${this.renderSelect('sublinea', 'Sublínea', SUBLINEAS, ref.sublinea)}
                ${this.renderSelect('tallaje', 'Tallaje', TALLAJES, ref.tallaje)}
                ${this.renderInput('largo', 'Largo', ref.largo, 'text')}
                ${this.renderInput('closure', 'Closure', ref.closure, 'text')}
                ${this.renderInput('includes', 'Includes', ref.includes, 'text')}
              </div>
            </div>
          </div>
          
          <!-- Tela -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Tela de Lucir</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-4">
                ${this.renderInput('codigoTelaLucir', 'Código Tela', ref.codigoTelaLucir, 'text')}
                ${this.renderInput('descripcionTela', 'Descripción Tela', ref.descripcionTela, 'text')}
                ${this.renderInput('anchoTela', 'Ancho Tela', ref.anchoTela, 'text')}
                ${this.renderSelect('baseTextil', 'Base Textil', BASES_TEXTILES, ref.baseTextil)}
              </div>
            </div>
          </div>
          
          <!-- Prioridad -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Prioridad y Producción</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-4">
                ${this.renderInput('prioridadFirstBuy', 'Prioridad First Buy (1-10)', ref.prioridadFirstBuy, 'number')}
                ${this.renderInput('prioridadContramuestra', 'Prioridad Contramuestra (1-10)', ref.prioridadContramuestra, 'number')}
              </div>
            </div>
          </div>
          
          <!-- Botones -->
          <div class="flex justify-end gap-4">
            <button type="button" class="btn btn-secondary" onclick="app.volverLista()">Cancelar</button>
            <button type="submit" class="btn btn-success">💾 Guardar Referencia</button>
          </div>
        </form>
      </div>
    `;
    }

    static renderInput(name, label, value, type = 'text', required = false) {
        return `
      <div class="form-group">
        <label class="form-label ${required ? 'form-label-required' : ''}">${label}</label>
        <input 
          type="${type}" 
          name="${name}" 
          id="${name}" 
          class="form-input" 
          value="${value || ''}"
          ${required ? 'required' : ''}
        />
      </div>
    `;
    }

    static renderSelect(name, label, options, value, required = false) {
        return `
      <div class="form-group">
        <label class="form-label ${required ? 'form-label-required' : ''}">${label}</label>
        <select 
          name="${name}" 
          id="${name}" 
          class="form-select"
          ${required ? 'required' : ''}
        >
          <option value="">Seleccionar...</option>
          ${options.map(opt => `
            <option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>
          `).join('')}
        </select>
      </div>
    `;
    }
}

// Exportar componentes
window.DashboardComponent = DashboardComponent;
window.ListaReferenciasComponent = ListaReferenciasComponent;
window.DetalleReferenciaComponent = DetalleReferenciaComponent;
window.FormularioReferenciaComponent = FormularioReferenciaComponent;
