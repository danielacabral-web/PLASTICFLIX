/**
 * Testes do servidor, por JSON-RPC de verdade sobre stdio.
 *
 * Como os handlers reais de src/tools/ ainda estao sendo escritos, o servidor
 * e exercitado contra um repo de FIXTURE: copia de src/ e do package.json sob
 * tests/_fixtures/, com mcp.json e src/tools/ proprios. Assim o teste prova o
 * comportamento do transporte e do boot sem depender do conteudo do cliente.
 *
 * O fixture fica dentro do repo de proposito - a resolucao de node_modules
 * sobe os diretorios e encontra o SDK sem copia nem symlink.
 */
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { RAIZ, NOME_SERVIDOR, VERSAO } from '../src/version.js';
import { lerManifest } from '../src/registry.js';

const DIR_FIXTURES = join(RAIZ, 'tests', '_fixtures', 'servidor');
let contador = 0;

function toolValida(nome, extra = {}) {
  return {
    name: nome,
    agente: 'plasticflix-chief',
    description: `Descricao suficientemente longa da tool ${nome} para passar no gate de description.`,
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
    ...extra,
  };
}

/**
 * Monta um repo de fixture completo (src/ copiado + package.json) e devolve o
 * caminho do server.js dele.
 *
 * @param {object[]} tools entradas do manifest
 * @param {Record<string, string>} handlers nome -> corpo do modulo
 */
function montarServidorFixture(tools, handlers) {
  const raiz = join(DIR_FIXTURES, `srv-${process.pid}-${contador++}`);
  mkdirSync(join(raiz, 'src', 'tools'), { recursive: true });

  // Copia os fontes de infraestrutura. src/tools/ do fixture e escrito depois,
  // e por isso a copia vem antes.
  for (const arquivo of ['version.js', 'registry.js', 'server.js', 'telemetry.js']) {
    cpSync(join(RAIZ, 'src', arquivo), join(raiz, 'src', arquivo));
  }
  cpSync(join(RAIZ, 'src', 'data'), join(raiz, 'src', 'data'), { recursive: true });

  // O package.json e o MESMO do repo: e dele que o servidor le nome e versao,
  // e e isso que o teste de versao cobra.
  cpSync(join(RAIZ, 'package.json'), join(raiz, 'package.json'));

  writeFileSync(join(raiz, 'mcp.json'), JSON.stringify({ name: 'fixture', tools }, null, 2), 'utf8');
  for (const [nome, corpo] of Object.entries(handlers)) {
    writeFileSync(join(raiz, 'src', 'tools', `${nome}.js`), corpo, 'utf8');
  }
  return join(raiz, 'src', 'server.js');
}

/**
 * Sobe o servidor, despeja os pedidos em stdin e devolve as respostas
 * JSON-RPC, o stderr e o codigo de saida.
 *
 * @param {string} servidor caminho do server.js
 * @param {object[]} pedidos mensagens JSON-RPC
 */
function conversar(servidor, pedidos) {
  return new Promise((resolve) => {
    const filho = spawn(process.execPath, [servidor], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PLASTICFLIX_TELEMETRY: '0' },
    });

    let saida = '';
    let erro = '';
    let codigo = null;
    filho.stdout.on('data', (d) => (saida += d.toString()));
    filho.stderr.on('data', (d) => (erro += d.toString()));
    filho.on('exit', (c) => (codigo = c));

    for (const p of pedidos) {
      try {
        filho.stdin.write(JSON.stringify(p) + '\n');
      } catch {
        // O servidor pode ja ter morrido no boot - e exatamente um dos casos
        // sob teste; a asserta fica com quem chamou.
      }
    }

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
      resolve({ respostas, erro, codigo, por: (id) => respostas.find((r) => r.id === id) });
    }, 1800);
  });
}

const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'teste', version: '0' },
  },
};
const INITIALIZED = { jsonrpc: '2.0', method: 'notifications/initialized' };
const LISTAR = { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} };

const HANDLER_OK = 'export default async function (args) {\n  return { ok: true, recebido: args };\n}\n';
const HANDLER_QUEBRA = "export default async function () {\n  throw new Error('estourou de proposito');\n}\n";

after(() => {
  if (existsSync(DIR_FIXTURES)) rmSync(DIR_FIXTURES, { recursive: true, force: true });
});

describe('boot: o servidor nega subir quando o registry nao fecha', () => {
  test('tool fantasma derruba o boot com mensagem no stderr', async () => {
    const servidor = montarServidorFixture([toolValida('alfa'), toolValida('fantasma')], { alfa: HANDLER_OK });
    const { respostas, erro, codigo } = await conversar(servidor, [INITIALIZE]);
    assert.equal(respostas.length, 0, 'servidor com tool fantasma nao deveria responder nada');
    assert.match(erro, /\[plasticflix-mcp\]/);
    assert.match(erro, /tool fantasma/);
    assert.equal(codigo, 1);
  });

  test('handler orfao derruba o boot', async () => {
    const servidor = montarServidorFixture([toolValida('alfa')], { alfa: HANDLER_OK, orfa: HANDLER_OK });
    const { erro, codigo } = await conversar(servidor, [INITIALIZE]);
    assert.match(erro, /\[plasticflix-mcp\]/);
    assert.match(erro, /handler orfao/);
    assert.equal(codigo, 1);
  });

  test('annotations incorretas derrubam o boot', async () => {
    const servidor = montarServidorFixture(
      [toolValida('alfa', { annotations: { readOnlyHint: false, openWorldHint: false } })],
      { alfa: HANDLER_OK }
    );
    const { erro, codigo } = await conversar(servidor, [INITIALIZE]);
    assert.match(erro, /readOnlyHint/);
    assert.equal(codigo, 1);
  });
});

describe('servidor de pe', () => {
  test('tools/list devolve exatamente os nomes do manifest, com as annotations', async () => {
    const nomes = ['alfa', 'beta', 'gama'];
    const servidor = montarServidorFixture(
      nomes.map((n) => toolValida(n)),
      Object.fromEntries(nomes.map((n) => [n, HANDLER_OK]))
    );
    const { por, erro } = await conversar(servidor, [INITIALIZE, INITIALIZED, LISTAR]);
    const lista = por(2);
    assert.ok(Array.isArray(lista?.result?.tools), `tools/list nao respondeu. stderr:\n${erro}`);
    assert.deepEqual(lista.result.tools.map((t) => t.name), nomes);
    for (const t of lista.result.tools) {
      assert.equal(t.annotations.readOnlyHint, true);
      assert.equal(t.annotations.openWorldHint, false);
      assert.equal(t.inputSchema.type, 'object');
    }
  });

  test('serverInfo sai do package.json, nao de literal no codigo', async () => {
    const servidor = montarServidorFixture([toolValida('alfa')], { alfa: HANDLER_OK });
    const { por } = await conversar(servidor, [INITIALIZE]);
    const info = por(1)?.result?.serverInfo;
    assert.ok(info, 'initialize nao devolveu serverInfo');

    const pkg = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'));
    assert.equal(info.name, pkg.name);
    assert.equal(info.version, pkg.version);
    // E o mesmo que src/version.js exporta - uma fonte so.
    assert.equal(info.name, NOME_SERVIDOR);
    assert.equal(info.version, VERSAO);
    assert.equal(pkg.name, 'plasticflix-mcp');
  });

  test('tools/call chega no handler e devolve o resultado como JSON', async () => {
    const servidor = montarServidorFixture([toolValida('alfa')], { alfa: HANDLER_OK });
    const { por } = await conversar(servidor, [
      INITIALIZE,
      INITIALIZED,
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'alfa', arguments: { x: 1 } } },
    ]);
    const r = por(3);
    assert.ok(!r?.result?.isError, JSON.stringify(r));
    assert.deepEqual(JSON.parse(r.result.content[0].text), { ok: true, recebido: { x: 1 } });
  });

  test('handler que estoura vira conteudo de erro, e o servidor continua de pe', async () => {
    const servidor = montarServidorFixture([toolValida('alfa'), toolValida('beta')], {
      alfa: HANDLER_QUEBRA,
      beta: HANDLER_OK,
    });
    const { por } = await conversar(servidor, [
      INITIALIZE,
      INITIALIZED,
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'alfa', arguments: {} } },
      { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'beta', arguments: {} } },
    ]);
    const quebrou = por(3);
    assert.equal(quebrou?.result?.isError, true, JSON.stringify(quebrou));
    assert.match(quebrou.result.content[0].text, /Erro em alfa: estourou de proposito/);

    // A prova de que nao derrubou: a chamada seguinte ainda e atendida.
    const depois = por(4);
    assert.ok(!depois?.result?.isError, JSON.stringify(depois));
  });

  test('tool desconhecida devolve erro legivel em vez de crash', async () => {
    const servidor = montarServidorFixture([toolValida('alfa')], { alfa: HANDLER_OK });
    const { por } = await conversar(servidor, [
      INITIALIZE,
      INITIALIZED,
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'nao_existe', arguments: {} } },
    ]);
    const r = por(3);
    // O SDK pode barrar antes do handler; qualquer um dos dois caminhos serve,
    // desde que o servidor responda em vez de morrer.
    assert.ok(r?.result?.isError === true || r?.error, JSON.stringify(r));
  });
});

describe('contrato do manifest deste repo', () => {
  test('as 10 tools do contrato sao exatamente as que o servidor vai anunciar', () => {
    const nomes = lerManifest().tools.map((t) => t.name);
    assert.equal(nomes.length, 10);
    assert.equal(new Set(nomes).size, 10, 'ha nome repetido no manifest');
  });
});
