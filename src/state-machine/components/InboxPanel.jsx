import { useState } from 'react';
import { STATE_LABELS, STATE_COLORS } from '../lib/states';
import { EVENT_LABELS } from '../lib/events';
import { getAvailableEvents } from '../services/transitionService';
import AlertBadge from './AlertBadge';
import TransitionModal from './TransitionModal';

const cellStyle = {
  padding: '10px 12px',
  fontSize: '13px',
  borderBottom: '1px solid #f3f4f6',
  color: '#4b5563',
};

const headerCellStyle = {
  ...cellStyle,
  fontWeight: 600,
  color: '#6b7280',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #e5e7eb',
};

const STATE_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  ...Object.entries(STATE_LABELS).map(([value, label]) => ({ value, label })),
];

const COLLECTION_COLORS = [
  '#EAB308', '#3B82F6', '#22C55E', '#F97316', '#A855F7', '#DC2626',
  '#EC4899', '#14B8A6', '#6366F1', '#84CC16',
];

function EventButton({ event, onClick, loading }) {
  const label = EVENT_LABELS[event] || event;
  return (
      <button
        onClick={() => onClick(event)}
        disabled={loading}
        style={{
          padding: '3px 10px',
          borderRadius: 6,
          border: '1px solid #d1d5db',
          backgroundColor: '#ffffff',
          color: '#374151',
          fontSize: 11,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.borderColor = '#6b7280'; }}
        onMouseLeave={e => { e.target.style.backgroundColor = '#ffffff'; e.target.style.borderColor = '#d1d5db'; }}
      >
      {label}
    </button>
  );
}

export default function InboxPanel({
  items,
  loading,
  error,
  filters,
  collections,
  onFilterChange,
  onResetFilters,
  onRefresh,
  onTransition,
  stateRecords,
}) {
  const [modalState, setModalState] = useState(null);

  const handleEventClick = (item, event, stateRecord) => {
    setModalState({ item, event, stateRecord });
  };

  const handleConfirm = async (payload) => {
    if (!modalState) return;
    await onTransition(modalState.item.referenceId, modalState.event, payload);
    setModalState(null);
  };

  const getFilterStyle = () => ({
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    minWidth: 140,
  });

  const collectionColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return COLLECTION_COLORS[Math.abs(hash) % COLLECTION_COLORS.length];
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        marginBottom: 16,
      }}>
        <select
          value={filters.state}
          onChange={e => onFilterChange('state', e.target.value)}
          style={getFilterStyle()}
        >
          {STATE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.alertLevel}
          onChange={e => onFilterChange('alertLevel', e.target.value)}
          style={getFilterStyle()}
        >
          <option value="all">Todas las alertas</option>
          <option value="critical">🔴 Críticas</option>
          <option value="warning">🟡 Advertencias</option>
          <option value="none">🟢 Sin alerta</option>
        </select>

        <select
          value={filters.collectionId}
          onChange={e => onFilterChange('collectionId', e.target.value)}
          style={{ ...getFilterStyle(), minWidth: 160 }}
        >
          <option value="all">Todas las colecciones</option>
          {collections.map(col => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={e => onFilterChange('year', e.target.value)}
          style={{ ...getFilterStyle(), minWidth: 120 }}
        >
          <option value="all">Todos los años</option>
          {[...new Set(collections.map(c => c.year).filter(Boolean))].sort().reverse().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Tiempo quieto ≥ (hrs)"
          value={filters.minQuietHours || ''}
          onChange={e => onFilterChange('minQuietHours', Number(e.target.value) || 0)}
          style={{
            ...getFilterStyle(),
            minWidth: 120,
          }}
        />

        <select
          value={filters.lifecycleStatus}
          onChange={e => onFilterChange('lifecycleStatus', e.target.value)}
          style={getFilterStyle()}
        >
          <option value="all">Todos los estados de ciclo</option>
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
        </select>

        <button
          onClick={onResetFilters}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: '#6b7280',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Limpiar filtros
        </button>

        <button
          onClick={onRefresh}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontSize: 12,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          ↻ Refrescar
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#fef2f2',
          borderRadius: 6,
          color: '#dc2626',
          fontSize: 13,
          marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={headerCellStyle}>Referencia</th>
                <th style={{ ...headerCellStyle, minWidth: 90 }}>Colección</th>
                <th style={headerCellStyle}>Códigos</th>
                <th style={headerCellStyle}>Estado Actual</th>
                <th style={headerCellStyle}>Tiempo Quieto</th>
                <th style={headerCellStyle}>Alerta</th>
                <th style={headerCellStyle}>Asignado a</th>
                <th style={headerCellStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...cellStyle, textAlign: 'center', color: '#9ca3af', padding: 40 }}>
                    Cargando bandeja...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...cellStyle, textAlign: 'center', color: '#6b7280', padding: 40 }}>
                    No hay referencias en la bandeja con los filtros actuales
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const stateRecord = stateRecords?.[item.referenceId];
                const events = getAvailableEvents(item.currentState, stateRecord);
                const colColor = collectionColor(item.collectionName);

                return (
                  <tr key={item.referenceId} style={{
                    backgroundColor: item.alertLevel === 'critical' ? '#fef2f2' : 'transparent',
                  }}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
                        {item.referenceName || `Ref #${item.referenceId}`}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: colColor + '18',
                        color: colColor,
                        fontSize: 11,
                        fontWeight: 600,
                        border: `1px solid ${colColor}30`,
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: colColor,
                          flexShrink: 0,
                        }} />
                        {item.collectionName}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{item.codigoMD}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.codigoPT}</div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: STATE_COLORS[item.currentState] + '20',
                        color: STATE_COLORS[item.currentState],
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {item.stateLabel}
                      </span>
                      {item.subStates?.length > 0 && (
                        <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>
                          Fork: {item.subStates.join(', ')}
                        </div>
                      )}
                      {item.waitingForMerge && (
                        <div style={{ fontSize: 11, color: '#a855f7', marginTop: 2 }}>
                          ⏳ Esperando unión
                        </div>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        fontWeight: item.quietTime.hours > 48 ? 700 : 400,
                        color: item.quietTime.hours > 48 ? '#dc2626' : '#4b5563',
                      }}>
                        {item.quietTime.display}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <AlertBadge
                        level={item.alertLevel}
                        reason={item.alertReason}
                        size="sm"
                      />
                      {item.consumptionDiff > 0 && (
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          Δ {item.consumptionDiff}cm
                        </div>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <span style={{ fontSize: 12, color: '#4b5563' }}>{item.assignedRole}</span>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {events.map(event => (
                          <EventButton
                            key={event}
                            event={event}
                            stateRecord={stateRecord}
                            onClick={(ev) => handleEventClick(item, ev, stateRecord)}
                            loading={loading}
                          />
                        ))}
                        {events.length === 0 && (
                          <span style={{ fontSize: 11, color: '#6b7280' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalState && (
        <TransitionModal
          isOpen={true}
          onClose={() => setModalState(null)}
          referenceInfo={{
            codigoMD: modalState.item.codigoMD,
            codigoPT: modalState.item.codigoPT,
            referenceName: modalState.item.referenceName,
          }}
          fromState={modalState.item.currentState}
          toState={modalState.stateRecord?.current_state}
          event={modalState.event}
          stateRecord={modalState.stateRecord}
          onConfirm={handleConfirm}
          loading={loading}
        />
      )}
    </div>
  );
}
