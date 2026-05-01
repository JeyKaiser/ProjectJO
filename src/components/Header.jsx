import { Search, Bell, User } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export default function Header() {
  const { role, setRole } = useAuth();
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-search">
          <span className="header-search-icon"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Buscar por código MD, PT o nombre..."
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="header-right">
        <select className="header-select" defaultValue="">
          <option value="">Todas las Colecciones</option>
          <option value="WINTER SUN 2026">Winter Sun 2026</option>
          <option value="FALL WINTER 2026">Fall Winter 2026</option>
        </select>

        {/* Simulador de Roles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-50)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-200)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-700)' }}>Rol:</span>
          <select 
            className="header-select" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '0 8px', color: 'var(--primary-700)' }}
          >
            {Object.values(ROLES).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        
        <button className="header-icon-btn" title="Notificaciones">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        
        <button className="header-icon-btn" title="Usuario">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
