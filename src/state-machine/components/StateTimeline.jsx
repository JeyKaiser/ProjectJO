import { useState, useEffect } from 'react';
import { getHistory } from '../lib/supabase';
import { STATE_LABELS, STATE_COLORS, STATE_ICONS } from '../lib/states';
import { EVENT_LABELS } from '../lib/events';

export default function StateTimeline({ referenceId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!referenceId) return;
    let cancelled = false;
    async function load() {
      const { data } = await getHistory(referenceId, 50);
      if (!cancelled) setHistory(data || []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [referenceId]);

  if (loading) {
    return (
      <div style={{ padding: 20, color: '#6b7280', textAlign: 'center', fontSize: 14 }}>
        Cargando historial...
      </div>
    );
  }

  if (!history.length) {
    return (
      <div style={{
        padding: 20,
        color: '#9ca3af',
        textAlign: 'center',
        fontSize: 14,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
      }}>
        Sin historial de transiciones
      </div>
    );
  }

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDuration = (ms) => {
    if (!ms) return '—';
    const hours = ms / 3600000;
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
    return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h`;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 20,
      border: '1px solid #e5e7eb',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        Historial de Transiciones
      </h3>

      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div style={{
          position: 'absolute',
          left: 10,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: '#374151',
        }} />

        {history.map((entry, idx) => {
          const isLatest = idx === 0;
          const color = entry.to_state === entry.from_state
            ? '#6b7280'
            : STATE_COLORS[entry.to_state] || '#6b7280';

          return (
            <div key={entry.id || idx} style={{
              position: 'relative',
              paddingBottom: 16,
              marginLeft: 8,
            }}>
              <div style={{
                position: 'absolute',
                left: -32,
                top: 4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: color,
                border: `2px solid ${isLatest ? color : '#ffffff'}`,
                boxShadow: isLatest ? `0 0 6px ${color}80` : 'none',
                zIndex: 1,
              }} />

              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                border: isLatest ? `1px solid ${color}60` : '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {STATE_ICONS[entry.from_state]} {STATE_LABELS[entry.from_state] || entry.from_state}
                    {' → '}
                    {STATE_ICONS[entry.to_state]} {STATE_LABELS[entry.to_state] || entry.to_state}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(entry.timestamp)}</span>
                </div>

                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>Evento: <strong style={{ color: '#374151' }}>{EVENT_LABELS[entry.event] || entry.event}</strong></span>
                  {entry.duration_in_previous_ms > 0 && (
                    <span>Duración: <strong style={{ color: '#374151' }}>{formatDuration(entry.duration_in_previous_ms)}</strong></span>
                  )}
                  {entry.fork_type && (
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: 4,
          backgroundColor: '#e5e7eb',
                      fontSize: 11,
                      color: '#d97706',
                    }}>
                      {entry.is_parallel_fork ? '🔀 Fork' : entry.is_parallel_merge ? '🔗 Merge' : ''} {entry.fork_type}
                    </span>
                  )}
                </div>

                {entry.justification && (
                  <div style={{
                    marginTop: 6,
                    padding: '6px 10px',
                    backgroundColor: '#fffbeb',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#d97706',
                  }}>
                    💬 Justificación: {entry.justification}
                  </div>
                )}

                {entry.consumption_change && (
                  <div style={{
                    marginTop: 4,
                    padding: '4px 10px',
                    backgroundColor: '#fffbeb',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#d97706',
                  }}>
                    Consumo: {entry.consumption_change.before}cm → {entry.consumption_change.after}cm
                    {entry.consumption_change.diff > 0 && ` (Δ ${entry.consumption_change.diff}cm)`}
                  </div>
                )}

                {entry.molderia_changes?.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#2563eb' }}>
                    📐 Cambios: {entry.molderia_changes.join(', ')}
                  </div>
                )}

                {entry.user_display_name && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280' }}>
                    Por: {entry.user_display_name}{entry.user_role ? ` (${entry.user_role})` : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
