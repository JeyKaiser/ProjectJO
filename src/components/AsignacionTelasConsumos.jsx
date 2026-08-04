import { useState, useEffect, useCallback } from 'react';
import { useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import supabase, { STORAGE_BUCKET, getImageUrl } from '../lib/supabase';
import { useReferenceFabrics, saveReferenceFabric, deleteReferenceFabric, saveConsumos } from '../lib/api';

const ROLE_TO_DB_ENUM = {
  'Diseñador Creativo': 'CREATIVO',
  'Diseñador Técnico': 'TECNICO',
  'Trazador': 'TRAZADOR',
  'Administrador': 'CREATIVO',
  'Creador de Ficha': 'CREATIVO',
};

function mapRoleToDB(role) {
  return ROLE_TO_DB_ENUM[role] || role;
}


export default function AsignacionTelasConsumos({ refId, tallajeGroupId }) {
  const { role } = useAuth();
  
  const [dbRefId, setDbRefId] = useState(null);
  const { refFabrics, loading: loadingFabrics } = useReferenceFabrics(dbRefId);
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
  const [toast, setToast] = useState(null);
  const [codeSearch, setCodeSearch] = useState('');
  const [codeSearching, setCodeSearching] = useState(false);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const isSesgo = usoPrenda.toUpperCase().startsWith('SESGO');
  const [consumoLineal, setConsumoLineal] = useState('');
  const [anchoSesgo, setAnchoSesgo] = useState('');
  const [sentidoSesgo, setSentidoSesgo] = useState('');

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
    setCodeSearch('');
    setConsumoLineal('');
    setAnchoSesgo('');
    setSentidoSesgo('');
  }, []);

  const handleCodeChange = (code) => {
    setCodeSearch(code);
    setSelectedFabric(null);
    if (!code || code.trim().length < 3) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCodeSearching(true);
      const { data: fabric, error: _ } = await supabase
        .from('fabrics')
        .select('id, code, description, width_cm, image_url')
        .eq('code', code.trim())
        .maybeSingle();

      if (fabric) {
        setSelectedFabric(fabric);
      }
      setCodeSearching(false);
    }, 350);
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

  const startEdit = async (rf) => {
    const fab = rf.fabrics;
    setSelectedFabric(fab ? { ...fab, width_cm: fab.width_cm } : null);
    setUsoPrenda(rf.usage || '');
    setEditingId(rf.id);
    setIsAdding(true);
    setCodeSearch(fab?.code || '');

    const usage = (rf.usage || '').toUpperCase();
    const dbRole = mapRoleToDB(role);
    if (usage.startsWith('SESGO')) {
      const { data: cons } = await supabase
        .from('consumos')
        .select('*')
        .eq('reference_fabric_id', rf.id)
        .eq('role', dbRole)
        .order('version', { ascending: false })
        .limit(1);

      if (cons?.length) {
        const c = cons[0];
        setConsumoLineal(c.consumo_valor ? String(c.consumo_valor) : '');
        const obs = c.observaciones || '';
        const anchoM = obs.match(/Ancho sesgo:\s*([\d.]+)/);
        const sentM = obs.match(/Sentido:\s*(.+)/);
        if (anchoM) setAnchoSesgo(anchoM[1]);
        if (sentM) setSentidoSesgo(sentM[1]);
      }
    }
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
      const dbRole = mapRoleToDB(role);

      if (isSesgo && consumoLineal) {
        const { data: existing } = await supabase
          .from('consumos')
          .select('version')
          .eq('reference_fabric_id', refFabricId)
          .eq('role', dbRole)
          .order('version', { ascending: false })
          .limit(1);

        const nextVer = (existing?.length > 0) ? existing[0].version + 1 : 1;

        const obsParts = [];
        if (anchoSesgo) obsParts.push(`Ancho sesgo: ${anchoSesgo} cms`);
        if (sentidoSesgo) obsParts.push(`Sentido: ${sentidoSesgo}`);
        await saveConsumos([{
          reference_id: dbRefId,
          reference_fabric_id: refFabricId,
          role: dbRole,
          tipo_tela: 'SOLIDO',
          version: nextVer,
          talla: null,
          consumo_valor: parseFloat(consumoLineal),
          unidades: 1,
          observaciones: obsParts.join(', ') || null,
          es_final: true,
        }]);
      } else if (Object.keys(consumosValues).length > 0) {
        const { data: existing } = await supabase
          .from('consumos')
          .select('version')
          .eq('reference_fabric_id', refFabricId)
          .eq('role', dbRole)
          .order('version', { ascending: false })
          .limit(1);

        const nextVer = (existing?.length > 0) ? existing[0].version + 1 : 1;

        const consumosToSave = Object.entries(consumosValues)
          .filter(([, val]) => val !== '' && val !== null)
          .map(([talla, valor]) => ({
            reference_id: dbRefId,
            reference_fabric_id: refFabricId,
            role: dbRole,
            tipo_tela: 'SOLIDO',
            version: nextVer,
            talla,
            consumo_valor: parseFloat(valor),
            unidades: 1,
            observaciones: null,
            es_final: true,
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

      setToast(editingId ? 'Consumo actualizado correctamente' : 'Consumo ingresado correctamente');
      setTimeout(() => setToast(null), 3500);

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600 }}>Uso en Prenda</label>
              <select className="form-select" value={usoPrenda}
                onChange={(e) => setUsoPrenda(e.target.value)}>
                <option value="">Selecciona...</option>
                <option value="TELA LUCIR">TELA LUCIR</option>
                <option value="TELA LUCIR 2">TELA LUCIR 2</option>
                <option value="TELA LUCIR 3">TELA LUCIR 3</option>
                <option value="TELA LUCIR 4">TELA LUCIR 4</option>
                <option value="TELA FORRO">TELA FORRO</option>
                <option value="TELA FORRO 2">TELA FORRO 2</option>
                <option value="TELA FORRO 3">TELA FORRO 3</option>
                <option value="FUSIONABLE">FUSIONABLE</option>
                <option value="FUSIONABLE 2">FUSIONABLE 2</option>
                <option value="SESGO LUCIR">SESGO LUCIR</option>
                <option value="SESGO LUCIR 2">SESGO LUCIR 2</option>
                <option value="SESGO LUCIR 3">SESGO LUCIR 3</option>
                <option value="SESGO FORRO">SESGO FORRO</option>
                <option value="SESGO FORRO 2">SESGO FORRO 2</option>
                <option value="SESGO FORRO 3">SESGO FORRO 3</option>
                <option value="SESGO FUSIONABLE">SESGO FUSIONABLE</option>
                <option value="SESGO FUSIONABLE 2">SESGO FUSIONABLE 2</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600 }}>Codigo de Tela</label>
              <input
                type="text"
                className="form-input"
                value={codeSearch}
                onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
                placeholder="Ej. TE00002103"
                autoComplete="off"
              />
              {codeSearch.length >= 3 && codeSearching && (
                <span className="form-help" style={{ color: 'var(--primary-500)' }}>Buscando...</span>
              )}
              {codeSearch.length >= 3 && !codeSearching && !selectedFabric && (
                <span className="form-help" style={{ color: 'var(--error)' }}>Codigo no encontrado en el catalogo</span>
              )}
              {codeSearch.length >= 3 && !codeSearching && selectedFabric && (
                <span className="form-help" style={{ color: 'var(--success)' }}>Tela encontrada</span>
              )}
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

          {selectedFabric && !isSesgo && tallas.length > 0 && (
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

          {selectedFabric && isSesgo && (
            <div style={{ marginTop: 16, padding: 'var(--space-4)', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, display: 'block', color: 'var(--warning-dark)' }}>
                Detalles del Sesgo ({role})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>Consumo Lineal (mts)</label>
                  <input type="number" step="0.01" min="0" className="form-input"
                    value={consumoLineal}
                    onChange={(e) => setConsumoLineal(e.target.value)}
                    placeholder="Ej. 1.38" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>Ancho Sesgo (cms)</label>
                  <input type="number" step="0.1" min="0" className="form-input"
                    value={anchoSesgo}
                    onChange={(e) => setAnchoSesgo(e.target.value)}
                    placeholder="Ej. 3" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>Sentido</label>
                  <select className="form-select" value={sentidoSesgo}
                    onChange={(e) => setSentidoSesgo(e.target.value)}>
                    <option value="">Selecciona...</option>
                    <option value="AL HILO">AL HILO</option>
                    <option value="A TRAVEZ">A TRAVEZ</option>
                    <option value="AL SESGO">AL SESGO</option>
                  </select>
                </div>
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

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--success)', color: 'white', padding: '12px 20px',
          borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600,
          animation: 'fadeInUp 0.3s ease',
        }}>
          <CheckCircle size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
