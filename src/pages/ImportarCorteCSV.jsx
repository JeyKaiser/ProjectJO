import { useState, useMemo, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw, Globe } from 'lucide-react';
import supabase from '../lib/supabase';

const MANEJO_MAP = {
  'SOLIDO': 'solido', 'SÓLIDO': 'solido',
  'MODIFICACION': 'mod_arte', 'MODIFICACIÓN': 'mod_arte',
  'UBICACION': 'ubic_trazo', 'UBICACIÓN': 'ubic_trazo',
  'ALL OVER': 'all_over', 'ALL OVER ': 'all_over',
  'CUERO': 'cuero',
};

const TIPO_MAP = {
  'MUESTRA': 'muestra', 'CONTRAMUESTRA': 'contramuestra',
  'PIEZAS': 'pieza', 'PIEZA': 'pieza',
  'LABORATORIO': 'laboratorio',
  'PEDIDO ESPECIAL': 'pedido_especial',
  'FORRO': 'forro',
  'SESGO': 'sesgo',
};

function parseDate(str) {
  if (!str || !str.trim()) return null;
  const parts = str.trim().split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const fullYear = y < 100 ? 2000 + y : y;
  return new Date(fullYear, m - 1, d).toISOString();
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().toUpperCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < 3) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

function mapRowRaw(row) {
  const sheetId = row['ID'] ? parseInt(row['ID']) : null;
  const refNum = row['REF'] || row['REFERENCIA'] || row['#'] || '';
  const manejoRaw = (row['MANEJO TELA'] || row['MANEJO_TELA'] || row['MANEJO'] || '').toUpperCase();
  const solicitante = row['TECNICO O CREATIVO'] || row['SOLICITANTE'] || row['TÉCNICO O CREATIVO'] || '';
  const colRaw = row['COLECCION'] || row['COLECCIÓN'] || '';
  const tipoRaw = (row['TIPO'] || '').toUpperCase();
  const cortador1 = row['CORTADOR 1'] || row['CORTADOR1'] || row['CORTADOR'] || '';
  const cortador2 = row['CORTADOR 2'] || row['CORTADOR2'] || '';
  const cortador3 = row['CORTADOR 3'] || row['CORTADOR3'] || '';
  const fechaRec = row['FECHA RECIBIDO'] || row['FECHA_RECIBIDO'] || row['RECEPCION'] || '';
  const fechaEnt = row['FECHA ENTREGA'] || row['FECHA_ENTREGA'] || row['ENTREGA'] || '';
  const estado = (row['ESTADO'] || '').toUpperCase();
  const obs = row['OBSERVACIONES'] || row['OBS'] || '';

  const cortadorNames = [cortador1, cortador2, cortador3].filter(Boolean);
  const fabricHandling = MANEJO_MAP[manejoRaw] || 'solido';
  const type = TIPO_MAP[tipoRaw] || 'muestra';

  let status = 'entregado';
  if (estado === 'EN COLA' || estado === 'PENDIENTE') status = 'en_cola';
  else if (estado === 'EN CORTE') status = 'en_corte';
  else if (estado === 'CORTADO') status = 'cortado';

  const fechaRecepcion = parseDate(fechaRec);
  const fechaEntrega = parseDate(fechaEnt);

  const hash = [refNum, colRaw, tipoRaw, fechaRec, solicitante].map(v => v.trim()).join('|');

  return {
    reference_number_csv: refNum || null,
    collection_raw: colRaw || null,
    type,
    fabric_handling: fabricHandling,
    requester_name: solicitante || null,
    cortador_names: cortadorNames,
    fecha_recepcion: fechaRecepcion,
    fecha_entrega: fechaEntrega,
    status,
    observations: obs || null,
    archived: true,
    sheet_id: sheetId,
    reference_id: null,
    collection_id: null,
  };
}

export default function ImportarCorteCSV() {
  const [csvData, setCsvData] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const importingRef = useRef(false);
  const [results, setResults] = useState(null);
  const [tab, setTab] = useState('csv');
  const [sheetId, setSheetId] = useState('1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY');
  const [sheetName, setSheetName] = useState('TABLA CORTE');
  const [sheetStatus, setSheetStatus] = useState(null);

  useEffect(() => {
    importingRef.current = importing;
  }, [importing]);

  useEffect(() => {
    const handler = (e) => {
      if (importingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const { headers, rows } = parseCSV(text);
      setCsvData({ headers, rows, fileName: file.name });
      setPreview(rows.slice(0, 10));
      setResults(null);
    };
    reader.readAsText(file);
  };

  const validation = useMemo(() => {
    if (!csvData) return null;
    const total = csvData.rows.length;
    const refs = [...new Set(csvData.rows.map(r => r['REF'] || '').filter(Boolean))];
    const types = [...new Set(csvData.rows.map(r => (r['TIPO'] || '').toUpperCase()).filter(Boolean))];
    const collections = [...new Set(csvData.rows.map(r => r['COLECCION'] || '').filter(Boolean))];
    return { total, refs, types, collections };
  }, [csvData]);

  const handleSheetFetch = async () => {
    setImporting(true);
    setResults(null);
    setSheetStatus('Conectando...');
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('google-sheets', {
        body: { spreadsheetId: sheetId, sheetName },
      });
      if (fnError) throw new Error(fnError.message || 'Error de conexion');
      const rows = fnData?.rows || [];
      if (!rows.length) { setSheetStatus('Hoja vacia o sin datos.'); setImporting(false); return; }

      setSheetStatus(`Recibidas ${rows.length} filas. Sincronizando...`);

      // const mapped = rows.map(row => mapRowRaw(row));
      const mapped = rows.map(row => mapRowRaw(row)).filter(r => r.reference_number_csv);

      // Obtener IDs existentes
      const { data: existing } = await supabase.from('cut_requests')
        .select('id, sheet_id')
        .eq('source', 'csv');

      const existingMap = {};
      (existing || []).forEach(r => { if (r.sheet_id) existingMap[r.sheet_id] = r.id; });

      let updated = 0, inserted = 0, errors = 0;
      const errorDetails = [];

      for (const row of mapped) {
        if (!row.sheet_id) continue;
        const existingId = existingMap[row.sheet_id];
        try {
          if (existingId) {
            const { error: err } = await supabase.from('cut_requests')
              .update({
                type: row.type, fabric_handling: row.fabric_handling,
                requester_name: row.requester_name, cortador_names: row.cortador_names,
                fecha_recepcion: row.fecha_recepcion, fecha_entrega: row.fecha_entrega,
                status: row.status, observations: row.observations,
                reference_number_csv: row.reference_number_csv,
                collection_raw: row.collection_raw,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingId);
            if (err) { errors++; errorDetails.push({ ref: row.reference_number_csv, error: err.message }); }
            else { updated++; }
          } else {
            const { error: err } = await supabase.from('cut_requests').insert({
              reference_id: null, collection_id: null,
              reference_number_csv: row.reference_number_csv,
              collection_raw: row.collection_raw,
              type: row.type, fabric_handling: row.fabric_handling,
              requester_name: row.requester_name, cortador_names: row.cortador_names,
              fecha_recepcion: row.fecha_recepcion, fecha_entrega: row.fecha_entrega,
              status: row.status, observations: row.observations,
              archived: true, source: 'csv', sheet_id: row.sheet_id,
            });
            if (err) { errors++; errorDetails.push({ ref: row.reference_number_csv, error: err.message }); }
            else { inserted++; }
          }
        } catch (e) { errors++; errorDetails.push({ ref: row.reference_number_csv, error: e.message }); }
      }

      setSheetStatus(null);
      setResults({
        total: rows.length,
        inserted,
        updated,
        errors,
        skipped: 0,
        errorDetails: errorDetails.slice(0, 20),
        fromSheets: true,
      });
    } catch (e) {
      setSheetStatus(null);
      alert('Error: ' + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!csvData) return;
    setImporting(true);
    setResults(null);

    try {
      const mapped = csvData.rows.map((row, idx) => ({ ...mapRowRaw(row), _idx: idx }));

      let success = 0;
      let errors = 0;
      const errorDetails = [];

      for (const row of mapped) {
        try {
          const { error: err } = await supabase.from('cut_requests').insert({
            reference_id: null,
            collection_id: null,
            reference_number_csv: row.reference_number_csv,
            collection_raw: row.collection_raw,
            type: row.type,
            fabric_handling: row.fabric_handling,
            requester_name: row.requester_name,
            cortador_names: row.cortador_names,
            fecha_recepcion: row.fecha_recepcion,
            fecha_entrega: row.fecha_entrega,
            status: row.status,
            observations: row.observations,
            archived: true,
            source: 'csv',
          });
          if (err) {
            errors++;
            errorDetails.push({ row: row._idx + 2, ref: row.reference_number_csv, error: err.message });
          } else {
            success++;
          }
        } catch (e) {
          errors++;
          errorDetails.push({ row: row._idx + 2, ref: row.reference_number_csv, error: e.message });
        }
      }

      setResults({
        total: csvData.rows.length,
        success,
        errors,
        skipped: 0,
        errorDetails: errorDetails.slice(0, 20),
      });
    } catch (e) {
      alert('Error general: ' + e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 900 }}>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Importar Tabla de Corte</h2>
      <p className="text-gray-500 text-sm mb-4">Importa datos historicos desde CSV o Google Sheets.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--gray-200)' }}>
        {[
          { key: 'csv', label: 'Subir CSV', icon: Upload },
          { key: 'sheets', label: 'Google Sheets', icon: Globe },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setResults(null); setCsvData(null); }}
            style={{
              padding: '8px 20px', border: 'none', background: 'none',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? 'var(--primary-600)' : 'var(--gray-500)',
              borderBottom: tab === t.key ? '2px solid var(--primary-500)' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab CSV */}
      {tab === 'csv' && (
        <>
          {!csvData ? (
            <div style={{
              border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)',
              padding: 40, textAlign: 'center', background: 'var(--gray-50)',
            }}>
              <FileSpreadsheet size={48} style={{ color: 'var(--gray-400)', marginBottom: 16 }} />
              <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--gray-700)' }}>Selecciona el archivo CSV</p>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
                Columnas: REF, MANEJO TELA, TECNICO O CREATIVO, COLECCION, TIPO, CORTADOR 1, CORTADOR 2, CORTADOR 3, FECHA RECIBIDO, FECHA ENTREGA, ESTADO, OBSERVACIONES
              </p>
              <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <Upload size={16} /> Cargar CSV
                <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div><strong>{csvData.fileName}</strong>
                  <span style={{ color: 'var(--gray-500)', marginLeft: 8, fontSize: 13 }}>{csvData.rows.length} filas</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => { setCsvData(null); setResults(null); }}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                    <Upload size={16} /> {importing ? 'Importando...' : `Importar ${validation?.total || 0} Registros`}
                  </button>
                </div>
              </div>
              {validation && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Filas', value: validation.total },
                    { label: 'Referencias unicas', value: validation.refs.length },
                    { label: 'Tipos', value: validation.types.join(', ') },
                    { label: 'Colecciones', value: validation.collections.join(', ') },
                  ].map(v => (
                    <div key={v.label} style={{ background: 'var(--gray-50)', padding: '8px 14px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                      <div style={{ fontSize: 10, color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>{v.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{v.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {csvData && (
                <div className="table-container" style={{ maxHeight: 300, overflow: 'auto', marginBottom: 16 }}>
                  <table className="table" style={{ fontSize: 11 }}>
                    <thead><tr>{csvData.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}>{csvData.headers.map(h => <td key={h}>{row[h] || '—'}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.rows.length > 10 && (
                    <div style={{ textAlign: 'center', padding: 8, color: 'var(--gray-400)', fontSize: 12 }}>
                      Mostrando 10 de {csvData.rows.length} filas
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Tab Google Sheets */}
      {tab === 'sheets' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 300 }}>
              <label className="form-label">ID del Spreadsheet</label>
              <input type="text" className="form-input" value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY" />
            </div>
            <div className="form-group" style={{ margin: 0, width: 180 }}>
              <label className="form-label">Nombre de la Hoja</label>
              <input type="text" className="form-input" value={sheetName}
                onChange={e => setSheetName(e.target.value)} placeholder="TABLA CORTE" />
            </div>
            <button className="btn btn-primary" onClick={handleSheetFetch} disabled={importing}
              style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <RefreshCw size={16} /> {importing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          {sheetStatus && (
            <div style={{ padding: 12, background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13, color: 'var(--primary-700)' }}>
              {sheetStatus}
            </div>
          )}
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 16 }}>
            La hoja debe estar compartida con <code>script-consumos@plataformacontroldediseno.iam.gserviceaccount.com</code> (permiso Lector).
            Las filas ya existentes no se duplican.
          </p>
        </div>
      )}

      {/* Resultados */}
      {results && (
        <div className="card" style={{ padding: 'var(--space-4)', marginTop: 16 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Resultado{results.fromSheets ? ' de Actualizacion' : ' de Importacion'}</h4>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            {results.inserted > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success-dark)' }}>
                <CheckCircle2 size={16} /> {results.inserted} nuevos
              </div>
            )}
            {results.updated > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-600)' }}>
                <CheckCircle2 size={16} /> {results.updated} actualizados
              </div>
            )}
            {results.success > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success-dark)' }}>
                <CheckCircle2 size={16} /> {results.success} importados
              </div>
            )}
            {results.errors > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--error)' }}>
                <AlertTriangle size={16} /> {results.errors} errores
              </div>
            )}
            {results.skipped > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)' }}>
                <CheckCircle2 size={16} /> {results.skipped} omitidos
              </div>
            )}
          {results.errorDetails && results.errorDetails.length > 0 && (
            <details style={{ fontSize: 12, color: 'var(--error)' }}>
              <summary>Ver errores ({results.errorDetails.length})</summary>
              <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
                {results.errorDetails.map((e, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    {e.row ? `Fila ${e.row} ` : ''}(REF {e.ref}): {e.error}
                  </div>
                ))}
              </div>
            </details>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

