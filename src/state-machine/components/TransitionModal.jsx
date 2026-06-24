import { useState } from 'react';
import { STATE_LABELS, STATE_COLORS, STATE_ICONS } from '../lib/states';
import { EVENT_LABELS } from '../lib/events';
import AlertBadge from './AlertBadge';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
};

const modalStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '28px',
  maxWidth: '520px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  border: '1px solid #e5e7eb',
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#ffffff',
  color: '#374151',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'vertical',
  minHeight: '80px',
};

const btnPrimary = {
  padding: '10px 24px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#f9fafb',
  color: '#374151',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
};

const btnSecondary = {
  padding: '10px 24px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#ffffff',
  color: '#6b7280',
  fontWeight: 500,
  fontSize: '14px',
  cursor: 'pointer',
};

export default function TransitionModal({
  isOpen,
  onClose,
  referenceInfo,
  fromState,
  toState,
  event,
  stateRecord,
  onConfirm,
  loading,
}) {
  const [justification, setJustification] = useState('');
  const [molderiaChanges, setMolderiaChanges] = useState([]);
  const [consumptionInitial, setConsumptionInitial] = useState(
    stateRecord?.consumption_initial ?? ''
  );
  const [consumptionContramuestra, setConsumptionContramuestra] = useState(
    stateRecord?.consumption_contramuestra ?? ''
  );

  if (!isOpen) return null;

  const fromLabel = STATE_LABELS[fromState] || fromState;
  const toLabel = STATE_LABELS[toState] || toState;
  const fromColor = STATE_COLORS[fromState] || '#6b7280';
  const toColor = STATE_COLORS[toState] || '#6b7280';
  const eventLabel = EVENT_LABELS[event] || event;
  const fromIcon = STATE_ICONS[fromState] || '●';
  const toIcon = STATE_ICONS[toState] || '●';

  const initialChanged = consumptionInitial !== '' && Number(consumptionInitial) !== Number(stateRecord?.consumption_initial);
  const cmChanged = consumptionContramuestra !== '' && Number(consumptionContramuestra) !== Number(stateRecord?.consumption_contramuestra);
  const needsJustification = initialChanged || cmChanged;

  const toggleMolderiaChange = (change) => {
    setMolderiaChanges(prev =>
      prev.includes(change)
        ? prev.filter(c => c !== change)
        : [...prev, change]
    );
  };

  const handleConfirm = async () => {
    await onConfirm({
      justification: needsJustification ? justification : undefined,
      molderiaChanges: molderiaChanges.length ? molderiaChanges : undefined,
      consumptionInitial: consumptionInitial !== '' ? Number(consumptionInitial) : undefined,
      consumptionContramuestra: consumptionContramuestra !== '' ? Number(consumptionContramuestra) : undefined,
    });
  };

  const MOLDERIA_OPTIONS = [
    'Se partió molde por ubicación de arte',
    'Se añadió forro interno',
    'Se añadió costura central',
    'Se modificó altura de tiro',
    'Se ajustó ancho de pierna',
    'Se añadió pinza',
    'Se eliminó costura lateral',
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
            Transicionar Referencia
          </h2>
          {referenceInfo && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
              {referenceInfo.codigoMD} — {referenceInfo.referenceName || referenceInfo.codigoPT}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '16px 0',
          marginBottom: 16,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>{fromIcon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: fromColor, marginTop: 4 }}>
              {fromLabel}
            </div>
          </div>
          <div style={{ fontSize: 24, color: '#d1d5db' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>{toIcon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: toColor, marginTop: 4 }}>
              {toLabel}
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          marginBottom: 16,
          fontSize: '14px',
          color: '#374151',
        }}>
          <strong>Evento:</strong> {eventLabel}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
            Consumo Inicial (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={consumptionInitial}
            onChange={e => setConsumptionInitial(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: 'auto',
              padding: '8px 12px',
              borderColor: initialChanged ? '#f59e0b' : '#4b5563',
            }}
            placeholder={String(stateRecord?.consumption_initial ?? '—')}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
            Consumo Contramuestra (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={consumptionContramuestra}
            onChange={e => setConsumptionContramuestra(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: 'auto',
              padding: '8px 12px',
              borderColor: cmChanged ? '#f59e0b' : '#4b5563',
            }}
            placeholder={String(stateRecord?.consumption_contramuestra ?? '—')}
          />
        </div>

        {needsJustification && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6, color: '#d97706' }}>
              ⚠ Justificación (requerida — los consumos cambiaron)
            </label>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              style={inputStyle}
              placeholder="Describa el motivo del cambio en consumo..."
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
            Cambios en Moldería (opcional)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MOLDERIA_OPTIONS.map(opt => (
              <label key={opt} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
                padding: '4px 0',
              }}>
                <input
                  type="checkbox"
                  checked={molderiaChanges.includes(opt)}
                  onChange={() => toggleMolderiaChange(opt)}
                  style={{ accentColor: '#6366f1' }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {stateRecord?.alert_level === 'critical' && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            borderRadius: '6px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            color: '#dc2626',
          }}>
            <AlertBadge level="critical" size="sm" />
            <span>Alerta crítica activa — Jeferson y Arancha deben revisar.</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={btnSecondary} disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={btnPrimary}
            disabled={loading || (needsJustification && !justification.trim())}
          >
            {loading ? 'Transicionando...' : '✓ Transicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
