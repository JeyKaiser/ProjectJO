import { useState } from 'react';
import { Save, Image as ImageIcon, User, Plus, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { colecciones } from '../data/colecciones';

// ── Catálogos ────────────────────────────────────────────────
const COLECCIONES_OPTIONS = colecciones.map(c => ({
  value: c.id,
  label: `${c.nombre} 2026`,
}));

const TIPO_PRENDA_OPTIONS = [
  'Vestido', 'Pantalón', 'Falda', 'Blazer', 'Jacket', 'Abrigo',
  'Jumpsuit', 'Top', 'Blusa', 'Camisa', 'Shorts', 'Cardigan', 'Otro',
];

const LINEA_OPTIONS = ['Ready To Wear', 'Couture', 'Resort', 'Pre-Fall'];
const SUBLINEA_OPTIONS = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Jumpsuits', 'Sets'];
const TALLAJE_OPTIONS = ['XS-S-M-L', 'XS-S-M-L-XL', 'S-M-L', 'Talla Única', 'Personalizado'];
const LARGO_OPTIONS = ['Mini', 'Midi', 'Maxi', 'Full Length', 'Hip', 'Knee Length', 'Cropped'];
const CLOSURE_OPTIONS = ['Sin cierre', 'Cremallera lateral', 'Cremallera posterior', 'Botones', 'Elástico', 'Correa', 'Otro'];
const DROP_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const PRIORIDAD_OPTIONS = ['A', 'B', 'C'];
const COMPLEJIDAD_OPTIONS = ['Baja', 'Media', 'Alta', 'Muy Alta'];
const MONTAJE_OPTIONS = ['No aplica', 'Drapeado', 'Descole', 'Prensados'];
const EMPAQUE_OPTIONS = ['Individual', 'Doble', 'Set'];

const CLASIFICACION_OPTIONS = [
  { value: 'Sólida', label: 'Sólida' },
  { value: 'Mod. Arte', label: 'Modificación de Arte' },
  { value: 'Ubicación Trazo', label: 'Ubicación en Trazo' },
];

// Roles de personas involucradas en el ciclo de vida
const ROLES_EQUIPO = [
  { key: 'disenadorCreativo', label: 'Diseñador(a) Creativo(a)', fase: '1.1 Perfilamiento', requerido: true },
  { key: 'patronista', label: 'Patronista / Moldería', fase: '1.3 Moldería Base', requerido: false },
  { key: 'disenadorTecnico', label: 'Diseñador(a) Técnico(a)', fase: '3.3 Escalado y Consumos', requerido: false },
  { key: 'cortador', label: 'Cortador(a)', fase: '2.2 Corte Muestra', requerido: false },
  { key: 'modista', label: 'Modista / Confección', fase: '2.3 Confección Muestra', requerido: false },
  { key: 'bordadora', label: 'Bordadora / Proceso Especial', fase: '2.4 Procesos Especiales', requerido: false },
  { key: 'trazador', label: 'Trazador(a)', fase: '3.4 Trazos Producción', requerido: false },
  { key: 'equipoConsumos', label: 'Equipo Consumos / Validación', fase: '4.2 Contramuestra', requerido: false },
];

// ── Toggle chip ──────────────────────────────────────────────
function ChipToggle({ active, onChange, children }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`chip-toggle ${active ? 'chip-toggle-active' : ''}`}
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
    <div className="form-seccion" style={{ borderLeftColor: accentColor }}>
      <button type="button" className="form-seccion-header" onClick={() => setOpen(!open)}>
        <span className="form-seccion-titulo">{titulo}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="form-seccion-body">{children}</div>}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function FichaTecnicaForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Identificación
    coleccion: '',
    nombre: '',
    tipoPrenda: '',
    color: '',
    codigoColor: '',
    linea: '',
    sublinea: '',
    tallaje: '',
    largo: '',
    closure: '',
    clasificacion: 'Sólida',
    // Comercial
    prioridadFirstBuy: 'A',
    dropEntrega: 'A',
    enviarMaquila: false,
    complejidadCorte: 'Media',
    complejidadConfeccion: 'Media',
    // Procesos (toggle: null = no aplica, true = aplica)
    tieneBordado: false,
    tieneSemielaborado: false,
    montajeManiqui: 'No aplica',
    tirasContinuas: false,
    includes: '',
    tipoEmpaque: 'Individual',
    referente: '',
    // Equipo
    disenadorCreativo: '',
    patronista: '',
    disenadorTecnico: '',
    cortador: '',
    modista: '',
    bordadora: '',
    trazador: '',
    equipoConsumos: '',
    // Boceto
    boceto: null,
  });

  const [guardado, setGuardado] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleInput = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const validate = () => {
    const err = {};
    if (!formData.coleccion) err.coleccion = 'Requerido';
    if (!formData.tipoPrenda) err.tipoPrenda = 'Requerido';
    if (!formData.nombre) err.nombre = 'Requerido';
    if (!formData.color) err.color = 'Requerido';
    if (!formData.disenadorCreativo) err.disenadorCreativo = 'El diseñador creativo es obligatorio';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Simular guardado y generar código MD
    const nuevoMD = `MD-${Math.floor(Math.random() * 900) + 100}`;
    const nuevoPT = `PT0${Math.floor(Math.random() * 9000) + 1000}`;
    console.log('Nueva referencia guardada:', { ...formData, codigoMD: nuevoMD, codigoPT: nuevoPT, faseActual: 1.1 });
    setGuardado({ codigoMD: nuevoMD, codigoPT: nuevoPT });
  };

  const handleReset = () => {
    setGuardado(false);
    setErrors({});
    setFormData(prev => ({ ...prev, nombre: '', color: '', codigoColor: '' }));
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
            La referencia ha sido registrada en <strong>Fase 1.1 · Perfilamiento</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <span className="code-badge code-md" style={{ fontSize: 16, padding: '6px 16px' }}>{guardado.codigoMD}</span>
            <span className="code-badge code-pt" style={{ fontSize: 16, padding: '6px 16px' }}>{guardado.codigoPT}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/colecciones')}>
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
      <div className="ficha-form-header">
        <div>
          <h2 className="ficha-form-titulo">Nueva Ficha Técnica</h2>
          <p className="ficha-form-subtitulo">Fase 1.1 · Perfilamiento y creación de referencia</p>
        </div>
        <span className="badge badge-primary">Área Creativa</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── SECCIÓN 1: Identificación básica ── */}
        <FormSeccion titulo="📋  Identificación y Perfil" accentColor="var(--temp-cold-border)">
          <div className="ficha-grid-3">
            {/* Colección */}
            <div className="form-group">
              <label className="form-label form-label-required">Colección</label>
              <select name="coleccion" className={`form-select ${errors.coleccion ? 'input-error' : ''}`}
                value={formData.coleccion} onChange={handleInput} required>
                <option value="">Selecciona...</option>
                {COLECCIONES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.coleccion && <span className="form-error">{errors.coleccion}</span>}
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

            {/* Color */}
            <div className="form-group">
              <label className="form-label form-label-required">Color</label>
              <input type="text" name="color" className={`form-input ${errors.color ? 'input-error' : ''}`}
                value={formData.color} onChange={handleInput} placeholder="Ej. Ecru/Sand, Ivory..." />
              {errors.color && <span className="form-error">{errors.color}</span>}
            </div>

            {/* Código color */}
            <div className="form-group">
              <label className="form-label">Código de Color</label>
              <input type="text" name="codigoColor" className="form-input"
                value={formData.codigoColor} onChange={handleInput} placeholder="Ej. EC-04" />
            </div>

            {/* Referente */}
            <div className="form-group">
              <label className="form-label">Referente Base (Opcional)</label>
              <input type="text" name="referente" className="form-input"
                value={formData.referente} onChange={handleInput} placeholder="Ej. PT03402" />
              <span className="form-help">Si aplica, heredará moldería base.</span>
            </div>

            {/* Línea */}
            <div className="form-group">
              <label className="form-label">Línea</label>
              <select name="linea" className="form-select" value={formData.linea} onChange={handleInput}>
                <option value="">Selecciona...</option>
                {LINEA_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Sublínea */}
            <div className="form-group">
              <label className="form-label">Sublínea</label>
              <select name="sublinea" className="form-select" value={formData.sublinea} onChange={handleInput}>
                <option value="">Selecciona...</option>
                {SUBLINEA_OPTIONS.map(o => <option key={o}>{o}</option>)}
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
              <select name="tallaje" className="form-select" value={formData.tallaje} onChange={handleInput}>
                <option value="">Selecciona...</option>
                {TALLAJE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Largo */}
            <div className="form-group">
              <label className="form-label">Largo</label>
              <select name="largo" className="form-select" value={formData.largo} onChange={handleInput}>
                <option value="">Selecciona...</option>
                {LARGO_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Closure */}
            <div className="form-group">
              <label className="form-label">Closure / Cierre</label>
              <select name="closure" className="form-select" value={formData.closure} onChange={handleInput}>
                <option value="">Selecciona...</option>
                {CLOSURE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </FormSeccion>

        {/* ── SECCIÓN 2: Datos Comerciales ── */}
        <FormSeccion titulo="💼  Datos Comerciales y Complejidad" accentColor="var(--primary-500)">
          <div className="ficha-grid-3">
            <div className="form-group">
              <label className="form-label">Prioridad First Buy</label>
              <div className="chip-group">
                {PRIORIDAD_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.prioridadFirstBuy === o}
                    onChange={() => set('prioridadFirstBuy', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Drop de Entrega</label>
              <div className="chip-group">
                {DROP_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.dropEntrega === o}
                    onChange={() => set('dropEntrega', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">¿Enviar a Maquila?</label>
              <div className="chip-group">
                <ChipToggle active={formData.enviarMaquila === false}
                  onChange={() => set('enviarMaquila', false)}>No aplica</ChipToggle>
                <ChipToggle active={formData.enviarMaquila === true}
                  onChange={() => set('enviarMaquila', true)}>Sí, enviar</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complejidad de Corte</label>
              <div className="chip-group">
                {COMPLEJIDAD_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.complejidadCorte === o}
                    onChange={() => set('complejidadCorte', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complejidad de Confección</label>
              <div className="chip-group">
                {COMPLEJIDAD_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.complejidadConfeccion === o}
                    onChange={() => set('complejidadConfeccion', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Empaque</label>
              <div className="chip-group">
                {EMPAQUE_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.tipoEmpaque === o}
                    onChange={() => set('tipoEmpaque', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>
          </div>
        </FormSeccion>

        {/* ── SECCIÓN 3: Procesos Especiales ── */}
        <FormSeccion titulo="⚙️  Procesos Especiales" accentColor="var(--temp-warm-border)">
          <p className="form-help" style={{ marginBottom: 16 }}>
            Indica si aplica cada proceso. Los ítems marcados como "Aplica" generarán una subfase de seguimiento.
          </p>
          <div className="ficha-grid-3">

            <div className="form-group">
              <label className="form-label">Bordado en Prenda</label>
              <div className="chip-group">
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
              <div className="chip-group">
                <ChipToggle active={!formData.tieneSemielaborado} onChange={() => set('tieneSemielaborado', false)}>No aplica</ChipToggle>
                <ChipToggle active={formData.tieneSemielaborado} onChange={() => set('tieneSemielaborado', true)}>Aplica</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Montaje en Maniquí</label>
              <div className="chip-group" style={{ flexWrap: 'wrap' }}>
                {MONTAJE_OPTIONS.map(o => (
                  <ChipToggle key={o} active={formData.montajeManiqui === o}
                    onChange={() => set('montajeManiqui', o)}>{o}</ChipToggle>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tiras Continuas</label>
              <div className="chip-group">
                <ChipToggle active={!formData.tirasContinuas} onChange={() => set('tirasContinuas', false)}>No aplica</ChipToggle>
                <ChipToggle active={formData.tirasContinuas} onChange={() => set('tirasContinuas', true)}>Aplica</ChipToggle>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Includes (Accesorios)</label>
              <input type="text" name="includes" className="form-input"
                value={formData.includes} onChange={handleInput}
                placeholder="Ej. Cinturón, Broche, Bolso... (vacío = No aplica)" />
            </div>

            <div className="form-group">
              <label className="form-label">Boceto / Imagen Inicial</label>
              <label className="boceto-upload">
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
          <div className="ficha-grid-2">
            {ROLES_EQUIPO.map(rol => (
              <div key={rol.key} className={`form-group equipo-rol-card ${rol.requerido ? 'rol-requerido' : ''}`}>
                <label className={`form-label ${rol.requerido ? 'form-label-required' : ''}`}>
                  <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  {rol.label}
                </label>
                <span className="rol-fase-tag">{rol.fase}</span>
                <input
                  type="text"
                  name={rol.key}
                  className={`form-input ${errors[rol.key] ? 'input-error' : ''}`}
                  value={formData[rol.key]}
                  onChange={handleInput}
                  placeholder={rol.requerido ? 'Nombre requerido...' : 'Asignar cuando aplique...'}
                />
                {errors[rol.key] && <span className="form-error">{errors[rol.key]}</span>}
              </div>
            ))}
          </div>
        </FormSeccion>

        {/* ── Acciones ── */}
        <div className="ficha-form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Crear y Asignar Código MD
          </button>
        </div>

      </form>
    </div>
  );
}
