import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

function useSupabaseQuery(queryFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryFn()
      .then(result => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err); setLoading(false); } });
    return () => { cancelled = true; };
  }, deps);

  const refetch = () => {
    setLoading(true);
    queryFn()
      .then(result => { setData(result); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  };

  return { data, loading, error, refetch };
}

export function useLineas() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('lines').select('id,name,description').eq('active',true).order('name');
    return data || [];
  });
}

export function useSublineas(lineId) {
  return useSupabaseQuery(async () => {
    if (!lineId) return [];
    const { data } = await supabase.from('sublines').select('id,line_id,name,description').eq('line_id',lineId).eq('active',true).order('name');
    return data || [];
  }, [lineId]);
}

export function useTallajes() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('tallaje_groups').select('id,name,type,description').order('name');
    return data || [];
  });
}

export function useClosures() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('closure_types').select('id,type,description').order('id');
    return data || [];
  });
}

export function useEmpaques() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('empaques').select('id,name,description').order('name');
    return data || [];
  });
}

export function useComplejidad() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('difficulty_levels').select('id,level,description').order('id');
    return data || [];
  });
}

export function useTipoPrendas() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('tipo_prendas').select('id,name').eq('active',true).order('name');
    return data || [];
  });
}

export function useLargos() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('largos').select('id,name').eq('active',true).order('name');
    return data || [];
  });
}

export function useUsosTela() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('usos_tela').select('id,name').eq('active',true).order('name');
    return data || [];
  });
}

export function useSentidos() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('sentidos_tela').select('id,name').eq('active',true).order('name');
    return data || [];
  });
}

export function useProcesosExternos() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('process_types').select('id,type,description').order('type');
    return data || [];
  });
}

export function useTemporadas() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('temporadas').select('id,code,name').eq('active',true).order('code');
    return data || [];
  });
}

export function useUnidades() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('unidades_medida').select('id,name').order('name');
    return data || [];
  });
}

export function useCorteTypes() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('corte_types').select('id,type').order('id');
    return data || [];
  });
}

export function useCareTypes() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('care_types').select('id,type,description').order('id');
    return data || [];
  });
}

export function useReferenceStatuses() {
  return useSupabaseQuery(async () => {
    const { data } = await supabase.from('reference_statuses').select('id,status,description').order('id');
    return data || [];
  });
}