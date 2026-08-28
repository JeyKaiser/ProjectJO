import { useState, useEffect, useRef } from 'react';
import { Package, Plus, Truck, CheckCircle, X, ClipboardList, PackageCheck, Ruler } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePersonsByArea } from '../hooks/usePersons';
import { useUnidades } from '../hooks/useCatalogos';
import ConsumosInsumosPorTalla from './ConsumosInsumosPorTalla';
import {
  useSupplies,
  useSupplyRequests,
  createSupplyRequest,
  deliverSupplyRequest,
  cancelSupplyRequest,
  confirmSupplyAsUsed,
  useReferenceSupplies,
} from '../lib/api';

const STATUS_BADGE = {
  SOLICITADO: { bg: '#fef9c3', color: '#854d0e', label: 'Solicitado' },
  ENTREGADO: { bg: '#dcfce7', color: '#166534', label: 'Entregado' },
  CANCELADO: { bg: '#f1f5f9', color: '#475569', label: 'Cancelado' },
};

function Badge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.CANCELADO;
  return (
    <span style={{ background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

export default function InsumosBodega({ dbRefId, referenceLabel = '' }) {
  const { isAdmin, isCreativo, isTecnico, isLiderModistas, isBodega } = useAuth();

  const canSolicitar = isAdmin || isCreativo || isTecnico || isLiderModistas;
  const canEntregar = isAdmin || isBodega;
  const canConfirmar = isAdmin || isCreativo;

  const [tab, setTab] = useState('solicitar');

  const { supplies, loading: loadingSupplies } = useSupplies();
  const { requests, loading: loadingRequests, refresh: refreshRequests } = useSupplyRequests(dbRefId);
  const { supplies: usedSupplies, loading: loadingUsed, refresh: refreshUsed } = useReferenceSupplies(dbRefId);

  const { data: creativos } = usePersonsByArea('creativos');
  const { data: bodega } = usePersonsByArea('bodega');
  const { data: unidades } = useUnidades();

  // ── Form de solicitud ──
  const [form, setForm] = useState({ modo: 'catalogo', supplyId: '', description: '', quantity: '', unit: 'metros', notes: '' });
  const [saving, setSaving] = useState(false);

  // ── Form de entrega ──
  const [deliveringId, setDeliveringId] = useState(null);
  const [deliverForm, setDeliverForm] = useState({ delivered_code: '', quantity_delivered: '', delivered_by: '', notes: '' });
  const [delivering, setDelivering] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (bodega.length > 0) {
      setDeliverForm(prev => prev.delivered_by ? prev : { ...prev, delivered_by: bodega[0].nombre });
    }
  }, [bodega]);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const refreshAll = async () => {
    await refreshRequests();
    refreshUsed();
  };

  const selectedSupply = form.supplyId
    ? supplies.find(s => s.id === parseInt(form.supplyId)) || null
    : null;

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!dbRefId) return;
    setSaving(true);
    try {
      const { error } = await createSupplyRequest({
        reference_id: dbRefId,
        supply_id: form.modo === 'catalogo' && form.supplyId ? parseInt(form.supplyId) : null,
        description: form.modo === 'catalogo'
          ? (selectedSupply?.description || form.description)
          : form.description,
        quantity_requested: form.quantity ? parseFloat(form.quantity) : null,
        unit_of_measure: form.unit,
        requested_by: form.requestedBy || creativos[0]?.nombre || null,
        notes: form.notes,
      });
      if (error) throw error;
      setForm({ modo: 'catalogo', supplyId: '', description: '', quantity: '', unit: 'metros', notes: '', requestedBy: '' });
      await refreshRequests();
      showToast('Solicitud enviada a bodega');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openDeliver = (req) => {
    setDeliveringId(req.id);
    setDeliverForm({
      delivered_code: req.supplies?.code || '',
      quantity_delivered: req.quantity_requested != null ? String(req.quantity_requested) : '',
      delivered_by: bodega[0]?.nombre || '',
      notes: '',
    });
  };

  const handleEntregar = async (e) => {
    e.preventDefault();
    if (!deliveringId) return;
    setDelivering(true);
    try {
      const { error } = await deliverSupplyRequest(deliveringId, {
        delivered_code: deliverForm.delivered_code,
        quantity_delivered: deliverForm.quantity_delivered ? parseFloat(deliverForm.quantity_delivered) : null,
        delivered_by: deliverForm.delivered_by,
        notes: deliverForm.notes,
      });
      if (error) throw error;
      setDeliveringId(null);
      await refreshAll();
      showToast('Entrega registrada');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setDelivering(false);
    }
  };

  const handleCancelar = async (id) => {
    const { error } = await cancelSupplyRequest(id);
    if (error) showToast(`Error: ${error.message}`);
    else { await refreshAll(); showToast('Solicitud cancelada'); }
  };

  const handleConfirmarUsado = async (req) => {
    const { error } = await confirmSupplyAsUsed(dbRefId, req);
    if (error) showToast(`Error: ${error.message}`);
    else { await refreshAll(); showToast('Insumo confirmado como usado'); }
  };

  if (!dbRefId) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando insumos...</p>;

  const solicitudesPendientes = requests.filter(r => r.status === 'SOLICITADO');
  const entregados = requests.filter(r => r.status === 'ENTREGADO' && !r.used_confirmed);
  const cancelados = requests.filter(r => r.status === 'CANCELADO');

  const tabs = [
    { key: 'solicitar', label: 'Solicitar', icon: <Plus size={14} /> },
    { key: 'pendientes', label: `Pendientes (${solicitudesPendientes.length})`, icon: <ClipboardList size={14} /> },
    { key: 'entregados', label: `Entregados (${entregados.length})`, icon: <Truck size={14} /> },
    { key: 'consumo', label: 'Consumo por talla', icon: <Ruler size={14} /> },
  ];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              borderRadius: '999px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${tab === t.key ? 'var(--primary-400)' : 'var(--gray-300)'}`,
              background: tab === t.key ? 'var(--primary-100)' : 'var(--white)',
              color: tab === t.key ? 'var(--primary-700)' : 'var(--gray-600)',
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: SOLICITAR ══════════ */}
      {tab === 'solicitar' && (
        <div>
          {!canSolicitar && (
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>No tienes permisos para solicitar insumos.</p>
          )}
          {canSolicitar && (
            <form onSubmit={handleSolicitar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Insumo</label>
                <select
                  className="form-select"
                  value={form.modo}
                  onChange={(e) => setForm(prev => ({ ...prev, modo: e.target.value }))}
                >
                  <option value="catalogo">Del catálogo de insumos</option>
                  <option value="libre">Otro insumo (texto libre)</option>
                </select>
              </div>

              {form.modo === 'catalogo' ? (
                <div className="form-group">
                  <label className="form-label">Código / Insumo</label>
                  <select
                    className="form-select"
                    value={form.supplyId}
                    onChange={(e) => setForm(prev => ({ ...prev, supplyId: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona...</option>
                    {supplies.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} — {s.description}{s.unit_of_measure ? ` (${s.unit_of_measure})` : ''}
                      </option>
                    ))}
                  </select>
                  {loadingSupplies && <span className="form-help">Cargando catálogo...</span>}
                  {!loadingSupplies && supplies.length === 0 && (
                    <span className="form-help" style={{ color: 'var(--orange-500)' }}>
                      No hay insumos en el catálogo. Admin: gestiona el catálogo en Herramientas → Insumos.
                    </span>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Descripción del insumo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ej. Elástico transparente 2cm"
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Cantidad solicitada</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={form.quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Ej. 12"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <select
                    className="form-select"
                    value={form.unit}
                    onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                  >
                    {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Solicitado por</label>
                <select
                  className="form-select"
                  value={form.requestedBy || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, requestedBy: e.target.value }))}
                >
                  {creativos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ej. Se entrega completo o se fracciona?"
                />
              </div>

              <div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Plus size={16} />
                  {saving ? 'Enviando...' : 'Solicitar a Bodega'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ══════════ TAB 2: PENDIENTES ══════════ */}
      {tab === 'pendientes' && (
        <div>
          {loadingRequests ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando solicitudes...</p>
          ) : solicitudesPendientes.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No hay solicitudes pendientes.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Insumo</th><th>Cantidad</th><th>Unidad</th><th>Solicitó</th><th>Fecha</th><th>Estado</th><th></th></tr>
                </thead>
                <tbody>
                  {solicitudesPendientes.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.supplies?.code || '—'}</strong> {r.description}</td>
                      <td>{r.quantity_requested ?? '—'}</td>
                      <td>{r.unit_of_measure || r.supplies?.unit_of_measure || '—'}</td>
                      <td>{r.requested_by || '—'}</td>
                      <td style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('es-CO')}</td>
                      <td><Badge status={r.status} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {canEntregar ? (
                          <button className="btn btn-success" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => openDeliver(r)}>
                            <Truck size={12} /> Entregar
                          </button>
                        ) : null}
                        {(isAdmin || isCreativo) && (
                          <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 6 }} onClick={() => handleCancelar(r.id)}>
                            <X size={12} /> Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {deliveringId && (
            <div className="modal-overlay" onClick={() => setDeliveringId(null)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className="modal-header">
                  <h3>Entregar Insumo — Bodega</h3>
                  <button className="modal-close" onClick={() => setDeliveringId(null)}>&times;</button>
                </div>
                <form onSubmit={handleEntregar}>
                  <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: 0 }}>
                      <strong>{requests.find(r => r.id === deliveringId)?.description}</strong> para {referenceLabel}
                    </p>
                    <div className="form-group">
                      <label className="form-label">Código del insumo entregado</label>
                      <input type="text" className="form-input" value={deliverForm.delivered_code}
                        onChange={(e) => setDeliverForm(prev => ({ ...prev, delivered_code: e.target.value }))}
                        placeholder="Ej. IN002345" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cantidad entregada</label>
                      <input type="number" min="0" step="0.01" className="form-input" value={deliverForm.quantity_delivered}
                        onChange={(e) => setDeliverForm(prev => ({ ...prev, quantity_delivered: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Entregado por (bodega)</label>
                      <select className="form-select" value={deliverForm.delivered_by}
                        onChange={(e) => setDeliverForm(prev => ({ ...prev, delivered_by: e.target.value }))}>
                        {bodega.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Observaciones</label>
                      <textarea className="form-input" rows={2} value={deliverForm.notes}
                        onChange={(e) => setDeliverForm(prev => ({ ...prev, notes: e.target.value }))} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setDeliveringId(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-success" disabled={delivering}>
                      <Truck size={16} /> {delivering ? 'Registrando...' : 'Confirmar Entrega'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB 3: ENTREGADOS / USADOS ══════════ */}
      {tab === 'entregados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={14} /> Entregados por bodega (pendientes de confirmar uso)
            </h4>
            {loadingRequests ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>
            ) : entregados.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Sin entregas pendientes de confirmar.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Insumo</th><th>Solicitó</th><th>Código entregado</th><th>Cantidad</th><th>Entregó</th><th>Fecha</th><th></th></tr>
                  </thead>
                  <tbody>
                    {entregados.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.supplies?.code || '—'}</strong> {r.description}</td>
                        <td>{r.requested_by || '—'}</td>
                        <td>{r.delivered_code || '—'}</td>
                        <td>{r.quantity_delivered ?? '—'} {r.unit_of_measure || ''}</td>
                        <td>{r.delivered_by || '—'}</td>
                        <td style={{ fontSize: 12 }}>{r.delivered_at ? new Date(r.delivered_at).toLocaleDateString('es-CO') : '—'}</td>
                        <td>
                          {canConfirmar && (
                            <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => handleConfirmarUsado(r)}>
                              <CheckCircle size={12} /> Confirmar como usado
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackageCheck size={14} /> Insumos confirmados como usados en la referencia
            </h4>
            {loadingUsed ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>
            ) : usedSupplies.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Aún no se han confirmado insumos usados.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Código</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th></tr>
                  </thead>
                  <tbody>
                    {usedSupplies.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.supplies?.code || '—'}</strong></td>
                        <td>{u.supplies?.description || u.notes || '—'}</td>
                        <td style={{ fontWeight: 700 }}>{u.quantity ?? '—'}</td>
                        <td>{u.unit_of_measure || u.supplies?.unit_of_measure || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {cancelados.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-500)' }}>Canceladas</h4>
              <p style={{ color: 'var(--gray-400)', fontSize: 12 }}>{cancelados.length} solicitud{cancelados.length !== 1 ? 'es' : ''} cancelada{cancelados.length !== 1 ? 's' : ''}.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB 4: CONSUMO DE INSUMOS POR TALLA ══════════ */}
      {tab === 'consumo' && (
        <ConsumosInsumosPorTalla dbRefId={dbRefId} />
      )}
    </div>
  );
}
