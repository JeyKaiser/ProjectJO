import { useState, useEffect, useCallback } from 'react';
import { useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import supabase, { STORAGE_BUCKET, getImageUrl } from '../lib/supabase';
import { useFabrics, useReferenceFabrics, saveReferenceFabric, deleteReferenceFabric, saveConsumos } from '../lib/api';

function SeccionColapsable({ titulo, icono, children, defaultOpen = true, accentColor }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="detalle-seccion" style={{ borderLeftColor: accentColor }}>
      <button className="detalle-seccion-header" onClick={() => setOpen(!open)}>
        <div className="detalle-seccion-titulo">
          {icono}
          <span>{titulo}</span>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="detalle-seccion-body">{children}</div>}
    </div>
  );
}

export default function AsignacionTelasConsumos({ refId, tallajeGroupId }) {
  const { role } = useAuth();
  const { fabrics } = useFabrics();
  const { refFabrics, loading: loadingFabrics } = useReferenceFabrics(refId);

  const [dbRefId, setDbRefId] = useState(null);
  const [tallas, setTallas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [localFabrics, setLocalFabrics] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [selectedFabric, setSelectedFabric] = useState(null);
  const [usoPrenda, setUsoPrenda] = useState('');
  const [consumosValues, setConsumosValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalFabrics(refFabrics || []);
  }, [refFabrics]);

  useEffect(() => {
    if (!refId) return;
    let cancelled = false;
    async function load() {
      const refNum = refId.replace('REF-', '');
      const { data: ref } = await supabase
        .from('references')
        .select('id, tallaje_group_id')
        .eq('reference_number', refNum)
        .single();

      if (cancelled) return;

      if (ref) {
        setDbRefId(ref.id);
        const tgId = tallajeGroupId || ref.tallaje_group_id;
        if (tgId) {
          const { data: tg } = await supabase
            .from('tallaje_groups')
            .select('*')
            .eq('id', tgId)
            .single();
          if (tg && !cancelled) {
            setTallas(tg.name.split('-'));
          }
        }
      }
      if (!cancelled) setLoadingData(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refId, tallajeGroupId]);

  const resetForm = useCallback(() => {
    setSelectedFabric(null);
    setUsoPrenda('');
    setConsumosValues({});
    setError(null);
    setIsAdding(false);
    setEditingId(null);
  }, []);

  const handleCodeChange = (code) => {
    const found = fabrics.find(f => f.code === code);
    if (found) {
      setSelectedFabric(found);
    } else {
      setSelectedFabric(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFabric) return;

    setUploadingImage(true);
    setError(null);
    try {
      const fileName = `telas/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const imageUrl = getImageUrl(fileName);

      const { error: updateErr } = await supabase
        .from('fabrics')
        .update({ image_url: imageUrl })
        .eq('id', selectedFabric.id);

      if (updateErr) throw updateErr;

      setSelectedFabric(prev => ({ ...prev, image_url: imageUrl }));
    } catch (e) {
      setError('Error al subir imagen: ' + (e.message || ''));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const startEdit = (rf) => {
    const fab = rf.fabrics;
    setSelectedFabric(fab ? { ...fab, width_cm: fab.width_cm } : null);
    setUsoPrenda(rf.usage || '');
    setEditingId(rf.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!selectedFabric || !dbRefId) return;
    setSaving(true);
    setError(null);
    try {
      const { data: rfData, error: rfErr } = await saveReferenceFabric({
        id: editingId,
        reference_id: dbRefId,
        fabric_id: selectedFabric.id,
        usage: usoPrenda,
        width_cm: selectedFabric.width_cm,
        notes: null,
      });

      if (rfErr) throw rfErr;

      const refFabricId = rfData.id;

      if (Object.keys(consumosValues).length > 0) {
        const consumosToSave = Object.entries(consumosValues)
          .filter(([, val]) => val !== '' && val !== null)
          .map(([talla, valor]) => ({
            reference_id: dbRefId,
            reference_fabric_id: refFabricId,
            role: role,
            tipo_tela: 'SOLIDO',
            version: 1,
            talla,
            consumo_valor: parseFloat(valor),
            unidades: 1,
            observaciones: null,
          }));

        if (consumosToSave.length > 0) {
          await saveConsumos(consumosToSave);
        }
      }

      const { data: freshData } = await supabase
        .from('reference_fabrics')
        .select('id, reference_id, fabric_id, usage, width_cm, consumo_base, notes, active, fabrics(id, code, description, width_cm, image_url)')
        .eq('reference_id', dbRefId)
        .eq('active', true)
        .order('id');

      if (freshData) setLocalFabrics(freshData);

      resetForm();
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta tela?')) return;
    const { error: delErr } = await deleteReferenceFabric(id);
    if (delErr) return;
    setLocalFabrics(prev => prev.filter(f => f.id !== id));
  };

  const customCodes = [...new Set([
    ...(selectedFabric?.code ? [selectedFabric.code] : []),
    ...fabrics.map(f => f.code),
  ])];

  return (
    <div>
      {localFabrics.length > 0 && (
        <div className="table-container" style={{ marginBottom: 'var(--space-4)' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Foto</th>
                <th>Uso en Prenda</th>
                <th>Codigo</th>
                <th>Descripcion</th>
                <th>Ancho (cm)</th>
                <th style={{ width: 80 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localFabrics.map(rf => {
                const fab = rf.fabrics;
                return (
                  <tr key={rf.id}>
                    <td style={{ textAlign: 'center' }}>
                      {fab?.image_url ? (
                        <img src={fab.image_url} alt={fab.code}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, background: 'var(--gray-100)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={16} color="var(--gray-400)" />
                        </div>
                      )}
                    </td>
                    <td><strong>{rf.usage || '—'}</strong></td>
                    <td><span className="code-badge code-md" style={{ fontSize: 12 }}>{fab?.code || '—'}</span></td>
                    <td style={{ color: 'var(--gray-600)' }}>{fab?.description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{fab?.width_cm || rf.width_cm || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" title="Editar" onClick={() => startEdit(rf)}
                          style={{ background: 'none', border: '1px solid var(--gray-300)', borderRadius: 4, padding: 4, cursor: 'pointer' }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(rf.id)}
                          style={{ background: 'none', border: '1px solid var(--error)', borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isAdding && (
        <button className="btn btn-primary" onClick={startAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Agregar Tela
        </button>
      )}

      {isAdding && (
        <div className="card" style={{
          marginTop: 'var(--space-4)',
          border: '1px solid var(--primary-300)',
          background: 'var(--primary-50)',
          padding: 'var(--space-5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--primary-700)' }}>
              {editingId ? 'Editar Tela' : 'Nueva Tela'}
            </h4>
            <button onClick={resetForm} className="btn-icon"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{ background: 'var(--error-light)', color: 'var(--error-dark)', padding: '8px 12px', borderRadius: 4, marginBottom: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          {selectedFabric && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              {selectedFabric.image_url ? (
                <img src={selectedFabric.image_url} alt={selectedFabric.code}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()} title="Click para cambiar imagen" />
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                  style={{
                    width: 80, height: 80, borderRadius: 8, border: '2px dashed var(--gray-300)',
                    background: 'var(--gray-50)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer',
                  }}>
                  {uploadingImage ? (
                    <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>Subiendo...</span>
                  ) : (
                    <>
                      <Upload size={18} color="var(--gray-400)" />
                      <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Foto</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>Foto de Tela</span>
                <br />
                <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                  {uploadingImage ? 'Subiendo imagen...' : 'Click para subir o cambiar'}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600 }}>Uso en Prenda</label>
              <input type="text" className="form-input" value={usoPrenda}
                onChange={(e) => setUsoPrenda(e.target.value)}
                placeholder="Ej. TELA LUCIR, TELA FORRO..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600 }}>Codigo de Tela</label>
              <input
                type="text"
                className="form-input"
                list="fabric-codes-list"
                value={selectedFabric?.code || ''}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Buscar codigo..."
                autoComplete="off"
              />
              <datalist id="fabric-codes-list">
                {customCodes.map(code => (
                  <option key={code} value={code}>
                    {fabrics.find(f => f.code === code)?.description || code}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Descripcion</label>
              <input type="text" className="form-input" value={selectedFabric?.description || ''}
                readOnly style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Ancho Tela (cm)</label>
              <input type="text" className="form-input" value={selectedFabric?.width_cm || ''}
                readOnly style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          {selectedFabric && tallas.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Consumos ({role})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(tallas.length, 5)}, 1fr)`, gap: 'var(--space-3)' }}>
                {tallas.map(talla => (
                  <div key={talla} className="form-group" style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>
                      {talla}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="0.00"
                      value={consumosValues[talla] || ''}
                      onChange={(e) => setConsumosValues(prev => ({ ...prev, [talla]: e.target.value }))}
                      style={{ textAlign: 'center', width: '100%' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!selectedFabric || saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
