import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, User, Clock, Calendar, CheckCircle, AlertCircle, Pause, Package, Scissors, Tag, FileText, Shirt, BookMarked, Search, Send, ArrowDownToLine, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useDashboardData, getFaseMacro, toggleReferenceHidden } from '../lib/api';
import { useAuth, ROLES } from '../context/AuthContext';
import TemperatureBar from '../components/TemperatureBar';
import AsignacionTelasConsumos from '../components/AsignacionTelasConsumos';
import SeccionColapsable from '../components/SeccionColapsable';


function EstadoBadge({ estado }) {
  const map = {
    'Terminado':   { bg: 'var(--success-light)', color: 'var(--success-dark)', icon: <CheckCircle size={12} /> },
    'En Proceso':  { bg: 'var(--warning-light)', color: 'var(--warning-dark)', icon: <Clock size={12} /> },
    'Pausado':     { bg: 'var(--error-light)',   color: 'var(--error-dark)',   icon: <Pause size={12} /> },
    'Completado':  { bg: 'var(--success-light)', color: 'var(--success-dark)', icon: <CheckCircle size={12} /> },
  };
  const s = map[estado] || map['Pausado'];
  return (
    <span style={{ background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
      {s.icon}{estado}
    </span>
  );
}

export default function ReferenciaDetalle() {
  const { coleccionId, anio, refId } = useParams();
  const { role, isAdmin, isCreadorFicha, isCreativo, isTecnico, isLiderModistas, isTrazador, isEspecificadora } = useAuth();

  // Mock estado de flujo de trabajo (Hand-off)
  const [workflowState, setWorkflowState] = useState({
    area: 'TECNICO', // Área actual que tiene la responsabilidad
    status: 'PENDING_RECEIPT', // IN_PROGRESS, PENDING_RECEIPT
    history: []
  });

  const handleEntregar = (nextArea) => {
    setWorkflowState(prev => ({
      area: nextArea,
      status: 'PENDING_RECEIPT',
      history: [...prev.history, { action: 'ENTREGADO', by: role, date: new Date().toISOString() }]
    }));
  };

  const handleRecibir = () => {
    setWorkflowState(prev => ({
      ...prev,
      status: 'IN_PROGRESS',
      history: [...prev.history, { action: 'RECIBIDO', by: role, date: new Date().toISOString() }]
    }));
  };

  const { data, loading: dashLoading } = useDashboardData();
  const coleccionesData = data?.colecciones || [];

  const coleccion = coleccionesData.find(c => c.id === coleccionId);
  const anioData = coleccion?.anios.find(a => a.anio === parseInt(anio));
  const ref = anioData?.referencias.find(r => r.id === refId);

  const [isHidden, setIsHidden] = useState(ref?.isHidden || false);

  const handleToggleHidden = async () => {
    if (!ref?.dbId) return;
    const newState = !isHidden;
    setIsHidden(newState);
    try {
      await toggleReferenceHidden(ref.dbId, newState);
    } catch (e) {
      setIsHidden(!newState);
      console.error('Error toggling hidden:', e);
    }
  };

  if (dashLoading) return <div className="fade-in p-8 text-center text-gray-400">Cargando referencia...</div>;

  if (!ref) return (
    <div className="text-center" style={{ marginTop: '4rem' }}>
      <h2>Referencia no encontrada</h2>
      <Link to="/colecciones" className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver a Colecciones</Link>
    </div>
  );

  const faseMacro = getFaseMacro(ref.faseActual);

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/colecciones" className="breadcrumb-link">Colecciones</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <Link to={`/colecciones/${coleccionId}`} className="breadcrumb-link">{coleccion?.nombre}</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <Link to={`/colecciones/${coleccionId}/${anio}`} className="breadcrumb-link">{anio}</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{ref.codigoMD}</span>
      </nav>

      {/* Header Fijo de la Referencia */}
      <div className="detalle-header" style={{ borderTopColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
        <div className="detalle-header-top">
          {/* Códigos y nombre */}
          <div className="detalle-header-info">
            <div className="detalle-codes">
              <span className="code-badge code-md" style={{ fontSize: 14, padding: '4px 12px' }}>{ref.codigoMD}</span>
              <span className="code-badge code-pt" style={{ fontSize: 14, padding: '4px 12px' }}>{ref.codigoPT}</span>
              <span style={{ background: `var(--temp-${faseMacro.tempVar})`, color: `var(--temp-${faseMacro.tempVar}-text)`, padding: '4px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 700, border: `1px solid var(--temp-${faseMacro.tempVar}-border)` }}>
                {ref.clasificacion}
              </span>
              {isHidden && (
                <span style={{ background: 'var(--gray-200)', color: 'var(--gray-500)', padding: '4px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <EyeOff size={12} /> Oculta
                </span>
              )}
              {isAdmin && ref.dbId && (
                <button
                  className={`btn ${isHidden ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={handleToggleHidden}
                  title={isHidden ? 'Mostrar referencia' : 'Ocultar referencia'}
                >
                  {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                  {isHidden ? 'Mostrar' : 'Ocultar'}
                </button>
              )}
            </div>
            <h1 className="detalle-nombre">{ref.nombre}</h1>
            <p className="detalle-meta">{ref.tipoPrenda} · {ref.color} · {ref.linea} / {ref.sublinea}</p>
          </div>

          {/* Fase actual */}
          <div className="detalle-fase-actual" style={{ background: `var(--temp-${faseMacro.tempVar})`, borderColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Fase Actual</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: `var(--temp-${faseMacro.tempVar}-text)` }}>{ref.faseActual}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>{ref.subfaseNombre}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={11} />{ref.responsable}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />{ref.tiempoFase} en esta fase
            </div>
          </div>
        </div>

        {/* Barra de Temperatura */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Progreso del Ciclo de Vida
          </div>
          <TemperatureBar subfase={ref.faseActual} showLabel={true} />
        </div>
      </div>

      {/* PANEL DE CONTROL DE ESTADO (HAND-OFF) */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--primary-500)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Control de Flujo de Trabajo
              {workflowState.status === 'PENDING_RECEIPT' && <span className="badge badge-warning">Esperando Recepción</span>}
              {workflowState.status === 'IN_PROGRESS' && <span className="badge badge-success">En Ejecución</span>}
            </h3>
            <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
              La referencia está actualmente asignada a: <strong>{workflowState.area}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {/* Si está esperando recepción y soy el rol correcto */}
            {workflowState.status === 'PENDING_RECEIPT' && 
             ((workflowState.area === 'TECNICO' && (isTecnico || isAdmin)) || 
              (workflowState.area === 'TRAZADOR' && (isTrazador || isAdmin))) && (
              <button className="btn btn-success" onClick={handleRecibir}>
                <ArrowDownToLine size={18} /> Recibir y Empezar a Contar Tiempo
              </button>
            )}

            {/* Si está en progreso y soy el rol correcto, puedo entregar */}
            {workflowState.status === 'IN_PROGRESS' && 
             ((workflowState.area === 'CREATIVO' && (isCreativo || isAdmin)) || 
              (workflowState.area === 'TECNICO' && (isTecnico || isAdmin))) && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                  <AlertTriangle size={18} /> Devolver con Observaciones
                </button>
                <button className="btn btn-primary" onClick={() => handleEntregar(workflowState.area === 'CREATIVO' ? 'TECNICO' : 'TRAZADOR')}>
                  <Send size={18} /> Entregar a {workflowState.area === 'CREATIVO' ? 'Diseño Técnico' : 'Trazadores'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {workflowState.history.length > 0 && (
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--gray-200)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Última acción: {workflowState.history[workflowState.history.length - 1].action} por {workflowState.history[workflowState.history.length - 1].by}
          </div>
        )}
      </div>

      {/* Secciones */}
      <div className="detalle-secciones">

        {/* SECCIÓN 1: Perfil de la Referencia */}
        <SeccionColapsable titulo="Identificación y Perfil" icono={<Tag size={18} />} accentColor="var(--temp-cold-border)">
          <div className="detalle-grid-info">
            {[
              ['Tipo de Prenda', ref.tipoPrenda],
              ['Color', ref.color],
              ['Código de Color', ref.codigoColor],
              ['Línea', ref.linea],
              ['Sublínea', ref.sublinea],
              ['Tallaje', ref.tallaje],
              ['Largo', ref.largo],
              ['Closure', ref.closure],
              ['Drop de Entrega', ref.dropEntrega],
              ['Prioridad First Buy', ref.prioridadFirstBuy],
              ['Enviar a Maquila', ref.enviarMaquila ? 'Sí' : 'No'],
              ['Complejidad Corte', ref.complejidadCorte],
              ['Complejidad Confección', ref.complejidadConfeccion],
              ['Bordado en Prenda', ref.tieneBordado ? 'Sí' : 'No'],
              ['Semielaborados', ref.tieneSemielaborado ? 'Sí' : 'No'],
              ['Montaje Maniquí', ref.montajeManiqui],
              ['Tiras Continuas', ref.tirasContinuas ? 'Sí' : 'No'],
              ['Includes', ref.includes || '—'],
              ['Tipo de Empaque', ref.tipoEmpaque],
            ].map(([label, val]) => (
              <div key={label} className="detalle-info-item">
                <span className="detalle-info-label">{label}</span>
                <span className="detalle-info-value">{val}</span>
              </div>
            ))}
          </div>
        </SeccionColapsable>

        {/* SECCIÓN 1.5: Reprogramación / Referente */}
        <SeccionColapsable titulo="Reprogramación / Referente" icono={<BookMarked size={18} />} accentColor="var(--primary-color)" defaultOpen={true}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1e293b' }}>¿Es esta referencia una reprogramación?</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Asigna un referente de colecciones pasadas para omitir el cálculo de consumos y escalado base. El trazador usará los consumos pre-calculados.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Buscar por Tipo de Prenda o Código PT..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
                  <Search size={14} /> Buscar Referente
                </button>
              </div>
            </div>
            <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '6px', border: '1px dashed #22c55e', minWidth: '200px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Estado Actual</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#15803d', marginTop: '4px' }}>Moldería Nueva (No es reprogramación)</div>
            </div>
          </div>
        </SeccionColapsable>

        {/* SECCIÓN 2: Telas y Consumos */}
        <SeccionColapsable titulo="Telas y Consumos" icono={<Scissors size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={true}>
          <AsignacionTelasConsumos refId={refId} />
        </SeccionColapsable>

        {/* SECCIÓN 3: Insumos No Textiles */}
        <SeccionColapsable titulo="Insumos No Textiles" icono={<Package size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={false}>
          {ref.insumos && ref.insumos.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Código</th><th>Descripción</th><th>Unidad</th><th>Cantidad</th></tr>
                </thead>
                <tbody>
                  {ref.insumos.map(ins => (
                    <tr key={ins.id}>
                      <td><strong>{ins.codigo}</strong></td>
                      <td>{ins.descripcion}</td>
                      <td>{ins.unidad}</td>
                      <td style={{ fontWeight: 700 }}>{ins.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="detalle-vacio">No hay insumos registrados aún.</p>
          )}
        </SeccionColapsable>

        {/* SECCIÓN 4: Historial de Fases (Timeline) */}
        <SeccionColapsable titulo="Historial de Fases" icono={<Clock size={18} />} accentColor="var(--primary-500)" defaultOpen={true}>
          {ref.historialFases && ref.historialFases.length > 0 ? (
            <div className="timeline">
              {ref.historialFases.map((h, i) => {
                const isLast = i === ref.historialFases.length - 1;
                return (
                  <div key={i} className={`timeline-item ${isLast ? 'timeline-item-active' : ''}`}>
                    <div className="timeline-dot" style={{ background: h.estado === 'Terminado' ? 'var(--success)' : h.estado === 'En Proceso' ? 'var(--warning)' : 'var(--error)' }} />
                    {!isLast && <div className="timeline-line" />}
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>{h.fase}</strong>
                        <EstadoBadge estado={h.estado} />
                      </div>
                      <div className="timeline-meta">
                        <span><User size={11} /> {h.responsable}</span>
                        <span><Calendar size={11} /> {h.fechaIngreso}</span>
                        {h.fechaSalida && <span>→ {h.fechaSalida}</span>}
                      </div>
                      {h.comentarios && <p className="timeline-comment">💬 {h.comentarios}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="detalle-vacio">Sin historial de fases registrado.</p>
          )}
        </SeccionColapsable>

        {/* SECCIÓN 5: Mediciones */}
        <SeccionColapsable titulo="Mediciones" icono={<Shirt size={18} />} accentColor="var(--temp-cold-border)" defaultOpen={false}>
          {ref.mediciones && ref.mediciones.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Fecha</th><th>Resultado</th><th>Observaciones</th></tr>
                </thead>
                <tbody>
                  {ref.mediciones.map(m => (
                    <tr key={m.numero}>
                      <td>{m.numero}</td>
                      <td>{m.fecha}</td>
                      <td><EstadoBadge estado={m.resultado === 'Aprobada con comentarios' ? 'En Proceso' : m.resultado === 'Rechazada' ? 'Pausado' : 'Terminado'} /></td>
                      <td>{m.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="detalle-vacio">Sin mediciones registradas.</p>
          )}
        </SeccionColapsable>

        {/* SECCIÓN 6: Bordado */}
        {ref.procesosEspeciales && ref.procesosEspeciales.length > 0 && (
          <SeccionColapsable titulo="Bordado" icono={<AlertCircle size={18} />} accentColor="var(--temp-cold-border)" defaultOpen={false}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Proveedor</th><th>Descripción</th><th>Estado</th><th>Costo</th></tr>
                </thead>
                <tbody>
                  {ref.procesosEspeciales.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.proveedor}</strong></td>
                      <td>{p.descripcion}</td>
                      <td><EstadoBadge estado={p.estado} /></td>
                      <td style={{ fontWeight: 700 }}>${p.costo?.toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SeccionColapsable>
        )}

        {/* SECCIÓN 7: Marquillas y Cuidados */}
        <SeccionColapsable titulo="Marquillas y Cuidados" icono={<FileText size={18} />} accentColor="var(--temp-fire-border)" defaultOpen={false}>
          {ref.marquilla ? (
            <div>
              <div className="detalle-grid-info" style={{ marginBottom: 16 }}>
                {[
                  ['Descripción USA', ref.marquilla.descUSA],
                  ['Descripción UK', ref.marquilla.descUK],
                  ['Composición Fibra', ref.marquilla.fiberComposition],
                  ['Woven / Knitted', ref.marquilla.wovenKnitted],
                  ['Inside', ref.marquilla.inside],
                  ['Include', ref.marquilla.include],
                ].map(([label, val]) => (
                  <div key={label} className="detalle-info-item">
                    <span className="detalle-info-label">{label}</span>
                    <span className="detalle-info-value">{val || '—'}</span>
                  </div>
                ))}
              </div>
              {ref.cuidados && ref.cuidados.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--gray-700)' }}>Instrucciones de Cuidado</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {ref.cuidados.map((c, i) => (
                      <div key={i} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '10px 14px', minWidth: 120, textAlign: 'center' }}>
                        <div style={{ fontSize: 22 }}>{c.icono}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', marginTop: 4 }}>{c.categoria}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{c.instruccion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="detalle-vacio">Marquilla pendiente de completar en Fase 4.1.</p>
          )}
        </SeccionColapsable>

        {/* SECCIÓN 8: Contramuestra y SAP */}
        <SeccionColapsable titulo="Industrializacion · Contramuestra y SAP" icono={<CheckCircle size={18} />} accentColor="var(--temp-hot-border)" defaultOpen={false}>
          {ref.contramuestra ? (
            <div className="detalle-grid-info">
              {[
                ['Orden de Trabajo (OT)', ref.contramuestra.OT],
                ['Nota de Fabricación SAP', ref.contramuestra.notaSAP || 'Pendiente'],
                ['Talla de Contramuestra', ref.contramuestra.talla],
                ['Color', ref.contramuestra.colorContramuestra],
                ['Fecha Traslado SAP', ref.contramuestra.fechaTrasladoSAP || 'Pendiente'],
                ['Fecha Despacho ZF', ref.contramuestra.fechaDespachoZF || 'Pendiente'],
              ].map(([label, val]) => (
                <div key={label} className="detalle-info-item">
                  <span className="detalle-info-label">{label}</span>
                  <span className="detalle-info-value">{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="detalle-vacio">Contramuestra pendiente de iniciar en Fase 4.2.</p>
          )}
        </SeccionColapsable>

      </div>
    </div>
  );
}
