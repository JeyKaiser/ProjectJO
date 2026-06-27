import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { getHistory } from '../lib/supabase';
import {
  buildLifecycleGraph,
  buildMermaidGraph,
  buildNodeMap,
} from '../lib/lifecycleGraphData';
import { computeMetrics, formatMetricTable } from '../lib/lifecycleMetrics';
import ProcessDetailModal from './ProcessDetailModal';

mermaid.initialize({
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
    primaryColor: '#3b82f6',
    primaryTextColor: '#1f2937',
    primaryBorderColor: '#d1d5db',
    lineColor: '#d1d5db',
    git0: '#3b82f6',
    git1: '#ec4899',
    git2: '#14b8a6',
    git3: '#f97316',
    git4: '#8b5cf6',
    git5: '#10b981',
    git6: '#6366f1',
    git7: '#ef4444',
    commitLabelColor: '#1f2937',
    commitLabelBackground: '#ffffff',
    commitLabelBorder: '#e5e7eb',
    tagLabelColor: '#374151',
    tagLabelBackground: '#f3f4f6',
    tagLabelBorder: '#d1d5db',
    branchLabelColor: '#ffffff',
    branchLabelBackground: '#374151',
  },
});

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
            color: data.color || '#6b7280',
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
      <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 14 }}>⏳ Construyendo diagrama de vida...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Error al cargar el diagrama</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>{error}</div>
      </div>
    );
  }

  if (!mermaidSvg) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 14 }}>Sin datos de historial para construir el diagrama</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 20,
      border: '1px solid #e5e7eb',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>
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
                backgroundColor: '#f3f4f6',
                color: '#374151',
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
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontWeight: 600 }}>{tooltip.text}</div>
            <div style={{ color: '#d1d5db', fontSize: 11 }}>{tooltip.subtext}</div>
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
          backgroundColor: '#f9fafb',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
        }}>
          {formatMetricTable(metrics).map((row, idx) => (
            <span key={idx} style={{ fontSize: 12, color: '#6b7280' }}>
              {row.label}: <strong style={{ color: '#374151' }}>{row.value}</strong>
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
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
