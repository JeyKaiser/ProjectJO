import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, User, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, createReference, useCollectionYears, useColorLookup, useSearchReferences, assignCode } from '../lib/api';
import supabase from '../lib/supabase';
import { useLineas, useSublineas, useTallajes, useClosures, useEmpaques, useComplejidad } from '../hooks/useCatalogos';
import { usePersonsByArea } from '../hooks/usePersons';
import { useAuth } from '../context/AuthContext';
import styles from './FichaTecnicaForm.module.css';

// ── Catálogos (mantenidos como constantes UI) ────────────────
const TIPO_PRENDA_OPTIONS = [
  'Vestido', 'Pantalón', 'Falda', 'Blazer', 'Jacket', 'Abrigo',
  'Jumpsuit', 'Top', 'Blusa', 'Camisa', 'Shorts', 'Cardigan', 'Vest','Otro',
];

const LARGO_OPTIONS = ['Mini', 'Midi', 'Maxi', 'Full Length', 'Hip', 'Knee Length', 'Cropped'];
const DROP_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const PRIORIDAD_OPTIONS = ['A', 'B', 'C'];
const MONTAJE_OPTIONS = ['No aplica', 'Drapeado', 'Descole', 'Prensados'];

const CLASIFICACION_OPTIONS = [
  { value: 'Sólida', label: 'Sólida' },
  { value: 'Mod. Arte', label: 'Modificación de Arte' },
  { value: 'Ubicación Trazo', label: 'Ubicación en Trazo' },
];

// Roles de personas involucradas en el ciclo de vida
const ROLES_EQUIPO = [
  { key: 'disenadorCreativo', label: 'Diseñador(a) Creativo(a)', fase: '2.1 Inicio de Coleccion', requerido: true, area: 'creativos' },
  // { key: 'patronista',        label: 'Patronista / Moldería', fase: '2.2 Prototipos (Moldería)', requerido: false, area: 'tecnicos' },
  { key: 'disenadorTecnico',  label: 'Diseñador(a) Técnico(a)', fase: '3.2 Costeo (Tecnicos)', requerido: false, area: 'tecnicos' },
  // { key: 'cortador',          label: 'Cortador(a)', fase: '2.3 Corte', requerido: false, area: 'cortadores' },
  { key: 'modista',           label: 'Modista / Confección', fase: '2.4 Confeccion', requerido: false, area: 'modistas' },
  // { key: 'bordadora',         label: 'Bordadora / Proceso Especial', fase: '2.5 Bordado', requerido: false, area: 'bordadoras' },
  { key: 'trazador',          label: 'Trazador(a)', fase: '3.5 Ubicaciones de Trazo', requerido: false, area: 'trazadores' },
  { key: 'equipoConsumos',    label: 'Equipo Consumos / Validación', fase: '4.3 Industrializacion', requerido: false, area: 'especificadoras' },
];

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
  const colDbToSeason = {};
  (data?.colecciones || []).forEach(c => { colDbToSlug[c.dbId] = c.id; colDbToSeason[c.dbId] = (c.season || '').toLowerCase(); });

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
    clasificacion: 'Sólida',
    referente: '',
    referenteId: null,
    // Comercial
    prioridadFirstBuy: 'A',
    dropEntrega: 'A',
    enviarMaquila: false,
    complejidad_corte_id: null,
    complejidad_confeccion_id: null,
    // Procesos (toggle: null = no aplica, true = aplica)
    tieneBordado: false,
    tieneSemielaborado: false,
    montajeManiqui: 'No aplica',
    tirasContinuas: '',
    includes: '',
    empaque_id: null,
    // Nuevos campos
    linned: false,
    requiereMuestra: false,
    especificacionConfeccion: '',
    // Equipo
    disenadorCreativo: '',
    disenadorTecnico: '',
    modista: '',
    trazador: '',
    equipoConsumos: '',
    // Boceto
    boceto: null,
  });

  const [guardado, setGuardado] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [referenteSearch, setReferenteSearch] = useState('');
  const [referenteFocused, setReferenteFocused] = useState(false);

  const selectedColId = formData.coleccion ? parseInt(formData.coleccion) : null;
  const { years: colYears } = useCollectionYears(selectedColId);
  const { color: matchedColor, loading: colorLoading } = useColorLookup(formData.codigoColor);
  const { results: referenteResults, loading: referenteLoading } = useSearchReferences(referenteSearch, selectedColId);

  // ── Hooks de catálogos desde BD ────────────────────────────
  const { data: lineas } = useLineas();
  const { data: sublineas } = useSublineas(formData.linea_id);
  const { data: tallajes } = useTallajes();
  const { data: closures } = useClosures();
  const { data: empaques } = useEmpaques();
  const { data: complejidad } = useComplejidad();

  // ── Hooks de personas desde BD ─────────────────────────────
  const { data: personasCreativos } = usePersonsByArea('creativos');
  const { data: personasTecnicos } = usePersonsByArea('tecnicos');
  const { data: personasModistas } = usePersonsByArea('modistas');
  const { data: personasTrazadores } = usePersonsByArea('trazadores');
  const { data: personasEspecificadoras } = usePersonsByArea('especificadoras');

  const personasMap = {
    creativos: personasCreativos,
    tecnicos: personasTecnicos,
    modistas: personasModistas,
    trazadores: personasTrazadores,
    especificadoras: personasEspecificadoras,
  };

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleInput = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  useEffect(() => {
    if (matchedColor && matchedColor.name) {
      set('color', matchedColor.name);
    }
  }, [matchedColor]);

  const validate = () => {
    const err = {};
    if (!formData.coleccion) err.coleccion = 'Requerido';
    if (!formData.year) err.year = 'Requerido';
    if (!formData.referencia) err.referencia = 'Requerido';
    else if (!/^\d+$/.test(formData.referencia)) err.referencia = 'Debe ser un numero entero positivo';
    if (!formData.tipoPrenda) err.tipoPrenda = 'Requerido';
    if (!formData.nombre) err.nombre = 'Requerido';
    if (!formData.color) err.color = 'Requerido';
    if (!formData.codigoColor) err.codigoColor = 'Digita el codigo de color';
    if (!formData.disenadorCreativo) err.disenadorCreativo = 'El diseñador creativo es obligatorio';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const refNum = formData.referencia.trim();
      const collectionId = parseInt(formData.coleccion);
      const yearInt = parseInt(formData.year);

      // Verificar unicidad del reference_number
      const { data: existingRef } = await supabase
        .from('references')
        .select('id')
        .eq('reference_number', refNum)
        .maybeSingle();

      if (existingRef) {
        setErrors(prev => ({ ...prev, referencia: 'Este numero de referencia ya existe' }));
        setSaving(false);
        return;
      }

      const largoCmsVal = formData.largoCms ? parseInt(formData.largoCms) : null;

      const { data: newRef, error: createErr } = await createReference({
        collection_id: collectionId,
        year: yearInt,
        reference_number: refNum,
        name: formData.nombre,
        color: formData.color,
        color_code: formData.codigoColor || null,
        length_description: formData.largo || null,
        length_cm: largoCmsVal,
        has_embroidery: formData.tieneBordado,
        has_semielaborated: formData.tieneSemielaborado,
        priority_first_buy: PRIORIDAD_OPTIONS.indexOf(formData.prioridadFirstBuy) + 1,
        drop_entrega: formData.dropEntrega,
        complejidad_corte_id: formData.complejidad_corte_id,
        complejidad_confeccion_id: formData.complejidad_confeccion_id,
        has_art_modification: formData.clasificacion === 'Mod. Arte',
        has_trace_location: formData.clasificacion === 'Ubicacion Trazo',
        has_all_over: false,
        line_id: formData.linea_id,
        subline_id: formData.sublinea_id,
        closure_type_id: formData.closure_id,
        tallaje_group_id: formData.tallaje_id,
        package_type_id: formData.empaque_id,
        status_id: 2,
        linned: formData.linned,
        requiere_muestra: formData.requiereMuestra,
        tiras_continuas: formData.tirasContinuas || null,
        especificacion_confeccion: formData.especificacionConfeccion || null,
      });

      if (createErr) throw createErr;

      // Si hay referente seleccionado, guardar en references_referents
      if (formData.referenteId && newRef) {
        await supabase
          .from('references_referents')
          .insert({
            reference_id: newRef.id,
            referent_reference_id: formData.referenteId,
            relationship: 'MOLDERIA_BASE',
          });
      }

      // Admin: guardar codigos MD/PT en reference_codes
      if (isAdmin && newRef) {
        const mdCode = formData.codigoMD || `MD-${refNum}`;
        const ptCode = formData.codigoPT || `PT03${refNum}`;
        await assignCode(newRef.id, 'MD', mdCode, 'admin');
        await assignCode(newRef.id, 'PT', ptCode, 'admin');
      }

      const nuevoMD = formData.codigoMD || `MD-${refNum}`;
      const nuevoPT = formData.codigoPT || `PT03${refNum}`;
      setGuardado({ codigoMD: nuevoMD, codigoPT: nuevoPT, collectionSlug: colDbToSlug[collectionId], seasonCode: colDbToSeason[collectionId] || 'ws', year: yearInt });
    } catch (err) {
      alert('Error al crear la referencia: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGuardado(false);
    setErrors({});
    setFormData(prev => ({ ...prev, referencia: '', nombre: '', color: '', codigoColor: '', codigoMD: '', codigoPT: '', largoCms: '', referente: '', referenteId: null }));
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
          <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
            La referencia ha sido registrada en <strong>Fase 2.1 · Inicio de Coleccion</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <span className="code-badge code-md" style={{ fontSize: 16, padding: '6px 16px' }}>{guardado.codigoMD}</span>
            <span className="code-badge code-pt" style={{ fontSize: 16, padding: '6px 16px' }}>{guardado.codigoPT}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/colecciones/${guardado.seasonCode}/${guardado.collectionSlug}/${guardado.year}`)}>
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
                {TIPO_PRENDA_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
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
                        const label = `PT03${String(ref.reference_number).padStart(3, '0')} – ${ref.name || '(sin nombre)'}`;
                        set('referente', label);
                        set('referenteId', ref.id);
                        setReferenteSearch(label);
                        setReferenteFocused(false);
                      }}>
                      <span style={{ fontWeight: 600 }}>
                        PT03{String(ref.reference_number).padStart(3, '0')}
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
              <select name="linea_id" className="form-select" value={formData.linea_id || ''} onChange={(e) => {
                set('linea_id', e.target.value ? parseInt(e.target.value) : null);
                set('sublinea_id', null);
              }}>
                <option value="">Selecciona...</option>
                {lineas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            {/* Sublínea */}
            <div className="form-group">
              <label className="form-label">Sublínea</label>
              <select name="sublinea_id" className="form-select" value={formData.sublinea_id || ''} onChange={(e) => set('sublinea_id', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Selecciona...</option>
                {sublineas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

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
        <FormSeccion titulo="💼  Datos Comerciales y Complejidad" accentColor="var(--primary-500)">
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Prioridad First Buy</label>
              <div className={styles.chipGroup}>
                {PRIORIDAD_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.prioridadFirstBuy === o}
                    onChange={() => set('prioridadFirstBuy', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Drop de Entrega</label>
              <div className={styles.chipGroup}>
                {DROP_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.dropEntrega === o}
                    onChange={() => set('dropEntrega', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">¿Enviar a Maquila?</label>
              <div className={styles.chipGroup}>
                <ChipToggle active={formData.enviarMaquila === false}
                  onChange={() => set('enviarMaquila', false)}>No aplica</ChipToggle>
                <ChipToggle active={formData.enviarMaquila === true}
                  onChange={() => set('enviarMaquila', true)}>Sí, enviar</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complejidad de Corte</label>
              <div className={styles.chipGroup}>
                {complejidad.map(c => (
                  <ChipToggle key={c.id} active={formData.complejidad_corte_id === c.id}
                    onChange={() => set('complejidad_corte_id', c.id)}>{c.level}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complejidad de Confección</label>
              <div className={styles.chipGroup}>
                {complejidad.map(c => (
                  <ChipToggle key={c.id} active={formData.complejidad_confeccion_id === c.id}
                    onChange={() => set('complejidad_confeccion_id', c.id)}>{c.level}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Empaque</label>
              <div className={styles.chipGroup}>
                {empaques.map(e => (
                  <ChipToggle key={e.id} active={formData.empaque_id === e.id}
                    onChange={() => set('empaque_id', e.id)}>{e.name}</ChipToggle>
                ))}
              </div>
            </div>
          </div>
        </FormSeccion>

        {/* ── SECCIÓN 3: Procesos Especiales ── */}
        <FormSeccion titulo="⚙️  Procesos Especiales" accentColor="var(--temp-cold-border)">
          <p className="form-help" style={{ marginBottom: 16 }}>
            Indica si aplica cada proceso. Los ítems marcados como "Aplica" generarán una subfase de seguimiento.
          </p>
          <div className={styles.grid3}>

            <div className="form-group">
              <label className="form-label">¿Tiene Forro? (Linned)</label>
              <div className={styles.chipGroup}>
                <ChipToggle active={!formData.linned} onChange={() => set('linned', false)}>No</ChipToggle>
                <ChipToggle active={formData.linned} onChange={() => set('linned', true)}>Sí</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">¿Requiere Muestra?</label>
              <div className={styles.chipGroup}>
                <ChipToggle active={!formData.requiereMuestra} onChange={() => set('requiereMuestra', false)}>No</ChipToggle>
                <ChipToggle active={formData.requiereMuestra} onChange={() => set('requiereMuestra', true)}>Sí</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bordado en Prenda</label>
              <div className={styles.chipGroup}>
                <ChipToggle active={!formData.tieneBordado} onChange={() => set('tieneBordado', false)}>No aplica</ChipToggle>
                <ChipToggle active={formData.tieneBordado} onChange={() => set('tieneBordado', true)}>Aplica</ChipToggle>
              </div>
              {formData.tieneBordado && (
                <input type="text" className="form-input mt-2" placeholder="Descripción del bordado..."
                  name="descripcionBordado" onChange={handleInput} />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Semielaborados</label>
              <div className={styles.chipGroup}>
                <ChipToggle active={!formData.tieneSemielaborado} onChange={() => set('tieneSemielaborado', false)}>No aplica</ChipToggle>
                <ChipToggle active={formData.tieneSemielaborado} onChange={() => set('tieneSemielaborado', true)}>Aplica</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Montaje en Maniquí</label>
              <div className={styles.chipGroup} style={{ flexWrap: 'wrap' }}>
                {MONTAJE_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.montajeManiqui === o}
                    onChange={() => set('montajeManiqui', o)}>{o}</ChipToggle>
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

            <div className="form-group">
              <label className="form-label">Includes (Accesorios)</label>
              <input type="text" name="includes" className="form-input"
                value={formData.includes} onChange={handleInput}
                placeholder="Ej. Cinturón, Broche, Bolso... (vacío = No aplica)" />
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

            <div className="form-group">
              <label className="form-label">Boceto / Imagen Inicial</label>
              <label className={styles.bocetoUpload}>
                <ImageIcon size={20} />
                <span>{formData.boceto ? formData.boceto.name : 'Subir boceto o foto'}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => set('boceto', e.target.files[0])} />
              </label>
            </div>

          </div>
        </FormSeccion>

        {/* ── SECCIÓN 4: Equipo de Trabajo ── */}
        <FormSeccion titulo="👥  Equipo de Trabajo" accentColor="var(--temp-hot-border)">
          <p className="form-help" style={{ marginBottom: 16 }}>
            El diseñador creativo es obligatorio. Los demás roles se asignan a medida que la referencia avanza por cada área.
          </p>
          <div className={styles.grid2}>
            {ROLES_EQUIPO.map(rol => {
                const personasArea = personasMap[rol.area] || [];
                return (
              <div key={rol.key} className={`${styles.equipoRolCard} ${rol.requerido ? styles.rolRequerido : ''}`}>
                <label className={`form-label ${rol.requerido ? 'form-label-required' : ''}`}>
                  <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  {rol.label}
                </label>
                <span className={styles.rolFaseTag}>{rol.fase}</span>
                <select
                  name={rol.key}
                  className={`form-select ${errors[rol.key] ? 'input-error' : ''}`}
                  value={formData[rol.key]}
                  onChange={handleInput}
                >
                  <option value="">{rol.requerido ? 'Selecciona...' : 'Sin asignar...'}</option>
                  {personasArea.map(p => (
                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
                {errors[rol.key] && <span className="form-error">{errors[rol.key]}</span>}
              </div>
                );
              })}
          </div>
        </FormSeccion>

        {/* ── Acciones ── */}
        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Crear y Asignar Codigo MD'}
          </button>
        </div>

      </form>
    </div>
  );
}
