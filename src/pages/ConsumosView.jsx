import { useState, useMemo, useEffect } from 'react';
import { Save, FileSpreadsheet, Lock, Info, Ruler, Scissors, PenTool, CheckCircle2, Clock, Tag, AlertTriangle, ListChecks, Hash } from 'lucide-react';
import supabase from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import styles from './ConsumosView.module.css';

const ROLE_CONFIG = {
  CREATIVO: { label: 'Equipo Creativo', color: 'primary', shortLabel: 'CR' },
  TECNICO: { label: 'Diseñador Técnico', color: 'secondary', shortLabel: 'TC' },
  TRAZADOR: { label: 'Equipo Trazo y Corte', color: 'success', shortLabel: 'TZ' },
};

const TIPOS_TELA = ['SOLIDO', 'MOD_ARTE', 'UBI_TRAZO', 'CUERO', 'ALL_OVER'];

function buildFlatRows(refFabrics, consumos) {
  const rows = [];
  for (const rf of refFabrics) {
    const fabric = rf.fabrics || {};
    const row = {
      id: rf.id,
      refFabricId: rf.id,
      uso: rf.usage || fabric.description || '-',
      codigo: fabric.code || '-',
      descripcion: fabric.description || '-',
      baseTextil: fabric.description || '-',
      ancho: rf.width_cm ? `${rf.width_cm / 100}m` : '-',

      creativo_consumo: '',
      creativo_consumoId: null,

      tecnico_talla: '',
      tecnico_solido: '',
      tecnico_modArte: '',
      tecnico_ubicTrazo: '',
      tecnico_solidoId: null,
      tecnico_modArteId: null,
      tecnico_ubicTrazoId: null,

      trazador_talla: '',
      trazador_solido: '',
      trazador_modArte: '',
      trazador_ubicTrazo: '',
      trazador_cuero: '',
      trazador_allOver: '',
      trazador_veces: '',
      trazador_piezas: '',
      trazador_solidoId: null,
      trazador_modArteId: null,
      trazador_ubicTrazoId: null,
      trazador_cueroId: null,
      trazador_allOverId: null,

      explosion_consumo: '',
      explosion_consumoId: null,
    };

    for (const c of consumos) {
      if (c.reference_fabric_id !== rf.id) continue;

      if (c.role === 'CREATIVO') {
        row.creativo_consumo = c.consumo_valor != null ? String(c.consumo_valor) : '';
        row.creativo_consumoId = c.id;
      }

      if (c.role === 'TECNICO') {
        if (c.tipo_tela === 'SOLIDO' || !c.tipo_tela) {
          row.tecnico_solido = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.tecnico_talla = c.talla || '';
          row.tecnico_solidoId = c.id;
        } else if (c.tipo_tela === 'MOD_ARTE') {
          row.tecnico_modArte = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.tecnico_modArteId = c.id;
        } else if (c.tipo_tela === 'UBI_TRAZO') {
          row.tecnico_ubicTrazo = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.tecnico_ubicTrazoId = c.id;
        }
      }

      if (c.role === 'TRAZADOR') {
        if (c.tipo_tela === 'SOLIDO' || !c.tipo_tela) {
          row.trazador_solido = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.trazador_talla = c.talla || '';
          row.trazador_veces = c.veces_trazadas != null ? String(c.veces_trazadas) : '';
          row.trazador_piezas = c.cantidad_piezas != null ? String(c.cantidad_piezas) : '';
          row.trazador_solidoId = c.id;
        } else if (c.tipo_tela === 'MOD_ARTE') {
          row.trazador_modArte = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.trazador_modArteId = c.id;
        } else if (c.tipo_tela === 'UBI_TRAZO') {
          row.trazador_ubicTrazo = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.trazador_ubicTrazoId = c.id;
        } else if (c.tipo_tela === 'CUERO') {
          row.trazador_cuero = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.trazador_cueroId = c.id;
        } else if (c.tipo_tela === 'ALL_OVER') {
          row.trazador_allOver = c.consumo_valor != null ? String(c.consumo_valor) : '';
          row.trazador_allOverId = c.id;
        }
      }

      if (c.role === 'CONTRAMUESTRA') {
        row.explosion_consumo = c.consumo_valor != null ? String(c.consumo_valor) : '';
        row.explosion_consumoId = c.id;
      }
    }

    rows.push(row);
  }
  return rows;
}

function classifyRef(ref) {
  if (!ref) return 'SÓLIDA';
  const tags = [];
  if (ref.has_all_over) tags.push('ALL OVER');
  if (ref.has_art_modification) tags.push('MOD. ARTE');
  if (ref.has_trace_location) tags.push('UBI. TRAZO');
  return tags.length > 0 ? tags.join(' + ') : 'SÓLIDA';
}

export default function ConsumosView() {
  const { isTrazador } = useAuth();

  const [currentUserRole, setCurrentUserRole] = useState(isTrazador ? 'TRAZADOR' : 'TECNICO');
  const [referencias, setReferencias] = useState([]);
  const [selectedRefId, setSelectedRefId] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [refFabrics, setRefFabrics] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [materiales, setMateriales] = useState([]);

  useEffect(() => { loadReferencias(); }, []);
  useEffect(() => {
    if (selectedRefId) loadReferenceData(selectedRefId);
    else { setSelectedRef(null); setRefFabrics([]); setConsumos([]); }
  }, [selectedRefId]);

  useEffect(() => {
    setMateriales(buildFlatRows(refFabrics, consumos));
  }, [refFabrics, consumos]);

  async function loadReferencias() {
    try {
      const { data } = await supabase
        .from('references')
        .select('id, reference_number, name, has_art_modification, has_trace_location, has_all_over, has_embroidery')
        .eq('is_hidden', false)
        .order('reference_number')
        .limit(100);
      setReferencias(data || []);
    } catch (e) { /* silent */ }
  }

  async function loadReferenceData(dbRefId) {
    setLoading(true);
    try {
      const { data: ref } = await supabase.from('references').select('*').eq('id', dbRefId).single();
      setSelectedRef(ref || null);

      const { data: fabrics } = await supabase
        .from('reference_fabrics')
        .select('id, reference_id, fabric_id, usage, width_cm, fabrics(id, code, description, width_cm)')
        .eq('reference_id', dbRefId).eq('active', true);
      setRefFabrics(fabrics || []);

      const { data: cons } = await supabase
        .from('consumos')
        .select('*')
        .eq('reference_id', dbRefId)
        .order('role').order('version');
      setConsumos(cons || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  const clasificacion = classifyRef(selectedRef);
  const esSolida = clasificacion === 'SÓLIDA';
  const tieneBordado = selectedRef?.has_embroidery || false;

  const kpis = useMemo(() => {
    const total = materiales.length;
    const pendientes = materiales.filter(m =>
      !m.trazador_solido && !m.trazador_modArte && !m.trazador_ubicTrazo &&
      !m.trazador_cuero && !m.trazador_allOver && m.creativo_consumo
    ).length;
    const confirmados = materiales.filter(m =>
      m.trazador_solido || m.trazador_modArte || m.trazador_ubicTrazo || m.trazador_cuero || m.trazador_allOver
    ).length;
    return { total, pendientes, confirmados };
  }, [materiales]);

  const isEditable = (colRol) => currentUserRole === colRol;

  const handleCellChange = (refFabricId, field, value) => {
    setMateriales(prev => prev.map(m => m.refFabricId === refFabricId ? { ...m, [field]: value } : m));
  };

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const upserts = [];
      for (const row of materiales) {
        const role = currentUserRole;
        for (const tipo of TIPOS_TELA) {
          let valor = '';
          let veces = null;
          let piezas = null;
          let tallaVal = '';
          let existingId = null;

          if (role === 'CREATIVO' && tipo === 'SOLIDO') {
            valor = row.creativo_consumo; existingId = row.creativo_consumoId;
          } else if (role === 'TECNICO') {
            if (tipo === 'SOLIDO') { valor = row.tecnico_solido; tallaVal = row.tecnico_talla; existingId = row.tecnico_solidoId; }
            else if (tipo === 'MOD_ARTE') { valor = row.tecnico_modArte; existingId = row.tecnico_modArteId; }
            else if (tipo === 'UBI_TRAZO') { valor = row.tecnico_ubicTrazo; existingId = row.tecnico_ubicTrazoId; }
            else continue;
          } else if (role === 'TRAZADOR') {
            if (tipo === 'SOLIDO') { valor = row.trazador_solido; tallaVal = row.trazador_talla; veces = row.trazador_veces; piezas = row.trazador_piezas; existingId = row.trazador_solidoId; }
            else if (tipo === 'MOD_ARTE') { valor = row.trazador_modArte; existingId = row.trazador_modArteId; }
            else if (tipo === 'UBI_TRAZO') { valor = row.trazador_ubicTrazo; existingId = row.trazador_ubicTrazoId; }
            else if (tipo === 'CUERO') { valor = row.trazador_cuero; existingId = row.trazador_cueroId; }
            else if (tipo === 'ALL_OVER') { valor = row.trazador_allOver; existingId = row.trazador_allOverId; }
          } else { continue; }

          if (!valor && !tallaVal && !existingId) continue;

          const item = { reference_id: selectedRefId, reference_fabric_id: row.refFabricId, role, tipo_tela: tipo, version: 1 };
          if (existingId) item.id = existingId;
          if (valor) item.consumo_valor = parseFloat(valor.replace(',', '.')) || null;
          if (tallaVal) item.talla = tallaVal;
          if (veces) item.veces_trazadas = parseInt(veces, 10) || null;
          if (piezas) item.cantidad_piezas = parseInt(piezas, 10) || null;

          upserts.push(
            existingId
              ? supabase.from('consumos').update({
                  consumo_valor: item.consumo_valor, talla: item.talla,
                  veces_trazadas: item.veces_trazadas, cantidad_piezas: item.cantidad_piezas,
                }).eq('id', existingId).select('*').single()
              : supabase.from('consumos').insert({
                  reference_id: item.reference_id, reference_fabric_id: item.reference_fabric_id,
                  role: item.role, tipo_tela: item.tipo_tela, version: item.version,
                  consumo_valor: item.consumo_valor, talla: item.talla,
                  veces_trazadas: item.veces_trazadas, cantidad_piezas: item.cantidad_piezas,
                }).select('*').single()
          );
        }
      }

      if (upserts.length === 0) {
        setMessage({ type: 'info', text: 'No hay cambios para guardar.' });
        setSaving(false); return;
      }

      await Promise.all(upserts);
      setMessage({ type: 'success', text: 'Consumos guardados.' });
      if (selectedRefId) await loadReferenceData(selectedRefId);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally { setSaving(false); }
  }

  const roleConfig = ROLE_CONFIG[currentUserRole] || ROLE_CONFIG.TRAZADOR;

  if (loading && !selectedRef) {
    return <div className="fade-in" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>;
  }

  return (
    <div className={`fade-in consumos-active-role-${roleConfig.color}`}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>Validación de Consumos</h2>
          {selectedRef ? (
            <p>
              Ref: <strong style={{ color: 'var(--primary-600)' }}>{selectedRef.reference_number || '-'}</strong>
              {' — '}{selectedRef.name || '-'}
            </p>
          ) : <p>Selecciona una referencia para ver sus consumos</p>}
          {selectedRef && (
            <div className={styles.headerBadges}>
              <span className={`badge ${esSolida ? 'badge-success' : 'badge-warning'}`}><Tag size={10} /> {clasificacion}</span>
              {tieneBordado && <span className="badge badge-secondary">Bordado</span>}
            </div>
          )}
        </div>
        <div className={styles.headerActions}>
          <div className={styles.roleSelector}>
            <span>Ref:</span>
            <select value={selectedRefId || ''} onChange={(e) => { setSelectedRefId(Number(e.target.value) || null); }}>
              <option value="">-- Seleccionar --</option>
              {referencias.map(r => (
                <option key={r.id} value={r.id}>{r.reference_number} — {r.name || '-'}</option>
              ))}
            </select>
          </div>
          <div className={styles.roleSelector}>
            <span>Rol:</span>
            <select value={currentUserRole} onChange={(e) => setCurrentUserRole(e.target.value)}>
              <option value="CREATIVO">Equipo Creativo</option>
              <option value="TECNICO">Diseñador Técnico</option>
              <option value="TRAZADOR">Equipo Trazo y Corte</option>
            </select>
          </div>
          {selectedRef && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Consumos'}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', background: message.type === 'success' ? 'var(--success-light)' : message.type === 'error' ? 'var(--error-light)' : 'var(--gray-100)', color: message.type === 'success' ? 'var(--success-dark)' : message.type === 'error' ? 'var(--error-dark)' : 'var(--gray-700)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : message.type === 'error' ? <AlertTriangle size={16} /> : <Info size={16} />}
          {message.text}
        </div>
      )}

      {!selectedRef ? (
        <div className={styles.tableCard} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--gray-500)' }}>
          <FileSpreadsheet size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
          <p>Selecciona una referencia para visualizar y editar consumos.</p>
        </div>
      ) : (
        <>
          <div className="kpi-stat-grid">
            <div className="kpi-stat-card" style={{ borderTopColor: 'var(--primary-600)' }}>
              <div className="kpi-stat-left"><span className="kpi-stat-label">Total Telas</span><span className="kpi-stat-value" style={{ color: 'var(--primary-600)' }}>{kpis.total}</span><span className="kpi-stat-sub">materiales</span></div>
              <div className="kpi-stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}><FileSpreadsheet size={20} /></div>
            </div>
            <div className="kpi-stat-card" style={{ borderTopColor: 'var(--warning)' }}>
              <div className="kpi-stat-left"><span className="kpi-stat-label">Pendientes</span><span className="kpi-stat-value" style={{ color: 'var(--warning-dark)' }}>{kpis.pendientes}</span><span className="kpi-stat-sub">sin consumo trazador</span></div>
              <div className="kpi-stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)' }}><Clock size={20} /></div>
            </div>
            <div className="kpi-stat-card" style={{ borderTopColor: 'var(--success)' }}>
              <div className="kpi-stat-left"><span className="kpi-stat-label">Confirmados</span><span className="kpi-stat-value" style={{ color: 'var(--success-dark)' }}>{kpis.confirmados}</span><span className="kpi-stat-sub">con consumo trazador</span></div>
              <div className="kpi-stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}><CheckCircle2 size={20} /></div>
            </div>
            <div className="kpi-stat-card" style={{ borderTopColor: 'var(--secondary-500)' }}>
              <div className="kpi-stat-left"><span className="kpi-stat-label">Tipo</span><span className="kpi-stat-value" style={{ color: 'var(--secondary-700)', fontSize: 'var(--text-lg)' }}>{clasificacion}</span><span className="kpi-stat-sub">{esSolida ? 'Sin variantes' : 'Incluye variantes'}</span></div>
              <div className="kpi-stat-icon" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-700)' }}><Tag size={20} /></div>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th colSpan="2" className={styles.thMaterial}><FileSpreadsheet size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Material</th>
                    <th colSpan="1" className={styles.thCreativo}><PenTool size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Creativo</th>
                    <th colSpan="4" className={styles.thTecnico}><Ruler size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Técnico</th>
                    <th colSpan="8" className={styles.thTrazador}><Scissors size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Trazo y Corte</th>
                    <th colSpan="1" className={styles.thExplosion}>Explosión</th>
                  </tr>
                  <tr>
                    <th className={styles.thMaterial} style={{ textAlign: 'left', paddingLeft: 'var(--space-4)' }}>Uso</th>
                    <th className={styles.thMaterial} style={{ textAlign: 'left' }}>Código</th>
                    <th className={styles.thCreativo}>Consumo</th>
                    <th className={styles.thTecnico}>Talla</th>
                    <th className={styles.thTecnico}>Sólido</th>
                    <th className={styles.thTecnico} style={esSolida ? { opacity: 0.4 } : {}}>Mod. Arte</th>
                    <th className={styles.thTecnico} style={esSolida ? { opacity: 0.4 } : {}}>Ubic. Trazo</th>
                    <th className={styles.thTrazador}>Talla</th>
                    <th className={styles.thTrazador}>Sólido</th>
                    <th className={styles.thTrazador} style={esSolida ? { opacity: 0.4 } : {}}>Mod. Arte</th>
                    <th className={styles.thTrazador} style={esSolida ? { opacity: 0.4 } : {}}>Ubic. Trazo</th>
                    <th className={styles.thTrazador}>Cuero</th>
                    <th className={styles.thTrazador}>All Over</th>
                    <th className={styles.thTrazador}><Hash size={10} style={{ display: 'inline', marginRight: 2 }} />Veces</th>
                    <th className={styles.thTrazador}><ListChecks size={10} style={{ display: 'inline', marginRight: 2 }} />Piezas</th>
                    <th className={styles.thExplosion}>Contram.</th>
                  </tr>
                </thead>
                <tbody>
                  {materiales.length === 0 ? (
                    <tr><td colSpan="17" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-400)' }}>No hay telas asignadas.</td></tr>
                  ) : (
                    materiales.map((row) => (
                      <tr key={row.id}>
                        <td className={styles.cellInfo}>{row.uso}</td>
                        <td className={styles.cellInfoCode}>{row.codigo}</td>
                        <td className={styles.cellCreativo}><input type="text" className={styles.tableInput} value={row.creativo_consumo} disabled={!isEditable('CREATIVO')} onChange={(e) => handleCellChange(row.refFabricId, 'creativo_consumo', e.target.value)} /></td>
                        <td className={styles.cellTecnico}><input type="text" className={styles.tableInput} value={row.tecnico_talla} disabled={!isEditable('TECNICO')} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_talla', e.target.value)} /></td>
                        <td className="consumos-cell-tecnico consumos-cell-bold"><input type="text" className={styles.tableInput} value={row.tecnico_solido} disabled={!isEditable('TECNICO')} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_solido', e.target.value)} /></td>
                        <td className={esSolida ? 'consumos-cell-tecnico consumos-cell-locked' : 'consumos-cell-tecnico'}><input type="text" className={styles.tableInput} value={row.tecnico_modArte} disabled={!isEditable('TECNICO') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_modArte', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className={esSolida ? 'consumos-cell-tecnico consumos-cell-locked' : 'consumos-cell-tecnico'}><input type="text" className={styles.tableInput} value={row.tecnico_ubicTrazo} disabled={!isEditable('TECNICO') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_ubicTrazo', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className={styles.cellTrazador}><input type="text" className={styles.tableInput} value={row.trazador_talla} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_talla', e.target.value)} /></td>
                        <td className="consumos-cell-trazador consumos-cell-bold"><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_solido} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_solido', e.target.value)} /></td>
                        <td className={esSolida ? 'consumos-cell-trazador consumos-cell-locked' : 'consumos-cell-trazador'}><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_modArte} disabled={!isEditable('TRAZADOR') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_modArte', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className={esSolida ? 'consumos-cell-trazador consumos-cell-locked' : 'consumos-cell-trazador'}><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_ubicTrazo} disabled={!isEditable('TRAZADOR') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_ubicTrazo', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className="consumos-cell-trazador"><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_cuero} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_cuero', e.target.value)} /></td>
                        <td className="consumos-cell-trazador"><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_allOver} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_allOver', e.target.value)} /></td>
                        <td className={styles.cellTrazador}><input type="text" className={styles.tableInput} placeholder="1" value={row.trazador_veces} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_veces', e.target.value)} /></td>
                        <td className={styles.cellTrazador}><input type="text" className={styles.tableInput} placeholder="0" value={row.trazador_piezas} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_piezas', e.target.value)} /></td>
                        <td className={styles.cellCalculated}><input type="text" className="consumos-table-input consumos-table-input-placeholder" value={row.explosion_consumo} disabled placeholder="SAP..." /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              <div className={styles.legend}>
                <div className={styles.legendItem}><div className="consumos-legend-dot consumos-legend-dot--creativo" />Creativo</div>
                <div className={styles.legendItem}><div className="consumos-legend-dot consumos-legend-dot--tecnico" />Técnico</div>
                <div className={styles.legendItem}><div className="consumos-legend-dot consumos-legend-dot--trazador" />Trazador</div>
                {esSolida && <div className={styles.legendItem}><Lock size={12} style={{ opacity: 0.4 }} />Bloqueado (Sólida)</div>}
                <div className={styles.legendItem}><div className="consumos-legend-dot consumos-legend-dot--calculated" />Calculado SAP</div>
              </div>
            </div>
          </div>

          <div className={styles.infoNote}>
            <Info size={16} />
            <div>Selecciona el <strong>rol</strong> para editar sus columnas. <strong>Veces</strong> y <strong>Piezas</strong> son exclusivos del Trazador. <strong>Cuero</strong> y <strong>All Over</strong> son nuevos tipos de tela.</div>
          </div>
        </>
      )}
    </div>
  );
}
