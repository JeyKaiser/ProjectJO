import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

let mermaid;
try {
  mermaid = (await import('mermaid')).default;
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  console.log('Mermaid no está instalado: validación estructural del subconjunto de secuencias usado.');
}

function validateSequence(source) {
  const lines = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.shift() !== 'sequenceDiagram') throw new Error('Falta sequenceDiagram.');
  const participants = new Set();
  let messages = 0;
  for (const line of lines) {
    if (/^title .+$/.test(line)) continue;
    const participant = line.match(/^participant (\w+)$/);
    if (participant) {
      if (participants.has(participant[1])) throw new Error('Participante duplicado.');
      participants.add(participant[1]);
      continue;
    }
    const message = line.match(/^(\w+)(-->>|->>)(\w+): (.+)$/);
    if (!message || !participants.has(message[1]) || !participants.has(message[3])) {
      throw new Error(`Mensaje o participante inválido: ${line}`);
    }
    messages += 1;
  }
  if (!messages || participants.size !== 3) throw new Error('Secuencia vacía o participantes incorrectos.');
}

const root = new URL('./', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', root), 'utf8'));
const authSource = await fs.readFile(new URL('../../src/context/AuthContext.jsx', root), 'utf8');
const roleBlock = authSource.match(/export const ROLES = \{([\s\S]*?)\};/)[1];
const actualRoles = Array.from(roleBlock.matchAll(/\w+:\s*'([^']+)'/g), match => match[1]);
const report = (await fs.readFile(new URL('../roles-casos-de-uso-secuencias.md', root), 'utf8')).replaceAll('\r\n', '\n');
if (manifest.length !== actualRoles.length || new Set(manifest.map(role => role.role)).size !== manifest.length) {
  throw new Error('La cantidad de diagramas debe corresponder a todos los roles actuales.');
}
for (const role of manifest) {
  if (!actualRoles.includes(role.role)) throw new Error(`Rol desconocido: ${role.role}`);
  const source = (await fs.readFile(new URL(`${role.slug}.mmd`, root), 'utf8')).replaceAll('\r\n', '\n');
  validateSequence(source);
  if (mermaid) {
    const parsed = await mermaid.parse(source);
    if (parsed.diagramType !== 'sequence') throw new Error(`Tipo inválido: ${role.slug}`);
  }
  if (!report.includes(source.trim())) throw new Error(`Mermaid del documento desactualizado: ${role.slug}`);
  for (const extension of ['svg', 'png']) {
    const stat = await fs.stat(new URL(`${role.slug}.${extension}`, root));
    if (!stat.size) throw new Error(`Imagen vacía: ${role.slug}.${extension}`);
  }
  await fs.access(new URL(`../../${role.source}`, root));
  console.log(`OK: ${role.role}`);
}
console.log(`Validados ${manifest.length} diagramas y sus fuentes en ${fileURLToPath(root)}`);
