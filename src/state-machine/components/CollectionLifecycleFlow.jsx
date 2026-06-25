import { useMemo, useState } from 'react';
import { buildFlowData } from '../lib/collectionFlowData';
import ProcessDetailModal from './ProcessDetailModal';

const styles = {
  wrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    overflowX: 'auto',
    marginTop: 24,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#1f2937',
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  stats: {
    display: 'flex',
    gap: 12,
  },
  statBadge: (color) => ({
    padding: '2px 10px',
    borderRadius: 10,
    backgroundColor: color + '15',
    color,
    fontSize: 11,
    fontWeight: 600,
  }),
  legend: {
    display: 'flex',
    gap: 16,
    marginTop: 16,
    padding: '10px 14px',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    justifyContent: 'center',
    fontSize: 12,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#6b7280',
  },
  legendDot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: color,
  }),
};

export default function CollectionLifecycleFlow() {
  const flowData = useMemo(() => buildFlowData(), []);
  const { trunkNodes, forkNodes, branchPaths, subprocessNodes, subprocessPaths, totalW, totalH } = flowData;

  const [hoveredFork, setHoveredFork] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const cardForModal = selectedNode ? {
    stateLabel: selectedNode.label,
    icon: selectedNode.icon || '🔧',
    color: selectedNode.color || '#6b7280',
    type: 'fork',
    durationLabel: `${selectedNode.activities?.length || 0} actividades`,
    responsible: selectedNode.phase || '',
    activityCount: selectedNode.activities?.length || 0,
    activities: (selectedNode.activities || []).map(a =>
      typeof a === 'string'
        ? { eventLabel: a, event: a, timestamp: null, user: null }
        : a
    ),
    subprocesses: selectedNode.subprocesses || null,
  } : null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🌿 Ciclo de Vida de Colección — Secuencia + Fork/Merge</h2>
          <p style={styles.subtitle}>
            Eje principal secuencial · Los procesos se bifurcan en paralelo dentro de Diseño e Industrialización
          </p>
        </div>
        <div style={styles.stats}>
          <span style={styles.statBadge('#3b82f6')}>Tronco: {trunkNodes.length} fases</span>
          <span style={styles.statBadge('#ec4899')}>Forks: {forkNodes.length} procesos</span>
          <span style={styles.statBadge('#c084fc')}>Sub: {subprocessNodes.length} procesos</span>
          <span style={styles.statBadge('#6b7280')}>
            {trunkNodes.reduce((sum, n) => sum + n.processes.length + n.forkProcesses.length, 0)} procesos total
          </span>
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: totalW,
        height: totalH + 100,
      }}>
        <svg
          width={totalW}
          height={totalH + 100}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
            </filter>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
            </marker>
          </defs>

          {trunkNodes.map((node, idx) => {
            if (idx < trunkNodes.length - 1) {
              const x1 = node.x + node.w;
              const y1 = node.y + node.h / 2;
              const x2 = trunkNodes[idx + 1].x;
              const y2 = trunkNodes[idx + 1].y + node.h / 2;
              return (
                <line
                  key={`seq-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#d1d5db"
                  strokeWidth={2}
                />
              );
            }
            return null;
          })}

          {branchPaths.map((bp) => {
            const highlighted =
              (bp.type === 'fork' && bp.to === hoveredFork) ||
              (bp.type === 'merge' && bp.from === hoveredFork);
            return (
              <path
                key={`branch-${bp.type}-${bp.from}-${bp.to}`}
                d={bp.d}
                fill="none"
                stroke={bp.type === 'fork' ? '#a78bfa' : '#c4b5fd'}
                strokeWidth={highlighted ? 3.5 : 2}
                strokeDasharray={bp.type === 'merge' ? '6 3' : 'none'}
                opacity={highlighted ? 1 : 0.6}
              />
            );
          })}

          {subprocessPaths.map((sp) => (
            <path
              key={`sub-${sp.from}-${sp.to}`}
              d={sp.d}
              fill="none"
              stroke="#c4b5fd"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.7}
            />
          ))}
        </svg>

        {trunkNodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: node.w,
              minHeight: node.h,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: `2px solid ${node.color}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              padding: '10px 12px',
              cursor: 'default',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ fontSize: 18 }}>{node.icon}</span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: node.color,
                lineHeight: 1.2,
              }}>
                {node.label}
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              marginTop: 2,
            }}>
              {node.processes.map((p) => (
                <span key={p.id} style={{
                  padding: '1px 6px',
                  borderRadius: 5,
                  backgroundColor: '#f3f4f6',
                  fontSize: 10,
                  color: '#6b7280',
                  whiteSpace: 'nowrap',
                }}>
                  {p.label}
                </span>
              ))}
            </div>

            {node.hasFork && (
              <div style={{
                fontSize: 10,
                color: '#8b5cf6',
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: '#a78bfa',
                  display: 'inline-block',
                }} />
                {node.forkProcesses.length} forks →
              </div>
            )}
          </div>
        ))}

        {forkNodes.map((node) => {
          const isHovered = hoveredFork === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              onMouseEnter={() => setHoveredFork(node.id)}
              onMouseLeave={() => setHoveredFork(null)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.w,
                minHeight: node.h,
                backgroundColor: isHovered ? '#faf5ff' : '#ffffff',
                borderRadius: 8,
                border: `1.5px solid ${isHovered ? '#a78bfa' : node.color + '40'}`,
                boxShadow: isHovered ? '0 4px 14px rgba(139,92,246,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                padding: '8px 10px',
                cursor: 'pointer',
                zIndex: 3,
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ fontSize: 13 }}>{node.icon}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isHovered ? '#7c3aed' : '#374151',
                  lineHeight: 1.2,
                }}>
                  {node.label}
                </span>
              </div>

              <div style={{
                fontSize: 9,
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <span style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: node.color,
                  display: 'inline-block',
                }} />
                {node.phase}
                {' · '}
                {node.activities.length} acts
              </div>
            </div>
          );
        })}

        {subprocessNodes.map((node) => {
          const isHovered = hoveredFork === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              onMouseEnter={() => setHoveredFork(node.id)}
              onMouseLeave={() => setHoveredFork(null)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.w,
                minHeight: node.h,
                backgroundColor: isHovered ? '#faf5ff' : '#ffffff',
                borderRadius: 6,
                border: `1.5px dashed ${isHovered ? '#a78bfa' : node.color + '50'}`,
                boxShadow: isHovered ? '0 2px 8px rgba(139,92,246,0.1)' : 'none',
                padding: '5px 10px',
                cursor: 'pointer',
                zIndex: 3,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: 13, color: '#a78bfa' }}>{node.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: isHovered ? '#7c3aed' : '#6b7280',
                lineHeight: 1.2,
              }}>
                {node.label}
              </span>
              <span style={{
                fontSize: 8,
                color: '#9ca3af',
                marginLeft: 'auto',
              }}>
                {node.activities.length} acts
              </span>
            </div>
          );
        })}
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#3b82f6')} />
          <span>Tronco principal (secuencia)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#a78bfa')} />
          <span>Fork (bifurcación)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{
            ...styles.legendDot('#c4b5fd'),
            width: 14,
            height: 2,
            borderRadius: 2,
            backgroundColor: '#c4b5fd',
            position: 'relative',
            top: 3,
            border: 'none',
          }} />
          <span>Merge (retorno al tronco)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ fontSize: 13, color: '#a78bfa', marginRight: 2 }}>↳</span>
          <span>Subproceso (proceso hijo)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ color: '#9ca3af' }}>💡 Haz clic en un proceso fork para ver detalle</span>
        </div>
      </div>

      {selectedNode && (
        <ProcessDetailModal
          data={cardForModal}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
