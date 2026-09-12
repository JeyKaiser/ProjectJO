import { Loader2, RefreshCw } from 'lucide-react';

function errorMessage(error) {
  if (typeof error === 'string') return error;
  return error?.message || 'Ocurrio un error inesperado.';
}

export default function AsyncState({
  loading = false,
  error = null,
  empty = false,
  onRetry,
  loadingMessage = 'Cargando...',
  emptyTitle = 'Sin datos',
  emptyMessage = 'No hay informacion para mostrar.',
  children,
}) {
  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 120,
    padding: 'var(--space-8)',
    textAlign: 'center',
    color: 'var(--gray-500)',
  };

  if (loading) {
    return (
      <div style={contentStyle} role="status" aria-live="polite">
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...contentStyle, color: 'var(--error-dark)' }} role="alert">
        <strong>No se pudo cargar la informacion</strong>
        <span style={{ color: 'var(--gray-600)', maxWidth: 520 }}>{errorMessage(error)}</span>
        {onRetry && (
          <button type="button" className="btn btn-outline" onClick={onRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} aria-hidden="true" />
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div style={contentStyle}>
        <strong style={{ color: 'var(--gray-700)' }}>{emptyTitle}</strong>
        <span>{emptyMessage}</span>
      </div>
    );
  }

  return children;
}
