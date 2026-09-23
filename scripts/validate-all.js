#!/usr/bin/env node
/**
 * Roda todos os gates em sequencia e agrega o resultado.
 * exit 0 se todos passarem, 2 se qualquer um falhar.
 */
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { RAIZ } from '../src/version.js';

const GATES = [
  ['lint', 'lint.js'],
  ['manifest', 'validate-manifest.js'],
  ['versao unica', 'validate-version-sync.js'],
  ['dados orfaos', 'validate-dados-orfaos.js'],
];

const resultados = [];

for (const [rotulo, arquivo] of GATES) {
  const caminho = join(RAIZ, 'scripts', arquivo);
  if (!existsSync(caminho)) {
    resultados.push({ rotulo, estado: 'AUSENTE' });
    continue;
  }
  try {
    const saida = execFileSync(process.execPath, [caminho], { stdio: 'pipe' }).toString();
    resultados.push({ rotulo, estado: 'PASS', saida: saida.trim() });
  } catch (e) {
    resultados.push({
      rotulo,
      estado: 'FAIL',
      saida: ((e.stdout?.toString() || '') + (e.stderr?.toString() || '')).trim(),
    });
  }
}

for (const r of resultados) {
  console.log(`${r.estado.padEnd(7)} ${r.rotulo}`);
  if (r.saida) console.log(r.saida.split('\n').map((l) => '        ' + l).join('\n'));
}

const falhou = resultados.filter((r) => r.estado === 'FAIL');
const ausentes = resultados.filter((r) => r.estado === 'AUSENTE');

console.log('');
if (ausentes.length > 0) {
  console.log(`Gates ainda nao escritos: ${ausentes.map((r) => r.rotulo).join(', ')}`);
}
if (falhou.length > 0) {
  console.error(`FAIL  ${falhou.length} gate(s) falharam: ${falhou.map((r) => r.rotulo).join(', ')}`);
  process.exit(2);
}
console.log('PASS  todos os gates existentes passaram');
process.exit(0);
