import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, Plus, Pencil, Trash2, X, Check, Search, AlertTriangle, User, Mail, Phone, Calendar, Hash, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPersonas, savePersonas, AREAS, ID_PREFIXES, resetPersonas } from '../data/personas';

const AREA_ICONS = {
  creativos: '🎨',
  tecnicos: '📐',
  cortadores: '✂️',
  modistas: '🧵',
  especificadoras: '📝',
  trazadores: '📏',
  bordadoras: '🪡',
};

export default function ConfiguracionPersonas() {
  const { isAdmin } = useAuth();
  const [personasData, setPersonasData] = useState(() => getPersonas());
  const [tabActivo, setTabActivo] = useState('creativos');
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formState, setFormState] = useState({
    nombre: '',
    activo: true,
    fechaIngreso: '',
    cedula: '',
    correo: '',
    telefono: '',
  });

  const areaInfo = AREAS.find(a => a.key === tabActivo);
  const personas = personasData[tabActivo] || [];

  const personasFiltradas = personas.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getPersonasByAreaKey = (areaKey) => {
    return (personasData[areaKey] || []).filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const contarActivos = (areaKey) => {
    return (personasData[areaKey] || []).filter(p => p.activo !== false).length;
  };

  const abrirModalNuevo = () => {
    setModalEdicion(null);
    setFormState({
      nombre: '',
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0],
      cedula: '',
      correo: '',
      telefono: '',
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (persona) => {
    setModalEdicion({ ...persona });
    setFormState({
      nombre: persona.nombre,
      activo: persona.activo !== false,
      fechaIngreso: persona.fechaIngreso || '',
      cedula: persona.cedula || '',
      correo: persona.correo || '',
      telefono: persona.telefono || '',
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setModalEdicion(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const guardarPersona = () => {
    if (!formState.nombre.trim()) return;

    const nuevaData = JSON.parse(JSON.stringify(personasData));
    const areaKey = tabActivo;
    const prefix = ID_PREFIXES[areaKey];

    if (modalEdicion) {
      const index = nuevaData[areaKey].findIndex(p => p.id === modalEdicion.id);
      if (index >= 0) {
        nuevaData[areaKey][index] = {
          ...nuevaData[areaKey][index],
          nombre: formState.nombre.trim().toUpperCase(),
          activo: formState.activo,
          fechaIngreso: formState.fechaIngreso,
          cedula: formState.cedula,
          correo: formState.correo,
          telefono: formState.telefono,
        };
      }
    } else {
      let nextNum = 1;
      nuevaData[areaKey].forEach(p => {
        const num = parseInt(p.id.split('-')[1], 10);
        if (!isNaN(num) && num >= nextNum) nextNum = num + 1;
      });
      const newId = `${prefix}-${String(nextNum).padStart(3, '0')}`;

      nuevaData[areaKey].push({
        id: newId,
        nombre: formState.nombre.trim().toUpperCase(),
        rol: areaInfo.singular,
        activo: formState.activo,
        fechaIngreso: formState.fechaIngreso,
        cedula: formState.cedula,
        correo: formState.correo,
        telefono: formState.telefono,
      });
    }

    savePersonas(nuevaData);
    setPersonasData(nuevaData);
    cerrarModal();
  };

  const toggleActivo = (persona) => {
    const nuevaData = JSON.parse(JSON.stringify(personasData));
    const index = nuevaData[tabActivo].findIndex(p => p.id === persona.id);
    if (index >= 0) {
      nuevaData[tabActivo][index].activo = !nuevaData[tabActivo][index].activo;
      savePersonas(nuevaData);
      setPersonasData(nuevaData);
    }
  };

  const eliminarPersona = (persona) => {
    const nuevaData = JSON.parse(JSON.stringify(personasData));
    nuevaData[tabActivo] = nuevaData[tabActivo].filter(p => p.id !== persona.id);
    savePersonas(nuevaData);
    setPersonasData(nuevaData);
    setConfirmDelete(null);
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar todas las personas a los valores por defecto?\nSe perderán los cambios realizados.')) {
      const defaultData = resetPersonas();
      setPersonasData(defaultData);
    }
  };

  const totalActivos = AREAS.reduce((sum, a) => sum + contarActivos(a.key), 0);
  const totalTodos = AREAS.reduce((sum, a) => sum + (personasData[a.key] || []).length, 0);

  return (
    <div className="fade-in">
      <nav className="breadcrumb mb-4">
        <Link to="/configuracion" className="breadcrumb-link">Configuración</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Personas</span>
      </nav>

      <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* SIDEBAR DE ÁREAS */}
        <div className="card card-glass" style={{ width: 260, flexShrink: 0, alignSelf: 'flex-start' }}>
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={18} className="text-gray-400" />
              <h2 className="font-bold text-sm text-gray-700">Áreas</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                {totalActivos} activos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                {totalTodos} total
              </span>
            </div>
            {isAdmin && (
              <button onClick={handleReset} className="btn-reset-defaults">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Restaurar valores por defecto
              </button>
            )}
          </div>

          <nav className="p-2">
            {AREAS.map(area => {
              const activo = tabActivo === area.key;
              const total = getPersonasByAreaKey(area.key).length;
              const activos = contarActivos(area.key);

              return (
                <button
                  key={area.key}
                  onClick={() => { setTabActivo(area.key); setBusqueda(''); }}
                  className={`area-nav-btn ${activo ? 'area-nav-btn-active' : ''}`}
                >
                  <span className="area-nav-emoji">{AREA_ICONS[area.key]}</span>
                  <div className="area-nav-info">
                    <div className="area-nav-label">{area.label}</div>
                    <div className="area-nav-meta">
                      <span className="area-nav-total">{total}</span>
                      <span className="area-nav-sep">·</span>
                      <span className="area-nav-activos">{activos} activo{activos !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {activo && <div className="area-nav-indicator"></div>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PANEL PRINCIPAL */}
        <div className="flex-1">
          <div className="card card-glass">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <span className="text-xl">{AREA_ICONS[tabActivo]}</span>
                <div>
                  <h2 className="card-title">{areaInfo?.label}</h2>
                  <p className="text-xs text-gray-500">
                    {personas.length} persona{personas.length !== 1 ? 's' : ''} registrada{personas.length !== 1 ? 's' : ''}
                    {personasFiltradas.length !== personas.length && ` · ${personasFiltradas.length} encontrada${personasFiltradas.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <button onClick={abrirModalNuevo} className="btn btn-primary">
                  <Plus size={16} /> Agregar {areaInfo?.singular}
                </button>
              )}
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar en ${areaInfo?.label.toLowerCase()}...`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="form-input pl-9"
                />
              </div>
            </div>

            <div className="p-4">
              {personasFiltradas.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users size={28} className="opacity-40" />
                  </div>
                  <p className="text-sm font-medium">
                    {busqueda ? 'Sin resultados' : `No hay personas en ${areaInfo?.label}`}
                  </p>
                  <p className="text-xs mt-1">
                    {busqueda ? 'Intenta con otro nombre' : `Agrega la primera persona de esta área`}
                  </p>
                  {isAdmin && !busqueda && (
                    <button onClick={abrirModalNuevo} className="btn btn-outline btn-sm mt-4">
                      <Plus size={14} /> Agregar {areaInfo?.singular}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {personasFiltradas.map(persona => {
                    const inactivo = persona.activo === false;

                    return (
                      <div
                        key={persona.id}
                        className={`card-persona ${inactivo ? 'card-persona-inactivo' : ''}`}
                      >
                        {/* Avatar + Info Principal */}
                        <div className="flex items-start gap-4">
                          <div className={`persona-avatar ${inactivo ? 'persona-avatar-inactivo' : 'persona-avatar-activo'}`}>
                            {persona.nombre.charAt(0)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-base font-bold ${inactivo ? 'text-gray-400' : 'text-gray-800'}`}>
                                {persona.nombre}
                              </h3>
                              <span className={`status-badge ${inactivo ? 'status-badge-inactivo' : 'status-badge-activo'}`}>
                                {inactivo ? 'Inactivo' : 'Activo'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mb-2">
                              ID: {persona.id} · {persona.rol}
                            </p>

                            {/* Datos de contacto */}
                            <div className="persona-detalles">
                              {persona.fechaIngreso && (
                                <span className="persona-detalle-item">
                                  <Calendar size={12} />
                                  Ingreso: {persona.fechaIngreso}
                                </span>
                              )}
                              {persona.cedula && (
                                <span className="persona-detalle-item">
                                  <Hash size={12} />
                                  {persona.cedula}
                                </span>
                              )}
                              {persona.correo && (
                                <span className="persona-detalle-item">
                                  <Mail size={12} />
                                  {persona.correo}
                                </span>
                              )}
                              {persona.telefono && (
                                <span className="persona-detalle-item">
                                  <Phone size={12} />
                                  {persona.telefono}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => toggleActivo(persona)}
                                className={`btn-icon-action ${inactivo ? 'btn-icon-action-success' : 'btn-icon-action-warning'}`}
                                title={inactivo ? 'Reactivar persona' : 'Inactivar persona'}
                              >
                                <ShieldCheck size={15} />
                              </button>
                              <button
                                onClick={() => abrirModalEditar(persona)}
                                className="btn-icon-action btn-icon-action-primary"
                                title="Editar persona"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(persona)}
                                className="btn-icon-action btn-icon-action-danger"
                                title="Eliminar persona"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Barra indicadora de estado */}
                        <div className={`persona-status-bar ${inactivo ? 'persona-status-bar-off' : 'persona-status-bar-on'}`}></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL AGREGAR/EDITAR */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="modal-title">
                    {modalEdicion ? `Editar persona` : `Nueva persona`}
                  </h3>
                  <p className="text-xs text-gray-500">{areaInfo?.singular} · {areaInfo?.label}</p>
                </div>
              </div>
              <button onClick={cerrarModal} className="btn btn-ghost btn-sm p-1">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-input"
                    value={formState.nombre}
                    onChange={handleFormChange}
                    placeholder="Ej. MARIA GOMEZ"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Fecha de Ingreso</label>
                    <input
                      type="date"
                      name="fechaIngreso"
                      className="form-input"
                      value={formState.fechaIngreso}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="activo"
                          checked={formState.activo === true}
                          onChange={() => setFormState(prev => ({ ...prev, activo: true }))}
                        />
                        <span className="text-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          Activo
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="activo"
                          checked={formState.activo === false}
                          onChange={() => setFormState(prev => ({ ...prev, activo: false }))}
                        />
                        <span className="text-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          Inactivo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cédula / NIT</label>
                  <input
                    type="text"
                    name="cedula"
                    className="form-input"
                    value={formState.cedula}
                    onChange={handleFormChange}
                    placeholder="Número de documento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      name="correo"
                      className="form-input"
                      value={formState.correo}
                      onChange={handleFormChange}
                      placeholder="correo@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      className="form-input"
                      value={formState.telefono}
                      onChange={handleFormChange}
                      placeholder="300 123 4567"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={cerrarModal} className="btn btn-secondary">Cancelar</button>
              <button onClick={guardarPersona} className="btn btn-primary" disabled={!formState.nombre.trim()}>
                <Check size={16} /> {modalEdicion ? 'Guardar Cambios' : 'Agregar Persona'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINACIÓN */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <h3 className="modal-title">Eliminar persona</h3>
              </div>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-sm p-1">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-3">
                <p className="text-sm text-red-800 font-medium mb-1">
                  ¿Eliminar a {confirmDelete.nombre}?
                </p>
                <p className="text-xs text-red-600">
                  Esta persona será removida permanentemente del área <strong>{areaInfo?.singular}</strong>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Si solo deseas que no aparezca en los listados, puedes inactivarla en lugar de eliminarla.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setConfirmDelete(null)} className="btn btn-secondary">Cancelar</button>
              <button
                onClick={() => eliminarPersona(confirmDelete)}
                className="btn"
                style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Trash2 size={16} /> Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS INLINE */}
      <style>{`
        .card-persona {
          position: relative;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          padding: 20px 20px 20px 24px;
          transition: all 0.15s ease;
        }
        .card-persona:hover {
          border-color: var(--gray-300);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .card-persona-inactivo {
          background: var(--gray-50);
          border-color: var(--gray-200);
        }
        .card-persona-inactivo:hover {
          border-color: var(--gray-300);
        }

        .persona-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          flex-shrink: 0;
        }
        .persona-avatar-activo {
          background: linear-gradient(135deg, var(--primary-100), var(--primary-200));
          color: var(--primary-700);
          border: 2px solid var(--primary-300);
        }
        .persona-avatar-inactivo {
          background: var(--gray-100);
          color: var(--gray-400);
          border: 2px solid var(--gray-200);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .status-badge-activo {
          background: var(--success-light, #dcfce7);
          color: var(--success-dark, #15803d);
          border: 1px solid var(--success-border, #bbf7d0);
        }
        .status-badge-inactivo {
          background: var(--gray-100, #f3f4f6);
          color: var(--gray-500, #6b7280);
          border: 1px solid var(--gray-200, #e5e7eb);
        }

        .persona-detalles {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .persona-detalle-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          background: var(--gray-50);
          border: 1px solid var(--gray-100);
          border-radius: 6px;
          font-size: 11px;
          color: var(--gray-600);
          white-space: nowrap;
        }

        .btn-icon-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--gray-200);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--gray-400);
        }
        .btn-icon-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .btn-icon-action-primary:hover {
          color: var(--primary-600);
          border-color: var(--primary-300);
          background: var(--primary-50);
        }
        .btn-icon-action-danger:hover {
          color: var(--error);
          border-color: #fca5a5;
          background: #fef2f2;
        }
        .btn-icon-action-success:hover {
          color: var(--success);
          border-color: #86efac;
          background: #f0fdf4;
        }
        .btn-icon-action-warning:hover {
          color: var(--warning);
          border-color: #fde68a;
          background: #fffbeb;
        }

        .persona-status-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 4px 0 0 4px;
        }
        .persona-status-bar-on {
          background: var(--success, #22c55e);
        }
        .persona-status-bar-off {
          background: var(--gray-300, #d1d5db);
        }

        .area-nav-btn {
          width: 100%;
          text-align: left;
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 4px;
          border: 2px solid transparent;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .btn-reset-defaults {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--gray-200);
          background: white;
          color: var(--gray-400);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-reset-defaults:hover {
          color: var(--error);
          border-color: #fca5a5;
          background: #fef2f2;
          box-shadow: 0 1px 6px rgba(239,68,68,0.1);
        }
        .btn-reset-defaults:active {
          transform: scale(0.97);
        }
        .area-nav-btn:last-child { margin-bottom: 0; }
        .area-nav-btn:hover {
          background: linear-gradient(135deg, #fafaff 0%, #f0f4ff 100%);
          border-color: #e0e7ff;
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
        }
        .area-nav-btn-active {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%) !important;
          border-color: var(--primary-300, #93c5fd) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08), 0 2px 8px rgba(59,130,246,0.12) !important;
        }
        .area-nav-btn-active:hover {
          transform: none;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08), 0 2px 8px rgba(59,130,246,0.12) !important;
        }

        .area-nav-emoji {
          font-size: 22px;
          line-height: 1;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .area-nav-btn:hover .area-nav-emoji {
          transform: scale(1.1);
        }
        .area-nav-btn-active .area-nav-emoji {
          transform: scale(1.15);
        }

        .area-nav-info {
          flex: 1;
          min-width: 0;
        }
        .area-nav-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--gray-700);
          margin-bottom: 3px;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }
        .area-nav-btn-active .area-nav-label {
          color: var(--primary-800);
        }
        .area-nav-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }
        .area-nav-total {
          color: var(--gray-400);
          font-weight: 500;
        }
        .area-nav-btn-active .area-nav-total {
          color: var(--primary-400);
        }
        .area-nav-sep {
          color: var(--gray-250);
        }
        .area-nav-activos {
          color: var(--success, #22c55e);
          font-weight: 600;
        }

        .area-nav-indicator {
          position: absolute;
          right: 0;
          top: 10px;
          bottom: 10px;
          width: 4px;
          border-radius: 4px 0 0 4px;
          background: linear-gradient(to bottom, var(--primary-500), var(--primary-600));
          box-shadow: -1px 0 6px rgba(59,130,246,0.2);
          animation: indicatorIn 0.3s ease;
        }
        @keyframes indicatorIn {
          from { opacity: 0; transform: scaleY(0.5); }
          to { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}