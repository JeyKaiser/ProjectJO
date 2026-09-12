import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mapLinkedSublines } from '../src/hooks/useCatalogos';

describe('line/subline catalog mapping', () => {
  it('returns only the sublines linked by the pivot query and sorts them by name', () => {
    const result = mapLinkedSublines([
      { subline_id: 2, sublines: { id: 2, name: 'WRAP' } },
      { subline_id: 1, sublines: { id: 1, name: 'ANKLE' } },
    ]);

    expect(result).toEqual([
      { id: 1, name: 'ANKLE' },
      { id: 2, name: 'WRAP' },
    ]);
  });

  it('fails loudly instead of hiding invalid or duplicate pivot rows', () => {
    expect(() => mapLinkedSublines([{ sublines: null }])).toThrow('sublínea inválida');
    expect(() => mapLinkedSublines([
      { sublines: { id: 1, name: 'ANKLE' } },
      { sublines: { id: 1, name: 'ANKLE' } },
    ])).toThrow('asociaciones duplicadas');
  });

  it('declares the complete official matrix of 33 associations and official codes in migration 027', () => {
    const migration = readFileSync(resolve('migracion/027_line_sublines_tipo_ref.sql'), 'utf8');
    const matrix = migration.match(/WITH matrix\(line_code, subline_name\) AS \([\s\S]*?\)\nINSERT INTO jo\.line_sublines/)[0];
    const pairs = [...matrix.matchAll(/\('([A-Z]{2})', '([^']+)'\)/g)].map(([, code, subline]) => `${code}:${subline}`);

    expect(pairs).toHaveLength(33);
    expect(new Set(pairs)).toEqual(new Set([
      'DS:ANKLE', 'DS:MAXI', 'DS:MIDI', 'DS:MINI', 'DS:SHIRTDRESS', 'DS:TUNIC', 'DS:WRAP',
      'SK:ANKLE', 'SK:MAXI', 'SK:MIDI', 'SK:MINI', 'SK:WRAP',
      'TP:BODYSUIT', 'TP:CROP TOP', 'TP:POLO', 'TP:SHIRT', 'TP:T-SHIRT', 'TP:TOP',
      'OW:CARDIGAN', 'OW:COAT', 'OW:JACKET', 'OW:KIMONO', 'OW:PONCHO', 'OW:SWEATER', 'OW:TRENCHCOAT', 'OW:VEST',
      'SW:BIKINI BOTTOM', 'SW:BIKINI TOP', 'SW:ONEPIECE',
      'PS:PANT', 'PS:SHORT', 'JP:JUMPSUIT', 'TN:TUNIC',
    ]));
    expect(migration).toContain("('JUMPSUITS', 'JP'");
    expect(migration).toContain('NEW.tipo_ref := NULL');
    expect(migration).toContain('New references require line_id and subline_id');
    expect(migration).toContain('WITH (security_invoker = true)');
    expect(migration).toContain('GRANT SELECT ON jo.line_sublines TO authenticated');
  });
});
