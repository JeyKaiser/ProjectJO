import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Clock, User, Tag, EyeOff } from 'lucide-react';
import { useDashboardData, getFaseMacro } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TemperatureBar from '../components/TemperatureBar';

export default function ColeccionesExplorer() {
  const { coleccionId, anio } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data, loading, error } = useDashboardData();
  const colecciones = data?.colecciones || [];

  const coleccionActual = coleccionId ? colecciones.find(c => c.id === coleccionId) : null;
  const anioActual = coleccionActual && anio ? coleccionActual.anios.find(a => a.anio === parseInt(anio)) : null;

  if (loading) return <div className="fade-in p-8 text-center text-gray-400">Cargando colecciones...</div>;
  if (error) return <div className="fade-in p-8 text-center text-red-500">Error: {error.message}</div>;

  // ── NIVEL 3: Referencias de una colección+año ──
  if (coleccionActual && anioActual) {
    const visibleRefs = isAdmin
      ? anioActual.referencias
      : anioActual.referencias.filter(r => !r.isHidden);

    return (
      <div className="fade-in">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/colecciones" className="breadcrumb-link">Colecciones</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link to={`/colecciones/${coleccionActual.id}`} className="breadcrumb-link">{coleccionActual.nombre}</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{anioActual.anio}</span>
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

        <div className="referencias-grid">
          {visibleRefs.map((ref) => {
            const faseMacro = getFaseMacro(ref.faseActual);
            return (
              <div
                key={ref.id}
                className="referencia-card"
                style={{
                  borderTopColor: `var(--temp-${faseMacro.tempVar}-border)`,
                  cursor: 'pointer',
                  opacity: ref.isHidden ? 0.6 : 1,
                }}
                onClick={() => navigate(`/colecciones/${coleccionActual.id}/${anioActual.anio}/${ref.id}`)}
              >
                {/* Barra de Temperatura */}
                <TemperatureBar subfase={ref.faseActual} />

                {/* Imagen de Referencia */}
                {ref.imagen && (
                  <div className="referencia-card-imagen">
                    <img src={ref.imagen} alt={ref.nombre} />
                  </div>
                )}

                {/* Encabezado */}
                <div className="referencia-card-header">
                  <div className="referencia-codes">
                    <span className="code-badge code-md">{ref.codigoMD}</span>
                    <span className="code-badge code-pt">{ref.codigoPT}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {ref.isHidden && <EyeOff size={12} style={{ color: 'var(--gray-400)' }} />}
                    <span className="referencia-clasificacion">{ref.clasificacion}</span>
                  </div>
                </div>

                {/* Cuerpo */}
                <h4 className="referencia-nombre">{ref.nombre}</h4>
                <p className="referencia-tipo">{ref.tipoPrenda} · {ref.color}</p>

                {/* Fase Actual */}
                <div className="referencia-fase" style={{ background: `var(--temp-${faseMacro.tempVar})`, borderColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
                  <div className="referencia-fase-label">
                    <span className="referencia-fase-number" style={{ color: `var(--temp-${faseMacro.tempVar}-text)` }}>{ref.faseActual}</span>
                    <span className="referencia-fase-name">{ref.subfaseNombre}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="referencia-footer">
                  <div className="referencia-footer-item">
                    <User size={12} />
                    <span>{ref.responsable}</span>
                  </div>
                  <div className="referencia-footer-item">
                    <Clock size={12} />
                    <span>{ref.tiempoFase}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── NIVEL 2: Años de una colección ──
  if (coleccionActual) {
    const visibleYears = isAdmin
      ? coleccionActual.anios
      : coleccionActual.anios.filter(a => !a.isHidden);

    return (
      <div className="fade-in">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/colecciones" className="breadcrumb-link">Colecciones</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{coleccionActual.nombre}</span>
        </nav>

        <div className="flex items-center gap-4 mb-8">
          <div className="coleccion-avatar" style={{ borderColor: coleccionActual.borderColor }}>
            {coleccionActual.imagen ? (
              <img src={coleccionActual.imagen} alt={coleccionActual.nombre} />
            ) : (
              <div className="coleccion-avatar-placeholder" style={{ background: coleccionActual.borderColor }}>{coleccionActual.nombre.charAt(0)}</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{coleccionActual.nombre}</h2>
            <p className="text-gray-500 text-sm">Selecciona el año para ver las referencias</p>
          </div>
        </div>

        <div className="anios-grid">
          {visibleYears.map((a) => (
            <div key={a.anio} className="anio-card"
              style={{ opacity: a.isHidden ? 0.55 : 1 }}
              onClick={() => navigate(`/colecciones/${coleccionActual.id}/${a.anio}`)}>
              <h3 className="anio-card-year">
                {a.anio}
                {a.isHidden && <EyeOff size={13} style={{ marginLeft: 6, color: 'var(--gray-400)', verticalAlign: 'middle' }} />}
              </h3>
              <div className="anio-card-stats">
                <div className="anio-stat">
                  <span className="anio-stat-number">{a.resumen.total}</span>
                  <span className="anio-stat-label">Total</span>
                </div>
                <div className="anio-stat">
                  <span className="anio-stat-number text-warning">{a.resumen.enProceso}</span>
                  <span className="anio-stat-label">En proceso</span>
                </div>
                <div className="anio-stat">
                  <span className="anio-stat-number text-error">{a.resumen.pausadas}</span>
                  <span className="anio-stat-label">Pausadas</span>
                </div>
                <div className="anio-stat">
                  <span className="anio-stat-number text-success">{a.resumen.completadas}</span>
                  <span className="anio-stat-label">Listas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── NIVEL 1: Grid de Colecciones ──
  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Explorar Colecciones</h2>
        <p className="text-gray-500 text-sm">Selecciona una colección para navegar por sus referencias</p>
      </div>

      <div className="colecciones-grid">
        {colecciones.map((col) => (
          <div 
            key={col.id} 
            className="coleccion-card"
            style={{ borderColor: col.borderColor }}
            onClick={() => navigate(`/colecciones/${col.id}`)}
          >
            <div className="coleccion-card-image">
              {col.imagen ? (
                <img src={col.imagen} alt={col.nombre} />
              ) : (
                <div className="coleccion-card-placeholder" style={{ background: `linear-gradient(135deg, ${col.borderColor}44, ${col.borderColor})` }}>
                  <span>{col.nombre.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="coleccion-card-label" style={{ background: col.borderColor }}>
              {col.nombre.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
