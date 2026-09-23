#!/usr/bin/env node
/**
 * Smoke test do handshake MCP: sobe o servidor como processo filho, fala
 * JSON-RPC por stdio e confere initialize, tools/list e um tools/call real.
 *
 * Prova de ponta a ponta de que o servidor esta de pe. exit 0 = PASS, 2 = FAIL.
 */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { RAIZ, NOME_SERVIDOR } from '../src/version.js';
import { lerManifest } from '../src/registry.js';

const SERVIDOR = join(RAIZ, 'src', 'server.js');

// A lista esperada sai do proprio manifest - o smoke nao mantem uma segunda
// lista na mao, que e justamente o defeito que este servidor evita.
const ESPERADAS = lerManifest().tools.map((t) => t.name);

const pedidos = [
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'smoke', version: '0' },
    },
  },
  { jsonrpc: '2.0', method: 'notifications/initialized' },
  { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'status_lacunas', arguments: {} },
  },
];

const filho = spawn(process.execPath, [SERVIDOR], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, PLASTICFLIX_TELEMETRY: '0' },
});

let saida = '';
let erro = '';
filho.stdout.on('data', (d) => (saida += d.toString()));
filho.stderr.on('data', (d) => (erro += d.toString()));

for (const p of pedidos) filho.stdin.write(JSON.stringify(p) + '\n');

// Janela curta: o servidor responde em milissegundos; se nao respondeu, e falha.
setTimeout(() => {
  filho.kill();

  const respostas = saida
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const falhas = [];
  const por = (id) => respostas.find((r) => r.id === id);

  const init = por(1);
  if (!init?.result?.serverInfo) falhas.push('initialize nao devolveu serverInfo');
  else if (init.result.serverInfo.name !== NOME_SERVIDOR)
    falhas.push(`serverInfo.name = "${init.result.serverInfo.name}", esperado "${NOME_SERVIDOR}"`);

  const lista = por(2);
  if (!Array.isArray(lista?.result?.tools)) falhas.push('tools/list nao devolveu array de tools');
  else {
    const nomes = lista.result.tools.map((t) => t.name);
    const faltando = ESPERADAS.filter((n) => !nomes.includes(n));
    const sobrando = nomes.filter((n) => !ESPERADAS.includes(n));
    if (faltando.length > 0) falhas.push(`tools/list nao anunciou: ${faltando.join(', ')}`);
    if (sobrando.length > 0) falhas.push(`tools/list anunciou tool fora do manifest: ${sobrando.join(', ')}`);

    const semAnotacao = lista.result.tools.filter((t) => t.annotations?.readOnlyHint !== true);
    if (semAnotacao.length > 0) {
      falhas.push(`${semAnotacao.length} tool(s) sem readOnlyHint: ${semAnotacao.map((t) => t.name).join(', ')}`);
    }
  }

  const chamada = por(3);
  if (chamada?.result?.isError) {
    falhas.push(`tools/call em status_lacunas devolveu erro: ${chamada.result.content?.[0]?.text}`);
  } else {
    const texto = chamada?.result?.content?.[0]?.text;
    if (!texto) falhas.push('tools/call nao devolveu conteudo');
    else {
      try {
        JSON.parse(texto);
      } catch {
        falhas.push('tools/call devolveu conteudo que nao e JSON');
      }
    }
  }

  if (falhas.length > 0) {
    console.error('FAIL  handshake incompleto:');
    for (const f of falhas) console.error(`      - ${f}`);
    if (erro.trim()) console.error(`\n      stderr do servidor:\n${erro}`);
    process.exit(2);
  }

  console.log(`PASS  handshake ok - ${init.result.serverInfo.name} v${init.result.serverInfo.version}`);
  console.log(`      tools/list: ${lista.result.tools.length} tool(s) - ${lista.result.tools.map((t) => t.name).join(', ')}`);
  console.log('      tools/call status_lacunas: respondeu sem erro');
  process.exit(0);
}, 2500);
