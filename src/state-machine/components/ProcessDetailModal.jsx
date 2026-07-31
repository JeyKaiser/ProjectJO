

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'var(--white)',
    borderRadius: 12,
    padding: 28,
    maxWidth: 480,
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    border: '1px solid var(--gray-200)',
    color: 'var(--gray-700)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--gray-800)',
    margin: 0,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid var(--gray-100)',
    fontSize: 13,
  },
  rowLabel: {
    color: 'var(--gray-500)',
  },
  rowValue: {
    fontWeight: 600,
    color: 'var(--gray-700)',
    textAlign: 'right',
  },
  activityItem: {
    padding: '8px 10px',
    backgroundColor: 'var(--gray-50)',
    borderRadius: 6,
    marginBottom: 6,
    fontSize: 13,
    border: '1px solid var(--gray-100)',
  },
  closeBtn: {
    padding: '10px 24px',
    borderRadius: 6,
    border: '1px solid var(--gray-300)',
    backgroundColor: 'var(--white)',
    color: 'var(--gray-500)',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
    width: '100%',
    marginTop: 8,
  },
};

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function InfoRow({ label, value, color }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{ ...styles.rowValue, color: color || 'var(--gray-700)' }}>{value || '—'}</span>
    </div>
  );
}

export default function ProcessDetailModal({ data, onClose }) {
  if (!data) return null;

  const isFork = data.type === 'fork';
  const color = data.color || 'var(--gray-500)';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ ...styles.iconBox, backgroundColor: color + '20' }}>
            <span>{data.icon || '●'}</span>
          </div>
          <div>
            <h2 style={styles.title}>{data.stateLabel}</h2>
            {isFork && (
              <span style={{ ...styles.badge, backgroundColor: color + '20', color }}>
                {data.activityCount || 0} actividades
              </span>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Tiempos</div>
          <InfoRow label="Inicio" value={formatDate(data.timestamp)} />
          {isFork && <InfoRow label="Fin (merge)" value={formatDate(data.mergeTimestamp)} />}
          <InfoRow label="Duración" value={data.durationLabel || '—'} color={color} />
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Responsable</div>
          <InfoRow label="Persona" value={data.responsible || '—'} />
          {data.role && <InfoRow label="Rol" value={data.role} />}
        </div>

        {data.eventLabel && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Evento</div>
            <InfoRow label="Transición" value={data.eventLabel} />
          </div>
        )}

        {isFork && data.activities && data.activities.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Actividades</div>
            {data.activities.map((act, idx) => (
              <div key={idx} style={styles.activityItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{act.eventLabel || act.event}</span>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatDate(act.timestamp)}</span>
                </div>
                {act.user && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>👤 {act.user}</span>}
                {act.justification && (
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--warning-dark)', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: 4 }}>
                    💬 {act.justification}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.justification && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Justificación</div>
            <div style={{ padding: '8px 10px', backgroundColor: '#fffbeb', borderRadius: 6, fontSize: 13, color: 'var(--warning-dark)' }}>
              💬 {data.justification}
            </div>
          </div>
        )}

        {data.consumptionChange && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Cambio de Consumo</div>
            <InfoRow label="Antes" value={`${data.consumptionChange.before} cm`} />
            <InfoRow label="Después" value={`${data.consumptionChange.after} cm`} />
            {data.consumptionChange.diff > 0 && (
              <InfoRow label="Diferencia" value={`+${data.consumptionChange.diff} cm`} color="var(--error)" />
            )}
          </div>
        )}

        {data.molderiaChanges && data.molderiaChanges.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Cambios en Moldería</div>
            {data.molderiaChanges.map((c, i) => (
              <div key={i} style={{ padding: '4px 0', fontSize: 13, color: 'var(--info-dark)' }}>📐 {c}</div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
      </div>
    </div>
  );
}
