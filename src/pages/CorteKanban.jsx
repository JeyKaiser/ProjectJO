import { useState, useMemo, useEffect } from 'react';
import { Clock, User, Tag, Scissors, CheckCircle2, Play, ArrowRight, AlertCircle, Check, Eye, EyeOff, Archive, RefreshCw, Plus, Save, Trash2 } from 'lucide-react';
import { useCutRequests, updateCutRequest } from '../lib/api';
import { getPersonas } from '../data/personas';
import supabase from '../lib/supabase';

const COLUMNS = [
  { key: 'en_cola', title: 'En Cola', icon: Clock, color: 'var(--warning)', bg: 'var(--warning-light)', action: null },
  { key: 'en_corte', title: 'En Corte', icon: Scissors, color: 'var(--primary-600)', bg: 'var(--primary-100)', action: { label: 'Completar Corte', next: 'cortado', icon: CheckCircle2 } },
  { key: 'cortado', title: 'Cortado', icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-light)', action: { label: 'Entregar', next: 'entregado', icon: ArrowRight } },
  { key: 'entregado', title: 'Entregado', icon: CheckCircle2, color: 'var(--gray-500)', bg: 'var(--gray-100)', action: null },
];

const TYPE_LABELS = {
  muestra: 'Muestra', contramuestra: 'Contramuestra', pieza: 'Pieza',
  laboratorio: 'Laboratorio', forro: 'Forro', pedido_especial: 'Pedido Especial', sesgo: 'Sesgo',
};

const FABRIC_LABELS = {
  solido: 'Solido', mod_arte: 'Mod. Arte', ubic_trazo: 'Ubic. Trazo', cuero: 'Cuero', all_over: 'All Over',
};

const COLECCIONES_PREDEFINIDAS = [
  'WS - 2026', 'RS - 2026', 'SS - 2026', 'SV - 2026', 'PF - 2026', 'FW - 2026',
  'WS - 2027', 'RS - 2027', 'SS - 2027', 'SV - 2027', 'PF - 2027', 'FW - 2027',
  'LABORATORIOS', 'PEDIDO ESPECIAL', 'JO SUSTAINABLE',
];

function timeSince(dateStr) {
  if (!dateStr) return '—';
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateFull(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CorteKanban() {
  const { items, loading, error, refresh } = useCutRequests({ source: 'app' });
  const personas = getPersonas();
  const cortadoresActivos = (personas.cortadores || []).filter(p => p.activo !== false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [showEntregados, setShowEntregados] = useState(true);
  const [tab, setTab] = useState('activo'); // 'activo' | 'historial'
  const [collections, setCollections] = useState([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [selectedCortadores, setSelectedCortadores] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    ref: '', coleccion: '', tipo: 'muestra', manejo: 'solido',
    solicitante: '', cortador1: '', cortador2: '', cortador3: '',
    fechaRecibido: new Date().toISOString().split('T')[0],
    fechaEntrega: '', estado: 'en_cola', observaciones: '',
  });
  const [solicitanteManual, setSolicitanteManual] = useState(false);

  useEffect(() => {
    supabase.from('collections').select('id,code,name').eq('active', true).order('id').then(({ data }) => {
      if (data) setCollections(data);
    });
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;

    if (tab === 'historial') {
      result = result.filter(i => i.archived === true);
    } else {
      result = result.filter(i => i.archived !== true);
    }

    if (selectedFilter) {
      result = result.filter(i => i.cortador_names && i.cortador_names.includes(selectedFilter));
    }
    if (selectedCollection) {
      result = result.filter(i => i.collection_id === parseInt(selectedCollection));
    }
    return result;
  }, [items, selectedFilter, selectedCollection, tab]);

  const columns = useMemo(() => {
    const cols = {};
    COLUMNS.forEach(c => { cols[c.key] = []; });
    filteredItems.forEach(item => {
      if (cols[item.status]) cols[item.status].push(item);
    });
    return cols;
  }, [filteredItems]);

  const visibleColumns = useMemo(() => {
    if (tab === 'historial') return [];
    const cols = [...COLUMNS];
    if (!showEntregados) {
      return cols.filter(c => c.key !== 'entregado');
    }
    return cols;
  }, [showEntregados, tab]);

  const handleAction = async (item, nextStatus) => {
    const updates = { status: nextStatus };
    if (nextStatus === 'cortado') {
      updates.fecha_entrega = new Date().toISOString();
    }
    try {
      await updateCutRequest(item.id, updates);
      refresh();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleRequeue = async (item) => {
    try {
      await updateCutRequest(item.id, { status: 'en_cola', fecha_entrega: null, cortador_names: [] });
      refresh();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleArchive = async (item) => {
    try {
      await updateCutRequest(item.id, { archived: true });
      refresh();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleUnarchive = async (item) => {
    try {
      await updateCutRequest(item.id, { archived: false, status: 'en_cola' });
      refresh();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleOpenAssign = (item) => {
    setPendingItem(item);
    setSelectedCortadores([]);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!pendingItem || selectedCortadores.length === 0) return;
    try {
      await updateCutRequest(pendingItem.id, {
        status: 'en_corte',
        cortador_names: selectedCortadores,
      });
      setShowAssignModal(false);
      setPendingItem(null);
      refresh();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const toggleCortador = (name) => {
    setSelectedCortadores(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const setForm = (field, value) => setNewForm(prev => ({ ...prev, [field]: value }));

  const resetNewForm = () => {
    setNewForm({
      ref: '', coleccion: '', tipo: 'muestra', manejo: 'solido',
      solicitante: '', cortador1: '', cortador2: '', cortador3: '',
      fechaRecibido: new Date().toISOString().split('T')[0],
      fechaEntrega: '', estado: 'en_cola', observaciones: '',
    });
    setSolicitanteManual(false);
  };

  const handleSaveNew = async () => {
    const { ref, coleccion, tipo, solicitante, fechaRecibido } = newForm;
    if (!ref || !coleccion || !tipo || !solicitante || !fechaRecibido) {
      alert('Completa los campos obligatorios: REF, Coleccion, Tipo, Solicitante y Fecha Recibido');
      return;
    }
    setSavingNew(true);
    try {
      const cortadores = [newForm.cortador1, newForm.cortador2, newForm.cortador3].filter(Boolean);
      const { error: err } = await supabase.from('cut_requests').insert({
        reference_number_csv: ref,
        collection_raw: coleccion,
        type: tipo,
        fabric_handling: newForm.manejo,
        requester_name: solicitante,
        cortador_names: cortadores,
        fecha_recepcion: new Date(fechaRecibido).toISOString(),
        fecha_entrega: newForm.fechaEntrega ? new Date(newForm.fechaEntrega).toISOString() : null,
        status: newForm.estado,
        observations: newForm.observaciones || null,
        source: 'app',
        archived: false,
        reference_id: null,
        collection_id: null,
      });
      if (err) { alert('Error: ' + err.message); return; }
      setShowNewModal(false);
      resetNewForm();
      refresh();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingNew(false);
    }
  };

  const kpis = useMemo(() => ({
    total: filteredItems.length,
    enCola: columns.en_cola.length,
    enCorte: columns.en_corte.length,
    cortado: columns.cortado.length,
    entregado: columns.entregado.length,
  }), [filteredItems, columns]);

  const totalEntregadosSinArchivar = useMemo(() => {
    return items.filter(i => i.status === 'entregado' && i.archived !== true).length;
  }, [items]);

  if (loading) return <div className="fade-in p-8 text-center text-gray-400">Cargando tabla de corte...</div>;
  if (error) return <div className="fade-in p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tabla de Corte</h2>
          <p className="text-gray-500 text-sm">Gestion de solicitudes de corte: muestras, contramuestras y mas</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">Todos los cortadores</option>
              {cortadoresActivos.map(p => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <select
              className="form-select"
              value={selectedCollection}
              onChange={e => setSelectedCollection(e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="">Todas las colecciones</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.code || c.name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={refresh} style={{ fontSize: 12 }}>
            Actualizar
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewModal(true)} style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Plus size={14} /> Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid var(--gray-200)' }}>
        <button
          onClick={() => setTab('activo')}
          style={{
            padding: '8px 20px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: tab === 'activo' ? 700 : 500,
            color: tab === 'activo' ? 'var(--primary-600)' : 'var(--gray-500)',
            borderBottom: tab === 'activo' ? '2px solid var(--primary-500)' : '2px solid transparent',
            marginBottom: -2,
            cursor: 'pointer',
          }}
        >
          Activo
        </button>
        <button
          onClick={() => setTab('historial')}
          style={{
            padding: '8px 20px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: tab === 'historial' ? 700 : 500,
            color: tab === 'historial' ? 'var(--primary-600)' : 'var(--gray-500)',
            borderBottom: tab === 'historial' ? '2px solid var(--primary-500)' : '2px solid transparent',
            marginBottom: -2,
            cursor: 'pointer',
          }}
        >
          Historial
        </button>
        {tab === 'activo' && totalEntregadosSinArchivar > 0 && (
          <button
            onClick={() => setShowEntregados(!showEntregados)}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius-md)',
              background: showEntregados ? 'var(--primary-50)' : 'var(--white)',
              color: showEntregados ? 'var(--primary-600)' : 'var(--gray-500)',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {showEntregados ? <Eye size={14} /> : <EyeOff size={14} />}
            {showEntregados ? 'Ocultar Entregados' : `Ver Entregados (${totalEntregadosSinArchivar})`}
          </button>
        )}
      </div>

      {/* Tab Historial */}
      {tab === 'historial' && (
        <div>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
              No hay solicitudes archivadas.
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
              <table className="table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>MD</th>
                    <th>Nombre</th>
                    <th>Coleccion</th>
                    <th>Tipo</th>
                    <th>Manejo</th>
                    <th>Solicitante</th>
                    <th>Cortadores</th>
                    <th>Recepcion</th>
                    <th>Entrega</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const ref = item.references || {};
                    const coll = item.collections || {};
                    return (
                      <tr key={item.id}>
                        <td><strong>{ref.reference_number ? `MD-${String(ref.reference_number).padStart(3, '0')}` : '—'}</strong></td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ref.name || '—'}
                        </td>
                        <td>{coll.code || coll.name || '—'}</td>
                        <td>{TYPE_LABELS[item.type] || item.type}</td>
                        <td>{FABRIC_LABELS[item.fabric_handling] || item.fabric_handling || '—'}</td>
                        <td>{item.requester_name || '—'}</td>
                        <td>{(item.cortador_names || []).join(', ') || '—'}</td>
                        <td>{formatDate(item.fecha_recepcion)}</td>
                        <td>{formatDate(item.fecha_entrega)}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: 10, padding: '2px 6px' }}
                            onClick={() => handleUnarchive(item)}
                          >
                            <RefreshCw size={10} /> Recuperar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Activo: KPIs */}
      {tab === 'activo' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Activo', value: kpis.total, color: 'var(--primary-600)' },
              { label: 'En Cola', value: kpis.enCola, color: 'var(--warning-dark)' },
              { label: 'En Corte', value: kpis.enCorte, color: 'var(--primary-600)' },
              { label: 'Cortado', value: kpis.cortado, color: 'var(--success-dark)' },
            ].map(kpi => (
              <div key={kpi.label} style={{ borderTop: `3px solid ${kpi.color}`, flex: 1, padding: '12px 16px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Kanban */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)`, gap: 12 }}>
            {visibleColumns.map(col => (
              <div key={col.key} style={{
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                minHeight: 300,
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderBottom: `3px solid ${col.color}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontWeight: 700, fontSize: 13, color: col.color,
                  background: col.bg,
                  borderTopLeftRadius: 'var(--radius-lg)',
                  borderTopRightRadius: 'var(--radius-lg)',
                }}>
                  <col.icon size={16} />
                  {col.title}
                  <span style={{ marginLeft: 'auto', fontSize: 12, background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: 999 }}>
                    {columns[col.key].length}
                  </span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {columns[col.key].length === 0 && (
                    <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)', fontSize: 12 }}>
                      Sin solicitudes
                    </div>
                  )}
                  {columns[col.key].map(item => (
                    <CutCard
                      key={item.id}
                      item={item}
                      onAction={handleAction}
                      onRequeue={handleRequeue}
                      onArchive={handleArchive}
                      onAssignCortador={handleOpenAssign}
                      col={col}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal: Asignar Cortador */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Asignar Cortador</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingItem && (
                <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: 0 }}>
                  <strong>{pendingItem.references?.reference_number ? `MD-${String(pendingItem.references.reference_number).padStart(3, '0')}` : '—'}</strong>
                  {' — '}{pendingItem.references?.name || 'Sin nombre'}
                </p>
              )}
              <div>
                <label className="form-label">Selecciona el o los cortadores que intervienen:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {cortadoresActivos.map(p => {
                    const isChecked = selectedCortadores.includes(p.nombre);
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px',
                          background: isChecked ? 'var(--primary-50)' : 'var(--white)',
                          border: `1px solid ${isChecked ? 'var(--primary-400)' : 'var(--gray-200)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: isChecked ? 600 : 400,
                        }}
                        onClick={() => toggleCortador(p.nombre)}
                      >
                        <div style={{
                          width: 18, height: 18,
                          borderRadius: 4,
                          border: `2px solid ${isChecked ? 'var(--primary-500)' : 'var(--gray-300)'}`,
                          background: isChecked ? 'var(--primary-500)' : 'var(--white)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isChecked && <Check size={12} style={{ color: 'var(--white)' }} />}
                        </div>
                        {p.nombre}
                      </label>
                    );
                  })}
                </div>
              </div>
              {selectedCortadores.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--error)', margin: 0 }}>Selecciona al menos un cortador.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmAssign} disabled={selectedCortadores.length === 0}>
                <Play size={16} /> Iniciar Corte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Solicitud de Corte */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Nueva Solicitud de Corte</h3>
              <button className="modal-close" onClick={() => setShowNewModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label form-label-required">REF</label>
                  <input type="text" className="form-input" value={newForm.ref}
                    onChange={e => setForm('ref', e.target.value)} placeholder="48" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label form-label-required">Coleccion</label>
                  <select className="form-select" value={newForm.coleccion}
                    onChange={e => setForm('coleccion', e.target.value)}>
                    <option value="">Selecciona...</option>
                    {COLECCIONES_PREDEFINIDAS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label form-label-required">Tipo</label>
                  <select className="form-select" value={newForm.tipo}
                    onChange={e => setForm('tipo', e.target.value)}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Manejo Tela</label>
                  <select className="form-select" value={newForm.manejo}
                    onChange={e => setForm('manejo', e.target.value)}>
                    {Object.entries(FABRIC_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label form-label-required">Solicitante</label>
                  <select className="form-select" value={solicitanteManual ? '__otro__' : newForm.solicitante}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '__otro__') { setSolicitanteManual(true); setForm('solicitante', ''); }
                      else { setSolicitanteManual(false); setForm('solicitante', v); }
                    }}>
                    <option value="">Selecciona...</option>
                    <optgroup label="Creativos">
                      {(personas.creativos || []).filter(p => p.activo !== false).map(p => (
                        <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tecnicos">
                      {(personas.tecnicos || []).filter(p => p.activo !== false).map(p => (
                        <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </optgroup>
                    <option value="__otro__">Otro (digitar)...</option>
                  </select>
                  {solicitanteManual && (
                    <input type="text" className="form-input" style={{ marginTop: 6 }}
                      value={newForm.solicitante}
                      onChange={e => setForm('solicitante', e.target.value)}
                      placeholder="Digita el nombre del solicitante" autoFocus />
                  )}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label form-label-required">Fecha Recibido</label>
                  <input type="date" className="form-input" value={newForm.fechaRecibido}
                    onChange={e => setForm('fechaRecibido', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Fecha Entrega</label>
                  <input type="date" className="form-input" value={newForm.fechaEntrega}
                    onChange={e => setForm('fechaEntrega', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={newForm.estado}
                    onChange={e => setForm('estado', e.target.value)}>
                    <option value="en_cola">En Cola</option>
                    <option value="en_corte">En Corte</option>
                    <option value="cortado">Cortado</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[1, 2, 3].map(n => (
                  <div key={n} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cortador {n}</label>
                    <select className="form-select" value={newForm[`cortador${n}`]}
                      onChange={e => setForm(`cortador${n}`, e.target.value)}>
                      <option value="">Sin asignar</option>
                      {cortadoresActivos.map(p => (
                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Observaciones</label>
                <textarea className="form-input" rows={2} value={newForm.observaciones}
                  onChange={e => setForm('observaciones', e.target.value)}
                  placeholder="Ej. Sin lucir, tela revisada..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveNew} disabled={savingNew}>
                <Save size={16} /> {savingNew ? 'Guardando...' : 'Guardar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CutCard({ item, onAction, onRequeue, onArchive, onAssignCortador, col }) {
  const ref = item.references || {};
  const coll = item.collections || {};
  // const codigoMD = ref.reference_number ? `MD-${String(ref.reference_number).padStart(3, '0')}` : '—';
  const csvRef = item.reference_number_csv;
  const codigoMD = csvRef
    ? `RF-${csvRef}`
    : (ref.reference_number ? `MD-${String(ref.reference_number).padStart(3, '0')}` : '—');

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-md)',
      padding: 10,
      boxShadow: 'var(--shadow-sm)',
      borderLeft: '3px solid var(--primary-500)',
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="code-badge code-md" style={{ fontSize: 11, padding: '2px 8px' }}>{codigoMD}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
            {TYPE_LABELS[item.type] || item.type}
          </span>
          <span style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
            {FABRIC_LABELS[item.fabric_handling] || item.fabric_handling || 'Solido'}
          </span>
        </div>
      </div>

      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--gray-800)' }}>
        {ref.name || 'Sin nombre'}
      </div>

      <div style={{ display: 'flex', gap: 12, color: 'var(--gray-500)', fontSize: 11, marginBottom: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Tag size={10} /> {coll.name || coll.code || '—'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <User size={10} /> {item.requester_name || '—'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={10} /> {timeSince(item.fecha_recepcion)}
        </span>
      </div>

      {item.cortador_names && item.cortador_names.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {item.cortador_names.map(name => (
            <span key={name} style={{ background: 'var(--secondary-50)', color: 'var(--secondary-700)', padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>
              {name}
            </span>
          ))}
        </div>
      )}

      {item.observations && (
        <div style={{ fontSize: 10, color: 'var(--gray-500)', marginBottom: 6, fontStyle: 'italic' }}>
          {item.observations}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {col.key === 'en_cola' && (
          <>
            <button
              className="btn btn-primary"
              style={{ flex: 1, fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={() => onAssignCortador(item)}
            >
              <Play size={11} /> Iniciar Corte
            </button>
            <button
              className="btn btn-outline"
              style={{ color: 'var(--error)', borderColor: 'var(--error)', fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => {
                if (window.confirm('¿Eliminar esta solicitud de corte? Podras recuperarla desde el Historial.')) {
                  onArchive(item);
                }
              }}
              title="Eliminar"
            >
              <Trash2 size={11} />
            </button>
          </>
        )}
        {col.action && col.action.next && (
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => onAction(item, col.action.next)}
          >
            <col.action.icon size={11} /> {col.action.label}
          </button>
        )}
        {(col.key === 'en_corte' || col.key === 'cortado') && (
          <button
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => onRequeue(item)}
          >
            <AlertCircle size={11} /> Reencolar
          </button>
        )}
        {col.key === 'entregado' && (
          <button
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => onArchive(item)}
          >
            <Archive size={11} /> Archivar
          </button>
        )}
      </div>
    </div>
  );
}
