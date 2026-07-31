import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, User, Clock, Calendar, CheckCircle, AlertCircle, Pause, Package, Scissors, Tag, FileText, Shirt, BookMarked, Search, Send, ArrowDownToLine, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useDashboardData, getFaseMacro, toggleReferenceHidden, createCutRequest } from '../lib/api';
import { useAuth, ROLES } from '../context/AuthContext';
import supabase from '../lib/supabase';
import TemperatureBar from '../components/TemperatureBar';
import AsignacionTelasConsumos from '../components/AsignacionTelasConsumos';
import SeccionColapsable from '../components/SeccionColapsable';
import styles from './ReferenciaDetalle.module.css';


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
  const { seasonCode, coleccionId, anio, refId } = useParams();
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

  const [showCorteModal, setShowCorteModal] = useState(false);
  const [corteForm, setCorteForm] = useState({ type: 'muestra', fabric_handling: 'solido', observations: '' });
  const [sendingCorte, setSendingCorte] = useState(false);

  const handleSendToCorte = async () => {
    setSendingCorte(true);
    try {
      await createCutRequest({
        reference_id: ref.dbId,
        collection_id: coleccion?.dbId,
        type: corteForm.type,
        fabric_handling: corteForm.fabric_handling,
        requester_name: role,
        requester_role: role,
        observations: corteForm.observations,
      });
      setShowCorteModal(false);
      setCorteForm({ type: 'muestra', fabric_handling: 'solido', observations: '' });
    } catch (e) {
      alert('Error al enviar a corte: ' + e.message);
    } finally {
      setSendingCorte(false);
    }
  };

  const { data, loading: dashLoading } = useDashboardData();
  const coleccionesData = data?.colecciones || [];
  const groups = data?.groups || [];

  const coleccion = (() => {
    if (!coleccionId) return null;
    return coleccionesData.find(c => c.id === coleccionId);
  })();

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
            <Link to={`/colecciones/${seasonCode || coleccion?.season?.toLowerCase()}`} className="breadcrumb-link">{groups.find(g => g.code === (seasonCode || coleccion?.season)?.toUpperCase())?.name || seasonCode}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <Link to={`/colecciones/${seasonCode || coleccion?.season?.toLowerCase()}/${coleccionId}/${anio}`} className="breadcrumb-link">{anio}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">{ref.codigoMD}</span>
          </nav>

      {/* Header Fijo de la Referencia */}
      <div className={styles.header} style={{ borderTopColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
        <div className={styles.headerTop}>
          {/* Códigos y nombre */}
          <div className={styles.headerInfo}>
            <div className={styles.codes}>
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
            <h1 className={styles.nombre}>{ref.nombre}</h1>
            <p className={styles.meta}>{ref.tipoPrenda} · {ref.color} · {ref.linea} / {ref.sublinea}</p>
          </div>

          {/* Fase actual */}
          <div className={styles.faseActual} style={{ background: `var(--temp-${faseMacro.tempVar})`, borderColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
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

            {/* Enviar a Corte (visible para creativo, tecnico, admin) */}
            {ref.dbId && (isCreativo || isTecnico || isAdmin) && (
              <button className="btn btn-outline" style={{ borderColor: 'var(--primary-500)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setShowCorteModal(true)}>
                <Scissors size={16} /> Enviar a Corte
              </button>
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
          <div className={styles.gridInfo}>
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
              <div key={label} className={styles.infoItem}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{val}</span>
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

        {/* SECCIÓN 2.5: Estado Trazador */}
        {ref?.dbId && (
          <SeccionColapsable titulo="Trazos y Comparativo" icono={<Scissors size={18} />} accentColor="var(--success)" defaultOpen={false}>
            <EstadoTrazador dbRefId={ref.dbId} />
          </SeccionColapsable>
        )}

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
            <p className={styles.vacio}>No hay insumos registrados aún.</p>
          )}
        </SeccionColapsable>

        {/* SECCIÓN 4: Historial de Fases (Timeline) */}
        <SeccionColapsable titulo="Historial de Fases" icono={<Clock size={18} />} accentColor="var(--primary-500)" defaultOpen={true}>
          {ref.historialFases && ref.historialFases.length > 0 ? (
            <div className={styles.timeline}>
              {ref.historialFases.map((h, i) => {
                const isLast = i === ref.historialFases.length - 1;
                return (
                  <div key={i} className={`timeline-item ${isLast ? 'timeline-item-active' : ''}`}>
                    <div className={styles.timelineDot} style={{ background: h.estado === 'Terminado' ? 'var(--success)' : h.estado === 'En Proceso' ? 'var(--warning)' : 'var(--error)' }} />
                    {!isLast && <div className={styles.timelineLine} />}
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <strong>{h.fase}</strong>
                        <EstadoBadge estado={h.estado} />
                      </div>
                      <div className={styles.timelineMeta}>
                        <span><User size={11} /> {h.responsable}</span>
                        <span><Calendar size={11} /> {h.fechaIngreso}</span>
                        {h.fechaSalida && <span>→ {h.fechaSalida}</span>}
                      </div>
                      {h.comentarios && <p className={styles.timelineComment}>💬 {h.comentarios}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.vacio}>Sin historial de fases registrado.</p>
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
            <p className={styles.vacio}>Sin mediciones registradas.</p>
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
              <div className={styles.gridInfo} style={{ marginBottom: 16 }}>
                {[
                  ['Descripción USA', ref.marquilla.descUSA],
                  ['Descripción UK', ref.marquilla.descUK],
                  ['Composición Fibra', ref.marquilla.fiberComposition],
                  ['Woven / Knitted', ref.marquilla.wovenKnitted],
                  ['Inside', ref.marquilla.inside],
                  ['Include', ref.marquilla.include],
                ].map(([label, val]) => (
                  <div key={label} className={styles.infoItem}>
                    <span className={styles.infoLabel}>{label}</span>
                    <span className={styles.infoValue}>{val || '—'}</span>
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
            <p className={styles.vacio}>Marquilla pendiente de completar en Fase 4.1.</p>
          )}
        </SeccionColapsable>

        {/* SECCIÓN 8: Contramuestra y SAP */}
        <SeccionColapsable titulo="Industrializacion · Contramuestra y SAP" icono={<CheckCircle size={18} />} accentColor="var(--temp-hot-border)" defaultOpen={false}>
          {ref.contramuestra ? (
            <div className={styles.gridInfo}>
              {[
                ['Orden de Trabajo (OT)', ref.contramuestra.OT],
                ['Nota de Fabricación SAP', ref.contramuestra.notaSAP || 'Pendiente'],
                ['Talla de Contramuestra', ref.contramuestra.talla],
                ['Color', ref.contramuestra.colorContramuestra],
                ['Fecha Traslado SAP', ref.contramuestra.fechaTrasladoSAP || 'Pendiente'],
                ['Fecha Despacho ZF', ref.contramuestra.fechaDespachoZF || 'Pendiente'],
              ].map(([label, val]) => (
                <div key={label} className={styles.infoItem}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={styles.infoValue}>{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.vacio}>Contramuestra pendiente de iniciar en Fase 4.2.</p>
          )}
        </SeccionColapsable>

      </div>

      {/* Modal: Enviar a Corte */}
      {showCorteModal && (
        <div className="modal-overlay" onClick={() => setShowCorteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Enviar a Corte</h3>
              <button className="modal-close" onClick={() => setShowCorteModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: 0 }}>
                <strong>{ref.codigoMD}</strong> — {ref.nombre}
              </p>
              <div className="form-group">
                <label className="form-label">Tipo de Corte</label>
                <select className="form-select" value={corteForm.type}
                  onChange={e => setCorteForm(prev => ({ ...prev, type: e.target.value }))}>
                  <option value="muestra">Muestra</option>
                  <option value="contramuestra">Contramuestra</option>
                  <option value="pieza">Pieza</option>
                  <option value="laboratorio">Laboratorio</option>
                  <option value="forro">Forro</option>
                  <option value="pedido_especial">Pedido Especial</option>
                  <option value="sesgo">Sesgo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Manejo de Tela</label>
                <select className="form-select" value={corteForm.fabric_handling}
                  onChange={e => setCorteForm(prev => ({ ...prev, fabric_handling: e.target.value }))}>
                  <option value="solido">Solido</option>
                  <option value="mod_arte">Modificacion de Arte</option>
                  <option value="ubic_trazo">Ubicacion de Trazo</option>
                  <option value="cuero">Cuero</option>
                  <option value="all_over">All Over</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea className="form-input" rows={2} value={corteForm.observations}
                  onChange={e => setCorteForm(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Ej. Sin lucir, no alcanza forro..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCorteModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSendToCorte} disabled={sendingCorte}>
                <Scissors size={16} /> {sendingCorte ? 'Enviando...' : 'Enviar a Corte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EstadoTrazador({ dbRefId }) {
  const [trazos, setTrazos] = useState([]);
  const [comparativo, setComparativo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbRefId) return;
    let cancelled = false;
    async function load() {
      const { data: t } = await supabase.from('trazos').select('*').eq('reference_id', dbRefId).order('fase').order('opcion_num');
      const { data: c } = await supabase.from('comparativo_trazos').select('*').eq('reference_id', dbRefId).order('created_at', { ascending: false }).limit(1);
      if (!cancelled) { setTrazos(t || []); setComparativo(c?.[0] || null); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [dbRefId]);

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Cargando trazos...</p>;

  const costeo = trazos.filter(t => t.fase === 'costeo');
  const contramuestra = trazos.filter(t => t.fase === 'contramuestra');

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200, background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--primary-700)' }}>Trazo Costeo ({costeo.length})</h4>
        {costeo.length === 0 ? <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Sin trazos registrados</p> : costeo.map(t => (
          <div key={t.id} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--primary-100)' }}>
            <strong>{t.tipo_tela}</strong> Opc.{t.opcion_num}: {t.consumo_valor || '-'}m
            {t.veces_trazadas > 1 && <span style={{ color: 'var(--gray-500)' }}> ({t.veces_trazadas} intentos)</span>}
            {t.fecha_inicio && <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{t.fecha_inicio}{t.fecha_fin ? ` → ${t.fecha_fin}` : ''}</div>}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 200, background: 'var(--success-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--success-700)' }}>Trazo Contramuestra ({contramuestra.length})</h4>
        {contramuestra.length === 0 ? <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Sin trazos registrados</p> : contramuestra.map(t => (
          <div key={t.id} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--success-100)' }}>
            <strong>{t.tipo_tela}</strong> Opc.{t.opcion_num}: {t.consumo_valor || '-'}m
            {t.veces_trazadas > 1 && <span style={{ color: 'var(--gray-500)' }}> ({t.veces_trazadas} intentos)</span>}
            {t.fecha_inicio && <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{t.fecha_inicio}{t.fecha_fin ? ` → ${t.fecha_fin}` : ''}</div>}
          </div>
        ))}
      </div>

      <div style={{ flex: 0, minWidth: 180, background: comparativo ? 'var(--warning-light)' : 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: 13, color: comparativo ? 'var(--warning-dark)' : 'var(--gray-600)' }}>
          {comparativo ? 'Comparativo Completado' : 'Comparativo Pendiente'}
        </h4>
        {comparativo && (
          <div style={{ fontSize: 11, color: 'var(--gray-600)' }}>
            {[ 'veces', 'piezas', 'ancho', 'molderia', 'sesgo', 'ancho_sesgo', 'telas' ].filter(k => comparativo[`difiere_${k}`]).length} diferencias detectadas
            <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>{comparativo.fecha_comparativo}</div>
          </div>
        )}
        <Link to={`/trazador`} style={{ marginTop: 8, fontSize: 11, color: 'var(--primary-600)', textDecoration: 'underline' }}>
          Ir al Panel del Trazador →
        </Link>
      </div>
    </div>
  );
}
