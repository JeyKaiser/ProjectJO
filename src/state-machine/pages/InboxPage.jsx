import { useState, useEffect, useCallback } from 'react';
import { useInbox } from '../hooks/useInbox';
import { initializeReference } from '../services/transitionService';
import { transition } from '../services/transitionService';
import { getReferenceState } from '../lib/supabase';
import InboxPanel from '../components/InboxPanel';

export default function InboxPage() {
  const {
    items, loading, error, filters, collections,
    setFilters, resetFilters, refresh,
    criticalCount, warningCount,
  } = useInbox();

  const [transitioning, setTransitioning] = useState(false);
  const [stateRecords, setStateRecords] = useState({});

  const handleTransition = useCallback(async (referenceId, event, payload = {}) => {
    setTransitioning(true);
    try {
      if (event === 'INIT') {
        await initializeReference(referenceId);
      } else {
        await transition(referenceId, event, payload);
      }
      refresh();

      const { data } = await getReferenceState(referenceId);
      if (data) {
        setStateRecords(prev => ({ ...prev, [referenceId]: data }));
      }
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setTransitioning(false);
    }
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    const records = {};
    Promise.all(items.map(item =>
      getReferenceState(item.referenceId).then(({ data }) => {
        if (!cancelled && data) records[item.referenceId] = data;
      })
    )).then(() => {
      if (!cancelled) setStateRecords(records);
    });
    return () => { cancelled = true; };
  }, [items]);

  const styles = {
    page: {
      padding: '24px',
      maxWidth: 1200,
      margin: '0 auto',
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: '#1f2937',
      margin: 0,
      fontFamily: "'Inter', sans-serif",
    },
    subtitle: {
      fontSize: 13,
      color: '#6b7280',
      margin: '2px 0 0',
    },
    stats: {
      display: 'flex',
      gap: 16,
      marginTop: 12,
    },
    statChip: {
      padding: '4px 12px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📥 Bandeja de Entrada</h1>
        <p style={styles.subtitle}>
          Referencias ordenadas por prioridad de alerta y tiempo quieto
        </p>
        <div style={styles.stats}>
          <span style={{ ...styles.statChip, backgroundColor: '#fef2f2', color: '#dc2626' }}>
            🔴 {criticalCount} críticas
          </span>
          <span style={{ ...styles.statChip, backgroundColor: '#fffbeb', color: '#d97706' }}>
            🟡 {warningCount} advertencias
          </span>
          <span style={{ ...styles.statChip, backgroundColor: '#f3f4f6', color: '#4b5563' }}>
            {items.length} total
          </span>
        </div>
      </div>

      <InboxPanel
        items={items}
        loading={loading || transitioning}
        error={error}
        filters={filters}
        collections={collections}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        onRefresh={refresh}
        onTransition={handleTransition}
        stateRecords={stateRecords}
      />
    </div>
  );
}
