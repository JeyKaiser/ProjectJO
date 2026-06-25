import { PHASES } from './processMapData';

const FORK_PROCESS_IDS = {
  diseno: ['corte_md', 'confeccion_md', 'bordado_md', 'medicion_md'],
  industrializacion: ['corte_cm', 'confeccion_cm', 'bordado_cm', 'medicion_cm'],
};

const TRUNK_W = 160;
const TRUNK_H = 140;
const GAP = 50;
const STEP = TRUNK_W + GAP;
const FORK_W = 128;
const FORK_H = 50;
const FORK_GAP = 12;
const FORK_ROW_GAP = 14;
const FORKS_PER_ROW = 2;

const SUB_W = 110;
const SUB_H = 38;
const SUB_Y_OFFSET = 30;

export function buildFlowData() {
  const trunkNodes = [];
  const forkNodes = [];
  const branchPaths = [];
  const subprocessNodes = [];
  const subprocessPaths = [];
  let maxForkY = 0;

  PHASES.forEach((phase, pIdx) => {
    const forkIds = FORK_PROCESS_IDS[phase.id] || [];
    const nonForkProcesses = [];
    const forkProcesses = [];

    for (const proc of phase.processes) {
      if (forkIds.includes(proc.id)) {
        forkProcesses.push(proc);
      } else {
        nonForkProcesses.push({ id: proc.id, label: proc.label });
      }
    }

    trunkNodes.push({
      id: phase.id,
      label: phase.label,
      icon: phase.icon,
      color: phase.color,
      processes: nonForkProcesses,
      forkProcesses: forkProcesses.map(p => ({ id: p.id, label: p.label })),
      hasFork: forkProcesses.length > 0,
      x: pIdx * STEP,
      y: 0,
      w: TRUNK_W,
      h: TRUNK_H,
    });

    if (forkProcesses.length > 0) {
      const parentCenterX = pIdx * STEP + TRUNK_W / 2;
      const forkAreaY = TRUNK_H + 50;

      const row1Procs = forkProcesses.slice(0, FORKS_PER_ROW);
      const row2Procs = forkProcesses.slice(FORKS_PER_ROW, FORKS_PER_ROW * 2);

      const row1W = row1Procs.length * FORK_W + (row1Procs.length - 1) * FORK_GAP;
      const row2W = row2Procs.length * FORK_W + (row2Procs.length - 1) * FORK_GAP;
      const row1StartX = parentCenterX - row1W / 2;
      const row2StartX = parentCenterX - row2W / 2;

      const row1Y = forkAreaY;
      const row2Y = row1Y + FORK_H + FORK_ROW_GAP;
      const subRowY = row2Y + FORK_H + SUB_Y_OFFSET;

      const trunkBotY = TRUNK_H;

      row1Procs.forEach((proc, fIdx) => {
        const fx = row1StartX + fIdx * (FORK_W + FORK_GAP);
        const nodeId = `${phase.id}_${proc.id}`;
        const centerX = fx + FORK_W / 2;

        forkNodes.push({
          id: nodeId,
          label: proc.label,
          phase: phase.label,
          phaseId: phase.id,
          color: phase.color,
          icon: '🔧',
          activities: proc.activities || [],
          subprocesses: proc.subprocesses || null,
          x: fx,
          y: row1Y,
          w: FORK_W,
          h: FORK_H,
        });

        branchPaths.push({
          type: 'fork',
          from: phase.id,
          to: nodeId,
          d: `M ${parentCenterX} ${trunkBotY} C ${parentCenterX} ${trunkBotY + 16}, ${centerX} ${row1Y - 16}, ${centerX} ${row1Y}`,
        });

        branchPaths.push({
          type: 'merge',
          from: nodeId,
          to: phase.id,
          d: `M ${centerX} ${row1Y + FORK_H} C ${centerX} ${row1Y + FORK_H + 12}, ${parentCenterX} ${trunkBotY + 16}, ${parentCenterX} ${trunkBotY + 4}`,
        });

        if (proc.subprocesses && proc.subprocesses.length > 0) {
          buildSubprocesses(proc, nodeId, centerX, row1Y, subRowY, phase, subprocessNodes, subprocessPaths);
        }
      });

      row2Procs.forEach((proc, fIdx) => {
        const fx = row2StartX + fIdx * (FORK_W + FORK_GAP);
        const nodeId = `${phase.id}_${proc.id}`;
        const centerX = fx + FORK_W / 2;

        forkNodes.push({
          id: nodeId,
          label: proc.label,
          phase: phase.label,
          phaseId: phase.id,
          color: phase.color,
          icon: '🔧',
          activities: proc.activities || [],
          subprocesses: proc.subprocesses || null,
          x: fx,
          y: row2Y,
          w: FORK_W,
          h: FORK_H,
        });

        branchPaths.push({
          type: 'fork',
          from: phase.id,
          to: nodeId,
          d: `M ${parentCenterX} ${trunkBotY} C ${parentCenterX} ${trunkBotY + 16}, ${centerX} ${row2Y - 16}, ${centerX} ${row2Y}`,
        });

        branchPaths.push({
          type: 'merge',
          from: nodeId,
          to: phase.id,
          d: `M ${centerX} ${row2Y + FORK_H} C ${centerX} ${row2Y + FORK_H + 12}, ${parentCenterX} ${trunkBotY + 16}, ${parentCenterX} ${trunkBotY + 4}`,
        });

        if (proc.subprocesses && proc.subprocesses.length > 0) {
          buildSubprocesses(proc, nodeId, centerX, row2Y, subRowY, phase, subprocessNodes, subprocessPaths);
        }
      });

      const bottomMergeEndY = row2Y + FORK_H + 12 + 14;
      maxForkY = Math.max(maxForkY, bottomMergeEndY);

      if (subprocessNodes.length > 0 && subRowY + SUB_H + 20 > maxForkY) {
        maxForkY = subRowY + SUB_H + 20;
      }
    }
  });

  const totalW = PHASES.length * STEP + 20;
  const totalH = Math.max(TRUNK_H + 12, maxForkY + 20);

  return { trunkNodes, forkNodes, branchPaths, subprocessNodes, subprocessPaths, totalW, totalH };
}

function buildSubprocesses(proc, parentForkId, parentCenterX, parentRowY, subRowY, phase, subprocessNodes, subprocessPaths) {
  proc.subprocesses.forEach((sub) => {
    const subId = `${parentForkId}_s_${sub.id}`;
    const subX = parentCenterX - SUB_W / 2;
    const subY = subRowY;
    const subCenterX = parentCenterX;

    subprocessNodes.push({
      id: subId,
      label: sub.label,
      parentForkId,
      phase: phase.label,
      phaseId: phase.id,
      color: phase.color,
      icon: '↳',
      activities: sub.activities || [],
      x: subX,
      y: subY,
      w: SUB_W,
      h: SUB_H,
    });

    subprocessPaths.push({
      type: 'subprocess',
      from: parentForkId,
      to: subId,
      d: `M ${parentCenterX} ${parentRowY + FORK_H} L ${subCenterX} ${subY}`,
    });
  });
}
