import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Scissors, Ruler, AlertTriangle, CheckCircle2, Hash, ListChecks, Info } from 'lucide-react';
import supabase from '../lib/supabase';
import { saveComparativo, useComparativo } from '../lib/api';

const JUSTIFICACIONES = {
  veces: ['Se traza mas veces, se logra mejor aprovechamiento'],
  piezas: ['Aumenta la cantidad de piezas', 'Aumenta la cantidad de piezas a fusionar', 'Disminuye la cantidad de piezas a fusionar'],
  ancho: ['Cambio el ancho de la tela', 'Cambio de tela'],
  molderia: ['Aumento en el largo', 'Disminucion en el largo', 'Re-diseno de molderia'],
  sesgo: ['Aumenta consumo lineal', 'Disminuye consumo lineal'],
  ancho_sesgo: ['Aumenta el ancho del sesgo', 'Disminuye el ancho del sesgo'],
  telas: ['Esta tela se anadio para Contramuestras', 'Esta tela se elimino para Contramuestras'],
};

const DIMENSIONES = [
  { key: 'veces', label: 'Veces Trazadas', icon: Hash, campoCosteo: 'veces_trazadas', campoContra: 'veces_trazadas' },
  { key: 'piezas', label: 'Cantidad de Piezas', icon: ListChecks, campoCosteo: 'cantidad_piezas', campoContra: 'cantidad_piezas' },
  { key: 'ancho', label: 'Ancho de Tela', icon: Ruler, campoCosteo: 'ancho_tela', campoContra: 'ancho_tela' },
  { key: 'molderia', label: 'Moldería', icon: Scissors, campoCosteo: 'observaciones', campoContra: 'observaciones' },
  { key: 'sesgo', label: 'Consumo Lineal (Sesgos)', icon: Ruler, campoCosteo: 'consumo_lineal', campoContra: 'consumo_lineal' },
  { key: 'ancho_sesgo', label: 'Ancho de Sesgo', icon: Ruler, campoCosteo: 'ancho_sesgo', campoContra: 'ancho_sesgo' },
  { key: 'telas', label: 'Cantidad de Telas Totales', icon: Info, campoCosteo: 'consumo_valor', campoContra: 'consumo_valor' },
];

function formatVal(val) {
  if (val == null || val === '') return '—';
  return String(val);
}

export default function ComparativoTrazos() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const { comparativo: existingComparativo } = useComparativo(refId ? parseInt(refId, 10) : null);

  const [referencia, setReferencia] = useState(null);
  const [trazos, setTrazos] = useState([]);
  const [trazoCosteo, setTrazoCosteo] = useState(null);
  const [trazoContramuestra, setTrazoContramuestra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [diffs, setDiffs] = useState({});
  const [justificaciones, setJustificaciones] = useState({});

  useEffect(() => { loadData(); }, [refId]);

  useEffect(() => {
    if (existingComparativo) {
      const d = {};
      const j = {};
      DIMENSIONES.forEach(dim => {
        d[dim.key] = existingComparativo[`difiere_${dim.key}`] || false;
        j[dim.key] = existingComparativo[`justificacion_${dim.key}`] || '';
      });
      setDiffs(d);
      setJustificaciones(j);

      const costeoTrazo = trazos.find(t => t.id === existingComparativo.trazo_costeo_id);
      const contraTrazo = trazos.find(t => t.id === existingComparativo.trazo_contramuestra_id);
      if (costeoTrazo) setTrazoCosteo(costeoTrazo);
      if (contraTrazo) setTrazoContramuestra(contraTrazo);
    }
  }, [existingComparativo, trazos]);

  async function loadData() {
    setLoading(true);
    try {
      const numericId = parseInt(refId, 10);
      const { data: ref } = await supabase.from('references').select('*').eq('id', numericId).single();
      setReferencia(ref || null);

      const { data: allTrazos } = await supabase
        .from('trazos')
        .select('*')
        .eq('reference_id', numericId)
        .order('opcion_num');

      setTrazos(allTrazos || []);

      if (!existingComparativo) {
        const costeoTrazos = (allTrazos || []).filter(t => t.fase === 'costeo');
        const contraTrazos = (allTrazos || []).filter(t => t.fase === 'contramuestra');
        if (costeoTrazos.length > 0) setTrazoCosteo(costeoTrazos[0]);
        if (contraTrazos.length > 0) setTrazoContramuestra(contraTrazos[0]);
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  function toggleDiff(key) {
    setDiffs(prev => ({ ...prev, [key]: !prev[key] }));
    if (!diffs[key]) {
      setJustificaciones(prev => ({ ...prev, [key]: '' }));
    }
  }

  function handleJustificacion(key, value) {
    setJustificaciones(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        reference_id: parseInt(refId, 10),
        trazo_costeo_id: trazoCosteo?.id || null,
        trazo_contramuestra_id: trazoContramuestra?.id || null,
        trazador_id: null,
        fecha_comparativo: new Date().toISOString().split('T')[0],
      };

      DIMENSIONES.forEach(dim => {
        payload[`difiere_${dim.key}`] = diffs[dim.key] || false;
        payload[`justificacion_${dim.key}`] = diffs[dim.key] ? (justificaciones[dim.key] || null) : null;
      });

      if (existingComparativo?.id) {
        payload.id = existingComparativo.id;
      }

      await saveComparativo(payload);
      setMessage({ type: 'success', text: 'Comparativo guardado correctamente.' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  const selectedCosteoTrazo = trazoCosteo;
  const selectedContraTrazo = trazoContramuestra;

  if (loading) {
    return <div className="fade-in" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>;
  }

  if (!referencia) {
    return <div className="fade-in" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--gray-500)' }}>Referencia no encontrada.</div>;
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <button onClick={() => navigate('/trazador')} className="btn btn-outline btn-sm"><ArrowLeft size={16} /> Volver</button>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
            <Scissors size={18} style={{ color: 'var(--success)' }} />
            Comparativo: Costeo vs Contramuestra
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>
            Ref: <strong>{referencia.reference_number}</strong> — {referencia.codigo_md || referencia.name || '-'}
          </p>
        </div>
      </div>

      {message && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', background: message.type === 'success' ? 'var(--success-light)' : 'var(--error-light)', color: message.type === 'success' ? 'var(--success-dark)' : 'var(--error-dark)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {/* Selector de Trazos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Trazo de Costeo</label>
          <select value={selectedCosteoTrazo?.id || ''} onChange={(e) => setTrazoCosteo(trazos.find(t => t.id === parseInt(e.target.value, 10)))} style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-300)', fontSize: 13 }}>
            <option value="">-- Seleccionar trazo costeo --</option>
            {trazos.filter(t => t.fase === 'costeo').map(t => (
              <option key={t.id} value={t.id}>{t.tipo_tela} — Opción {t.opcion_num} — Consumo: {t.consumo_valor || '-'}m</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Trazo de Contramuestra</label>
          <select value={selectedContraTrazo?.id || ''} onChange={(e) => setTrazoContramuestra(trazos.find(t => t.id === parseInt(e.target.value, 10)))} style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '2px solid var(--success-300)', fontSize: 13 }}>
            <option value="">-- Seleccionar trazo contramuestra --</option>
            {trazos.filter(t => t.fase === 'contramuestra').map(t => (
              <option key={t.id} value={t.id}>{t.tipo_tela} — Opción {t.opcion_num} — Consumo: {t.consumo_valor || '-'}m</option>
            ))}
          </select>
        </div>
      </div>

      {(!selectedCosteoTrazo || !selectedContraTrazo) ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--gray-500)' }}>
          <Info size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.3 }} />
          <p>Selecciona un trazo de costeo y uno de contramuestra para comparar.</p>
        </div>
      ) : (
        <>
          {/* Tabla Comparativa */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--gray-100)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid var(--gray-200)' }}>Dimensión</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-200)' }}>Costeo</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, background: 'var(--success-50)', borderBottom: '2px solid var(--success-200)' }}>Contramuestra</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid var(--gray-200)' }}>¿Difiere?</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid var(--gray-200)' }}>Justificación</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONES.map((dim) => {
                  const valCosteo = selectedCosteoTrazo[dim.campoCosteo];
                  const valContra = selectedContraTrazo[dim.campoContra];
                  const esDiferente = String(valCosteo || '') !== String(valContra || '');
                  const difiere = diffs[dim.key] || false;
                  const Icon = dim.icon;

                  return (
                    <tr key={dim.key} style={{ borderBottom: '1px solid var(--gray-100)', background: difiere ? 'var(--warning-light)' : 'transparent' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={14} style={{ color: 'var(--gray-500)' }} />
                        {dim.label}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', background: 'var(--primary-50)', fontFamily: 'monospace', fontSize: 13 }}>
                        {formatVal(valCosteo)}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', background: 'var(--success-50)', fontFamily: 'monospace', fontSize: 13 }}>
                        {formatVal(valContra)}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={difiere}
                            onChange={() => toggleDiff(dim.key)}
                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                          />
                          {esDiferente && !difiere && (
                            <span style={{ fontSize: 10, color: 'var(--warning-dark)', fontWeight: 700 }}>DIFIERE</span>
                          )}
                        </label>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {difiere ? (
                          <select
                            value={justificaciones[dim.key] || ''}
                            onChange={(e) => handleJustificacion(dim.key, e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', border: '2px solid var(--warning-300)', fontSize: 12, background: 'var(--warning-50)' }}
                          >
                            <option value="">-- Seleccionar justificación --</option>
                            {JUSTIFICACIONES[dim.key]?.map((j, i) => (
                              <option key={i} value={j}>{j}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>Sin cambios</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-success" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Comparativo'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
