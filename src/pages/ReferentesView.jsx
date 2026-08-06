import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useTiposPrenda,
  useCantidadesTelas,
  useVariantes,
  useGruposVariante,
  useFilasReferente,
  useReferentPhoto,
  uploadReferentPhoto,
  createReferentRow,
  bulkImportReferentes,
} from '../lib/api';
import supabase from '../lib/supabase';
import { Search, Copy, FileText, Upload, Plus, Check, X, ChevronLeft, Layers, Tag, Camera } from 'lucide-react';

export default function ReferentesView() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const { isAdmin } = useAuth();

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1>Gestión de Referentes</h1>
        <p style={{ color: 'var(--gray-500)' }}>Base de conocimiento de prendas validadas en producción y consumos.</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', borderBottom: '2px solid var(--gray-200)', marginBottom: 'var(--space-6)' }}>
        <button onClick={() => setActiveTab('catalogo')} style={tabStyle(activeTab === 'catalogo')}>Catálogo de Referentes</button>
        <button onClick={() => setActiveTab('consulta')} style={tabStyle(activeTab === 'consulta')}>Consulta de Consumo</button>
        <button onClick={() => setActiveTab('admin')} style={tabStyle(activeTab === 'admin')}>Administración</button>
      </div>

      <div className="tab-content">
        {activeTab === 'catalogo' && <CatalogoTab isAdmin={isAdmin} />}
        {activeTab === 'consulta' && <ConsultaTab />}
        {activeTab === 'admin' && <AdminTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}

function tabStyle(active) {
  return {
    padding: 'var(--space-3) var(--space-2)',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--primary-500)' : '2px solid transparent',
    color: active ? 'var(--primary-700)' : 'var(--gray-500)',
    fontWeight: active ? '600' : '500',
    cursor: 'pointer',
    fontSize: 'var(--text-base)',
    marginBottom: '-2px',
    transition: 'all var(--transition-fast)',
  };
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: Consulta de Consumo (dropdowns encadenados sobre tabla plana)
// ═══════════════════════════════════════════════════════════════

function ConsultaTab() {
  const [tipoPrenda, setTipoPrenda] = useState('');
  const [cantidadTelas, setCantidadTelas] = useState('');
  const [variante, setVariante] = useState('');
  const [tela, setTela] = useState('');
  const [usoPrenda, setUsoPrenda] = useState('');
  const [baseTextil, setBaseTextil] = useState('');
  const [anchoTela, setAnchoTela] = useState('');
  const [color, setColor] = useState('');
  const [execSearch, setExecSearch] = useState(false);

  const { tipos, loading: loadingTipos } = useTiposPrenda();
  const { cantidades } = useCantidadesTelas(tipoPrenda);
  const { variantes } = useVariantes(tipoPrenda, Number(cantidadTelas));
  const { filas, loading: loadingFilas } = useFilasReferente(
    tipoPrenda, Number(cantidadTelas), Number(variante)
  );

  const telasUnicas = [...new Set(filas.map(f => f.tela))];
  const usosFiltrados = [...new Set(filas.filter(f => String(f.tela) === tela).map(f => f.uso_prenda))];
  const basesFiltradas = [...new Set(filas.filter(f => String(f.tela) === tela && f.uso_prenda === usoPrenda).map(f => f.base_textil))];
  const anchosFiltrados = [...new Set(filas.filter(f => f.base_textil === baseTextil).map(f => f.ancho_tela))];
  const coloresFiltrados = [...new Set(filas.filter(f => f.ancho_tela === anchoTela).map(f => f.color))];

  const handleBuscar = () => setExecSearch(true);

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">Calculadora de Consumos</h3>
        <span className="badge badge-info">Uso exclusivo Trazadores</span>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
          <SelectField label="Tipo de prenda" value={tipoPrenda} onChange={v => { setTipoPrenda(v); setCantidadTelas(''); setVariante(''); setTela(''); setUsoPrenda(''); setBaseTextil(''); setAnchoTela(''); setColor(''); setExecSearch(false); }} options={tipos} disabled={loadingTipos} />
          <SelectField label="Cantidad de Telas" value={cantidadTelas} onChange={v => { setCantidadTelas(v); setVariante(''); setTela(''); setUsoPrenda(''); setBaseTextil(''); setAnchoTela(''); setColor(''); setExecSearch(false); }} options={cantidades} disabled={!tipoPrenda} />
          <SelectField label="Variante" value={variante} onChange={v => { setVariante(v); setTela(''); setUsoPrenda(''); setBaseTextil(''); setAnchoTela(''); setColor(''); setExecSearch(false); }} options={variantes} disabled={!cantidadTelas} />
        </div>

        <div style={{ borderTop: '1px dashed var(--gray-300)', margin: 'var(--space-6) 0' }}></div>

        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
          <SelectField label="Tela" value={tela} onChange={v => { setTela(v); setUsoPrenda(''); setBaseTextil(''); setAnchoTela(''); setColor(''); setExecSearch(false); }} options={telasUnicas} disabled={!variante} />
          <SelectField label="Uso en Prenda" value={usoPrenda} onChange={v => { setUsoPrenda(v); setBaseTextil(''); setAnchoTela(''); setColor(''); setExecSearch(false); }} options={usosFiltrados} disabled={!tela} />
          <SelectField label="Base Textil" value={baseTextil} onChange={v => { setBaseTextil(v); setAnchoTela(''); setColor(''); setExecSearch(false); }} options={basesFiltradas} disabled={!usoPrenda} />
          <SelectField label="Ancho de Tela" value={anchoTela} onChange={v => { setAnchoTela(v); setColor(''); setExecSearch(false); }} options={anchosFiltrados} disabled={!baseTextil} />
          <SelectField label="Color / Tipo" value={color} onChange={v => setColor(v)} options={coloresFiltrados} disabled={!anchoTela} />
        </div>

        <button onClick={handleBuscar} disabled={!color} className="btn btn-primary">
          <Search size={18} /> Buscar Consumo
        </button>

        {execSearch && color && (
          <BuscarConsumoResultado
            tipoPrenda={tipoPrenda}
            cantidadTelas={Number(cantidadTelas)}
            variante={Number(variante)}
            tela={Number(tela)}
            usoPrenda={usoPrenda}
            baseTextil={baseTextil}
            anchoTela={anchoTela}
            color={color}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled }) {
  return (
    <div className="form-group">
      <label className="form-label form-label-required">{label}</label>
      <select className="form-select" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
        <option value="">Seleccione...</option>
        {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function BuscarConsumoResultado({ tipoPrenda, cantidadTelas, variante, tela, usoPrenda, baseTextil, anchoTela, color }) {
  const [loading, setLoading] = useState(true);
  const [consumo, setConsumo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('referents')
      .select('consumo')
      .eq('tipo_prenda', tipoPrenda)
      .eq('cantidad_telas', cantidadTelas)
      .eq('variante', variante)
      .eq('tela', tela)
      .eq('uso_prenda', usoPrenda)
      .eq('base_textil', baseTextil)
      .eq('ancho_tela', anchoTela)
      .eq('color', color)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) {
          if (!error && data) setConsumo(data.consumo);
          else setConsumo('NO ENCONTRADO');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [tipoPrenda, cantidadTelas, variante, tela, usoPrenda, baseTextil, anchoTela, color]);

  if (loading) return <p style={{ marginTop: 'var(--space-4)', color: 'var(--gray-500)' }}>Buscando...</p>;

  const notFound = consumo === 'NO ENCONTRADO';
  const bg = notFound ? 'var(--error-light)' : 'var(--success-light)';
  const border = notFound ? 'var(--error)' : 'var(--success)';
  const color_ = notFound ? 'var(--error-dark)' : 'var(--success-dark)';

  return (
    <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-6)', background: bg, borderRadius: 'var(--radius-xl)', border: `1px solid ${border}` }}>
      <h4 style={{ margin: '0 0 var(--space-2) 0', color: color_, fontSize: 'var(--text-sm)' }}>Resultado de la consulta</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', color: color_ }}>
          {notFound ? 'Sin resultados para estos parámetros' : `${consumo} mts`}
        </span>
        {!notFound && (
          <button className="btn btn-outline" style={{ background: 'var(--white)' }} onClick={() => navigator.clipboard.writeText(consumo)}>
            <Copy size={16} /> Copiar al portapapeles
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: Catálogo de Referentes (drill-down 3 niveles)
// ═══════════════════════════════════════════════════════════════

function CatalogoTab({ isAdmin }) {
  const [nivel, setNivel] = useState(1);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  const { tipos, loading: loadingTipos } = useTiposPrenda();
  const { grupos, loading: loadingGrupos } = useGruposVariante(tipoSeleccionado);
  const { filas, loading: loadingFilas } = useFilasReferente(
    tipoSeleccionado, grupoSeleccionado?.cantidad_telas, grupoSeleccionado?.variante
  );

  const goToTipo = (tipo) => { setTipoSeleccionado(tipo); setNivel(2); setGrupoSeleccionado(null); };
  const goToGrupo = (grupo) => { setGrupoSeleccionado(grupo); setNivel(3); };
  const goBack = () => {
    if (nivel === 3) { setGrupoSeleccionado(null); setNivel(2); }
    else if (nivel === 2) { setTipoSeleccionado(null); setNivel(1); setGrupoSeleccionado(null); }
  };

  return (
    <div className="fade-in">
      {nivel > 1 && (
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--primary-600)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
          <ChevronLeft size={16} /> {nivel === 2 ? 'Tipos de Prenda' : grupoSeleccionado ? `${tipoSeleccionado} / ${grupoSeleccionado.cantidad_telas} Telas - Var ${grupoSeleccionado.variante}` : 'Volver'}
        </button>
      )}

      {/* NIVEL 1: Tipos de Prenda */}
      {nivel === 1 && (
        <NivelTiposPrenda tipos={tipos} loading={loadingTipos} onSelect={goToTipo} isAdmin={isAdmin} />
      )}

      {/* NIVEL 2: Grupos (cantidad_telas + variante) */}
      {nivel === 2 && (
        <NivelGrupos tipoPrenda={tipoSeleccionado} grupos={grupos} loading={loadingGrupos} onSelect={goToGrupo} isAdmin={isAdmin} />
      )}

      {/* NIVEL 3: Tabla de filas */}
      {nivel === 3 && grupoSeleccionado && (
        <NivelFilas tipoPrenda={tipoSeleccionado} grupo={grupoSeleccionado} filas={filas} loading={loadingFilas} />
      )}
    </div>
  );
}

function NivelTiposPrenda({ tipos, loading, onSelect, isAdmin }) {
  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Cargando...</p>;
  if (tipos.length === 0) return <p style={{ color: 'var(--gray-500)' }}>No hay tipos de prenda registrados.</p>;

  return (
    <div className="grid grid-cols-3">
      {tipos.map(tipo => (
        <TipoPrendaCard key={tipo} tipo={tipo} onSelect={onSelect} isAdmin={isAdmin} />
      ))}
    </div>
  );
}

function TipoPrendaCard({ tipo, onSelect, isAdmin }) {
  const { fotoUrl, reload } = useReferentPhoto(tipo, null, null);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadReferentPhoto(file, tipo, null, null);
      reload();
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
  };

  return (
    <div className="card" onClick={(e) => { if (e.target.closest('.photo-zone') && isAdmin) return; onSelect(tipo); }} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow var(--transition-fast)' }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
      <div className="photo-zone" style={{ height: '140px', background: 'var(--gray-100)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {fotoUrl ? (
          <img src={fotoUrl} alt={tipo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : isAdmin ? (
          <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ background: 'var(--white)', border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Camera size={20} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>Subir foto</span>
          </button>
        ) : (
          <span style={{ color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>Sin imagen</span>
        )}
        {fotoUrl && isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--space-1) var(--space-2)', cursor: 'pointer', color: 'var(--white)', fontSize: 'var(--text-xs)' }}>
            <Camera size={12} style={{ marginRight: '4px' }} /> Cambiar
          </button>
        )}
        {isAdmin && <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />}
      </div>
      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Layers size={20} style={{ color: 'var(--primary-500)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-md)' }}>{tipo}</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>Click para ver variantes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NivelGrupos({ tipoPrenda, grupos, loading, onSelect, isAdmin }) {
  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Cargando...</p>;
  if (grupos.length === 0) return <p style={{ color: 'var(--gray-500)' }}>No hay variantes para "{tipoPrenda}".</p>;

  return (
    <div>
      <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
        Seleccioná una combinación de <strong>cantidad de telas + variante</strong> para "{tipoPrenda}":
      </p>
      <div className="grid grid-cols-3">
        {grupos.map((g, idx) => (
          <GrupoCard key={idx} tipoPrenda={tipoPrenda} grupo={g} onSelect={onSelect} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

function GrupoCard({ tipoPrenda, grupo, onSelect, isAdmin }) {
  const { fotoUrl, reload } = useReferentPhoto(tipoPrenda, grupo.cantidad_telas, grupo.variante);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadReferentPhoto(file, tipoPrenda, grupo.cantidad_telas, grupo.variante);
      reload();
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
  };

  return (
    <div className="card" onClick={(e) => { if (e.target.closest('.photo-zone') && isAdmin) return; onSelect(grupo); }} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow var(--transition-fast)' }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
      <div className="photo-zone" style={{ height: '110px', background: 'var(--gray-100)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {fotoUrl ? (
          <img src={fotoUrl} alt={`${tipoPrenda} - ${grupo.cantidad_telas}T V${grupo.variante}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : isAdmin ? (
          <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ background: 'var(--white)', border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Camera size={16} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>Subir foto</span>
          </button>
        ) : (
          <span style={{ color: 'var(--gray-400)', fontSize: 'var(--text-xs)' }}>Sin imagen</span>
        )}
        {fotoUrl && isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 'var(--radius-md)', padding: '2px var(--space-2)', cursor: 'pointer', color: 'var(--white)', fontSize: 'var(--text-xs)' }}>
            <Camera size={10} style={{ marginRight: '2px' }} /> Cambiar
          </button>
        )}
        {isAdmin && <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />}
      </div>
      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Tag size={18} style={{ color: 'var(--primary-500)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)' }}>{grupo.cantidad_telas} Telas / Variante {grupo.variante}</h4>
            {grupo.descripcion && <p style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>{grupo.descripcion}</p>}
            {grupo.terminacion && <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>Term: {grupo.terminacion}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function NivelFilas({ tipoPrenda, grupo, filas, loading }) {
  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Cargando...</p>;
  if (filas.length === 0) return <p style={{ color: 'var(--gray-500)' }}>No hay combinaciones para {tipoPrenda} / {grupo.cantidad_telas} Telas - Var {grupo.variante}.</p>;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="card-header">
        <h3 className="card-title">{tipoPrenda} — {grupo.cantidad_telas} Telas / Variante {grupo.variante}</h3>
        <span className="badge badge-info">{filas.length} combinaciones</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="form-table" style={{ width: '100%', margin: 0 }}>
          <thead>
            <tr>
              <th>Tela</th>
              <th>Uso en Prenda</th>
              <th>Base Textil</th>
              <th>Color / Tipo</th>
              <th>Ancho Tela</th>
              <th>Consumo</th>
              <th>Descripción</th>
              <th>Terminación</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                <td>{f.tela}</td>
                <td>{f.uso_prenda}</td>
                <td>{f.base_textil}</td>
                <td>{f.color}</td>
                <td>{f.ancho_tela}</td>
                <td><strong>{f.consumo} mts</strong></td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{f.descripcion}</td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{f.terminacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: Administración (formulario plano + CSV import)
// ═══════════════════════════════════════════════════════════════

function AdminTab({ isAdmin }) {
  if (!isAdmin) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <h3 style={{ color: 'var(--gray-500)' }}>Acceso Restringido</h3>
        <p style={{ color: 'var(--gray-400)' }}>Solo el administrador puede gestionar referentes.</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadTable = () => {
    setTableLoading(true);
    supabase
      .from('referents')
      .select('*')
      .order('tipo_prenda')
      .order('cantidad_telas')
      .order('variante')
      .order('tela')
      .then(({ data }) => {
        setTableData(data || []);
        setTableLoading(false);
      });
  };

  useEffect(() => { loadTable(); }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Crear Referente</h3></div>
        <div className="card-body">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: showForm ? 'var(--space-6)' : 0 }}>
            <Plus size={18} /> {showForm ? 'Cerrar Formulario' : 'Crear Nuevo Referente'}
          </button>
          {showForm && <ReferenteForm onSaved={() => { setShowForm(false); loadTable(); }} onCancel={() => setShowForm(false)} />}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Importar desde CSV</h3></div>
        <div className="card-body">
          <CSVImportBox importing={importing} importResult={importResult} fileInputRef={fileInputRef}
            onImport={async (file) => {
               setImporting(true); setImportResult(null);
               try {
                 const text = await file.text();
                 const rows = parseReferenteCSV(text);
                 const result = await bulkImportReferentes(rows, {
                   onProgress: (p) => setImportResult({ current: p.current, total: p.total, created: p.created, skipped: p.skipped, errors: p.errors }),
                 });
                 setImportResult({ ...result, preview: rows.slice(0, 3) });
                 loadTable();
               } catch (err) { setImportResult({ error: err.message }); }
               setImporting(false);
               if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Referentes Registrados ({tableLoading ? '...' : tableData.length})</h3>
        </div>
        <div style={{ overflowX: 'auto', padding: 'var(--space-4)' }}>
          {tableLoading ? <p style={{ color: 'var(--gray-500)' }}>Cargando...</p> :
           tableData.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>No hay referentes registrados aún.</p> :
            <table className="form-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Tipo Prenda</th>
                  <th>Cant. Telas</th>
                  <th>Var.</th>
                  <th>Tela</th>
                  <th>Uso</th>
                  <th>Base Textil</th>
                  <th>Color</th>
                  <th>Ancho</th>
                  <th>Consumo</th>
                  <th>Descripción</th>
                  <th>Terminación</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(r => (
                  <tr key={r.id}>
                    <td>{r.tipo_prenda}</td>
                    <td>{r.cantidad_telas}</td>
                    <td>{r.variante}</td>
                    <td>{r.tela}</td>
                    <td>{r.uso_prenda}</td>
                    <td>{r.base_textil}</td>
                    <td>{r.color}</td>
                    <td>{r.ancho_tela}</td>
                    <td><strong>{r.consumo}</strong></td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{r.descripcion}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{r.terminacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  );
}

function ReferenteForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    tipoPrenda: '',
    cantidadTelas: 1,
    variante: 1,
    tela: 1,
    usoPrenda: '',
    baseTextil: '',
    color: 'SOLIDO',
    anchoTela: '',
    consumo: '',
    descripcion: '',
    terminacion: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.tipoPrenda.trim() || !form.usoPrenda.trim() || !form.baseTextil.trim() || !form.anchoTela.trim() || !form.consumo.trim()) {
      setError('Todos los campos marcados con * son obligatorios.');
      return;
    }
    setError('');
    setSaving(true);
    const { error: err } = await createReferentRow(form);
    setSaving(false);
    if (err) { setError(err.message || 'Error al guardar.'); }
    else { onSaved(); }
  };

  return (
    <div style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', background: 'var(--gray-50)' }}>
      <h4 style={{ margin: '0 0 var(--space-4) 0' }}>Nuevo Referente</h4>

      {error && <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'var(--error-light)', borderRadius: 'var(--radius-md)', color: 'var(--error-dark)', fontSize: 'var(--text-sm)' }}><X size={14} style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }} /> {error}</div>}

      <div className="grid grid-cols-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <Field label="Tipo de Prenda *" value={form.tipoPrenda} onChange={v => handleChange('tipoPrenda', v)} placeholder="BIKINI BOTTOM - ALTO" list="tipos-sug" />
        <Field type="number" label="Cantidad de Telas" value={form.cantidadTelas} onChange={v => handleChange('cantidadTelas', parseInt(v) || 1)} min={1} />
        <Field type="number" label="Variante" value={form.variante} onChange={v => handleChange('variante', parseInt(v) || 1)} min={1} />
        <Field type="number" label="Tela (Nº) *" value={form.tela} onChange={v => handleChange('tela', parseInt(v) || 1)} min={1} />
        <Field label="Uso en Prenda *" value={form.usoPrenda} onChange={v => handleChange('usoPrenda', v)} placeholder="LUCIR" />
        <Field label="Base Textil *" value={form.baseTextil} onChange={v => handleChange('baseTextil', v)} placeholder="LYCRA VITA" />
        <Field label="Color / Tipo" value={form.color} onChange={v => handleChange('color', v)} placeholder="SOLIDO" />
        <Field label="Ancho de Tela *" value={form.anchoTela} onChange={v => handleChange('anchoTela', v)} placeholder="1,45" />
        <Field label="Consumo *" value={form.consumo} onChange={v => handleChange('consumo', v)} placeholder="0,17" />
        <Field label="Descripción" value={form.descripcion} onChange={v => handleChange('descripcion', v)} placeholder="LUCIR Y FORRO" />
        <Field label="Terminación" value={form.terminacion} onChange={v => handleChange('terminacion', v)} placeholder="EMBONADO" />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>Guardar Referente</button>
      </div>

      <datalist id="tipos-sug">
        <option value="BIKINI BOTTOM - ALTO" />
        <option value="BIKINI BOTTOM - PANTY" />
        <option value="BIKINI TOP - TIRAS" />
        <option value="BIKINI TOP - TIRAS - U" />
        <option value="BIKINI TOP - TIRAS - NUDO" />
        <option value="BIKINI TOP - STRAPLESS" />
        <option value="BIKINI TOP - STRAPLESS - U" />
        <option value="BIKINI TOP - STRAPLESS - ENTORCHE" />
        <option value="ONEPIECE" />
      </datalist>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, list, min }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        list={list}
        min={min}
      />
    </div>
  );
}

function CSVImportBox({ importing, importResult, fileInputRef, onImport }) {
  return (
    <div>
      <div style={{ border: '2px dashed var(--gray-300)', padding: 'var(--space-10)', textAlign: 'center', borderRadius: 'var(--radius-xl)', background: 'var(--gray-50)' }}>
        <div style={{ width: '64px', height: '64px', background: 'var(--white)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-sm)' }}>
          <FileText size={32} style={{ color: 'var(--primary-500)' }} />
        </div>
        <h4 style={{ marginBottom: 'var(--space-2)' }}>Importar desde CSV</h4>
        <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)', maxWidth: '400px', margin: '0 auto var(--space-6)' }}>
          Sube un archivo CSV con columnas: tipo_prenda, cantidad_telas, variante, tela, uso_prenda, base_textil, color, ancho_tela, consumo, descripcion, terminacion.
        </p>
        <button className="btn btn-outline" style={{ background: 'var(--white)' }} onClick={() => fileInputRef.current?.click()} disabled={importing}>
          <Upload size={18} /> {importing ? 'Importando...' : 'Seleccionar archivo CSV'}
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); }} />
      </div>

      {importResult && !importResult.error && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--success-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--success)' }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--success-dark)' }}>
            <Check size={18} style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }} />
            Importación completada: {importResult.created} creados, {Array.isArray(importResult.errors) ? importResult.errors.length : importResult.errors} errores.
          </p>
        </div>
      )}
      {importResult?.preview && importResult.preview.length > 0 && (
        <details style={{ marginTop: 'var(--space-4)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--primary-600)' }}>
            Ver primeras {importResult.preview.length} filas parseadas
          </summary>
          <div style={{ overflowX: 'auto', marginTop: 'var(--space-2)' }}>
            <table className="form-table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr>
                  <th>#</th><th>tipoPrenda</th><th>cantTelas</th><th>var</th><th>tela</th>
                  <th>uso</th><th>base</th><th>color</th><th>ancho</th><th>consumo</th>
                  <th>desc</th><th>term</th>
                </tr>
              </thead>
              <tbody>
                {importResult.preview.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><td>{r.tipoPrenda}</td><td>{r.cantidadTelas}</td><td>{r.variante}</td><td>{r.tela}</td>
                    <td>{r.usoPrenda}</td><td>{r.baseTextil}</td><td>{r.color}</td><td>{r.anchoTela}</td><td>{r.consumo}</td>
                    <td>{r.descripcion}</td><td>{r.terminacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {importResult?.error && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--error-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--error)' }}>
          <p style={{ margin: 0, color: 'var(--error-dark)' }}><X size={18} style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }} />Error: {importResult.error}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CSV Parser (11 columnas, detecta headers automáticamente)
// ═══════════════════════════════════════════════════════════════

function parseReferenteCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const idx = (names) => {
    for (const n of names) {
      const i = headers.indexOf(n.toLowerCase());
      if (i >= 0) return i;
    }
    return -1;
  };

  const col = {
    tipoPrenda: idx(['tipo_prenda', 'tipo de prenda', 'tipoprenda', 'prenda']),
    cantidadTelas: idx(['cantidad_telas', 'cantidad de telas', 'cantidadtelas']),
    variante: idx(['variante']),
    tela: idx(['tela', 'numero_tela', 'num_tela', 'nro_tela']),
    usoPrenda: idx(['uso_prenda', 'uso en prenda', 'usoprenda']),
    baseTextil: idx(['base_textil', 'base textil', 'basetextil']),
    color: idx(['color', 'tipo']),
    anchoTela: idx(['ancho_tela', 'ancho de tela', 'anchotela']),
    consumo: idx(['consumo']),
    descripcion: idx(['descripcion', 'desc']),
    terminacion: idx(['terminacion', 'term']),
  };

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (col.tipoPrenda < 0 || !vals[col.tipoPrenda]) continue;

    rows.push({
      tipoPrenda: vals[col.tipoPrenda] || '',
      cantidadTelas: col.cantidadTelas >= 0 ? (parseInt(vals[col.cantidadTelas]) || 1) : 1,
      variante: col.variante >= 0 ? (parseInt(vals[col.variante]) || 1) : 1,
      tela: col.tela >= 0 ? (parseInt(vals[col.tela]) || 1) : 1,
      usoPrenda: col.usoPrenda >= 0 ? vals[col.usoPrenda] || '' : '',
      baseTextil: col.baseTextil >= 0 ? vals[col.baseTextil] || '' : '',
      color: col.color >= 0 ? vals[col.color] || 'SOLIDO' : 'SOLIDO',
      anchoTela: col.anchoTela >= 0 ? vals[col.anchoTela] || '' : '',
      consumo: col.consumo >= 0 ? vals[col.consumo] || '' : '',
      descripcion: col.descripcion >= 0 ? vals[col.descripcion] || '' : '',
      terminacion: col.terminacion >= 0 ? vals[col.terminacion] || '' : '',
    });
  }
  return rows;
}
