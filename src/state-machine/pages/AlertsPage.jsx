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
      color: '#1f2937',
      margin: 0,
      fontFamily: "'Inter', sans-serif",
    },
    subtitle: {
      fontSize: 13,
      color: '#6b7280',
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
      color: '#dc2626',
      fontSize: 13,
      marginBottom: 12,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 16,
      border: '1px solid #e5e7eb',
      marginBottom: 12,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    cardCritical: {
      borderLeft: '4px solid #ef4444',
    },
    cardWarning: {
      borderLeft: '4px solid #f59e0b',
    },
    cell: {
      padding: '8px 12px',
      fontSize: 13,
      borderBottom: '1px solid #f3f4f6',
      color: '#4b5563',
    },
    headerCell: {
      padding: '8px 12px',
      fontWeight: 600,
      color: '#6b7280',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e5e7eb',
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
            color: '#dc2626',
            fontSize: 12,
            fontWeight: 600,
          }}>
            🔴 {totalCritical} críticas
          </span>
          <span style={{
            padding: '4px 12px',
            borderRadius: 6,
            backgroundColor: '#fffbeb',
            color: '#d97706',
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
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
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
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          Cargando alertas...
        </div>
      ) : alerts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: '#6b7280',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No hay alertas activas</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Todas las referencias están dentro de los umbrales de consumo.
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
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
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>
                        {alert.referenceName || `Ref #${alert.referenceId}`}
                      </div>
                    </td>
                    <td style={styles.cell}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{alert.codigoMD}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{alert.codigoPT}</div>
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
                      color: alert.alertLevel === 'critical' ? '#ef4444' : '#f59e0b',
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
                      color: '#9ca3af',
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
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        fontSize: 12,
        color: '#6b7280',
      }}>
        <strong>📐 Cálculo:</strong> Diferencia = |Consumo Contramuestra − Consumo Inicial|.
        Crítica si ≥ umbral configurado. Advertencia si ≥ 75% del umbral.
      </div>
    </div>
  );
}
