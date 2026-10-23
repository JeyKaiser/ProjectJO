import { useState, useEffect, useCallback } from 'react';
import { getReferenceState } from '../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PILOT_COLLECTION_CODE } from '../../lib/pilotScope';
import {
  transition,
  initializeReference,
  getAvailableEvents,
  isValidTransition,
} from '../services/transitionService';

export function useStateMachine(referenceId) {
  const { isAdmin } = useAuth();
  const pilotReadonly = PILOT_COLLECTION_CODE === 'SS27' && !isAdmin;
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
         setAvailableEvents(pilotReadonly ? [] : getAvailableEvents(data.current_state, data));
      } else {
        setState(null);
        setAvailableEvents([]);
      }
      setError(null);
      setLoading(false);
    });
    return () => { cancelled = true; };
   }, [referenceId, refreshKey, pilotReadonly]);

  const init = useCallback(async (collectionId) => {
    if (pilotReadonly) throw new Error('El workflow SS27 solo puede operarlo Administrador.');
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
   }, [referenceId, pilotReadonly]);

  const execTransition = useCallback(async (event, payload = {}) => {
    if (pilotReadonly) throw new Error('El workflow SS27 solo puede operarlo Administrador.');
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
   }, [referenceId, pilotReadonly]);

  const checkTransition = useCallback((event) => {
    if (!state || pilotReadonly) return false;
    return isValidTransition(state.current_state, event);
   }, [state, pilotReadonly]);

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
