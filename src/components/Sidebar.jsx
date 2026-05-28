import { NavLink } from 'react-router-dom';
import { FileText, Scissors, PackageCheck, Settings, FolderOpen, LayoutDashboard, BookMarked, Inbox, Clock, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { isAdmin, isCreadorFicha, isCreativo, isTecnico, isLiderModistas, isTrazador, isEspecificadora } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">JO</div>
          <div className="sidebar-logo-text">Colecciones</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* DASHBOARD - Visible para todos */}
        <div className="nav-section">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><LayoutDashboard size={20} /></span>
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* EXPLORAR COLECCIONES - Visible para todos */}
        <div className="nav-section">
          <NavLink to="/colecciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><FolderOpen size={20} /></span>
            <span>Explorar Colecciones</span>
          </NavLink>
        </div>

        {/* MI ESPACIO DE TRABAJO - Condicional según Rol */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ color: 'var(--primary-600)' }}>Mi Espacio de Trabajo</div>

          {(isAdmin || isCreadorFicha) && (
            <NavLink to="/ficha-nueva" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><FileText size={20} /></span>
              <span>Nueva Ficha Técnica</span>
            </NavLink>
          )}

          {(isAdmin || isCreativo) && (
            <NavLink to="/colecciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><Clock size={20} /></span>
              <span>Mis Referencias Activas</span>
            </NavLink>
          )}

          {(isAdmin || isTecnico) && (
            <NavLink to="/bandeja-tecnico" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><Inbox size={20} /></span>
              <span>Bandeja de Entrada</span>
            </NavLink>
          )}

          {(isAdmin || isLiderModistas) && (
            <NavLink to="/taller" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><Scissors size={20} /></span>
              <span>Control de Taller</span>
            </NavLink>
          )}

          {(isAdmin || isTrazador) && (
            <NavLink to="/produccion/consumos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><PackageCheck size={20} /></span>
              <span>Validación de Consumos</span>
            </NavLink>
          )}

          {(isAdmin || isEspecificadora) && (
            <NavLink to="/produccion/ficha-final" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><FileText size={20} /></span>
              <span>Ficha Final y Marquillas</span>
            </NavLink>
          )}
        </div>

        {/* HERRAMIENTAS - Visible para todos */}
        <div className="nav-section">
          <div className="nav-section-title">Herramientas</div>

          {/* Referentes es una base de conocimiento global, pero esencial para el Trazador */}
          <NavLink to="/referentes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><BookMarked size={20} /></span>
            <span>Referentes</span>
          </NavLink>

          <NavLink to="/importar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><Upload size={20} /></span>
            <span>Importar</span>
          </NavLink>

          {(isAdmin) && (
            <NavLink to="/configuracion" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-item-icon"><Settings size={20} /></span>
              <span>Configuración</span>
            </NavLink>
          )}
        </div>
      </nav>
    </aside>
  );
}
