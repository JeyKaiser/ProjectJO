import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

it('never projects a derived MD/PT as an assigned code in reader mappings', () => {
  const api = readFileSync(new URL('../src/lib/api.js', import.meta.url), 'utf8');
  expect(api).not.toMatch(/codigo(?:MD|PT):\s*(?:rcCodes|fcCodes|codes)\.(?:MD|PT)\s*\|\|\s*(?:`|derive)/);
  expect(api).not.toMatch(/(?:md|pt):\s*(?:mdRow|ptRow)\s*\?\s*(?:mdRow|ptRow)\.code\s*:\s*derive/);
});

it('does not label an unassigned reference number as an MD/PT in pilot views', () => {
  for (const path of [
    '../src/pages/FichaFinalView.jsx',
    '../src/state-machine/services/inboxService.js',
    '../src/state-machine/hooks/useAlertMonitor.js',
    '../src/state-machine/components/ReferenceStateDetail.jsx',
    '../src/pages/CorteKanban.jsx',
  ]) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    expect(source).not.toMatch(/(?:codigoMD|codigoPT)[^\n]*`(?:MD-|PT03)\$\{|(?:codigoMD|codigoPT):\s*`(?:MD-|PT03)\$\{/);
  }
});

it('labels missing database assignments as unassigned, never derived', () => {
  const api = readFileSync(new URL('../src/lib/api.js', import.meta.url), 'utf8');
  const detail = readFileSync(new URL('../src/pages/ReferenciaDetalle.jsx', import.meta.url), 'utf8');
  expect(api).not.toMatch(/(?:mdStatus|ptStatus):\s*codes\.(?:MD|PT)\s*\?\s*'ASIGNADO'\s*:\s*'DERIVADO'/);
  expect(detail).not.toMatch(/title="DERIVADO \(auto\)"/);
});
