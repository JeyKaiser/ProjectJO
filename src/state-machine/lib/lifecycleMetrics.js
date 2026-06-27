import { formatDuration } from './lifecycleGraphData';
import { STATE_LABELS, MAIN_TRUNK_STATES } from './states';

export function computeMetrics(history) {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalDuration = new Date(last.timestamp) - new Date(first.timestamp);

  const stateDurations = {};
  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const state = entry.to_state;
    if (!state || state === 'union' || state === 'pausado') continue;
    const duration = entry.duration_in_previous_ms || 0;
    stateDurations[state] = (stateDurations[state] || 0) + duration;
  }

  let bottleneck = null;
  let maxDuration = 0;
  for (const [state, dur] of Object.entries(stateDurations)) {
    if (dur > maxDuration) {
      maxDuration = dur;
      bottleneck = state;
    }
  }

  const forkDurations = {};
  const forkCounts = {};
  for (const entry of sorted) {
    if (entry.is_parallel_fork && entry.fork_type) {
      forkCounts[entry.fork_type] = (forkCounts[entry.fork_type] || 0) + 1;
    }
    if (entry.fork_type && entry.duration_in_previous_ms > 0) {
      forkDurations[entry.fork_type] = (forkDurations[entry.fork_type] || 0) + entry.duration_in_previous_ms;
    }
  }

  const trunkEntries = sorted.filter(e => MAIN_TRUNK_STATES.includes(e.to_state));
  const forkEntries = sorted.filter(e => e.is_parallel_fork || e.is_parallel_merge);

  return {
    totalDuration,
    totalDurationLabel: formatDuration(totalDuration),
    stateDurations: Object.fromEntries(
      Object.entries(stateDurations).map(([k, v]) => [k, { ms: v, label: formatDuration(v) }])
    ),
    bottleneck: bottleneck ? { state: bottleneck, label: STATE_LABELS[bottleneck], ms: maxDuration, labelDuration: formatDuration(maxDuration) } : null,
    forkDurations: Object.fromEntries(
      Object.entries(forkDurations).map(([k, v]) => [k, { ms: v, label: formatDuration(v), count: forkCounts[k] || 0 }])
    ),
    trunkTransitions: trunkEntries.length,
    forkOperations: forkEntries.length,
    stateCount: Object.keys(stateDurations).length,
  };
}

export function formatMetricTable(metrics) {
  if (!metrics) return [];
  const rows = [
    { label: '⏱ Tiempo total de vida', value: metrics.totalDurationLabel },
    { label: '🔀 Total forks realizados', value: String(metrics.forkOperations) },
  ];
  if (metrics.bottleneck) {
    rows.push({ label: '🐢 Cuello de botella', value: `${metrics.bottleneck.label} (${metrics.bottleneck.labelDuration})` });
  }
  for (const [state, data] of Object.entries(metrics.stateDurations)) {
    rows.push({
      label: `  ${STATE_LABELS[state] || state}`,
      value: data.label,
    });
  }
  for (const [type, data] of Object.entries(metrics.forkDurations)) {
    rows.push({
      label: `  🔀 ${type}`,
      value: `${data.label} (${data.count}x)`,
    });
  }
  return rows;
}
