import { useNavigate } from 'react-router-dom';
import { useAlertMonitor } from '../hooks/useAlertMonitor';
import AlertBadge from '../components/AlertBadge';
import { STATE_COLORS } from '../lib/states';

export default function AlertsPage() {
  const navigate = useNavigate();
  const { alerts, loading, error, refresh, totalCritical, totalWarning } = useAlertMonitor();

  const styles = {
    page: {
      padding: '24px',
      maxWidth: 1000,
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
    stats: {
      display: 'flex',
      gap: 12,
    },
    error: {
      padding: '10px 14px',
      backgroundColor: '#fef2f2',
      borderRadius: 8,
      color: 'var(--error)',
      fontSize: 13,
      marginBottom: 12,
    },
    card: {
      backgroundColor: 'var(--white)',
      borderRadius: 8,
      padding: 16,
      border: '1px solid var(--gray-200)',
      marginBottom: 12,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    cardCritical: {
      borderLeft: '4px solid var(--error)',
    },
    cardWarning: {
      borderLeft: '4px solid var(--warning)',
    },
    cell: {
      padding: '8px 12px',
      fontSize: 13,
      borderBottom: '1px solid var(--gray-100)',
      color: 'var(--gray-600)',
    },
    headerCell: {
      padding: '8px 12px',
      fontWeight: 600,
      color: 'var(--gray-500)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid var(--gray-200)',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚨 Panel de Alertas</h1>
          <p style={styles.subtitle}>
            Referencias con diferencias de consumo que requieren atención
          </p>
        </div>
        <div style={styles.stats}>
          <span style={{
            padding: '4px 12px',
            borderRadius: 6,
            backgroundColor: '#fef2f2',
            color: 'var(--error)',
            fontSize: 12,
            fontWeight: 600,
          }}>
            🔴 {totalCritical} críticas
          </span>
          <span style={{
            padding: '4px 12px',
            borderRadius: 6,
            backgroundColor: '#fffbeb',
            color: 'var(--warning-dark)',
            fontSize: 12,
            fontWeight: 600,
          }}>
            🟡 {totalWarning} advertencias
          </span>
          <button
            onClick={refresh}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--gray-300)',
              backgroundColor: 'var(--white)',
              color: 'var(--gray-700)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
          Cargando alertas...
        </div>
      ) : alerts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: 'var(--gray-500)',
          backgroundColor: 'var(--white)',
          borderRadius: 8,
          border: '1px solid var(--gray-200)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)' }}>No hay alertas activas</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Todas las referencias están dentro de los umbrales de consumo.
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 8,
          border: '1px solid var(--gray-200)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                  <th style={styles.headerCell}>Referencia</th>
                  <th style={styles.headerCell}>Códigos</th>
                  <th style={styles.headerCell}>Estado</th>
                  <th style={styles.headerCell}>Alerta</th>
                  <th style={styles.headerCell}>Δ Consumo</th>
                  <th style={styles.headerCell}>Umbral</th>
                  <th style={styles.headerCell}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr
                    key={alert.referenceId}
                    style={{
                      backgroundColor: alert.alertLevel === 'critical' ? '#fef2f2' : '#fffbeb',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/v2/sm/reference/${alert.referenceId}`)}
                  >
                    <td style={styles.cell}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        {alert.referenceName || `Ref #${alert.referenceId}`}
                      </div>
                    </td>
                    <td style={styles.cell}>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{alert.codigoMD}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{alert.codigoPT}</div>
                    </td>
                    <td style={styles.cell}>
                      <span style={{
                        color: STATE_COLORS[alert.currentState],
                        fontWeight: 600,
                        fontSize: 12,
                      }}>
                        {alert.stateLabel}
                      </span>
                    </td>
                    <td style={styles.cell}>
                      <AlertBadge level={alert.alertLevel} size="sm" />
                    </td>
                    <td style={{
                      ...styles.cell,
                      fontWeight: 700,
                      color: alert.alertLevel === 'critical' ? 'var(--error)' : 'var(--warning)',
                    }}>
                      +{alert.consumptionDiff?.toFixed?.(1) ?? alert.consumptionDiff} cm
                    </td>
                    <td style={styles.cell}>
                      {alert.threshold} cm
                    </td>
                    <td style={{
                      ...styles.cell,
                      fontSize: 12,
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--gray-400)',
                    }}>
                      {alert.consumptionInitial && alert.consumptionContramuestra
                        ? `${alert.consumptionInitial} → ${alert.consumptionContramuestra} cm`
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: 'var(--gray-50)',
        borderRadius: 8,
        border: '1px solid var(--gray-200)',
        fontSize: 12,
        color: 'var(--gray-500)',
      }}>
        <strong>📐 Cálculo:</strong> Diferencia = |Consumo Contramuestra − Consumo Inicial|.
        Crítica si ≥ umbral configurado. Advertencia si ≥ 75% del umbral.
      </div>
    </div>
  );
}
