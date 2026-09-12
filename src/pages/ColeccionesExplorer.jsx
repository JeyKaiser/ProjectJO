import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Clock, User, EyeOff, Search, SlidersHorizontal, X } from 'lucide-react';
import { useDashboardData, getFaseMacro, slugFromName } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TemperatureBar from '../components/TemperatureBar';
import AsyncState from '../components/AsyncState';
import { REFERENCE_STATUS_OPTIONS, getReferenceStatusLabel } from '../lib/referenceStatuses';
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
  const { seasonSlug, anio } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data, loading, error, refetch } = useDashboardData();
  const colecciones = useMemo(() => data?.colecciones || [], [data]);
  const groups = useMemo(() => data?.groups || [], [data]);

  const normalizedSeasonSlug = seasonSlug?.toLowerCase();
  const filteredForSeason = normalizedSeasonSlug
    ? colecciones.filter(c => slugFromName(c.nombre).toLowerCase() === normalizedSeasonSlug)
    : [];
  const anioNumero = anio ? Number(anio) : null;
  const coleccionActual = anioNumero
    ? filteredForSeason.find(c => c.anios.some(a => a.anio === anioNumero))
    : null;
  const anioActual = coleccionActual?.anios.find(a => a.anio === anioNumero);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');

  const visibleRefs = !anioActual
    ? []
    : isAdmin ? anioActual.referencias : anioActual.referencias.filter(r => !r.isHidden);
  const classificationOptions = [...new Set(visibleRefs.map(ref => ref.clasificacion).filter(Boolean))].sort();
  const query = searchTerm.trim().toLowerCase();
  const filteredRefs = visibleRefs.filter(ref => {
    const matchesSearch = !query || [
      ref.referenceNumber,
      ref.codigoMD,
      ref.codigoPT,
      ref.nombre,
    ].some(value => String(value || '').toLowerCase().includes(query));
    const matchesStatus = !statusFilter || ref.status === statusFilter;
    const matchesClassification = !classificationFilter || ref.clasificacion === classificationFilter;
    return matchesSearch && matchesStatus && matchesClassification;
  });

  const hasFilters = Boolean(searchTerm || statusFilter || classificationFilter);
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setClassificationFilter('');
  };

  if (loading) return <AsyncState loading loadingMessage="Cargando colecciones..." />;
  if (error) return <AsyncState error={error} onRetry={refetch} />;

  if (seasonSlug && filteredForSeason.length === 0) {
    return (
      <div className="fade-in p-8 text-center text-gray-500">
        <h2 className="text-xl font-semibold text-gray-900">Temporada no encontrada</h2>
        <Link to="/colecciones" className="btn btn-primary" style={{ marginTop: 16 }}>Volver a Colecciones</Link>
      </div>
    );
  }

  const seasonName = filteredForSeason[0]?.nombre
    || groups.find(g => slugFromName(g.name).toLowerCase() === normalizedSeasonSlug)?.name
    || '';

  // ── NIVEL 3: Referencias de una colección+año ──
  if (coleccionActual && anioActual) {
    const sc = normalizedSeasonSlug;

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

         <div className={styles.referenciaToolbar} role="search" aria-label="Filtros de referencias">
           <div className={styles.referenciaSearch}>
             <Search size={16} aria-hidden="true" />
             <input
               type="search"
               value={searchTerm}
               onChange={event => setSearchTerm(event.target.value)}
               placeholder="Buscar por numero, codigo MD/PT o nombre..."
               aria-label="Buscar referencias"
             />
           </div>
           <div className={styles.referenciaFilterGroup}>
             <SlidersHorizontal size={15} aria-hidden="true" />
             <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filtrar por estado">
               <option value="">Todos los estados</option>
                {REFERENCE_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
             </select>
             <select value={classificationFilter} onChange={event => setClassificationFilter(event.target.value)} aria-label="Filtrar por clasificacion">
               <option value="">Todas las clasificaciones</option>
               {classificationOptions.map(option => <option key={option} value={option}>{option}</option>)}
             </select>
           </div>
           {hasFilters && (
             <button type="button" className={styles.clearFiltersButton} onClick={clearFilters}>
               <X size={14} aria-hidden="true" /> Limpiar
             </button>
           )}
           <span className={styles.referenciaCount} aria-live="polite">
             {filteredRefs.length} de {visibleRefs.length} referencias
           </span>
         </div>

          <div className={styles.referenciasGrid}>
            <AsyncState
             empty={filteredRefs.length === 0}
             emptyTitle={visibleRefs.length === 0 ? 'Sin referencias visibles' : 'Sin coincidencias'}
             emptyMessage={visibleRefs.length === 0 ? 'No hay referencias para este ano y temporada.' : 'Prueba con otros filtros o limpia la busqueda.'}
           >
              {filteredRefs.map((ref) => {
                const faseMacro = getFaseMacro(ref.faseActual);
                return (
                  <button
                    key={ref.id}
                    type="button"
                     className={`${styles.referenciaCard} ${ref.isCancelled ? styles.referenciaCardCancelado : ''}`}
                    style={{ borderTopColor: `var(--temp-${faseMacro.tempVar}-border)`, opacity: ref.isHidden ? 0.6 : 1 }}
                    onClick={() => navigate(`/colecciones/${sc}/${anioActual.anio}/${ref.referenceNumber}`)}
                    aria-label={`Abrir referencia ${ref.referenceNumber}${ref.nombre ? `: ${ref.nombre}` : ''}`}
                  >
                    <TemperatureBar subfase={ref.faseActual} />
                    {ref.imagen && (
                      <div className={styles.referenciaCardImagen}>
                        <img src={ref.imagen} alt={ref.nombre} />
                      </div>
                    )}
                    <div className={styles.referenciaNumero}>{ref.referenceNumber}</div>
                    <div className={styles.referenciaCardHeader}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {ref.isHidden && <EyeOff size={12} style={{ color: 'var(--gray-400)' }} />}
                        <span className={styles.referenciaClasificacion}>{ref.clasificacion}</span>
                      </div>
                    </div>
                    {ref.status && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                           background: ref.isCancelled ? '#e5e7eb' : 'var(--gray-100)',
                           color: ref.isCancelled ? '#374151' : 'var(--gray-600)',
                           border: `1px solid ${ref.isCancelled ? '#9ca3af' : 'var(--gray-300)'}`,
                         }}>
                           {ref.statusLabel || getReferenceStatusLabel(ref.status)}
                         </span>
                       </div>
                    )}
                    <h4 className={styles.referenciaNombre}>{ref.nombre}</h4>
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
                     {ref.isCancelled && (
                       <div className={styles.cancelledOverlay} aria-hidden="true">
                         <span className={styles.cancelledOverlayLabel}>CANCELADA</span>
                       </div>
                     )}
                   </button>
                );
              })}
           </AsyncState>
         </div>
      </div>
    );
  }

  // ── NIVEL 2: Años de colecciones en una temporada ──
  if (seasonSlug) {
    const seasonCollections = filteredForSeason;
    const allYears = [];
    const seen = new Set();
    seasonCollections.forEach(col => {
      col.anios.forEach(a => {
           const key = `${col.dbId}-${a.anio}`;
        if (!seen.has(key)) {
          seen.add(key);
           allYears.push({ ...a, collectionId: col.dbId, collectionNombre: col.nombre, collectionBorder: col.borderColor, collectionSeason: normalizedSeasonSlug });
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
           <AsyncState
             empty={visibleYears.length === 0}
             emptyTitle="Sin anos visibles"
             emptyMessage="No hay anos disponibles para esta temporada."
           >
            {visibleYears.map((a) => (
              <button
                key={`${a.collectionId}-${a.anio}`}
                type="button"
                className={styles.anioCard}
                style={{ opacity: a.isHidden ? 0.55 : 1 }}
                onClick={() => { if (!a.isHidden) navigate(`/colecciones/${normalizedSeasonSlug}/${a.anio}`); }}
                disabled={a.isHidden}
                aria-label={a.isHidden ? `${a.anio}, año oculto` : `Abrir colección ${seasonName}, año ${a.anio}`}
                title={a.isHidden ? 'Año oculto — solo visible para administradores' : ''}
              >
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
              </button>
            ))}
           </AsyncState>
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
         <AsyncState
           empty={visibleGroups.length === 0}
           emptyTitle="Sin temporadas activas"
           emptyMessage="No hay temporadas disponibles para explorar."
         >
         {visibleGroups.map((group) => {
          const borderColor = SEASON_COLORS[group.code] || '#6B7280';
           return (
             <button
               key={group.code}
               type="button"
               className={styles.seasonCard}
               style={{ borderColor }}
               aria-label={`Abrir temporada ${group.name}`}
               onClick={() => navigate(`/colecciones/${slugFromName(group.name)}`)}
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
             </button>
           );
         })}
         </AsyncState>
       </div>
    </div>
  );
}
