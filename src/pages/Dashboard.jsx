import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, AlertTriangle, CheckCircle, Clock, Package,
  Pause, Flame, BarChart2, ChevronRight, Activity
} from 'lucide-react';
import { colecciones, subfaseToProgress, getFaseMacro } from '../data/colecciones';
import TemperatureBar from '../components/TemperatureBar';

// ── Helpers de cálculo ──────────────────────────────────────
function calcularProgreso(anioData) {
  const refs = anioData.referencias;
  if (!refs || refs.length === 0) return 0;
  const total = anioData.resumen.total;
  const completadas = anioData.resumen.completadas;
  const pausadas = anioData.resumen.pausadas;
  // Peso: completadas=100%, en proceso= promedio de sus avances, pausadas=0
  const enProceso = anioData.resumen.enProceso;
  const progresoRefs = refs.reduce((acc, r) => acc + (subfaseToProgress[r.faseActual] || 0), 0);
  const progresoEnProceso = refs.length > 0 ? progresoRefs / refs.length : 0;
  // Ponderado global
  const pct = Math.round(
    ((completadas * 100) + (enProceso * progresoEnProceso) + (pausadas * 0)) / total
  );
  return Math.min(pct, 100);
}

function getAlerts(coleccion) {
  const alerts = [];
  coleccion.anios.forEach(a => {
    if (a.resumen.pausadas > 0)
      alerts.push({ tipo: 'pausada', msg: `${a.resumen.pausadas} ref(s) pausadas en ${coleccion.nombre} ${a.anio}` });
    a.referencias.forEach(r => {
      if (r.faseActual <= 1.2 && a.resumen.enProceso > 10)
        alerts.push({ tipo: 'riesgo', msg: `${r.codigoMD} aún en fase inicial con colección activa` });
    });
  });
  return alerts;
}

// ── Cálculo global ──────────────────────────────────────────
function calcularMetricasGlobales() {
  let totalRefs = 0, enProceso = 0, completadas = 0, pausadas = 0;
  let refsPorFase = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let alertas = [];

  colecciones.forEach(col => {
    col.anios.forEach(a => {
      totalRefs += a.resumen.total;
      enProceso += a.resumen.enProceso;
      completadas += a.resumen.completadas;
      pausadas += a.resumen.pausadas;
      a.referencias.forEach(r => {
        const fm = getFaseMacro(r.faseActual);
        refsPorFase[fm.fase]++;
      });
      alertas = [...alertas, ...getAlerts(col)];
    });
  });

  const progresoGlobal = Math.round((completadas / totalRefs) * 100);

  return { totalRefs, enProceso, completadas, pausadas, refsPorFase, alertas, progresoGlobal };
}

// ── Sub-componentes ─────────────────────────────────────────
function KpiCard({ titulo, valor, subtitulo, icono, color, bgColor }) {
  return (
    <div className="kpi-card" style={{ borderTopColor: color }}>
      <div className="kpi-card-top">
        <div>
          <div className="kpi-titulo">{titulo}</div>
          <div className="kpi-valor" style={{ color }}>{valor}</div>
          {subtitulo && <div className="kpi-subtitulo">{subtitulo}</div>}
        </div>
        <div className="kpi-icono" style={{ background: bgColor, color }}>
          {icono}
        </div>
      </div>
    </div>
  );
}

function ColeccionRow({ col, navigate }) {
  const anio2026 = col.anios.find(a => a.anio === 2026);
  if (!anio2026) return null;
  const progreso = calcularProgreso(anio2026);
  const { total, enProceso, pausadas, completadas } = anio2026.resumen;
  const refEjemplo = anio2026.referencias[0];
  const tempVar = refEjemplo ? getFaseMacro(refEjemplo.faseActual).tempVar : 'cold';

  return (
    <div className="coleccion-row" onClick={() => navigate(`/colecciones/${col.id}/2026`)}>
      <div className="coleccion-row-left">
        <div className="coleccion-row-img" style={{ borderColor: col.borderColor }}>
          {col.imagen
            ? <img src={col.imagen} alt={col.nombre} />
            : <div style={{ background: col.borderColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>{col.nombre.charAt(0)}</div>
          }
        </div>
        <div className="coleccion-row-info">
          <div className="coleccion-row-nombre">{col.nombre} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>2026</span></div>
          <div style={{ width: 180, marginTop: 6 }}>
            <TemperatureBar subfase={refEjemplo?.faseActual || 1.1} showLabel={false} />
          </div>
        </div>
      </div>
      <div className="coleccion-row-stats">
        <div className="coleccion-stat"><span style={{ fontWeight: 800, fontSize: 18 }}>{total}</span><span className="coleccion-stat-label">Total</span></div>
        <div className="coleccion-stat"><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--warning)' }}>{enProceso}</span><span className="coleccion-stat-label">En Proceso</span></div>
        <div className="coleccion-stat"><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--error)' }}>{pausadas}</span><span className="coleccion-stat-label">Pausadas</span></div>
        <div className="coleccion-stat"><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--success)' }}>{completadas}</span><span className="coleccion-stat-label">Listas</span></div>
        <div className="coleccion-row-progreso">
          <div className="coleccion-progreso-bar">
            <div className="coleccion-progreso-fill" style={{ width: `${progreso}%`, background: `var(--temp-${tempVar}-border)` }} />
          </div>
          <span className="coleccion-progreso-pct" style={{ color: `var(--temp-${tempVar}-text)` }}>{progreso}%</span>
        </div>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
    </div>
  );
}

// ── Página principal del Dashboard ──────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { totalRefs, enProceso, completadas, pausadas, refsPorFase, alertas, progresoGlobal } = calcularMetricasGlobales();

  const faseLabels = { 1: 'Ideación', 2: 'Laboratorio', 3: 'Validación', 4: 'Industrializ.' };
  const faseTempVars = { 1: 'cold', 2: 'warm', 3: 'hot', 4: 'fire' };
  const maxFase = Math.max(...Object.values(refsPorFase));

  return (
    <div className="fade-in">
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-titulo">Dashboard de Colecciones</h2>
          <p className="dashboard-subtitulo">Visión global del estado de producción · Temporada 2026</p>
        </div>
        <div className="dashboard-fecha">
          <Activity size={14} />
          Actualizado en tiempo real
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="kpi-grid">
        <KpiCard
          titulo="Referencias Totales"
          valor={totalRefs}
          subtitulo="En todas las colecciones activas"
          icono={<Package size={22} />}
          color="var(--primary-600)"
          bgColor="var(--primary-100)"
        />
        <KpiCard
          titulo="En Proceso"
          valor={enProceso}
          subtitulo={`${Math.round((enProceso/totalRefs)*100)}% del total activo`}
          icono={<Clock size={22} />}
          color="var(--warning-dark)"
          bgColor="var(--warning-light)"
        />
        <KpiCard
          titulo="Completadas / Listas"
          valor={completadas}
          subtitulo={`${progresoGlobal}% avance global`}
          icono={<CheckCircle size={22} />}
          color="var(--success-dark)"
          bgColor="var(--success-light)"
        />
        <KpiCard
          titulo="Pausadas / Bloqueadas"
          valor={pausadas}
          subtitulo={pausadas > 0 ? '⚠ Requieren atención' : 'Sin bloqueos'}
          icono={<Pause size={22} />}
          color={pausadas > 0 ? 'var(--error-dark)' : 'var(--success-dark)'}
          bgColor={pausadas > 0 ? 'var(--error-light)' : 'var(--success-light)'}
        />
      </div>

      {/* Barra central: Progreso + Distribución por Fase */}
      <div className="dashboard-mid">

        {/* Progreso Global */}
        <div className="card dashboard-progreso-card">
          <div className="card-header">
            <h4 className="card-title"><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Progreso Global</h4>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 56, fontWeight: 900, fontFamily: 'var(--font-display)', background: 'var(--gradient-temperature)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {progresoGlobal}%
            </span>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 0 }}>de referencias completadas</p>
          </div>
          <TemperatureBar subfase={progresoGlobal >= 96 ? 4.3 : progresoGlobal >= 65 ? 3.1 : progresoGlobal >= 28 ? 2.1 : 1.1} showLabel={true} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: 'var(--gray-500)' }}>
            <span>🔵 Inicio</span>
            <span>🔴 Finalización</span>
          </div>
        </div>

        {/* Distribución por Fase */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title"><BarChart2 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Distribución por Fase</h4>
          </div>
          <div className="fase-chart">
            {[1, 2, 3, 4].map(f => (
              <div key={f} className="fase-bar-item">
                <div className="fase-bar-label">{faseLabels[f]}</div>
                <div className="fase-bar-track">
                  <div
                    className="fase-bar-fill"
                    style={{
                      width: maxFase > 0 ? `${(refsPorFase[f] / maxFase) * 100}%` : '0%',
                      background: `var(--temp-${faseTempVars[f]}-border)`,
                    }}
                  />
                </div>
                <span className="fase-bar-count" style={{ color: `var(--temp-${faseTempVars[f]}-text)` }}>
                  {refsPorFase[f]}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 12, marginBottom: 0, textAlign: 'center' }}>
            Referencias activas distribuidas por fase macro
          </p>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="card dashboard-alertas">
          <div className="card-header">
            <h4 className="card-title" style={{ color: 'var(--error-dark)' }}>
              <AlertTriangle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Alertas y Puntos de Atención ({alertas.length})
            </h4>
          </div>
          <div className="alertas-list">
            {alertas.map((a, i) => (
              <div key={i} className={`alerta-item alerta-${a.tipo}`}>
                {a.tipo === 'pausada' ? <Pause size={14} /> : <Flame size={14} />}
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado por Colección */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Estado por Colección · 2026</h4>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Clic para explorar</span>
        </div>
        <div className="colecciones-list">
          {colecciones.map(col => (
            <ColeccionRow key={col.id} col={col} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
}
