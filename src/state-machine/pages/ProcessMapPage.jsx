import { useState } from 'react';
import { PHASES } from '../lib/processMapData';
import CollectionLifecycleFlow from '../components/CollectionLifecycleFlow';

const LEGACY_COLORS = {
  concepto: '#8B5CF6',
  diseno: '#3B82F6',
  costeo: '#F59E0B',
  industrializacion: '#EF4444',
  produccion: '#10B981',
  comercial: '#6366F1',
};

const styles = {
  page: {
    padding: '24px',
  },
  header: {
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
    margin: '4px 0 0',
  },
};

export default function ProcessMapPage() {
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedProcess, setExpandedProcess] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>🗺️ Mapa de Procesos — Ciclo de Vida de Referencia</h1>
        <p style={styles.subtitle}>
          Fases del tronco principal · Los procesos se bifurcan y retornan al ciclo de vida raíz
        </p>
      </div>

      {/* Timeline horizontal */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: '24px 20px',
        overflowX: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          minWidth: 750,
          position: 'relative',
          paddingBottom: 8,
        }}>
          {PHASES.map((phase, idx) => {
            const isExpanded = expandedPhase === phase.id;
            const color = phase.color || LEGACY_COLORS[phase.id] || '#6b7280';
            return (
              <div key={phase.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 16px',
                    borderRadius: 10,
                    backgroundColor: isExpanded ? color + '15' : '#ffffff',
                    border: `2px solid ${color}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: 100,
                    boxShadow: isExpanded ? `0 0 0 3px ${color}30` : 'none',
                    flex: 1,
                  }}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <span style={{ fontSize: 24 }}>{phase.icon}</span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: color,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}>
                    {phase.label}
                  </span>
                  <span style={{
                    padding: '1px 8px',
                    borderRadius: 8,
                    backgroundColor: color + '20',
                    color,
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {phase.processes.length} procesos
                  </span>
                </div>

                {idx < PHASES.length - 1 && (
                  <div style={{
                    flex: '0 0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d1d5db',
                    fontSize: 20,
                    fontWeight: 300,
                    userSelect: 'none',
                  }}>
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Procesos de la fase expandida */}
      {expandedPhase && (
        <div style={{ marginTop: 16 }}>
          {(() => {
            const phase = PHASES.find(p => p.id === expandedPhase);
            if (!phase) return null;
            const color = phase.color || LEGACY_COLORS[phase.id] || '#6b7280';
            return (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 8,
                border: `1px solid ${color}30`,
                padding: 20,
                borderLeft: `4px solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>
                    {phase.icon} {phase.label} — Procesos
                  </h3>
                  <span style={{ fontSize: 12, color }}>
                    {phase.processes.length} procesos · Todos retornan al tronco principal
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 12,
                }}>
                  {phase.processes.map((proc, idx) => {
                    const isExpanded = expandedProcess === `${phase.id}-${idx}`;
                    return (
                      <div key={idx} style={{
                        borderRadius: 8,
                        border: `1px solid ${isExpanded ? color : '#e5e7eb'}`,
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s',
                      }}>
                        <div
                          onClick={() => setExpandedProcess(isExpanded ? null : `${phase.id}-${idx}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? color + '08' : '#ffffff',
                            borderBottom: isExpanded ? `1px solid ${color}20` : '1px solid #f3f4f6',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = color + '08'; }}
                          onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          <div style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: color,
                            flexShrink: 0,
                          }} />
                          <span style={{
                            flex: 1,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#374151',
                            lineHeight: 1.3,
                          }}>
                            {proc.label}
                          </span>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            color: '#9ca3af',
                          }}>
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 6,
                              backgroundColor: '#f3f4f6',
                              fontWeight: 600,
                            }}>
                              {proc.activities.length} acts
                            </span>
                            <span style={{ fontSize: 12, color: '#d1d5db' }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: '10px 14px' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              Actividades
                            </div>
                            {proc.activities.length > 0 ? (
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {proc.activities.map((act, aIdx) => (
                                  <li key={aIdx} style={{
                                    padding: '5px 8px',
                                    marginBottom: 3,
                                    fontSize: 12,
                                    color: '#4b5563',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: 4,
                                    lineHeight: 1.4,
                                  }}>
                                    {act}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                                Sin actividades específicas
                              </div>
                            )}

                            {proc.subprocesses && proc.subprocesses.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                  Subprocesos
                                </div>
                                {proc.subprocesses.map((sub, sIdx) => (
                                  <div key={sIdx} style={{
                                    padding: '8px 10px',
                                    marginBottom: 6,
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: 6,
                                    border: '1px solid #e5e7eb',
                                  }}>
                                    <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 4 }}>
                                      ▸ {sub.label}
                                    </div>
                                    <ul style={{ margin: 0, padding: '0 0 0 14px' }}>
                                      {sub.activities.map((act, aIdx) => (
                                        <li key={aIdx} style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
                                          {act}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Indicador visual de retorno al tronco */}
                            <div style={{
                              marginTop: 10,
                              padding: '6px 10px',
                              backgroundColor: color + '10',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 11,
                              color,
                            }}>
                              <span>↩</span>
                              <span>Al completarse, retorna al tronco principal ({phase.label})</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Leyenda */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>        
      </div>

      {expandedPhase && (
        <div style={{
          marginTop: 12,
          textAlign: 'center',
          fontSize: 12,
          color: '#9ca3af',
        }}>
          💡 Haz clic en cualquier fase de la barra superior o en la leyenda para cambiar de fase
        </div>
      )}

      <CollectionLifecycleFlow />
    </div>
  );
}
