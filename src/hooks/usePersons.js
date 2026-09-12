import { useState, useEffect, startTransition } from 'react';
import supabase from '../lib/supabase';

export function usePersonsByArea(area) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    supabase
      .from('persons')
      .select('id, first_name, last_name, area, active, hire_date, cedula, email, phone')
      .eq('area', area)
      .eq('active', true)
      .order('first_name')
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError;
        if (!cancelled) {
          setData((data || []).map(p => ({
            id: p.id,
            nombre: `${p.first_name} ${p.last_name}`.trim(),
            rol: area === 'modistas' ? 'Modista' : area === 'creativos' ? 'Creativo' : area === 'tecnicos' ? 'Técnico' : area,
            activo: p.active,
            fechaIngreso: p.hire_date,
            cedula: p.cedula || '',
            correo: p.email || '',
            telefono: p.phone || '',
          })));
          setLoading(false);
        }
      })
      .catch(queryError => {
        if (!cancelled) {
          setError(queryError);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [area, reloadKey]);

  return { data, loading, error, refetch: () => setReloadKey(key => key + 1) };
}

export function useAllPersons() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    supabase
      .from('persons')
      .select('id, first_name, last_name, area, active, hire_date')
      .eq('active', true)
      .order('area')
      .order('first_name')
      .then(({ data, error: queryError }) => {
        if (queryError) throw queryError;
        if (!cancelled) {
          setData(data || []);
          setLoading(false);
        }
      })
      .catch(queryError => {
        if (!cancelled) {
          setError(queryError);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  return { data, loading, error, refetch: () => setReloadKey(key => key + 1) };
}
