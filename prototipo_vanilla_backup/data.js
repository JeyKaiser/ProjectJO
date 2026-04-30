// ============================================
// CAPA DE DATOS - GESTIÓN DE COLECCIONES JO
// ============================================

// Constantes de la aplicación
const COLECCIONES = [
  'WINTER SUN',
  'RESORT RTW',
  'SPRING SUMMER',
  'SUMMER VACATION',
  'PREFALL RTW',
  'FALL WINTER'
];

const STATUS_OPTIONS = [
  'En Diseño',
  'En Muestra',
  'En Contramuestra',
  'En Producción',
  'Completado',
  'Pausado',
  'Cancelado'
];

const STATUS_TALLER = [
  'Pendiente',
  'En Moldería',
  'En Corte',
  'En Confección',
  'En Revisión',
  'Aprobado'
];

const LINEAS = [
  'Casual',
  'Formal',
  'Deportiva',
  'Elegante',
  'Bohemia',
  'Minimalista'
];

const SUBLINEAS = [
  'Blusas',
  'Vestidos',
  'Pantalones',
  'Faldas',
  'Chaquetas',
  'Accesorios'
];

const TALLAJES = [
  'Numérico (0-12)',
  'Letras (XS-XL)',
  'Único'
];

const BASES_TEXTILES = [
  'Algodón',
  'Lino',
  'Seda',
  'Poliéster',
  'Viscosa',
  'Mezcla'
];

const COLORES = [
  { nombre: 'Blanco', codigo: 'BL-001' },
  { nombre: 'Negro', codigo: 'NG-001' },
  { nombre: 'Azul Marino', codigo: 'AZ-001' },
  { nombre: 'Rojo', codigo: 'RJ-001' },
  { nombre: 'Verde Esmeralda', codigo: 'VD-001' },
  { nombre: 'Beige', codigo: 'BG-001' },
  { nombre: 'Rosa Palo', codigo: 'RS-001' },
  { nombre: 'Gris Perla', codigo: 'GR-001' },
  { nombre: 'Amarillo Mostaza', codigo: 'AM-001' },
  { nombre: 'Terracota', codigo: 'TR-001' }
];

const DISEÑADORES = [
  'María González',
  'Carlos Rodríguez',
  'Ana Martínez',
  'Luis Fernández',
  'Sofia López'
];

const MODISTAS = [
  'Carmen Silva',
  'Rosa Pérez',
  'Laura Torres',
  'Patricia Ruiz',
  'Elena Morales'
];

// ============================================
// CLASE PRINCIPAL - REFERENCIA
// ============================================
class Referencia {
  constructor(data = {}) {
    // Información Básica
    this.id = data.id || this.generateId();
    this.ref = data.ref || '';
    this.imagen = data.imagen || '';
    this.codigoMD = data.codigoMD || '';
    this.codigoPT = data.codigoPT || '';
    this.nombreReferencia = data.nombreReferencia || '';
    this.color = data.color || '';
    this.codColor = data.codColor || '';
    
    // Colección
    this.coleccion = data.coleccion || '';
    this.capsula = data.capsula || '';
    
    // Referentes
    this.fotoBasadoEn = data.fotoBasadoEn || '';
    this.ptReferente = data.ptReferente || '';
    this.basadoEn = data.basadoEn || '';
    
    // Status
    this.status = data.status || 'En Diseño';
    this.disenador = data.disenador || '';
    
    // Status de Colección
    this.statusTaller = data.statusTaller || 'Pendiente';
    this.modista = data.modista || '';
    this.fotosInternas = data.fotosInternas || false;
    
    // Características
    this.linea = data.linea || '';
    this.sublinea = data.sublinea || '';
    this.tipoRef = data.tipoRef || '';
    this.tallaje = data.tallaje || '';
    this.largo = data.largo || '';
    this.closure = data.closure || '';
    
    // Includes
    this.includes = data.includes || '';
    
    // Tela de Lucir
    this.codigoTelaLucir = data.codigoTelaLucir || '';
    this.fotoTela = data.fotoTela || '';
    this.descripcionTela = data.descripcionTela || '';
    this.anchoTela = data.anchoTela || '';
    this.baseTextil = data.baseTextil || '';
    this.ubicacionEnTrazo = data.ubicacionEnTrazo || false;
    this.modificacionArte = data.modificacionArte || false;
    this.allOver = data.allOver || false;
    
    // Variación de Color
    this.variacionColor = data.variacionColor || false;
    this.refVariacion = data.refVariacion || '';
    
    // Bordado
    this.bordadoAplica = data.bordadoAplica || false;
    this.bordadoDescripcion = data.bordadoDescripcion || '';
    this.bordadoStatus = data.bordadoStatus || '';
    
    // Semielaborados
    this.semielaboradoAplica = data.semielaboradoAplica || false;
    this.semielaboradoDescripcion = data.semielaboradoDescripcion || '';
    
    // Proceso Externo
    this.procesoExternoProveedor = data.procesoExternoProveedor || '';
    this.procesoExternoDescripcion = data.procesoExternoDescripcion || '';
    this.procesoExternoCosto = data.procesoExternoCosto || 0;
    
    // Time Collection
    this.especificacionConfeccion = data.especificacionConfeccion || '';
    this.escaladoMolderia = data.escaladoMolderia || '';
    this.dificultadPrenda = data.dificultadPrenda || '';
    this.prioridadFirstBuy = data.prioridadFirstBuy || 0;
    this.requiereMuestra = data.requiereMuestra || true;
    
    // Unidades de Producción
    this.unidadesProduccion = data.unidadesProduccion || {
      talla0: 0,
      talla2: 0,
      talla4: 0,
      talla6: 0,
      talla8: 0,
      talla10: 0,
      talla12: 0,
      tallaXS: 0,
      tallaS: 0,
      tallaM: 0,
      tallaL: 0,
      tallaXL: 0,
      total: 0
    };
    
    // Maquila
    this.tipoTejido = data.tipoTejido || '';
    this.complejidadCorte = data.complejidadCorte || '';
    this.complejidadConfeccion = data.complejidadConfeccion || '';
    
    // Moldería
    this.fechaInicioMolderia = data.fechaInicioMolderia || null;
    this.fechaFinMolderia = data.fechaFinMolderia || null;
    this.comentariosMolderia = data.comentariosMolderia || '';
    
    // Corte de Contramuestras
    this.corteFecha1 = data.corteFecha1 || null;
    this.corteTipo1 = data.corteTipo1 || '';
    this.totalCortesPiezas = data.totalCortesPiezas || 0;
    this.totalCortesMuestras = data.totalCortesMuestras || 0;
    
    // Confección
    this.modistaContramuestra = data.modistaContramuestra || '';
    this.fechaInicioConfeccion = data.fechaInicioConfeccion || null;
    this.fechaEntregaConfeccion = data.fechaEntregaConfeccion || null;
    this.statusConfeccion = data.statusConfeccion || '';
    this.tiempoConfeccion = data.tiempoConfeccion || 0;
    
    // Medición
    this.medicionFase1 = data.medicionFase1 || null;
    this.comentariosMedicion1 = data.comentariosMedicion1 || '';
    this.fotoContramuestra = data.fotoContramuestra || false;
    
    // Fichas Técnicas
    this.especificadora = data.especificadora || '';
    this.fechaInicioEspecificacion = data.fechaInicioEspecificacion || null;
    this.fechaFinalEspecificacion = data.fechaFinalEspecificacion || null;
    
    // Status Contramuestra
    this.prioridadContramuestra = data.prioridadContramuestra || 0;
    this.fechaMetaEntrega = data.fechaMetaEntrega || null;
    this.statusContramuestra = data.statusContramuestra || '';
    
    // Contramuestras
    this.nombreContramuestra = data.nombreContramuestra || '';
    this.tallaContramuestra = data.tallaContramuestra || '';
    this.codigoOT = data.codigoOT || '';
    this.fechaTrasladoSAP = data.fechaTrasladoSAP || null;
    this.fechaDespachoZF = data.fechaDespachoZF || null;
    
    // Metadata
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaActualizacion = data.fechaActualizacion || new Date().toISOString();
    this.creadoPor = data.creadoPor || 'Sistema';
  }
  
  generateId() {
    return 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  calcularTotalUnidades() {
    const u = this.unidadesProduccion;
    this.unidadesProduccion.total = 
      u.talla0 + u.talla2 + u.talla4 + u.talla6 + u.talla8 + u.talla10 + u.talla12 +
      u.tallaXS + u.tallaS + u.tallaM + u.tallaL + u.tallaXL;
    return this.unidadesProduccion.total;
  }
}

// ============================================
// GENERADOR DE DATOS DE PRUEBA
// ============================================
class DataGenerator {
  static generarReferencias(cantidad = 10, coleccion = null) {
    const referencias = [];
    
    for (let i = 0; i < cantidad; i++) {
      const ref = this.generarReferenciaAleatoria(coleccion);
      referencias.push(ref);
    }
    
    return referencias;
  }
  
  static generarReferenciaAleatoria(coleccion = null) {
    const numRef = String(28000 + Math.floor(Math.random() * 1000)).padStart(5, '0');
    const colorData = this.randomItem(COLORES);
    const col = coleccion || this.randomItem(COLECCIONES);
    const sublinea = this.randomItem(SUBLINEAS);
    
    const data = {
      ref: numRef,
      codigoMD: `MD-2026-${numRef}`,
      codigoPT: `PT-2026-${numRef}`,
      nombreReferencia: this.generarNombrePrenda(sublinea),
      color: colorData.nombre,
      codColor: colorData.codigo,
      coleccion: col,
      capsula: this.generarNombreCapsula(),
      status: this.randomItem(STATUS_OPTIONS),
      disenador: this.randomItem(DISEÑADORES),
      statusTaller: this.randomItem(STATUS_TALLER),
      modista: this.randomItem(MODISTAS),
      fotosInternas: Math.random() > 0.5,
      linea: this.randomItem(LINEAS),
      sublinea: sublinea,
      tipoRef: 'Nueva',
      tallaje: this.randomItem(TALLAJES),
      largo: this.randomItem(['Corto', 'Medio', 'Largo']),
      closure: this.randomItem(['Botones', 'Cremallera', 'Ninguno', 'Cordón']),
      codigoTelaLucir: `TEL-${Math.floor(Math.random() * 1000)}`,
      descripcionTela: this.generarDescripcionTela(),
      anchoTela: this.randomItem(['1.40m', '1.50m', '1.60m', '1.80m']),
      baseTextil: this.randomItem(BASES_TEXTILES),
      ubicacionEnTrazo: Math.random() > 0.7,
      modificacionArte: Math.random() > 0.8,
      allOver: Math.random() > 0.85,
      bordadoAplica: Math.random() > 0.6,
      bordadoDescripcion: Math.random() > 0.6 ? 'Bordado floral en manga' : '',
      semielaboradoAplica: Math.random() > 0.7,
      dificultadPrenda: this.randomItem(['Baja', 'Intermedia', 'Alta']),
      prioridadFirstBuy: Math.floor(Math.random() * 10) + 1,
      requiereMuestra: Math.random() > 0.3,
      unidadesProduccion: this.generarUnidadesAleatorias(),
      tipoTejido: this.randomItem(['Tejido Plano', 'Tejido de Punto', 'Cuero']),
      complejidadCorte: this.randomItem(['Baja', 'Intermedia', 'Alta']),
      complejidadConfeccion: this.randomItem(['Baja', 'Intermedia', 'Alta']),
      prioridadContramuestra: Math.floor(Math.random() * 10) + 1,
      statusContramuestra: this.randomItem(['Pendiente', 'En Proceso', 'Completado']),
      nombreContramuestra: `OT${numRef}`,
      tallaContramuestra: this.randomItem(['S', 'M', 'L', '6', '8']),
      codigoOT: `OT${numRef}`,
      tiempoConfeccion: Math.floor(Math.random() * 300) + 60
    };
    
    // Agregar fechas aleatorias
    if (Math.random() > 0.5) {
      data.fechaInicioMolderia = this.generarFechaAleatoria(-30, -10);
      data.fechaFinMolderia = this.generarFechaAleatoria(-9, -1);
    }
    
    if (Math.random() > 0.4) {
      data.corteFecha1 = this.generarFechaAleatoria(-20, -5);
    }
    
    if (Math.random() > 0.3) {
      data.fechaInicioConfeccion = this.generarFechaAleatoria(-15, -5);
      data.fechaEntregaConfeccion = this.generarFechaAleatoria(-4, 5);
    }
    
    if (Math.random() > 0.4) {
      data.fechaMetaEntrega = this.generarFechaAleatoria(1, 30);
    }
    
    const referencia = new Referencia(data);
    referencia.calcularTotalUnidades();
    
    return referencia;
  }
  
  static generarNombrePrenda(sublinea) {
    const adjetivos = ['Romántica', 'Elegante', 'Casual', 'Moderna', 'Clásica', 'Bohemia', 'Sofisticada'];
    const estilos = ['Floral', 'Lisa', 'Estampada', 'Bordada', 'Plisada', 'Drapeada'];
    
    return `${sublinea.slice(0, -1)} ${this.randomItem(adjetivos)} ${this.randomItem(estilos)}`;
  }
  
  static generarNombreCapsula() {
    const nombres = ['Romántica', 'Urbana', 'Tropical', 'Minimalista', 'Bohemia', 'Elegante', 'Casual Chic'];
    return this.randomItem(nombres);
  }
  
  static generarDescripcionTela() {
    const descripciones = [
      'Algodón orgánico texturizado',
      'Lino natural premium',
      'Seda italiana estampada',
      'Viscosa fluida con caída',
      'Mezcla algodón-lino',
      'Popelina de algodón',
      'Crepe de seda',
      'Jersey de algodón'
    ];
    return this.randomItem(descripciones);
  }
  
  static generarUnidadesAleatorias() {
    const usar = Math.random() > 0.5 ? 'numericas' : 'letras';
    
    if (usar === 'numericas') {
      return {
        talla0: Math.floor(Math.random() * 20),
        talla2: Math.floor(Math.random() * 30),
        talla4: Math.floor(Math.random() * 40),
        talla6: Math.floor(Math.random() * 50),
        talla8: Math.floor(Math.random() * 40),
        talla10: Math.floor(Math.random() * 30),
        talla12: Math.floor(Math.random() * 20),
        tallaXS: 0,
        tallaS: 0,
        tallaM: 0,
        tallaL: 0,
        tallaXL: 0,
        total: 0
      };
    } else {
      return {
        talla0: 0,
        talla2: 0,
        talla4: 0,
        talla6: 0,
        talla8: 0,
        talla10: 0,
        talla12: 0,
        tallaXS: Math.floor(Math.random() * 20),
        tallaS: Math.floor(Math.random() * 40),
        tallaM: Math.floor(Math.random() * 50),
        tallaL: Math.floor(Math.random() * 40),
        tallaXL: Math.floor(Math.random() * 20),
        total: 0
      };
    }
  }
  
  static generarFechaAleatoria(diasMin, diasMax) {
    const hoy = new Date();
    const dias = Math.floor(Math.random() * (diasMax - diasMin + 1)) + diasMin;
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }
  
  static randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// ============================================
// GESTOR DE ALMACENAMIENTO
// ============================================
class StorageManager {
  static STORAGE_KEY = 'colecciones_jo_data';
  
  static guardarReferencias(referencias) {
    try {
      const data = JSON.stringify(referencias);
      localStorage.setItem(this.STORAGE_KEY, data);
      return true;
    } catch (error) {
      console.error('Error al guardar referencias:', error);
      return false;
    }
  }
  
  static cargarReferencias() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map(item => new Referencia(item));
    } catch (error) {
      console.error('Error al cargar referencias:', error);
      return [];
    }
  }
  
  static agregarReferencia(referencia) {
    const referencias = this.cargarReferencias();
    referencias.push(referencia);
    return this.guardarReferencias(referencias);
  }
  
  static actualizarReferencia(id, datosActualizados) {
    const referencias = this.cargarReferencias();
    const index = referencias.findIndex(ref => ref.id === id);
    
    if (index === -1) return false;
    
    referencias[index] = new Referencia({
      ...referencias[index],
      ...datosActualizados,
      fechaActualizacion: new Date().toISOString()
    });
    
    return this.guardarReferencias(referencias);
  }
  
  static eliminarReferencia(id) {
    const referencias = this.cargarReferencias();
    const filtradas = referencias.filter(ref => ref.id !== id);
    return this.guardarReferencias(filtradas);
  }
  
  static buscarReferencia(id) {
    const referencias = this.cargarReferencias();
    return referencias.find(ref => ref.id === id);
  }
  
  static inicializarDatosPrueba() {
    const existentes = this.cargarReferencias();
    if (existentes.length > 0) {
      console.log('Ya existen datos en el sistema');
      return existentes;
    }
    
    console.log('Generando datos de prueba...');
    const referencias = [];
    
    // Generar 10 referencias por colección
    COLECCIONES.forEach(coleccion => {
      const refs = DataGenerator.generarReferencias(10, coleccion);
      referencias.push(...refs);
    });
    
    this.guardarReferencias(referencias);
    console.log(`${referencias.length} referencias generadas exitosamente`);
    
    return referencias;
  }
  
  static limpiarDatos() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Datos eliminados');
  }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================
class SearchEngine {
  static buscarTexto(referencias, texto) {
    if (!texto) return referencias;
    
    const textoLower = texto.toLowerCase();
    
    return referencias.filter(ref => {
      return (
        ref.ref.toLowerCase().includes(textoLower) ||
        ref.nombreReferencia.toLowerCase().includes(textoLower) ||
        ref.codigoMD.toLowerCase().includes(textoLower) ||
        ref.codigoPT.toLowerCase().includes(textoLower) ||
        ref.color.toLowerCase().includes(textoLower) ||
        ref.disenador.toLowerCase().includes(textoLower)
      );
    });
  }
  
  static filtrarPorColeccion(referencias, coleccion) {
    if (!coleccion || coleccion === 'Todas') return referencias;
    return referencias.filter(ref => ref.coleccion === coleccion);
  }
  
  static filtrarPorStatus(referencias, status) {
    if (!status || status === 'Todos') return referencias;
    return referencias.filter(ref => ref.status === status);
  }
  
  static filtrarPorLinea(referencias, linea) {
    if (!linea || linea === 'Todas') return referencias;
    return referencias.filter(ref => ref.linea === linea);
  }
  
  static ordenarPor(referencias, campo, direccion = 'asc') {
    return [...referencias].sort((a, b) => {
      let valorA = a[campo];
      let valorB = b[campo];
      
      // Manejar valores nulos
      if (valorA === null || valorA === undefined) return 1;
      if (valorB === null || valorB === undefined) return -1;
      
      // Convertir a string para comparación
      valorA = String(valorA).toLowerCase();
      valorB = String(valorB).toLowerCase();
      
      if (direccion === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
  }
  
  static aplicarFiltros(referencias, filtros) {
    let resultado = referencias;
    
    if (filtros.texto) {
      resultado = this.buscarTexto(resultado, filtros.texto);
    }
    
    if (filtros.coleccion) {
      resultado = this.filtrarPorColeccion(resultado, filtros.coleccion);
    }
    
    if (filtros.status) {
      resultado = this.filtrarPorStatus(resultado, filtros.status);
    }
    
    if (filtros.linea) {
      resultado = this.filtrarPorLinea(resultado, filtros.linea);
    }
    
    if (filtros.ordenarPor) {
      resultado = this.ordenarPor(resultado, filtros.ordenarPor, filtros.direccion);
    }
    
    return resultado;
  }
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================
class Statistics {
  static obtenerEstadisticasGenerales(referencias) {
    return {
      total: referencias.length,
      porStatus: this.contarPorCampo(referencias, 'status'),
      porColeccion: this.contarPorCampo(referencias, 'coleccion'),
      porLinea: this.contarPorCampo(referencias, 'linea'),
      totalUnidades: referencias.reduce((sum, ref) => sum + (ref.unidadesProduccion.total || 0), 0),
      conBordado: referencias.filter(ref => ref.bordadoAplica).length,
      conSemielaborado: referencias.filter(ref => ref.semielaboradoAplica).length
    };
  }
  
  static contarPorCampo(referencias, campo) {
    const conteo = {};
    referencias.forEach(ref => {
      const valor = ref[campo] || 'Sin definir';
      conteo[valor] = (conteo[valor] || 0) + 1;
    });
    return conteo;
  }
  
  static obtenerReferenciasRecientes(referencias, limite = 10) {
    return [...referencias]
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
      .slice(0, limite);
  }
  
  static obtenerReferenciasPrioritarias(referencias, limite = 10) {
    return [...referencias]
      .filter(ref => ref.prioridadFirstBuy > 0)
      .sort((a, b) => b.prioridadFirstBuy - a.prioridadFirstBuy)
      .slice(0, limite);
  }
}

// Exportar para uso global
window.Referencia = Referencia;
window.DataGenerator = DataGenerator;
window.StorageManager = StorageManager;
window.SearchEngine = SearchEngine;
window.Statistics = Statistics;
window.COLECCIONES = COLECCIONES;
window.STATUS_OPTIONS = STATUS_OPTIONS;
window.LINEAS = LINEAS;
