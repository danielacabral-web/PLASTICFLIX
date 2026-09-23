#!/usr/bin/env node
/**
 * Lint sem dependencia: checagem de sintaxe de todo .js do projeto, via
 * `node --check`. Nao substitui um eslint, e nao pretende - pega o erro que
 * mais custa aqui, que e um arquivo que nao parseia derrubando o boot do
 * servidor no meio de uma sessao.
 *
 * exit 0 = PASS, exit 2 = FAIL.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { RAIZ } from '../src/version.js';

const IGNORAR = new Set(['node_modules', '.git', '_telemetry', '_fixtures']);

function varrer(dir) {
  const achados = [];
  for (const nome of readdirSync(dir)) {
    if (IGNORAR.has(nome)) continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) achados.push(...varrer(caminho));
    else if (nome.endsWith('.js') || nome.endsWith('.mjs')) achados.push(caminho);
  }
  return achados;
}

const arquivos = varrer(RAIZ);
const falhas = [];

for (const arquivo of arquivos) {
  try {
    execFileSync(process.execPath, ['--check', arquivo], { stdio: 'pipe' });
  } catch (e) {
    falhas.push({ arquivo: relative(RAIZ, arquivo), erro: (e.stderr?.toString() || e.message).trim() });
  }
}

if (falhas.length > 0) {
  console.error(`FAIL  ${falhas.length} arquivo(s) com erro de sintaxe:`);
  for (const f of falhas) console.error(`      ${f.arquivo}\n${f.erro}\n`);
  process.exit(2);
}

console.log(`PASS  ${arquivos.length} arquivo(s) .js sem erro de sintaxe`);
process.exit(0);
