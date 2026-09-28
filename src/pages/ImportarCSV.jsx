import { useCallback, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, RotateCcw, Upload } from 'lucide-react';
import {
  buildReferenceImportDocument,
  parseReferenceCsv,
  REFERENCE_CSV_HEADERS,
  REFERENCE_CSV_MAX_DATA_ROWS,
  REFERENCE_CSV_MAX_FILE_BYTES,
} from '../lib/referenceCsvParser';
import { confirmReferenceCsv, previewReferenceCsv } from '../lib/referenceImportApi';

const badgeColors = {
  CREATE: ['var(--success-light)', 'var(--success-dark)'],
  UPDATE: ['var(--warning-light)', 'var(--warning-dark)'],
  NO_CHANGE: ['var(--gray-100)', 'var(--gray-600)'],
  ROW_ERROR: ['var(--error-light)', 'var(--error-dark)'],
};

function IssueList({ issues = [] }) {
  if (!issues.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {issues.map((item, index) => (
        <div key={`${item.requirement}-${item.row}-${item.field}-${index}`} style={{ color: item.severity === 'WARNING' ? 'var(--warning-dark)' : 'var(--error-dark)', fontSize: 12, marginTop: 3 }}>
          {item.severity === 'WARNING' ? '⚠' : '✕'} {item.requirement} · {item.classification}{item.field ? ` · ${item.field}` : ''}: {item.message}
        </div>
      ))}
    </div>
  );
}

export default function ImportarCSV() {
  const [fileName, setFileName] = useState('');
  const [document, setDocument] = useState(null);
  const [localIssues, setLocalIssues] = useState([]);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [confirmationId, setConfirmationId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setFileName(''); setDocument(null); setLocalIssues([]); setPreview(null); setResult(null); setConfirmationId(null); setError('');
  };

  const handleFile = useCallback(async file => {
    reset();
    if (!file) return;
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setLocalIssues([{ severity: 'ERROR', classification: 'FILE_ERROR', requirement: 'CSV-001', message: 'Solo se admite un archivo .csv' }]);
      return;
    }
    if (file.size > REFERENCE_CSV_MAX_FILE_BYTES) {
      setLocalIssues([{ severity: 'ERROR', classification: 'FILE_ERROR', requirement: 'CSV-001', message: `El archivo supera el límite operativo de ${REFERENCE_CSV_MAX_FILE_BYTES / (1024 * 1024)} MB` }]);
      return;
    }
    try {
      const parsed = parseReferenceCsv(await file.arrayBuffer());
      setLocalIssues(parsed.issues);
      if (parsed.issues.some(item => item.severity === 'ERROR')) return;
      const nextDocument = buildReferenceImportDocument(parsed);
      setDocument(nextDocument);
      setBusy(true);
      setPreview(await previewReferenceCsv(nextDocument));
    } catch (uploadError) {
      setError(uploadError.message || String(uploadError));
    } finally {
      setBusy(false);
    }
  }, []);

  const confirm = async () => {
    if (!document || !preview?.can_confirm) return;
    setBusy(true); setError('');
    try {
      const stableConfirmationId = confirmationId || globalThis.crypto.randomUUID();
      if (!confirmationId) setConfirmationId(stableConfirmationId);
      setResult(await confirmReferenceCsv(document, fileName, preview, stableConfirmationId));
      setPreview(null);
    } catch (confirmError) {
      setError(confirmError.message || String(confirmError));
    } finally {
      setBusy(false);
    }
  };

  const allIssues = [...localIssues, ...(preview?.issues || [])];

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 0' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Importar referencias CSV</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 18 }}>
        Plantilla v0.1 · Solo referencias · La vista previa no escribe datos · Máximo {REFERENCE_CSV_MAX_DATA_ROWS} filas / {REFERENCE_CSV_MAX_FILE_BYTES / (1024 * 1024)} MB.
      </p>

      {error && <div className="card" role="alert" style={{ borderLeft: '3px solid var(--error-dark)', padding: 14, marginBottom: 16, color: 'var(--error-dark)' }}><AlertTriangle size={17} /> {error}</div>}
      <IssueList issues={allIssues} />

      {!document && !result && (
        <label className="card" style={{ display: 'block', border: '2px dashed var(--gray-300)', borderRadius: 12, padding: '42px 20px', textAlign: 'center', cursor: 'pointer', marginTop: 16 }}>
          <input type="file" accept=".csv,text/csv" hidden onChange={event => handleFile(event.target.files?.[0])} />
          <Upload size={38} color="var(--gray-400)" />
          <p style={{ fontWeight: 700 }}>Selecciona el CSV contractual</p>
          <p style={{ fontSize: 11, color: 'var(--gray-500)', overflowWrap: 'anywhere' }}>Obligatorias: Colección;Año;referencia · Opcionales en cualquier orden: {REFERENCE_CSV_HEADERS.slice(3).join(';')}</p>
          {fileName && <p>{fileName}</p>}
        </label>
      )}

      {busy && <div className="card" role="status" style={{ marginTop: 16, padding: 24, textAlign: 'center' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /><p>Revalidando en el servidor…</p></div>}

      {preview && !busy && (
        <>
          <div className="card" style={{ marginTop: 16, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileSpreadsheet size={19} /><strong>{fileName}</strong></div>
            <p style={{ fontSize: 13 }}>Colección: <strong>{preview.collection_code || '—'}</strong> · Año: <strong>{preview.year || '—'}</strong> · Filas: <strong>{preview.summary?.total || 0}</strong></p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
              <span>Crear: <strong>{preview.summary?.create || 0}</strong></span>
              <span>Actualizar: <strong>{preview.summary?.update || 0}</strong></span>
              <span>Sin cambios: <strong>{preview.summary?.no_change || 0}</strong></span>
              <span>Rechazadas: <strong>{preview.summary?.row_error || 0}</strong></span>
              <span>Warnings: <strong>{preview.summary?.warnings || 0}</strong></span>
            </div>
          </div>
          <div className="card" style={{ marginTop: 12, padding: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr>{['Fila', 'Referencia', 'Nombre', 'Línea', 'MD', 'PT', 'Diseñador', 'Resultado'].map(label => <th key={label} style={{ textAlign: 'left', padding: 7, borderBottom: '1px solid var(--gray-200)' }}>{label}</th>)}</tr></thead>
              <tbody>{(preview.rows || []).map(row => {
                const colors = badgeColors[row.action] || badgeColors.ROW_ERROR;
                return <tr key={row.source_row} style={{ verticalAlign: 'top' }}>
                  <td style={{ padding: 7 }}>{row.source_row}</td><td style={{ padding: 7 }}>{row.payload?.referencia || '—'}</td>
                  <td style={{ padding: 7 }}>{row.payload?.Nombre || '—'}</td><td style={{ padding: 7 }}>{row.payload?.['Línea'] || '—'}</td>
                  <td style={{ padding: 7 }}>{row.payload?.['Código MD'] || '—'}</td><td style={{ padding: 7 }}>{row.payload?.['Código PT'] || '—'}</td>
                  <td style={{ padding: 7 }}>{row.payload?.Diseñador || '—'}</td>
                  <td style={{ padding: 7 }}><span style={{ background: colors[0], color: colors[1], padding: '2px 6px', borderRadius: 4 }}>{row.action}</span><IssueList issues={row.issues} /></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-secondary" type="button" onClick={reset}><RotateCcw size={15} /> Cancelar</button>
            <button className="btn btn-primary" type="button" disabled={!preview.can_confirm} onClick={confirm} style={{ opacity: preview.can_confirm ? 1 : 0.5 }}>
              <CheckCircle2 size={16} /> Confirmar lote global
            </button>
          </div>
        </>
      )}

      {result && !busy && <div className="card" style={{ borderLeft: '3px solid var(--success-dark)', padding: 18, marginTop: 16 }}>
        <h3>Importación confirmada</h3><p>Lote <strong>#{result.batch_id}</strong> · Estado: {result.status}</p>
        <p>Aplicadas: {result.summary?.successful || 0} · Rechazadas: {result.summary?.row_error || 0} · Warnings: {result.summary?.warnings || 0}</p>
        <button className="btn btn-secondary" type="button" onClick={reset}><RotateCcw size={15} /> Importar otro archivo</button>
      </div>}
    </div>
  );
}
