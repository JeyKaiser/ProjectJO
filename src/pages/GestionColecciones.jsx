import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Plus, Save, Trash2, RefreshCw, Shield } from 'lucide-react';
import supabase from '../lib/supabase';
import {
  createCollection,
  updateCollection,
  toggleCollectionActive,
  createCollectionYear,
  toggleCollectionYearHidden,
} from '../lib/api';

const SEASONS = ['WS', 'SS', 'RS', 'PF', 'FW'];

export default function GestionColecciones() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showHidden, setShowHidden] = useState(true);
  const [saving, setSaving] = useState(null);

  const [form, setForm] = useState({
    code: '', name: '', season: '', description: '', year: new Date().getFullYear(),
  });

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('collections')
        .select('*, collection_years(id, year, is_hidden)')
        .order('id');
      if (!showHidden) query.eq('active', true);
      const { data, error: err } = await query;
      if (err) throw err;
      setCollections(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [showHidden]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    setSaving('create');
    try {
      const { data: col, error: err } = await createCollection({
        code: form.code.toUpperCase(),
        name: form.name.toUpperCase(),
        season: form.season,
        description: form.description,
      });
      if (err) throw err;
      if (col) {
        await createCollectionYear(col.id, parseInt(form.year));
      }
      setForm({ code: '', name: '', season: '', description: '', year: new Date().getFullYear() });
      setShowCreate(false);
      loadCollections();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (col) => {
    setSaving(`active-${col.id}`);
    try {
      const { error: err } = await toggleCollectionActive(col.id, !col.active);
      if (err) throw err;
      loadCollections();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleAddYear = async (col, year) => {
    if (!year) return;
    setSaving(`year-add-${col.id}`);
    try {
      const { error: err } = await createCollectionYear(col.id, parseInt(year));
      if (err) throw err;
      loadCollections();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleToggleYear = async (yearRow) => {
    setSaving(`year-${yearRow.id}`);
    try {
      const { error: err } = await toggleCollectionYearHidden(yearRow.id, !yearRow.is_hidden);
      if (err) throw err;
      loadCollections();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="fade-in p-8 text-center text-gray-400">Cargando...</div>;
  if (error) return <div className="fade-in p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de Colecciones</h2>
          <p className="text-gray-500 text-sm">Crear, editar y ocultar colecciones y años</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${showHidden ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowHidden(!showHidden)}
            style={{ fontSize: 12 }}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            {showHidden ? ' Mostrando ocultas' : ' Solo activas'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nueva Coleccion
          </button>
        </div>
      </div>

      {/* Modal: Nueva Coleccion */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Nueva Coleccion</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label form-label-required">Codigo</label>
                  <input type="text" className="form-input" placeholder="Ej: WS, SS, RS..."
                    value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Nombre</label>
                  <input type="text" className="form-input" placeholder="Ej: WINTER SUN"
                    value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporada</label>
                  <select className="form-select" value={form.season}
                    onChange={e => setForm(prev => ({ ...prev, season: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ano Inicial</label>
                  <input type="number" className="form-input"
                    value={form.year} onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripcion</label>
                  <textarea className="form-input" rows={2}
                    value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving === 'create'}>
                  <Save size={16} /> {saving === 'create' ? 'Creando...' : 'Crear Coleccion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de colecciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {collections.map(col => {
          const years = col.collection_years || [];
          const isInactive = !col.active;
          return (
            <div key={col.id} className="card" style={{
              opacity: isInactive ? 0.5 : 1,
              borderLeft: `4px solid ${isInactive ? 'var(--gray-400)' : 'var(--primary-500)'}`,
              padding: 'var(--space-4)',
            }}>
              <div className="flex justify-between items-center mb-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="code-badge" style={{ fontSize: 14, padding: '4px 10px', background: 'var(--primary-100)', color: 'var(--primary-700)', fontWeight: 800 }}>
                    {col.code}
                  </span>
                  <strong style={{ fontSize: 16 }}>{col.name}</strong>
                  {isInactive && (
                    <span style={{ background: 'var(--gray-200)', color: 'var(--gray-500)', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      <EyeOff size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} /> Oculta
                    </span>
                  )}
                </div>
                <button
                  className={`btn ${isInactive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 12 }}
                  onClick={() => handleToggleActive(col)}
                  disabled={saving === `active-${col.id}`}
                  title={isInactive ? 'Mostrar coleccion' : 'Ocultar coleccion'}
                >
                  {isInactive ? <Eye size={14} /> : <EyeOff size={14} />}
                  {isInactive ? ' Mostrar' : ' Ocultar'}
                </button>
              </div>

              {/* Anos de la coleccion */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Anos
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {years.map(cy => (
                    <div key={cy.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: cy.is_hidden ? 'var(--gray-100)' : 'var(--primary-50)',
                      border: `1px solid ${cy.is_hidden ? 'var(--gray-300)' : 'var(--primary-200)'}`,
                      borderRadius: 8, padding: '4px 10px', opacity: cy.is_hidden ? 0.6 : 1,
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{cy.year}</span>
                      {cy.is_hidden && (
                        <EyeOff size={12} style={{ color: 'var(--gray-400)' }} />
                      )}
                      <button
                        className="btn-icon"
                        style={{ padding: '2px 4px', fontSize: 11, cursor: 'pointer', border: 'none', background: 'transparent' }}
                        onClick={() => handleToggleYear(cy)}
                        disabled={saving === `year-${cy.id}`}
                        title={cy.is_hidden ? 'Mostrar ano' : 'Ocultar ano'}
                      >
                        {cy.is_hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>
                  ))}
                  {/* Boton para agregar ano */}
                  <AddYearButton col={col} onAdd={handleAddYear} saving={saving} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddYearButton({ col, onAdd, saving }) {
  const [adding, setAdding] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  if (adding) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          style={{ width: 70, padding: '4px 8px', border: '1px solid var(--primary-300)', borderRadius: 6, fontSize: 13 }}
          value={year}
          onChange={e => setYear(e.target.value)}
          min={2020}
          max={2100}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter') { onAdd(col, year); setAdding(false); }
            if (e.key === 'Escape') setAdding(false);
          }}
        />
        <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
          onClick={() => { onAdd(col, year); setAdding(false); }}
          disabled={saving === `year-add-${col.id}`}>
          <Save size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-secondary"
      style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
      onClick={() => setAdding(true)}
    >
      <Plus size={12} /> Ano
    </button>
  );
}
