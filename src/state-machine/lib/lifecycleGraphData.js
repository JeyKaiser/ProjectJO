import { STATE_LABELS, STATE_ICONS, STATE_COLORS } from './states';
import { EVENT_LABELS } from '../lib/events';

const TRUNK_ORDER = [
  'concepto', 'diseno', 'costeo',
  'industrializacion', 'produccion', 'comercial', 'completado',
];

const FORK_LABELS = {
  bordado: { icon: '🪡', label: 'Bordado' },
  sublimado: { icon: '🖨️', label: 'Sublimado' },
  proceso_externo: { icon: '📦', label: 'Proc. Externo' },
};

export function formatDuration(ms) {
  if (!ms || ms <= 0) return '';
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return `${days}d ${remH}h`;
}

function truncateId(text, max = 18) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
}

export function buildLifecycleGraph(history) {
  const sorted = [...(history || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const trunk = [];
  const forkMap = {};
  for (const entry of sorted) {
    if (entry.is_parallel_fork && entry.fork_type) {
      if (!forkMap[entry.fork_type]) {
        forkMap[entry.fork_type] = {
          forkType: entry.fork_type,
          forkEvent: entry,
          activities: [],
          mergeEvent: null,
        };
      }
      forkMap[entry.fork_type].activities.push(entry);
    } else if (entry.is_parallel_merge && entry.fork_type) {
      if (!forkMap[entry.fork_type]) {
        forkMap[entry.fork_type] = {
          forkType: entry.fork_type,
          forkEvent: null,
          activities: [],
          mergeEvent: entry,
        };
      } else {
        forkMap[entry.fork_type].mergeEvent = entry;
      }
    } else {
      trunk.push(entry);
    }
  }

  const branches = {};
  for (const [type, data] of Object.entries(forkMap)) {
    const firstAct = data.activities[0] || data.forkEvent;
    const lastAct = data.activities[data.activities.length - 1] || data.mergeEvent;
    const totalDuration = firstAct && lastAct
      ? new Date(lastAct.timestamp) - new Date(firstAct.timestamp)
      : data.forkEvent?.duration_in_previous_ms || 0;
    const responsible = firstAct?.user_display_name || '—';

    branches[type] = {
      ...data,
      totalDuration,
      responsible,
      activityCount: data.activities.length,
    };
  }

  return { trunk, branches };
}

export function buildMermaidGraph(referenceNumber, { trunk, branches }) {
  const lines = ['gitGraph'];
  lines.push('  commit id: "0-💡' + truncateId(STATE_LABELS.concepto) + '"');

  let trunkIdx = 1;

  for (let i = 1; i < trunk.length; i++) {
    const entry = trunk[i];
    const fromState = trunk[i - 1]?.to_state || trunk[i - 1]?.from_state;
    const toState = entry.to_state;

    if (toState === 'union' || entry.is_parallel_merge) continue;

    const isForkEvent = entry.is_parallel_fork && entry.fork_type;
    const isMainTrunkState = TRUNK_ORDER.includes(toState);

    if (isForkEvent && entry.fork_type) {
      const ft = entry.fork_type;
      const branchInfo = branches[ft];
      const label = FORK_LABELS[ft]?.label || ft;
      const dur = branchInfo ? formatDuration(branchInfo.totalDuration) : '';
      const resp = branchInfo?.responsible || '';

      lines.push(`  branch ${ft}`);
      lines.push(`  checkout ${ft}`);

      const shortId = `${trunkIdx}-${FORK_LABELS[ft]?.icon || '🔀'}${label}${dur ? ' (' + dur + ')' : ''}${resp ? ' ' + resp : ''}`;
      lines.push(`  commit id: "${truncateId(shortId, 28)}" type: HIGHLIGHT`);

      lines.push('  checkout main');
      const forkingState = truncateId(STATE_LABELS[fromState] || fromState);
      lines.push(`  commit id: "${trunkIdx}-${STATE_ICONS[toState] || '●'}${forkingState}"`);
      trunkIdx++;

      if (branchInfo?.mergeEvent) {
        const mergeId = `${trunkIdx}-✓${label}OK`;
        lines.push(`  merge ${ft} id: "${truncateId(mergeId, 22)}"`);
        trunkIdx++;
      }
    } else if (isMainTrunkState) {
      const label = truncateId(STATE_LABELS[toState] || toState);
      const icon = STATE_ICONS[toState] || '●';
      lines.push(`  commit id: "${trunkIdx}-${icon}${label}"`);
      trunkIdx++;
    }
  }

  const cleanLines = lines.map(l => {
    const match = l.match(/id: "(\d+)-/);
    if (match) {
      return l.replace(/id: "\d+-/, 'id: "');
    }
    return l;
  });

  return cleanLines.join('\n');
}

export function buildNodeMap(referenceNumber, { trunk, branches }) {
  const nodeMap = {};

  trunk.forEach((entry, idx) => {
    const state = entry.to_state || entry.from_state;
    nodeMap[`trunk-${idx}`] = {
      type: 'trunk',
      state,
      stateLabel: STATE_LABELS[state] || state,
      icon: STATE_ICONS[state] || '●',
      color: STATE_COLORS[state] || '#6b7280',
      event: entry.event,
      eventLabel: EVENT_LABELS[entry.event] || entry.event,
      timestamp: entry.timestamp,
      duration: entry.duration_in_previous_ms,
      durationLabel: formatDuration(entry.duration_in_previous_ms),
      responsible: entry.user_display_name || '—',
      role: entry.user_role || '—',
      justification: entry.justification,
      consumptionChange: entry.consumption_change,
      molderiaChanges: entry.molderia_changes,
    };
  });

  for (const [type, data] of Object.entries(branches)) {
    const forkInfo = FORK_LABELS[type] || { icon: '🔀', label: type };
    nodeMap[`fork-${type}`] = {
      type: 'fork',
      forkType: type,
      stateLabel: forkInfo.label,
      icon: forkInfo.icon,
      color: STATE_COLORS[type] || '#f59e0b',
      timestamp: data.forkEvent?.timestamp || data.activities[0]?.timestamp,
      duration: data.totalDuration,
      durationLabel: formatDuration(data.totalDuration),
      responsible: data.responsible,
      activityCount: data.activityCount,
      activities: data.activities.map(a => ({
        event: a.event,
        eventLabel: EVENT_LABELS[a.event] || a.event,
        timestamp: a.timestamp,
        user: a.user_display_name,
        justification: a.justification,
      })),
      mergeTimestamp: data.mergeEvent?.timestamp,
      mergeEventLabel: EVENT_LABELS[data.mergeEvent?.event] || 'Merge',
      consumptionChange: data.forkEvent?.consumption_change,
    };
  }

  return nodeMap;
}
