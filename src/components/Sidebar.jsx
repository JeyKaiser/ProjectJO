import { NavLink } from 'react-router-dom';
import { FileText, Scissors, PackageCheck, Settings, FolderOpen, LayoutDashboard, BookMarked, Inbox, Clock, Upload, Sun, Moon, Shield, FileSpreadsheet, BarChart2, Hash, PanelLeftClose, PanelLeftOpen, Package, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const { isAdmin, isCreadorFicha, isCreativo, isTecnico, isLiderModistas, isTrazador, isEspecificadora, isCortador, isLiderCortadores } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
    document.documentElement.dataset.sidebarCollapsed = String(collapsed);
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed(prev => !prev);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">JO</div>
          <div className="sidebar-logo-text">Colecciones</div>
        </div>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* DASHBOARD - Visible para todos */}
        <div className="nav-section">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Dashboard' : undefined}>
            <span className="nav-item-icon"><LayoutDashboard size={20} /></span>
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* EXPLORAR COLECCIONES - Visible para todos */}
        <div className="nav-section">
          <NavLink to="/colecciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Explorar Colecciones' : undefined}>
            <span className="nav-item-icon"><FolderOpen size={20} /></span>
            <span>Explorar Colecciones</span>
          </NavLink>
        </div>

        {/* MI ESPACIO DE TRABAJO - Condicional según Rol */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ color: 'var(--primary-600)' }}>Mi Espacio de Trabajo</div>

          {(isAdmin || isCreadorFicha) && (
            <NavLink to="/ficha-nueva" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Nueva Ficha Técnica' : undefined}>
              <span className="nav-item-icon"><FileText size={20} /></span>
              <span>Nueva Ficha Técnica</span>
            </NavLink>
          )}

          {(isAdmin || isCreativo) && (
            <NavLink to="/creativo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Panel del Creativo' : undefined}>
              <span className="nav-item-icon"><Palette size={20} /></span>
              <span>Panel del Creativo</span>
            </NavLink>
          )}

          {/* {(isAdmin || isCreativo) && (
            <NavLink to="/colecciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Mis Referencias Activas' : undefined}>
              <span className="nav-item-icon"><Clock size={20} /></span>
              <span>Mis Referencias Activas</span>
            </NavLink>
          )} */}

          {/* {(isAdmin || isTecnico) && (
            <NavLink to="/bandeja-tecnico" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Bandeja de Entrada' : undefined}>
              <span className="nav-item-icon"><Inbox size={20} /></span>
              <span>Bandeja de Entrada</span>
            </NavLink>
          )} */}

          {(isAdmin || isLiderModistas) && (
            <NavLink to="/taller" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Control de Taller' : undefined}>
              <span className="nav-item-icon"><Scissors size={20} /></span>
              <span>Control de Taller</span>
            </NavLink>
          )}

          {(isAdmin || isCortador || isLiderCortadores) && (
            <NavLink to="/taller/corte" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Tabla de Corte' : undefined}>
              <span className="nav-item-icon"><Scissors size={20} /></span>
              <span>Tabla de Corte</span>
            </NavLink>
          )}

          {(isAdmin || isTrazador) && (
            <NavLink 
              to="/trazador" 
              className={({ isActive }) => `nav-item nav-item-production ${isActive ? 'active' : ''}`}
              title={collapsed ? 'Panel del Trazador' : undefined}
            >
              <span className="nav-item-icon"><Scissors size={20} /></span>
              <span className="nav-item-content">
                <span className="nav-item-label">Panel del Trazador</span>
                <span className="nav-item-role">Trazo</span>
              </span>
            </NavLink>
          )}

          {(isAdmin || isTrazador) && (
            <NavLink 
              to="/produccion/consumos" 
              className={({ isActive }) => `nav-item nav-item-production ${isActive ? 'active' : ''}`}
              title={collapsed ? 'Validación de Consumos' : undefined}
            >
              <span className="nav-item-icon"><PackageCheck size={20} /></span>
              <span className="nav-item-content">
                <span className="nav-item-label">Validación de Consumos</span>
                <span className="nav-item-role">Producción</span>
              </span>
            </NavLink>
          )}

          {(isAdmin || isEspecificadora) && (
            <NavLink to="/produccion/ficha-final" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Ficha Final y Marquillas' : undefined}>
              <span className="nav-item-icon"><FileText size={20} /></span>
              <span>Ficha Final y Marquillas</span>
            </NavLink>
          )}
        </div>

        {/* HERRAMIENTAS - Visible para todos */}
        <div className="nav-section">
          <div className="nav-section-title">Herramientas</div>

          {/* Referentes es una base de conocimiento global, pero esencial para el Trazador */}
          <NavLink to="/referentes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Referentes' : undefined}>
            <span className="nav-item-icon"><BookMarked size={20} /></span>
            <span>Referentes</span>
          </NavLink>

          {/* <NavLink to="/importar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Importar' : undefined}>
            <span className="nav-item-icon"><Upload size={20} /></span>
            <span>Importar</span>
          </NavLink> */}

          {(isAdmin || isCortador || isLiderCortadores) && (
            <NavLink to="/importar/corte" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Importar Corte' : undefined}>
              <span className="nav-item-icon"><FileSpreadsheet size={20} /></span>
              <span>Importar Corte</span>
            </NavLink>
          )}

          {(isAdmin || isCortador || isLiderCortadores) && (
            <NavLink to="/informes/corte" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Informes Corte' : undefined}>
              <span className="nav-item-icon"><BarChart2 size={20} /></span>
              <span>Informes Corte</span>
            </NavLink>
          )}

          {(isAdmin) && (
            <NavLink to="/admin/colecciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Gestion Colecciones' : undefined}>
              <span className="nav-item-icon"><Shield size={20} /></span>
              <span>Gestion Colecciones</span>
            </NavLink>
          )}

          {(isAdmin) && (
            <NavLink to="/admin/codigos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Codigos MD/PT' : undefined}>
              <span className="nav-item-icon"><Hash size={20} /></span>
              <span>Codigos MD/PT</span>
            </NavLink>
          )}

          {(isAdmin) && (
            <NavLink to="/admin/insumos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Insumos' : undefined}>
              <span className="nav-item-icon"><Package size={20} /></span>
              <span>Insumos</span>
            </NavLink>
          )}

          {(isAdmin) && (
            <NavLink to="/configuracion" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? 'Configuracion' : undefined}>
              <span className="nav-item-icon"><Settings size={20} /></span>
              <span>Configuracion</span>
            </NavLink>
          )}
        </div>
        
      </nav>
    </aside>
  );
}
