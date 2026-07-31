import { useState, useCallback } from 'react';
import { STATE_LABELS, STATE_COLORS, STATE_ICONS, ROLE_MAP } from '../lib/states';
import { EVENT_LABELS } from '../lib/events';
import { getAvailableEvents } from '../services/transitionService';
import AlertBadge from './AlertBadge';
import StateFlowGraph from './StateFlowGraph';
import StateTimeline from './StateTimeline';
import TransitionModal from './TransitionModal';
import LifecycleGraph from './LifecycleGraph';

function InfoRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--gray-700)' }}>{value || '—'}</span>
    </div>
  );
}

export default function ReferenceStateDetail({
  referenceId,
  referenceNumber,
  referenceName,
  stateRecord,
  onTransition,
  loading,
}) {
  const [modalState, setModalState] = useState(null);

  const availableEvents = stateRecord
    ? getAvailableEvents(stateRecord.current_state, stateRecord)
    : [];

  const handleEvent = useCallback((event) => {
    setModalState({ event, stateRecord });
  }, [stateRecord]);

  const handleConfirm = useCallback(async (payload) => {
    if (!modalState) return;
    await onTransition(referenceId, modalState.event, payload);
    setModalState(null);
  }, [referenceId, modalState, onTransition]);

  if (!stateRecord) {
    return (
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 8,
        padding: 24,
        border: '1px solid var(--gray-200)',
        textAlign: 'center',
        color: 'var(--gray-500)',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
        <div>Esta referencia no está inicializada en la Máquina de Estados.</div>
        <button
          onClick={() => onTransition(referenceId, 'INIT')}
          style={{
            marginTop: 12,
            padding: '8px 20px',
            borderRadius: 6,
            border: '1px solid var(--gray-300)',
            backgroundColor: 'var(--white)',
            color: 'var(--gray-700)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Inicializar en Estado Concepto
        </button>
      </div>
    );
  }

  const stateColor = STATE_COLORS[stateRecord.current_state] || 'var(--gray-500)';

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 16,
      }}>
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 8,
          padding: 20,
          border: '1px solid var(--gray-200)',
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
            Información del Estado
          </h3>
          <InfoRow
            label="Estado Actual"
            value={`${STATE_ICONS[stateRecord.current_state]} ${STATE_LABELS[stateRecord.current_state]}`}
            color={stateColor}
          />
          <InfoRow
            label="Estado Anterior"
            value={stateRecord.previous_state ? STATE_LABELS[stateRecord.previous_state] : '—'}
          />
          <InfoRow
            label="Estado del Ciclo"
            value={{
              active: 'Activo',
              paused: 'Pausado',
              cancelled: 'Cancelado',
              completed: 'Completado',
            }[stateRecord.lifecycle_status] || stateRecord.lifecycle_status}
          />
          <InfoRow
            label="Tronco Principal"
            value={STATE_LABELS[stateRecord.main_trunk_state] || stateRecord.main_trunk_state}
            color={STATE_COLORS[stateRecord.main_trunk_state]}
          />
          <InfoRow
            label="Responsable"
            value={stateRecord.assigned_role || ROLE_MAP[stateRecord.current_state] || '—'}
          />
          <InfoRow
            label="Entrada al Estado"
            value={stateRecord.timestamp_entry
              ? new Date(stateRecord.timestamp_entry).toLocaleString('es-ES')
              : '—'
            }
          />
          <InfoRow
            label="Última Actualización"
            value={stateRecord.last_updated
              ? new Date(stateRecord.last_updated).toLocaleString('es-ES')
              : '—'
            }
          />
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 8,
          padding: 20,
          border: '1px solid var(--gray-200)',
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
            Consumos y Alertas
          </h3>
          <InfoRow
            label="Consumo Inicial"
            value={stateRecord.consumption_initial != null ? `${stateRecord.consumption_initial} cm` : '—'}
          />
          <InfoRow
            label="Consumo Contramuestra"
            value={stateRecord.consumption_contramuestra != null ? `${stateRecord.consumption_contramuestra} cm` : '—'}
          />
          <InfoRow
            label="Diferencia"
            value={stateRecord.consumption_diff != null ? `${stateRecord.consumption_diff} cm` : '—'}
            color={stateRecord.consumption_diff > (stateRecord.threshold_cm || 45) ? 'var(--error)' : '#22c55e'}
          />
          <InfoRow
            label="Umbral Configurado"
            value={stateRecord.threshold_cm ? `${stateRecord.threshold_cm} cm` : '45 cm (default)'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Alerta</span>
            <AlertBadge level={stateRecord.alert_level || 'none'} reason={stateRecord.alert_reason} />
          </div>
          {stateRecord.alert_reason && (
            <div style={{
              marginTop: 8,
              padding: '6px 10px',
              backgroundColor: stateRecord.alert_level === 'critical' ? '#fef2f2' : '#fffbeb',
              borderRadius: 6,
              fontSize: 12,
              color: stateRecord.alert_level === 'critical' ? 'var(--error)' : 'var(--warning-dark)',
            }}>
              {stateRecord.alert_reason}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <InfoRow
              label="Procesos Paralelos Activos"
              value={stateRecord.sub_states?.length
                ? stateRecord.sub_states.map(s => STATE_LABELS[s]).join(', ')
                : 'Ninguno'
              }
              color={stateRecord.sub_states?.length ? 'var(--warning)' : undefined}
            />
            <InfoRow
              label="Procesos Completados"
              value={stateRecord.completed_sub_states?.length
                ? stateRecord.completed_sub_states.map(s => STATE_LABELS[s]).join(', ')
                : 'Ninguno'
              }
              color="#22c55e"
            />
            {stateRecord.waiting_for_merge && (
              <div style={{
                marginTop: 8,
                padding: '6px 10px',
                backgroundColor: 'var(--secondary-100)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--secondary-700)',
                textAlign: 'center',
              }}>
                🔗 Todos los procesos paralelos completados. Use "Unir a Flujo Principal" para continuar.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <LifecycleGraph
          referenceId={referenceId}
          referenceNumber={referenceNumber}
        />
      </div>

      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 8,
        padding: 20,
        border: '1px solid var(--gray-200)',
        marginBottom: 16,
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
          Acciones Disponibles
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {availableEvents.map(event => {
            const toState = event === 'MERGE_UNION'
              ? stateRecord.main_trunk_state
              : event === 'REANUDAR'
                ? stateRecord.previous_state
                : undefined;

            return (
              <button
                key={event}
                onClick={() => handleEvent(event)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--gray-300)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--gray-700)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.backgroundColor = 'var(--gray-100)'; e.target.style.borderColor = 'var(--gray-500)'; }}
                onMouseLeave={e => { e.target.style.backgroundColor = 'var(--white)'; e.target.style.borderColor = 'var(--gray-300)'; }}
              >
                {EVENT_LABELS[event] || event}
                {toState && ` → ${STATE_LABELS[toState]}`}
              </button>
            );
          })}
          {availableEvents.length === 0 && (
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
              No hay transiciones disponibles desde este estado.
            </span>
          )}
        </div>
      </div>

      {stateRecord.current_state !== 'completado' && stateRecord.current_state !== 'cancelado' && (
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 8,
          padding: 20,
          border: '1px solid var(--gray-200)',
          marginBottom: 16,
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
            Actualizar Consumos
          </h3>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '0 0 12px' }}>
            Los cambios en consumo requerirán justificación obligatoria.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>
                Consumo Inicial (cm)
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue={stateRecord.consumption_initial ?? ''}
                id={`ci-${referenceId}`}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--gray-300)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--gray-700)',
                  fontSize: 13,
                  width: 120,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>
                Consumo Contramuestra (cm)
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue={stateRecord.consumption_contramuestra ?? ''}
                id={`ccm-${referenceId}`}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--gray-300)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--gray-700)',
                  fontSize: 13,
                  width: 120,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={() => {
                const ci = document.getElementById(`ci-${referenceId}`).value;
                const ccm = document.getElementById(`ccm-${referenceId}`).value;
                handleEvent('ACTUALIZAR_CONSUMOS');
                setModalState({
                  event: 'ACTUALIZAR_CONSUMOS',
                  stateRecord: {
                    ...stateRecord,
                    consumption_initial: ci !== '' ? Number(ci) : stateRecord.consumption_initial,
                    consumption_contramuestra: ccm !== '' ? Number(ccm) : stateRecord.consumption_contramuestra,
                  },
                });
              }}
              disabled={loading}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid var(--gray-300)',
                backgroundColor: 'var(--gray-50)',
                color: 'var(--gray-700)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Actualizar
            </button>
          </div>
        </div>
      )}

      <StateTimeline referenceId={referenceId} />

      {modalState && (
        <TransitionModal
          isOpen={true}
          onClose={() => setModalState(null)}
          referenceInfo={{ codigoMD: `MD-${referenceNumber}`, codigoPT: `PT03${referenceNumber}`, referenceName }}
          fromState={stateRecord.current_state}
          toState={stateRecord.current_state}
          event={modalState.event}
          stateRecord={modalState.stateRecord || stateRecord}
          onConfirm={handleConfirm}
          loading={loading}
        />
      )}
    </div>
  );
}
