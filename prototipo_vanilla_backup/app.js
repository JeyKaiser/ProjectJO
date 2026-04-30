// ============================================
// CONTROLADOR PRINCIPAL - GESTIÓN DE COLECCIONES JO
// ============================================

class App {
    constructor() {
        this.referencias = [];
        this.filtros = {
            texto: '',
            coleccion: '',
            status: '',
            linea: '',
            ordenarPor: 'ref',
            direccion: 'asc'
        };
        this.vistaActual = 'dashboard';
        this.referenciaActual = null;

        this.init();
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    init() {
        console.log('🚀 Iniciando aplicación Gestión de Colecciones JO...');

        // Cargar datos
        this.cargarDatos();

        // Configurar búsqueda global
        this.configurarBusquedaGlobal();

        // Configurar selector de colección
        this.configurarSelectorColeccion();

        // Renderizar vista inicial
        this.mostrarDashboard();

        console.log('✅ Aplicación iniciada correctamente');
    }

    cargarDatos() {
        // Intentar cargar datos existentes
        this.referencias = StorageManager.cargarReferencias();

        // Si no hay datos, inicializar con datos de prueba
        if (this.referencias.length === 0) {
            console.log('📦 No hay datos existentes, generando datos de prueba...');
            this.referencias = StorageManager.inicializarDatosPrueba();
        } else {
            console.log(`📊 ${this.referencias.length} referencias cargadas`);
        }
    }

    configurarBusquedaGlobal() {
        const searchInput = document.getElementById('search-global');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtros.texto = e.target.value;
                if (this.vistaActual === 'lista') {
                    this.aplicarFiltros();
                }
            });
        }
    }

    configurarSelectorColeccion() {
        const selector = document.getElementById('selector-coleccion');
        if (selector) {
            selector.addEventListener('change', (e) => {
                this.filtros.coleccion = e.target.value;
                if (this.vistaActual === 'lista') {
                    this.aplicarFiltros();
                }
            });
        }
    }

    // ============================================
    // NAVEGACIÓN
    // ============================================
    mostrarDashboard() {
        this.vistaActual = 'dashboard';
        this.actualizarNavegacion('nav-dashboard');

        const referencias = this.obtenerReferenciasFiltradas();
        const html = DashboardComponent.render(referencias);

        this.renderizarContenido(html);
    }

    mostrarLista() {
        this.vistaActual = 'lista';
        this.actualizarNavegacion('nav-referencias');

        const referencias = this.obtenerReferenciasFiltradas();
        const html = ListaReferenciasComponent.render(referencias, this.filtros);

        this.renderizarContenido(html);
    }

    verDetalle(id) {
        this.vistaActual = 'detalle';
        this.referenciaActual = StorageManager.buscarReferencia(id);

        const html = DetalleReferenciaComponent.render(this.referenciaActual);
        this.renderizarContenido(html);
    }

    editarReferencia(id) {
        this.vistaActual = 'formulario';
        this.referenciaActual = StorageManager.buscarReferencia(id);

        const html = FormularioReferenciaComponent.render(this.referenciaActual);
        this.renderizarContenido(html);
    }

    mostrarFormularioNuevo() {
        this.vistaActual = 'formulario';
        this.referenciaActual = null;

        const html = FormularioReferenciaComponent.render();
        this.renderizarContenido(html);
    }

    volverLista() {
        this.mostrarLista();
    }

    actualizarNavegacion(itemActivo) {
        // Remover clase active de todos los items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Agregar clase active al item actual
        const itemElement = document.getElementById(itemActivo);
        if (itemElement) {
            itemElement.classList.add('active');
        }
    }

    renderizarContenido(html) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = html;
            contentArea.classList.add('fade-in');

            // Scroll al inicio
            window.scrollTo(0, 0);
        }
    }

    // ============================================
    // FILTROS Y BÚSQUEDA
    // ============================================
    aplicarFiltros() {
        // Obtener valores de los filtros
        const filtroColeccion = document.getElementById('filtro-coleccion');
        const filtroStatus = document.getElementById('filtro-status');
        const filtroLinea = document.getElementById('filtro-linea');
        const filtroOrden = document.getElementById('filtro-orden');

        if (filtroColeccion) this.filtros.coleccion = filtroColeccion.value;
        if (filtroStatus) this.filtros.status = filtroStatus.value;
        if (filtroLinea) this.filtros.linea = filtroLinea.value;
        if (filtroOrden) this.filtros.ordenarPor = filtroOrden.value;

        // Re-renderizar lista
        this.mostrarLista();
    }

    obtenerReferenciasFiltradas() {
        return SearchEngine.aplicarFiltros(this.referencias, this.filtros);
    }

    // ============================================
    // CRUD OPERACIONES
    // ============================================
    guardarReferencia(event, id) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        // Convertir FormData a objeto
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Convertir números
        if (data.prioridadFirstBuy) data.prioridadFirstBuy = parseInt(data.prioridadFirstBuy);
        if (data.prioridadContramuestra) data.prioridadContramuestra = parseInt(data.prioridadContramuestra);

        let exito = false;

        if (id && id !== 'undefined') {
            // Actualizar referencia existente
            exito = StorageManager.actualizarReferencia(id, data);

            if (exito) {
                this.mostrarNotificacion('✅ Referencia actualizada exitosamente', 'success');
            } else {
                this.mostrarNotificacion('❌ Error al actualizar la referencia', 'error');
            }
        } else {
            // Crear nueva referencia
            const nuevaRef = new Referencia(data);
            exito = StorageManager.agregarReferencia(nuevaRef);

            if (exito) {
                this.mostrarNotificacion('✅ Referencia creada exitosamente', 'success');
            } else {
                this.mostrarNotificacion('❌ Error al crear la referencia', 'error');
            }
        }

        if (exito) {
            // Recargar datos
            this.referencias = StorageManager.cargarReferencias();

            // Volver a la lista
            setTimeout(() => {
                this.mostrarLista();
            }, 1000);
        }
    }

    eliminarReferencia(id) {
        const confirmar = confirm('¿Está seguro de que desea eliminar esta referencia?');

        if (confirmar) {
            const exito = StorageManager.eliminarReferencia(id);

            if (exito) {
                this.mostrarNotificacion('✅ Referencia eliminada exitosamente', 'success');

                // Recargar datos
                this.referencias = StorageManager.cargarReferencias();

                // Re-renderizar vista actual
                if (this.vistaActual === 'lista') {
                    this.mostrarLista();
                } else if (this.vistaActual === 'detalle') {
                    this.mostrarLista();
                }
            } else {
                this.mostrarNotificacion('❌ Error al eliminar la referencia', 'error');
            }
        }
    }

    // ============================================
    // UTILIDADES
    // ============================================
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
      position: fixed;
      top: 90px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${tipo === 'success' ? 'var(--success)' : tipo === 'error' ? 'var(--error)' : 'var(--info)'};
      color: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: 1000;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    `;

        document.body.appendChild(notificacion);

        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.opacity = '0';
            notificacion.style.transform = 'translateX(100%)';
            notificacion.style.transition = 'all 0.3s ease-out';

            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    exportarDatos() {
        const datos = StorageManager.cargarReferencias();
        const json = JSON.stringify(datos, null, 2);

        // Crear blob y descargar
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `colecciones_jo_${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        this.mostrarNotificacion('📥 Datos exportados exitosamente', 'success');
    }

    limpiarDatos() {
        const confirmar = confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos. ¿Está seguro?');

        if (confirmar) {
            const confirmar2 = confirm('Esta acción NO se puede deshacer. ¿Continuar?');

            if (confirmar2) {
                StorageManager.limpiarDatos();
                this.referencias = [];
                this.mostrarNotificacion('🗑️ Todos los datos han sido eliminados', 'success');
                this.mostrarDashboard();
            }
        }
    }

    regenerarDatosPrueba() {
        const confirmar = confirm('Esto reemplazará todos los datos actuales con nuevos datos de prueba. ¿Continuar?');

        if (confirmar) {
            StorageManager.limpiarDatos();
            this.referencias = StorageManager.inicializarDatosPrueba();
            this.mostrarNotificacion('🔄 Datos de prueba regenerados', 'success');
            this.mostrarDashboard();
        }
    }
}

// ============================================
// INICIAR APLICACIÓN
// ============================================
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();

    // Hacer app global para acceso desde HTML
    window.app = app;
});
