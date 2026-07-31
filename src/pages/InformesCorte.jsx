import { useState, useEffect, useMemo } from 'react';
import { Download, ChevronDown, ChevronRight } from 'lucide-react';
import supabase from '../lib/supabase';

const TYPE_LABELS = {
  muestra: 'Muestra', contramuestra: 'Contramuestra', pieza: 'Pieza',
  laboratorio: 'Laboratorio', forro: 'Forro', pedido_especial: 'Pedido Especial', sesgo: 'Sesgo',
};

const FABRIC_LABELS = {
  solido: 'Solido', mod_arte: 'Mod. Arte', ubic_trazo: 'Ubic. Trazo', cuero: 'Cuero', all_over: 'All Over',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function exportCSV(groups, expandedRows, allItemsMap) {
  const lines = [];
  lines.push('RF,COLECCION,TIPO,MANEJO,SOLICITANTE,CORTADORES,FECHA RECIBIDO,FECHA ENTREGA,ESTADO,OBSERVACIONES');

  groups.forEach(g => {
    const detailIds = expandedRows[g.csvRef] || [];
    if (detailIds.length > 0) {
      detailIds.forEach(id => {
        const item = allItemsMap[id];
        if (!item) return;
        lines.push([
          g.csvRef,
          item.collection_raw || '—',
          TYPE_LABELS[item.type] || item.type,
          FABRIC_LABELS[item.fabric_handling] || item.fabric_handling || '—',
          item.requester_name || '',
          (item.cortador_names || []).join(', '),
          item.fecha_recepcion ? formatDate(item.fecha_recepcion) : '',
          item.fecha_entrega ? formatDate(item.fecha_entrega) : '',
          item.status || '',
          item.observations || '',
        ].map(v => `"${v}"`).join(','));
      });
    }
  });

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'informe_corte.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function InformesCorte() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterCollection, setFilterCollection] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const [uniqueCollections, setUniqueCollections] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: itemsData } = await supabase
        .from('cut_requests')
        .select('*')
        .eq('source', 'csv')
        .order('fecha_recepcion', { ascending: false });

      setItems(itemsData || []);

      const rawCols = [...new Set((itemsData || []).map(i => i.collection_raw).filter(Boolean))].sort();
      setUniqueCollections(rawCols);
      setLoading(false);
    }
    load();
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filterCollection) {
      result = result.filter(i => i.collection_raw === filterCollection);
    }
    if (filterDateFrom) {
      const d = new Date(filterDateFrom);
      result = result.filter(i => i.fecha_recepcion && new Date(i.fecha_recepcion) >= d);
    }
    if (filterDateTo) {
      const d = new Date(filterDateTo);
      d.setHours(23, 59, 59);
      result = result.filter(i => i.fecha_recepcion && new Date(i.fecha_recepcion) <= d);
    }
    if (filterSearch) {
      const s = filterSearch.toLowerCase();
      result = result.filter(i => {
        const csvRef = String(i.reference_number_csv || '');
        return csvRef.includes(s);
      });
    }
    return result;
  }, [items, filterCollection, filterDateFrom, filterDateTo, filterSearch]);

  const groups = useMemo(() => {
    const map = {};
    filteredItems.forEach(item => {
      const csvRef = String(item.reference_number_csv || '');
      if (!csvRef) return;
      if (!map[csvRef]) {
        map[csvRef] = {
          csvRef,
          collectionRaw: item.collection_raw || '',
          count: 0,
          types: {},
          lastDate: null,
          ids: [],
        };
      }
      map[csvRef].count++;
      const typeLabel = TYPE_LABELS[item.type] || item.type;
      map[csvRef].types[typeLabel] = (map[csvRef].types[typeLabel] || 0) + 1;
      map[csvRef].ids.push(item.id);
      if (!map[csvRef].lastDate || item.fecha_recepcion > map[csvRef].lastDate) {
        map[csvRef].lastDate = item.fecha_recepcion;
      }
    });
    return Object.values(map).sort((a, b) => parseInt(a.csvRef) - parseInt(b.csvRef));
  }, [filteredItems]);

  const toggleExpand = (csvRef) => {
    setExpandedRows(prev => ({
      ...prev,
      [csvRef]: prev[csvRef] ? null : groups.find(g => g.csvRef === csvRef)?.ids || [],
    }));
  };

  if (loading) return <div className="fade-in p-8 text-center text-gray-400">Cargando informes...</div>;

  const allItemsMap = {};
  items.forEach(i => { allItemsMap[i.id] = i; });

  return (
    <div className="fade-in" style={{ maxWidth: 1100 }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informes de Corte</h2>
          <p className="text-gray-500 text-sm">
            {filteredItems.length} solicitudes · {groups.length} referencias unicas
          </p>
        </div>
        <button className="btn btn-secondary" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}
          onClick={() => exportCSV(groups, expandedRows, allItemsMap)}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11 }}>Coleccion</label>
          <select className="form-select" value={filterCollection}
            onChange={e => setFilterCollection(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">Todas</option>
            {uniqueCollections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11 }}>Desde</label>
          <input type="date" className="form-input" value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)} style={{ width: 140 }} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11 }}>Hasta</label>
          <input type="date" className="form-input" value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)} style={{ width: 140 }} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
          <label className="form-label" style={{ fontSize: 11 }}>RF (numero)</label>
          <input type="text" className="form-input" placeholder="10, 15, 146..."
            value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
        </div>
      </div>

      {/* Tabla agrupada */}
      <div className="table-container">
        <table className="table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th style={{ width: 60 }}>RF</th>
              <th>Coleccion</th>
              <th style={{ width: 110 }}>Veces Cortado</th>
              <th>Tipos</th>
              <th style={{ width: 110 }}>Ultimo Corte</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>
                Sin datos con los filtros actuales
              </td></tr>
            )}
            {groups.map(g => {
              const isExpanded = !!expandedRows[g.csvRef];
              const detailItems = (expandedRows[g.csvRef] || [])
                .map(id => allItemsMap[id])
                .filter(Boolean)
                .sort((a, b) => new Date(b.fecha_recepcion || 0) - new Date(a.fecha_recepcion || 0));
              return (
                <>
                  <tr key={g.csvRef} onClick={() => toggleExpand(g.csvRef)}
                    style={{ cursor: 'pointer', background: isExpanded ? 'var(--primary-50)' : undefined }}>
                    <td>{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                    <td style={{ fontWeight: 700 }}>{g.csvRef}</td>
                    <td>{g.collectionRaw}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{g.count}</td>
                    <td>
                      {Object.entries(g.types).map(([t, c]) => (
                        <span key={t} style={{ marginRight: 8, fontSize: 11 }}>
                          {t}({c})
                        </span>
                      ))}
                    </td>
                    <td>{formatDate(g.lastDate)}</td>
                  </tr>
                  {isExpanded && detailItems.map(item => (
                    <tr key={`d-${item.id}`} style={{ background: 'var(--gray-50)', fontSize: 12 }}>
                      <td></td>
                      <td colSpan={2}>
                        <span style={{ color: 'var(--gray-600)' }}>{TYPE_LABELS[item.type] || item.type}</span>
                        {item.fabric_handling && (
                          <span style={{ marginLeft: 8, color: 'var(--gray-400)', fontSize: 11 }}>
                            ({FABRIC_LABELS[item.fabric_handling] || item.fabric_handling})
                          </span>
                        )}
                      </td>
                      <td>{item.requester_name || '—'}</td>
                      <td>{(item.cortador_names || []).join(', ') || '—'}</td>
                      <td>{formatDate(item.fecha_recepcion)}</td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
