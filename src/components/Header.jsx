import { Search, Bell, User } from 'lucide-react';

export default function Header() {
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
