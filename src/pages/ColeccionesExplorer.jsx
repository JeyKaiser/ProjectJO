import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Clock, User, Tag, EyeOff } from 'lucide-react';
import { useDashboardData, getFaseMacro } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TemperatureBar from '../components/TemperatureBar';
import styles from './ColeccionesExplorer.module.css';

const SEASON_COLORS = {
  WS: '#EAB308',
  RS: '#EC4899',
  SS: '#10B981',
  SV: '#F97316',
  PF: '#8B5CF6',
  FW: '#6366F1',
};

function groupNameFromCode(code) {
  const map = { WS: 'WINTER SUN', RS: 'RESORT RTW', SS: 'SPRING SUMMER', SV: 'SUMMER VACATION', PF: 'PREFALL RTW', FW: 'FALL WINTER' };
  return map[code] || code;
}

export default function ColeccionesExplorer() {
  const { seasonCode, coleccionId, anio } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data, loading, error } = useDashboardData();
  const colecciones = data?.colecciones || [];
  const groups = data?.groups || [];

  const upperSeason = seasonCode?.toUpperCase();
  const coleccionActual = coleccionId ? colecciones.find(c => c.id === coleccionId) : null;
  const anioActual = coleccionActual && anio ? coleccionActual.anios.find(a => a.anio === parseInt(anio)) : null;

  useEffect(() => {
    if (!seasonCode || !data || groups.length === 0 || colecciones.length === 0) return;
    const isSeason = groups.some(g => g.code.toLowerCase() === seasonCode.toLowerCase());
    if (isSeason) return;
    const oldCol = colecciones.find(c => c.id === seasonCode);
    if (oldCol) {
      const sc = oldCol.season?.toLowerCase() || 'ws';
      const path = anio ? `/colecciones/${sc}/${oldCol.id}/${anio}` : `/colecciones/${sc}/${oldCol.id}`;
      navigate(path, { replace: true });
    }
  }, [seasonCode, data, groups, colecciones, anio, navigate]);

  if (loading) return <div className="fade-in p-8 text-center text-gray-400">Cargando colecciones...</div>;
  if (error) return <div className="fade-in p-8 text-center text-red-500">Error: {error.message}</div>;

  const filteredForSeason = upperSeason ? colecciones.filter(c => c.season === upperSeason || c.code === upperSeason) : [];
  const seasonName = upperSeason ? groupNameFromCode(upperSeason) : '';

  // ── NIVEL 3: Referencias de una colección+año ──
  if (coleccionActual && anioActual) {
    const visibleRefs = isAdmin ? anioActual.referencias : anioActual.referencias.filter(r => !r.isHidden);
    const sc = upperSeason || coleccionActual.season?.toLowerCase() || 'ws';

    return (
      <div className="fade-in">
        <nav className={styles.breadcrumb}>
          <Link to="/colecciones" className={styles.breadcrumbLink}>Colecciones</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <Link to={`/colecciones/${sc}`} className={styles.breadcrumbLink}>{seasonName || groupNameFromCode(coleccionActual.season || 'WS')}</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{anioActual.anio}</span>
        </nav>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {coleccionActual.nombre} {anioActual.anio}
              {anioActual.isHidden && isAdmin && (
                <span style={{ marginLeft: 10, background: 'var(--gray-200)', color: 'var(--gray-500)', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, verticalAlign: 'middle' }}>
                  <EyeOff size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} /> Año oculto
                </span>
              )}
            </h2>
            <p className="text-gray-500 text-sm">{anioActual.resumen.total} referencias · {anioActual.resumen.enProceso} en proceso</p>
          </div>
        </div>

        <div className={styles.referenciasGrid}>
          {visibleRefs.map((ref) => {
            const faseMacro = getFaseMacro(ref.faseActual);
            return (
              <div
                key={ref.id}
                className={styles.referenciaCard}
                style={{ borderTopColor: `var(--temp-${faseMacro.tempVar}-border)`, cursor: 'pointer', opacity: ref.isHidden ? 0.6 : 1 }}
                onClick={() => navigate(`/colecciones/${sc}/${coleccionActual.id}/${anioActual.anio}/${ref.id}`)}
              >
                <TemperatureBar subfase={ref.faseActual} />
                {ref.imagen && (
                  <div className={styles.referenciaCardImagen}>
                    <img src={ref.imagen} alt={ref.nombre} />
                  </div>
                )}
                <div className={styles.referenciaCardHeader}>
                  <div className="referencia-codes">
                    <span className="code-badge code-md">{ref.codigoMD}</span>
                    <span className="code-badge code-pt">{ref.codigoPT}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {ref.isHidden && <EyeOff size={12} style={{ color: 'var(--gray-400)' }} />}
                    <span className={styles.referenciaClasificacion}>{ref.clasificacion}</span>
                  </div>
                </div>
                <h4 className={styles.referenciaNombre}>{ref.nombre}</h4>
                <p className={styles.referenciaTipo}>{ref.tipoPrenda} · {ref.color}</p>
                <div className={styles.referenciaFase} style={{ background: `var(--temp-${faseMacro.tempVar})`, borderColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
                  <div className={styles.referenciaFaseLabel}>
                    <span className={styles.referenciaFaseNumber} style={{ color: `var(--temp-${faseMacro.tempVar}-text)` }}>{ref.faseActual}</span>
                    <span className={styles.referenciaFaseName}>{ref.subfaseNombre}</span>
                  </div>
                </div>
                <div className={styles.referenciaFooter}>
                  <div className={styles.referenciaFooterItem}><User size={12} /><span>{ref.responsable}</span></div>
                  <div className={styles.referenciaFooterItem}><Clock size={12} /><span>{ref.tiempoFase}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── NIVEL 2: Años de colecciones en una temporada ──
  if (upperSeason) {
    const seasonCollections = filteredForSeason;
    const allYears = [];
    const seen = new Set();
    seasonCollections.forEach(col => {
      col.anios.forEach(a => {
        const key = `${col.id}-${a.anio}`;
        if (!seen.has(key)) {
          seen.add(key);
          allYears.push({ ...a, collectionId: col.id, collectionNombre: col.nombre, collectionBorder: col.borderColor, collectionSeason: col.season?.toLowerCase() || upperSeason.toLowerCase() });
        }
      });
    });

    const visibleYears = isAdmin ? allYears : allYears.filter(a => !a.isHidden);

    return (
      <div className="fade-in">
        <nav className={styles.breadcrumb}>
          <Link to="/colecciones" className={styles.breadcrumbLink}>Colecciones</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{seasonName}</span>
        </nav>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{seasonName}</h2>
          <p className="text-gray-500 text-sm">{visibleYears.length} años disponibles</p>
        </div>

        <div className={styles.aniosGrid}>
          {visibleYears.map((a) => (
            <div key={`${a.collectionId}-${a.anio}`} className={styles.anioCard}
              style={{ opacity: a.isHidden ? 0.55 : 1 }}
              onClick={() => navigate(`/colecciones/${upperSeason.toLowerCase()}/${a.collectionId}/${a.anio}`)}>
              <h3 className={styles.anioCardYear}>
                {a.anio}
                {a.isHidden && <EyeOff size={13} style={{ marginLeft: 6, color: 'var(--gray-400)', verticalAlign: 'middle' }} />}
              </h3>
              <div className={styles.anioCardStats}>
                <div className={styles.anioStat}>
                  <span className={styles.anioStatNumber}>{a.resumen.total}</span>
                  <span className={styles.anioStatLabel}>Total</span>
                </div>
                <div className={styles.anioStat}>
                  <span className="anio-stat-number text-warning">{a.resumen.enProceso}</span>
                  <span className={styles.anioStatLabel}>En proceso</span>
                </div>
                <div className={styles.anioStat}>
                  <span className="anio-stat-number text-error">{a.resumen.pausadas}</span>
                  <span className={styles.anioStatLabel}>Pausadas</span>
                </div>
                <div className={styles.anioStat}>
                  <span className="anio-stat-number text-success">{a.resumen.completadas}</span>
                  <span className={styles.anioStatLabel}>Listas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── NIVEL 1: Grid de Temporadas ──
  const visibleGroups = groups.filter(g => g.active !== false);

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Explorar Colecciones</h2>
        <p className="text-gray-500 text-sm">Selecciona una temporada para navegar por sus referencias</p>
      </div>

      <div className={styles.coleccionesGrid}>
        {visibleGroups.map((group) => {
          const borderColor = SEASON_COLORS[group.code] || '#6B7280';
          return (
            <div
              key={group.code}
              className={styles.seasonCard}
              style={{ borderColor }}
              onClick={() => navigate(`/colecciones/${group.code.toLowerCase()}`)}
            >
              <div className={styles.seasonCardImage}>
                {group.image_url ? (
                  <img src={group.image_url} alt={group.name} />
                ) : (
                  <div className={styles.seasonCardPlaceholder} style={{ background: `linear-gradient(135deg, ${borderColor}44, ${borderColor})` }}>
                    {group.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.seasonCardLabel} style={{ background: borderColor }}>
                {group.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
