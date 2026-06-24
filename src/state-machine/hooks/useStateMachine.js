import { useState, useEffect, useCallback } from 'react';
import { getReferenceState } from '../lib/supabase';
import {
  transition,
  initializeReference,
  getAvailableEvents,
  isValidTransition,
} from '../services/transitionService';

export function useStateMachine(referenceId) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!referenceId) return;
    let cancelled = false;
    getReferenceState(referenceId).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) { setError(err.message); setLoading(false); return; }
      if (data) {
        setState(data);
        setAvailableEvents(getAvailableEvents(data.current_state, data));
      } else {
        setState(null);
        setAvailableEvents([]);
      }
      setError(null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [referenceId, refreshKey]);

  const init = useCallback(async (collectionId) => {
    setLoading(true);
    try {
      const result = await initializeReference(referenceId, collectionId);
      setState(result);
      setAvailableEvents(getAvailableEvents(result.current_state, result));
      setError(null);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [referenceId]);

  const execTransition = useCallback(async (event, payload = {}) => {
    setLoading(true);
    try {
      const result = await transition(referenceId, event, payload);
      setState(result);
      setAvailableEvents(getAvailableEvents(result.current_state, result));
      setError(null);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [referenceId]);

  const checkTransition = useCallback((event) => {
    if (!state) return false;
    return isValidTransition(state.current_state, event);
  }, [state]);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setLoading(true);
  }, []);

  return {
    state,
    loading,
    error,
    availableEvents,
    init,
    transition: execTransition,
    checkTransition,
    refresh,
  };
}
