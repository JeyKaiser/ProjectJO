import { useState, useEffect } from 'react';
import { X, Plus, CheckCircle2, Clock, Hash, Tag } from 'lucide-react';
import supabase from '../lib/supabase';

export default function ConsumoVersionesModal({ referenceFabricId, referenceId, role, tipoTela, onClose, onSaved }) {
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState('');
  const [newTalla, setNewTalla] = useState('');
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => { load(); }, [referenceFabricId, role, tipoTela]);

  async function load() {
    if (!referenceFabricId || !referenceId || !role) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('consumos')
        .select('*')
        .eq('reference_id', referenceId)
        .eq('reference_fabric_id', referenceFabricId)
        .eq('role', role)
        .eq('tipo_tela', tipoTela || 'SOLIDO')
        .order('version', { ascending: false });
      setVersiones(data || []);
    } catch (_) { /* silent */ }
    finally { setLoading(false); }
  }

  async function handleNewVersion() {
    if (!newValue) return;
    setSaving(true);
    try {
      const maxVer = versiones.length > 0 ? Math.max(...versiones.map(v => v.version || 1)) : 0;
      await supabase.from('consumos').insert({
        reference_id: referenceId,
        reference_fabric_id: referenceFabricId,
        role,
        tipo_tela: tipoTela || 'SOLIDO',
        version: maxVer + 1,
        consumo_valor: parseFloat(newValue.replace(',', '.')) || null,
        talla: newTalla || null,
        es_final: false,
      });
      setNewValue('');
      setNewTalla('');
      setShowNewForm(false);
      await load();
    } catch (_) { /* silent */ }
    finally { setSaving(false); }
  }

  async function handleSetFinal(id) {
    try {
      await supabase.from('consumos').update({ es_final: true }).eq('id', id);
      await load();
    } catch (_) { /* silent */ }
  }

  const telaLabel = { SOLIDO: 'Sólido', MOD_ARTE: 'Mod. Arte', UBI_TRAZO: 'Ubic. Trazo', CUERO: 'Cuero', ALL_OVER: 'All Over' };
  const roleLabel = { CREATIVO: 'Creativo', TECNICO: 'Técnico', TRAZADOR: 'Trazador', CONTRAMUESTRA: 'Contramuestra' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash size={16} style={{ color: 'var(--primary-600)' }} />
            Versiones — {roleLabel[role] || role} · {telaLabel[tipoTela] || tipoTela || 'Sólido'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: 'var(--space-6)' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</p>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 'var(--space-4)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', color: 'var(--gray-500)' }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', color: 'var(--gray-500)' }}>Consumo (m)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', color: 'var(--gray-500)' }}>Talla</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', color: 'var(--gray-500)' }}>Fecha</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', color: 'var(--gray-500)' }}>Estado</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', color: 'var(--gray-500)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {versiones.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--gray-400)', fontSize: 12 }}>Sin versiones registradas.</td></tr>
                  ) : (
                    versiones.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--gray-100)', background: v.es_final ? 'var(--success-50)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, fontFamily: 'monospace' }}>v{v.version}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: v.es_final ? 700 : 400, fontFamily: 'monospace' }}>
                          {v.consumo_valor != null ? v.consumo_valor : '—'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{v.talla || '—'}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: 'var(--gray-500)' }}>
                          {v.created_at ? new Date(v.created_at).toLocaleDateString('es-CO') : '—'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          {v.es_final ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--success-light)', color: 'var(--success-dark)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700 }}>
                              <CheckCircle2 size={10} /> FINAL
                            </span>
                          ) : (
                            <button onClick={() => handleSetFinal(v.id)}
                              style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '2px 8px', fontSize: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                            ><CheckCircle2 size={10} /> Marcar final</button>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          {v.observaciones && <span style={{ fontSize: 9, color: 'var(--gray-400)' }} title={v.observaciones}>💬</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {showNewForm ? (
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 2 }}>Nuevo Consumo (m)</label>
                      <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="0.00"
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-300)', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 2 }}>Talla</label>
                      <input type="text" value={newTalla} onChange={e => setNewTalla(e.target.value)} placeholder="Ej: 8"
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 13 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowNewForm(false)} className="btn btn-outline btn-xs">Cancelar</button>
                    <button onClick={handleNewVersion} disabled={saving || !newValue} className="btn btn-primary btn-xs">
                      <Plus size={12} /> {saving ? 'Guardando...' : 'Crear v' + (versiones.length > 0 ? Math.max(...versiones.map(v => v.version || 1)) + 1 : 1)}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewForm(true)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Plus size={14} /> Nueva Versión
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
