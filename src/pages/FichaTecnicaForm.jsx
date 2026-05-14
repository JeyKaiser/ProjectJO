import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { ChevronRight, ChevronDown, ChevronUp, Save, Plus, Trash2, Tag, BookMarked, Users, Scissors, Palette, Stamp, Layers, FoldedPlane, FileText } from 'lucide-react';
import { ChevronRight, ChevronDown, ChevronUp, Save, Plus, Trash2, Tag, BookMarked, Users, Scissors, Palette, Stamp, Layers, FileText } from 'lucide-react';
import { getPersonasActivas } from '../data/personas';
import { generarCodigoMD, opcionesLinea, opcionesSublinea, opcionesClosure, opcionesMontajeManiqui, opcionesClasificacion, opcionesTallaje, opcionesLargo, opcionesPrioridad, opcionesDrop, opcionesProcesoExterno, opcionesUsoTela, opcionesBaseTextil } from '../utils/codigos';

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

export default function FichaTecnicaForm() {
  const personas = getPersonasActivas();
  const [codigoMD] = useState(() => generarCodigoMD());

  const [formData, setFormData] = useState({
    coleccion: '',
    codigoMD: '',
    codigoPT: '',
    nombre: '',
    color: '',
    codigoColor: '',
    linea: '',
    sublinea: '',
    tipoPrenda: '',
    tallaje: '',
    largo: '',
    closure: '',
    clasificacion: 'Sólida',
    referente: '',
    prioridadFirstBuy: '',
    dropEntrega: '',
    enviarMaquila: false,
    tieneBordado: false,
    tieneSemielaborado: false,
    montajeManiqui: '',
    tieneEstampado: false,
    tieneProcesoExterno: false,
    tienePlizado: false,
    creativo: '',
    tecnico: '',
    cortador: '',
    modista: '',
    especificadora: '',
    trazador: '',
    telas: [],
    insumos: [],
    bordado: { proveedor: '', descripcion: '', costo: '', estado: '' },
    estampado: { proveedor: '', descripcion: '', costo: '', estado: '' },
    semielaborado: { proveedor: '', descripcion: '', costo: '', estado: '' },
    procesoExterno: { tipo: '', proveedor: '', proceso: '', costo: '' },
    plizado: { descripcion: '', anchoSesgo: '', sentido: '' },
    observaciones: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      codigoMD: codigoMD
    }));
  };

  const handleTelaChange = (index, field, value) => {
    const nuevasTelas = [...formData.telas];
    nuevasTelas[index] = { ...nuevasTelas[index], [field]: value };
    setFormData(prev => ({ ...prev, telas: nuevasTelas }));
  };

  const agregarTela = () => {
    setFormData(prev => ({
      ...prev,
      telas: [...prev.telas, { codigo: '', descripcion: '', ancho: '', baseTextil: '', usoEnPrenda: '' }]
    }));
  };

  const eliminarTela = (index) => {
    setFormData(prev => ({
      ...prev,
      telas: prev.telas.filter((_, i) => i !== index)
    }));
  };

  const handleInsumoChange = (index, field, value) => {
    const nuevosInsumos = [...formData.insumos];
    nuevosInsumos[index] = { ...nuevosInsumos[index], [field]: value };
    setFormData(prev => ({ ...prev, insumos: nuevosInsumos }));
  };

  const agregarInsumo = () => {
    setFormData(prev => ({
      ...prev,
      insumos: [...prev.insumos, { codigo: '', descripcion: '', cantidad: 1, unidad: 'Unidad' }]
    }));
  };

  const eliminarInsumo = (index) => {
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando ficha...', formData);
    alert('Ficha Técnica guardada exitosamente (Simulación)');
  };

  return (
    <div className="fade-in">
      <nav className="breadcrumb mb-4">
        <Link to="/ficha-nueva" className="breadcrumb-link">Nueva Ficha Técnica</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{codigoMD || 'Nuevo'}</span>
      </nav>

      <div className="card card-glass mb-6">
        <div className="card-header">
          <h2 className="card-title">Nueva Ficha Técnica</h2>
          <span className="badge badge-primary">Crear Referencia</span>
        </div>

        <form onSubmit={handleSubmit} className="card-body">
          <SeccionColapsable titulo="Identificación y Perfil" icono={<Tag size={18} />} accentColor="var(--primary-color)" defaultOpen={true}>
            <div className="grid grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Colección</label>
                <select className="form-select" name="coleccion" value={formData.coleccion} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  <option value="WINTER SUN 2026">Winter Sun 2026</option>
                  <option value="FALL WINTER 2026">Fall Winter 2026</option>
                  <option value="SPRING SUMMER 2026">Spring Summer 2026</option>
                  <option value="SUMMER VACATION 2026">Summer Vacation 2026</option>
                  <option value="RESORT RTW 2026">Resort RTW 2026</option>
                  <option value="PREFALL RTW 2026">PreFall RTW 2026</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Código MD</label>
                <input type="text" className="form-input" value={codigoMD} readOnly style={{ background: 'var(--gray-100)', fontWeight: 700 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Código PT</label>
                <input type="text" className="form-input" name="codigoPT" value={formData.codigoPT} onChange={handleChange} placeholder="Se asignará al aprobar" />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Nombre Referencia</label>
                <input type="text" className="form-input" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. ECRU FEMININITY DRAMATIC PANT" required />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Color</label>
                <input type="text" className="form-input" name="color" value={formData.color} onChange={handleChange} placeholder="Ej. Ecru/Sand" required />
              </div>
              <div className="form-group">
                <label className="form-label">Código Color</label>
                <input type="text" className="form-input" name="codigoColor" value={formData.codigoColor} onChange={handleChange} placeholder="Ej. EC-04" />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Línea</label>
                <select className="form-select" name="linea" value={formData.linea} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {opcionesLinea.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Sublínea</label>
                <select className="form-select" name="sublinea" value={formData.sublinea} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {opcionesSublinea.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Tipo Prenda</label>
                <input type="text" className="form-input" name="tipoPrenda" value={formData.tipoPrenda} onChange={handleChange} placeholder="Ej. Vestido, Pantalón, Jacket" required />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Tallaje</label>
                <select className="form-select" name="tallaje" value={formData.tallaje} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {opcionesTallaje.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Largo</label>
                <select className="form-select" name="largo" value={formData.largo} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {opcionesLargo.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Closure</label>
                <select className="form-select" name="closure" value={formData.closure} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {opcionesClosure.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Clasificación de Prenda" icono={<BookMarked size={18} />} accentColor="var(--primary-500)" defaultOpen={true}>
            <div className="grid grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Clasificación</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {opcionesClasificacion.map(clas => (
                    <label key={clas} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="clasificacion" value={clas} checked={formData.clasificacion === clas} onChange={handleChange} />
                      <span className="text-sm">{clas}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Referente</label>
                <input type="text" className="form-input" name="referente" value={formData.referente} onChange={handleChange} placeholder="Código PT o nombre" />
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad First Buy</label>
                <select className="form-select" name="prioridadFirstBuy" value={formData.prioridadFirstBuy} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  {opcionesPrioridad.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Drop de Entrega</label>
                <select className="form-select" name="dropEntrega" value={formData.dropEntrega} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  {opcionesDrop.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" name="enviarMaquila" checked={formData.enviarMaquila} onChange={handleChange} />
                  <span className="font-medium text-sm">Enviar a Maquila</span>
                </label>
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" name="tieneBordado" checked={formData.tieneBordado} onChange={handleChange} />
                  <span className="font-medium text-sm">Tiene Bordado</span>
                </label>
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" name="tieneSemielaborado" checked={formData.tieneSemielaborado} onChange={handleChange} />
                  <span className="font-medium text-sm">Tiene Semielaborado</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Montaje en Maniquí</label>
                <select className="form-select" name="montajeManiqui" value={formData.montajeManiqui} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  {opcionesMontajeManiqui.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Asignación de Responsables" icono={<Users size={18} />} accentColor="var(--success-color)" defaultOpen={true}>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Diseñador Creativo</label>
                <select className="form-select" name="creativo" value={formData.creativo} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {personas.creativos.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Diseñador Técnico</label>
                <select className="form-select" name="tecnico" value={formData.tecnico} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {personas.tecnicos.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Cortador</label>
                <select className="form-select" name="cortador" value={formData.cortador} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {personas.cortadores.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Modista</label>
                <select className="form-select" name="modista" value={formData.modista} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {personas.modistas.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Especificadora</label>
                <select className="form-select" name="especificadora" value={formData.especificadora} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {personas.especificadoras.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Trazador</label>
                <select className="form-select" name="trazador" value={formData.trazador} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {personas.trazadores.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                </select>
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Tela e Insumos" icono={<Scissors size={18} />} accentColor="var(--warning-color)" defaultOpen={true}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Telas</h4>
                <button type="button" className="btn btn-outline btn-sm" onClick={agregarTela}>
                  <Plus size={16} /> Agregar Tela
                </button>
              </div>
              {formData.telas.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay telas registradas. Agrega una para continuar.</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Ancho</th>
                        <th>Base Textil</th>
                        <th>Uso en Prenda</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.telas.map((tela, index) => (
                        <tr key={index}>
                          <td><input type="text" className="form-input" value={tela.codigo} onChange={(e) => handleTelaChange(index, 'codigo', e.target.value)} placeholder="Código" /></td>
                          <td><input type="text" className="form-input" value={tela.descripcion} onChange={(e) => handleTelaChange(index, 'descripcion', e.target.value)} placeholder="Descripción" /></td>
                          <td><input type="text" className="form-input" value={tela.ancho} onChange={(e) => handleTelaChange(index, 'ancho', e.target.value)} placeholder="Ancho" style={{ width: '80px' }} /></td>
                          <td>
                            <select className="form-select" value={tela.baseTextil} onChange={(e) => handleTelaChange(index, 'baseTextil', e.target.value)}>
                              <option value="">Selecciona...</option>
                              {opcionesBaseTextil.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </td>
                          <td>
                            <select className="form-select" value={tela.usoEnPrenda} onChange={(e) => handleTelaChange(index, 'usoEnPrenda', e.target.value)}>
                              <option value="">Selecciona...</option>
                              {opcionesUsoTela.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td><button type="button" className="btn btn-ghost btn-sm text-red-500" onClick={() => eliminarTela(index)}><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Insumos</h4>
                <button type="button" className="btn btn-outline btn-sm" onClick={agregarInsumo}>
                  <Plus size={16} /> Agregar Insumo
                </button>
              </div>
              {formData.insumos.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay insumos registrados.</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.insumos.map((insumo, index) => (
                        <tr key={index}>
                          <td><input type="text" className="form-input" value={insumo.codigo} onChange={(e) => handleInsumoChange(index, 'codigo', e.target.value)} placeholder="Código" /></td>
                          <td><input type="text" className="form-input" value={insumo.descripcion} onChange={(e) => handleInsumoChange(index, 'descripcion', e.target.value)} placeholder="Descripción" /></td>
                          <td><input type="number" className="form-input" value={insumo.cantidad} onChange={(e) => handleInsumoChange(index, 'cantidad', e.target.value)} style={{ width: '80px' }} /></td>
                          <td><input type="text" className="form-input" value={insumo.unidad} onChange={(e) => handleInsumoChange(index, 'unidad', e.target.value)} placeholder="Unidad" style={{ width: '100px' }} /></td>
                          <td><button type="button" className="btn btn-ghost btn-sm text-red-500" onClick={() => eliminarInsumo(index)}><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Bordado" icono={<Palette size={18} />} accentColor="var(--temp-warm-border)" defaultOpen={false}>
            <div className="grid grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <input type="text" className="form-input" name="bordado_proveedor" value={formData.bordado.proveedor} onChange={(e) => setFormData(prev => ({ ...prev, bordado: { ...prev.bordado, proveedor: e.target.value } }))} placeholder="Nombre del proveedor" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input type="text" className="form-input" name="bordado_descripcion" value={formData.bordado.descripcion} onChange={(e) => setFormData(prev => ({ ...prev, bordado: { ...prev.bordado, descripcion: e.target.value } }))} placeholder="Tipo de bordado" />
              </div>
              <div className="form-group">
                <label className="form-label">Costo</label>
                <input type="number" className="form-input" name="bordado_costo" value={formData.bordado.costo} onChange={(e) => setFormData(prev => ({ ...prev, bordado: { ...prev.bordado, costo: e.target.value } }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" name="bordado_estado" value={formData.bordado.estado} onChange={(e) => setFormData(prev => ({ ...prev, bordado: { ...prev.bordado, estado: e.target.value } }))}>
                  <option value="">Selecciona...</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Estampado" icono={<Stamp size={18} />} accentColor="var(--temp-cold-border)" defaultOpen={false}>
            <div className="grid grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <input type="text" className="form-input" name="estampado_proveedor" value={formData.estampado.proveedor} onChange={(e) => setFormData(prev => ({ ...prev, estampado: { ...prev.estampado, proveedor: e.target.value } }))} placeholder="Nombre del proveedor" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input type="text" className="form-input" name="estampado_descripcion" value={formData.estampado.descripcion} onChange={(e) => setFormData(prev => ({ ...prev, estampado: { ...prev.estampado, descripcion: e.target.value } }))} placeholder="Tipo de estampado" />
              </div>
              <div className="form-group">
                <label className="form-label">Costo</label>
                <input type="number" className="form-input" name="estampado_costo" value={formData.estampado.costo} onChange={(e) => setFormData(prev => ({ ...prev, estampado: { ...prev.estampado, costo: e.target.value } }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" name="estampado_estado" value={formData.estampado.estado} onChange={(e) => setFormData(prev => ({ ...prev, estampado: { ...prev.estampado, estado: e.target.value } }))}>
                  <option value="">Selecciona...</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Semielaborados" icono={<Layers size={18} />} accentColor="var(--temp-hot-border)" defaultOpen={false}>
            <div className="grid grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <input type="text" className="form-input" name="semielaborado_proveedor" value={formData.semielaborado.proveedor} onChange={(e) => setFormData(prev => ({ ...prev, semielaborado: { ...prev.semielaborado, proveedor: e.target.value } }))} placeholder="Nombre del proveedor" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input type="text" className="form-input" name="semielaborado_descripcion" value={formData.semielaborado.descripcion} onChange={(e) => setFormData(prev => ({ ...prev, semielaborado: { ...prev.semielaborado, descripcion: e.target.value } }))} placeholder="Tipo de semielaborado" />
              </div>
              <div className="form-group">
                <label className="form-label">Costo</label>
                <input type="number" className="form-input" name="semielaborado_costo" value={formData.semielaborado.costo} onChange={(e) => setFormData(prev => ({ ...prev, semielaborado: { ...prev.semielaborado, costo: e.target.value } }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" name="semielaborado_estado" value={formData.semielaborado.estado} onChange={(e) => setFormData(prev => ({ ...prev, semielaborado: { ...prev.semielaborado, estado: e.target.value } }))}>
                  <option value="">Selecciona...</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Proceso Externo" icono={<Layers size={18} />} accentColor="var(--primary-500)" defaultOpen={false}>
            <div className="grid grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Tipo de Proceso</label>
                <select className="form-select" name="proceso_externo_tipo" value={formData.procesoExterno.tipo} onChange={(e) => setFormData(prev => ({ ...prev, procesoExterno: { ...prev.procesoExterno, tipo: e.target.value } }))}>
                  <option value="">Selecciona...</option>
                  {opcionesProcesoExterno.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <input type="text" className="form-input" name="proceso_externo_proveedor" value={formData.procesoExterno.proveedor} onChange={(e) => setFormData(prev => ({ ...prev, procesoExterno: { ...prev.procesoExterno, proveedor: e.target.value } }))} placeholder="Nombre del proveedor" />
              </div>
              <div className="form-group">
                <label className="form-label">Proceso</label>
                <input type="text" className="form-input" name="proceso_externo_proceso" value={formData.procesoExterno.proceso} onChange={(e) => setFormData(prev => ({ ...prev, procesoExterno: { ...prev.procesoExterno, proceso: e.target.value } }))} placeholder="Descripción del proceso" />
              </div>
              <div className="form-group">
                <label className="form-label">Costo</label>
                <input type="number" className="form-input" name="proceso_externo_costo" value={formData.procesoExterno.costo} onChange={(e) => setFormData(prev => ({ ...prev, procesoExterno: { ...prev.procesoExterno, costo: e.target.value } }))} placeholder="0" />
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Plizado" icono={<Layers size={18} />} accentColor="var(--temp-cold-border)" defaultOpen={false}>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input type="text" className="form-input" name="plizado_descripcion" value={formData.plizado.descripcion} onChange={(e) => setFormData(prev => ({ ...prev, plizado: { ...prev.plizado, descripcion: e.target.value } }))} placeholder="Tipo de plizado" />
              </div>
              <div className="form-group">
                <label className="form-label">Ancho del Sesgo</label>
                <input type="text" className="form-input" name="plizado_ancho" value={formData.plizado.anchoSesgo} onChange={(e) => setFormData(prev => ({ ...prev, plizado: { ...prev.plizado, anchoSesgo: e.target.value } }))} placeholder="Ej. 2cm" />
              </div>
              <div className="form-group">
                <label className="form-label">Sentido</label>
                <input type="text" className="form-input" name="plizado_sentido" value={formData.plizado.sentido} onChange={(e) => setFormData(prev => ({ ...prev, plizado: { ...prev.plizado, sentido: e.target.value } }))} placeholder="Vertical/Horizontal" />
              </div>
            </div>
          </SeccionColapsable>

          <SeccionColapsable titulo="Observaciones" icono={<FileText size={18} />} accentColor="var(--gray-500)" defaultOpen={false}>
            <div className="form-group">
              <textarea className="form-textarea" name="observaciones" value={formData.observaciones} onChange={handleChange} rows={4} placeholder="Observaciones adicionales sobre la referencia..." />
            </div>
          </SeccionColapsable>

          <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
            <Link to="/ficha-nueva" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Crear Ficha Técnica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}