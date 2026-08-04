import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Plus, Clock, CheckCircle2, FileSpreadsheet, Ruler, Play, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import supabase from '../lib/supabase';
import TrazoForm from '../components/TrazoForm';

const TIPOS_TELA_LABEL = {
  SOLIDO: 'Sólido', MOD_ARTE: 'Mod. Arte', UBI_TRAZO: 'Ubic. Trazo',
  CUERO: 'Cuero', ALL_OVER: 'All Over',
};

export default function TrazadorView() {
  const navigate = useNavigate();

  const [referencias, setReferencias] = useState([]);
  const [trazos, setTrazos] = useState([]);
  const [fabricsByRef, setFabricsByRef] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendiente');
  const [expandedRef, setExpandedRef] = useState(null);
  const [showTrazoForm, setShowTrazoForm] = useState(false);
  const [selectedRefForTrazo, setSelectedRefForTrazo] = useState(null);
  const [selectedFabricForTrazo, setSelectedFabricForTrazo] = useState(null);
  const [trazoToEdit, setTrazoToEdit] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: refs, error: refsErr } = await supabase
        .from('references')
        .select('id, reference_number, name, has_art_modification, has_trace_location, has_all_over, has_embroidery')
        .eq('is_hidden', false)
        .order('reference_number')
        .limit(200);

      if (refsErr) { console.error('Error loading references:', refsErr); setReferencias([]); setLoading(false); return; }

      const refIds = (refs || []).map(r => r.id);

      const { data: allTrazos, error: trazosErr } = await supabase
        .from('trazos')
        .select('*')
        .in('reference_id', refIds.length > 0 ? refIds : [-1])
        .order('created_at', { ascending: false });

      if (trazosErr) { console.error('Error loading trazos:', trazosErr); }

      const { data: allRefFabrics, error: fabErr } = await supabase
        .from('reference_fabrics')
        .select('id, reference_id, usage, width_cm, fabrics(code, description)')
        .in('reference_id', refIds.length > 0 ? refIds : [-1])
        .eq('active', true);

      if (fabErr) { console.error('Error loading fabrics:', fabErr); }

      const fbr = {};
      for (const rf of (allRefFabrics || [])) {
        if (!fbr[rf.reference_id]) fbr[rf.reference_id] = [];
        fbr[rf.reference_id].push({
          id: rf.id,
          usage: rf.usage || '-',
          code: rf.fabrics?.code || '-',
          description: rf.fabrics?.description || '-',
          width: rf.width_cm ? `${parseFloat(rf.width_cm).toFixed(2)}` : '-',
        });
      }

      setReferencias(refs || []);
      setTrazos(allTrazos || []);
      setFabricsByRef(fbr);
    } catch (e) {
      console.error('TrazadorView loadData error:', e);
    } finally {
      setLoading(false);
    }
  }

  const refsWithTrazos = useMemo(() => {
    return referencias.map(ref => {
      const refTrazos = trazos.filter(t => t.reference_id === ref.id);
      const costeo = refTrazos.filter(t => t.fase === 'costeo');
      const contramuestra = refTrazos.filter(t => t.fase === 'contramuestra');
      const tieneComparativo = costeo.length > 0 && contramuestra.length > 0;
      const completado = costeo.length > 0 && contramuestra.length > 0;
      const enProgreso = costeo.length > 0 && contramuestra.length === 0;

      let status = 'pendiente';
      if (completado) status = 'completado';
      else if (enProgreso) status = 'en-progreso';

      return { ...ref, trazos: refTrazos, costeo, contramuestra, tieneComparativo, status };
    });
  }, [referencias, trazos]);

  const filtered = useMemo(() => {
    if (filter === 'todos') return refsWithTrazos;
    return refsWithTrazos.filter(r => r.status === filter);
  }, [refsWithTrazos, filter]);

  const kpis = useMemo(() => {
    const total = refsWithTrazos.length;
    const pendientes = refsWithTrazos.filter(r => r.status === 'pendiente').length;
    const enProgreso = refsWithTrazos.filter(r => r.status === 'en-progreso').length;
    const completados = refsWithTrazos.filter(r => r.status === 'completado').length;
    return { total, pendientes, enProgreso, completados };
  }, [refsWithTrazos]);

  function handleOpenTrazoForm(ref, fabric, trazo) {
    setSelectedRefForTrazo(ref);
    setSelectedFabricForTrazo(fabric || null);
    setTrazoToEdit(trazo || null);
    setShowTrazoForm(true);
  }

  function handleTrazoSaved() {
    setShowTrazoForm(false);
    setTrazoToEdit(null);
    setSelectedFabricForTrazo(null);
    loadData();
  }

  function handleVerComparativo(ref) {
    navigate(`/trazador/comparativo/${ref.id}`);
  }

  function getTrazosForFabric(refTrazos, fabricId) {
    return refTrazos.filter(t => t.reference_fabric_id === fabricId);
  }

  const kpiCard = (label, value, color, Icon) => (
    <div className="kpi-stat-card" style={{ borderTopColor: color }}>
      <div className="kpi-stat-left">
        <span className="kpi-stat-label">{label}</span>
        <span className="kpi-stat-value" style={{ color }}>{value}</span>
      </div>
      <div className="kpi-stat-icon" style={{ background: `${color}20`, color }}><Icon size={20} /></div>
    </div>
  );

  if (loading) {
    return <div className="fade-in" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>;
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Scissors size={20} style={{ color: 'var(--success)' }} />
            Panel del Trazador
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>Gestión de trazos — Costeo y Contramuestras</p>
        </div>
      </div>

      <div className="kpi-stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {kpiCard('Total Refs', kpis.total, 'var(--primary-600)', FileSpreadsheet)}
        {kpiCard('Pendientes', kpis.pendientes, 'var(--warning)', Clock)}
        {kpiCard('En Progreso', kpis.enProgreso, 'var(--secondary-500)', Play)}
        {kpiCard('Completados', kpis.completados, 'var(--success)', CheckCircle2)}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'todos', label: 'Todas' },
          { key: 'pendiente', label: 'Pendientes' },
          { key: 'en-progreso', label: 'En Progreso' },
          { key: 'completado', label: 'Completadas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
          >{f.label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <div className="table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--gray-200)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, width: 30 }}></th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Ref. PT</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Nombre</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600 }}>Telas</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600 }}>Tipos</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-400)' }}>No hay referencias en este estado.</td></tr>
              ) : (
                filtered.map(ref => {
                  const isExpanded = expandedRef === ref.id;
                  const fabrics = fabricsByRef[ref.id] || [];

                  return (
                    <tr key={ref.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer', verticalAlign: 'top' }}
                        onClick={() => setExpandedRef(isExpanded ? null : ref.id)}>
                        {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--primary-600)' }} /> : <ChevronRight size={14} style={{ color: 'var(--gray-400)' }} />}
                      </td>
                      <td style={{ padding: '10px 16px', cursor: 'pointer', verticalAlign: 'top' }}
                        onClick={() => setExpandedRef(isExpanded ? null : ref.id)}>
                        <span className="code-badge code-pt" style={{ fontSize: 12, padding: '2px 8px' }}>{ref.reference_number || '-'}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 500, cursor: 'pointer', verticalAlign: 'top' }}
                        onClick={() => setExpandedRef(isExpanded ? null : ref.id)}>
                        {ref.name || '-'}
                        {fabrics.length > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: 10, color: 'var(--gray-600)' }}>
                            <Layers size={10} />{fabrics.length} tela{fabrics.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                        {fabrics.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {fabrics.slice(0, 3).map(f => (
                              <div key={f.id} style={{ fontSize: 10, color: 'var(--gray-500)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {f.usage}: {f.code}
                              </div>
                            ))}
                            {fabrics.length > 3 && <span style={{ fontSize: 9, color: 'var(--gray-400)' }}>+{fabrics.length - 3} más</span>}
                          </div>
                        ) : <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {ref.has_art_modification && <span className="badge badge-secondary" style={{ fontSize: 10 }}>Mod. Arte</span>}
                          {ref.has_trace_location && <span className="badge badge-warning" style={{ fontSize: 10 }}>Ubic. Trazo</span>}
                          {ref.has_all_over && <span className="badge" style={{ fontSize: 10, background: 'var(--primary-100)', color: 'var(--primary-700)' }}>All Over</span>}
                          {!ref.has_art_modification && !ref.has_trace_location && !ref.has_all_over && <span className="badge badge-success" style={{ fontSize: 10 }}>Sólida</span>}
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                        {ref.status === 'pendiente' && <span className="badge badge-warning" style={{ fontSize: 10 }}>Pendiente</span>}
                        {ref.status === 'en-progreso' && <span className="badge" style={{ fontSize: 10, background: 'var(--secondary-100)', color: 'var(--secondary-700)' }}>En Progreso</span>}
                        {ref.status === 'completado' && <span className="badge badge-success" style={{ fontSize: 10 }}>Completado</span>}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleOpenTrazoForm(ref, null, null)}
                            title="Nuevo trazo"
                          ><Plus size={12} /> Trazo</button>
                          {ref.tieneComparativo && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleVerComparativo(ref)}
                              title="Ver comparativo"
                            >Comparar</button>
                          )}
                        </div>
                      </td>
                      {/* Expanded fabric panel */}
                      {isExpanded && fabrics.length > 0 && (
                        <tr key={`exp-${ref.id}`} style={{ background: 'var(--gray-50)' }}>
                          <td colSpan="2" style={{ padding: 0 }}></td>
                          <td colSpan="5" style={{ padding: '0 16px 12px 16px' }}>
                            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-3)' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                    <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Uso</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Código</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Descripción</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Ancho</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Trazo Costeo</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Trazo Contra.</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase' }}>Acción</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fabrics.map(f => {
                                    const fabricTrazos = trazos.filter(t => t.reference_id === ref.id && t.reference_fabric_id === f.id);
                                    const fCosteo = fabricTrazos.filter(t => t.fase === 'costeo');
                                    const fContramuestra = fabricTrazos.filter(t => t.fase === 'contramuestra');

                                    return (
                                      <tr key={f.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                                          {f.usage}
                                          {(f.usage || '').toLowerCase().includes('sesgo') && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6, background: 'var(--secondary-100)', color: 'var(--secondary-700)', padding: '1px 5px', borderRadius: 'var(--radius-full)', fontSize: 9, fontWeight: 700 }}>
                                              SESGO
                                              {fabricTrazos.filter(t => t.ancho_sesgo).map(t => (
                                                <span key={t.id} style={{ color: 'var(--secondary-600)', fontWeight: 400 }}>
                                                  {t.ancho_sesgo}{t.consumo_lineal != null ? ` / ${t.consumo_lineal}m` : ''}
                                                </span>
                                              ))}
                                            </span>
                                          )}
                                        </td>
                                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11 }}>{f.code}</td>
                                        <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--gray-600)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {f.description}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{f.width}</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                          {fCosteo.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                              {fCosteo.map(t => (
                                                <button key={t.id} onClick={() => handleOpenTrazoForm(ref, f, t)}
                                                  style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '2px 8px', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                >
                                                  <Ruler size={10} />
                                                  {TIPOS_TELA_LABEL[t.tipo_tela] || t.tipo_tela}: {t.consumo_valor || '?'}m
                                                  {t.estado === 'cancelado' && <span style={{ fontSize: 8, background: 'var(--error-light)', color: 'var(--error-dark)', padding: '0 3px', borderRadius: 2, marginLeft: 2 }}>CANC</span>}
                                                </button>
                                              ))}
                                            </div>
                                          ) : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                          {fContramuestra.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                              {fContramuestra.map(t => (
                                                <button key={t.id} onClick={() => handleOpenTrazoForm(ref, f, t)}
                                                  style={{ background: 'var(--success-50)', color: 'var(--success-700)', border: '1px solid var(--success-200)', borderRadius: 'var(--radius-md)', padding: '2px 8px', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                >
                                                  <Ruler size={10} />
                                                  {TIPOS_TELA_LABEL[t.tipo_tela] || t.tipo_tela}: {t.consumo_valor || '?'}m
                                                  {t.estado === 'cancelado' && <span style={{ fontSize: 8, background: 'var(--error-light)', color: 'var(--error-dark)', padding: '0 3px', borderRadius: 2, marginLeft: 2 }}>CANC</span>}
                                                </button>
                                              ))}
                                            </div>
                                          ) : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                          <button className="btn btn-xs btn-primary"
                                            onClick={() => handleOpenTrazoForm(ref, f, null)}
                                            title="Nuevo trazo para esta tela"
                                            style={{ padding: '2px 8px', fontSize: 10 }}
                                          ><Plus size={10} /> Trazo</button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                      {isExpanded && fabrics.length === 0 && (
                        <tr key={`exp-empty-${ref.id}`} style={{ background: 'var(--gray-50)' }}>
                          <td colSpan="2" style={{ padding: 0 }}></td>
                          <td colSpan="5" style={{ padding: '10px 16px', color: 'var(--gray-400)', fontSize: 12 }}>
                            Sin telas asignadas. Usa el botón "Trazo" para crear uno a nivel referencia.
                          </td>
                        </tr>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showTrazoForm && (
        <TrazoForm
          referenceId={selectedRefForTrazo?.id}
          trazoToEdit={trazoToEdit}
          preselectedFabric={selectedFabricForTrazo}
          onSave={handleTrazoSaved}
          onCancel={() => { setShowTrazoForm(false); setTrazoToEdit(null); setSelectedFabricForTrazo(null); }}
        />
      )}
    </div>
  );
}
