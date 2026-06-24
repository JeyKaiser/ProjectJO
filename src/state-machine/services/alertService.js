import { getThreshold } from './thresholdService';
import { ALERT_LEVELS } from '../lib/states';

export async function evaluateAlert(referenceId, consumoInitial, consumoContramuestra) {
  if (consumoInitial == null || consumoContramuestra == null) {
    return {
      alertLevel: ALERT_LEVELS.NONE,
      consumptionDiff: 0,
      threshold: 0,
      alertReason: null,
    };
  }

  const diff = Math.abs(Number(consumoContramuestra) - Number(consumoInitial));
  const threshold = await getThreshold(referenceId);
  const thresholdNum = Number(threshold);

  let alertLevel = ALERT_LEVELS.NONE;
  let alertReason = null;

  if (diff >= thresholdNum) {
    alertLevel = ALERT_LEVELS.CRITICAL;
    alertReason = `Diferencia crítica de ${diff.toFixed(1)}cm (límite ${thresholdNum}cm). `
      + 'Revisión urgente requerida por Jeferson y Arancha.';
  } else if (diff >= thresholdNum * 0.75) {
    alertLevel = ALERT_LEVELS.WARNING;
    alertReason = `Diferencia de ${diff.toFixed(1)}cm se acerca al límite de ${thresholdNum}cm.`;
  }

  return { alertLevel, consumptionDiff: diff, threshold: thresholdNum, alertReason };
}

export function evaluateAlertSync(consumoInitial, consumoContramuestra, threshold = 45) {
  if (consumoInitial == null || consumoContramuestra == null) {
    return {
      alertLevel: ALERT_LEVELS.NONE,
      consumptionDiff: 0,
      threshold,
      alertReason: null,
    };
  }

  const diff = Math.abs(Number(consumoContramuestra) - Number(consumoInitial));
  const thresholdNum = Number(threshold);

  let alertLevel = ALERT_LEVELS.NONE;
  let alertReason = null;

  if (diff >= thresholdNum) {
    alertLevel = ALERT_LEVELS.CRITICAL;
    alertReason = `Diferencia crítica de ${diff.toFixed(1)}cm (límite ${thresholdNum}cm).`;
  } else if (diff >= thresholdNum * 0.75) {
    alertLevel = ALERT_LEVELS.WARNING;
    alertReason = `Diferencia de ${diff.toFixed(1)}cm se acerca al límite de ${thresholdNum}cm.`;
  }

  return { alertLevel, consumptionDiff: diff, threshold: thresholdNum, alertReason };
}
