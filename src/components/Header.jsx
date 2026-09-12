import { useEffect, useRef, useState } from 'react';
import { Search, Sun, Moon, Shield, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { searchReferences, slugFromName } from '../lib/api';

export default function Header({ mobileOpen = false, onMenuClick = () => {} }) {
  const { role, displayName, email, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) return undefined;

    const timer = setTimeout(async () => {
      const requestId = requestRef.current;
      try {
        const nextResults = await searchReferences(term);
        if (requestId === requestRef.current) setResults(nextResults);
      } catch (error) {
        if (requestId === requestRef.current) {
          setResults([]);
          setSearchError(error.message || 'No se pudo buscar.');
        }
      } finally {
        if (requestId === requestRef.current) setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  function openReference(reference) {
    const collectionSlug = slugFromName(reference.collectionName || reference.collectionCode || 'coleccion');
    navigate(`/colecciones/${collectionSlug}/${reference.year}/${reference.referenceNumber}`);
    setSearchTerm('');
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <button type="button" className="header-menu-btn" onClick={onMenuClick} aria-label="Abrir navegación" aria-controls="main-navigation" aria-expanded={mobileOpen}>
          <Menu size={20} />
        </button>
        <div className="header-search">
          <span className="header-search-icon" aria-hidden="true"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Buscar por código MD, PT o nombre..."
            autoComplete="off"
            aria-label="Buscar referencias"
            value={searchTerm}
            onChange={event => {
              const value = event.target.value;
              requestRef.current += 1;
              setSearchTerm(value);
              setResults([]);
              setSearchError('');
              setSearching(Boolean(value.trim()));
            }}
          />
          {searchTerm.trim() && (
            <div className="header-search-results">
              {searching && <div className="header-search-message">Buscando...</div>}
              {!searching && searchError && <div className="header-search-message header-search-error">{searchError}</div>}
              {!searching && !searchError && results.length === 0 && <div className="header-search-message">Sin resultados.</div>}
              {!searching && !searchError && results.map(reference => (
                <button key={reference.id} type="button" className="header-search-result" onClick={() => openReference(reference)}>
                  <span>
                    <strong>{reference.name || `Referencia ${reference.referenceNumber}`}</strong>
                    <small>{reference.codigoMD} · {reference.codigoPT}</small>
                  </span>
                  <span className="header-search-result-meta">{reference.collectionName} · {reference.year}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="header-right">       

        <div className="header-account">
            <Shield size={14} style={{ color: 'var(--gray-600)' }} />
            <span className="header-account-info">
              <strong>{displayName || email}</strong>
              <small>{role}</small>
            </span>
        </div>

        <button type="button" className="header-icon-btn" onClick={handleSignOut} title="Cerrar sesión" aria-label="Cerrar sesión" disabled={signingOut}>
          <LogOut size={18} />
        </button>
        
        <button type="button" className="header-icon-btn" onClick={toggleTheme} title={isDark ? 'Modo claro' : 'Modo oscuro'} aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
