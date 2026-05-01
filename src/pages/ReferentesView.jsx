import { useState } from 'react';
import { 
  getReferentes, 
  getTiposPrenda, 
  getCantidadesTelas, 
  getVariantes, 
  getTelasDeReferente, 
  buscarConsumo 
} from '../data/referentes';
import { Search, Save, Copy, FileText, Upload } from 'lucide-react';

export default function ReferentesView() {
  const [activeTab, setActiveTab] = useState('consulta');

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1>Gestión de Referentes</h1>
        <p style={{ color: 'var(--gray-500)' }}>Base de conocimiento de prendas validadas en producción y consumos.</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', borderBottom: '2px solid var(--gray-200)', marginBottom: 'var(--space-6)' }}>
        <button 
          onClick={() => setActiveTab('consulta')}
          style={{ 
            padding: 'var(--space-3) var(--space-2)', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'consulta' ? '2px solid var(--primary-500)' : '2px solid transparent', 
            color: activeTab === 'consulta' ? 'var(--primary-700)' : 'var(--gray-500)', 
            fontWeight: activeTab === 'consulta' ? '600' : '500', 
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)'
          }}
        >
          Consulta de Consumo
        </button>
        <button 
          onClick={() => setActiveTab('catalogo')}
          style={{ 
            padding: 'var(--space-3) var(--space-2)', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'catalogo' ? '2px solid var(--primary-500)' : '2px solid transparent', 
            color: activeTab === 'catalogo' ? 'var(--primary-700)' : 'var(--gray-500)', 
            fontWeight: activeTab === 'catalogo' ? '600' : '500', 
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)'
          }}
        >
          Catálogo de Referentes
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          style={{ 
            padding: 'var(--space-3) var(--space-2)', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'admin' ? '2px solid var(--primary-500)' : '2px solid transparent', 
            color: activeTab === 'admin' ? 'var(--primary-700)' : 'var(--gray-500)', 
            fontWeight: activeTab === 'admin' ? '600' : '500', 
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)'
          }}
        >
          Administración
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'consulta' && <ConsultaTab />}
        {activeTab === 'catalogo' && <CatalogoTab />}
        {activeTab === 'admin' && <AdminTab />}
      </div>
    </div>
  );
}

function ConsultaTab() {
  const [tipoPrenda, setTipoPrenda] = useState('');
  const [cantidadTelas, setCantidadTelas] = useState('');
  const [variante, setVariante] = useState('');
  const [numeroDeTela, setNumeroDeTela] = useState('');
  const [usoEnPrenda, setUsoEnPrenda] = useState('');
  const [baseTextil, setBaseTextil] = useState('');
  const [anchoTela, setAnchoTela] = useState('');
  const [tipo, setTipo] = useState('');
  
  const [consumoEncontrado, setConsumoEncontrado] = useState(null);

  const handleBuscar = () => {
    const res = buscarConsumo({
      tipoPrenda,
      cantidadTelas: Number(cantidadTelas),
      variante: Number(variante),
      numeroDeTela: Number(numeroDeTela),
      usoEnPrenda,
      baseTextil,
      anchoTela,
      tipo
    });
    setConsumoEncontrado(res || 'NO ENCONTRADO');
  };

  // Opciones derivadas para los selects
  const tiposDisponibles = getTiposPrenda();
  const cantidadesDisponibles = tipoPrenda ? getCantidadesTelas(tipoPrenda) : [];
  const variantesDisponibles = (tipoPrenda && cantidadTelas) ? getVariantes(tipoPrenda, Number(cantidadTelas)) : [];
  
  const telasReferente = (tipoPrenda && cantidadTelas && variante) 
    ? getTelasDeReferente(tipoPrenda, Number(cantidadTelas), Number(variante)) 
    : [];

  const numerosTelaUnicos = Array.from(new Set(telasReferente.map(t => t.numeroDeTela)));
  const usosDisponibles = Array.from(new Set(telasReferente.filter(t => t.numeroDeTela.toString() === numeroDeTela).map(t => t.usoEnPrenda)));
  const basesDisponibles = Array.from(new Set(telasReferente.filter(t => t.numeroDeTela.toString() === numeroDeTela && t.usoEnPrenda === usoEnPrenda).map(t => t.baseTextil)));
  const anchosDisponibles = Array.from(new Set(telasReferente.filter(t => t.baseTextil === baseTextil).map(t => t.anchoTela)));
  const tiposSelectDisponibles = Array.from(new Set(telasReferente.filter(t => t.anchoTela === anchoTela).map(t => t.tipo)));

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">Calculadora de Consumos</h3>
        <span className="badge badge-info">Uso exclusivo Trazadores</span>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="form-group">
            <label className="form-label form-label-required">Tipo de prenda</label>
            <select className="form-select" value={tipoPrenda} onChange={e => {setTipoPrenda(e.target.value); setCantidadTelas(''); setVariante(''); setNumeroDeTela(''); setUsoEnPrenda(''); setBaseTextil(''); setAnchoTela(''); setTipo(''); setConsumoEncontrado(null);}}>
              <option value="">Seleccione...</option>
              {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Cantidad de Telas</label>
            <select className="form-select" value={cantidadTelas} onChange={e => {setCantidadTelas(e.target.value); setVariante(''); setNumeroDeTela(''); setUsoEnPrenda(''); setBaseTextil(''); setAnchoTela(''); setTipo(''); setConsumoEncontrado(null);}} disabled={!tipoPrenda}>
              <option value="">Seleccione...</option>
              {cantidadesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Variante</label>
            <select className="form-select" value={variante} onChange={e => {setVariante(e.target.value); setNumeroDeTela(''); setUsoEnPrenda(''); setBaseTextil(''); setAnchoTela(''); setTipo(''); setConsumoEncontrado(null);}} disabled={!cantidadTelas}>
              <option value="">Seleccione...</option>
              {variantesDisponibles.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed var(--gray-300)', margin: 'var(--space-6) 0' }}></div>

        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="form-group">
            <label className="form-label form-label-required">Número de Tela</label>
            <select className="form-select" value={numeroDeTela} onChange={e => {setNumeroDeTela(e.target.value); setUsoEnPrenda(''); setBaseTextil(''); setAnchoTela(''); setTipo(''); setConsumoEncontrado(null);}} disabled={!variante}>
              <option value="">Seleccione...</option>
              {numerosTelaUnicos.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Uso en Prenda</label>
            <select className="form-select" value={usoEnPrenda} onChange={e => {setUsoEnPrenda(e.target.value); setBaseTextil(''); setAnchoTela(''); setTipo(''); setConsumoEncontrado(null);}} disabled={!numeroDeTela}>
              <option value="">Seleccione...</option>
              {usosDisponibles.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Base Textil</label>
            <select className="form-select" value={baseTextil} onChange={e => {setBaseTextil(e.target.value); setAnchoTela(''); setTipo(''); setConsumoEncontrado(null);}} disabled={!usoEnPrenda}>
              <option value="">Seleccione...</option>
              {basesDisponibles.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Ancho de Tela</label>
            <select className="form-select" value={anchoTela} onChange={e => {setAnchoTela(e.target.value); setTipo(''); setConsumoEncontrado(null);}} disabled={!baseTextil}>
              <option value="">Seleccione...</option>
              {anchosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Tipo</label>
            <select className="form-select" value={tipo} onChange={e => {setTipo(e.target.value); setConsumoEncontrado(null);}} disabled={!anchoTela}>
              <option value="">Seleccione...</option>
              {tiposSelectDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleBuscar}
          disabled={!tipo}
          className="btn btn-primary" 
        >
          <Search size={18} /> Buscar Consumo
        </button>

        {consumoEncontrado && (
          <div style={{ 
            marginTop: 'var(--space-6)', 
            padding: 'var(--space-6)', 
            background: consumoEncontrado === 'NO ENCONTRADO' ? 'var(--error-light)' : 'var(--success-light)', 
            borderRadius: 'var(--radius-xl)', 
            border: `1px solid ${consumoEncontrado === 'NO ENCONTRADO' ? 'var(--error)' : 'var(--success)'}` 
          }}>
            <h4 style={{ margin: '0 0 var(--space-2) 0', color: consumoEncontrado === 'NO ENCONTRADO' ? 'var(--error-dark)' : 'var(--success-dark)', fontSize: 'var(--text-sm)' }}>
              Resultado de la consulta
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', color: consumoEncontrado === 'NO ENCONTRADO' ? 'var(--error-dark)' : 'var(--success-dark)' }}>
                {consumoEncontrado === 'NO ENCONTRADO' ? 'Sin resultados para estos parámetros' : `${consumoEncontrado} mts`}
              </span>
              {consumoEncontrado !== 'NO ENCONTRADO' && (
                <button className="btn btn-outline" style={{ background: 'var(--white)' }}>
                  <Copy size={16} /> Copiar al portapapeles
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogoTab() {
  const referentes = getReferentes();
  
  return (
    <div className="grid grid-cols-3 fade-in">
      {referentes.map(ref => (
        <div key={ref.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '180px', background: 'var(--gray-100)', position: 'relative' }}>
            <img src={ref.fotoPrenda} alt={ref.tipoPrenda} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
               <span className={`badge ${ref.estado === 'ACTIVO' ? 'badge-success' : 'badge-gray'}`}>{ref.estado}</span>
            </div>
          </div>
          <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{ref.tipoPrenda}</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)', fontWeight: '600', letterSpacing: '0.05em' }}>
              {ref.id} • ORIGEN: {ref.coleccionOrigen}
            </p>
            
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', background: 'var(--gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--gray-500)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: '600' }}>Telas</span>
                <span className="font-semibold">{ref.cantidadTelas}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--gray-500)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: '600' }}>Variante</span>
                <span className="font-semibold">{ref.variante}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ display: 'block', color: 'var(--gray-500)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: '600' }}>Descripción</span>
                <span className="font-medium">{ref.descripcionGeneral}</span>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                Ver {ref.telas.length} combinaciones
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminTab() {
  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">Administración de Referentes</h3>
      </div>
      <div className="card-body">
        <p style={{ marginBottom: 'var(--space-6)' }}>Añade, edita o desactiva referentes de la base de datos de manera manual o a través de archivos.</p>
        
        <button className="btn btn-primary" style={{ marginBottom: 'var(--space-8)' }}>
          <Save size={18} /> Crear Nuevo Referente
        </button>
        
        <div style={{ 
          border: '2px dashed var(--gray-300)', 
          padding: 'var(--space-10)', 
          textAlign: 'center', 
          borderRadius: 'var(--radius-xl)',
          background: 'var(--gray-50)'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--white)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto var(--space-4)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <FileText size={32} style={{ color: 'var(--primary-500)' }} />
          </div>
          <h4 style={{ marginBottom: 'var(--space-2)' }}>Importar desde CSV</h4>
          <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)', maxWidth: '400px', margin: '0 auto var(--space-6)' }}>
            Sube un archivo CSV con el formato estándar para cargar múltiples referentes y actualizar los consumos en bloque.
          </p>
          <button className="btn btn-outline" style={{ background: 'var(--white)' }}>
            <Upload size={18} /> Seleccionar archivo CSV
          </button>
        </div>
      </div>
    </div>
  );
}
