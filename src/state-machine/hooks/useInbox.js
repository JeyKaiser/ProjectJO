import { useState, useEffect, useCallback } from 'react';
import { getInbox, fetchCollections } from '../services/inboxService';

const DEFAULT_FILTERS = {
  state: 'all',
  alertLevel: 'all',
  assignedRole: '',
  minQuietHours: 0,
  lifecycleStatus: 'all',
  collectionId: 'all',
  year: 'all',
};

export function useInbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetchCollections().then(setCollections);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getInbox(filters).then(result => {
      if (cancelled) return;
      setItems(result);
      setError(null);
      setLoading(false);
    }).catch(e => {
      if (cancelled) return;
      setError(e.message);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters, refreshKey]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setLoading(true);
  }, []);

  const criticalCount = items.filter(i => i.alertLevel === 'critical').length;
  const warningCount = items.filter(i => i.alertLevel === 'warning').length;
  const byState = {};
  items.forEach(i => {
    byState[i.currentState] = (byState[i.currentState] || 0) + 1;
  });

  return {
    items,
    loading,
    error,
    filters,
    collections,
    setFilters: updateFilter,
    resetFilters,
    refresh,
    criticalCount,
    warningCount,
    byState,
  };
}
