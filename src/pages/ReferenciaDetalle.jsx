import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, User, Clock, Calendar, CheckCircle, AlertCircle, Pause, Package, Scissors, Tag, FileText, Shirt } from 'lucide-react';
import { colecciones, getFaseMacro } from '../data/colecciones';
import TemperatureBar from '../components/TemperatureBar';

function SeccionColapsable({ titulo, icono, children, defaultOpen = true, accentColor }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="detalle-seccion" style={{ borderLeftColor: accentColor }}>
      <button className="detalle-seccion-header" onClick={() => setOpen(!open)}>
        <div className="detalle-seccion-titulo">
          {icono}
          <span>{titulo}</span>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="detalle-seccion-body">{children}</div>}
    </div>
  );
}

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

  const coleccion = colecciones.find(c => c.id === coleccionId);
  const anioData = coleccion?.anios.find(a => a.anio === parseInt(anio));
  const ref = anioData?.referencias.find(r => r.id === refId);

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

        {/* SECCIÓN 2: Telas y Consumos */}
        <SeccionColapsable titulo="Telas y Consumos" icono={<Scissors size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={true}>
          {ref.telas && ref.telas.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Uso en Prenda</th>
                    <th>Base Textil</th>
                    <th>Ancho</th>
                    <th style={{ background: '#dbeafe', color: '#1e40af' }}>Creativo</th>
                    <th style={{ background: '#ffedd5', color: '#9a3412' }}>Técnico</th>
                    <th style={{ background: '#dcfce7', color: '#14532d' }}>Trazador (S)</th>
                    <th style={{ background: '#dcfce7', color: '#14532d' }}>Trazador (MA)</th>
                    <th style={{ background: '#dcfce7', color: '#14532d' }}>Trazador (UT)</th>
                    <th style={{ background: '#fee2e2', color: '#991b1b' }}>Contramuestra</th>
                  </tr>
                </thead>
                <tbody>
                  {ref.telas.map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.codigoMaterial}</strong><br /><small style={{ color: 'var(--gray-500)' }}>{t.descripcion}</small></td>
                      <td>{t.usoEnPrenda}</td>
                      <td>{t.baseTextil}</td>
                      <td>{t.ancho}</td>
                      <td style={{ background: '#eff6ff', textAlign: 'center', fontWeight: 700 }}>{t.consumoCreativo ?? '—'}</td>
                      <td style={{ background: '#fff7ed', textAlign: 'center', fontWeight: 700 }}>{t.consumoTecnico ?? '—'}</td>
                      <td style={{ background: '#f0fdf4', textAlign: 'center', fontWeight: 700 }}>{t.consumoTrazador?.solido ?? '—'}</td>
                      <td style={{ background: '#f0fdf4', textAlign: 'center', fontWeight: 700 }}>{t.consumoTrazador?.modArte ?? '—'}</td>
                      <td style={{ background: '#f0fdf4', textAlign: 'center', fontWeight: 700 }}>{t.consumoTrazador?.ubicTrazo ?? '—'}</td>
                      <td style={{ background: '#fff1f2', textAlign: 'center', fontWeight: 700 }}>{t.consumoContramuestra ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="detalle-vacio">No hay telas registradas aún.</p>
          )}
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
        <SeccionColapsable titulo="Mediciones y Tallaje" icono={<Shirt size={18} />} accentColor="var(--temp-hot-border)" defaultOpen={false}>
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

        {/* SECCIÓN 6: Procesos Especiales */}
        {ref.procesosEspeciales && ref.procesosEspeciales.length > 0 && (
          <SeccionColapsable titulo="Procesos Especiales" icono={<AlertCircle size={18} />} accentColor="var(--temp-hot-border)" defaultOpen={false}>
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
        <SeccionColapsable titulo="Contramuestra y Nota SAP" icono={<CheckCircle size={18} />} accentColor="var(--temp-fire-border)" defaultOpen={false}>
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
