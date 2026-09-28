import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('../../migracion/029_csv_reference_import_contract.sql', import.meta.url), 'utf8');
const rollback = readFileSync(new URL('../../migracion/rollback_029_csv_reference_import_contract.sql', import.meta.url), 'utf8');
const legacyImporter = readFileSync(new URL('../pages/ImportarLegacyCSV.jsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
const permissions = readFileSync(new URL('./permissions.js', import.meta.url), 'utf8');
const pendingTasks = readFileSync(new URL('../../TAREAS_PENDIENTES.md', import.meta.url), 'utf8');
const importApi = readFileSync(new URL('./referenceImportApi.js', import.meta.url), 'utf8');
const importerUi = readFileSync(new URL('../pages/ImportarCSV.jsx', import.meta.url), 'utf8');
const verify = readFileSync(new URL('../../migracion/verify_029_csv_reference_import_contract.sql', import.meta.url), 'utf8');

describe('migración contractual 029', () => {
  it('expone preview y una sola confirmación global protegidas', () => {
    expect(migration).toContain('preview_csv_reference_import(p_document JSONB)');
    expect(migration).toContain('confirm_csv_reference_import(p_document JSONB,p_source_file TEXT,p_expected_preview JSONB,p_confirmation_id UUID)');
    expect(migration).toContain("current_user_has_role('Administrador')");
    expect(migration).toContain('REVOKE ALL ON FUNCTION jo.confirm_csv_reference_import');
  });

  it('usa identidad entera compuesta y resolución contractual genérica', () => {
    expect(migration).toContain('references_collection_year_number_uidx');
    expect(migration).toContain('ALTER COLUMN reference_number TYPE INTEGER');
    expect(migration).toContain('c.code=collection_value AND c.season=collection_season_value');
    expect(migration).toContain('cy.year=contract_year_value');
    expect(migration).not.toContain("c.code='SS27'");
  });

  it('aborta ante colisiones históricas canonicales antes de cambiar constraints', () => {
    const preflight = migration.indexOf('colision historica en coleccion+ano+referencia canonical');
    const dropConstraint = migration.indexOf('DROP CONSTRAINT IF EXISTS references_reference_number_unique');
    expect(preflight).toBeGreaterThan(-1);
    expect(preflight).toBeLessThan(dropConstraint);
    expect(migration).toContain('HAVING count(*)>1');
    expect(migration).toContain('no se modificaron datos');
  });

  it('preflight aborta por year nulo o distinto del año canónico antes de cualquier DDL', () => {
    const nullYear = migration.indexOf('SELECT 1 FROM jo.references WHERE year IS NULL');
    const mismatchedYear = migration.indexOf('WHERE r.year IS DISTINCT FROM c.year');
    const firstDdl = migration.indexOf('ALTER TABLE jo.references DROP CONSTRAINT');
    expect(nullYear).toBeGreaterThan(-1);
    expect(mismatchedYear).toBeGreaterThan(-1);
    expect(nullYear).toBeLessThan(firstDdl);
    expect(mismatchedYear).toBeLessThan(firstDdl);
    expect(migration).not.toMatch(/UPDATE jo\.references[\s\S]*preflight|DELETE FROM jo\.references/);
  });

  it('hace la confirmación idempotente por usuario y confirmation_id persistido', () => {
    expect(migration).toContain('import_batches_created_by_confirmation_uidx');
    expect(migration).toContain('ON jo.import_batches(created_by,confirmation_id) WHERE confirmation_id IS NOT NULL');
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended('CSVCONFIRM|'");
    expect(migration).toContain('RETURN result_value;');
    expect(migration).toContain('confirmation_result=result_value');
    expect(importApi).toContain('p_confirmation_id: confirmationId');
    expect(importerUi).toContain('globalThis.crypto.randomUUID()');
    expect(importerUi).toContain('confirmationId ||');
  });

  it('aísla incidencias de negocio por fila y no captura errores técnicos inesperados', () => {
    expect(migration).toContain("EXCEPTION WHEN SQLSTATE 'P2001' THEN");
    expect(migration).toContain("action_value:='ROW_ERROR'; reference_id_value:=NULL");
    expect(migration).toContain('Código MD no disponible o catálogo modificado');
    expect(migration).toContain('El catálogo de Status General cambió');
    expect(migration).not.toContain('EXCEPTION WHEN OTHERS');
  });

  it('no importa alcances excluidos ni asigna diseñador', () => {
    expect(migration).not.toMatch(/INSERT INTO jo\.(fabrics|reference_fabrics|reference_states|reference_embroidery|reference_semielaborated|external_processes)/);
    expect(migration).toContain('designer_informative');
  });

  it('detecta duplicados por referencia entera canonicalizada en preview y revalida en confirmación', () => {
    expect(migration).toContain("THEN (btrim(d->'values'->>'referencia'))::NUMERIC END=ref_number");
    expect(migration).toContain("SELECT canonical::INTEGER FROM jsonb_array_elements(p_document->'rows')");
    expect(migration).toContain("jsonb_set(value,'{referencia}',to_jsonb(ref_number::TEXT))");
  });

  it('permite opcionales ausentes/reordenadas y conserva rechazo de columnas inválidas', () => {
    expect(migration).toContain("jsonb_array_elements_text(required_headers)");
    expect(migration).toContain("NOT expected_headers ? h");
    expect(migration).toContain("jsonb_array_elements_text(p_document->'headers')");
    expect(migration).not.toContain("p_document->'headers' IS DISTINCT FROM expected_headers");
  });

  it('NO_CHANGE no actualiza referencias ni reasigna códigos', () => {
    expect(migration).toContain("ELSIF action_value='UPDATE' THEN");
    expect(migration).toContain("action_value IN ('CREATE','UPDATE') AND value->>'Código MD'");
    expect(migration).toContain('NO_CHANGE solo se audita');
  });

  it('impone límites en RPC y mantiene la identidad del importador legacy', () => {
    expect(migration).toContain("jsonb_array_length(p_document->'rows')>5000");
    expect(migration).toContain('octet_length(p_document::TEXT)>8*1024*1024');
    expect(legacyImporter).toContain('insertLegacyReference');
    expect(legacyImporter).toContain(".eq('collection_id', collectionId)");
    expect(legacyImporter).toContain(".eq('year', collectionYear)");
    expect(legacyImporter).toContain('year: collectionYear');
    expect(legacyImporter).toContain('reference_number: canonicalReferenceNumber');
  });

  it('mantiene el importador legacy en una ruta separada protegida para Administrador', () => {
    expect(app).toContain("import('./pages/ImportarLegacyCSV')");
    expect(app).toContain('path="/admin/importar-referencias/legacy"');
    expect(app).toContain('ROUTE_PERMISSIONS.importarReferenciasLegacy');
    expect(permissions).toContain('importarReferenciasLegacy: [ROLES.ADMIN]');
    expect(pendingTasks).toContain('deshabilitar su ruta');
    expect(pendingTasks).toContain('crea catálogos');
    expect(pendingTasks).toContain('escrituras directas');
    expect(pendingTasks).toContain('no es atómico');
    expect(pendingTasks).toContain('029 es la autoridad');
    expect(pendingTasks).toContain('RPC 028 se conservan temporalmente solo para compatibilidad');
  });

  it('define una retirada operativa guardada que no borra ni restaura constraints', () => {
    expect(rollback).toContain('no es un rollback técnico');
    expect(rollback).toContain("to_regprocedure('jo.preview_csv_reference_import(jsonb)')");
    expect(rollback).toContain('retirada operativamente');
    expect(rollback).not.toMatch(/\b(DROP|TRUNCATE)\b|\bDELETE\s+FROM\b/);
    expect(rollback).not.toContain('references_reference_number_unique UNIQUE');
  });

  it('verify cubre invariantes preflight, idempotencia y resultados por fila sin afirmar runtime ausente', () => {
    expect(verify).toContain('references.year nulo');
    expect(verify).toContain('ano canonico');
    expect(verify).toContain('confirmation_id');
    expect(verify).toContain('reintento idempotente');
    expect(verify).toContain('NOT_VALIDATED');
  });
});
