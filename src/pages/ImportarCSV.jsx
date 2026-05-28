import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Trash2, ArrowRight, Database, Table2, Terminal } from 'lucide-react';
import { parseValidationTelas } from '../lib/csvParser';
import { parseMatriz, detectFormat } from '../lib/matrizParser';
import { useDashboardData } from '../lib/api';
import supabase from '../lib/supabase';

// ── Status mapping para MATRIZ ──
const STATUS_MAP = { 'APROBADO': 2, 'EN PROCESO': 1, 'EN_PROCESO': 1, 'CANCELADO': 3, 'CANCELADO CORTADO': 3, 'CANCELADO SIN CORTAR': 3, 'JUST FOR SHOW': 3, 'PAQUETE COMPLETO': 4, 'PENDIENTE': 6, 'TERMINADO': 2 };
const DIFICULTAD_MAP = { 'BAJA': 1, 'BAJO': 1, 'MEDIA': 2, 'MEDIO': 2, 'INTERMEDIA': 2, 'INTERMEDIO': 2, 'ALTA': 3, 'ALTO': 3, 'CRITICO': 3, 'CRITICA': 3, 'MENOR': 1, 'MAYOR': 3 };

async function getOrCreateFabric(code, desc) {
  if (!code) return null;
  const { data } = await supabase.from('fabrics').select('id').eq('code', code).single();
  if (data) return data.id;
  const { data: ins } = await supabase.from('fabrics').upsert({ code, description: (desc || code).substring(0, 200) }, { onConflict: 'code' }).select('id');
  return ins?.[0]?.id || null;
}

async function getOrCreateLine(name) {
  if (!name) return null;
  const { data } = await supabase.from('lines').select('id').eq('name', name).single();
  if (data) return data.id;
  const { data: ins } = await supabase.from('lines').upsert({ name }, { onConflict: 'name' }).select('id');
  return ins?.[0]?.id || null;
}

async function getId(table, field, value) {
  if (!value) return null;
  const { data } = await supabase.from(table).select('id').eq(field, value).single();
  return data?.id || null;
}

export default function ImportarCSV() {
  const { data: dashData } = useDashboardData();
  const colecciones = dashData?.colecciones || [];

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [coleccionId, setColeccionId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ step: '', current: 0, total: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = useCallback((f) => {
    setError(''); setResult(null); setParsed(null); setFormat(null);
    if (!f) return;
    setFileName(f.name); setFile(f);

    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > 50) {
      setError(`El archivo pesa ${sizeMB.toFixed(0)} MB (limite: 50 MB). Opciones:
1. Ejecuta en terminal: python migracion/extract_matriz_light.py --input "${f.name}"
   Esto genera un archivo liviano sin imagenes que puedes subir aqui.
2. O usa el script directo: python migracion/etl_matriz.py --file "${f.name}" --collection WS`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result);
      const fmt = detectFormat(arr, f.name);
      setFormat(fmt);

      let data;
      if (fmt === 'MATRIZ') data = parseMatriz(arr, f.name);
      else if (fmt === 'VALIDACION_TELAS') data = parseValidationTelas(arr, f.name);
      else data = parseValidationTelas(arr, f.name); // fallback

      if (data?.error) { setError(data.error); setFile(null); return; }
      setParsed(data);
    };
    reader.onerror = () => setError('Error al leer el archivo');
    reader.readAsArrayBuffer(f);
  }, []);

  const onDrop = useCallback((e) => { e.preventDefault(); handleFile(e.dataTransfer?.files?.[0]); }, [handleFile]);
  const onDragOver = (e) => e.preventDefault();

  const handleUpload = async () => {
    if (!parsed || !coleccionId) return;
    setUploading(true); setResult(null); setError('');
    const col = colecciones.find(c => c.id === coleccionId || c.dbId == coleccionId);
    const colCode = col?.code;
    const colName = col?.nombre || coleccionId;
    let ins = { refs: 0, fabrics: 0, rf: 0, consumos: 0, medidas: 0, cortes: 0, confecciones: 0, composiciones: 0, bordados: 0, contramuestras: 0, calidad: 0, otros: 0 };
    let errors = 0;

    try {
      setProgress({ step: 'Buscando coleccion...', current: 0, total: 1 });
      const { data: cd } = await supabase.from('collections').select('id').eq('code', colCode).single();
      const colId = cd?.id;
      if (!colId) { setError(`Coleccion "${colCode}" no encontrada en la BD`); setUploading(false); return; }

      if (format === 'MATRIZ') {
        // ═══════════════ UPLOAD MATRIZ ═══════════════
        const refs = parsed.referencias;
        const sec = parsed.secciones;
        const totalSteps = refs.length + (sec.telas?.length || 0) + (sec.telasForro?.length || 0) + (sec.consumos?.length || 0) + (sec.medidas?.length || 0) + (sec.cortes?.length || 0) + (sec.confecciones?.length || 0) + 8;
        setProgress({ step: 'Preparando...', current: 0, total: totalSteps });

        // 1. Fabrics
        const fabMap = {};
        const allTelas = [...(sec.telas || []), ...(sec.telasForro || [])];
        setProgress({ step: 'Catalogando telas...', current: 0, total: allTelas.length });
        let fi = 0;
        for (const t of allTelas) {
          if (t.codigo && !fabMap[t.codigo]) {
            fabMap[t.codigo] = await getOrCreateFabric(t.codigo, t.descripcion);
            if (fabMap[t.codigo]) ins.fabrics++;
          }
          if (t.codigo && !fabMap[t.codigo]) fabMap[t.codigo] = await getOrCreateFabric(t.codigo, t.descripcion);
          setProgress(p => ({ ...p, current: ++fi }));
        }

        // 2. Lines/Sub-lines for dropdowns
        const lineMap = {};
        for (const r of refs) {
          if (r.line_name && !lineMap[r.line_name]) lineMap[r.line_name] = await getOrCreateLine(r.line_name);
        }

        // 3. References
        setProgress({ step: 'Subiendo referencias...', current: fi, total: totalSteps });
        const refMap = {};
        for (const r of refs) {
          try {
            const lineId = lineMap[r.line_name] || null;
            await supabase.from('references').upsert({
              collection_id: colId, reference_number: r.reference_number, name: r.name,
              main_image_url: r.main_image_url || null,
              color: r.color || null, color_code: r.color_code || null,
              status_id: r.status_id || 1, line_id: lineId,
              length_description: r.length_description || null,
              has_art_modification: r.has_art_modification || false,
              has_trace_location: r.has_trace_location || false,
              has_all_over: r.has_all_over || false,
              has_embroidery: r.has_embroidery || false,
              has_semielaborated: r.has_semielaborated || false,
              especificacion_confeccion: r.especificacion_confeccion || null,
              escalado_molderia_notes: r.escalado_molderia_notes || null,
              tiras_continuas: r.tiras_continuas || null,
              sugerencia_mod_ubc: r.sugerencia_mod_ubc || null,
              requiere_muestra: r.requiere_muestra || false,
              grupo_estilo: r.grupo_estilo || null,
              header_notes: r.header_notes || null,
              trace_notes: r.trace_notes || null,
              costing_notes: r.costing_notes || null,
              envio_corte_maquila: r.envio_corte_maquila || false,
              envio_confeccion_maquila: r.envio_confeccion_maquila || false,
            }, { onConflict: 'collection_id,reference_number', ignoreDuplicates: true });
            ins.refs++;
          } catch { errors++; }
          setProgress(p => ({ ...p, current: ++fi }));
        }

        // Fetch ref IDs
        const { data: allRefs } = await supabase.from('references').select('id,reference_number').eq('collection_id', colId);
        (allRefs || []).forEach(r => { refMap[r.reference_number] = r.id; });

        // 4. Reference codes (MD/PT)
        const codesToInsert = [];
        for (const r of refs) {
          const rid = refMap[r.reference_number];
          if (!rid) continue;
          if (r.codigo_md) codesToInsert.push({ reference_id: rid, code_type: 'MD', code: r.codigo_md });
          if (r.codigo_pt) codesToInsert.push({ reference_id: rid, code_type: 'PT', code: r.codigo_pt });
        }
        if (codesToInsert.length) {
          const { error: ce } = await supabase.from('reference_codes').upsert(codesToInsert, { onConflict: 'reference_id,code_type', ignoreDuplicates: true });
          if (!ce) ins.otros += codesToInsert.length;
        }

        // 5. Reference fabrics (telas lucir + forro)
        setProgress({ step: 'Subiendo telas por referencia...', current: fi, total: totalSteps });
        const rfToInsert = [];
        for (const t of allTelas) {
          const rid = refMap[t.ref_num];
          const fid = fabMap[t.codigo];
          if (rid && fid) {
            rfToInsert.push({ reference_id: rid, fabric_id: fid, usage: t.uso, width_cm: t.ancho, notes: t.base_textil || null });
          }
        }
        if (rfToInsert.length) {
          const { error: rfe } = await supabase.from('reference_fabrics').upsert(rfToInsert, { onConflict: 'reference_id,fabric_id,usage', ignoreDuplicates: true });
          if (!rfe) ins.rf += rfToInsert.length;
        }
        setProgress(p => ({ ...p, current: fi + rfToInsert.length }));

        // 6. Bordados
        if (sec.bordados?.length) {
          const bords = [];
          for (const b of sec.bordados) {
            const rid = refMap[b.ref_num];
            if (rid && (b.aplica || b.descripcion)) {
              bords.push({
                reference_id: rid, bordado_type: 'EN_PRENDA',
                description: b.descripcion, status: b.status,
              });
            }
          }
          if (bords.length) { await supabase.from('reference_embroidery').upsert(bords, { onConflict: 'reference_id', ignoreDuplicates: true }); ins.bordados += bords.length; }
        }

        // 7. Entregables
        if (sec.entregables?.length) {
          const ents = [];
          for (const e of sec.entregables) {
            const rid = refMap[e.ref_num];
            if (rid) ents.push({ reference_id: rid, tipo: e.tipo, completado: e.completado, observaciones: e.valor });
          }
          if (ents.length) { await supabase.from('entregables').upsert(ents, { onConflict: 'reference_id,tipo', ignoreDuplicates: true }); ins.otros += ents.length; }
        }

        // 8. Composiciones
        if (sec.composiciones?.length) {
          const comps = [];
          for (const c of sec.composiciones) {
            const rid = refMap[c.ref_num];
            if (rid) comps.push({ reference_id: rid, scope: c.scope, sap_registered: c.sap, description_usauk: c.desc_usa, fiber_composition: c.fiber, woven_knitted: c.woven, inside_composition: c.inside, include_description: c.include, notes: c.obs });
          }
          if (comps.length) { await supabase.from('compositions').upsert(comps, { onConflict: 'reference_id,scope', ignoreDuplicates: true }); ins.composiciones += comps.length; }
        }

        // 9. Care instructions
        if (sec.cuidados?.length) {
          const cares = [];
          for (const cu of sec.cuidados) {
            const rid = refMap[cu.ref_num];
            if (rid) cares.push({ reference_id: rid, care_type_id: cu.tipo === 'LAVADO' ? 1 : cu.tipo === 'SECADO' ? 2 : cu.tipo === 'PLANCHADO' ? 3 : cu.tipo === 'DESMANCHE' ? 4 : 5, instruction: cu.instruccion });
          }
          if (cares.length) { await supabase.from('care_instructions').upsert(cares, { onConflict: 'reference_id,care_type_id', ignoreDuplicates: true }); ins.otros += cares.length; }
        }

        // 10. Production units
        if (sec.produccionUnits?.length) {
          const units = [];
          for (const u of sec.produccionUnits) {
            const rid = refMap[u.ref_num];
            if (rid) units.push({ reference_id: rid, size: u.talla, quantity: u.cantidad });
          }
          if (units.length) { await supabase.from('production_units').upsert(units, { onConflict: 'reference_id,size', ignoreDuplicates: true }); ins.otros += units.length; }
        }

        // 11. Molderia
        if (sec.molderia?.length) {
          const molds = [];
          for (const m of sec.molderia) {
            const rid = refMap[m.ref_num];
            if (rid) molds.push({ reference_id: rid, fecha_inicio: m.inicio, fecha_fin: m.fin, comentarios: m.comentarios });
          }
          if (molds.length) { await supabase.from('molderia').upsert(molds, { onConflict: 'reference_id', ignoreDuplicates: true }); ins.otros += molds.length; }
        }

        // 12. Cortes
        if (sec.cortes?.length) {
          const cuts = [];
          for (const ct of sec.cortes) {
            const rid = refMap[ct.ref_num];
            if (rid) cuts.push({ reference_id: rid, cut_number: ct.numero, cut_date: ct.fecha, cut_type: ct.tipo, observations: ct.obs, units_piece: ct.piezas, units_sample: ct.muestras });
          }
          if (cuts.length) { await supabase.from('cuts').upsert(cuts, { onConflict: 'reference_id,cut_number', ignoreDuplicates: true }); ins.cortes += cuts.length; }
        }

        // 13. Sewings
        if (sec.confecciones?.length) {
          const sews = [];
          for (const s of sec.confecciones) {
            const rid = refMap[s.ref_num];
            if (rid) sews.push({ reference_id: rid, start_date: s.inicio, end_date: s.entrega, status: s.estado, notes: s.obs, engineering_time_minutes: s.tiempo, plant_status: s.estado_planta, plant_rejection_type: s.rechazo, plant_feedback: s.feedback });
          }
          if (sews.length) { await supabase.from('sewings').upsert(sews, { onConflict: 'reference_id', ignoreDuplicates: true }); ins.confecciones += sews.length; }
        }

        // 14. Measures
        if (sec.medidas?.length) {
          const meds = [];
          for (const m of sec.medidas) {
            const rid = refMap[m.ref_num];
            if (rid) meds.push({ reference_id: rid, phase: m.fase, measure_date: m.fecha, comments: m.comentario });
          }
          if (meds.length) { await supabase.from('measures').upsert(meds, { onConflict: 'reference_id,phase', ignoreDuplicates: true }); ins.medidas += meds.length; }
        }

        // 15. Contramuestras
        if (sec.contramuestras?.length) {
          for (const cm of sec.contramuestras) {
            const rid = refMap[cm.ref_num];
            if (!rid) continue;
            await supabase.from('contramuestras').upsert({ reference_id: rid, codigo_ot: cm.codigo_ot, nombre: cm.nombre, talla: cm.talla, descripcion_color: cm.color, unidades_cortadas: cm.unidades, prioridad: cm.prioridad, fecha_meta_entrega: cm.fecha_meta, drop_entrega: cm.drops, status: cm.status }, { onConflict: 'codigo_ot', ignoreDuplicates: true });
            ins.contramuestras++;
          }
        }

        // 16. Quality issues
        if (sec.calidad?.length) {
          const quals = [];
          for (const q of sec.calidad) {
            const rid = refMap[q.ref_num];
            if (rid) quals.push({ reference_id: rid, detected_at: q.fecha, area: q.area, classification: q.clasificacion, material: q.material, material_classification: q.clasif_mp, execution_type: q.ejecucion });
          }
          if (quals.length) { await supabase.from('quality_issues').upsert(quals, { onConflict: 'reference_id', ignoreDuplicates: true }); ins.calidad += quals.length; }
        }

        // 17. Montaje
        if (sec.montaje?.length) {
          const monts = [];
          for (const m of sec.montaje) {
            const rid = refMap[m.ref_num];
            if (rid) monts.push({ reference_id: rid, montage_type: m.tipo, related_reference: m.proyecto });
          }
          if (monts.length) { await supabase.from('montage_mannequin').upsert(monts, { onConflict: 'reference_id', ignoreDuplicates: true }); ins.otros += monts.length; }
        }

        // 18. External processes
        if (sec.procesosExternos?.length) {
          const procs = [];
          for (const p of sec.procesosExternos) {
            const rid = refMap[p.ref_num];
            if (rid) procs.push({ reference_id: rid, provider: p.proveedor, description: p.descripcion || p.tipo, cost: p.costo });
          }
          if (procs.length) { await supabase.from('external_processes').upsert(procs, { onConflict: 'reference_id,provider', ignoreDuplicates: true }); ins.otros += procs.length; }
        }

        // 19. Semielaborados
        if (sec.semielaborados?.length) {
          const semis = [];
          for (const s of sec.semielaborados) {
            const rid = refMap[s.ref_num];
            if (rid) semis.push({ reference_id: rid, semi_elaborated_type: 'BORDADO', description: s.descripcion });
          }
          if (semis.length) { await supabase.from('reference_semielaborated').upsert(semis, { onConflict: 'reference_id', ignoreDuplicates: true }); ins.otros += semis.length; }
        }

        // 20. Referentes
        if (sec.referentes?.length) {
          for (const rf of sec.referentes) {
            const rid = refMap[rf.ref_num];
            const ptn = rf.pt?.replace('PT', '');
            const rrefId = ptn ? await getId('references', 'reference_number', ptn) : null;
            if (rid && rrefId) {
              await supabase.from('references_referents').upsert({ reference_id: rid, referent_reference_id: rrefId, notes: rf.nombre }, { onConflict: 'reference_id,referent_reference_id', ignoreDuplicates: true });
              ins.otros++;
            }
          }
        }

      } else {
        // ═══════════════ UPLOAD VALIDACION DE TELAS (original) ═══════════════
        setProgress({ step: 'Subiendo...', current: 0, total: parsed.referencias.length + parsed.telas.length + parsed.consumos.length });

        // Fabrics
        const fabMap = {};
        const newFabs = [];
        const seenCodes = new Set();
        parsed.telas.forEach(t => {
          if (t.codigo_tela && !seenCodes.has(t.codigo_tela)) {
            seenCodes.add(t.codigo_tela);
            newFabs.push({ code: t.codigo_tela, description: (t.descripcion_tela || '').substring(0, 200) });
          }
        });
        if (newFabs.length) {
          await supabase.from('fabrics').upsert(newFabs, { onConflict: 'code', ignoreDuplicates: true });
          ins.fabrics = newFabs.length;
        }
        const { data: existingFabs } = await supabase.from('fabrics').select('id,code');
        (existingFabs || []).forEach(f => { fabMap[f.code] = f.id; });

        // References
        let fi = 0;
        for (const r of parsed.referencias) {
          await supabase.from('references').upsert({
            collection_id: colId, reference_number: r.reference_number, name: r.name,
            main_image_url: r.main_image_url || null, status_id: 1,
            has_art_modification: r.has_art_modification, has_trace_location: r.has_trace_location,
            length_description: r.length_description,
          }, { onConflict: 'collection_id,reference_number', ignoreDuplicates: true });
          ins.refs++;
          setProgress(p => ({ ...p, current: ++fi }));
        }
        const { data: allRefs } = await supabase.from('references').select('id,reference_number').eq('collection_id', colId);
        const refMap = {};
        (allRefs || []).forEach(r => { refMap[r.reference_number] = r.id; });

        // Reference fabrics
        const rfList = [];
        parsed.telas.forEach(t => {
          const rid = refMap[t.ref_num]; const fid = fabMap[t.codigo_tela];
          if (rid && fid) rfList.push({ reference_id: rid, fabric_id: fid, usage: t.uso, width_cm: t.ancho, consumo_base: t.consumo_base });
        });
        if (rfList.length) { await supabase.from('reference_fabrics').upsert(rfList, { onConflict: 'reference_id,fabric_id,usage', ignoreDuplicates: true }); ins.rf = rfList.length; }
        setProgress(p => ({ ...p, current: fi + rfList.length }));

        // Consumos
        const consList = parsed.consumos.map(c => {
          const rid = refMap[c.ref_num]; if (!rid) return null;
          return { reference_id: rid, role: c.role, version: c.version, consumo_valor: c.consumo_valor, tipo_tela: c.tipo_tela || null, talla: c.talla || null, observaciones: c.observaciones || null, cambio_molderia: c.cambio_molderia || null };
        }).filter(Boolean);
        if (consList.length) { await supabase.from('consumos').upsert(consList, { onConflict: 'reference_id,role,version,tipo_tela', ignoreDuplicates: true }); ins.consumos = consList.length; }
      }

      setResult({ ...ins, errors, coleccion: colName, format });
    } catch (e) {
      setError('Error: ' + (e.message || String(e)));
    } finally { setUploading(false); }
  };

  const reset = () => { setFile(null); setFileName(''); setParsed(null); setFormat(null); setResult(null); setError(''); setColeccionId(''); };

  const fmtName = format === 'MATRIZ' ? 'MATRIZ (completo)' : format === 'VALIDACION_TELAS' ? 'Validacion de Telas' : format || '?';

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto', padding: '1rem 0' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Importar Coleccion</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>
        Sube un archivo Excel (.xlsx) — auto-detecta formato MATRIZ o Validacion de Telas
      </p>

      {error && (
        <div className="card" style={{ borderLeft: '3px solid var(--error-dark)', marginBottom: 16, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error-dark)', fontSize: 14 }}><AlertCircle size={18} /> {error}</div>
        </div>
      )}

      {result && (
        <div className="card" style={{ borderLeft: '3px solid var(--success-dark)', marginBottom: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle size={22} color="var(--success-dark)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Importacion completada — {result.coleccion} ({fmtName})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 14 }}>
            {result.refs > 0 && <div>Referencias: <strong>{result.refs}</strong></div>}
            {result.fabrics > 0 && <div>Telas catalogo: <strong>{result.fabrics}</strong></div>}
            {result.rf > 0 && <div>Telas x ref: <strong>{result.rf}</strong></div>}
            {result.consumos > 0 && <div>Consumos: <strong>{result.consumos}</strong></div>}
            {result.medidas > 0 && <div>Mediciones: <strong>{result.medidas}</strong></div>}
            {result.cortes > 0 && <div>Cortes: <strong>{result.cortes}</strong></div>}
            {result.confecciones > 0 && <div>Confecciones: <strong>{result.confecciones}</strong></div>}
            {result.composiciones > 0 && <div>Composiciones: <strong>{result.composiciones}</strong></div>}
            {result.bordados > 0 && <div>Bordados: <strong>{result.bordados}</strong></div>}
            {result.contramuestras > 0 && <div>Contramuestras: <strong>{result.contramuestras}</strong></div>}
            {result.calidad > 0 && <div>Calidad: <strong>{result.calidad}</strong></div>}
            {result.otros > 0 && <div>Otros: <strong>{result.otros}</strong></div>}
          </div>
          {result.errors > 0 && <p style={{ color: 'var(--warning-dark)', fontSize: 12, marginTop: 8 }}>{result.errors} errores</p>}
          <button className="btn" onClick={reset} style={{ marginTop: 12, fontSize: 13, padding: '6px 16px' }}><Trash2 size={14} style={{ marginRight: 6 }} /> Subir otro archivo</button>
        </div>
      )}

      {!parsed && !result && (
        <div className="card" onDrop={onDrop} onDragOver={onDragOver} onClick={() => document.getElementById('fileInput').click()}
          style={{ border: '2px dashed var(--gray-300)', borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: 'var(--gray-50)', marginBottom: 16 }}>
          <input id="fileInput" type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
          <Upload size={40} style={{ color: 'var(--gray-400)', marginBottom: 12 }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Arrastra tu archivo aqui</p>
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>o haz click para seleccionar · .xlsx o .csv</p>
          {fileName && <p style={{ color: 'var(--primary-600)', marginTop: 8, fontSize: 14 }}>{fileName}</p>}
        </div>
      )}

      {parsed && !result && (
        <>
          <div className="card" style={{ marginBottom: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FileSpreadsheet size={20} color="var(--primary-600)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{fileName}</span>
              <span style={{ background: format === 'MATRIZ' ? 'var(--success-light)' : 'var(--warning-light)', color: format === 'MATRIZ' ? 'var(--success-dark)' : 'var(--warning-dark)', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{fmtName}</span>
            </div>

            {format === 'MATRIZ' ? (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  <KpiCard title="Referencias" value={parsed.totalRefs} color="var(--primary-600)" />
                  <KpiCard title="Telas" value={(parsed.secciones.telas?.length || 0) + (parsed.secciones.telasForro?.length || 0)} color="var(--warning-dark)" />
                  <KpiCard title="Consumos" value={parsed.secciones.consumos?.length || 0} color="var(--success-dark)" />
                  <KpiCard title="Mediciones" value={parsed.secciones.medidas?.length || 0} color="var(--error-dark)" />
                </div>
                <SectionTable data={parsed.secciones} />
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
                <KpiCard title="Referencias" value={parsed.referencias.length} color="var(--primary-600)" />
                <KpiCard title="Telas/Insumos" value={parsed.telas.length} color="var(--warning-dark)" />
                <KpiCard title="Consumos" value={parsed.consumos.length} color="var(--success-dark)" />
              </div>
            )}
            {parsed.errors?.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--warning-dark)' }}>{parsed.errors.map((e, i) => <div key={i}>⚠ {e}</div>)}</div>
            )}
          </div>

          <div className="card" style={{ padding: '20px 24px' }}>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>Destino: ¿A que coleccion pertenece?</label>
            <select value={coleccionId} onChange={(e) => setColeccionId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gray-300)', fontSize: 15, marginBottom: 20 }}>
              <option value="">-- Selecciona coleccion --</option>
              {colecciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            {uploading ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
                <p style={{ marginTop: 8, fontSize: 14, color: 'var(--gray-600)' }}>{progress.step}</p>
                {progress.total > 0 && (
                  <div style={{ width: '100%', height: 6, background: 'var(--gray-200)', borderRadius: 3, marginTop: 12 }}>
                    <div style={{ width: `${Math.round((progress.current / progress.total) * 100)}%`, height: '100%', background: 'var(--primary-600)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-primary" disabled={!coleccionId} onClick={handleUpload}
                style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, opacity: coleccionId ? 1 : 0.5 }}>
                <Database size={18} style={{ marginRight: 8 }} /> Subir a Supabase <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ title, value, color }) {
  return (
    <div className="kpi-card" style={{ borderTopColor: color, flex: 1, minWidth: 100 }}>
      <div className="kpi-valor" style={{ fontSize: 28, color }}>{value}</div>
      <div className="kpi-subtitulo" style={{ fontSize: 11 }}>{title}</div>
    </div>
  );
}

function SectionTable({ data }) {
  const sections = [
    { label: 'Telas Lucir', count: data.telas?.length },
    { label: 'Telas Forro', count: data.telasForro?.length },
    { label: 'Consumos', count: data.consumos?.length },
    { label: 'Bordados', count: data.bordados?.length },
    { label: 'Semielaborados', count: data.semielaborados?.length },
    { label: 'Procesos Externos', count: data.procesosExternos?.length },
    { label: 'Entregables', count: data.entregables?.length },
    { label: 'Mediciones', count: data.medidas?.length },
    { label: 'Cortes', count: data.cortes?.length },
    { label: 'Confecciones', count: data.confecciones?.length },
    { label: 'Composiciones', count: data.composiciones?.length },
    { label: 'Cuidados', count: data.cuidados?.length },
    { label: 'Unidades Prod.', count: data.produccionUnits?.length },
    { label: 'Contramuestras', count: data.contramuestras?.length },
    { label: 'Molderia', count: data.molderia?.length },
    { label: 'Calidad', count: data.calidad?.length },
    { label: 'Montaje', count: data.montaje?.length },
    { label: 'Referentes', count: data.referentes?.length },
  ].filter(s => s.count > 0);

  if (sections.length === 0) return <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No se encontraron datos en las secciones.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
          <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--gray-500)', fontWeight: 600 }}>Seccion</th>
          <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gray-500)', fontWeight: 600 }}>Registros</th>
          <th style={{ textAlign: 'center', padding: '6px 4px', width: 40 }}>OK</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((s, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
            <td style={{ padding: '6px 4px' }}>{s.label}</td>
            <td style={{ textAlign: 'right', fontWeight: 600, padding: '6px 4px' }}>{s.count}</td>
            <td style={{ textAlign: 'center', padding: '6px 4px' }}><CheckCircle size={14} color="var(--success)" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
