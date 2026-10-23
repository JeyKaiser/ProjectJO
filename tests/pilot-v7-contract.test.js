import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

const db = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ default: db, uploadImage: vi.fn() }));
import { createPilotReference, assignMissingPilotCode } from '../src/lib/api';
const sql = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../src/pages/FichaTecnicaForm.jsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/state-machine/pages/DashboardPage.jsx', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../src/state-machine/components/ReferenceStateDetail.jsx', import.meta.url), 'utf8');

describe('L3-v7 pilot create and codes (static SQL gates, NOT database validation)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the reference via one RPC with stable request id and optional relations', async () => {
    db.rpc.mockResolvedValue({ data: { id: 41, reference_number: '19' }, error: null });
    const payload = { collection_id: 3, year: 2027, reference_number: '19', tipo_prenda_id: 2,
      montage_type: 'Drapeado', referent_reference_id: 8 };
    const result = await createPilotReference(payload, 'stable-id');
    expect(result.data.id).toBe(41);
    expect(db.rpc).toHaveBeenCalledWith('pilot_create_reference_032', { p_payload: payload, p_request_id: 'stable-id' });
    expect(db.from).not.toHaveBeenCalled();
  });

  it('rejects retired form fields instead of dropping them silently', async () => {
    const result = await createPilotReference({ collection_id: 3, includes: 'cinturón' }, 'stable-id');
    expect(result.error.message).toMatch(/no admitido/i);
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it('only retries an unassigned code; an already confirmed assignment stays intact', async () => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: { code: 'MD-019' }, error: null });
    db.from.mockReturnValue(query);
    const result = await assignMissingPilotCode(41, 'MD', 'MD-019');
    expect(result).toEqual({ code: 'MD-019', assigned: true });
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it('reports a failed postcommit PT assignment instead of treating a derived label as confirmed', async () => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    db.from.mockReturnValue(query);
    db.rpc.mockResolvedValue({ data: null, error: new Error('Código PT no disponible') });
    await expect(assignMissingPilotCode(41, 'PT', 'PT0319')).rejects.toThrow('no disponible');
    expect(db.rpc).toHaveBeenCalledWith('assign_existing_reference_code', {
      p_reference_id: 41, p_code_type: 'PT', p_code: 'PT0319', p_notes: null,
    });
  });

  it('specifies transactional init/cancel and rollback of optional relations', () => {
    expect(sql).toMatch(/pilot_create_reference_031/);
    expect(sql).toMatch(/INSERT INTO jo\.montage_mannequin/);
    expect(sql).toMatch(/INSERT INTO jo\.references_referents/);
    expect(sql).toMatch(/INSERT INTO jo\.pilot_cancel_episodes/);
    expect(sql).toMatch(/STATUS_GLOBAL_CANCELADO/);
    expect(sql).toMatch(/INSERT INTO jo\.reference_embroidery\(reference_id,bordado_type,description\)/);
    expect(sql).toMatch(/'EN_PRENDA'::jo\.bordado_type/);
    expect(sql).toMatch(/CREATE CONSTRAINT TRIGGER trg_031_require_pilot_workflow/);
    expect(sql).not.toMatch(/IF p_event='INIT' THEN/);
  });

  it('keeps current trunk when a late fork resolves and guards commercial closure', () => {
    expect(sql).toMatch(/CERRAR_COMERCIAL[\s\S]*cardinality\(st\.sub_states\)/);
    expect(sql).toMatch(/RECHAZAR_[\s\S]*cancelled_sub_states/);
    expect(sql).toMatch(/status='CANCELADO'/);
    expect(sql).toMatch(/MERGE_UNION/);
  });

  it('removes deferred fields from new-ficha UI', () => {
    expect(ui).not.toMatch(/Includes \(Accesorios\)|ROLES_EQUIPO|Boceto \/ Imagen Inicial|disenadorCreativo/);
  });

  it('does not offer bulk initialization of historical references', () => {
    expect(dashboard).not.toContain('Inicializar Todo');
    expect(detail).toMatch(/PILOT_COLLECTION_CODE !== 'SS27' &&[\s\S]*Inicializar en Estado Concepto/);
    expect(detail).toMatch(/PILOT_COLLECTION_CODE !== 'SS27' && stateRecord\.current_state !== 'completado'/);
  });
});
