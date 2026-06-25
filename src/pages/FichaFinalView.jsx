import { useState, useMemo } from 'react';
import {
  Save, Tag, AlertTriangle, CheckCircle, Droplets, FileText,
  Info, Plus, X, ShieldCheck, Clock,
  Package
} from 'lucide-react';
import SeccionColapsable from '../components/SeccionColapsable';



const CONTRAMUESTRA_STATUS = {
  pendiente: { label: 'Pendiente', class: 'fichafinal-contramuestra-status--pendiente', icon: Clock },
  activa: { label: 'Activa', class: 'fichafinal-contramuestra-status--activa', icon: CheckCircle },
  utilizada: { label: 'Utilizada', class: 'fichafinal-contramuestra-status--utilizada', icon: Package },
  anulada: { label: 'Anulada', class: 'fichafinal-contramuestra-status--anulada', icon: X },
};

const CUIDADOS_OPTIONS = {
  lavado: ['Lavar a mano', 'Lavar a máquina max 30°', 'Lavar a máquina max 40°', 'Lavado en seco (Dry Clean)', 'No lavar'],
  secado: ['Secar a la sombra', 'Secar extendido', 'Secado en máquina (Tumble Dry)', 'No usar secadora'],
  planchado: ['Planchar a baja temperatura', 'Planchar a temperatura media', 'No planchar'],
  blanqueado: ['No usar blanqueador', 'Se permite blanqueador sin cloro'],
};

const NOVEDAD_TIPOS = [
  'Tela Defectuosa (Encogimiento extremo)',
  'Error de Confección',
  'Insumos Incompletos',
  'Retraso en Proveedor Externo',
  'Moldería Incorrecta',
  'Otra Novedad',
];

export default function FichaFinalView() {
  const fichaData = {
    codigoMD: 'MD-002',
    codigoPT: 'PT03402',
    nombre: 'ECRU/SAND FEMINITY DRAMATIC PANT',
    tipoPrenda: 'Pantalón',
    color: 'Ecru/Sand',
    temporada: 'WS26',
    clasificacion: 'Sólida',
    faseActual: 4.3,
    subfaseNombre: 'Industrializacion',
  };

  const [composicion, setComposicion] = useState([
    { id: 1, material: 'Algodón', porcentaje: 68 },
    { id: 2, material: 'Lino', porcentaje: 30 },
    { id: 3, material: 'Elastano', porcentaje: 2 },
  ]);

  const [marquilla, setMarquilla] = useState({
    descUSA: '',
    descUK: '',
    fiberComposition: '68% Cotton, 30% Linen, 2% Spandex',
    wovenKnitted: 'Woven',
    inside: '100% Cotton',
    include: 'Remove before wearing belt',
  });

  const [cuidados, setCuidados] = useState({
    lavado: 'Lavar a mano',
    secado: 'Secar a la sombra',
    planchado: 'Planchar a baja temperatura',
    blanqueado: 'No usar blanqueador',
  });

  const [contramuestra, setContramuestra] = useState({
    ot: 'OT-2026-002',
    notaSAP: '',
    talla: '8',
    colorContramuestra: 'Ecru/Sand',
    fechaTrasladoSAP: '',
    fechaDespachoZF: '',
    estado: 'pendiente',
  });

  const [novedades, setNovedades] = useState([]);
  const [novedadTipo, setNovedadTipo] = useState('');
  const [novedadDesc, setNovedadDesc] = useState('');

  const composicionTotal = useMemo(() => {
    return composicion.reduce((sum, c) => sum + (parseFloat(c.porcentaje) || 0), 0);
  }, [composicion]);

  const composicionStatus = useMemo(() => {
    if (Math.abs(composicionTotal - 100) < 0.1) return 'ok';
    if (composicionTotal === 0) return 'incomplete';
    return 'error';
  }, [composicionTotal]);

  const kpis = useMemo(() => {
    const compOk = composicionStatus === 'ok';
    const cuidadosOk = Object.values(cuidados).every(v => v && v.trim() !== '');
    const contraOk = contramuestra.estado === 'utilizada' || contramuestra.estado === 'activa';
    const noNovidades = novedades.length === 0;
    return {
      composicion: compOk,
      cuidados: cuidadosOk,
      contramuestra: contraOk,
      noNovedades: noNovidades,
      totalOk: compOk && cuidadosOk && contraOk && noNovidades ? '4/4' : `${[compOk, cuidadosOk, contraOk, noNovidades].filter(Boolean).length}/4`,
    };
  }, [composicionStatus, cuidados, contramuestra.estado, novedades]);

  const handleComposicionChange = (id, field, value) => {
    setComposicion(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleAddMaterial = () => {
    const newId = Math.max(...composicion.map(c => c.id), 0) + 1;
    setComposicion(prev => [...prev, { id: newId, material: '', porcentaje: '' }]);
  };

  const handleRemoveMaterial = (id) => {
    if (composicion.length <= 1) return;
    setComposicion(prev => prev.filter(c => c.id !== id));
  };

  const handleRegistrarNovedad = () => {
    if (!novedadTipo || !novedadDesc.trim()) return;
    setNovedades(prev => [...prev, {
      id: Date.now(),
      tipo: novedadTipo,
      descripcion: novedadDesc,
      fecha: new Date().toLocaleDateString('es-CO'),
    }]);
    setNovedadTipo('');
    setNovedadDesc('');
  };

  const totalClass = `fichafinal-composicion-total fichafinal-composicion-total--${composicionStatus}`;

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="fichafinal-header">
        <div className="fichafinal-header-info">
          <h2>Ficha Final y Marquillas</h2>
          <p>
            Referencia: <strong style={{ color: 'var(--primary-600)' }}>{fichaData.codigoMD}</strong>
            {' / '}
            <strong>{fichaData.codigoPT}</strong>
            {' — '}
            {fichaData.nombre}
          </p>
          <div className="fichafinal-header-badges">
            <span className="badge badge-primary">{fichaData.tipoPrenda}</span>
            <span className="badge badge-warning">{fichaData.clasificacion}</span>
            {fichaData.temporada && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {fichaData.temporada}
              </span>
            )}
          </div>
        </div>
        <div className="fichafinal-header-actions">
          <button className="btn btn-primary">
            <Save size={16} /> Guardar Ficha Final
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="fichafinal-kpi-grid">
        <div className="fichafinal-kpi-card" style={{ borderTopColor: kpis.composicion ? 'var(--success)' : 'var(--warning)' }}>
          <div className="fichafinal-kpi-card-left">
            <span className="fichafinal-kpi-label">Composición</span>
            <span className="fichafinal-kpi-value" style={{ color: kpis.composicion ? 'var(--success-dark)' : 'var(--warning-dark)', fontSize: 'var(--text-xl)' }}>
              {kpis.composicion ? 'Completa' : 'Pendiente'}
            </span>
            <span className="fichafinal-kpi-sub">{composicionTotal}% registrado</span>
          </div>
          <div className="fichafinal-kpi-icon" style={{ background: kpis.composicion ? 'var(--success-light)' : 'var(--warning-light)', color: kpis.composicion ? 'var(--success-dark)' : 'var(--warning-dark)' }}>
            <Tag size={20} />
          </div>
        </div>

        <div className="fichafinal-kpi-card" style={{ borderTopColor: kpis.cuidados ? 'var(--success)' : 'var(--warning)' }}>
          <div className="fichafinal-kpi-card-left">
            <span className="fichafinal-kpi-label">Cuidados</span>
            <span className="fichafinal-kpi-value" style={{ color: kpis.cuidados ? 'var(--success-dark)' : 'var(--warning-dark)', fontSize: 'var(--text-xl)' }}>
              {kpis.cuidados ? 'Completo' : 'Pendiente'}
            </span>
            <span className="fichafinal-kpi-sub">{Object.values(cuidados).filter(v => v).length}/4 campos</span>
          </div>
          <div className="fichafinal-kpi-icon" style={{ background: kpis.cuidados ? 'var(--success-light)' : 'var(--warning-light)', color: kpis.cuidados ? 'var(--success-dark)' : 'var(--warning-dark)' }}>
            <Droplets size={20} />
          </div>
        </div>

        <div className="fichafinal-kpi-card" style={{ borderTopColor: kpis.contramuestra ? 'var(--success)' : 'var(--primary-600)' }}>
          <div className="fichafinal-kpi-card-left">
            <span className="fichafinal-kpi-label">Contramuestra</span>
            <span className="fichafinal-kpi-value" style={{ color: kpis.contramuestra ? 'var(--success-dark)' : 'var(--primary-600)', fontSize: 'var(--text-xl)' }}>
              {contramuestra.estado === 'pendiente' ? 'Pendiente' : contramuestra.estado === 'activa' ? 'Activa' : contramuestra.estado === 'utilizada' ? 'Utilizada' : 'Anulada'}
            </span>
            <span className="fichafinal-kpi-sub">{contramuestra.ot}</span>
          </div>
          <div className="fichafinal-kpi-icon" style={{ background: kpis.contramuestra ? 'var(--success-light)' : 'var(--primary-100)', color: kpis.contramuestra ? 'var(--success-dark)' : 'var(--primary-600)' }}>
            <FileText size={20} />
          </div>
        </div>

        <div className="fichafinal-kpi-card" style={{ borderTopColor: kpis.noNovedades ? 'var(--success)' : 'var(--error)' }}>
          <div className="fichafinal-kpi-card-left">
            <span className="fichafinal-kpi-label">Novedades</span>
            <span className="fichafinal-kpi-value" style={{ color: kpis.noNovedades ? 'var(--success-dark)' : 'var(--error-dark)', fontSize: 'var(--text-xl)' }}>
              {novedades.length === 0 ? 'Sin Alertas' : `${novedades.length} Alerta${novedades.length > 1 ? 's' : ''}`}
            </span>
            <span className="fichafinal-kpi-sub">{kpis.noNovedades ? 'Sin novedades' : 'Requieren atención'}</span>
          </div>
          <div className="fichafinal-kpi-icon" style={{ background: kpis.noNovedades ? 'var(--success-light)' : 'var(--error-light)', color: kpis.noNovedades ? 'var(--success-dark)' : 'var(--error-dark)' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* ── Secciones ── */}
      <div className="detalle-secciones">

        {/* COMPOSICIÓN TEXTIL */}
        <SeccionColapsable
          titulo="Composición Textil (Marquilla)"
          icono={<Tag size={18} />}
          accentColor="var(--temp-cold-border)"
          defaultOpen={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="fichafinal-marquilla-grid" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="form-group fichafinal-marquilla-full">
                <label className="form-label form-label-required">Composición para Marquilla (USA)</label>
                <input
                  className="form-input"
                  value={marquilla.descUSA}
                  onChange={e => setMarquilla(prev => ({ ...prev, descUSA: e.target.value }))}
                  placeholder="Ej: ECRU/SAND, 68% Cotton, 30% Linen, 2% Spandex"
                />
              </div>
              <div className="form-group fichafinal-marquilla-full">
                <label className="form-label">Composición para Marquilla (UK)</label>
                <input
                  className="form-input"
                  value={marquilla.descUK}
                  onChange={e => setMarquilla(prev => ({ ...prev, descUK: e.target.value }))}
                  placeholder="Ej: ECRU/SAND, 68% Cotton, 30% Linen, 2% Spandex"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-700)' }}>Materiales</h4>
              <span className="fichafinal-position-badge">
                Total: {composicionTotal}%
              </span>
            </div>

            {composicion.map((item) => (
              <div key={item.id} className="fichafinal-composicion-row">
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={item.material}
                    onChange={(e) => handleComposicionChange(item.id, 'material', e.target.value)}
                    placeholder="Ej. Algodón, Poliéster"
                  />
                </div>
                <div className="fichafinal-composicion-pct">
                  <input
                    type="number"
                    className="form-input"
                    value={item.porcentaje}
                    onChange={(e) => handleComposicionChange(item.id, 'porcentaje', e.target.value)}
                    placeholder="0"
                  />
                  <span className="fichafinal-composicion-pct-symbol">%</span>
                </div>
                {composicion.length > 1 && (
                  <button
                    onClick={() => handleRemoveMaterial(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4, display: 'flex', transition: 'color var(--transition-fast)' }}
                    title="Eliminar material"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <div className={totalClass}>
              <span>Total Composición: {composicionTotal}%</span>
              <span>
                {composicionStatus === 'ok' && '✓ Completo'}
                {composicionStatus === 'error' && `Falta ${100 - composicionTotal}%`}
                {composicionStatus === 'incomplete' && 'Sin datos'}
              </span>
            </div>

            <button className="btn btn-outline btn-sm" style={{ width: 'fit-content' }} onClick={handleAddMaterial}>
              <Plus size={14} /> Añadir Material
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Tipo de Tejido</label>
                <select className="form-select" value={marquilla.wovenKnitted} onChange={e => setMarquilla(prev => ({ ...prev, wovenKnitted: e.target.value }))}>
                  <option>Woven</option>
                  <option>Knitted</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Composición Interior</label>
                <input className="form-input" value={marquilla.inside} onChange={e => setMarquilla(prev => ({ ...prev, inside: e.target.value }))} placeholder="Ej. 100% Cotton" />
              </div>
              <div className="form-group">
                <label className="form-label">Include</label>
                <input className="form-input" value={marquilla.include} onChange={e => setMarquilla(prev => ({ ...prev, include: e.target.value }))} placeholder="Ej. Remove before wearing belt" />
              </div>
            </div>
          </div>
        </SeccionColapsable>

        {/* CUIDADOS DE PRENDA */}
        <SeccionColapsable
          titulo="Cuidados de la Prenda"
          icono={<Droplets size={18} />}
          accentColor="var(--temp-warm-border)"
          defaultOpen={true}
        >
          <div className="fichafinal-marquilla-grid">
            {Object.entries(CUIDADOS_OPTIONS).map(([key, options]) => {
              const labels = { lavado: 'Lavado', secado: 'Secado', planchado: 'Planchado', blanqueado: 'Blanqueado' };
              return (
                <div key={key} className="form-group">
                  <label className="form-label">{labels[key]}</label>
                  <select className="form-select" value={cuidados[key]} onChange={e => setCuidados(prev => ({ ...prev, [key]: e.target.value }))}>
                    {options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </SeccionColapsable>

        {/* INDUSTRIALIZACION / CONTRAMUESTRA */}
        <SeccionColapsable
          titulo="Industrializacion · Contramuestra y SAP"
          icono={<FileText size={18} />}
          accentColor="var(--temp-hot-border)"
          defaultOpen={false}
        >
          {(() => {
            const statusConfig = CONTRAMUESTRA_STATUS[contramuestra.estado] || CONTRAMUESTRA_STATUS.pendiente;
            const StatusIcon = statusConfig.icon;
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <span className={`fichafinal-contramuestra-status ${statusConfig.class}`}>
                    <StatusIcon size={12} />
                    {statusConfig.label}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                    Orden de Trabajo: <strong>{contramuestra.ot}</strong>
                  </span>
                </div>

                <div className="fichafinal-contramuestra-grid">
                  <div className="form-group">
                    <label className="form-label">Orden de Trabajo (OT)</label>
                    <input className="form-input" value={contramuestra.ot} onChange={e => setContramuestra(prev => ({ ...prev, ot: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nota de Fabricación SAP</label>
                    <input className="form-input" value={contramuestra.notaSAP} onChange={e => setContramuestra(prev => ({ ...prev, notaSAP: e.target.value }))} placeholder="Pendiente" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select className="form-select" value={contramuestra.estado} onChange={e => setContramuestra(prev => ({ ...prev, estado: e.target.value }))}>
                      <option value="pendiente">Pendiente</option>
                      <option value="activa">Activa</option>
                      <option value="utilizada">Utilizada</option>
                      <option value="anulada">Anulada</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Talla de Contramuestra</label>
                    <input className="form-input" value={contramuestra.talla} onChange={e => setContramuestra(prev => ({ ...prev, talla: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Contramuestra</label>
                    <input className="form-input" value={contramuestra.colorContramuestra} onChange={e => setContramuestra(prev => ({ ...prev, colorContramuestra: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha Traslado SAP</label>
                    <input className="form-input" type="date" value={contramuestra.fechaTrasladoSAP} onChange={e => setContramuestra(prev => ({ ...prev, fechaTrasladoSAP: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha Despacho ZF</label>
                    <input className="form-input" type="date" value={contramuestra.fechaDespachoZF} onChange={e => setContramuestra(prev => ({ ...prev, fechaDespachoZF: e.target.value }))} />
                  </div>
                </div>
              </>
            );
          })()}
        </SeccionColapsable>

        {/* NOVEDADES DE CALIDAD */}
        <SeccionColapsable
          titulo="Novedades de Calidad (Feedback)"
          icono={<AlertTriangle size={18} />}
          accentColor="var(--temp-fire-border)"
          defaultOpen={novedades.length > 0}
        >
          {novedades.length === 0 ? (
            <div className="fichafinal-emptystate">
              <CheckCircle size={16} />
              Sin novedades activas — la referencia fluye normalmente
            </div>
          ) : (
            <div className="fichafinal-novedad-list">
              {novedades.map(n => (
                <div key={n.id} className="fichafinal-novedad-item">
                  <span className="fichafinal-novedad-item-tipo">{n.tipo}</span>
                  <span className="fichafinal-novedad-item-desc">{n.descripcion}</span>
                  <span className="fichafinal-novedad-item-date">{n.fecha}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: 'var(--warning-light)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--warning)', margin: 'var(--space-4) 0', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--warning-dark)' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Si registras una novedad crítica, el flujo de esta referencia se pausará en el Kanban hasta que Compras o Calidad lo resuelvan.</span>
          </div>

          <div className="fichafinal-novedad-form">
            <div className="form-group">
              <label className="form-label form-label-required">Tipo de Novedad</label>
              <select className="form-select" value={novedadTipo} onChange={e => setNovedadTipo(e.target.value)}>
                <option value="">Seleccionar...</option>
                {NOVEDAD_TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Descripción</label>
              <input
                type="text"
                className="form-input"
                value={novedadDesc}
                onChange={e => setNovedadDesc(e.target.value)}
                placeholder="Describe brevemente el hallazgo..."
                onKeyDown={e => { if (e.key === 'Enter') handleRegistrarNovedad(); }}
              />
            </div>
          </div>

          <button
            className="btn btn-sm btn-outline"
            style={{ borderColor: 'var(--error)', color: 'var(--error-dark)', marginTop: 'var(--space-3)' }}
            onClick={handleRegistrarNovedad}
            disabled={!novedadTipo || !novedadDesc.trim()}
          >
            <AlertTriangle size={14} /> Registrar Novedad
          </button>
        </SeccionColapsable>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="fichafinal-sticky-footer">
        <button className="btn btn-secondary">Cancelar</button>
        <button className="btn btn-primary">
          <Save size={16} /> Guardar Ficha Final
        </button>
      </div>
    </div>
  );
}