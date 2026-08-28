import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, FlaskConical, CheckCircle, XCircle, RotateCcw, FileScan, Scissors, Ruler, PackagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePersonsByArea } from '../hooks/usePersons';
import { useLaboratorios, createLaboratorio, updateLaboratorio, deleteLaboratorio, useMolderia, createMolderia, deleteMolderia } from '../lib/api';

const ESTADOS = {
  EN_PREPARACION: { label: 'En preparación', bg: '#f1f5f9', color: '#475569' },
  EN_DIGITALIZACION: { label: 'En digitalización', bg: '#f3e8ff', color: '#6b21a8' },
  EN_CONFECCION: { label: 'En confección', bg: '#dbeafe', color: '#1e40af' },
  EN_MEDICION: { label: 'En medición', bg: '#fef9c3', color: '#854d0e' },
  APROBADO: { label: 'Aprobado', bg: '#dcfce7', color: '#166534' },
  RECHAZADO: { label: 'Rechazado', bg: '#fee2e2', color: '#991b1b' },
};

function EstadoBadge({ estado }) {
  const s = ESTADOS[estado] || ESTADOS.EN_PREPARACION;
  return (
    <span style={{ background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

export default function LaboratoriosMolderia({ dbRefId, referenceLabel = '' }) {
  const { isAdmin, isCreativo } = useAuth();
  const canEditar = isAdmin || isCreativo;

  const { laboratorios, loading, refresh } = useLaboratorios(dbRefId);
  const { molderia, loading: loadingMolderia, refresh: refreshMolderia } = useMolderia(dbRefId);

  const { data: creativos } = usePersonsByArea('creativos');

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [labForm, setLabForm] = useState({ fecha: new Date().toISOString().slice(0, 10), tipo_molde: 'DIGITAL', descripcion: '', realizado_por_nombre: '' });
  const [moldForm, setMoldForm] = useState({ fecha_inicio: new Date().toISOString().slice(0, 10), fecha_fin: '', disenador: '', comentarios: '' });

  useEffect(() => {
    if (creativos.length > 0) {
      setLabForm(prev => prev.realizado_por_nombre ? prev : { ...prev, realizado_por_nombre: creativos[0].nombre });
      setMoldForm(prev => prev.disenador ? prev : { ...prev, disenador: creativos[0].nombre });
    }
  }, [creativos]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const today = () => new Date().toISOString().slice(0, 10);

  const crearLab = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await createLaboratorio({ reference_id: dbRefId, ...labForm });
      if (err) throw err;
      setShowForm(false);
      setLabForm({ fecha: today(), tipo_molde: 'DIGITAL', descripcion: '', realizado_por_nombre: creativos[0]?.nombre || '' });
      await refresh();
      showToast('Laboratorio creado');
    } catch (err) {
      setError(err.message || 'Error al crear laboratorio');
    } finally {
      setSaving(false);
    }
  };

  const NEXT = {
    EN_PREPARACION: (lab) => lab.tipo_molde === 'PAPEL' ? 'EN_DIGITALIZACION' : 'EN_CONFECCION',
    EN_DIGITALIZACION: () => 'EN_CONFECCION',
    EN_CONFECCION: () => 'EN_MEDICION',
    EN_MEDICION: () => 'APROBADO',
    APROBADO: null,
    RECHAZADO: () => 'EN_PREPARACION',
  };

  const avanzar = async (lab) => {
    const next = NEXT[lab.estado]?.(lab);
    if (!next) return;
    setSaving(true);
    try {
      const patch = { estado: next };
      if (next === 'EN_MEDICION' && !lab.fecha_medicion) patch.fecha_medicion = today();
      if (next === 'APROBADO') {
        patch.fecha_medicion = lab.fecha_medicion || today();
        patch.resultado_medicion = lab.resultado_medicion || 'Aprobado';
        patch.integrado_molderia = true;
        patch.fecha_integracion = today();
      }
      const { error: err } = await updateLaboratorio(lab.id, patch);
      if (err) throw err;
      await refresh();
      showToast(next === 'APROBADO' ? 'Laboratorio aprobado e integrado a molderia base' : `Laboratorio: ${ESTADOS[next].label}`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const rechazar = async (lab) => {
    setSaving(true);
    try {
      const { error: err } = await updateLaboratorio(lab.id, {
        estado: 'RECHAZADO',
        resultado_medicion: lab.resultado_medicion || 'Rechazado',
        fecha_medicion: lab.fecha_medicion || today(),
      });
      if (err) throw err;
      await refresh();
      showToast('Laboratorio rechazado — se reiniciará el proceso de molde');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const integrar = async (lab) => {
    setSaving(true);
    try {
      const { error: err } = await updateLaboratorio(lab.id, { integrado_molderia: true, fecha_integracion: today() });
      if (err) throw err;
      await refresh();
      showToast('Integrado a molderia base');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const eliminarLab = async (id) => {
    if (!confirm('Eliminar este laboratorio?')) return;
    const { error } = await deleteLaboratorio(id);
    if (error) showToast(`Error: ${error.message}`);
    else { await refresh(); showToast('Laboratorio eliminado'); }
  };

  const crearMolderia = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: err } = await createMolderia({ reference_id: dbRefId, ...moldForm });
      if (err) throw err;
      setMoldForm({ fecha_inicio: today(), fecha_fin: '', disenador: creativos[0]?.nombre || '', comentarios: '' });
      await refreshMolderia();
      showToast('Registro de molderia agregado');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const eliminarMolderia = async (id) => {
    if (!confirm('Eliminar este registro de molderia?')) return;
    const { error } = await deleteMolderia(id);
    if (error) showToast(`Error: ${error.message}`);
    else { await refreshMolderia(); showToast('Registro eliminado'); }
  };

  if (!dbRefId) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>;

  const avanzarLabel = (lab) => {
    switch (lab.estado) {
      case 'EN_PREPARACION': return lab.tipo_molde === 'PAPEL' ? <><FileScan size={13} /> Enviar a digitalizar</> : <><Scissors size={13} /> Enviar a confección</>;
      case 'EN_DIGITALIZACION': return <><Scissors size={13} /> Enviar a confección</>;
      case 'EN_CONFECCION': return <><Ruler size={13} /> Enviar a medición</>;
      case 'EN_MEDICION': return <><CheckCircle size={13} /> Aprobar e integrar</>;
      case 'RECHAZADO': return <><RotateCcw size={13} /> Reiniciar iteración</>;
      default: return null;
    }
  };

  return (
    <div>
      {toast && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13 }}>
          {toast}
        </div>
      )}

      {/* ══════════ LABORATORIOS ══════════ */}
      <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <FlaskConical size={14} /> Pruebas de molde (laboratorios)
      </h4>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando laboratorios...</p>
      ) : laboratorios.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Aún no hay laboratorios registrados.</p>
      ) : (
        <div className="table-container" style={{ marginBottom: 12 }}>
          <table className="table">
            <thead>
              <tr><th>Estado</th><th>Tipo molde</th><th>Fecha</th><th>Descripción</th><th>Realizado por</th><th>Integrado a molderia</th><th style={{ width: 120 }}>Acciones</th></tr>
            </thead>
            <tbody>
              {laboratorios.map(lab => (
                <tr key={lab.id}>
                  <td><EstadoBadge estado={lab.estado} /></td>
                  <td>{lab.tipo_molde || '—'}</td>
                  <td style={{ fontSize: 12 }}>{lab.fecha_inicio || lab.fecha || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-600)', maxWidth: 220 }}>{lab.descripcion || '—'}</td>
                  <td style={{ fontSize: 12 }}>{lab.realizado_por_nombre || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {lab.integrado_molderia
                      ? <CheckCircle size={15} style={{ color: '#166534' }} />
                      : <XCircle size={15} style={{ color: 'var(--gray-400)' }} />}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {canEditar && (
                      <>
                        {NEXT[lab.estado] && (
                          <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 10px' }} disabled={saving} onClick={() => avanzar(lab)}>
                            {avanzarLabel(lab)}
                          </button>
                        )}
                        {(lab.estado === 'EN_CONFECCION' || lab.estado === 'EN_MEDICION') && (
                          <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 6 }} disabled={saving} onClick={() => rechazar(lab)}>
                            <XCircle size={12} /> Rechazar
                          </button>
                        )}
                        {lab.estado === 'APROBADO' && !lab.integrado_molderia && (
                          <button className="btn btn-success" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 6 }} disabled={saving} onClick={() => integrar(lab)}>
                            <PackagePlus size={12} /> Integrar
                          </button>
                        )}
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 6 }} onClick={() => eliminarLab(lab.id)}>
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showForm && canEditar && (
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nuevo laboratorio
        </button>
      )}

      {showForm && canEditar && (
        <form onSubmit={crearLab} className="card" style={{ padding: 'var(--space-5)', border: '1px solid var(--primary-300)', background: 'var(--primary-50)', marginTop: 12 }}>
          {error && (
            <div style={{ background: 'var(--error-light)', color: 'var(--error-dark)', padding: '8px 12px', borderRadius: 4, marginBottom: 12, fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={labForm.fecha} onChange={(e) => setLabForm(prev => ({ ...prev, fecha: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de molde</label>
              <select className="form-select" value={labForm.tipo_molde} onChange={(e) => setLabForm(prev => ({ ...prev, tipo_molde: e.target.value }))}>
                <option value="DIGITAL">Digital</option>
                <option value="PAPEL">Papel (requiere digitalizar)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Realizado por</label>
              <select className="form-select" value={labForm.realizado_por_nombre} onChange={(e) => setLabForm(prev => ({ ...prev, realizado_por_nombre: e.target.value }))}>
                {creativos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Qué se prueba (descripción)</label>
            <textarea className="form-input" rows={2} value={labForm.descripcion} onChange={(e) => setLabForm(prev => ({ ...prev, descripcion: e.target.value }))} placeholder="Ej. Prueba de molde con descaderado de 2cm..." required />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Crear laboratorio'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* ══════════ MOLDERIA ══════════ */}
      <div style={{ marginTop: 24 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Scissors size={14} /> Registro de molderia
        </h4>
        {loadingMolderia ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>
        ) : molderia.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Sin registros de molderia.</p>
        ) : (
          <div className="table-container" style={{ marginBottom: 12 }}>
            <table className="table">
              <thead><tr><th>Inicio</th><th>Fin</th><th>Diseñador</th><th>Comentarios</th><th></th></tr></thead>
              <tbody>
                {molderia.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12 }}>{m.fecha_inicio || '—'}</td>
                    <td style={{ fontSize: 12 }}>{m.fecha_fin || '—'}</td>
                    <td>{m.disenador || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{m.comentarios || '—'}</td>
                    <td>
                      {canEditar && (
                        <button className="btn-icon" onClick={() => eliminarMolderia(m.id)} style={{ background: 'none', border: '1px solid var(--error)', borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--error)' }}>
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

        {canEditar && (
          <form onSubmit={crearMolderia} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Inicio</label>
              <input type="date" className="form-input" value={moldForm.fecha_inicio} onChange={(e) => setMoldForm(prev => ({ ...prev, fecha_inicio: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Fin</label>
              <input type="date" className="form-input" value={moldForm.fecha_fin} onChange={(e) => setMoldForm(prev => ({ ...prev, fecha_fin: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Diseñador</label>
              <select className="form-select" value={moldForm.disenador} onChange={(e) => setMoldForm(prev => ({ ...prev, disenador: e.target.value }))}>
                {creativos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <label className="form-label">Comentarios</label>
              <input type="text" className="form-input" value={moldForm.comentarios} onChange={(e) => setMoldForm(prev => ({ ...prev, comentarios: e.target.value }))} placeholder="Ej. Molderia base actualizada..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Plus size={16} /> Agregar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
