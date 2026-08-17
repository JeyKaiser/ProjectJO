import { useState } from 'react';
import { Package, Plus, Pencil, Search, Save, X, Eye, EyeOff } from 'lucide-react';
import { useSupplies, createSupply, updateSupply, toggleSupplyActive } from '../lib/api';

export default function AdminInsumos() {
  const { supplies, loading, error, refresh } = useSupplies();
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', category: '', unit_of_measure: '', supplier: '' });
  const [toast, setToast] = useState(null);

  const filtrar = supplies.filter(s =>
    !busqueda ||
    s.code?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.description?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.category?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ code: '', description: '', category: '', unit_of_measure: '', supplier: '' });
    setModalOpen(true);
  };

  const abrirEditar = (s) => {
    setEditando(s);
    setForm({
      code: s.code || '',
      description: s.description || '',
      category: s.category || '',
      unit_of_measure: s.unit_of_measure || '',
      supplier: s.supplier || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      if (editando) {
        const { error } = await updateSupply(editando.id, form);
        if (error) throw error;
        showToast('Insumo actualizado');
      } else {
        const { error } = await createSupply(form);
        if (error) throw error;
        showToast('Insumo creado');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (s) => {
    const { error } = await toggleSupplyActive(s.id, !s.active);
    if (error) showToast(`Error: ${error.message}`);
    else { refresh(); showToast(s.active ? 'Insumo ocultado' : 'Insumo activado'); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={20} /> Catálogo de Insumos
          </h2>
          <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: 13 }}>
            {supplies.length} insumo{supplies.length !== 1 ? 's' : ''} activo{supplies.length !== 1 ? 's' : ''}. Usado por el diseñador creativo al solicitar a bodega.
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          <Plus size={16} /> Nuevo Insumo
        </button>
      </div>

      {toast && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af' }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div className="relative" style={{ marginBottom: 16 }}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por código, descripción o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando catálogo...</p>
        ) : error ? (
          <p style={{ color: 'var(--error)', fontSize: 13 }}>Error: {error}</p>
        ) : filtrar.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No hay insumos que coincidan.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Unidad</th><th>Proveedor</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {filtrar.map(s => (
                  <tr key={s.id} style={{ opacity: s.active === false ? 0.5 : 1 }}>
                    <td><strong>{s.code}</strong></td>
                    <td>{s.description}</td>
                    <td>{s.category || '—'}</td>
                    <td>{s.unit_of_measure || '—'}</td>
                    <td>{s.supplier || '—'}</td>
                    <td>
                      <span style={{ background: s.active === false ? 'var(--gray-200)' : '#dcfce7', color: s.active === false ? 'var(--gray-500)' : '#166534', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {s.active === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => abrirEditar(s)}>
                        <Pencil size={12} /> Editar
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 6 }} onClick={() => handleToggle(s)}>
                        {s.active === false ? <Eye size={12} /> : <EyeOff size={12} />} {s.active === false ? 'Activar' : 'Ocultar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Insumo' : 'Nuevo Insumo'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">Código</label>
                  <input type="text" className="form-input" value={form.code}
                    onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Ej. IN002345" required />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Descripción</label>
                  <input type="text" className="form-input" value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ej. Elástico transparente 2cm" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <input type="text" className="form-input" value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ej. Elásticos, Botones, Cierres" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unidad de medida</label>
                    <select className="form-select" value={form.unit_of_measure}
                      onChange={(e) => setForm(prev => ({ ...prev, unit_of_measure: e.target.value }))}>
                      <option value="">Selecciona...</option>
                      <option value="metros">Metros</option>
                      <option value="unidades">Unidades</option>
                      <option value="kilos">Kilos</option>
                      <option value="rollos">Rollos</option>
                      <option value="pares">Pares</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Proveedor</label>
                  <input type="text" className="form-input" value={form.supplier}
                    onChange={(e) => setForm(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Proveedor (opcional)" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
