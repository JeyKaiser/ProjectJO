import { useState, useCallback, useEffect } from 'react';
import { Check, X, Edit3, RotateCcw, Download, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  useReferencesWithCodeStatus,
  useCodePool,
  useCodeLog,
  assignCode,
  unassignCode,
  bulkDeriveCodes,
} from '../lib/api';
import styles from './AdminCodigos.module.css';

const TABS = [
  { key: 'referencias', label: 'Referencias' },
  { key: 'pool', label: 'Pool de Códigos' },
  { key: 'historial', label: 'Historial' },
];

function StatusBadge({ status }) {
  const colors = {
    ASIGNADO: { bg: '#dcfce7', fg: '#166534', label: 'ASIGNADO' },
    DERIVADO: { bg: '#fef3c7', fg: '#92400e', label: 'DERIVADO' },
    DISPONIBLE: { bg: '#dbeafe', fg: '#1e40af', label: 'DISPONIBLE' },
    RESERVADO: { bg: '#f3e8ff', fg: '#6b21a8', label: 'RESERVADO' },
    RETIRADO: { bg: '#fee2e2', fg: '#991b1b', label: 'RETIRADO' },
  };
  const c = colors[status] || { bg: '#f3f4f6', fg: '#6b7280', label: status };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.fg,
    }}>
      {c.label}
    </span>
  );
}

export default function AdminCodigos() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('referencias');

  if (!isAdmin) {
    return (
      <div className="fade-in" style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <h2>Acceso Restringido</h2>
          <p style={{ color: 'var(--gray-500)' }}>Solo el administrador puede gestionar códigos MD/PT.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', margin: 0 }}>
          Gestión de Códigos MD / PT
        </h2>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>
          Administración centralizada de códigos de muestra diseño (MD) y producto terminado (PT)
        </p>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'referencias' && <ReferenciasTab />}
        {activeTab === 'pool' && <PoolTab />}
        {activeTab === 'historial' && <HistorialTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: Referencias
// ═══════════════════════════════════════════════════════════════

function ReferenciasTab() {
  const [collFilter, setCollFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');
  const [collections, setCollections] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const { references, loading } = useReferencesWithCodeStatus(collFilter || null);

  useEffect(() => {
    import('../lib/supabase').then(({ default: supabase }) => {
      supabase.from('collections').select('id, code, name').eq('active', true).order('code')
        .then(({ data }) => { if (data) setCollections(data); });
    });
  }, []);

  const filtered = references.filter(r => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match = String(r.referenceNumber).includes(s) ||
        r.name.toLowerCase().includes(s) ||
        r.codigoMD.toLowerCase().includes(s) ||
        r.codigoPT.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (statusFilter === 'ASIGNADO') return r.mdStatus === 'ASIGNADO' || r.ptStatus === 'ASIGNADO';
    if (statusFilter === 'PENDIENTE') return r.mdStatus !== 'ASIGNADO' || r.ptStatus !== 'ASIGNADO';
    return true;
  });

  const startEdit = (refId, codeType, currentVal) => {
    setEditingCell({ refId, codeType });
    setEditValue(currentVal);
  };

  const cancelEdit = () => setEditingCell(null);

  const saveEdit = async () => {
    if (!editingCell || !editValue.trim()) { cancelEdit(); return; }
    const { error } = await assignCode(editingCell.refId, editingCell.codeType, editValue.trim());
    if (!error) {
      setEditingCell(null);
      window.location.reload();
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleUnassign = async (refId, codeType) => {
    if (!window.confirm(`¿Liberar código ${codeType} de esta referencia? El código quedará DISPONIBLE en el pool.`)) return;
    const { error } = await unassignCode(refId, codeType);
    if (!error) window.location.reload();
    else alert('Error: ' + error.message);
  };

  const handleBulkDerive = async () => {
    if (!collFilter) { alert('Selecciona una colección primero'); return; }
    setBulkLoading(true);
    const { error, count } = await bulkDeriveCodes(parseInt(collFilter));
    setBulkLoading(false);
    if (error) setBulkMsg('Error: ' + error.message);
    else { setBulkMsg(`${count} códigos derivados exitosamente.`); window.location.reload(); }
  };

  const counts = {
    total: references.length,
    asignados: references.filter(r => r.mdStatus === 'ASIGNADO' && r.ptStatus === 'ASIGNADO').length,
    pendientes: references.filter(r => r.mdStatus !== 'ASIGNADO' || r.ptStatus !== 'ASIGNADO').length,
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 180 }}
            value={collFilter} onChange={e => setCollFilter(e.target.value)}>
            <option value="">Todas las colecciones</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>

          <select className="form-select" style={{ width: 150 }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos los estados</option>
            <option value="ASIGNADO">ASIGNADO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>

          <div style={{ position: 'relative' }}>
            <input type="text" className="form-input" style={{ width: 200, paddingLeft: 32 }}
              placeholder="Buscar referencia..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} />
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--gray-400)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
            {counts.total} refs · {counts.asignados} completas · {counts.pendientes} pendientes
          </span>
          {collFilter && (
            <button className="btn btn-secondary btn-sm" onClick={handleBulkDerive} disabled={bulkLoading}>
              <RotateCcw size={14} /> Derivar todo
            </button>
          )}
        </div>

        {bulkMsg && (
          <div style={{ width: '100%', padding: '6px 12px', fontSize: 12, borderRadius: 6, background: '#dcfce7', color: '#166534', marginTop: 8 }}>
            {bulkMsg}
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', padding: 24 }}>Cargando referencias...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Nombre</th>
                <th>Colección</th>
                <th style={{ width: 180 }}>MD</th>
                <th style={{ width: 180 }}>PT</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ref => (
                <tr key={ref.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{ref.referenceNumber}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ref.name}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{ref.collectionCode}</td>
                  <td>
                    <CodeCell
                      refId={ref.id}
                      codeType="MD"
                      code={ref.codigoMD}
                      status={ref.mdStatus}
                      editing={editingCell}
                      editValue={editValue}
                      onEdit={startEdit}
                      onCancel={cancelEdit}
                      onSave={saveEdit}
                      onUnassign={handleUnassign}
                      setEditValue={setEditValue}
                    />
                  </td>
                  <td>
                    <CodeCell
                      refId={ref.id}
                      codeType="PT"
                      code={ref.codigoPT}
                      status={ref.ptStatus}
                      editing={editingCell}
                      editValue={editValue}
                      onEdit={startEdit}
                      onCancel={cancelEdit}
                      onSave={saveEdit}
                      onUnassign={handleUnassign}
                      setEditValue={setEditValue}
                    />
                  </td>
                  <td>
                    <button className={styles.expandBtn} onClick={() => setExpanded(expanded === ref.id ? null : ref.id)}>
                      {expanded === ref.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>
                  Sin resultados
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CodeCell({ refId, codeType, code, status, editing, editValue, onEdit, onCancel, onSave, onUnassign, setEditValue }) {
  const isEditing = editing && editing.refId === refId && editing.codeType === codeType;
  const isAssigned = status === 'ASIGNADO';

  if (isEditing) {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          style={{ width: 120, padding: '4px 8px', fontSize: 12 }}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
          autoFocus
        />
        <button type="button" onClick={onSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-500)', padding: 0 }}>
          <Check size={16} />
        </button>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-400)', padding: 0 }}>
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <StatusBadge status={status} />
      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{code}</span>
      <button type="button"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0, opacity: 0.6 }}
        onClick={() => onEdit(refId, codeType, code)}
        title="Editar código">
        <Edit3 size={12} />
      </button>
      {isAssigned && (
        <button type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-400)', padding: 0, opacity: 0.5 }}
          onClick={() => onUnassign(refId, codeType)}
          title="Liberar código">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: Pool de Códigos
// ═══════════════════════════════════════════════════════════════

function PoolTab() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { codes, stats, loading } = useCodePool({
    codeType: typeFilter || undefined,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
    limit: 500,
  });

  const typeStats = { md: codes.filter(c => c.code_type === 'MD').length, pt: codes.filter(c => c.code_type === 'PT').length };

  return (
    <div>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total pool</span>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#3b82f6' }}>
          <span className={styles.statNum}>{stats.disponible}</span>
          <span className={styles.statLabel}>Disponibles</span>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#22c55e' }}>
          <span className={styles.statNum}>{stats.asignado}</span>
          <span className={styles.statLabel}>Asignados</span>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#a855f7' }}>
          <span className={styles.statNum}>{stats.reservado}</span>
          <span className={styles.statLabel}>Reservados</span>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#ef4444' }}>
          <span className={styles.statNum}>{stats.retirado}</span>
          <span className={styles.statLabel}>Retirados</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 120 }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">MD + PT</option>
            <option value="MD">Solo MD</option>
            <option value="PT">Solo PT</option>
          </select>
          <select className="form-select" style={{ width: 140 }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">DISPONIBLE</option>
            <option value="ASIGNADO">ASIGNADO</option>
            <option value="RESERVADO">RESERVADO</option>
            <option value="RETIRADO">RETIRADO</option>
          </select>
          <div style={{ position: 'relative' }}>
            <input type="text" className="form-input" style={{ width: 180, paddingLeft: 32 }}
              placeholder="Buscar código..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} />
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--gray-400)' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', padding: 24 }}>Cargando pool...</p>
      ) : (
        <div className={styles.tableWrapper} style={{ maxHeight: 'calc(100vh - 400px)' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Prefijo</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</td>
                  <td>
                    <span className={`code-badge code-${c.code_type === 'MD' ? 'md' : 'pt'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                      {c.code_type}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{c.prefix || '—'}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>
                  El pool está vacío. Los códigos se crean automáticamente al asignar o mediante la función generate_code_pool.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: Historial
// ═══════════════════════════════════════════════════════════════

function HistorialTab() {
  const [actionFilter, setActionFilter] = useState('');
  const { logs, loading } = useCodeLog({ action: actionFilter || undefined, limit: 200 });

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--gray-400)' }} />
          <select className="form-select" style={{ width: 160 }}
            value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">Todas las acciones</option>
            <option value="ASIGNAR">ASIGNAR</option>
            <option value="REASIGNAR">REASIGNAR</option>
            <option value="LIBERAR">LIBERAR</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', padding: 24 }}>Cargando historial...</p>
      ) : (
        <div className={styles.tableWrapper} style={{ maxHeight: 'calc(100vh - 350px)' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 130 }}>Fecha</th>
                <th style={{ width: 80 }}>Ref #</th>
                <th style={{ width: 50 }}>Tipo</th>
                <th style={{ width: 90 }}>Acción</th>
                <th>Código Anterior</th>
                <th>Código Nuevo</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {log.changed_at ? new Date(log.changed_at).toLocaleString() : '—'}
                  </td>
                  <td style={{ fontSize: 12 }}>{log.reference_id || '—'}</td>
                  <td>
                    <span className={`code-badge code-${log.code_type === 'MD' ? 'md' : 'pt'}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                      {log.code_type}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: log.action === 'ASIGNAR' ? '#166534' : log.action === 'REASIGNAR' ? '#92400e' : '#991b1b',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-400)' }}>
                    {log.old_code || '—'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                    {log.new_code || '—'}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{log.changed_by || 'sistema'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>
                  Sin registros en el historial
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
