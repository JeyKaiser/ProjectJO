import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle, Clock, Droplets, FileText, Info, Package,
  Plus, Save, ShieldCheck, Tag, X,
} from 'lucide-react';
import supabase from '../lib/supabase';
import {
  buildFinalSheetPayload,
  FINAL_SHEET_SCOPES,
  loadFinalSheet,
  saveFinalSheet,
} from '../lib/api';
import SeccionColapsable from '../components/SeccionColapsable';
import styles from './FichaFinalView.module.css';

const CONTRAMUESTRA_STATUS = {
  pendiente: { label: 'Pendiente', color: 'var(--warning-dark)', background: 'var(--warning-light)', icon: Clock },
  activa: { label: 'Activa', color: 'var(--success-dark)', background: 'var(--success-light)', icon: CheckCircle },
  utilizada: { label: 'Utilizada', color: 'var(--info-dark)', background: 'var(--info-light)', icon: Package },
  anulada: { label: 'Anulada', color: 'var(--error-dark)', background: 'var(--error-light)', icon: X },
};

function emptyComposition(scope) {
  return {
    id: null,
    reference_id: null,
    scope,
    sap_registered: false,
    description_usauk: '',
    fiber_composition: '',
    woven_knitted: '',
    inside_composition: '',
    include_description: '',
    notes: '',
    materials: [],
  };
}

function emptyContra(reference) {
  return {
    id: null,
    nombre: '',
    codigo_ot: '',
    talla: '',
    descripcion_color: reference?.color || '',
    unidades_cortadas: '',
    nota_fabricacion_id: null,
    prioridad: '',
    fecha_meta_entrega: '',
    drop_entrega: '',
    status: 'pendiente',
    observaciones_confeccion: '',
    codigo_nota: '',
    fecha_traslado_sap: '',
    fecha_despacho_zf: '',
    observaciones_nota: '',
  };
}

function normalizeContraRows(rows) {
  let activeFound = false;
  return (rows || []).map(row => {
    const status = String(row.status || '').toLowerCase();
    if (status === 'activa') {
      if (activeFound) return { ...row, status: 'utilizada' };
      activeFound = true;
    }
    return { ...row, status: status || 'pendiente' };
  });
}

function careLabel(type) {
  const value = String(type || '').trim();
  if (value === 'BLANQUEADO') return 'Blanqueado';
  if (value === 'DESMANCHE') return 'Desmanche / Blanqueado';
  return value || 'Cuidado';
}

function updateArrayItem(items, index, field, value) {
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
}

export default function FichaFinalView() {
  const [collections, setCollections] = useState([]);
  const [years, setYears] = useState([]);
  const [references, setReferences] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRefId, setSelectedRefId] = useState('');
  const [selectorError, setSelectorError] = useState(null);

  const [reference, setReference] = useState(null);
  const [compositions, setCompositions] = useState({
    MUESTRA: emptyComposition('MUESTRA'),
    PRODUCCION: emptyComposition('PRODUCCION'),
  });
  const [activeScope, setActiveScope] = useState('MUESTRA');
  const [careInstructions, setCareInstructions] = useState([]);
  const [contramuestras, setContramuestras] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [materialsError, setMaterialsError] = useState(null);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [novedadDraft, setNovedadDraft] = useState({ classification: '', description: '' });

  useEffect(() => {
    let cancelled = false;
    async function loadCollections() {
      const { data, error } = await supabase
        .from('collections')
        .select('id,code,name,season,year')
        .eq('active', true)
        .order('name');
      if (cancelled) return;
      if (error) setSelectorError(error);
      else setCollections(data || []);
    }
    loadCollections();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedCollectionId) return undefined;

    async function loadYears() {
      const { data, error } = await supabase
        .from('collection_years')
        .select('id,collection_id,year,is_hidden')
        .eq('collection_id', Number(selectedCollectionId))
        .eq('is_hidden', false)
        .order('year', { ascending: false });
      if (cancelled) return;
      if (error) {
        setSelectorError(error);
        return;
      }
      const visibleYears = data || [];
      if (visibleYears.length === 0) {
        const collection = collections.find(item => String(item.id) === String(selectedCollectionId));
        if (collection?.year) visibleYears.push({ id: null, collection_id: collection.id, year: collection.year, is_hidden: false });
      }
      setYears(visibleYears);
    }
    loadYears();
    return () => { cancelled = true; };
  }, [selectedCollectionId, collections]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedCollectionId || !selectedYear) return undefined;

    async function loadReferences() {
      const { data, error } = await supabase
        .from('references')
        .select('id,reference_number,name,reference_type,color,color_code,is_hidden')
        .eq('collection_id', Number(selectedCollectionId))
        .eq('year', Number(selectedYear))
        .eq('is_hidden', false)
        .order('reference_number');
      if (cancelled) return;
      if (error) setSelectorError(error);
      else setReferences(data || []);
    }
    loadReferences();
    return () => { cancelled = true; };
  }, [selectedCollectionId, selectedYear]);

  useEffect(() => {
    if (!selectedRefId) {
      return undefined;
    }

    let cancelled = false;
    loadFinalSheet(Number(selectedRefId))
      .then(sheet => {
        if (cancelled) return;
        setReference(sheet.reference);
        setCompositions(sheet.compositions);
        setCareInstructions(buildCareEntries(sheet.careTypes, sheet.careInstructions));
        setContramuestras(normalizeContraRows(sheet.contramuestras));
        setNovedades(sheet.qualityIssues);
        setMaterialsError(sheet.materialsError);
      })
      .catch(error => { if (!cancelled) setMessage({ type: 'error', text: `Error cargando la ficha: ${error.message}` }); })
      .finally(() => { if (!cancelled) setLoadingSheet(false); });

    return () => { cancelled = true; };
  }, [selectedRefId]);

  const currentComposition = compositions[activeScope] || emptyComposition(activeScope);
  const compositionTotal = useMemo(
    () => currentComposition.materials.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0),
    [currentComposition.materials],
  );
  const compositionStatus = compositionTotal === 0 ? 'incomplete' : Math.abs(compositionTotal - 100) < 0.1 ? 'ok' : 'error';
  const activeContramuestra = contramuestras.find(item => item.status === 'activa');
  const activeNovedades = novedades.filter(item => !item.resolved);
  const careCompleted = careInstructions.filter(item => String(item.instruction || '').trim()).length;
  const kpis = {
    composition: compositionStatus === 'ok',
    care: careInstructions.length > 0 && careCompleted === careInstructions.length,
    contramuestra: activeContramuestra || contramuestras.some(item => item.status === 'utilizada'),
    quality: activeNovedades.length === 0,
  };

  const selectedReference = reference || references.find(item => String(item.id) === String(selectedRefId));
  const selectedCollection = collections.find(item => String(item.id) === String(selectedCollectionId));

  function handleCollectionChange(value) {
    setSelectorError(null);
    setYears([]);
    setSelectedYear('');
    setReferences([]);
    setSelectedRefId('');
    resetSheetState();
    setSelectedCollectionId(value);
  }

  function handleYearChange(value) {
    setSelectorError(null);
    setReferences([]);
    setSelectedRefId('');
    resetSheetState();
    setSelectedYear(value);
  }

  function handleReferenceChange(value) {
    setSelectorError(null);
    resetSheetState();
    setLoadingSheet(Boolean(value));
    setMessage(null);
    setSelectedRefId(value);
  }

  function resetSheetState() {
    setReference(null);
    setCompositions({ MUESTRA: emptyComposition('MUESTRA'), PRODUCCION: emptyComposition('PRODUCCION') });
    setCareInstructions([]);
    setContramuestras([]);
    setNovedades([]);
    setMaterialsError(null);
    setLoadingSheet(false);
  }

  function updateComposition(field, value) {
    setCompositions(previous => ({
      ...previous,
      [activeScope]: { ...previous[activeScope], [field]: value },
    }));
  }

  function updateMaterial(index, field, value) {
    setCompositions(previous => ({
      ...previous,
      [activeScope]: {
        ...previous[activeScope],
        materials: updateArrayItem(previous[activeScope].materials, index, field, value),
      },
    }));
  }

  function addMaterial() {
    setCompositions(previous => ({
      ...previous,
      [activeScope]: {
        ...previous[activeScope],
        materials: [...previous[activeScope].materials, { id: null, composition_id: previous[activeScope].id, material: '', percentage: '' }],
      },
    }));
  }

  function removeMaterial(index) {
    setCompositions(previous => ({
      ...previous,
      [activeScope]: {
        ...previous[activeScope],
        materials: previous[activeScope].materials.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function updateContra(index, field, value) {
    setContramuestras(previous => {
      if (field !== 'status' || value !== 'activa') return updateArrayItem(previous, index, field, value);
      return previous.map((item, itemIndex) => {
        if (itemIndex === index) return { ...item, status: 'activa' };
        return item.status === 'activa' ? { ...item, status: 'utilizada' } : item;
      });
    });
  }

  function addContramuestra() {
    setContramuestras(previous => [...previous, emptyContra(reference)]);
  }

  function addNovedad() {
    if (!novedadDraft.classification.trim() || !novedadDraft.description.trim()) return;
    setNovedades(previous => [...previous, {
      id: null,
      detected_at: new Date().toISOString(),
      area: '',
      classification: novedadDraft.classification.trim(),
      material: '',
      material_classification: '',
      execution_type: '',
      description: novedadDraft.description.trim(),
      corrective_action: '',
      resolved: false,
    }]);
    setNovedadDraft({ classification: '', description: '' });
  }

  async function handleSave() {
    if (!selectedRefId || !reference) return;
    const invalidContra = contramuestras.find(item => !String(item.codigo_ot || '').trim() && item.status !== 'anulada');
    if (invalidContra) {
      setMessage({ type: 'error', text: 'Cada contramuestra pendiente, activa o utilizada requiere una Orden de Trabajo (OT).' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = buildFinalSheetPayload({
        referenceId: reference.id,
        compositions,
        careInstructions,
        contramuestras,
        qualityIssues: novedades,
      });
      await saveFinalSheet(payload);
      const freshSheet = await loadFinalSheet(Number(selectedRefId));
      setReference(freshSheet.reference);
      setCompositions(freshSheet.compositions);
      setCareInstructions(buildCareEntries(freshSheet.careTypes, freshSheet.careInstructions));
      setContramuestras(normalizeContraRows(freshSheet.contramuestras));
      setNovedades(freshSheet.qualityIssues);
      setMaterialsError(freshSheet.materialsError);
      setMessage({ type: 'success', text: 'Ficha Final guardada correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: `No se pudo guardar la Ficha Final: ${error.message}` });
    } finally {
      setSaving(false);
    }
  }

  if (!selectedRefId) {
    return (
      <div className="fade-in">
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2>Ficha Final y Marquillas</h2>
            <p>Selecciona una colección, año y referencia para cargar la información real.</p>
          </div>
        </div>
        <SelectorPanel
          collections={collections}
          years={years}
          references={references}
          selectedCollectionId={selectedCollectionId}
          selectedYear={selectedYear}
          selectedRefId={selectedRefId}
          onCollectionChange={handleCollectionChange}
          onYearChange={handleYearChange}
          onReferenceChange={handleReferenceChange}
          error={selectorError}
        />
      </div>
    );
  }

  if (loadingSheet) return <div className="fade-in p-8 text-center text-gray-400">Cargando Ficha Final...</div>;

  return (
    <div className="fade-in">
      <SelectorPanel
        collections={collections}
        years={years}
        references={references}
        selectedCollectionId={selectedCollectionId}
        selectedYear={selectedYear}
        selectedRefId={selectedRefId}
        onCollectionChange={handleCollectionChange}
        onYearChange={handleYearChange}
        onReferenceChange={handleReferenceChange}
        error={selectorError}
      />

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>Ficha Final y Marquillas</h2>
          <p>
            Referencia: <strong style={{ color: 'var(--primary-600)' }}>{selectedReference?.codigoMD || `MD-${selectedReference?.reference_number || ''}`}</strong>
            {' / '}<strong>{selectedReference?.codigoPT || `PT03${selectedReference?.reference_number || ''}`}</strong>
            {' — '}{selectedReference?.name || 'Sin nombre'}
          </p>
          <div className={styles.headerBadges}>
            <span className="badge badge-primary">{selectedReference?.reference_type || 'Sin tipo'}</span>
            {selectedCollection?.name && <span className="badge badge-warning">{selectedCollection.name}</span>}
            {selectedYear && <span className={styles.yearBadge}>{selectedYear}</span>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Ficha Final'}
          </button>
        </div>
      </div>

      {message && <div className={message.type === 'error' ? styles.errorMessage : styles.successMessage}>{message.text}</div>}
      {materialsError && (
        <div className={styles.warningMessage}>
          <Info size={16} /> Composición cargada, pero materiales no disponibles: {materialsError.message}. Se habilitarán cuando exista `jo.composition_materials`.
        </div>
      )}

      <div className="kpi-stat-grid">
        <Kpi label="Composición" value={kpis.composition ? 'Completa' : 'Pendiente'} sub={`${compositionTotal}% en ${activeScope}`} ok={kpis.composition} icon={<Tag size={20} />} />
        <Kpi label="Cuidados" value={kpis.care ? 'Completo' : 'Pendiente'} sub={`${careCompleted}/${careInstructions.length || 0} campos`} ok={kpis.care} icon={<Droplets size={20} />} />
        <Kpi label="Contramuestras" value={activeContramuestra ? 'Activa' : contramuestras.length ? 'Historial' : 'Pendiente'} sub={`${contramuestras.length} registradas`} ok={Boolean(activeContramuestra)} icon={<FileText size={20} />} />
        <Kpi label="Novedades" value={activeNovedades.length ? `${activeNovedades.length} Activa${activeNovedades.length > 1 ? 's' : ''}` : 'Sin Alertas'} sub={`${novedades.length} registradas`} ok={activeNovedades.length === 0} icon={<ShieldCheck size={20} />} />
      </div>

      <div className="detalle-secciones">
        <SeccionColapsable titulo="Composición Textil (Marquilla)" icono={<Tag size={18} />} accentColor="var(--temp-cold-border)" defaultOpen>
          <div className={styles.scopeTabs} role="tablist" aria-label="Scope de composición">
            {FINAL_SHEET_SCOPES.map(scope => (
              <button key={scope} type="button" className={activeScope === scope ? styles.scopeTabActive : styles.scopeTab} onClick={() => setActiveScope(scope)}>
                {scope === 'MUESTRA' ? 'Muestra' : 'Producción'}
              </button>
            ))}
          </div>
          <div className={styles.marquillaGrid}>
            <Field label="Composición USA / UK" value={currentComposition.description_usauk} onChange={value => updateComposition('description_usauk', value)} wide />
            <Field label="Composición de fibras" value={currentComposition.fiber_composition} onChange={value => updateComposition('fiber_composition', value)} wide />
            <Field label="Tipo de tejido" value={currentComposition.woven_knitted} onChange={value => updateComposition('woven_knitted', value)} />
            <Field label="Composición interior" value={currentComposition.inside_composition} onChange={value => updateComposition('inside_composition', value)} />
            <Field label="Include" value={currentComposition.include_description} onChange={value => updateComposition('include_description', value)} />
            <label className={styles.checkboxField}><input type="checkbox" checked={currentComposition.sap_registered === true} onChange={event => updateComposition('sap_registered', event.target.checked)} /> Registrada en SAP</label>
          </div>

          <div className={styles.subsectionHeader}>
            <h4>Materiales</h4><span className={styles.positionBadge}>Total: {compositionTotal}%</span>
          </div>
          {currentComposition.materials.map((item, index) => (
            <div key={item.id || `${activeScope}-${index}`} className={styles.composicionRow}>
              <input type="text" className="form-input" value={item.material} onChange={event => updateMaterial(index, 'material', event.target.value)} placeholder="Material" />
              <div className={styles.composicionPct}><input type="number" min="0" max="100" step="0.01" className="form-input" value={item.percentage} onChange={event => updateMaterial(index, 'percentage', event.target.value)} placeholder="0" /><span>%</span></div>
              <button type="button" className={styles.iconButton} onClick={() => removeMaterial(index)} title="Quitar material"><X size={16} /></button>
            </div>
          ))}
          <div className={`${styles.composicionTotal} ${styles[`composicionTotal${compositionStatus === 'ok' ? 'Ok' : compositionStatus === 'error' ? 'Error' : 'Incomplete'}`]}`}>
            <span>Total composición: {compositionTotal}%</span><span>{compositionStatus === 'ok' ? 'Completo' : compositionStatus === 'incomplete' ? 'Sin datos' : 'Debe sumar 100%'}</span>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={addMaterial} style={{ marginTop: 'var(--space-3)' }}><Plus size={14} /> Añadir material</button>
          <label className={styles.notesField}><span className="form-label">Notas</span><textarea className="form-input" rows={2} value={currentComposition.notes} onChange={event => updateComposition('notes', event.target.value)} /></label>
        </SeccionColapsable>

        <SeccionColapsable titulo="Cuidados de la Prenda" icono={<Droplets size={18} />} accentColor="var(--temp-warm-border)" defaultOpen>
          {careInstructions.length === 0 ? <p className={styles.vacio}>No hay tipos de cuidado cargados desde `jo.care_types`.</p> : (
            <div className={styles.careGrid}>
              {careInstructions.map((care, index) => (
                <div className={styles.careCard} key={care.id || `${care.care_type_id}-${index}`}>
                  <label className="form-label">{careLabel(care.care_type?.type || care.type || `ID ${care.care_type_id}`)}</label>
                  <span className={styles.catalogDescription}>{care.care_type?.description || 'Instrucción de cuidado'}</span>
                  <textarea className="form-input" rows={2} value={care.instruction || ''} onChange={event => setCareInstructions(previous => updateArrayItem(previous, index, 'instruction', event.target.value))} placeholder="Instrucción real para la etiqueta" />
                </div>
              ))}
            </div>
          )}
        </SeccionColapsable>

        <SeccionColapsable titulo="Industrialización · Contramuestras y SAP" icono={<FileText size={18} />} accentColor="var(--temp-hot-border)" defaultOpen>
          <div className={styles.sectionToolbar}><span>Historial conservado: {contramuestras.length}</span><button type="button" className="btn btn-outline btn-sm" onClick={addContramuestra}><Plus size={14} /> Nueva pendiente</button></div>
          {contramuestras.length === 0 ? <p className={styles.vacio}>No hay contramuestras registradas.</p> : (
            <div className={styles.contramuestraList}>
              {contramuestras.map((item, index) => {
                const config = CONTRAMUESTRA_STATUS[item.status] || CONTRAMUESTRA_STATUS.pendiente;
                const StatusIcon = config.icon;
                return (
                  <div className={styles.contramuestraCard} key={item.id || `new-contra-${index}`}>
                    <div className={styles.contramuestraCardHeader}>
                      <span className={styles.statusBadge} style={{ color: config.color, background: config.background }}><StatusIcon size={12} /> {config.label}</span>
                      <strong>{item.codigo_ot || 'Nueva contramuestra'}</strong>
                      {item.id && <span className={styles.recordId}>ID {item.id}</span>}
                    </div>
                    <div className={styles.contramuestraGrid}>
                      <Field label="Orden de Trabajo (OT)" value={item.codigo_ot} onChange={value => updateContra(index, 'codigo_ot', value)} required />
                      <Field label="Nombre" value={item.nombre} onChange={value => updateContra(index, 'nombre', value)} />
                      <Field label="Estado" value={item.status} onChange={value => updateContra(index, 'status', value)} select options={Object.keys(CONTRAMUESTRA_STATUS).map(status => ({ value: status, label: CONTRAMUESTRA_STATUS[status].label }))} />
                      <Field label="Talla" value={item.talla} onChange={value => updateContra(index, 'talla', value)} />
                      <Field label="Color" value={item.descripcion_color} onChange={value => updateContra(index, 'descripcion_color', value)} />
                      <Field label="Unidades cortadas" type="number" value={item.unidades_cortadas} onChange={value => updateContra(index, 'unidades_cortadas', value)} />
                      <Field label="Nota de fabricación SAP" value={item.codigo_nota} onChange={value => updateContra(index, 'codigo_nota', value)} />
                      <Field label="Fecha traslado SAP" type="date" value={item.fecha_traslado_sap} onChange={value => updateContra(index, 'fecha_traslado_sap', value)} />
                      <Field label="Fecha despacho ZF" type="date" value={item.fecha_despacho_zf} onChange={value => updateContra(index, 'fecha_despacho_zf', value)} />
                      <Field label="Fecha meta entrega" type="date" value={item.fecha_meta_entrega} onChange={value => updateContra(index, 'fecha_meta_entrega', value)} />
                      <Field label="Prioridad" type="number" min="1" max="10" value={item.prioridad} onChange={value => updateContra(index, 'prioridad', value)} />
                      <Field label="Observaciones SAP" value={item.observaciones_nota} onChange={value => updateContra(index, 'observaciones_nota', value)} />
                    </div>
                    <label className={styles.notesField}><span className="form-label">Observaciones de confección</span><textarea className="form-input" rows={2} value={item.observaciones_confeccion || ''} onChange={event => updateContra(index, 'observaciones_confeccion', event.target.value)} /></label>
                  </div>
                );
              })}
            </div>
          )}
        </SeccionColapsable>

        <SeccionColapsable titulo="Novedades de Calidad (Feedback)" icono={<AlertTriangle size={18} />} accentColor="var(--temp-fire-border)" defaultOpen={activeNovedades.length > 0}>
          {novedades.length === 0 ? <div className={styles.emptystate}><CheckCircle size={16} /> Sin novedades registradas.</div> : (
            <div className={styles.novedadList}>
              {novedades.map((issue, index) => (
                <div key={issue.id || `new-issue-${index}`} className={`${styles.novedadItem} ${issue.resolved ? styles.novedadResolved : ''}`}>
                  <div className={styles.novedadHeader}>
                    <strong>{issue.classification || 'Sin clasificación'}</strong>
                    {issue.id && <span className={styles.recordId}>ID {issue.id}</span>}
                    <label className={styles.resolvedToggle}><input type="checkbox" checked={issue.resolved === true} onChange={event => setNovedades(previous => updateArrayItem(previous, index, 'resolved', event.target.checked))} /> Resuelta</label>
                  </div>
                  <div className={styles.novedadFields}>
                    <Field label="Área" value={issue.area} onChange={value => setNovedades(previous => updateArrayItem(previous, index, 'area', value))} />
                    <Field label="Clasificación" value={issue.classification} onChange={value => setNovedades(previous => updateArrayItem(previous, index, 'classification', value))} />
                    <Field label="Material" value={issue.material} onChange={value => setNovedades(previous => updateArrayItem(previous, index, 'material', value))} />
                    <Field label="Tipo de ejecución" value={issue.execution_type} onChange={value => setNovedades(previous => updateArrayItem(previous, index, 'execution_type', value))} />
                  </div>
                  <textarea className="form-input" rows={2} value={issue.description || ''} onChange={event => setNovedades(previous => updateArrayItem(previous, index, 'description', event.target.value))} placeholder="Descripción del hallazgo" />
                  <textarea className="form-input" rows={2} value={issue.corrective_action || ''} onChange={event => setNovedades(previous => updateArrayItem(previous, index, 'corrective_action', event.target.value))} placeholder="Acción correctiva" />
                </div>
              ))}
            </div>
          )}
          <div className={styles.novedadForm}>
            <Field label="Clasificación" value={novedadDraft.classification} onChange={value => setNovedadDraft(previous => ({ ...previous, classification: value }))} required />
            <Field label="Descripción" value={novedadDraft.description} onChange={value => setNovedadDraft(previous => ({ ...previous, description: value }))} required />
          </div>
          <button type="button" className="btn btn-sm btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error-dark)', marginTop: 'var(--space-3)' }} onClick={addNovedad} disabled={!novedadDraft.classification.trim() || !novedadDraft.description.trim()}><AlertTriangle size={14} /> Registrar novedad</button>
          <div className={styles.infoNotice}><Info size={16} /> Las novedades existentes no se eliminan al guardar. Marcar una como resuelta conserva su historial.</div>
        </SeccionColapsable>
      </div>

      <div className={styles.stickyFooter}>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Guardando...' : 'Guardar Ficha Final'}</button>
      </div>
    </div>
  );
}

function buildCareEntries(types, instructions) {
  const loadedByType = new Map((instructions || []).map(item => [Number(item.care_type_id), item]));
  const knownIds = new Set((types || []).map(type => Number(type.id)));
  const entries = (types || []).map(type => ({
    ...(loadedByType.get(Number(type.id)) || {}),
    care_type_id: Number(type.id),
    care_type: type,
    instruction: loadedByType.get(Number(type.id))?.instruction || '',
  }));
  (instructions || []).forEach(instruction => {
    if (!knownIds.has(Number(instruction.care_type_id))) entries.push(instruction);
  });
  return entries;
}

function SelectorPanel({ collections, years, references, selectedCollectionId, selectedYear, selectedRefId, onCollectionChange, onYearChange, onReferenceChange, error }) {
  return (
    <div className={styles.selectorPanel}>
      <div className="form-group">
        <label className="form-label form-label-required">Colección</label>
        <select className="form-select" value={selectedCollectionId} onChange={event => onCollectionChange(event.target.value)}>
          <option value="">Seleccionar colección...</option>
          {collections.map(collection => <option key={collection.id} value={collection.id}>{collection.name} {collection.code ? `(${collection.code})` : ''}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label form-label-required">Año</label>
        <select className="form-select" value={selectedYear} onChange={event => onYearChange(event.target.value)} disabled={!selectedCollectionId}>
          <option value="">Seleccionar año...</option>
          {years.map(year => <option key={`${year.id || 'collection'}-${year.year}`} value={year.year}>{year.year}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label form-label-required">Referencia</label>
        <select className="form-select" value={selectedRefId} onChange={event => onReferenceChange(event.target.value)} disabled={!selectedYear}>
          <option value="">Seleccionar referencia...</option>
          {references.map(reference => <option key={reference.id} value={reference.id}>{reference.reference_number} · {reference.name}</option>)}
        </select>
      </div>
      {error && <div className={styles.selectorError}>{error.message}</div>}
    </div>
  );
}

function Kpi({ label, value, sub, ok, icon }) {
  return (
    <div className="kpi-stat-card" style={{ borderTopColor: ok ? 'var(--success)' : 'var(--warning)' }}>
      <div className="kpi-stat-left"><span className="kpi-stat-label">{label}</span><span className="kpi-stat-value" style={{ color: ok ? 'var(--success-dark)' : 'var(--warning-dark)', fontSize: 'var(--text-xl)' }}>{value}</span><span className="kpi-stat-sub">{sub}</span></div>
      <div className="kpi-stat-icon" style={{ background: ok ? 'var(--success-light)' : 'var(--warning-light)', color: ok ? 'var(--success-dark)' : 'var(--warning-dark)' }}>{icon}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', select = false, options = [], required = false, wide = false, min, max }) {
  return (
    <div className={`form-group ${wide ? styles.fieldWide : ''}`}>
      <label className={`form-label ${required ? 'form-label-required' : ''}`}>{label}</label>
      {select ? (
        <select className="form-select" value={value || ''} onChange={event => onChange(event.target.value)}>
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="form-input" rows={2} value={value || ''} onChange={event => onChange(event.target.value)} />
      ) : (
        <input className="form-input" type={type} min={min} max={max} value={value ?? ''} onChange={event => onChange(event.target.value)} />
      )}
    </div>
  );
}
