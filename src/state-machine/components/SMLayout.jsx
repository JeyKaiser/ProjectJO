import { NavLink, Outlet } from 'react-router-dom';
import { useInbox } from '../hooks/useInbox';

const NAV_ITEMS = [
  { to: '/v2/sm/dashboard', icon: '📊', label: 'Dashboard', end: true },
  { to: '/v2/sm/inbox', icon: '📥', label: 'Bandeja', end: true },
  { to: '/v2/sm/process-map', icon: '🗺️', label: 'Mapa Procesos', end: true },
  { to: '/v2/sm/alerts', icon: '🚨', label: 'Alertas', end: true },
];

export default function SMLayout() {
  const { criticalCount } = useInbox();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{
        display: 'flex',
        gap: 4,
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#4f46e5' : '#6b7280',
              backgroundColor: isActive ? '#eef2ff' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.label === 'Alertas' && criticalCount > 0 && (
              <span style={{
                marginLeft: 2,
                padding: '1px 7px',
                borderRadius: 10,
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: '18px',
              }}>
                {criticalCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <main style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
