import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader, Search, Palette, Link2 } from 'lucide-react';
import { useDashboardData, usePanelCreativo } from '../lib/api';

const PHASES = [
  { key: 'laboratorio', label: 'Laboratorio / Molderia' },
  { key: 'corte', label: 'Corte muestra' },
  { key: 'confeccion', label: 'Confeccion' },
  { key: 'insumos', label: 'Insumos bodega' },
  { key: 'telas', label: 'Telas confirmadas' },
  { key: 'consumos', label: 'Consumos creativos' },
  { key: 'talla', label: 'Insumos por talla' },
  { key: 'medicion', label: 'Medicion / Aprobacion' },
];

function PhaseBadge({ value, label }) {
  const style = value === 1
    ? { bg: '#dcfce7', color: '#166534' }
    : value === 0.5
      ? { bg: '#fef3c7', color: '#92400e' }
      : { bg: '#f1f5f9', color: '#94a3b8' };
  const Icon = value === 1 ? CheckCircle : value === 0.5 ? Loader : Circle;
  return (
    <span
      title={label || 'Sin avance'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: style.bg, color: style.color, whiteSpace: 'nowrap' }}
    >
      <Icon size={12} />{label || '—'}
    </span>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: 'var(--gray-200)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--success)' : 'var(--primary)', borderRadius: 999, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

function derivePhases(agg) {
  const empty = { values: { laboratorio: 0, corte: 0, confeccion: 0, insumos: 0, telas: 0, consumos: 0, talla: 0, medicion: 0 }, labels: {}, pct: 0 };
  if (!agg) return empty;

  const labs = agg.laboratorios || [];
  const labLatest = labs.length ? labs.reduce((a, b) => (a.id > b.id ? a : b)) : null;

  const cuts = agg.cuts || [];
  const lastCut = cuts.length ? cuts[0] : null;

  const sewings = agg.sewings || [];
  const lastSew = sewings.length ? sewings[0] : null;

  const reqs = agg.supplyRequests || [];
  const entregados = reqs.filter(r => r.status === 'ENTREGADO').length;
  const solicitados = reqs.filter(r => r.status === 'SOLICITADO').length;

  const mediciones = agg.mediciones || [];
  const lastMed = mediciones.length ? mediciones[0] : null;

  const v = {};
  const l = {};

  v.laboratorio = !labLatest ? 0 : (labLatest.estado === 'APROBADO' ? 1 : 0.5);
  l.laboratorio = !labLatest ? 'Sin laboratorio' : `${labLatest.estado.replace(/_/g, ' ')}${labLatest.integrado_molderia ? ' + molderia' : ''}`;

  v.corte = cuts.length > 0 ? 1 : 0;
  l.corte = lastCut?.cut_date ? `Corte: ${lastCut.cut_date}` : 'Sin corte';

  v.confeccion = sewings.some(s => s.status === 'TERMINADO') ? 1 : (sewings.length > 0 ? 0.5 : 0);
  l.confeccion = lastSew ? `Confeccion: ${(lastSew.status || 'PENDIENTE').replace(/_/g, ' ')}` : 'Sin confeccion';

  v.insumos = entregados > 0 ? 1 : (solicitados > 0 ? 0.5 : 0);
  l.insumos = `Solicitado ${solicitados} · Entregado ${entregados}`;

  const total = agg.fabricsTotal || 0;
  const usadas = agg.fabricsUsadas || 0;
  v.telas = total === 0 ? 0 : (usadas >= total ? 1 : (usadas > 0 ? 0.5 : 0));
  l.telas = total === 0 ? 'Sin telas' : `${usadas}/${total} telas usadas`;

  v.consumos = agg.consumosCreativo > 0 ? 1 : 0;
  l.consumos = agg.consumosCreativo > 0 ? 'Consumos ingresados' : 'Sin consumos creativos';

  v.talla = agg.suppliesTalla > 0 ? 1 : 0;
  l.talla = agg.suppliesTalla > 0 ? 'Insumos por talla' : 'Sin insumos por talla';

  v.medicion = !lastMed ? 0 : (lastMed.resultado === 'APROBADA' ? 1 : 0.5);
  l.medicion = lastMed ? `${lastMed.resultado} · ${lastMed.fecha || ''}` : 'Sin medicion';

  const keys = Object.keys(v);
  const pct = Math.round((keys.reduce((acc, k) => acc + v[k], 0) / keys.length) * 100);

  return { values: v, labels: l, pct };
}

export default function PanelCreativo() {
  const navigate = useNavigate();
  const { data: dash, loading: dashLoading } = useDashboardData();
  const colecciones = dash?.colecciones || [];

  const [colId, setColId] = useState('');
  const [anioSel, setAnioSel] = useState('');
  const [search, setSearch] = useState('');

  const coleccion = colecciones.find(c => c.id === colId) || colecciones[0] || null;
  const anios = coleccion?.anios || [];
  const anioObj = anios.find(a => a.anio === parseInt(anioSel)) || anios[0] || null;

  const refs = useMemo(() => {
    if (!anioObj) return [];
    const q = search.trim().toLowerCase();
    return anioObj.referencias.filter(r => {
      if (q && !r.id.toLowerCase().includes(q) && !(r.nombre || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [anioObj, search]);

  const refIds = useMemo(() => refs.map(r => r.dbId), [refs]);
  const { data: panel, loading: panelLoading } = usePanelCreativo(refIds);

  const rows = useMemo(() => refs.map(r => ({
    ref: r,
    derived: derivePhases(panel?.[r.dbId]),
  })), [refs, panel]);

  const stats = useMemo(() => {
    const base = { total: refs.length, corte: 0, telasOk: 0, aprobadas: 0, completo: 0 };
    rows.forEach(({ derived }) => {
      if (derived.values.corte === 1) base.corte += 1;
      if (derived.values.telas === 1) base.telasOk += 1;
      if (derived.values.medicion === 1) base.aprobadas += 1;
      if (derived.pct >= 100) base.completo += 1;
    });
    return base;
  }, [rows, refs.length]);

  if (dashLoading) return <p style={{ color: 'var(--gray-400)' }}>Cargando portafolio...</p>;

  const goRef = (col, a, ref) => {
    const season = (col.season || col.code || '').toLowerCase();
    navigate(`/colecciones/${season}/${col.id}/${a.anio}/${ref.id}`);
  };

  const selectStyle = { padding: '6px 10px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 13, background: 'var(--white)', color: 'var(--gray-800)' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Palette size={22} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--gray-800)' }}>Panel del Creativo</h2>
      </div>
      <p style={{ margin: '0 0 20px 0', color: 'var(--gray-500)', fontSize: 13 }}>
        Hoja de vida de la referencia a traves de las fases del creativo: laboratorio, corte, confeccion, insumos, consumos y medicion.
      </p>

      {colecciones.length === 0 ? (
        <p style={{ color: 'var(--gray-400)' }}>No hay colecciones activas.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <select className="form-select" style={selectStyle} value={coleccion?.id || ''} onChange={(e) => { setColId(e.target.value); setAnioSel(''); }}>
              {colecciones.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <select className="form-select" style={selectStyle} value={anioObj?.anio || ''} onChange={(e) => setAnioSel(e.target.value)}>
              {anios.map(a => <option key={a.anio} value={a.anio}>Año {a.anio}</option>)}
            </select>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 32 }}
                placeholder="Buscar por referencia o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Referencias', value: stats.total, color: 'var(--primary)' },
              { label: 'Con corte', value: stats.corte, color: 'var(--success)' },
              { label: 'Telas confirmadas', value: stats.telasOk, color: 'var(--info)' },
              { label: 'Aprobadas (medicion)', value: stats.aprobadas, color: 'var(--warning)' },
              { label: 'Al 100%', value: stats.completo, color: 'var(--error)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: 14, borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {panelLoading ? (
            <p style={{ color: 'var(--gray-400)' }}>Calculando avance de fases...</p>
          ) : refs.length === 0 ? (
            <p style={{ color: 'var(--gray-400)' }}>No hay referencias que coincidan.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Nombre</th>
                    {PHASES.map(p => (
                      <th key={p.key} title={p.label}>{p.label.split(' ')[0]}<span style={{ fontSize: 10, color: 'var(--gray-400)' }}>…</span></th>
                    ))}
                    <th>Progreso</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ ref, derived }) => (
                    <tr key={ref.id} style={{ cursor: 'pointer' }} onClick={() => goRef(coleccion, anioObj, ref)}>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{ref.id}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-700)' }}>{ref.nombre}</td>
                      {PHASES.map(p => (
                        <td key={p.key}>
                          <PhaseBadge value={derived.values[p.key]} label={derived.labels[p.key]} />
                        </td>
                      ))}
                      <td style={{ minWidth: 140 }}><ProgressBar pct={derived.pct} /></td>
                      <td><Link2 size={14} color="var(--gray-400)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}