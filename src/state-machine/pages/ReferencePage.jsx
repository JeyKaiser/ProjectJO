import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useStateMachine } from '../hooks/useStateMachine';
import ReferenceStateDetail from '../components/ReferenceStateDetail';

export default function ReferencePage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const {
    state, loading, error,
    init, transition: execTransition, refresh,
  } = useStateMachine(refId);

  const handleTransition = useCallback(async (id, event, payload) => {
    try {
      if (event === 'INIT' || event === 'INITIALIZE') {
        await init(payload?.collectionId);
      } else if (event === 'ACTUALIZAR_CONSUMOS') {
        await execTransition('AVANZAR_CONCEPTO', {
          consumptionInitial: payload?.consumptionInitial,
          consumptionContramuestra: payload?.consumptionContramuestra,
          justification: payload?.justification,
        });
      } else {
        await execTransition(event, payload);
      }
      refresh();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }, [init, execTransition, refresh]);

  const styles = {
    page: {
      padding: '24px',
      maxWidth: 900,
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    backBtn: {
      padding: '6px 12px',
      borderRadius: 6,
      border: '1px solid var(--gray-300)',
      backgroundColor: 'var(--white)',
      color: 'var(--gray-500)',
      fontSize: 12,
      cursor: 'pointer',
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--gray-800)',
      margin: 0,
      fontFamily: "'Inter', sans-serif",
    },
    error: {
      padding: '10px 14px',
      backgroundColor: '#fef2f2',
      borderRadius: 8,
      color: 'var(--error)',
      fontSize: 13,
      marginBottom: 12,
    },
    loading: {
      textAlign: 'center',
      padding: 60,
      color: 'var(--gray-400)',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/v2/sm/inbox')} style={styles.backBtn}>
          ← Volver
        </button>
        <h1 style={styles.title}>Detalle SM: {refId}</h1>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading && !state ? (
        <div style={styles.loading}>Cargando estado...</div>
      ) : (
        <ReferenceStateDetail
          referenceId={refId}
          referenceNumber={refId}
          referenceName=""
          stateRecord={state}
          onTransition={handleTransition}
          loading={loading}
        />
      )}
    </div>
  );
}
