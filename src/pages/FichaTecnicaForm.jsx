import { useState, useRef, useEffect, startTransition } from 'react';
import { Save, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, createPilotReference, isDefinitiveCreateError, slugFromName, useCollectionYears, useColorLookup, useSearchReferences, assignMissingPilotCode, validateReferenceLineSubline } from '../lib/api';
import { PILOT_COLLECTION_CODE } from '../lib/pilotScope';
import { CLASIFICACION_OPTIONS, classificationFields } from '../lib/traceClassification';
import { useLineas, useSublineas, useTallajes, useClosures, useEmpaques, useComplejidad, useTipoPrendas, useReferenceStatuses } from '../hooks/useCatalogos';
import { useAuth } from '../context/AuthContext';
import styles from './FichaTecnicaForm.module.css';

// ── Opciones de presentación (catálogos de BD se cargan abajo) ───────────
const LARGO_OPTIONS = ['Mini', 'Midi', 'Maxi', 'Full Length', 'Hip', 'Knee Length', 'Cropped'];
const DROP_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const PRIORIDAD_OPTIONS = ['A', 'B', 'C'];
const MONTAJE_OPTIONS = ['No aplica', 'Drapeado', 'Descole', 'Prensados'];


// ── Toggle chip ──────────────────────────────────────────────
function ChipToggle({ active, onChange, children }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`${styles.chipToggle} ${active ? styles.chipToggleActive : ''}`}
    >
      {active && <CheckCircle size={13} />}
      {children}
    </button>
  );
}

// ── Sección colapsable del formulario ────────────────────────
function FormSeccion({ titulo, children, defaultOpen = true, accentColor = 'var(--primary-500)' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.seccion} style={{ borderLeftColor: accentColor }}>
      <button type="button" className={styles.seccionHeader} onClick={() => setOpen(!open)}>
        <span className={styles.seccionTitulo}>{titulo}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className={styles.seccionBody}>{children}</div>}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function FichaTecnicaForm() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data } = useDashboardData();
  const COLECCIONES_OPTIONS = (data?.colecciones || []).map(c => ({
    value: c.dbId,  // DB id para guardar en references.collection_id
    label: c.nombre,
    slug: c.id,
  }));

  const colDbToSlug = {};
  (data?.colecciones || []).forEach(c => { colDbToSlug[c.dbId] = slugFromName(c.nombre); });

  const [formData, setFormData] = useState({
    coleccion: '',
    year: '',
    referencia: '',
    nombre: '',
    tipoPrenda: '',
    color: '',
    codigoColor: '',
    linea_id: null,
    sublinea_id: null,
    tallaje_id: null,
    largo: '',
    largoCms: '',
    closure_id: null,
    codigoMD: '',
    codigoPT: '',
    clasificacion: 'SOLIDA',
    referente: '',
    referenteId: null,
    // Comercial
    prioridadFirstBuy: '',
    dropEntrega: '',
    envioCorteMaquila: false,
    envioConfeccionMaquila: false,
    status_id: '',
    complejidad_corte_id: null,
    complejidad_confeccion_id: null,
    // Procesos (toggle: null = no aplica, true = aplica)
    tieneBordado: false,
    descripcionBordado: '',
    tieneSemielaborado: false,
    montajeManiqui: '',
    tirasContinuas: '',
    empaque_id: null,
    // Nuevos campos
    linned: false,
    requiereMuestra: false,
    especificacionConfeccion: '',
  });

  const [guardado, setGuardado] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const pendingCreate = useRef(null);
  const [createError, setCreateError] = useState('');
  const [codeInputs, setCodeInputs] = useState({ MD: '', PT: '' });
  const [referenteSearch, setReferenteSearch] = useState('');
  const [referenteFocused, setReferenteFocused] = useState(false);

  const selectedColId = formData.coleccion ? parseInt(formData.coleccion) : null;
  const { years: colYears } = useCollectionYears(selectedColId);
  const { color: matchedColor, loading: colorLoading } = useColorLookup(formData.codigoColor);
  const { results: referenteResults, loading: referenteLoading } = useSearchReferences(referenteSearch, selectedColId);

  // ── Hooks de catálogos desde BD ────────────────────────────
  const { data: lineas } = useLineas();
  const { data: sublineas, loading: sublineasLoading } = useSublineas(formData.linea_id);
  const { data: tallajes } = useTallajes();
  const { data: closures } = useClosures();
  const { data: empaques } = useEmpaques();
  const { data: complejidad } = useComplejidad();
  const { data: tiposPrenda, loading: tiposLoading, error: tiposError } = useTipoPrendas();
  const { data: estados, loading: estadosLoading, error: estadosError } = useReferenceStatuses();

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleInput = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  useEffect(() => {
    if (matchedColor && matchedColor.name) {
      startTransition(() => set('color', matchedColor.name));
    }
  }, [matchedColor]);

  const validate = () => {
    const err = {};
    if (!formData.coleccion) err.coleccion = 'Requerido';
    if (!formData.year) err.year = 'Requerido';
    if (!formData.referencia) err.referencia = 'Requerido';
    else if (!/^\d+$/.test(formData.referencia)) err.referencia = 'Debe ser un numero entero positivo';
    if (!formData.tipoPrenda) err.tipoPrenda = 'Requerido';
    if (tiposError) err.tipoPrenda = 'No se pudo cargar el catálogo';
    if (!formData.nombre) err.nombre = 'Requerido';
    if (!formData.color) err.color = 'Requerido';
    if (!formData.codigoColor) err.codigoColor = 'Digita el codigo de color';
    const lineSublineError = validateReferenceLineSubline({
      line_id: formData.linea_id,
      subline_id: formData.sublinea_id,
      availableSublines: sublineasLoading ? null : sublineas,
    });
    if (lineSublineError) {
      if (!formData.linea_id) err.sublinea_id = lineSublineError;
      else err.sublinea_id = lineSublineError;
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (PILOT_COLLECTION_CODE !== 'SS27') {
      setCreateError('Creación no disponible fuera del piloto SS27 aislado.');
      return;
    }
    if (!pendingCreate.current && !validate()) return;

    setSaving(true);
    setCreateError('');
    try {
      const refNum = formData.referencia.trim();
      const collectionId = parseInt(formData.coleccion);
      const yearInt = parseInt(formData.year);
      const largoCmsVal = formData.largoCms ? parseInt(formData.largoCms) : null;
      const core = {
        collection_id: collectionId,
        year: yearInt,
        reference_number: refNum,
        name: formData.nombre,
        color: formData.color,
        color_code: formData.codigoColor || null,
        length_description: formData.largo || null,
        length_cm: largoCmsVal,
        has_embroidery: formData.tieneBordado,
        embroidery_description: formData.tieneBordado ? formData.descripcionBordado.trim() || null : null,
        has_semielaborated: formData.tieneSemielaborado,
         priority_first_buy: formData.prioridadFirstBuy ? PRIORIDAD_OPTIONS.indexOf(formData.prioridadFirstBuy) + 1 : null,
         drop_entrega: formData.dropEntrega || null,
         envio_corte_maquila: formData.envioCorteMaquila,
         envio_confeccion_maquila: formData.envioConfeccionMaquila,
         tipo_prenda_id: Number(formData.tipoPrenda),
         ...(isAdmin && formData.status_id ? { status_id: Number(formData.status_id) } : {}),
        complejidad_corte_id: formData.complejidad_corte_id,
        complejidad_confeccion_id: formData.complejidad_confeccion_id,
        ...classificationFields(formData.clasificacion),
        line_id: formData.linea_id,
        subline_id: formData.sublinea_id,
        closure_type_id: formData.closure_id,
        tallaje_group_id: formData.tallaje_id,
        package_type_id: formData.empaque_id,
        linned: formData.linned,
        requiere_muestra: formData.requiereMuestra,
        tiras_continuas: formData.tirasContinuas || null,
        especificacion_confeccion: formData.especificacionConfeccion || null,
        montage_type: formData.montajeManiqui || null,
        referent_reference_id: formData.referenteId || null,
      };
      // Reintentos con respuesta incierta reutilizan ID y payload originales.
      if (!pendingCreate.current) pendingCreate.current = { requestId: crypto.randomUUID(), payload: core };
      const { data: newRef, error: createErr } = await createPilotReference(pendingCreate.current.payload, pendingCreate.current.requestId);

      if (createErr) throw createErr;
      pendingCreate.current = null;
      const requests = { MD: isAdmin ? formData.codigoMD.trim() : '', PT: isAdmin ? formData.codigoPT.trim() : '' };
      setCodeInputs(requests);
      const saved = { dbId: newRef.id, collectionSlug: colDbToSlug[collectionId], year: yearInt,
        codes: { MD: { code: requests.MD, assigned: false }, PT: { code: requests.PT, assigned: false } } };
      setGuardado(saved);
      // Los códigos son POSTCOMMIT: un fallo no oculta la ficha ya confirmada.
      if (isAdmin) {
        for (const type of ['MD', 'PT']) {
          if (!requests[type]) continue;
          try {
            await assignMissingPilotCode(newRef.id, type, requests[type]);
            saved.codes[type] = { code: requests[type], assigned: true };
          } catch (codeError) {
            saved.codes[type] = { code: requests[type], assigned: false, error: codeError.message };
          }
          setGuardado({ ...saved, codes: { ...saved.codes } });
        }
      }
    } catch (err) {
      if (isDefinitiveCreateError(err)) pendingCreate.current = null;
      setCreateError(isDefinitiveCreateError(err)
        ? `No se creó la ficha: ${err.message}. Corrige los datos y vuelve a intentar.`
        : `No se confirmó la creación. Reintentar conserva el mismo intento: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const retryCode = async type => {
    if (!guardado?.dbId || saving || guardado.codes[type]?.assigned) return;
    const code = codeInputs[type]?.trim();
    if (!code) return;
    setSaving(true);
    try {
      await assignMissingPilotCode(guardado.dbId, type, code);
      setGuardado(previous => ({ ...previous, codes: { ...previous.codes, [type]: { code, assigned: true } } }));
    } catch (error) {
      setGuardado(previous => ({ ...previous, codes: { ...previous.codes, [type]: { code, assigned: false, error: error.message } } }));
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setGuardado(false);
    pendingCreate.current = null;
    setCreateError('');
    setCodeInputs({ MD: '', PT: '' });
    setErrors({});
    setFormData(prev => ({ ...prev, referencia: '', nombre: '', tipoPrenda: '', color: '', codigoColor: '',
      codigoMD: '', codigoPT: '', largoCms: '', referente: '', referenteId: null,
      linea_id: null, sublinea_id: null, status_id: '',
      prioridadFirstBuy: '', dropEntrega: '', complejidad_corte_id: null,
      complejidad_confeccion_id: null, empaque_id: null,
      envioCorteMaquila: false, envioConfeccionMaquila: false,
      linned: false, requiereMuestra: false, tieneBordado: false,
      tieneSemielaborado: false, montajeManiqui: '',
      descripcionBordado: '',
    }));
    setReferenteSearch('');
  };

  // ── Vista de éxito ──────────────────────────────────────────
  if (guardado) {
    return (
      <div className="fade-in" style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 8 }}>
            ¡Referencia Creada!
          </h2>
          <p>Ficha confirmada. Los códigos MD/PT son asignaciones posteriores opcionales.</p>
          {(['MD','PT']).map(type => <div key={type} style={{ margin: 12 }}>
            <strong>{type}: {guardado.codes[type].assigned ? `Asignado ${guardado.codes[type].code}` : 'Pendiente / sin asignar'}</strong>
            {!guardado.codes[type].assigned && isAdmin && <>
              <input className="form-input" aria-label={`Código ${type} pendiente`} value={codeInputs[type]}
                onChange={e => setCodeInputs(prev => ({ ...prev, [type]: e.target.value }))} />
              <button className="btn btn-secondary" disabled={saving || !codeInputs[type]?.trim()}
                onClick={() => retryCode(type)}>Asignar / reintentar solo {type}</button>
            </>}
            {guardado.codes[type].error && <p role="alert" className="form-error">{guardado.codes[type].error}</p>}
          </div>)}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/colecciones/${guardado.collectionSlug}/${guardado.year}`)}>
              Ver en Colecciones
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              Nueva Referencia
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h2 className={styles.titulo}>Nueva Ficha Técnica</h2>
          <p className={styles.subtitulo}>Fase 2.1 · Inicio de Coleccion</p>
        </div>
        <span className="badge badge-primary">Área Creativa</span>
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.body}>
        {createError && <p role="alert" className="form-error">{createError}</p>}
        {pendingCreate.current && <p role="status">Reintento del mismo intento. Los cambios de formulario no se aplicarán hasta confirmar o iniciar otra ficha.</p>}
        {pendingCreate.current && <button type="button" className="btn btn-secondary" onClick={() => {
          if (window.confirm('Si el servidor sí creó la ficha, descartarla aquí no la elimina. ¿Abandonar este intento y corregir el formulario?')) {
            pendingCreate.current = null;
            setCreateError('Intento descartado. Comprueba si ya existe la referencia antes de crear otra.');
          }
        }}>Descartar intento</button>}

        {/* ── SECCIÓN 1: Identificación básica ── */}
        <FormSeccion titulo="📋  Identificación y Perfil" accentColor="var(--temp-cold-border)">
          <div className={styles.grid3}>
            {/* Coleccion */}
            <div className="form-group">
              <label className="form-label form-label-required">Coleccion</label>
              <select name="coleccion" className={`form-select ${errors.coleccion ? 'input-error' : ''}`}
                value={formData.coleccion} onChange={(e) => { handleInput(e); set('year', ''); set('codigoColor', ''); set('referente', ''); set('referenteId', null); setReferenteSearch(''); }} required>
                <option value="">Selecciona...</option>
                {COLECCIONES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.coleccion && <span className="form-error">{errors.coleccion}</span>}
            </div>

            {/* Ano */}
            <div className="form-group">
              <label className="form-label form-label-required">Año</label>
              <select name="year" className={`form-select ${errors.year ? 'input-error' : ''}`}
                value={formData.year} onChange={handleInput} required
                disabled={!formData.coleccion}>
                <option value="">Selecciona...</option>
                {(colYears || []).filter(y => !y.is_hidden).map(y => (
                  <option key={y.id} value={y.year}>{y.year}</option>
                ))}
              </select>
              {!formData.coleccion && <span className="form-help">Selecciona una coleccion primero</span>}
              {errors.year && <span className="form-error">{errors.year}</span>}
            </div>

            {/* Numero de Referencia */}
            <div className="form-group">
              <label className="form-label form-label-required">Referencia #</label>
              <input type="number" name="referencia" min="1" step="1"
                className={`form-input ${errors.referencia ? 'input-error' : ''}`}
                value={formData.referencia} onChange={handleInput}
                placeholder="Ej. 19" />
              {errors.referencia && <span className="form-error">{errors.referencia}</span>}
              <span className="form-help">Numero unico. Si ya existe, se mostrara error.</span>
            </div>

            {/* Tipo de Prenda */}
            <div className="form-group">
              <label className="form-label form-label-required">Tipo de Prenda</label>
              <select name="tipoPrenda" className={`form-select ${errors.tipoPrenda ? 'input-error' : ''}`}
                value={formData.tipoPrenda} onChange={handleInput} required>
                <option value="">Selecciona...</option>
                 {tiposPrenda.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {tiposLoading && <span className="form-help">Cargando tipos...</span>}
              {tiposError && <span role="alert" className="form-error">{tiposError.message}</span>}
              {errors.tipoPrenda && <span className="form-error">{errors.tipoPrenda}</span>}
            </div>

            {/* Nombre / Descripción */}
            <div className="form-group">
              <label className="form-label form-label-required">Nombre de la Referencia</label>
              <input type="text" name="nombre" className={`form-input ${errors.nombre ? 'input-error' : ''}`}
                value={formData.nombre} onChange={handleInput}
                placeholder="Ej. IVORY DRAMATIC MAXI DRESS" />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            {/* Código color — input con autocompletado desde BD */}
            <div className="form-group">
              <label className="form-label form-label-required">Código de Color</label>
              <input type="text" name="codigoColor"
                className={`form-input ${errors.codigoColor ? 'input-error' : ''}`}
                value={formData.codigoColor}
                onChange={handleInput}
                placeholder="Digita el código numérico (ej. 0001)"
                autoComplete="off" />
              {errors.codigoColor && <span className="form-error">{errors.codigoColor}</span>}
              {colorLoading && <span className="form-help">Buscando...</span>}
              {!colorLoading && formData.codigoColor && !matchedColor && (
                <span className="form-help" style={{ color: 'var(--orange-500)' }}>Código no encontrado en la base</span>
              )}
            </div>

            {/* Color — auto-fill desde código, editable */}
            <div className="form-group">
              <label className="form-label form-label-required">Color</label>
              <input type="text" name="color" className={`form-input ${errors.color ? 'input-error' : ''}`}
                value={formData.color} onChange={handleInput}
                placeholder={matchedColor ? '' : 'Se auto-completa al digitar el código'} />
              {errors.color && <span className="form-error">{errors.color}</span>}
            </div>

            {/* MD / PT — solo admin */}
            {isAdmin && (
              <>
                <div className="form-group">
                  <label className="form-label">Código MD <span className="badge badge-primary" style={{ fontSize: 10, verticalAlign: 'middle' }}>Admin</span></label>
                  <input type="text" name="codigoMD" className="form-input"
                    value={formData.codigoMD}
                    onChange={handleInput}
                    placeholder={`MD-${String(formData.referencia || '___').padStart(3, '0')}`} />
                  <span className="form-help">Prefijo MD- seguido del número de referencia.</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Código PT <span className="badge badge-primary" style={{ fontSize: 10, verticalAlign: 'middle' }}>Admin</span></label>
                  <input type="text" name="codigoPT" className="form-input"
                    value={formData.codigoPT}
                    onChange={handleInput}
                    placeholder={`PT03${String(formData.referencia || '___').padStart(3, '0')}`} />
                  <span className="form-help">Prefijo PT03 seguido del número de referencia.</span>
                </div>
              </>
            )}

            {/* Largo */}
            <div className="form-group">
              <label className="form-label">Largo</label>
              <select name="largo" className="form-select" value={formData.largo} onChange={handleInput}>
                <option value="">Selecciona...</option>
                {LARGO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Largo Cms — nuevo campo numérico */}
            <div className="form-group">
              <label className="form-label">Largo Cms</label>
              <input type="number" name="largoCms" min="0" step="1"
                className="form-input"
                value={formData.largoCms} onChange={handleInput}
                placeholder="Ej. 120" />
              <span className="form-help">Largo en centimetros (numerico)</span>
            </div>

            {/* Referente — selector con busqueda */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Referente Base (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <input type="text" className="form-input"
                  value={referenteFocused ? referenteSearch : (formData.referente || referenteSearch)}
                  onChange={(e) => {
                    setReferenteSearch(e.target.value);
                    setReferenteFocused(true);
                    if (!e.target.value) {
                      set('referente', '');
                      set('referenteId', null);
                    }
                  }}
                  onFocus={() => {
                    setReferenteFocused(true);
                    if (formData.referente && !referenteSearch) setReferenteSearch(formData.referente);
                  }}
                  onBlur={() => setTimeout(() => setReferenteFocused(false), 200)}
                  placeholder="Buscar por codigo PT o nombre..."
                  autoComplete="off" />
                <Search size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--gray-400)', pointerEvents: 'none' }} />
              </div>
              {referenteFocused && referenteSearch.length >= 2 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 8,
                  boxShadow: 'var(--shadow-lg)', maxHeight: 200, overflowY: 'auto',
                }}>
                  {referenteLoading && <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--gray-400)' }}>Buscando...</div>}
                  {!referenteLoading && referenteResults.length === 0 && (
                    <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--gray-400)' }}>Sin resultados</div>
                  )}
                  {referenteResults.map(ref => (
                    <div key={ref.id}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                        borderBottom: '1px solid var(--gray-100)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onMouseDown={() => {
                        const label = `Ref #${ref.reference_number} – ${ref.name || '(sin nombre)'}`;
                        set('referente', label);
                        set('referenteId', ref.id);
                        setReferenteSearch(label);
                        setReferenteFocused(false);
                      }}>
                      <span style={{ fontWeight: 600 }}>
                         Ref #{ref.reference_number}
                      </span>
                      <span style={{ color: 'var(--gray-500)', flex: 1, marginLeft: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ref.name || '(sin nombre)'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 8 }}>
                        {ref.collections?.code || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <span className="form-help">Si aplica, heredara molderia base. Busca por codigo PT03XXX o nombre.</span>
            </div>

            {/* Línea */}
            <div className="form-group">
               <label className="form-label">Línea</label>
              <select name="linea_id" className={`form-select ${errors.linea_id ? 'input-error' : ''}`} value={formData.linea_id || ''} onChange={(e) => {
                set('linea_id', e.target.value ? parseInt(e.target.value) : null);
                set('sublinea_id', null);
              }}>
                <option value="">Selecciona...</option>
                {lineas.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
              </select>
              {errors.linea_id && <span className="form-error">{errors.linea_id}</span>}
            </div>

            {/* Sublínea */}
            <div className="form-group">
               <label className="form-label">Sublínea</label>
              <select name="sublinea_id" className={`form-select ${errors.sublinea_id ? 'input-error' : ''}`} value={formData.sublinea_id || ''} disabled={!formData.linea_id || sublineasLoading} onChange={(e) => set('sublinea_id', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Selecciona...</option>
                {sublineas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {!formData.linea_id && <span className="form-help">Selecciona una línea primero</span>}
              {errors.sublinea_id && <span className="form-error">{errors.sublinea_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tipo-ref-derived">Tipo Ref (línea)</label>
              <input id="tipo-ref-derived" className="form-input" readOnly value={lineas.find(l => l.id === formData.linea_id)?.code || ''} />
            </div>

            {isAdmin && <div className="form-group">
              <label className="form-label" htmlFor="status-general-create">Estado general</label>
              <select id="status-general-create" className="form-select" value={formData.status_id} onChange={e => set('status_id', e.target.value)}>
                <option value="">EN_PROCESO (predeterminado)</option>
                {estados.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
              </select>
              {estadosLoading && <span className="form-help">Cargando estados...</span>}
              {estadosError && <span role="alert" className="form-error">{estadosError.message}</span>}
            </div>}

            {/* Clasificación */}
            <div className="form-group">
              <label className="form-label">Clasificación de Trazo</label>
              <select name="clasificacion" className="form-select" value={formData.clasificacion} onChange={handleInput}>
                {CLASIFICACION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Tallaje */}
            <div className="form-group">
              <label className="form-label">Tallaje</label>
              <select name="tallaje_id" className="form-select" value={formData.tallaje_id || ''} onChange={(e) => set('tallaje_id', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Selecciona...</option>
                {tallajes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Closure */}
            <div className="form-group">
              <label className="form-label">Closure / Cierre</label>
              <select name="closure_id" className="form-select" value={formData.closure_id || ''} onChange={(e) => set('closure_id', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Selecciona...</option>
                {closures.map(c => <option key={c.id} value={c.id}>{c.type}</option>)}
              </select>
            </div>
          </div>
        </FormSeccion>

        {/* ── SECCIÓN 2: Datos Comerciales ── */}
        <FormSeccion titulo="💼  Comercial" accentColor="var(--primary-500)">
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Prioridad First Buy</label>
              <div className={styles.chipGroup}>
                {PRIORIDAD_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.prioridadFirstBuy === o}
                    onChange={() => set('prioridadFirstBuy', formData.prioridadFirstBuy === o ? '' : o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Drop de Entrega</label>
              <div className={styles.chipGroup}>
                {DROP_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.dropEntrega === o}
                    onChange={() => set('dropEntrega', formData.dropEntrega === o ? '' : o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

          </div>
        </FormSeccion>
        <FormSeccion titulo="Complejidad" accentColor="var(--primary-500)">
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Complejidad de Corte</label>
              <div className={styles.chipGroup}>
                {complejidad.map(c => (
                  <ChipToggle key={c.id} active={formData.complejidad_corte_id === c.id}
                     onChange={() => set('complejidad_corte_id', formData.complejidad_corte_id === c.id ? null : c.id)}>{c.level}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complejidad de Confección</label>
              <div className={styles.chipGroup}>
                {complejidad.map(c => (
                  <ChipToggle key={c.id} active={formData.complejidad_confeccion_id === c.id}
                     onChange={() => set('complejidad_confeccion_id', formData.complejidad_confeccion_id === c.id ? null : c.id)}>{c.level}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Maquila corte</label>
              <ChipToggle active={formData.envioCorteMaquila} onChange={v => set('envioCorteMaquila', v)}>Enviar corte</ChipToggle>
            </div>
            <div className="form-group">
              <label className="form-label">Maquila confección</label>
              <ChipToggle active={formData.envioConfeccionMaquila} onChange={v => set('envioConfeccionMaquila', v)}>Enviar confección</ChipToggle>
            </div>
          </div>
        </FormSeccion>
        <FormSeccion titulo="Empaque" accentColor="var(--primary-500)">
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Tipo de Empaque</label>
              <div className={styles.chipGroup}>
                {empaques.map(e => (
                  <ChipToggle key={e.id} active={formData.empaque_id === e.id}
                     onChange={() => set('empaque_id', formData.empaque_id === e.id ? null : e.id)}>{e.name}</ChipToggle>
                ))}
              </div>
            </div>
          </div>
        </FormSeccion>

        {/* ── SECCIÓN 3: Procesos Especiales ── */}
        <FormSeccion titulo="⚙️  Procesos Especiales" accentColor="var(--temp-cold-border)">
          <p className="form-help" style={{ marginBottom: 16 }}>
             Indica si aplica cada proceso. Las subfases automáticas quedan diferidas.
          </p>
          <div className={styles.grid3}>

            <div className="form-group">
              <label className="form-label">¿Tiene Forro? (Linned)</label>
              <div className={styles.chipGroup}>
                 <ChipToggle active={formData.linned} onChange={v => set('linned', v)}>Sí</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">¿Requiere Muestra?</label>
              <div className={styles.chipGroup}>
                 <ChipToggle active={formData.requiereMuestra} onChange={v => set('requiereMuestra', v)}>Sí</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bordado en Prenda</label>
              <div className={styles.chipGroup}>
                 <ChipToggle active={formData.tieneBordado} onChange={v => set('tieneBordado', v)}>Aplica</ChipToggle>
              </div>
              {formData.tieneBordado && (
                <input type="text" className="form-input mt-2" placeholder="Descripción del bordado..."
                  name="descripcionBordado" value={formData.descripcionBordado} onChange={handleInput} />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Semielaborados</label>
              <div className={styles.chipGroup}>
                 <ChipToggle active={formData.tieneSemielaborado} onChange={v => set('tieneSemielaborado', v)}>Aplica</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Montaje en Maniquí</label>
              <div className={styles.chipGroup} style={{ flexWrap: 'wrap' }}>
                {MONTAJE_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.montajeManiqui === o}
                     onChange={() => set('montajeManiqui', formData.montajeManiqui === o ? '' : o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Tiras Continuas</label>
              <textarea 
                name="tirasContinuas" 
                className="form-input"
                value={formData.tirasContinuas} 
                onChange={handleInput}
                placeholder="Describe las características de las tiras continuas (vacío = No aplica)"
                rows={2}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Especificación de Confección</label>
              <textarea 
                name="especificacionConfeccion" 
                className="form-input"
                value={formData.especificacionConfeccion} 
                onChange={handleInput}
                placeholder="Indicaciones especiales para el taller de confección"
                rows={2}
              />
            </div>

          </div>
        </FormSeccion>

        {/* ── Acciones ── */}
        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
           <button type="submit" className="btn btn-primary" disabled={saving || tiposLoading || Boolean(tiposError)}>
            <Save size={18} />
            {saving ? 'Guardando...' : pendingCreate.current ? 'Reintentar creación' : 'Crear ficha'}
          </button>
        </div>

      </form>
    </div>
  );
}
