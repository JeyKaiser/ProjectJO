import { useInbox } from '../hooks/useInbox';
import StateMachineDashboard from '../components/StateMachineDashboard';
import StateFlowGraph from '../components/StateFlowGraph';

export default function DashboardPage() {
  const { items, loading, error, criticalCount, warningCount, byState, refresh } = useInbox();

  const activeByState = {};
  (items || []).forEach(i => {
    if (i.lifecycleStatus === 'active') {
      activeByState[i.currentState] = (activeByState[i.currentState] || 0) + 1;
    }
  });

  const styles = {
    page: {
      padding: '24px',
      maxWidth: 1200,
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--gray-800)',
      margin: 0,
      fontFamily: "'Inter', sans-serif",
    },
    subtitle: {
      fontSize: 13,
      color: 'var(--gray-500)',
      margin: '2px 0 0',
    },
    error: {
      padding: '10px 14px',
      backgroundColor: '#fef2f2',
      borderRadius: 8,
      color: 'var(--error)',
      fontSize: 13,
      marginBottom: 12,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏭 Dashboard — Máquina de Estados</h1>
          <p style={styles.subtitle}>Panel general del ciclo de vida de referencias</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={refresh}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid var(--gray-300)',
              backgroundColor: 'var(--white)',
              color: 'var(--gray-700)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ↻ Refrescar
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
          Cargando dashboard...
        </div>
      ) : (
        <>
          <StateMachineDashboard
            inbox={items}
            criticalCount={criticalCount}
            warningCount={warningCount}
            byState={byState}
          />

          <div style={{ marginTop: 20 }}>
            <StateFlowGraph
              currentState={null}
              stateCounts={activeByState}
            />
          </div>

          <div style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: 'var(--gray-50)',
            borderRadius: 8,
            border: '1px solid var(--gray-200)',
            fontSize: 12,
            color: 'var(--gray-500)',
            textAlign: 'center',
          }}>
            {items.length} referencias en seguimiento | {criticalCount} alertas críticas | {warningCount} advertencias
          </div>
        </>
      )}
    </div>
  );
}
