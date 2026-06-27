import { useState, useMemo } from 'react';
import { Save, Plus, FileSpreadsheet, Lock, Info, Ruler, Scissors, PenTool, CheckCircle2, Clock, Tag } from 'lucide-react';

const ROLE_CONFIG = {
  CREATIVO: { label: 'Equipo Creativo', color: 'primary', shortLabel: 'CR' },
  TECNICO: { label: 'Diseñador Técnico', color: 'secondary', shortLabel: 'TC' },
  TRAZADOR: { label: 'Equipo Trazo y Corte', color: 'success', shortLabel: 'TZ' },
};

const INITIAL_MATERIALES = [
  {
    id: 1,
    uso: 'TELA LUCIR',
    codigo: 'TE00008887',
    descripcion: 'SAND LINEN BLEND',
    baseTextil: 'Lino/Algodón',
    ancho: '1.50m',
    creativo_consumo: '2.16',
    tecnico_talla: '8',
    tecnico_solido: '2.09',
    tecnico_modArte: '',
    tecnico_ubicTrazo: '',
    trazador_talla: '',
    trazador_solido: '',
    trazador_modArte: '',
    trazador_ubicTrazo: '',
    explosion_consumo: '',
  },
  {
    id: 2,
    uso: 'TELA FORRO',
    codigo: 'TEN0007502',
    descripcion: 'ECRU CUPRO LINING',
    baseTextil: 'Cupro',
    ancho: '1.40m',
    creativo_consumo: '0.23',
    tecnico_talla: '8',
    tecnico_solido: '1.42',
    tecnico_modArte: '',
    tecnico_ubicTrazo: '',
    trazador_talla: '',
    trazador_solido: '',
    trazador_modArte: '',
    trazador_ubicTrazo: '',
    explosion_consumo: '',
  },
  {
    id: 3,
    uso: 'ENTERTELA',
    codigo: 'EN00003210',
    descripcion: 'FUSIBLE LIGHT WEIGHT',
    baseTextil: 'Poliéster',
    ancho: '1.00m',
    creativo_consumo: '0.85',
    tecnico_talla: '8',
    tecnico_solido: '0.78',
    tecnico_modArte: '',
    tecnico_ubicTrazo: '',
    trazador_talla: '',
    trazador_solido: '',
    trazador_modArte: '',
    trazador_ubicTrazo: '',
    explosion_consumo: '',
  },
  {
    id: 4,
    uso: 'CINTA SESGO',
    codigo: 'CI0005612',
    descripcion: 'BIAS BINDING ECRU',
    baseTextil: 'Algodón',
    ancho: '1.20cm',
    creativo_consumo: '1.50',
    tecnico_talla: '-',
    tecnico_solido: '1.45',
    tecnico_modArte: '',
    tecnico_ubicTrazo: '',
    trazador_talla: '',
    trazador_solido: '',
    trazador_modArte: '',
    trazador_ubicTrazo: '',
    explosion_consumo: '',
  },
  {
    id: 5,
    uso: 'FORRO BOLSILLO',
    codigo: 'FB0009100',
    descripcion: 'ECRU BAMBINI POPLIN',
    baseTextil: 'Algodón/Poliéster',
    ancho: '1.45m',
    creativo_consumo: '0.18',
    tecnico_talla: '8',
    tecnico_solido: '0.15',
    tecnico_modArte: '',
    tecnico_ubicTrazo: '',
    trazador_talla: '',
    trazador_solido: '',
    trazador_modArte: '',
    trazador_ubicTrazo: '',
    explosion_consumo: '',
  },
];

export default function ConsumosView() {
  const [currentUserRole, setCurrentUserRole] = useState('TRAZADOR');
  const [materiales, setMateriales] = useState(INITIAL_MATERIALES);

  const referenciaActual = {
    codigo: 'PT03402',
    codigoMD: 'MD-002',
    nombre: 'ECRU/SAND FEMININITY DRAMATIC PANT',
    tipoPrenda: 'Pantalón',
    color: 'Ecru/Sand',
    temporada: 'WS26',
    clasificacion: 'SÓLIDA',
    tieneBordado: false,
    tieneProcesoExterno: false,
    tieneSemielaborado: false,
  };

  const esSolida = referenciaActual.clasificacion === 'SÓLIDA';

  const kpis = useMemo(() => {
    const total = materiales.length;
    const pendientes = materiales.filter(m => !m.trazador_solido && m.creativo_consumo).length;
    const confirmados = materiales.filter(m => m.trazador_solido).length;
    return { total, pendientes, confirmados };
  }, [materiales]);

  const isEditable = (colRol) => currentUserRole === colRol;

  const handleCellChange = (id, field, value) => {
    setMateriales(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const roleConfig = ROLE_CONFIG[currentUserRole];

  return (
    <div className={`fade-in consumos-active-role-${roleConfig.color}`}>
      {/* ── Header ── */}
      <div className="consumos-header">
        <div className="consumos-header-info">
          <h2>Validación de Consumos</h2>
          <p>
            Referencia: <strong style={{ color: 'var(--primary-600)' }}>{referenciaActual.codigoMD}</strong>
            {' / '}
            <strong>{referenciaActual.codigo}</strong>
            {' — '}
            {referenciaActual.nombre}
          </p>
          <div className="consumos-header-badges">
            <span className={`badge ${esSolida ? 'badge-success' : 'badge-warning'}`}>
              <Tag size={10} />
              {referenciaActual.clasificacion}
            </span>
            {referenciaActual.tieneBordado && (
              <span className="badge badge-secondary" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-700)' }}>Bordado</span>
            )}
            {referenciaActual.tieneProcesoExterno && (
              <span className="badge badge-warning">Proc. Externo</span>
            )}
          </div>
        </div>
        <div className="consumos-header-actions">
          <div className="consumos-role-selector">
            <span>Rol:</span>
            <select value={currentUserRole} onChange={(e) => setCurrentUserRole(e.target.value)}>
              <option value="CREATIVO">Equipo Creativo</option>
              <option value="TECNICO">Diseñador Técnico</option>
              <option value="TRAZADOR">Equipo Trazo y Corte</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <Save size={16} /> Guardar Consumos
          </button>
        </div>
      </div>

      {/* ── Reference Card ── */}
      <div className="consumos-ref-card">
        <div className="consumos-ref-left">
          <div className="consumos-ref-codes">
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span className="code-badge code-md" style={{ fontSize: 13, padding: '3px 10px' }}>{referenciaActual.codigoMD}</span>
              <span className="code-badge code-pt" style={{ fontSize: 13, padding: '3px 10px' }}>{referenciaActual.codigo}</span>
            </div>
          </div>
          <div className="consumos-ref-info">
            <span className="consumos-ref-name">{referenciaActual.tipoPrenda} · {referenciaActual.color}</span>
            <span className="consumos-ref-meta">Temporada {referenciaActual.temporada} · {referenciaActual.clasificacion}</span>
          </div>
        </div>
        <div className="consumos-ref-right">
          <div className="consumos-ref-indicators">
            {esSolida && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--success-dark)', background: 'var(--success-light)', padding: '3px 10px', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={12} /> Sólida — Mod. Arte y Trazo bloqueados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="consumos-kpi-grid">
        <div className="consumos-kpi-card" style={{ borderTopColor: 'var(--primary-600)' }}>
          <div className="consumos-kpi-card-left">
            <span className="consumos-kpi-label">Total Telas</span>
            <span className="consumos-kpi-value" style={{ color: 'var(--primary-600)' }}>{kpis.total}</span>
            <span className="consumos-kpi-sub">materiales registrados</span>
          </div>
          <div className="consumos-kpi-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <FileSpreadsheet size={20} />
          </div>
        </div>
        <div className="consumos-kpi-card" style={{ borderTopColor: 'var(--warning)' }}>
          <div className="consumos-kpi-card-left">
            <span className="consumos-kpi-label">Pendientes</span>
            <span className="consumos-kpi-value" style={{ color: 'var(--warning-dark)' }}>{kpis.pendientes}</span>
            <span className="consumos-kpi-sub">sin consumo trazador</span>
          </div>
          <div className="consumos-kpi-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)' }}>
            <Clock size={20} />
          </div>
        </div>
        <div className="consumos-kpi-card" style={{ borderTopColor: 'var(--success)' }}>
          <div className="consumos-kpi-card-left">
            <span className="consumos-kpi-label">Confirmados</span>
            <span className="consumos-kpi-value" style={{ color: 'var(--success-dark)' }}>{kpis.confirmados}</span>
            <span className="consumos-kpi-sub">consumos completos</span>
          </div>
          <div className="consumos-kpi-icon" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="consumos-kpi-card" style={{ borderTopColor: 'var(--secondary-500)' }}>
          <div className="consumos-kpi-card-left">
            <span className="consumos-kpi-label">Tipo</span>
            <span className="consumos-kpi-value" style={{ color: 'var(--secondary-700)', fontSize: 'var(--text-lg)' }}>{referenciaActual.clasificacion}</span>
            <span className="consumos-kpi-sub">{esSolida ? 'Sin mod. arte ni trazo' : 'Incluye variantes'}</span>
          </div>
          <div className="consumos-kpi-icon" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-700)' }}>
            <Tag size={20} />
          </div>
        </div>
      </div>

      {/* ── Consumption Table ── */}
      <div className="consumos-table-card">
        <div className="consumos-table-wrapper">
          <table className="consumos-table">
            <thead>
              {/* Super headers (grouping) */}
              <tr>
                <th colSpan="2" className="consumos-th-material">
                  <FileSpreadsheet size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Material
                </th>
                <th colSpan="1" className="consumos-th-creativo">
                  <PenTool size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Equipo Creativo
                </th>
                <th colSpan="4" className="consumos-th-tecnico">
                  <Ruler size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Diseñador Técnico
                </th>
                <th colSpan="4" className="consumos-th-trazador">
                  <Scissors size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Equipo Trazo y Corte
                </th>
                <th colSpan="1" className="consumos-th-explosion">Explosión</th>
              </tr>
              {/* Sub headers */}
              <tr>
                <th className="consumos-th-material" style={{ textAlign: 'left', paddingLeft: 'var(--space-4)' }}>Uso en Prenda</th>
                <th className="consumos-th-material" style={{ textAlign: 'left' }}>Código</th>

                <th className="consumos-th-creativo">Consumo Creativo</th>

                <th className="consumos-th-tecnico">Talla</th>
                <th className="consumos-th-tecnico">Sólido</th>
                <th className="consumos-th-tecnico" style={esSolida ? { opacity: 0.4 } : {}}>Mod. Arte</th>
                <th className="consumos-th-tecnico" style={esSolida ? { opacity: 0.4 } : {}}>Ubic. Trazo</th>

                <th className="consumos-th-trazador">Talla</th>
                <th className="consumos-th-trazador">Sólido</th>
                <th className="consumos-th-trazador" style={esSolida ? { opacity: 0.4 } : {}}>Mod. Arte</th>
                <th className="consumos-th-trazador" style={esSolida ? { opacity: 0.4 } : {}}>Ubic. Trazo</th>

                <th className="consumos-th-explosion">Contramuestra</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((row) => (
                <tr key={row.id}>
                  {/* Info Material */}
                  <td className="consumos-cell-info">{row.uso}</td>
                  <td className="consumos-cell-info-code">{row.codigo}</td>

                  {/* CREATIVO */}
                  <td className="consumos-cell-creativo">
                    <input
                      type="text"
                      className="consumos-table-input"
                      value={row.creativo_consumo}
                      disabled={!isEditable('CREATIVO')}
                      onChange={(e) => handleCellChange(row.id, 'creativo_consumo', e.target.value)}
                    />
                  </td>

                  {/* TÉCNICO */}
                  <td className="consumos-cell-tecnico">
                    <input type="text" className="consumos-table-input"
                      value={row.tecnico_talla} disabled={!isEditable('TECNICO')}
                      onChange={(e) => handleCellChange(row.id, 'tecnico_talla', e.target.value)} />
                  </td>
                  <td className="consumos-cell-tecnico consumos-cell-bold">
                    <input type="text" className="consumos-table-input"
                      value={row.tecnico_solido} disabled={!isEditable('TECNICO')}
                      onChange={(e) => handleCellChange(row.id, 'tecnico_solido', e.target.value)} />
                  </td>
                  <td className={esSolida ? 'consumos-cell-tecnico consumos-cell-locked' : 'consumos-cell-tecnico'}>
                    <input type="text" className="consumos-table-input"
                      value={row.tecnico_modArte} disabled={!isEditable('TECNICO') || esSolida}
                      onChange={(e) => handleCellChange(row.id, 'tecnico_modArte', e.target.value)} />
                    {esSolida && <Lock size={12} className="consumos-locked-icon" />}
                  </td>
                  <td className={esSolida ? 'consumos-cell-tecnico consumos-cell-locked' : 'consumos-cell-tecnico'}>
                    <input type="text" className="consumos-table-input"
                      value={row.tecnico_ubicTrazo} disabled={!isEditable('TECNICO') || esSolida}
                      onChange={(e) => handleCellChange(row.id, 'tecnico_ubicTrazo', e.target.value)} />
                    {esSolida && <Lock size={12} className="consumos-locked-icon" />}
                  </td>

                  {/* TRAZADOR */}
                  <td className="consumos-cell-trazador">
                    <input type="text" className="consumos-table-input"
                      value={row.trazador_talla} disabled={!isEditable('TRAZADOR')}
                      onChange={(e) => handleCellChange(row.id, 'trazador_talla', e.target.value)} />
                  </td>
                  <td className="consumos-cell-trazador consumos-cell-bold">
                    <input type="text" className="consumos-table-input"
                      value={row.trazador_solido} disabled={!isEditable('TRAZADOR')}
                      onChange={(e) => handleCellChange(row.id, 'trazador_solido', e.target.value)}
                      placeholder="0.00" />
                  </td>
                  <td className={esSolida ? 'consumos-cell-trazador consumos-cell-locked' : 'consumos-cell-trazador'}>
                    <input type="text" className="consumos-table-input"
                      value={row.trazador_modArte} disabled={!isEditable('TRAZADOR') || esSolida}
                      onChange={(e) => handleCellChange(row.id, 'trazador_modArte', e.target.value)} />
                    {esSolida && <Lock size={12} className="consumos-locked-icon" />}
                  </td>
                  <td className={esSolida ? 'consumos-cell-trazador consumos-cell-locked' : 'consumos-cell-trazador'}>
                    <input type="text" className="consumos-table-input"
                      value={row.trazador_ubicTrazo} disabled={!isEditable('TRAZADOR') || esSolida}
                      onChange={(e) => handleCellChange(row.id, 'trazador_ubicTrazo', e.target.value)} />
                    {esSolida && <Lock size={12} className="consumos-locked-icon" />}
                  </td>

                  {/* EXPLOSION */}
                  <td className="consumos-cell-calculated">
                    <input type="text" className="consumos-table-input consumos-table-input-placeholder"
                      value={row.explosion_consumo} disabled placeholder="SAP..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer ── */}
        <div className="consumos-table-footer">
          <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-600)' }}>
            <Plus size={14} /> Añadir Insumo
          </button>
          <div className="consumos-legend">
            <div className="consumos-legend-item">
              <div className="consumos-legend-dot consumos-legend-dot--creativo" />
              Creativo
            </div>
            <div className="consumos-legend-item">
              <div className="consumos-legend-dot consumos-legend-dot--tecnico" />
              Técnico
            </div>
            <div className="consumos-legend-item">
              <div className="consumos-legend-dot consumos-legend-dot--trazador" />
              Trazador
            </div>
            {esSolida && (
              <div className="consumos-legend-item">
                <Lock size={12} style={{ opacity: 0.4 }} />
                Bloqueado (Sólida)
              </div>
            )}
            <div className="consumos-legend-item">
              <div className="consumos-legend-dot consumos-legend-dot--calculated" />
              Calculado SAP
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Note ── */}
      <div className="consumos-info-note">
        <Info size={16} />
        <div>
          Los campos de <strong>Mod. Arte</strong> y <strong>Ubic. Trazo</strong> están bloqueados porque esta referencia está clasificada como <strong>Sólida</strong>. Las columnas de Explosión (Contramuestra) se calculan automáticamente desde SAP.
        </div>
      </div>
    </div>
  );
}