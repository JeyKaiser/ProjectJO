import { useEffect, useRef, useState, useCallback } from 'react';
import { getHistory } from '../lib/supabase';
import {
  buildLifecycleGraph,
  buildMermaidGraph,
  buildNodeMap,
} from '../lib/lifecycleGraphData';
import { computeMetrics, formatMetricTable } from '../lib/lifecycleMetrics';
import ProcessDetailModal from './ProcessDetailModal';

let mermaidModule = null;

async function getMermaid() {
  if (!mermaidModule) {
    mermaidModule = await import('mermaid');
    mermaidModule.default.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      gitGraph: {
        showBranches: true,
        showCommitLabel: true,
        mainBranchName: 'main',
        rotateCommitLabel: false,
        nodeLabel: { width: 200, height: 30, x: -25, y: 0 },
      },
      themeVariables: {
        primaryColor: 'var(--primary-500)',
        primaryTextColor: 'var(--gray-800)',
        primaryBorderColor: 'var(--gray-300)',
        lineColor: 'var(--gray-300)',
        git0: 'var(--primary-500)',
        git1: '#ec4899',
        git2: '#14b8a6',
        git3: '#f97316',
        git4: '#8b5cf6',
        git5: 'var(--success)',
        git6: '#6366f1',
        git7: 'var(--error)',
        commitLabelColor: 'var(--gray-800)',
        commitLabelBackground: 'var(--white)',
        commitLabelBorder: 'var(--gray-200)',
        tagLabelColor: 'var(--gray-700)',
        tagLabelBackground: 'var(--gray-100)',
        tagLabelBorder: 'var(--gray-300)',
        branchLabelColor: 'var(--white)',
        branchLabelBackground: 'var(--gray-700)',
      },
    });
  }
  return mermaidModule.default;
}

export default function LifecycleGraph({ referenceId, referenceNumber }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [nodeMap, setNodeMap] = useState({});
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!referenceId) return;
    let cancelled = false;

    async function load() {
      try {
        const { data: history } = await getHistory(referenceId, 100);
        if (cancelled) return;

        const graph = buildLifecycleGraph(history || []);
        setGraphData(graph);
        setNodeMap(buildNodeMap(referenceNumber, graph));
        setMetrics(computeMetrics(history || []));

        const mmd = buildMermaidGraph(referenceNumber, graph);
        const mermaid = await getMermaid();
        const { svg } = await mermaid.render('lifecycle-graph', mmd);
        if (!cancelled) setMermaidSvg(svg);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [referenceId, referenceNumber]);

  const attachOverlay = useCallback(() => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg || !graphData) return;
    svgRef.current = svg;

    const textElements = svg.querySelectorAll('text');
    const nodeEntries = Object.entries(nodeMap);

    textElements.forEach(textEl => {
      const content = textEl.textContent.trim();
      if (!content) return;

      const matched = nodeEntries.find(([, data]) => {
        const label = data.stateLabel || '';
        return content.includes(label) && content.length <= 30;
      });

      if (!matched) return;
      const data = matched[1];

      let parent = textEl.closest('g');
      if (!parent) parent = textEl.parentElement;
      if (!parent) return;

      parent.style.cursor = 'pointer';
      parent.title = `${data.icon || ''} ${data.stateLabel}\n⏱ ${data.durationLabel || '—'}\n👤 ${data.responsible || '—'}`;

      parent.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedNode(data);
      });

      const bbox = textEl.getBBox ? textEl.getBBox() : null;
      if (bbox) {
        parent.addEventListener('mouseenter', (e) => {
          const rect = svg.getBoundingClientRect();
          setTooltip({
            x: e.clientX - rect.left + 12,
            y: e.clientY - rect.top - 10,
            text: `${data.icon || ''} ${data.stateLabel}`,
            subtext: `⏱ ${data.durationLabel || '—'} · 👤 ${data.responsible || '—'}`,
            color: data.color || 'var(--gray-500)',
          });
        });
        parent.addEventListener('mouseleave', () => setTooltip(null));
      }
    });
  }, [graphData, nodeMap]);

  useEffect(() => {
    if (mermaidSvg && containerRef.current) {
      containerRef.current.innerHTML = mermaidSvg;
      attachOverlay();
    }
  }, [mermaidSvg, attachOverlay]);

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', backgroundColor: 'var(--white)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
        <div style={{ fontSize: 14 }}>⏳ Construyendo diagrama de vida...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--error)', backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Error al cargar el diagrama</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>{error}</div>
      </div>
    );
  }

  if (!mermaidSvg) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', backgroundColor: 'var(--white)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
        <div style={{ fontSize: 14 }}>Sin datos de historial para construir el diagrama</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 8,
      padding: 20,
      border: '1px solid var(--gray-200)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
          Diagrama de Vida — Referencia {referenceNumber}
        </h3>
        {graphData?.branches && Object.keys(graphData.branches).length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {Object.entries(graphData.branches).map(([type, data]) => (
              <span key={type} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: 'var(--gray-100)',
                color: 'var(--gray-700)',
              }}>
                🔀 {type}: {data.durationLabel || '—'}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', overflowX: 'auto', padding: '8px 0' }}>
        <div ref={containerRef} style={{ minWidth: 600 }} />

        {tooltip && (
          <div style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'var(--gray-800)',
            color: 'var(--white)',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontWeight: 600 }}>{tooltip.text}</div>
            <div style={{ color: 'var(--gray-300)', fontSize: 11 }}>{tooltip.subtext}</div>
          </div>
        )}
      </div>

      {metrics && (
        <div style={{
          marginTop: 12,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          padding: '10px 14px',
          backgroundColor: 'var(--gray-50)',
          borderRadius: 6,
          border: '1px solid var(--gray-200)',
        }}>
          {formatMetricTable(metrics).map((row, idx) => (
            <span key={idx} style={{ fontSize: 12, color: 'var(--gray-500)' }}>
              {row.label}: <strong style={{ color: 'var(--gray-700)' }}>{row.value}</strong>
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gray-400)', textAlign: 'right' }}>
        💡 Haz clic en cualquier nodo para ver detalle · {formatDate(graphData?.trunk?.[0]?.timestamp)} → {formatDate(graphData?.trunk?.[graphData.trunk.length - 1]?.timestamp)}
      </div>

      {selectedNode && (
        <ProcessDetailModal
          data={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
