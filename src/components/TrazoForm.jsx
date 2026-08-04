import { useState, useEffect } from 'react';
import { X, Save, Scissors, Hash, ListChecks, FileText, Layers } from 'lucide-react';
import supabase from '../lib/supabase';
import { createTrazo, updateTrazo } from '../lib/api';

const TIPOS_TELA = [
  { value: 'SOLIDO', label: 'Sólido' },
  { value: 'MOD_ARTE', label: 'Modificación de Arte' },
  { value: 'UBI_TRAZO', label: 'Ubicación de Trazo' },
  { value: 'CUERO', label: 'Cuero' },
  { value: 'ALL_OVER', label: 'All Over' },
];

const FASES = [
  { value: 'costeo', label: 'Costeo' },
  { value: 'contramuestra', label: 'Contramuestra' },
];

const defaultForm = {
  reference_id: null,
  reference_fabric_id: null,
  tipo_tela: 'SOLIDO',
  fase: 'costeo',
  opcion_num: 1,
  veces_trazadas: 1,
  cantidad_piezas: '',
  consumo_valor: '',
  talla: '',
  ancho_tela: '',
  ancho_sesgo: '',
  consumo_lineal: '',
  archivo_audaces: '',
  fecha_inicio: '',
  fecha_fin: '',
  observaciones: '',
  estado: 'activo',
};

export default function TrazoForm({ referenceId, trazoToEdit, preselectedFabric, onSave, onCancel }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fabrics, setFabrics] = useState([]);

  useEffect(() => {
    if (!referenceId) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('reference_fabrics')
        .select('id, reference_id, usage, width_cm, fabrics(code, description)')
        .eq('reference_id', referenceId)
        .eq('active', true);
      if (!cancelled) {
        const list = (data || []).map(rf => ({
          id: rf.id,
          label: `${rf.usage || '?'}: ${rf.fabrics?.code || '?'} — ${(rf.fabrics?.description || '').substring(0, 25)}`,
          usage: rf.usage || '-',
          code: rf.fabrics?.code || '-',
          description: rf.fabrics?.description || '-',
          width: rf.width_cm ? `${Number(rf.width_cm) / 100}m` : '-',
        }));
        setFabrics(list);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [referenceId]);

  useEffect(() => {
    if (trazoToEdit) {
      setForm({
        reference_id: trazoToEdit.reference_id || referenceId,
        reference_fabric_id: trazoToEdit.reference_fabric_id || null,
        tipo_tela: trazoToEdit.tipo_tela || 'SOLIDO',
        fase: trazoToEdit.fase || 'costeo',
        opcion_num: trazoToEdit.opcion_num || 1,
        veces_trazadas: trazoToEdit.veces_trazadas || 1,
        cantidad_piezas: trazoToEdit.cantidad_piezas != null ? String(trazoToEdit.cantidad_piezas) : '',
        consumo_valor: trazoToEdit.consumo_valor != null ? String(trazoToEdit.consumo_valor) : '',
        talla: trazoToEdit.talla || '',
        ancho_tela: trazoToEdit.ancho_tela || '',
        ancho_sesgo: trazoToEdit.ancho_sesgo || '',
        consumo_lineal: trazoToEdit.consumo_lineal != null ? String(trazoToEdit.consumo_lineal) : '',
        archivo_audaces: trazoToEdit.archivo_audaces || '',
        fecha_inicio: trazoToEdit.fecha_inicio || '',
        fecha_fin: trazoToEdit.fecha_fin || '',
        observaciones: trazoToEdit.observaciones || '',
        estado: trazoToEdit.estado || 'activo',
      });
    } else if (preselectedFabric) {
      setForm({ ...defaultForm, reference_id: referenceId, reference_fabric_id: preselectedFabric.id });
    } else if (fabrics.length === 1) {
      setForm({ ...defaultForm, reference_id: referenceId, reference_fabric_id: fabrics[0].id });
    } else {
      setForm({ ...defaultForm, reference_id: referenceId });
    }
  }, [trazoToEdit, referenceId, preselectedFabric, fabrics]);

  const selectedFabric = fabrics.find(f => f.id === form.reference_fabric_id);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        reference_id: form.reference_id,
        reference_fabric_id: form.reference_fabric_id || null,
        tipo_tela: form.tipo_tela,
        fase: form.fase,
        opcion_num: parseInt(form.opcion_num, 10) || 1,
        veces_trazadas: parseInt(form.veces_trazadas, 10) || 1,
        cantidad_piezas: form.cantidad_piezas ? parseInt(form.cantidad_piezas, 10) : null,
        consumo_valor: form.consumo_valor ? parseFloat(form.consumo_valor.replace(',', '.')) : null,
        talla: form.talla || null,
        ancho_tela: form.ancho_tela || null,
        ancho_sesgo: form.ancho_sesgo || null,
        consumo_lineal: form.consumo_lineal ? parseFloat(form.consumo_lineal.replace(',', '.')) : null,
        archivo_audaces: form.archivo_audaces || null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        trazador_id: null,
        observaciones: form.observaciones || null,
        estado: form.estado || 'activo',
      };

      if (form.estado === 'cancelado') {
        payload.consumo_valor = 0;
      }

      let result;
      if (trazoToEdit?.id) {
        result = await updateTrazo(trazoToEdit.id, payload);
      } else {
        result = await createTrazo(payload);
      }

      if (result.error) throw new Error(result.error.message);
      onSave?.(result.data || result);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-300)', fontSize: 13, backgroundColor: 'var(--gray-50)',
  };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 4, textTransform: 'uppercase' };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 'var(--space-4)',
    }}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 660,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scissors size={18} style={{ color: 'var(--success)' }} />
            {trazoToEdit ? 'Editar Trazo' : 'Nuevo Trazo'}
          </h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
          {error && (
            <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--error-light)', color: 'var(--error-dark)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={labelStyle}><Layers size={10} style={{ display: 'inline', marginRight: 4 }} />Tela</label>
            {fabrics.length > 0 ? (
              <>
                <select
                  value={form.reference_fabric_id || ''}
                  onChange={(e) => handleChange('reference_fabric_id', e.target.value ? parseInt(e.target.value, 10) : null)}
                  style={{ ...inputStyle, border: form.reference_fabric_id ? '2px solid var(--success-300)' : '2px solid var(--warning-300)', color: form.reference_fabric_id ? 'inherit' : 'var(--warning-dark)' }}
                >
                  {!form.reference_fabric_id && <option value="">-- Seleccionar tela --</option>}
                  {fabrics.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                {selectedFabric && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--gray-500)', display: 'flex', gap: 'var(--space-3)' }}>
                    <span><strong>Código:</strong> {selectedFabric.code}</span>
                    <span><strong>Uso:</strong> {selectedFabric.usage}</span>
                    <span><strong>Ancho:</strong> {selectedFabric.width}</span>
                  </div>
                )}
                {!form.reference_fabric_id && fabrics.length > 1 && (
                  <div style={{ marginTop: 4, fontSize: 10, color: 'var(--warning-dark)', fontWeight: 600 }}>
                    Selecciona la tela para este trazo.
                  </div>
                )}
              </>
            ) : (
              <div style={{ ...inputStyle, color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
                Sin telas asignadas — trazo a nivel referencia
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyle}>Tipo de Tela</label>
              <select value={form.tipo_tela} onChange={(e) => handleChange('tipo_tela', e.target.value)} style={inputStyle}>
                {TIPOS_TELA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fase</label>
              <select value={form.fase} onChange={(e) => handleChange('fase', e.target.value)} style={inputStyle}>
                {FASES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Opción #</label>
              <input type="number" min="1" max="10" value={form.opcion_num} onChange={(e) => handleChange('opcion_num', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Talla Base</label>
              <input type="text" value={form.talla} onChange={(e) => handleChange('talla', e.target.value)} placeholder="Ej: 8, M, 10" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: form.estado === 'cancelado' ? 'var(--error-dark)' : 'var(--gray-700)', fontWeight: form.estado === 'cancelado' ? 700 : 400 }}>
              <input
                type="checkbox"
                checked={form.estado === 'cancelado'}
                onChange={(e) => handleChange('estado', e.target.checked ? 'cancelado' : 'activo')}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Cancelado / No se usa
            </label>
            {form.estado === 'cancelado' && (
              <span style={{ fontSize: 10, background: 'var(--error-light)', color: 'var(--error-dark)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>CANCELADO</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <div>
              <label style={labelStyle}><Hash size={10} style={{ display: 'inline', marginRight: 4 }} />Veces Trazadas</label>
              <input type="number" min="1" value={form.veces_trazadas} onChange={(e) => handleChange('veces_trazadas', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><ListChecks size={10} style={{ display: 'inline', marginRight: 4 }} />Cant. Piezas</label>
              <input type="number" min="0" value={form.cantidad_piezas} onChange={(e) => handleChange('cantidad_piezas', e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Consumo (m)</label>
              <input type="text" value={form.estado === 'cancelado' ? '0' : form.consumo_valor} onChange={(e) => handleChange('consumo_valor', e.target.value)} placeholder={form.estado === 'cancelado' ? 'Cancelado' : '0.00'} disabled={form.estado === 'cancelado'} style={{ ...inputStyle, opacity: form.estado === 'cancelado' ? 0.5 : 1 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <div>
              <label style={labelStyle}>Ancho Tela</label>
              <input type="text" value={form.ancho_tela} onChange={(e) => handleChange('ancho_tela', e.target.value)} placeholder="Ej: 1.50m" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ancho Sesgo</label>
              <input type="text" value={form.ancho_sesgo} onChange={(e) => handleChange('ancho_sesgo', e.target.value)} placeholder="Ej: 3cms" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Consumo Lineal (m)</label>
              <input type="text" value={form.consumo_lineal} onChange={(e) => handleChange('consumo_lineal', e.target.value)} placeholder="Solo para sesgos" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <div>
              <label style={labelStyle}>Fecha Inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={(e) => handleChange('fecha_inicio', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Fin</label>
              <input type="date" value={form.fecha_fin} onChange={(e) => handleChange('fecha_fin', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <label style={labelStyle}><FileText size={10} style={{ display: 'inline', marginRight: 4 }} />Archivo Audaces</label>
            <input type="text" value={form.archivo_audaces} onChange={(e) => handleChange('archivo_audaces', e.target.value)} placeholder="Referencia al archivo .tizada" style={inputStyle} />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <label style={labelStyle}>Observaciones</label>
            <textarea value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} placeholder="Notas del trazo..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="button" onClick={onCancel} className="btn btn-outline btn-sm">Cancelar</button>
            <button type="submit" className="btn btn-success btn-sm" disabled={saving}>
              <Save size={14} /> {saving ? 'Guardando...' : trazoToEdit ? 'Actualizar Trazo' : 'Crear Trazo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
