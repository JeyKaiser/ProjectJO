import { STATE_LABELS, STATE_COLORS, STATE_ICONS, PARALLEL_STATES } from '../lib/states';
import AlertBadge from './AlertBadge';

const TRUNK_ORDER = ['concepto', 'diseno', 'costeo', 'industrializacion', 'produccion', 'comercial', 'completado'];

export default function StateFlowGraph({ currentState, subStates, completedSubStates, alertLevel, stateCounts = {} }) {
  const isCurrent = (state) => state === currentState;
  const isSubActive = (state) => subStates?.includes(state);
  const isSubCompleted = (state) => completedSubStates?.includes(state);

  const nodeStyle = (state, isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '8px 12px',
    borderRadius: 8,
    backgroundColor: isActive ? STATE_COLORS[state] + '15' : 'var(--white)',
    border: `1px solid ${
      isActive ? STATE_COLORS[state] : 'var(--gray-200)'
    }`,
    opacity: state === 'completado' && !isActive ? 0.5 : 1,
    position: 'relative',
    minWidth: 90,
    cursor: 'default',
    transition: 'all 0.3s',
    boxShadow: isActive ? `0 0 8px ${STATE_COLORS[state]}30` : 'none',
  });

  const countBadge = (state) => {
    const count = stateCounts[state];
    if (!count) return null;
    return (
      <span style={{
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: STATE_COLORS[state],
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        borderRadius: '50%',
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {count}
      </span>
    );
  };

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 8,
      padding: 24,
      border: '1px solid var(--gray-200)',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
        Diagrama de Flujo — Máquina de Estados
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {TRUNK_ORDER.map((state, idx) => (
            <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={nodeStyle(state, isCurrent(state), false)}>
                {countBadge(state)}
                <span style={{ fontSize: 20 }}>{STATE_ICONS[state]}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: isCurrent(state) ? 700 : 500,
                  color: isCurrent(state) ? STATE_COLORS[state] : 'var(--gray-500)',
                }}>
                  {STATE_LABELS[state]}
                </span>
                {isCurrent(state) && alertLevel !== 'none' && (
                  <AlertBadge level={alertLevel} showLabel={false} size="sm" />
                )}
              </div>
              {idx < TRUNK_ORDER.length - 1 && (
                <span style={{ color: 'var(--gray-300)', fontSize: 18 }}>→</span>
              )}
            </div>
          ))}
        </div>

        {(subStates?.length > 0 || completedSubStates?.length > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: 12,
            backgroundColor: 'var(--gray-50)',
            borderRadius: 8,
            border: '1px dashed var(--gray-300)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>PROCESOS PARALELOS:</span>
            {PARALLEL_STATES.map(state => {
              const active = isSubActive(state);
              const completed = isSubCompleted(state);
              if (!active && !completed) return null;
              return (
                <div key={state} style={nodeStyle(state, active, true)}>
                  <span style={{ fontSize: 18 }}>{STATE_ICONS[state]}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: active ? 700 : 400,
                    color: active ? STATE_COLORS[state] : 'var(--gray-400)',
                  }}>
                    {STATE_LABELS[state]}
                    {completed && ' ✓'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {(subStates?.length > 0 || completedSubStates?.length > 0) && (
          <div style={{ textAlign: 'center', fontSize: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              backgroundColor: subStates?.length === 0 ? '#ecfdf5' : '#fffbeb',
              borderRadius: 12,
              color: subStates?.length === 0 ? 'var(--success-dark)' : 'var(--warning-dark)',
            }}>
              {subStates?.length === 0
                ? '✅ Todos los procesos paralelos completados — pendiente de Unión'
                : `⏳ Esperando: ${(subStates || []).map(s => STATE_LABELS[s]).join(', ')}`
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
