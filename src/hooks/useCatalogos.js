import { useState, useEffect, startTransition } from 'react';
import supabase from '../lib/supabase';

function useSupabaseQuery(queryFn, deps = []) {
  // Los catálogos se consumen como listas desde el primer render.
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    queryFn()
      .then(result => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err); setLoading(false); } });
    return () => { cancelled = true; };
  // Each catalog hook supplies its own dependency key.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = () => {
    setLoading(true);
    setError(null);
    queryFn()
      .then(result => { setData(result); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  };

  return { data, loading, error, refetch };
}

async function queryRows(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function useLineas() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('lines').select('id,name,code,description').eq('active', true).order('name')
  ));
}

export function mapLinkedSublines(rows) {
  const sublineas = (rows || []).map(row => {
    if (!row.sublines?.id || !row.sublines?.name) {
      throw new Error('La relación línea–sublínea contiene una sublínea inválida.');
    }
    return row.sublines;
  });
  const uniqueIds = new Set(sublineas.map(sublinea => sublinea.id));
  if (uniqueIds.size !== sublineas.length) {
    throw new Error('La relación línea–sublínea contiene asociaciones duplicadas.');
  }
  return sublineas.sort((a, b) => a.name.localeCompare(b.name));
}

export function useSublineas(lineId) {
  return useSupabaseQuery(() => {
    if (!lineId) return Promise.resolve([]);
    return queryRows(
      supabase
        .from('line_sublines')
        .select('subline_id,sublines!inner(id,name,description,active)')
        .eq('line_id', lineId)
        .eq('active', true)
        .eq('sublines.active', true)
    ).then(mapLinkedSublines);
  }, [lineId]);
}

export function useTallajes() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('tallaje_groups').select('id,name,type,description').order('name')
  ));
}

export function useClosures() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('closure_types').select('id,type,description').order('id')
  ));
}

export function useEmpaques() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('empaques').select('id,name,description').order('name')
  ));
}

export function useComplejidad() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('difficulty_levels').select('id,level,description').order('id')
  ));
}

export function useTipoPrendas() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('tipo_prendas').select('id,name').eq('active', true).order('name')
  ));
}

export function useLargos() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('largos').select('id,name').eq('active', true).order('name')
  ));
}

export function useUsosTela() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('usos_tela').select('id,name').eq('active', true).order('name')
  ));
}

export function useSentidos() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('sentidos_tela').select('id,name').eq('active', true).order('name')
  ));
}

export function useProcesosExternos() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('process_types').select('id,type,description').order('type')
  ));
}

export function useTemporadas() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('temporadas').select('id,code,name').eq('active', true).order('code')
  ));
}

export function useUnidades() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('unidades_medida').select('id,name').order('name')
  ));
}

export function useCorteTypes() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('corte_types').select('id,type').order('id')
  ));
}

export function useCareTypes() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('care_types').select('id,type,description').order('id')
  ));
}

export function useReferenceStatuses() {
  return useSupabaseQuery(() => queryRows(
    supabase.from('reference_statuses').select('id,status,description').order('id')
  ));
}
