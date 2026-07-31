import { useMemo, useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, AlertTriangle, CheckCircle, Clock, Package,
  Pause, Flame, BarChart2, ChevronRight, Activity, Scissors
} from 'lucide-react';
import { useDashboardData, subfaseToProgress, getFaseMacro } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';
import TemperatureBar from '../components/TemperatureBar';
import styles from './Dashboard.module.css';

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
      if (r.faseActual < 2 && a.resumen.enProceso > 10)
        alerts.push({ tipo: 'riesgo', msg: `${r.codigoMD} aún en fase inicial con colección activa` });
    });
  });
  return alerts;
}

// ── Cálculo global ──────────────────────────────────────────
function calcularMetricasGlobales(colecciones) {
  let totalRefs = 0, enProceso = 0, completadas = 0, pausadas = 0;
  let refsPorFase = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let alertas = [];

  (colecciones || []).forEach(col => {
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

  const progresoGlobal = totalRefs > 0 ? Math.round((completadas / totalRefs) * 100) : 0;

  return { totalRefs, enProceso, completadas, pausadas, refsPorFase, alertas, progresoGlobal };
}

// ── Sub-componentes ─────────────────────────────────────────
const KpiCard = React.memo (function KpiCard ({ titulo, valor, subtitulo, icono, color, bgColor }) {
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
});

const ColeccionRow = React.memo( function ColeccionRow({ col, navigate }) {
  const visibleYears = col.anios.filter(a => !a.isHidden);
  const latestYear = visibleYears.length > 0 ? visibleYears[0] : col.anios[0];
  if (!latestYear) return null;
  const progreso = calcularProgreso(latestYear);
  const { total, enProceso, pausadas, completadas } = latestYear.resumen;
  const refEjemplo = latestYear.referencias[0];
  const tempVar = refEjemplo ? getFaseMacro(refEjemplo.faseActual).tempVar : 'cold';
  const displayYear = latestYear.anio;

  return (
            <div className={styles.coleccionRow} onClick={() => navigate(`/colecciones/${col.season?.toLowerCase()}/${col.id}/${displayYear}`)}>
      <div className={styles.coleccionRowLeft}>
        <div className={styles.coleccionRowImg} style={{ borderColor: col.borderColor }}>
          {col.imagen
            ? <img src={col.imagen} alt={col.nombre} />
            : <div style={{ background: col.borderColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>{col.nombre.charAt(0)}</div>
          }
        </div>
        <div className="coleccion-row-info">
          <div className={styles.coleccionRowNombre}>{col.nombre} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>{displayYear}</span></div>
          <div style={{ width: 180, marginTop: 6 }}>
            <TemperatureBar subfase={refEjemplo?.faseActual || 1.1} showLabel={false} />
          </div>
        </div>
      </div>
      <div className={styles.coleccionRowStats}>
        <div className={styles.coleccionStat}><span style={{ fontWeight: 800, fontSize: 18 }}>{total}</span><span className={styles.coleccionStatLabel}>Total</span></div>
        <div className={styles.coleccionStat}><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--warning)' }}>{enProceso}</span><span className={styles.coleccionStatLabel}>En Proceso</span></div>
        <div className={styles.coleccionStat}><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--error)' }}>{pausadas}</span><span className={styles.coleccionStatLabel}>Pausadas</span></div>
        <div className={styles.coleccionStat}><span style={{ fontWeight: 800, fontSize: 18, color: 'var(--success)' }}>{completadas}</span><span className={styles.coleccionStatLabel}>Listas</span></div>
        <div className={styles.coleccionRowProgreso}>
          <div className={styles.coleccionProgresoBar}>
            <div className={styles.coleccionProgresoFill} style={{ width: `${progreso}%`, background: `var(--temp-${tempVar}-border)` }} />
          </div>
          <span className={styles.coleccionProgresoPct} style={{ color: `var(--temp-${tempVar}-text)` }}>{progreso}%</span>
        </div>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
    </div>
  );
});

const faseLabels = { 1: 'Concepto', 2: 'Diseño', 3: 'Costeo', 4: 'Industrializ.', 5: 'Producción', 6: 'Comercial' };
const faseTempVars = { 1: 'frost', 2: 'cold', 3: 'warm', 4: 'hot', 5: 'fire', 6: 'blaze' };


// ── Página principal del Dashboard ──────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { isTrazador } = useAuth();
  const { data, loading, error } = useDashboardData();
  const colecciones = data?.colecciones || [];

  const [trazadorStats, setTrazadorStats] = useState({ pendientes: 0, enProgreso: 0, completados: 0, conDiferencias: 0 });

  useEffect(() => {
    if (!isTrazador) return;
    let cancelled = false;
    async function load() {
      try {
        const { count: totalRefs } = await supabase.from('references').select('*', { count: 'exact', head: true }).eq('is_hidden', false);
        const { data: trazos } = await supabase.from('trazos').select('reference_id, fase').order('reference_id');
        const { data: comparativos } = await supabase.from('comparativo_trazos').select('reference_id');
        if (cancelled) return;

        const refsConCosteo = new Set(trazos.filter(t => t.fase === 'costeo').map(t => t.reference_id));
        const refsConContra = new Set(trazos.filter(t => t.fase === 'contramuestra').map(t => t.reference_id));

        let conDiferencias = 0;
        for (const c of comparativos) {
          const dims = ['veces', 'piezas', 'ancho', 'molderia', 'sesgo', 'ancho_sesgo', 'telas'];
          if (dims.some(d => c[`difiere_${d}`])) conDiferencias++;
        }

        setTrazadorStats({
          pendientes: totalRefs - refsConCosteo.size,
          enProgreso: refsConCosteo.size - refsConContra.size,
          completados: refsConContra.size,
          conDiferencias,
        });
      } catch (_) { /* silent */ }
    }
    load();
    return () => { cancelled = true; };
  }, [isTrazador]);

  const { totalRefs, enProceso, completadas, pausadas, refsPorFase, alertas, progresoGlobal } = useMemo(
    () => calcularMetricasGlobales(colecciones),
    [data]
  );

  const maxFase = Math.max(...Object.values(refsPorFase), 1);

  if (loading) return <div className="fade-in p-8 text-center text-gray-400">Cargando datos desde Supabase...</div>;
  if (error) return <div className="fade-in p-8 text-center text-red-500">Error al cargar datos: {error.message}</div>;

  return (
    <div className="fade-in">
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.titulo}>Dashboard de Colecciones</h2>
          <p className={styles.subtitulo}>Vision global del estado de produccion</p>
        </div>
        <div className={styles.fecha}>
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

      {/* Trazador KPIs */}
      {isTrazador && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scissors size={14} style={{ color: 'var(--success)' }} /> Panel del Trazador
            <Link to="/trazador" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--primary-600)', textDecoration: 'underline', fontWeight: 400 }}>Ir al panel completo →</Link>
          </h4>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <KpiCard titulo="Pendientes Trazo" valor={trazadorStats.pendientes} subtitulo="Sin trazo de costeo" icono={<Clock size={22} />} color="var(--warning-dark)" bgColor="var(--warning-light)" />
            <KpiCard titulo="En Progreso" valor={trazadorStats.enProgreso} subtitulo="Costeo OK, falta contramuestra" icono={<Activity size={22} />} color="var(--secondary-600)" bgColor="var(--secondary-100)" />
            <KpiCard titulo="Completados" valor={trazadorStats.completados} subtitulo="Ambos trazos registrados" icono={<CheckCircle size={22} />} color="var(--success-dark)" bgColor="var(--success-light)" />
            <KpiCard titulo="Con Diferencias" valor={trazadorStats.conDiferencias} subtitulo="Requieren revisión" icono={<AlertTriangle size={22} />} color={trazadorStats.conDiferencias > 0 ? 'var(--error-dark)' : 'var(--success-dark)'} bgColor={trazadorStats.conDiferencias > 0 ? 'var(--error-light)' : 'var(--success-light)'} />
          </div>
        </div>
      )}

      {/* Barra central: Progreso + Distribución por Fase */}
      <div className={styles.mid}>

        {/* Progreso Global */}
        <div className={`card ${styles.progresoCard}`}>
          <div className="card-header">
            <h4 className="card-title"><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Progreso Global</h4>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 56, fontWeight: 900, fontFamily: 'var(--font-display)', background: 'var(--gradient-temperature)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {progresoGlobal}%
            </span>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 0 }}>de referencias completadas</p>
          </div>
          <TemperatureBar subfase={progresoGlobal >= 98 ? 6.1 : progresoGlobal >= 89 ? 5.1 : progresoGlobal >= 65 ? 4.1 : progresoGlobal >= 42 ? 3.1 : progresoGlobal >= 16 ? 2.1 : 1.1} showLabel={true} />
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
          <div className={styles.faseChart}>
            {[1, 2, 3, 4, 5, 6].map(f => (
              <div key={f} className={styles.faseBarItem}>
                <div className={styles.faseBarLabel}>{faseLabels[f]}</div>
                <div className={styles.faseBarTrack}>
                  <div
                    className={styles.faseBarFill}
                    style={{
                      width: maxFase > 0 ? `${(refsPorFase[f] / maxFase) * 100}%` : '0%',
                      background: `var(--temp-${faseTempVars[f]}-border)`,
                    }}
                  />
                </div>
                <span className={styles.faseBarCount} style={{ color: `var(--temp-${faseTempVars[f]}-text)` }}>
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
        <div className={`card ${styles.alertasCard}`}>
          <div className="card-header">
            <h4 className="card-title" style={{ color: 'var(--error-dark)' }}>
              <AlertTriangle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Alertas y Puntos de Atención ({alertas.length})
            </h4>
          </div>
          <div className={styles.alertasList}>
            {alertas.map((a, i) => (
              <div key={i} className={`${styles.alertaItem} ${a.tipo === 'pausada' ? styles.alertaPausada : styles.alertaRiesgo}`}>
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
          <h4 className="card-title">Estado por Coleccion</h4>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Clic para explorar</span>
        </div>
        <div className={styles.coleccionesList}>
          {colecciones.map(col => (
            <ColeccionRow key={col.id} col={col} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
}
