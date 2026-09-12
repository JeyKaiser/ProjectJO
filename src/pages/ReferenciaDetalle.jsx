import { useState, useEffect, startTransition } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, User, Clock, Calendar, CheckCircle, AlertCircle, Pause, Package, Scissors, Tag, Shirt, BookMarked, Search, Send, ArrowDownToLine, AlertTriangle, Eye, EyeOff, Edit2, Save, FlaskConical } from 'lucide-react';
import { useDashboardData, getFaseMacro, slugFromName, toggleReferenceHidden, createCutRequest, updateReference, useFinalSheet, assignCode, useReferenceHandoffs, createReferenceHandoff, updateReferenceHandoff, deliverReferenceHandoff, returnReferenceHandoff } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';
import { useComplejidad, useLargos } from '../hooks/useCatalogos';
import { getReferenceStatusLabel, getReferenceStatusStyle } from '../lib/referenceStatuses';
import TemperatureBar from '../components/TemperatureBar';
import AsignacionTelasConsumos from '../components/AsignacionTelasConsumos';
import InsumosBodega from '../components/InsumosBodega';
import MedicionMuestra from '../components/MedicionMuestra';
import LaboratoriosMolderia from '../components/LaboratoriosMolderia';
import CorteConfeccionMuestra from '../components/CorteConfeccionMuestra';
import SeccionColapsable from '../components/SeccionColapsable';
import AsyncState from '../components/AsyncState';
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

function ChipToggle({ active, onChange, children }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px',
        borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        border: `1px solid ${active ? 'var(--primary-400)' : 'var(--gray-300)'}`,
        background: active ? 'var(--primary-100)' : 'var(--white)',
        color: active ? 'var(--primary-700)' : 'var(--gray-600)',
      }}
    >
      {active && <CheckCircle size={11} />}
      {children}
    </button>
  );
}

export default function ReferenciaDetalle() {
  const { seasonSlug, anio, referenceNumber } = useParams();
  const { role, isAdmin, isCreadorFicha, isCreativo, isTecnico, isTrazador } = useAuth();

  // Hooks de catálogos desde BD
  const { data: complejidad } = useComplejidad();
  const { data: largos } = useLargos();

  const [showCorteModal, setShowCorteModal] = useState(false);
  const [corteForm, setCorteForm] = useState({ type: 'muestra', fabric_handling: 'solido', observations: '' });
  const [sendingCorte, setSendingCorte] = useState(false);

  const handleSendToCorte = async () => {
    setSendingCorte(true);
    try {
      const { error: cutError } = await createCutRequest({
        reference_id: ref.dbId,
        collection_id: coleccion?.dbId,
        type: corteForm.type,
        fabric_handling: corteForm.fabric_handling,
        requester_name: role,
        requester_role: role,
        observations: corteForm.observations,
      });
      if (cutError) throw cutError;
      setShowCorteModal(false);
      setCorteForm({ type: 'muestra', fabric_handling: 'solido', observations: '' });
    } catch (e) {
      alert('Error al enviar a corte: ' + e.message);
    } finally {
      setSendingCorte(false);
    }
  };

  const { data, loading: dashLoading, error: dashError, refetch: refetchDash } = useDashboardData();
  const coleccionesData = data?.colecciones || [];
  const groups = data?.groups || [];

  const anioNumero = anio ? Number(anio) : null;
  const coleccion = coleccionesData.find(c =>
    slugFromName(c.nombre).toLowerCase() === seasonSlug?.toLowerCase() &&
    c.anios.some(a => a.anio === anioNumero)
  );

  const anioData = coleccion?.anios.find(a => a.anio === parseInt(anio));
  const ref = anioData?.referencias.find(r => r.referenceNumber === String(referenceNumber));

  const [isHidden, setIsHidden] = useState(ref?.isHidden || false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [tallajeOptions, setTallajeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const { current: currentHandoff, history: handoffHistory, loading: handoffLoading, error: handoffError, refresh: refreshHandoffs } = useReferenceHandoffs(ref?.dbId);
  const [workflowSaving, setWorkflowSaving] = useState(false);
  const { data: finalSheet, loading: finalSheetLoading, error: finalSheetError, refresh: refreshFinalSheet } = useFinalSheet(ref?.dbId);

  const canEdit = isAdmin || isCreadorFicha;

  const workflowState = {
    area: currentHandoff?.to_area || 'TECNICO',
    status: currentHandoff?.status || 'PENDING_RECEIPT',
    history: handoffHistory,
  };

  const handleEntregar = async nextArea => {
    if (!currentHandoff?.id || workflowSaving) return;
    setWorkflowSaving(true);
    try {
      const { error: handoffUpdateError } = await deliverReferenceHandoff(currentHandoff.id, nextArea, role);
      if (handoffUpdateError) throw handoffUpdateError;
      await refreshHandoffs();
    } catch (e) {
      alert('Error al entregar la referencia: ' + e.message);
    } finally {
      setWorkflowSaving(false);
    }
  };

  const handleRecibir = async () => {
    if (!ref?.dbId || workflowSaving) return;
    setWorkflowSaving(true);
    try {
      const now = new Date().toISOString();
      const result = currentHandoff
          ? await updateReferenceHandoff(currentHandoff.id, {
            status: 'IN_PROGRESS',
            last_action: 'RECIBIDO',
            last_action_by: role,
            last_action_at: now,
            received_by: role,
            received_at: now,
          })
        : await createReferenceHandoff({
            reference_id: ref.dbId,
            to_area: 'TECNICO',
            status: 'IN_PROGRESS',
            last_action: 'RECIBIDO',
            last_action_by: role,
            last_action_at: now,
            received_by: role,
            received_at: now,
          });
      if (result.error) throw result.error;
      await refreshHandoffs();
    } catch (e) {
      alert('Error al recibir la referencia: ' + e.message);
    } finally {
      setWorkflowSaving(false);
    }
  };

  const handleDevolver = async () => {
    if (!currentHandoff?.id || workflowSaving) return;
    const notes = window.prompt('Escribe las observaciones de la devolución:');
    if (notes === null) return;
    if (!notes.trim()) {
      alert('La devolución requiere observaciones.');
      return;
    }

    const nextArea = currentHandoff.from_area || (workflowState.area === 'TECNICO' ? 'CREATIVO' : 'TECNICO');
    setWorkflowSaving(true);
    try {
      const { error: handoffReturnError } = await returnReferenceHandoff(currentHandoff.id, nextArea, role, notes.trim());
      if (handoffReturnError) throw handoffReturnError;
      await refreshHandoffs();
    } catch (e) {
      alert('Error al devolver la referencia: ' + e.message);
    } finally {
      setWorkflowSaving(false);
    }
  };

  const openEditModal = async () => {
    if (!ref?.dbId) return;

    const [tallajesRes, statusesRes] = await Promise.all([
      supabase.from('tallaje_groups').select('id, name').order('id'),
      supabase.from('reference_statuses').select('id, status, label, active').order('sort_order', { ascending: true, nullsFirst: false }).order('id'),
    ]);
    setTallajeOptions(tallajesRes.data || []);
    setStatusOptions((statusesRes.data || []).filter(status => status.active !== false));

    const { data: refData } = await supabase
      .from('references')
      .select('*')
      .eq('id', ref.dbId)
      .single();

    if (refData) {
      setEditForm({
        name: refData.name || '',
        reference_type: refData.reference_type || '',
        length_description: refData.length_description || '',
        length_cm: refData.length_cm || '',
        color: refData.color || '',
        color_code: refData.color_code || '',
        tallaje_group_id: refData.tallaje_group_id || '',
        has_embroidery: refData.has_embroidery || false,
        has_semielaborated: refData.has_semielaborated || false,
        complejidad_corte_id: refData.complejidad_corte_id || '',
        complejidad_confeccion_id: refData.complejidad_confeccion_id || '',
        drop_entrega: refData.drop_entrega || '',
        priority_first_buy: refData.priority_first_buy || '',
        envio_confeccion_maquila: refData.envio_confeccion_maquila || false,
        has_art_modification: refData.has_art_modification || false,
        has_trace_location: refData.has_trace_location || false,
        status_id: refData.status_id || '',
        codigoMD: ref.codigoMD || '',
        codigoPT: ref.codigoPT || '',
      });
    }
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!ref?.dbId) return;
    setEditSaving(true);
    try {
      const { codigoMD, codigoPT, ...payload } = editForm;
      if (payload.tallaje_group_id === '') payload.tallaje_group_id = null;
      if (payload.complejidad_corte_id === '') payload.complejidad_corte_id = null;
      if (payload.complejidad_confeccion_id === '') payload.complejidad_confeccion_id = null;
      if (!payload.length_cm) payload.length_cm = null;
      if (!payload.priority_first_buy) payload.priority_first_buy = null;
      if (payload.status_id === '') payload.status_id = null;

      const { error: err } = await updateReference(ref.dbId, payload);
      if (err) throw err;

      // Admin: guardar codigos MD/PT
      if (isAdmin) {
        if (codigoMD && codigoMD.trim()) {
          await assignCode(ref.dbId, 'MD', codigoMD.trim(), 'admin');
        }
        if (codigoPT && codigoPT.trim()) {
          await assignCode(ref.dbId, 'PT', codigoPT.trim(), 'admin');
        }
      }

      setShowEditModal(false);
      window.location.reload();
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setEditSaving(false);
    }
  };

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

  if (dashLoading) return <AsyncState loading loadingMessage="Cargando referencia..." />;
  if (dashError) return <AsyncState error={dashError} onRetry={refetchDash} />;

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
            <Link to={`/colecciones/${seasonSlug}`} className="breadcrumb-link">{groups.find(g => slugFromName(g.name).toLowerCase() === seasonSlug?.toLowerCase())?.name || coleccion?.nombre || seasonSlug}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <Link to={`/colecciones/${seasonSlug}/${anio}`} className="breadcrumb-link">{anio}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">#{ref.referenceNumber}</span>
          </nav>

      {/* Header Fijo de la Referencia */}
      <div className={styles.header} style={{ borderTopColor: `var(--temp-${faseMacro.tempVar}-border)` }}>
        <div className={styles.headerTop}>
          {/* Códigos y nombre */}
          <div className={styles.headerInfo}>
            <div className={styles.codes}>
              <span style={{ fontSize: 40, fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1, marginRight: 40 }}>
                {/* {ref.codigoMD.replace('MD-0', '')} */}
                {ref.id.replace('REF-', '')}
              </span>
              <span className="code-badge code-md" style={{ fontSize: 14, padding: '4px 12px' }}>
                {ref.codigoMD}
                {isAdmin && ref.mdAssigned && <span title="ASIGNADO (oficial)" style={{ marginLeft: 4, color: '#22c55e', fontSize: 10 }}>●</span>}
                {isAdmin && !ref.mdAssigned && <span title="DERIVADO (auto)" style={{ marginLeft: 4, color: '#f59e0b', fontSize: 10 }}>●</span>}
              </span>
              <span className="code-badge code-pt" style={{ fontSize: 14, padding: '4px 12px' }}>
                {ref.codigoPT}
                {isAdmin && ref.ptAssigned && <span title="ASIGNADO (oficial)" style={{ marginLeft: 4, color: '#22c55e', fontSize: 10 }}>●</span>}
                {isAdmin && !ref.ptAssigned && <span title="DERIVADO (auto)" style={{ marginLeft: 4, color: '#f59e0b', fontSize: 10 }}>●</span>}
              </span>
              <span style={{ background: `var(--temp-${faseMacro.tempVar})`, color: `var(--temp-${faseMacro.tempVar}-text)`, padding: '4px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 700, border: `1px solid var(--temp-${faseMacro.tempVar}-border)` }}>
                {ref.clasificacion}
              </span>
              {ref.status && (
                <span style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 700,
                  background: getReferenceStatusStyle(ref.status).bg,
                  color: getReferenceStatusStyle(ref.status).text,
                  border: `1px solid ${getReferenceStatusStyle(ref.status).border}`,
                }}>
                  {ref.statusLabel || getReferenceStatusLabel(ref.status)}
                </span>
              )}
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
              {canEdit && ref.dbId && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={openEditModal}
                >
                  <Edit2 size={12} /> Editar
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
              {handoffLoading && <span className="badge">Cargando...</span>}
            </h3>
            <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
              La referencia está actualmente asignada a: <strong>{workflowState.area}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {/* Si está esperando recepción y soy el rol correcto */}
            {!handoffError && workflowState.status === 'PENDING_RECEIPT' &&
             ((workflowState.area === 'TECNICO' && (isTecnico || isAdmin)) || 
               (workflowState.area === 'TRAZADOR' && (isTrazador || isAdmin))) && (
              <button className="btn btn-success" onClick={handleRecibir} disabled={workflowSaving}>
                <ArrowDownToLine size={18} /> {workflowSaving ? 'Guardando...' : 'Recibir y Empezar a Contar Tiempo'}
              </button>
            )}

            {/* Si está en progreso y soy el rol correcto, puedo entregar */}
            {!handoffError && workflowState.status === 'IN_PROGRESS' &&
             ((workflowState.area === 'CREATIVO' && (isCreativo || isAdmin)) || 
               (workflowState.area === 'TECNICO' && (isTecnico || isAdmin))) && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleDevolver} disabled={workflowSaving}>
                  <AlertTriangle size={18} /> Devolver con Observaciones
                </button>
                <button className="btn btn-primary" onClick={() => handleEntregar(workflowState.area === 'CREATIVO' ? 'TECNICO' : 'TRAZADOR')} disabled={workflowSaving}>
                  <Send size={18} /> {workflowSaving ? 'Guardando...' : `Entregar a ${workflowState.area === 'CREATIVO' ? 'Diseño Técnico' : 'Trazadores'}`}
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
        
        {handoffError && (
          <AsyncState error={handoffError} onRetry={refreshHandoffs} />
        )}

        {!handoffError && workflowState.history.length > 0 && (
           <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--gray-200)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
             Última acción: {workflowState.history[0].last_action} por {workflowState.history[0].last_action_by || 'sistema'}
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
              ['Largo Cms', ref.largoCms || '—'],
              ['Closure', ref.closure],
              ['¿Tiene Forro?', ref.linned ? 'Sí' : 'No'],
              ['¿Requiere Muestra?', ref.requiereMuestra ? 'Sí' : 'No'],
              ['Drop de Entrega', ref.dropEntrega],
              ['Prioridad First Buy', ref.prioridadFirstBuy],
              ['Enviar a Maquila', ref.enviarMaquila ? 'Sí' : 'No'],
              ['Complejidad Corte', ref.complejidadCorte],
              ['Complejidad Confección', ref.complejidadConfeccion],
              ['Bordado en Prenda', ref.tieneBordado ? 'Sí' : 'No'],
              ['Semielaborados', ref.tieneSemielaborado ? 'Sí' : 'No'],
              ['Montaje Maniquí', ref.montajeManiqui],
              ['Tiras Continuas', ref.tirasContinuas || 'No aplica'],
              ['Includes', ref.includes || '—'],
              ['Tipo de Empaque', ref.tipoEmpaque],
              ['Especificación Confeccion', ref.especificacionConfeccion || '—'],
            ].map(([label, val]) => (
              <div key={label} className={styles.infoItem}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{val}</span>
              </div>
            ))}
          </div>
        </SeccionColapsable>

        {/* SECCIÓN 1.5: Reprogramación / Referente */}
        <SeccionColapsable titulo="Reprogramación / Referente" icono={<BookMarked size={18} />} accentColor="var(--primary-color)" defaultOpen={false}>
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
        <SeccionColapsable titulo="Telas y Consumos" icono={<Scissors size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={false}>
           <AsignacionTelasConsumos refId={ref.id} />
        </SeccionColapsable>

        {/* SECCIÓN 2.5: Estado Trazador */}
        {ref?.dbId && (
          <SeccionColapsable titulo="Trazos y Comparativo" icono={<Scissors size={18} />} accentColor="var(--success)" defaultOpen={false}>
            <EstadoTrazador dbRefId={ref.dbId} />
          </SeccionColapsable>
        )}

        {/* SECCIÓN 2.7: Medición y Aprobación de Muestra */}
        {ref?.dbId && (
          <SeccionColapsable titulo="Medición y Aprobación" icono={<CheckCircle size={18} />} accentColor="var(--primary-500)" defaultOpen={false}>
            <MedicionMuestra dbRefId={ref.dbId} referenceLabel={`Ref ${ref.referenceNumber || ''}`} />
          </SeccionColapsable>
        )}

        {/* SECCIÓN 2.8: Laboratorios de Molde y Molderia */}
        {ref?.dbId && (
          <SeccionColapsable titulo="Laboratorios y Molderia" icono={<FlaskConical size={18} />} accentColor="var(--success)" defaultOpen={false}>
            <LaboratoriosMolderia dbRefId={ref.dbId} referenceLabel={`Ref ${ref.referenceNumber || ''}`} />
          </SeccionColapsable>
        )}

        {/* SECCIÓN 2.9: Corte y Confección de Muestra */}
        {ref?.dbId && (
          <SeccionColapsable titulo="Corte y Confección de Muestra" icono={<Scissors size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={false}>
            <CorteConfeccionMuestra dbRefId={ref.dbId} referenceLabel={`Ref ${ref.referenceNumber || ''}`} />
          </SeccionColapsable>
        )}

        {/* SECCIÓN 3: Insumos y Bodega */}
        <SeccionColapsable titulo="Insumos y Bodega" icono={<Package size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={false}>
          <InsumosBodega dbRefId={ref?.dbId} referenceLabel={`Ref ${ref.referenceNumber || ''}`} />
        </SeccionColapsable>

        {/* SECCIÓN 4: Historial de Fases (Timeline) */}
        <SeccionColapsable titulo="Historial de Fases" icono={<Clock size={18} />} accentColor="var(--primary-500)" defaultOpen={false}>
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

        <FinalSheetReadSections data={finalSheet} loading={finalSheetLoading} error={finalSheetError} onRetry={refreshFinalSheet} />

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

      {/* Modal: Editar Referencia */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Editar Referencia — {ref.codigoMD}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input type="text" className="form-input" value={editForm.name || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Prenda</label>
                  <select className="form-select" value={editForm.reference_type || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, reference_type: e.target.value }))}>
                    <option value="">Sin definir</option>
                    <option value="SILUETA">Silueta</option>
                    <option value="BASICA">Basica</option>
                    <option value="SPECIAL">Special</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input type="text" className="form-input" value={editForm.color || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, color: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Codigo de Color</label>
                  <input type="text" className="form-input" value={editForm.color_code || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, color_code: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Tallaje</label>
                  <select className="form-select" value={editForm.tallaje_group_id || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, tallaje_group_id: e.target.value ? parseInt(e.target.value) : '' }))}>
                    <option value="">Sin tallaje definido</option>
                    {tallajeOptions.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <span className="form-help">Requerido para ingresar consumos por talla.</span>
                </div>
                {canEdit && (
                  <div className="form-group">
                    <label className="form-label">Estado de la Referencia</label>
                    <select className="form-select" value={editForm.status_id || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, status_id: e.target.value ? parseInt(e.target.value) : '' }))}>
                        <option value="">Sin cambiar</option>
                        {statusOptions.map(s => (
                         <option key={s.id} value={s.id}>{s.label || getReferenceStatusLabel(s.status)}</option>
                        ))}
                    </select>
                  </div>
                )}
                {/* MD / PT — solo admin */}
                {isAdmin && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Código MD <span style={{ fontSize: 10, color: 'var(--primary-500)', fontWeight: 600 }}>Admin</span></label>
                      <input type="text" className="form-input" value={editForm.codigoMD || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, codigoMD: e.target.value }))}
                        placeholder="MD-000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Código PT <span style={{ fontSize: 10, color: 'var(--primary-500)', fontWeight: 600 }}>Admin</span></label>
                      <input type="text" className="form-input" value={editForm.codigoPT || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, codigoPT: e.target.value }))}
                        placeholder="PT03000" />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Largo</label>
                  <select className="form-select" value={editForm.length_description || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, length_description: e.target.value }))}>
                    <option value="">Sin definir</option>
                    {largos.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Largo Cms</label>
                  <input type="number" min="0" className="form-input" value={editForm.length_cm || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, length_cm: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Drop de Entrega</label>
                  <select className="form-select" value={editForm.drop_entrega || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, drop_entrega: e.target.value }))}>
                    <option value="">Sin definir</option>
                    {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridad First Buy</label>
                  <input type="number" min="1" max="10" className="form-input" value={editForm.priority_first_buy || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, priority_first_buy: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                <ChipToggle active={editForm.has_embroidery === true}
                  onChange={(v) => setEditForm(prev => ({ ...prev, has_embroidery: v }))}>
                  Bordado en Prenda
                </ChipToggle>
                <ChipToggle active={editForm.has_semielaborated === true}
                  onChange={(v) => setEditForm(prev => ({ ...prev, has_semielaborated: v }))}>
                  Semielaborados
                </ChipToggle>
                <ChipToggle active={editForm.envio_confeccion_maquila === true}
                  onChange={(v) => setEditForm(prev => ({ ...prev, envio_confeccion_maquila: v }))}>
                  Enviar a Maquila
                </ChipToggle>
                <ChipToggle active={editForm.has_art_modification === true}
                  onChange={(v) => setEditForm(prev => ({ ...prev, has_art_modification: v }))}>
                  Mod. Arte
                </ChipToggle>
                <ChipToggle active={editForm.has_trace_location === true}
                  onChange={(v) => setEditForm(prev => ({ ...prev, has_trace_location: v }))}>
                  Ubicacion Trazo
                </ChipToggle>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <div className="form-group">
                  <label className="form-label">Complejidad Corte</label>
                  <select className="form-select" value={editForm.complejidad_corte_id || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, complejidad_corte_id: e.target.value || '' }))}>
                    <option value="">Sin definir</option>
                    {complejidad.map(c => <option key={c.id} value={c.id}>{c.level}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Complejidad Confeccion</label>
                  <select className="form-select" value={editForm.complejidad_confeccion_id || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, complejidad_confeccion_id: e.target.value || '' }))}>
                    <option value="">Sin definir</option>
                    {complejidad.map(c => <option key={c.id} value={c.id}>{c.level}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleEditSave} disabled={editSaving}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={16} />
                {editSaving ? 'Guardando...' : 'Guardar Cambios'}
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
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!dbRefId) return;
    let cancelled = false;
    startTransition(() => setError(null));
    async function load() {
      try {
        const { data: t, error: trazosError } = await supabase.from('trazos').select('*').eq('reference_id', dbRefId).order('fase').order('opcion_num');
        if (trazosError) throw trazosError;
        const { data: c, error: comparativoError } = await supabase.from('comparativo_trazos').select('*').eq('reference_id', dbRefId).order('created_at', { ascending: false }).limit(1);
        if (comparativoError) throw comparativoError;
        if (!cancelled) { setTrazos(t || []); setComparativo(c?.[0] || null); setLoading(false); }
      } catch (loadError) {
        if (!cancelled) { setError(loadError); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dbRefId, reloadKey]);

  if (loading) return <AsyncState loading loadingMessage="Cargando trazos..." />;
  if (error) return <AsyncState error={error} onRetry={() => setReloadKey(key => key + 1)} />;

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

function FinalSheetReadSections({ data, loading, error, onRetry }) {
  if (loading) return <AsyncState loading loadingMessage="Cargando Ficha Final..." />;
  if (error) return <AsyncState error={error} onRetry={onRetry} />;
  if (!data) return <AsyncState empty emptyTitle="Sin Ficha Final registrada" emptyMessage="Esta referencia aun no tiene una ficha final." />;

  const scopeLabels = { MUESTRA: 'Muestra', PRODUCCION: 'Producción' };
  const compositionIsEmpty = composition => !composition?.id
    && !composition?.description_usauk
    && !composition?.fiber_composition
    && !composition?.materials?.length;

  return (
    <>
      <SeccionColapsable titulo="Ficha Final · Composición y Cuidados" icono={<Tag size={18} />} accentColor="var(--temp-fire-border)" defaultOpen={false}>
        {Object.entries(data.compositions || {}).map(([scope, composition]) => (
          <div key={scope} style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px', color: 'var(--gray-700)' }}>{scopeLabels[scope] || scope}</h4>
            {compositionIsEmpty(composition) ? <p className={styles.vacio}>Sin composición registrada.</p> : (
              <>
                <div className={styles.gridInfo}>
                  {[
                    ['Composición USA / UK', composition.description_usauk],
                    ['Composición de fibras', composition.fiber_composition],
                    ['Woven / Knitted', composition.woven_knitted],
                    ['Composición interior', composition.inside_composition],
                    ['Include', composition.include_description],
                    ['SAP', composition.sap_registered ? 'Registrada' : 'Pendiente'],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.infoItem}><span className={styles.infoLabel}>{label}</span><span className={styles.infoValue}>{value || '—'}</span></div>
                  ))}
                </div>
                {composition.materials?.length > 0 && (
                  <div className="table-container" style={{ marginTop: 12 }}>
                    <table className="table"><thead><tr><th>Material</th><th>Porcentaje</th></tr></thead><tbody>
                      {composition.materials.map(material => <tr key={material.id || `${scope}-${material.material}`}><td>{material.material}</td><td>{material.percentage ?? '—'}%</td></tr>)}
                    </tbody></table>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <div style={{ fontWeight: 700, margin: '12px 0 8px', color: 'var(--gray-700)' }}>Instrucciones de cuidado</div>
        {data.careInstructions?.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {data.careInstructions.map((care, index) => (
              <div key={care.id || `${care.care_type_id}-${index}`} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '10px 14px', minWidth: 160 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)' }}>{care.care_type?.type || `ID ${care.care_type_id}`}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{care.instruction || '—'}</div>
              </div>
            ))}
          </div>
        ) : <p className={styles.vacio}>Sin cuidados registrados.</p>}
        {data.materialsError && <p style={{ color: 'var(--warning-dark)', fontSize: 12, marginTop: 10 }}>Materiales no disponibles: {data.materialsError.message}. Requiere `jo.composition_materials`.</p>}
      </SeccionColapsable>

      <SeccionColapsable titulo="Industrialización · Contramuestras y SAP" icono={<CheckCircle size={18} />} accentColor="var(--temp-hot-border)" defaultOpen={false}>
        {data.contramuestras?.length > 0 ? (
          <div className="table-container"><table className="table"><thead><tr><th>OT</th><th>Estado</th><th>Talla</th><th>Color</th><th>Nota SAP</th><th>Traslado SAP</th><th>Despacho ZF</th></tr></thead><tbody>
            {data.contramuestras.map(contramuestra => (
              <tr key={contramuestra.id || contramuestra.codigo_ot}>
                <td><strong>{contramuestra.codigo_ot}</strong></td>
                <td>{contramuestra.status || 'pendiente'}</td>
                <td>{contramuestra.talla || '—'}</td>
                <td>{contramuestra.descripcion_color || '—'}</td>
                <td>{contramuestra.codigo_nota || '—'}</td>
                <td>{contramuestra.fecha_traslado_sap || '—'}</td>
                <td>{contramuestra.fecha_despacho_zf || '—'}</td>
              </tr>
            ))}
          </tbody></table></div>
        ) : <p className={styles.vacio}>Sin contramuestras registradas.</p>}
      </SeccionColapsable>

      <SeccionColapsable titulo="Novedades de Calidad" icono={<AlertTriangle size={18} />} accentColor="var(--temp-fire-border)" defaultOpen={false}>
        {data.qualityIssues?.length > 0 ? (
          <div className="table-container"><table className="table"><thead><tr><th>Detectada</th><th>Área</th><th>Clasificación</th><th>Descripción</th><th>Acción correctiva</th><th>Estado</th></tr></thead><tbody>
            {data.qualityIssues.map(issue => (
              <tr key={issue.id || issue.detected_at}>
                <td>{issue.detected_at ? new Date(issue.detected_at).toLocaleDateString('es-CO') : '—'}</td>
                <td>{issue.area || '—'}</td>
                <td>{issue.classification || '—'}</td>
                <td>{issue.description || '—'}</td>
                <td>{issue.corrective_action || '—'}</td>
                <td>{issue.resolved ? 'Resuelta' : 'Activa'}</td>
              </tr>
            ))}
          </tbody></table></div>
        ) : <p className={styles.vacio}>Sin novedades de calidad registradas.</p>}
      </SeccionColapsable>
    </>
  );
}
