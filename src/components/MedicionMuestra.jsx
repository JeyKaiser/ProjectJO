import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Plus, Save, Trash2, Ruler } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';
import { getPersonas } from '../data/personas';
import { useMediciones, createMedicion, deleteMedicion, updateReferenceStatusByNombre } from '../lib/api';

const RESULTADO_BADGE = {
  APROBADA: { bg: '#dcfce7', color: '#166534' },
  RECHAZADA: { bg: '#fee2e2', color: '#991b1b' },
};

const CAMBIO_LABEL = { NINGUNO: 'Sin cambios', MENOR: 'Cambios menores', MAYOR: 'Cambios mayores (otra muestra)' };

function Badge({ value }) {
  const s = RESULTADO_BADGE[value] || RESULTADO_BADGE.RECHAZADA;
  return (
    <span style={{ background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
      {value === 'APROBADA' ? <CheckCircle size={12} /> : <XCircle size={12} />}{value === 'APROBADA' ? 'Aprobada' : 'Rechazada'}
    </span>
  );
}

export default function MedicionMuestra({ dbRefId, referenceLabel = '' }) {
  const { isAdmin, isCreativo } = useAuth();
  const canMedir = isAdmin || isCreativo;

  const { mediciones, loading, refresh } = useMediciones(dbRefId);
  const [refStatus, setRefStatus] = useState(null);
  const [tallas, setTallas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const personas = getPersonas();
  const creativos = (personas.creativos || []).filter(p => p.activo !== false);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    talla_medida: '',
    resultado: 'RECHAZADA',
    tipo_cambio: 'NINGUNO',
    requiere_nueva_muestra: false,
    analisis_largos: '',
    analisis_horma: '',
    posicion_estampado: '',
    cambios_molderia: '',
    observaciones: '',
    medido_por: '',
    ubicacion_rack: '',
  });

  useEffect(() => {
    if (!dbRefId) return;
    let cancelled = false;
    async function load() {
      const { data: ref } = await supabase
        .from('references')
        .select('tallaje_group_id, reference_statuses(status)')
        .eq('id', dbRefId)
        .single();
      if (cancelled) return;
      setRefStatus(ref?.reference_statuses?.status || null);

      if (ref?.tallaje_group_id) {
        const { data: tg } = await supabase
          .from('tallaje_groups')
          .select('name')
          .eq('id', ref.tallaje_group_id)
          .single();
        if (tg) setTallas((tg.name || '').split('-').map(t => t.trim()).filter(Boolean));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dbRefId]);

  useEffect(() => {
    if (creativos.length > 0) {
      setForm(prev => prev.medido_por ? prev : { ...prev, medido_por: creativos[0].nombre });
    }
  }, [creativos]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data, error: err } = await createMedicion({
        reference_id: dbRefId,
        ...form,
      });
      if (err) throw err;

      if (form.resultado === 'APROBADA') {
        const { error: statusErr } = await updateReferenceStatusByNombre(dbRefId, 'APROBADO');
        if (statusErr) throw statusErr;
        setRefStatus('APROBADO');
        showToast('Muestra APROBADA — referencia ubicada en el rack de aprobadas');
      } else {
        showToast('Medición registrada — muestra rechazada');
      }

      setShowForm(false);
      setForm({
        fecha: new Date().toISOString().slice(0, 10),
        talla_medida: '',
        resultado: 'RECHAZADA',
        tipo_cambio: 'NINGUNO',
        requiere_nueva_muestra: false,
        analisis_largos: '',
        analisis_horma: '',
        posicion_estampado: '',
        cambios_molderia: '',
        observaciones: '',
        medido_por: creativos[0]?.nombre || '',
        ubicacion_rack: '',
      });
      refresh();
    } catch (err) {
      setError(err.message || 'Error al registrar medición');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta medición?')) return;
    const { error: delErr } = await deleteMedicion(id);
    if (delErr) showToast(`Error: ${delErr.message}`);
    else { await refresh(); showToast('Medición eliminada'); }
  };

  if (!dbRefId) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>;

  return (
    <div>
      {toast && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13 }}>
          {toast}
        </div>
      )}

      {/* Banner de estado de aprobación */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, marginBottom: 16,
        background: refStatus === 'APROBADO' ? '#dcfce7' : 'var(--gray-100)',
        color: refStatus === 'APROBADO' ? '#166534' : 'var(--gray-600)',
        fontSize: 13, fontWeight: 600,
      }}>
        {refStatus === 'APROBADO' ? <CheckCircle size={16} /> : <Ruler size={16} />}
        {refStatus === 'APROBADO'
          ? `Referencia APROBADA en medición — ubicada en el rack de referencias aprobadas.`
          : `La muestra de ${referenceLabel || 'esta referencia'} aún no ha sido aprobada en medición.`}
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando mediciones...</p>
      ) : mediciones.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No hay sesiones de medición registradas.</p>
      ) : (
        <div className="table-container" style={{ marginBottom: 16 }}>
          <table className="table">
            <thead>
              <tr><th>Fecha</th><th>Talla</th><th>Resultado</th><th>Cambio</th><th>Nueva muestra</th><th>Medido por</th><th>Resumen</th><th></th></tr>
            </thead>
            <tbody>
              {mediciones.map(m => (
                <tr key={m.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{m.fecha}</td>
                  <td style={{ fontWeight: 700 }}>{m.talla_medida || '—'}</td>
                  <td><Badge value={m.resultado} /></td>
                  <td>{CAMBIO_LABEL[m.tipo_cambio] || '—'}</td>
                  <td>{m.requiere_nueva_muestra ? <strong style={{ color: 'var(--error)' }}>Sí</strong> : 'No'}</td>
                  <td>{m.medido_por || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-600)', maxWidth: 260 }}>
                    {[m.analisis_largos && `Largos: ${m.analisis_largos}`, m.analisis_horma && `Horma: ${m.analisis_horma}`, m.cambios_molderia && `Molderia: ${m.cambios_molderia}`]
                      .filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td>
                    {(isAdmin || isCreativo) && (
                      <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(m.id)}
                        style={{ background: 'none', border: '1px solid var(--error)', borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--error)' }}>
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

      {!showForm && canMedir && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Registrar medición
        </button>
      )}

      {showForm && canMedir && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-5)', border: '1px solid var(--primary-300)', background: 'var(--primary-50)', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 14, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ruler size={16} /> Nueva medición — {referenceLabel}
            </h4>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
              <XCircle size={20} />
            </button>
          </div>

          {error && (
            <div style={{ background: 'var(--error-light)', color: 'var(--error-dark)', padding: '8px 12px', borderRadius: 4, marginBottom: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={form.fecha} onChange={(e) => update('fecha', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Talla medida</label>
              <select className="form-select" value={form.talla_medida} onChange={(e) => update('talla_medida', e.target.value)} required>
                <option value="">Selecciona...</option>
                {tallas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Medido por</label>
              <select className="form-select" value={form.medido_por} onChange={(e) => update('medido_por', e.target.value)}>
                {creativos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Resultado</label>
              <select className="form-select" value={form.resultado} onChange={(e) => update('resultado', e.target.value)}>
                <option value="APROBADA">APROBADA (pasa al rack)</option>
                <option value="RECHAZADA">RECHAZADA (requiere cambios)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de cambio en molderia</label>
              <select className="form-select" value={form.tipo_cambio} onChange={(e) => update('tipo_cambio', e.target.value)}>
                <option value="NINGUNO">Sin cambios</option>
                <option value="MENOR">Menores (ajustes minimos)</option>
                <option value="MAYOR">Mayores (cortar otra muestra)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.requiere_nueva_muestra} onChange={(e) => update('requiere_nueva_muestra', e.target.checked)} />
              Requiere cortar otra muestra
            </label>
            {form.resultado === 'APROBADA' && (
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: 220 }}
                placeholder="Ubicación en rack de aprobadas (ej. Rack A - Estante 2)"
                value={form.ubicacion_rack}
                onChange={(e) => update('ubicacion_rack', e.target.value)}
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Análisis de largos</label>
              <input type="text" className="form-input" value={form.analisis_largos} onChange={(e) => update('analisis_largos', e.target.value)} placeholder="Ej. Largo correcto en talla M" />
            </div>
            <div className="form-group">
              <label className="form-label">Análisis de horma</label>
              <input type="text" className="form-input" value={form.analisis_horma} onChange={(e) => update('analisis_horma', e.target.value)} placeholder="Ej. Horma ceñida" />
            </div>
            <div className="form-group">
              <label className="form-label">Posición de estampado</label>
              <input type="text" className="form-input" value={form.posicion_estampado} onChange={(e) => update('posicion_estampado', e.target.value)} placeholder="Ej. Correcta / desviada" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Cambios de molderia (qué gusta y qué no)</label>
              <textarea className="form-input" rows={2} value={form.cambios_molderia} onChange={(e) => update('cambios_molderia', e.target.value)} placeholder="Detallar cambios requeridos en la molderia según retroalimentación de medición..." />
            </div>
            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <textarea className="form-input" rows={2} value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Registrando...' : 'Registrar medición'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
