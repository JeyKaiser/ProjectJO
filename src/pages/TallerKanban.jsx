import { useState, useMemo } from 'react';
import data from '../data/casos_uso_referencias.json';
import {
  Scissors, Shirt, Sparkles, Ruler, Clock, Play, Pause,
  CheckCircle2, AlertCircle, Activity, X,
  Plus, Zap
} from 'lucide-react';

const COLUMN_CONFIG = {
  corte: { title: '2.2 Corte Muestra', tempPhase: 'cold', icon: Scissors, emptyText: 'No hay prendas en corte' },
  confeccion: { title: '2.3 Confección Muestra', tempPhase: 'warm', icon: Shirt, emptyText: 'No hay prendas en confección' },
  procesoExterno: { title: '2.4 Procesos Especiales', tempPhase: 'hot', icon: Sparkles, emptyText: 'No hay procesos externos activos' },
  medicion: { title: '3.1 Medición y Tallaje', tempPhase: 'fire', icon: Ruler, emptyText: 'No hay prendas en medición' },
};

const PRIORITY_CONFIG = {
  alta: { label: 'Alta', color: 'var(--error)' },
  media: { label: 'Media', color: 'var(--warning)' },
  baja: { label: 'Baja', color: 'var(--gray-300)' },
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todos', icon: null },
  { key: 'active', label: 'En Proceso', icon: Play },
  { key: 'paused', label: 'Pausadas', icon: Pause },
  { key: 'waiting', label: 'En Espera', icon: Clock },
];

const KPI_CONFIG = [
  { key: 'active', label: 'En Proceso', color: 'var(--success)', bgColor: 'var(--success-light)', icon: Activity },
  { key: 'paused', label: 'Pausadas', color: 'var(--error)', bgColor: 'var(--error-light)', icon: Pause },
  { key: 'waiting', label: 'En Espera', color: 'var(--warning)', bgColor: 'var(--warning-light)', icon: Clock },
  { key: 'total', label: 'Total en Taller', color: 'var(--primary-600)', bgColor: 'var(--primary-100)', icon: Zap },
];

const AVATAR_COLOR_MAP = {
  primary: 'taller-operator-avatar--primary',
  purple: 'taller-operator-avatar--purple',
  success: 'taller-operator-avatar--success',
  warning: 'taller-operator-avatar--warning',
  secondary: 'taller-operator-avatar--secondary',
};

const INITIAL_FORM = {
  tipoPrenda: '',
  coleccion: '',
  referente: '',
  prioridad: 'media',
  observaciones: '',
  columna: 'corte',
};

export default function TallerKanban() {
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const items = useMemo(() => {
    return data.simulaciones_referencias.map(r => {
      const td = r.tallerData || {};
      return {
        ...r,
        id: r.id_caso,
        columna: td.columna || 'corte',
        status: td.status || 'active',
        statusLabel: td.statusLabel || 'En Proceso',
        prioridad: td.prioridad || 'media',
        coleccion: td.coleccion || '',
        temporada: td.temporada || '',
        fechaUltimaActividad: td.fechaUltimaActividad || '',
        estimacionFin: td.estimacionFin || null,
        timeInStage: td.timeInStage || '0h 0m',
        operadores: td.operadores || [],
        tieneProcesoExterno: r.perfil_inicial?.tiene_proceso_externo || false,
        tieneBordado: r.perfil_inicial?.tiene_bordado || false,
        tieneSemielaborado: r.perfil_inicial?.tiene_semielaborado || false,
        tipoPrenda: r.perfil_inicial?.tipo_prenda || 'Prenda',
        referente: r.perfil_inicial?.referente || null,
        esNuevo: r.perfil_inicial?.es_nuevo || false,
      };
    });
  }, []);

  const columns = useMemo(() => {
    const cols = { corte: [], confeccion: [], procesoExterno: [], medicion: [] };
    items.forEach(item => {
      if (cols[item.columna]) {
        cols[item.columna].push(item);
      }
    });
    return cols;
  }, [items]);

  const filteredColumns = useMemo(() => {
    if (filter === 'all') return columns;
    const filtered = { corte: [], confeccion: [], procesoExterno: [], medicion: [] };
    Object.entries(columns).forEach(([colId, colItems]) => {
      filtered[colId] = colItems.filter(item => item.status === filter);
    });
    return filtered;
  }, [columns, filter]);

  const kpis = useMemo(() => {
    const active = items.filter(i => i.status === 'active').length;
    const paused = items.filter(i => i.status === 'paused').length;
    const waiting = items.filter(i => i.status === 'waiting').length;
    return { active, paused, waiting, total: items.length };
  }, [items]);

  const filterCounts = useMemo(() => ({
    all: items.length,
    active: items.filter(i => i.status === 'active').length,
    paused: items.filter(i => i.status === 'paused').length,
    waiting: items.filter(i => i.status === 'waiting').length,
  }), [items]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateOT = () => {
    setShowModal(false);
    setFormData(INITIAL_FORM);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Header ── */}
      <div className="taller-header">
        <div className="taller-header-info">
          <h2>Control de Taller</h2>
          <p>Supervisión en tiempo real del flujo de producción y cuellos de botella</p>
        </div>
        <div className="taller-header-actions">
          <div className="taller-shift-badge">
            <Clock size={16} />
            Turno: Mañana
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nueva OT
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="taller-kpi-grid">
        {KPI_CONFIG.map(kpi => {
          const Icon = kpi.icon;
          const value = kpis[kpi.key];
          const pct = kpis.total > 0 ? Math.round((value / kpis.total) * 100) : 0;
          return (
            <div key={kpi.key} className="taller-kpi-card" style={{ borderTopColor: kpi.color }}>
              <div className="taller-kpi-card-left">
                <span className="taller-kpi-label">{kpi.label}</span>
                <span className="taller-kpi-value" style={{ color: kpi.color }}>{value}</span>
                <span className="taller-kpi-sub">
                  {kpi.key === 'total' ? 'órdenes activas' : `${pct}% del total`}
                </span>
              </div>
              <div className="taller-kpi-icon" style={{ background: kpi.bgColor, color: kpi.color }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ── */}
      <div className="taller-filter-bar">
        <div className="taller-filter-group">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`taller-filter-btn ${filter === opt.key ? 'taller-filter-btn--active' : ''}`}
              onClick={() => setFilter(opt.key)}
            >
              {opt.icon && <opt.icon size={14} />}
              {opt.label}
              <span className="taller-filter-count" style={{
                background: filter === opt.key ? 'var(--gray-900)' : 'var(--gray-200)',
                color: filter === opt.key ? 'var(--white)' : 'var(--gray-600)',
              }}>
                {filterCounts[opt.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="taller-kanban">
        {Object.entries(COLUMN_CONFIG).map(([colId, config]) => {
          const colItems = filteredColumns[colId] || [];
          const ColIcon = config.icon;
          const tempVar = config.tempPhase;
          return (
            <div key={colId} className="taller-column">
              {/* Column Header */}
              <div
                className="taller-column-header"
                style={{
                  borderLeftColor: `var(--temp-${tempVar}-border)`,
                  background: `var(--temp-${tempVar})`,
                  color: `var(--temp-${tempVar}-text)`,
                }}
              >
                <div className="taller-column-header-left">
                  <ColIcon size={18} />
                  <span>{config.title}</span>
                </div>
                <span className="taller-column-count">{colItems.length}</span>
              </div>

              {/* Column Body */}
              <div className="taller-column-body">
                {colItems.length === 0 ? (
                  <div className="taller-empty-state">
                    <CheckCircle2 size={32} />
                    <p>{config.emptyText}</p>
                  </div>
                ) : (
                  colItems.map(item => <TallerCard key={item.id} item={item} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Nueva OT ── */}
      {showModal && (
        <div className="taller-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="taller-modal">
            <div className="taller-modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>Nueva Orden de Trabajo</h3>
                  <p>Crea una nueva orden para el flujo de taller</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: 4, display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="taller-modal-body">
              <div className="form-group">
                <label className="form-label form-label-required">Tipo de Prenda</label>
                <select
                  className="form-select"
                  value={formData.tipoPrenda}
                  onChange={e => handleFormChange('tipoPrenda', e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Vestido">Vestido</option>
                  <option value="Pantalón">Pantalón</option>
                  <option value="Camisa">Camisa</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Blazer">Blazer</option>
                  <option value="Falda">Falda</option>
                  <option value="Chaleco">Chaleco</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Colección Destino</label>
                <select
                  className="form-select"
                  value={formData.coleccion}
                  onChange={e => handleFormChange('coleccion', e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="WS26">WINTER SUN 2026</option>
                  <option value="SS27">SPRING SUMMER 2027</option>
                  <option value="FW27">FALL WINTER 2027</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Referente (si es reprogramación)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Buscar por código PT o tipo de prenda..."
                  value={formData.referente}
                  onChange={e => handleFormChange('referente', e.target.value)}
                />
                <span className="form-help">Dejar vacío si es diseño nuevo</span>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <div className="taller-priority-group">
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      className={`taller-priority-option ${formData.prioridad === key ? 'selected' : ''} taller-priority-option--${key}`}
                      onClick={() => handleFormChange('prioridad', key)}
                      type="button"
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fase Inicial</label>
                <select
                  className="form-select"
                  value={formData.columna}
                  onChange={e => handleFormChange('columna', e.target.value)}
                >
                  <option value="corte">2.2 Corte Muestra</option>
                  <option value="confeccion">2.3 Confección Muestra</option>
                  <option value="procesoExterno">2.4 Procesos Especiales</option>
                  <option value="medicion">3.1 Medición y Tallaje</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detalles adicionales sobre la orden..."
                  value={formData.observaciones}
                  onChange={e => handleFormChange('observaciones', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="taller-modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setFormData(INITIAL_FORM); }}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleCreateOT} disabled={!formData.tipoPrenda || !formData.coleccion}>
                <Plus size={16} /> Crear Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function TallerCard({ item }) {
  const statusClass = `taller-card--${item.status}`;
  const statusBadgeClass = `taller-card-status taller-card-status--${item.status}`;

  const statusIcon = () => {
    if (item.status === 'active') return <span className="taller-card-status-dot" />;
    if (item.status === 'paused') return <Pause size={10} />;
    if (item.status === 'waiting') return <Clock size={10} />;
    return null;
  };

  return (
    <div className={`taller-card ${statusClass}`}>
      <div className="taller-card-priority" style={{ background: PRIORITY_CONFIG[item.prioridad]?.color || 'var(--gray-300)' }} />

      {/* Header: Badges */}
      <div className="taller-card-header">
        <div className="taller-card-badges">
          <span className="taller-card-md">{item.id_caso}</span>
          <span className="taller-card-tipo">{item.tipoPrenda}</span>
          {item.esNuevo && (
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--secondary-700)', background: 'var(--secondary-50)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Nuevo
            </span>
          )}
        </div>
        <div className="taller-card-indicators">
          {item.tieneProcesoExterno && (
            <span title="Requiere proceso externo" style={{ color: 'var(--warning-dark)' }}>
              <Sparkles size={14} />
            </span>
          )}
          {item.tieneBordado && (
            <span title="Requiere bordado" style={{ color: 'var(--secondary-600)' }}>
              <Zap size={14} />
            </span>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <span className={statusBadgeClass}>
          {statusIcon()}
          {item.statusLabel}
        </span>
      </div>

      {/* Body: Title & Meta */}
      <div className="taller-card-body">
        <div className="taller-card-title">{item.nombre_simulacion}</div>
        <div className="taller-card-meta">
          {item.referente ? (
            <span className="taller-card-referent">{item.referente}</span>
          ) : (
            <span className="taller-card-referent" style={{ fontStyle: 'italic' }}>Diseño Inédito</span>
          )}
          {item.temporada && (
            <span className="taller-card-collection">{item.temporada}</span>
          )}
        </div>
      </div>

      {/* Footer: Time & Operators */}
      <div className="taller-card-footer">
        <div className="taller-card-time">
          <span className="taller-card-time-label">Tiempo en fase</span>
          <div className={`taller-card-time-value ${item.status === 'active' ? 'taller-card-time-value--active' : ''}`}>
            <Clock size={12} />
            {item.timeInStage}
          </div>
        </div>

        <div className="taller-card-operators">
          {item.operadores.length > 0 ? (
            item.operadores.map((op, i) => (
              <div
                key={i}
                className={`taller-operator-avatar ${AVATAR_COLOR_MAP[op.color] || AVATAR_COLOR_MAP.primary}`}
                title={`${op.nombre} — ${op.rol}`}
              >
                {op.iniciales}
              </div>
            ))
          ) : (
            <div className="taller-operator-empty" title="Sin operador asignado">?</div>
          )}
        </div>
      </div>

      {/* Actions (Hover) */}
      <div className="taller-card-actions">
        {item.status !== 'active' ? (
          <button className="taller-action-btn taller-action-btn--start" type="button">
            <Play size={12} /> Iniciar
          </button>
        ) : (
          <button className="taller-action-btn taller-action-btn--finish" type="button">
            <CheckCircle2 size={12} /> Terminar
          </button>
        )}
        <button className="taller-action-btn taller-action-btn--alert" type="button" title="Reportar Novedad">
          <AlertCircle size={14} />
        </button>
      </div>
    </div>
  );
}