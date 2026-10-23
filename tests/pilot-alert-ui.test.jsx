import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const state = vi.hoisted(() => ({ current: null }));
vi.mock('../src/state-machine/hooks/useAlertMonitor', () => ({ useAlertMonitor: () => state.current }));
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }));
import AlertsPage from '../src/state-machine/pages/AlertsPage';

it('shows an error and retry instead of claiming no active alerts when loading failed', () => {
  state.current = { alerts: [], loading: false, error: 'request rejected', refresh: () => {}, totalCritical: 0, totalWarning: 0 };
  const html = renderToStaticMarkup(<AlertsPage />);
  expect(html).toContain('request rejected');
  expect(html).toContain('Reintentar');
  expect(html).not.toContain('No hay alertas activas');
});

it('shows the empty state only after a valid empty result', () => {
  state.current = { alerts: [], loading: false, error: null, refresh: () => {}, totalCritical: 0, totalWarning: 0 };
  expect(renderToStaticMarkup(<AlertsPage />)).toContain('No hay alertas activas');
});
