import { subfaseToProgress } from '../data/colecciones';

export default function TemperatureBar({ subfase, showLabel = true }) {
  const progress = subfaseToProgress[subfase] || 0;

  return (
    <div className="temperature-bar-container">
      <div className="temperature-bar-track">
        <div 
          className="temperature-bar-fill"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="temperature-bar-marker"
          style={{ left: `${progress}%` }}
        >
          <div className="temperature-bar-marker-dot" />
        </div>
      </div>
      {showLabel && (
        <div className="temperature-bar-labels">
          <span style={{ color: 'var(--temp-cold-text)', fontSize: '9px', fontWeight: 700 }}>F1</span>
          <span style={{ color: 'var(--temp-warm-text)', fontSize: '9px', fontWeight: 700 }}>F2</span>
          <span style={{ color: 'var(--temp-hot-text)', fontSize: '9px', fontWeight: 700 }}>F3</span>
          <span style={{ color: 'var(--temp-fire-text)', fontSize: '9px', fontWeight: 700 }}>F4</span>
        </div>
      )}
    </div>
  );
}
