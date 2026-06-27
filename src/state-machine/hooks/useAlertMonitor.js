import { useState, useEffect, useCallback } from 'react';
import { getAllStates, getReferencesByIds } from '../lib/supabase';
import { evaluateAlertSync } from '../services/alertService';
import { STATE_LABELS } from '../lib/states';

export function useAlertMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAllStates().then(({ data: states }) => {
      if (cancelled) return;
      if (!states?.length) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      const refIds = states.map(s => s.reference_id);
      getReferencesByIds(refIds).then(({ data: refs }) => {
        if (cancelled) return;
        const refMap = {};
        (refs || []).forEach(r => { refMap[r.id] = r; });

        const criticalItems = [];
        const warningItems = [];

        states.forEach(state => {
          const hasCritical = state.alert_level === 'critical';
          const hasWarning = state.alert_level === 'warning';
          if (!hasCritical && !hasWarning) return;

          const ref = refMap[state.reference_id] || {};
          const result = evaluateAlertSync(
            state.consumption_initial,
            state.consumption_contramuestra,
            state.threshold_cm || 45
          );

          const alertItem = {
            referenceId: state.reference_id,
            referenceNumber: ref.reference_number || `#${state.reference_id}`,
            referenceName: ref.name || '',
            codigoMD: ref.reference_number ? `MD-${String(ref.reference_number).padStart(3, '0')}` : '',
            codigoPT: ref.reference_number ? `PT03${String(ref.reference_number).padStart(3, '0')}` : '',
            currentState: state.current_state,
            stateLabel: STATE_LABELS[state.current_state] || state.current_state,
            alertLevel: result.alertLevel || state.alert_level,
            alertReason: result.alertReason || state.alert_reason,
            consumptionInitial: state.consumption_initial,
            consumptionContramuestra: state.consumption_contramuestra,
            consumptionDiff: result.consumptionDiff || state.consumption_diff,
            threshold: result.threshold || state.threshold_cm,
            timestampEntry: state.timestamp_entry,
            lastUpdated: state.last_updated,
          };

          if (hasCritical) criticalItems.push(alertItem);
          else warningItems.push(alertItem);
        });

        const sorted = [...criticalItems, ...warningItems].sort(
          (a, b) => (b.consumptionDiff || 0) - (a.consumptionDiff || 0)
        );
        setAlerts(sorted);
        setError(null);
        setLoading(false);
      });
    }).catch(e => {
      if (cancelled) return;
      setError(e.message);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setLoading(true);
  }, []);

  const totalCritical = alerts.filter(a => a.alertLevel === 'critical').length;
  const totalWarning = alerts.filter(a => a.alertLevel === 'warning').length;

  return { alerts, loading, error, refresh, totalCritical, totalWarning };
}
