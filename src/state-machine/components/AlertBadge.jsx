const COLORS = {
  none: { bg: '#d1fae5', dot: '#10b981', label: 'Normal' },
  warning: { bg: '#fef3c7', dot: '#f59e0b', label: 'Advertencia' },
  critical: { bg: '#fee2e2', dot: '#ef4444', label: 'Crítica' },
};

export default function AlertBadge({ level = 'none', reason, showLabel = true, size = 'md' }) {
  const config = COLORS[level] || COLORS.none;
  const dotSize = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: showLabel ? '2px 10px 2px 6px' : '2px',
    borderRadius: '12px',
    backgroundColor: config.bg,
    fontSize: size === 'sm' ? '11px' : '13px',
    fontWeight: 500,
    color: config.dot,
    cursor: reason ? 'help' : 'default',
    title: reason || '',
  };

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: '50%',
    backgroundColor: config.dot,
    flexShrink: 0,
    boxShadow: level === 'critical'
      ? `0 0 6px ${config.dot}80`
      : 'none',
  };

  return (
    <span style={containerStyle}>
      <span style={dotStyle} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
