import { STATE_LABELS, STATE_COLORS, STATE_ICONS, MAIN_TRUNK_STATES, TERMINAL_STATES } from '../lib/states';

const cardBase = {
  padding: '16px',
  borderRadius: 8,
  border: '1px solid var(--gray-200)',
  backgroundColor: 'var(--white)',
};

const statNumber = {
  fontSize: 28,
  fontWeight: 800,
  color: 'var(--gray-800)',
  lineHeight: 1,
};

const statLabel = {
  fontSize: 12,
  color: 'var(--gray-500)',
  marginTop: 4,
};

export default function StateMachineDashboard({ inbox, criticalCount, warningCount }) {
  const totalActive = (inbox || []).filter(i => i.lifecycleStatus === 'active').length;
  const totalPaused = (inbox || []).filter(i => i.lifecycleStatus === 'paused').length;
  const totalCompleted = (inbox || []).filter(i => i.lifecycleStatus === 'completed').length;

  const activeByState = {};
  (inbox || []).forEach(i => {
    if (i.lifecycleStatus === 'active') {
      activeByState[i.currentState] = (activeByState[i.currentState] || 0) + 1;
    }
  });

  const alertSummaryCard = (level, count, label, bgColor, dotColor) => (
    <div style={{
      ...cardBase,
      borderLeft: `4px solid ${dotColor}`,
      backgroundColor: bgColor + '15',
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: dotColor,
          boxShadow: `0 0 8px ${dotColor}60`,
        }} />
        <div>
          <div style={statNumber}>{count}</div>
          <div style={statLabel}>{label}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={cardBase}>
          <div style={statNumber}>{totalActive}</div>
          <div style={statLabel}>Activas</div>
        </div>
        <div style={cardBase}>
          <div style={statNumber}>{totalPaused}</div>
          <div style={statLabel}>Pausadas</div>
        </div>
        <div style={cardBase}>
          <div style={statNumber}>{totalCompleted}</div>
          <div style={statLabel}>Completadas</div>
        </div>
        {alertSummaryCard('critical', criticalCount, 'Alertas Críticas', '#7f1d1d', 'var(--error)')}
        {alertSummaryCard('warning', warningCount, 'Advertencias', '#78350f', 'var(--warning)')}
      </div>

      <div style={cardBase}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
          Distribución por Estado
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MAIN_TRUNK_STATES.map(state => {
            const count = activeByState[state] || 0;
            if (count === 0 && TERMINAL_STATES.includes(state)) return null;
            return (
              <div key={state} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: STATE_COLORS[state] + '15',
                border: `1px solid ${STATE_COLORS[state]}30`,
              }}>
                <span>{STATE_ICONS[state]}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
                  {STATE_LABELS[state]}
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: STATE_COLORS[state],
                  marginLeft: 4,
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
