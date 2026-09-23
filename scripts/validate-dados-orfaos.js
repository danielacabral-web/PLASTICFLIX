#!/usr/bin/env node
/**
 * Gate: nenhum arquivo de dados fica sem ser servido por alguma tool.
 *
 * E o defeito da tool fantasma virado do avesso: la a tool existe sem handler;
 * aqui o dado existe sem tool. Nos dois casos sao duas estruturas que deveriam
 * corresponder e que ninguem checava - o arquivo fica versionado, passa em
 * todos os outros gates, e o agente nao tem como alcancar.
 *
 * Checa as duas direcoes:
 *   1. todo data/*.yaml precisa ser lido por alguma tool ou regra;
 *   2. todo carregarYaml('x') precisa ter um data/x.yaml, senao quebra em runtime.
 *
 * exit 0 = PASS, exit 2 = FAIL.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from '../src/version.js';

const DIR_DATA = join(RAIZ, 'data');
const DIRS_CONSUMIDORES = [
  join(RAIZ, 'src', 'tools'),
  join(RAIZ, 'src', 'rules'),
  join(RAIZ, 'src', 'data'),
];

// Arquivos que existem para consulta humana ou para outro gate, nao para tool.
const ISENTOS = new Set([]);

const arquivos = existsSync(DIR_DATA)
  ? readdirSync(DIR_DATA)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => f.slice(0, -5))
  : [];

// Junta o codigo de todos os consumidores num texto so.
let codigo = '';
for (const dir of DIRS_CONSUMIDORES) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    codigo += readFileSync(join(dir, f), 'utf8') + '\n';
  }
}

const orfaos = [];
for (const nome of arquivos) {
  if (ISENTOS.has(nome)) continue;
  // Casa carregarYaml('nome') e carregarYaml("nome").
  const usado = codigo.includes(`carregarYaml('${nome}')`) || codigo.includes(`carregarYaml("${nome}")`);
  if (!usado) orfaos.push(nome);
}

// Direcao inversa: tool que le arquivo que nao existe derruba em runtime.
// A propria assinatura em src/data/carregar.js entra no texto varrido, entao
// descartamos as ocorrencias que nao sao chamada com literal.
const referenciados = [...codigo.matchAll(/carregarYaml\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]);
const inexistentes = [...new Set(referenciados)].filter((n) => !arquivos.includes(n));

const problemas = [];
for (const nome of orfaos) {
  problemas.push(
    `data/${nome}.yaml existe mas nenhuma tool ou regra o le. O agente nao tem como alcancar esse dado - ` +
      'exponha por uma tool, ou remova o arquivo.'
  );
}
for (const nome of inexistentes) {
  problemas.push(`alguma tool chama carregarYaml('${nome}') mas data/${nome}.yaml nao existe - quebra em runtime.`);
}

if (problemas.length > 0) {
  console.error(`FAIL  ${problemas.length} problema(s) de dado nao servido:`);
  for (const p of problemas) console.error(`      - ${p}`);
  process.exit(2);
}

console.log(`PASS  ${arquivos.length} arquivo(s) de dados, todos servidos por alguma tool ou regra`);
process.exit(0);
