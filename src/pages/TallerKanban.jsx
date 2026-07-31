import { useState, useMemo } from 'react';
import data from '../data/casos_uso_referencias.json';
import {
  Scissors, Shirt, Sparkles, Ruler, Clock, Play, Pause,
  CheckCircle2, AlertCircle, Activity, X,
  Plus, Zap
} from 'lucide-react';
import styles from './TallerKanban.module.css';

const COLUMN_CONFIG = {
  corte: { title: '2.3 Corte', tempPhase: 'cold', icon: Scissors, emptyText: 'No hay prendas en corte' },
  confeccion: { title: '2.4 Confeccion', tempPhase: 'cold', icon: Shirt, emptyText: 'No hay prendas en confección' },
  procesoExterno: { title: '2.5 Bordado', tempPhase: 'warm', icon: Sparkles, emptyText: 'No hay procesos externos activos' },
  medicion: { title: '2.6 Medicion', tempPhase: 'warm', icon: Ruler, emptyText: 'No hay prendas en medición' },
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
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>Control de Taller</h2>
          <p>Supervisión en tiempo real del flujo de producción y cuellos de botella</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.shiftBadge}>
            <Clock size={16} />
            Turno: Mañana
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nueva OT
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="kpi-stat-grid">
        {KPI_CONFIG.map(kpi => {
          const Icon = kpi.icon;
          const value = kpis[kpi.key];
          const pct = kpis.total > 0 ? Math.round((value / kpis.total) * 100) : 0;
          return (
            <div key={kpi.key} className="kpi-stat-card" style={{ borderTopColor: kpi.color }}>
              <div className="kpi-stat-left">
                <span className="kpi-stat-label">{kpi.label}</span>
                <span className="kpi-stat-value" style={{ color: kpi.color }}>{value}</span>
                <span className="kpi-stat-sub">
                  {kpi.key === 'total' ? 'órdenes activas' : `${pct}% del total`}
                </span>
              </div>
              <div className="kpi-stat-icon" style={{ background: kpi.bgColor, color: kpi.color }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`${styles.filterBtn} ${filter === opt.key ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(opt.key)}
            >
              {opt.icon && <opt.icon size={14} />}
              {opt.label}
              <span className={styles.filterCount} style={{
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
      <div className={styles.kanban}>
        {Object.entries(COLUMN_CONFIG).map(([colId, config]) => {
          const colItems = filteredColumns[colId] || [];
          const ColIcon = config.icon;
          const tempVar = config.tempPhase;
          return (
            <div key={colId} className={styles.column}>
              {/* Column Header */}
              <div
                className={styles.columnHeader}
                style={{
                  borderLeftColor: `var(--temp-${tempVar}-border)`,
                  background: `var(--temp-${tempVar})`,
                  color: `var(--temp-${tempVar}-text)`,
                }}
              >
                <div className={styles.columnHeaderLeft}>
                  <ColIcon size={18} />
                  <span>{config.title}</span>
                </div>
                <span className={styles.columnCount}>{colItems.length}</span>
              </div>

              {/* Column Body */}
              <div className={styles.columnBody}>
                {colItems.length === 0 ? (
                  <div className={styles.emptyState}>
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
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
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

            <div className={styles.modalBody}>
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
                <div className={styles.priorityGroup}>
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
                  <option value="corte">2.3 Corte</option>
                  <option value="confeccion">2.4 Confeccion</option>
                  <option value="procesoExterno">2.5 Bordado</option>
                  <option value="medicion">2.6 Medicion</option>
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

            <div className={styles.modalFooter}>
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
  const statusCardClass = item.status === 'active' ? styles.cardActive : item.status === 'paused' ? styles.cardPaused : styles.cardWaiting;
  const statusBadgeClass = `${styles.cardStatus} ${item.status === 'active' ? styles.cardStatusActive : item.status === 'paused' ? styles.cardStatusPaused : styles.cardStatusWaiting}`;

  const statusIcon = () => {
    if (item.status === 'active') return <span className={styles.cardStatusDot} />;
    if (item.status === 'paused') return <Pause size={10} />;
    if (item.status === 'waiting') return <Clock size={10} />;
    return null;
  };

  return (
    <div className={`${styles.card} ${statusCardClass}`}>
      <div className={styles.cardPriority} style={{ background: PRIORITY_CONFIG[item.prioridad]?.color || 'var(--gray-300)' }} />

      {/* Header: Badges */}
      <div className={styles.cardHeader}>
        <div className={styles.cardBadges}>
          <span className={styles.cardMd}>{item.id_caso}</span>
          <span className={styles.cardTipo}>{item.tipoPrenda}</span>
          {item.esNuevo && (
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--secondary-700)', background: 'var(--secondary-50)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Nuevo
            </span>
          )}
        </div>
        <div className={styles.cardIndicators}>
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
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{item.nombre_simulacion}</div>
        <div className={styles.cardMeta}>
          {item.referente ? (
            <span className={styles.cardReferent}>{item.referente}</span>
          ) : (
            <span className={styles.cardReferent} style={{ fontStyle: 'italic' }}>Diseño Inédito</span>
          )}
          {item.temporada && (
            <span className={styles.cardCollection}>{item.temporada}</span>
          )}
        </div>
      </div>

      {/* Footer: Time & Operators */}
      <div className={styles.cardFooter}>
        <div className={styles.cardTime}>
          <span className={styles.cardTimeLabel}>Tiempo en fase</span>
          <div className={`${styles.cardTimeValue} ${item.status === 'active' ? styles.cardTimeValueActive : ''}`}>
            <Clock size={12} />
            {item.timeInStage}
          </div>
        </div>

        <div className={styles.cardOperators}>
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
            <div className={styles.operatorEmpty} title="Sin operador asignado">?</div>
          )}
        </div>
      </div>

      {/* Actions (Hover) */}
      <div className={styles.cardActions}>
        {item.status !== 'active' ? (
          <button className={`${styles.actionBtn} ${styles.actionBtnStart}`} type="button">
            <Play size={12} /> Iniciar
          </button>
        ) : (
          <button className={`${styles.actionBtn} ${styles.actionBtnFinish}`} type="button">
            <CheckCircle2 size={12} /> Terminar
          </button>
        )}
        <button className={`${styles.actionBtn} ${styles.actionBtnAlert}`} type="button" title="Reportar Novedad">
          <AlertCircle size={14} />
        </button>
      </div>
    </div>
  );
}