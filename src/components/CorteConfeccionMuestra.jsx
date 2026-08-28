import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Scissors, Shirt, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePersonsByArea } from '../hooks/usePersons';
import {
  useCorteTypes,
  useCutsMuestra,
  createCutMuestra,
  deleteCut,
  useSewingsMuestra,
  createSewing,
  updateSewing,
  deleteSewing,
} from '../lib/api';

const ESTADO_CONFECCION = {
  PENDIENTE: { bg: '#f1f5f9', color: '#475569' },
  EN_CONFECCION: { bg: '#dbeafe', color: '#1e40af' },
  TERMINADO: { bg: '#dcfce7', color: '#166534' },
};

function ConfeccionBadge({ estado }) {
  const s = ESTADO_CONFECCION[estado] || ESTADO_CONFECCION.PENDIENTE;
  return (
    <span style={{ background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
      {estado === 'TERMINADO' ? <CheckCircle size={12} /> : <Shirt size={12} />}{estado?.replace('_', ' ') || 'Pendiente'}
    </span>
  );
}

export default function CorteConfeccionMuestra({ dbRefId, referenceLabel = '' }) {
  const { isAdmin, isCreativo } = useAuth();
  const canEditar = isAdmin || isCreativo;

  const { tipos: corteTipos } = useCorteTypes();
  const { cuts, loading: loadingCuts } = useCutsMuestra(dbRefId);
  const { sewings, loading: loadingSewings } = useSewingsMuestra(dbRefId);

  const { data: creativos } = usePersonsByArea('creativos');
  const { data: modistas } = usePersonsByArea('modistas');

  const [showCorte, setShowCorte] = useState(false);
  const [showSewing, setShowSewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const today = () => new Date().toISOString().slice(0, 10);

  const [corteForm, setCorteForm] = useState({
    cut_date: today(), cut_type_id: '', units_piece: '', units_sample: '', quien_corto: '', observaciones: '',
  });
  const [sewForm, setSewForm] = useState({
    modista_nombre: '', tipo_muestra: 'MUESTRA', start_date: today(), end_date: '', status: 'PENDIENTE', notes: '',
  });

  useEffect(() => {
    if (creativos.length > 0 && !corteForm.quien_corto) {
      setCorteForm(prev => ({ ...prev, quien_corto: creativos[0].nombre }));
    }
    if (modistas.length > 0 && !sewForm.modista_nombre) {
      setSewForm(prev => ({ ...prev, modista_nombre: modistas[0].nombre }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creativos, modistas]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const tipoLabel = (id) => {
    const t = corteTipos.find(x => x.id === id);
    return t ? t.type : '—';
  };

  const crearCorte = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const esEquipo = corteForm.quien_corto === '__EQUIPO__';
      const { error } = await createCutMuestra({
        reference_id: dbRefId,
        cut_date: corteForm.cut_date,
        cut_type_id: corteForm.cut_type_id ? parseInt(corteForm.cut_type_id) : null,
        units_piece: corteForm.units_piece ? parseInt(corteForm.units_piece) : null,
        units_sample: corteForm.units_sample ? parseInt(corteForm.units_sample) : null,
        quien_corto: esEquipo ? 'Equipo de corte' : corteForm.quien_corto,
        origen_corte: esEquipo ? 'EQUIPO_CORTE' : 'CREATIVO',
        observaciones: corteForm.observaciones,
      });
      if (error) throw error;
      setCorteForm({ cut_date: today(), cut_type_id: '', units_piece: '', units_sample: '', quien_corto: '', observaciones: '' });
      setShowCorte(false);
      showToast('Corte de muestra registrado');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const crearSewing = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await createSewing({
        reference_id: dbRefId,
        ...sewForm,
        end_date: sewForm.end_date || null,
      });
      if (error) throw error;
      setSewForm({ modista_nombre: '', tipo_muestra: 'MUESTRA', start_date: today(), end_date: '', status: 'PENDIENTE', notes: '' });
      setShowSewing(false);
      showToast('Confección registrada — enviada a modistas');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoSewing = async (id, status) => {
    const patch = { status };
    if (status === 'TERMINADO') patch.end_date = today();
    const { error } = await updateSewing(id, patch);
    if (error) showToast(`Error: ${error.message}`);
    else showToast('Estado de confección actualizado');
  };

  const eliminarCorte = async (id) => {
    if (!confirm('Eliminar este corte?')) return;
    const { error } = await deleteCut(id);
    if (error) showToast(`Error: ${error.message}`);
    else showToast('Corte eliminado');
  };

  const eliminarSewing = async (id) => {
    if (!confirm('Eliminar esta confección?')) return;
    const { error } = await deleteSewing(id);
    if (error) showToast(`Error: ${error.message}`);
    else showToast('Confección eliminada');
  };

  if (!dbRefId) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>;

  return (
    <div>
      {toast && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13 }}>
          {toast}
        </div>
      )}

      {/* ══════════ CORTE DE MUESTRA ══════════ */}
      <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Scissors size={14} /> Corte de muestra
      </h4>

      {loadingCuts ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando cortes...</p>
      ) : cuts.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No hay cortes registrados.</p>
      ) : (
        <div className="table-container" style={{ marginBottom: 12 }}>
          <table className="table">
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Piezas</th><th>Muestras</th><th>Quién cortó</th><th>Origen</th><th>Observaciones</th><th></th></tr>
            </thead>
            <tbody>
              {cuts.map(c => (
                <tr key={c.id}>
                  <td style={{ fontSize: 12 }}>{c.cut_date || '—'}</td>
                  <td>{tipoLabel(c.cut_type_id)}</td>
                  <td style={{ textAlign: 'center' }}>{c.units_piece ?? '—'}</td>
                  <td style={{ textAlign: 'center' }}>{c.units_sample ?? '—'}</td>
                  <td>{c.quien_corto || '—'}</td>
                  <td style={{ fontSize: 12 }}>{c.origen_corte === 'EQUIPO_CORTE' ? 'Equipo de corte' : 'Creativo'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{c.observations || '—'}</td>
                  <td>
                    {canEditar && (
                      <button className="btn-icon" onClick={() => eliminarCorte(c.id)} style={{ background: 'none', border: '1px solid var(--error)', borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showCorte && canEditar && (
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowCorte(true)}>
          <Plus size={16} /> Registrar corte
        </button>
      )}

      {showCorte && canEditar && (
        <form onSubmit={crearCorte} className="card" style={{ padding: 'var(--space-5)', border: '1px solid var(--primary-300)', background: 'var(--primary-50)', marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={corteForm.cut_date} onChange={(e) => setCorteForm(prev => ({ ...prev, cut_date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de corte</label>
              <select className="form-select" value={corteForm.cut_type_id} onChange={(e) => setCorteForm(prev => ({ ...prev, cut_type_id: e.target.value }))} required>
                <option value="">Selecciona...</option>
                {corteTipos.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unidades pieza</label>
              <input type="number" min="0" className="form-input" value={corteForm.units_piece} onChange={(e) => setCorteForm(prev => ({ ...prev, units_piece: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unidades muestra</label>
              <input type="number" min="0" className="form-input" value={corteForm.units_sample} onChange={(e) => setCorteForm(prev => ({ ...prev, units_sample: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Quién cortó</label>
              <select className="form-select" value={corteForm.quien_corto} onChange={(e) => setCorteForm(prev => ({ ...prev, quien_corto: e.target.value }))}>
                {creativos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                <option value="__EQUIPO__">Equipo de corte</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <input type="text" className="form-input" value={corteForm.observaciones} onChange={(e) => setCorteForm(prev => ({ ...prev, observaciones: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Registrar corte'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCorte(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* ══════════ CONFECCION DE MUESTRA ══════════ */}
      <div style={{ marginTop: 24 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shirt size={14} /> Confección de muestra (modistas)
        </h4>

        {loadingSewings ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando confección...</p>
        ) : sewings.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>La muestra aún no se ha enviado a confección.</p>
        ) : (
          <div className="table-container" style={{ marginBottom: 12 }}>
            <table className="table">
              <thead>
                <tr><th>Modista / Líder</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Notas</th><th></th></tr>
              </thead>
              <tbody>
                {sewings.map(s => (
                  <tr key={s.id}>
                    <td>{s.modista_nombre || '—'}</td>
                    <td>{s.tipo_muestra || '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.start_date || '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.end_date || '—'}</td>
                    <td>
                      {canEditar ? (
                        <select
                          className="form-select"
                          style={{ fontSize: 12, padding: '2px 8px' }}
                          value={s.status || 'PENDIENTE'}
                          onChange={(e) => cambiarEstadoSewing(s.id, e.target.value)}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_CONFECCION">En confección</option>
                          <option value="TERMINADO">Terminado</option>
                        </select>
                      ) : (
                        <ConfeccionBadge estado={s.status} />
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{s.notes || '—'}</td>
                    <td>
                      {canEditar && (
                        <button className="btn-icon" onClick={() => eliminarSewing(s.id)} style={{ background: 'none', border: '1px solid var(--error)', borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--error)' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!showSewing && canEditar && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowSewing(true)}>
            <Plus size={16} /> Enviar a confección
          </button>
        )}

        {showSewing && canEditar && (
          <form onSubmit={crearSewing} className="card" style={{ padding: 'var(--space-5)', border: '1px solid var(--primary-300)', background: 'var(--primary-50)', marginTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Modista / Líder</label>
                <select className="form-select" value={sewForm.modista_nombre} onChange={(e) => setSewForm(prev => ({ ...prev, modista_nombre: e.target.value }))} required>
                  {modistas.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={sewForm.tipo_muestra} onChange={(e) => setSewForm(prev => ({ ...prev, tipo_muestra: e.target.value }))}>
                  <option value="MUESTRA">Muestra</option>
                  <option value="LABORATORIO">Laboratorio</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Inicio</label>
                <input type="date" className="form-input" value={sewForm.start_date} onChange={(e) => setSewForm(prev => ({ ...prev, start_date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fin estimado</label>
                <input type="date" className="form-input" value={sewForm.end_date} onChange={(e) => setSewForm(prev => ({ ...prev, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Notas / indicaciones del creativo</label>
              <input type="text" className="form-input" value={sewForm.notes} onChange={(e) => setSewForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Ej. Seguir indicaciones de confección del laboratorio..." />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Guardando...' : 'Enviar a confección'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSewing(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}