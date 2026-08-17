import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Ruler } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';
import { useSupplies, saveReferenceSuppliesByTalla, deleteReferenceSupply } from '../lib/api';

export default function ConsumosInsumosPorTalla({ dbRefId }) {
  const { isAdmin, isCreativo } = useAuth();
  const canEditar = isAdmin || isCreativo;

  const [tallas, setTallas] = useState([]);
  const [rows, setRows] = useState([]);
  const [supplySel, setSupplySel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const { supplies, loading: loadingSupplies } = useSupplies();

  useEffect(() => {
    if (!dbRefId) return;
    let cancelled = false;
    async function load() {
      const { data: ref } = await supabase
        .from('references')
        .select('tallaje_group_id')
        .eq('id', dbRefId)
        .single();

      let tallasArr = [];
      if (ref?.tallaje_group_id) {
        const { data: tg } = await supabase
          .from('tallaje_groups')
          .select('name')
          .eq('id', ref.tallaje_group_id)
          .single();
        if (tg) tallasArr = (tg.name || '').split('-').map(t => t.trim()).filter(Boolean);
      }
      if (cancelled) return;

      const { data: existing } = await supabase
        .from('reference_supplies')
        .select('id, supply_id, talla, quantity, unit_of_measure, notes, supplies(code, description, unit_of_measure)')
        .eq('reference_id', dbRefId)
        .not('talla', 'is', null)
        .order('id');

      // Agrupar por insumo
      const map = new Map();
      (existing || []).forEach(r => {
        const key = r.supply_id;
        if (!map.has(key)) {
          map.set(key, {
            supplyId: r.supply_id,
            code: r.supplies?.code || '—',
            description: r.supplies?.description || '—',
            unit: r.unit_of_measure || r.supplies?.unit_of_measure || '',
            tallas: {},
            ids: [],
          });
        }
        const row = map.get(key);
        row.tallas[r.talla] = r.quantity != null ? String(r.quantity) : '';
        row.ids.push(r.id);
      });

      setTallas(tallasArr);
      setRows(Array.from(map.values()));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [dbRefId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const agregarInsumo = () => {
    if (!supplySel) return;
    const s = supplies.find(x => x.id === parseInt(supplySel));
    if (!s) return;
    setRows(prev => [...prev, {
      supplyId: s.id,
      code: s.code,
      description: s.description,
      unit: s.unit_of_measure || 'unidades',
      tallas: {},
      ids: [],
    }]);
    setSupplySel('');
  };

  const updateCell = (idx, talla, value) => {
    setRows(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      return { ...r, tallas: { ...r.tallas, [talla]: value } };
    }));
  };

  const eliminarInsumo = async (idx) => {
    const row = rows[idx];
    for (const id of row.ids) {
      await deleteReferenceSupply(id);
    }
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const guardar = async () => {
    setSaving(true);
    try {
      for (const row of rows) {
        const tallaRows = tallas.map(t => ({ talla: t, quantity: row.tallas[t], notes: null }));
        const { error } = await saveReferenceSuppliesByTalla(dbRefId, row.supplyId, row.unit, tallaRows);
        if (error) throw error;
      }
      showToast('Consumo de insumos por talla guardado');
    } catch (e) {
      showToast(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!dbRefId) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>;

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando consumo de insumos...</p>;

  if (tallas.length === 0) {
    return (
      <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>
        Esta referencia no tiene grupo de tallaje asignado. Asigna el tallaje en la ficha para registrar consumo de insumos por talla.
      </p>
    );
  }

  const suppliesDisponibles = supplies.filter(s => !rows.some(r => r.supplyId === s.id));

  return (
    <div>
      {toast && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13 }}>
          {toast}
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 0 }}>
        Registra el consumo de cada insumo por talla (metros o unidades) para la muestra.
      </p>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Aún no hay insumos con consumo por talla.</p>
      ) : (
        <div className="table-container" style={{ marginBottom: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Insumo</th>
                {tallas.map(t => <th key={t} style={{ textAlign: 'center' }}>{t}</th>)}
                <th>Unidad</th>
                {canEditar && <th style={{ width: 50 }}></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.supplyId}>
                  <td>
                    <strong>{r.code}</strong>{' '}
                    <span style={{ color: 'var(--gray-600)' }}>{r.description}</span>
                  </td>
                  {tallas.map(t => (
                    <td key={t} style={{ textAlign: 'center' }}>
                      {canEditar ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          style={{ width: 70, textAlign: 'center' }}
                          className="form-input"
                          value={r.tallas[t] || ''}
                          placeholder="—"
                          onChange={(e) => updateCell(idx, t, e.target.value)}
                        />
                      ) : (
                        <span style={{ fontWeight: 700 }}>{r.tallas[t] || '—'}</span>
                      )}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>{r.unit}</td>
                  {canEditar && (
                    <td>
                      <button className="btn-icon" title="Quitar insumo" onClick={() => eliminarInsumo(idx)}
                        style={{ background: 'none', border: '1px solid var(--error)', borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canEditar && (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ maxWidth: 340 }} value={supplySel} onChange={(e) => setSupplySel(e.target.value)}>
              <option value="">Agregar insumo del catálogo...</option>
              {suppliesDisponibles.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.description}</option>
              ))}
            </select>
            <button className="btn btn-secondary" onClick={agregarInsumo} disabled={!supplySel || loadingSupplies}>
              <Plus size={16} /> Agregar
            </button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving || rows.length === 0}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar consumo por talla'}
            </button>
          </div>
          {!canEditar && (
            <p style={{ fontSize: 12, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ruler size={14} /> Solo el creativo o el administrador pueden editar los consumos.
            </p>
          )}
        </>
      )}
    </div>
  );
}
