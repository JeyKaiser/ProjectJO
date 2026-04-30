import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Scissors, PackageCheck, Settings, FolderOpen } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">JO</div>
          <div className="sidebar-logo-text">Colecciones</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {/* EXPLORAR COLECCIONES */}
        <div className="nav-section">
          <NavLink to="/colecciones" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><FolderOpen size={20} /></span>
            <span>Explorar Colecciones</span>
          </NavLink>
        </div>

        {/* FASE 1 */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--temp-cold-border)', display: 'inline-block' }}></span>
            Fase 1 · Ideación y Diseño
          </div>
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><FileText size={20} /></span>
            <span>Nueva Ficha Técnica</span>
          </NavLink>
        </div>

        {/* FASE 2 */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--temp-warm-border)', display: 'inline-block' }}></span>
            Fase 2 · Laboratorio
          </div>
          <NavLink to="/taller" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><Scissors size={20} /></span>
            <span>Control de Taller</span>
          </NavLink>
        </div>

        {/* FASE 3 */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--temp-hot-border)', display: 'inline-block' }}></span>
            Fase 3 · Validación Técnica
          </div>
          <NavLink to="/produccion/consumos" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><PackageCheck size={20} /></span>
            <span>Validación de Telas y Consumos</span>
          </NavLink>
        </div>

        {/* FASE 4 */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--temp-fire-border)', display: 'inline-block' }}></span>
            Fase 4 · Industrialización
          </div>
          <NavLink to="/produccion/ficha-final" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><FileText size={20} /></span>
            <span>Ficha Final y Marquillas</span>
          </NavLink>
        </div>

        {/* HERRAMIENTAS */}
        <div className="nav-section">
          <div className="nav-section-title">Herramientas</div>
          <NavLink to="/configuracion" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon"><Settings size={20} /></span>
            <span>Configuración</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
