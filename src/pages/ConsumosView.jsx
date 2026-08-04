import { useState, useMemo, useEffect } from 'react';
import { Save, FileSpreadsheet, Lock, Info, Ruler, Scissors, PenTool, CheckCircle2, Clock, Tag, AlertTriangle, ListChecks, Hash } from 'lucide-react';
import supabase from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ConsumoVersionesModal from '../components/ConsumoVersionesModal';
import styles from './ConsumosView.module.css';

const ROLE_CONFIG = {
  CREATIVO: { label: 'Equipo Creativo', color: 'primary', shortLabel: 'CR' },
  TECNICO: { label: 'Diseñador Técnico', color: 'secondary', shortLabel: 'TC' },
  TRAZADOR: { label: 'Equipo Trazo y Corte', color: 'success', shortLabel: 'TZ' },
};

const TIPOS_TELA = ['SOLIDO', 'MOD_ARTE', 'UBI_TRAZO', 'CUERO', 'ALL_OVER'];

function buildFlatRows(refFabrics, consumos, referenceId) {
  const grouped = {};
  for (const c of consumos) {
    const key = `${c.reference_fabric_id}|${c.role}|${c.tipo_tela || 'SOLIDO'}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      const aFinal = a.es_final ? 1 : 0;
      const bFinal = b.es_final ? 1 : 0;
      if (aFinal !== bFinal) return bFinal - aFinal;
      return (b.version || 1) - (a.version || 1);
    });
  }

  function pickBest(key) {
    const items = grouped[key] || [];
    if (items.length === 0) return { value: '', id: null, verCount: 0, talla: '', veces: '', piezas: '' };
    const best = items[0];
    return {
      value: best.consumo_valor != null ? String(best.consumo_valor) : '',
      id: best.id,
      verCount: items.length,
      talla: best.talla || '',
      veces: best.veces_trazadas != null ? String(best.veces_trazadas) : '',
      piezas: best.cantidad_piezas != null ? String(best.cantidad_piezas) : '',
    };
  }

  const rows = [];
  for (const rf of refFabrics) {
    const fabric = rf.fabrics || {};
    const rk = (role, tipo) => `${rf.id}|${role}|${tipo}`;

    const cr = pickBest(rk('CREATIVO', 'SOLIDO'));
    const tcSol = pickBest(rk('TECNICO', 'SOLIDO'));
    const tcMA = pickBest(rk('TECNICO', 'MOD_ARTE'));
    const tcUT = pickBest(rk('TECNICO', 'UBI_TRAZO'));
    const tzSol = pickBest(rk('TRAZADOR', 'SOLIDO'));
    const tzMA = pickBest(rk('TRAZADOR', 'MOD_ARTE'));
    const tzUT = pickBest(rk('TRAZADOR', 'UBI_TRAZO'));
    const tzCu = pickBest(rk('TRAZADOR', 'CUERO'));
    const tzAO = pickBest(rk('TRAZADOR', 'ALL_OVER'));
    const ex = pickBest(rk('CONTRAMUESTRA', 'SOLIDO'));

    rows.push({
      id: rf.id,
      refFabricId: rf.id,
      uso: rf.usage || fabric.description || '-',
      codigo: fabric.code || '-',
      descripcion: fabric.description || '-',
      baseTextil: fabric.description || '-',
      ancho: rf.width_cm ? `${rf.width_cm / 100}m` : '-',

      creativo_consumo: cr.value,
      creativo_consumoId: cr.id,
      creativo_verCount: cr.verCount,

      tecnico_talla: tcSol.talla,
      tecnico_solido: tcSol.value,
      tecnico_modArte: tcMA.value,
      tecnico_ubicTrazo: tcUT.value,
      tecnico_solidoId: tcSol.id,
      tecnico_modArteId: tcMA.id,
      tecnico_ubicTrazoId: tcUT.id,
      tecnico_solidoVerCount: tcSol.verCount,
      tecnico_modArteVerCount: tcMA.verCount,
      tecnico_ubicTrazoVerCount: tcUT.verCount,

      trazador_talla: tzSol.talla,
      trazador_solido: tzSol.value,
      trazador_modArte: tzMA.value,
      trazador_ubicTrazo: tzUT.value,
      trazador_cuero: tzCu.value,
      trazador_allOver: tzAO.value,
      trazador_veces: tzSol.veces,
      trazador_piezas: tzSol.piezas,
      trazador_solidoId: tzSol.id,
      trazador_modArteId: tzMA.id,
      trazador_ubicTrazoId: tzUT.id,
      trazador_cueroId: tzCu.id,
      trazador_allOverId: tzAO.id,
      trazador_solidoVerCount: tzSol.verCount,
      trazador_modArteVerCount: tzMA.verCount,
      trazador_ubicTrazoVerCount: tzUT.verCount,
      trazador_cueroVerCount: tzCu.verCount,
      trazador_allOverVerCount: tzAO.verCount,

      explosion_consumo: ex.value,
      explosion_consumoId: ex.id,
      explosion_verCount: ex.verCount,
    });
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
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredYears, setFilteredYears] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [selectedRefId, setSelectedRefId] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [refFabrics, setRefFabrics] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [versionModal, setVersionModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    supabase.from('collections').select('id, code, name').eq('active', true).order('id')
      .then(({ data }) => { if (data) setCollections(data); });
  }, []);

  useEffect(() => {
    if (!selectedCollectionId) { setFilteredYears([]); setSelectedYear(''); return; }
    supabase.from('collection_years')
      .select('id, year').eq('collection_id', selectedCollectionId).eq('is_hidden', false)
      .order('year', { ascending: false })
      .then(({ data }) => { if (data) setFilteredYears(data); });
  }, [selectedCollectionId]);

  useEffect(() => {
    if (!selectedCollectionId || !selectedYear) { setReferencias([]); return; }
    supabase.from('references')
      .select('id, reference_number, name, has_art_modification, has_trace_location, has_all_over, has_embroidery')
      .eq('collection_id', selectedCollectionId).eq('year', selectedYear).eq('is_hidden', false)
      .order('reference_number')
      .then(({ data }) => { if (data) setReferencias(data); });
  }, [selectedCollectionId, selectedYear]);

  useEffect(() => {
    if (selectedRefId) loadReferenceData(selectedRefId);
    else { setSelectedRef(null); setRefFabrics([]); setConsumos([]); }
  }, [selectedRefId]);

  useEffect(() => {
    setMateriales(buildFlatRows(refFabrics, consumos, selectedRefId));
  }, [refFabrics, consumos]);

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

  function openVersiones(refFabricId, role, tipoTela) {
    setVersionModal({ refFabricId, role, tipoTela: tipoTela || 'SOLIDO' });
  }

  function VersionBadge({ count, onClick }) {
    if (count <= 1) return null;
    return (
      <span
        title={`${count} versiones — clic para ver historial`}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{
          position: 'absolute', top: 2, right: 2,
          background: 'var(--primary-600)', color: 'white', fontSize: 9,
          fontWeight: 700, padding: '1px 4px', borderRadius: 'var(--radius-full)',
          cursor: 'pointer', lineHeight: 1.2,
        }}
      >v{count}</span>
    );
  }

  const handleCellChange = (refFabricId, field, value) => {
    setMateriales(prev => prev.map(m => m.refFabricId === refFabricId ? { ...m, [field]: value } : m));
  };

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const versionCache = {};
      for (const row of materiales) {
        const vKey = `${row.refFabricId}|${currentUserRole}`;
        if (versionCache[vKey] === undefined) {
          const { data } = await supabase.from('consumos')
            .select('version').eq('reference_fabric_id', row.refFabricId)
            .eq('role', currentUserRole).order('version', { ascending: false }).limit(1);
          versionCache[vKey] = (data?.length > 0) ? data[0].version : 0;
        }
      }

      const upserts = [];
      for (const row of materiales) {
        const role = currentUserRole;
        const vKey = `${row.refFabricId}|${role}`;
        const nextVer = (versionCache[vKey] || 0) + 1;

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

          const item = { reference_id: selectedRefId, reference_fabric_id: row.refFabricId, role, tipo_tela: tipo, version: nextVer };
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
                  es_final: true, version: nextVer,
                }).eq('id', existingId).select('*').single()
              : supabase.from('consumos').insert({
                  reference_id: item.reference_id, reference_fabric_id: item.reference_fabric_id,
                  role: item.role, tipo_tela: item.tipo_tela, version: item.version,
                  consumo_valor: item.consumo_valor, talla: item.talla,
                  veces_trazadas: item.veces_trazadas, cantidad_piezas: item.cantidad_piezas,
                  es_final: true,
                }).select('*').single()
          );

          versionCache[vKey] = Math.max(versionCache[vKey] || 0, nextVer);
        }
      }

      if (upserts.length === 0) {
        setMessage({ type: 'info', text: 'No hay cambios para guardar.' });
        setSaving(false); return;
      }

      await Promise.all(upserts);
      setToast('Consumos guardados correctamente');
      setTimeout(() => setToast(null), 3500);
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
              <span>Col:</span>
              <select value={selectedCollectionId}
                onChange={(e) => { setSelectedCollectionId(e.target.value); setSelectedYear(''); setFilteredYears([]); setSelectedRefId(null); }}>
                <option value="">Colección...</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.roleSelector}>
              <span>Año:</span>
              <select value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setSelectedRefId(null); }}
                disabled={!selectedCollectionId || filteredYears.length === 0}>
                <option value="">Año...</option>
                {filteredYears.map(y => (
                  <option key={y.id} value={y.year}>{y.year}</option>
                ))}
              </select>
            </div>
            <div className={styles.roleSelector}>
              <span>Ref:</span>
              <select value={selectedRefId || ''}
                onChange={(e) => setSelectedRefId(Number(e.target.value) || null)}
                disabled={!selectedYear || referencias.length === 0}>
                <option value="">-- Seleccionar Ref --</option>
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
                        <td className={styles.cellCreativo}>
                          <div style={{ position: 'relative' }}>
                            <input type="text" className={styles.tableInput} value={row.creativo_consumo} disabled={!isEditable('CREATIVO')} onChange={(e) => handleCellChange(row.refFabricId, 'creativo_consumo', e.target.value)} />
                            <VersionBadge count={row.creativo_verCount} onClick={() => openVersiones(row.refFabricId, 'CREATIVO', 'SOLIDO')} />
                          </div>
                        </td>
                        <td className={styles.cellTecnico}><input type="text" className={styles.tableInput} value={row.tecnico_talla} disabled={!isEditable('TECNICO')} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_talla', e.target.value)} /></td>
                        <td className="consumos-cell-tecnico consumos-cell-bold">
                          <div style={{ position: 'relative' }}>
                            <input type="text" className={styles.tableInput} value={row.tecnico_solido} disabled={!isEditable('TECNICO')} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_solido', e.target.value)} />
                            <VersionBadge count={row.tecnico_solidoVerCount} onClick={() => openVersiones(row.refFabricId, 'TECNICO', 'SOLIDO')} />
                          </div>
                        </td>
                        <td className={esSolida ? 'consumos-cell-tecnico consumos-cell-locked' : 'consumos-cell-tecnico'}><input type="text" className={styles.tableInput} value={row.tecnico_modArte} disabled={!isEditable('TECNICO') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_modArte', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className={esSolida ? 'consumos-cell-tecnico consumos-cell-locked' : 'consumos-cell-tecnico'}><input type="text" className={styles.tableInput} value={row.tecnico_ubicTrazo} disabled={!isEditable('TECNICO') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'tecnico_ubicTrazo', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className={styles.cellTrazador}><input type="text" className={styles.tableInput} value={row.trazador_talla} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_talla', e.target.value)} /></td>
                        <td className="consumos-cell-trazador consumos-cell-bold">
                          <div style={{ position: 'relative' }}>
                            <input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_solido} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_solido', e.target.value)} />
                            <VersionBadge count={row.trazador_solidoVerCount} onClick={() => openVersiones(row.refFabricId, 'TRAZADOR', 'SOLIDO')} />
                          </div>
                        </td>
                        <td className={esSolida ? 'consumos-cell-trazador consumos-cell-locked' : 'consumos-cell-trazador'}><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_modArte} disabled={!isEditable('TRAZADOR') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_modArte', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className={esSolida ? 'consumos-cell-trazador consumos-cell-locked' : 'consumos-cell-trazador'}><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_ubicTrazo} disabled={!isEditable('TRAZADOR') || esSolida} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_ubicTrazo', e.target.value)} />{esSolida && <Lock size={12} className={styles.lockedIcon} />}</td>
                        <td className="consumos-cell-trazador"><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_cuero} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_cuero', e.target.value)} /></td>
                        <td className="consumos-cell-trazador"><input type="text" className={styles.tableInput} placeholder="0.00" value={row.trazador_allOver} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_allOver', e.target.value)} /></td>
                        <td className={styles.cellTrazador}><input type="text" className={styles.tableInput} placeholder="1" value={row.trazador_veces} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_veces', e.target.value)} /></td>
                        <td className={styles.cellTrazador}><input type="text" className={styles.tableInput} placeholder="0" value={row.trazador_piezas} disabled={!isEditable('TRAZADOR')} onChange={(e) => handleCellChange(row.refFabricId, 'trazador_piezas', e.target.value)} /></td>
                        <td className={styles.cellCalculated}>
                          <div style={{ position: 'relative' }}>
                            <input type="text" className="consumos-table-input consumos-table-input-placeholder" value={row.explosion_consumo} disabled placeholder="SAP..." />
                            <VersionBadge count={row.explosion_verCount} onClick={() => openVersiones(row.refFabricId, 'CONTRAMUESTRA', 'SOLIDO')} />
                          </div>
                        </td>
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

      {versionModal && selectedRefId && (
        <ConsumoVersionesModal
          referenceFabricId={versionModal.refFabricId}
          referenceId={selectedRefId}
          role={versionModal.role}
          tipoTela={versionModal.tipoTela}
          onClose={() => setVersionModal(null)}
          onSaved={() => { setVersionModal(null); if (selectedRefId) loadReferenceData(selectedRefId); }}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--success)', color: 'white', padding: '12px 20px',
          borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600,
        }}>
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
