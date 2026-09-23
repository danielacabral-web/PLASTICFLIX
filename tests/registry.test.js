/**
 * Testes do registry.
 *
 * O que importa aqui nao e o caminho feliz, e o boot NEGANDO subir. Cada caso
 * monta um repositorio de fixture em tests/_fixtures/ (mcp.json proprio e
 * src/tools/ proprio) e cobra que montarRegistry lance ErroDeRegistry com o
 * problema nomeado. Fixture em vez de mock porque o registry le disco de
 * verdade - mockar fs testaria o mock, nao o gate.
 */
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { montarRegistry, lerManifest, ErroDeRegistry, listarArquivosDeTools } from '../src/registry.js';
import { RAIZ } from '../src/version.js';

const DIR_FIXTURES = join(RAIZ, 'tests', '_fixtures', 'registry');
let contador = 0;

/** Entrada de manifest valida, para cada caso mudar so o que esta testando. */
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
 * Monta um repo de fixture e devolve a raiz dele.
 * Fica sob tests/_fixtures/ de proposito: assim o node_modules do repo e
 * resolvido subindo os diretorios, sem copia nem symlink.
 *
 * @param {object[]} tools entradas do manifest
 * @param {string[]} handlers nomes de arquivo a criar em src/tools/
 */
function montarFixture(tools, handlers) {
  const raiz = join(DIR_FIXTURES, `reg-${process.pid}-${contador++}`);
  mkdirSync(join(raiz, 'src', 'tools'), { recursive: true });
  writeFileSync(join(raiz, 'mcp.json'), JSON.stringify({ name: 'fixture', tools }, null, 2), 'utf8');
  for (const nome of handlers) {
    writeFileSync(
      join(raiz, 'src', 'tools', `${nome}.js`),
      'export default async function () {\n  return { ok: true };\n}\n',
      'utf8'
    );
  }
  return raiz;
}

/** Roda montarRegistry esperando falha e devolve a lista de problemas. */
async function problemasDe(raiz, opcoes = {}) {
  try {
    await montarRegistry({ raiz, ...opcoes });
  } catch (e) {
    assert.ok(e instanceof ErroDeRegistry, `esperado ErroDeRegistry, veio ${e.name}: ${e.message}`);
    return e.problemas;
  }
  assert.fail('montarRegistry deveria ter lancado ErroDeRegistry e nao lancou');
  return [];
}

after(() => {
  if (existsSync(DIR_FIXTURES)) rmSync(DIR_FIXTURES, { recursive: true, force: true });
});

describe('registry - fixture que fecha', () => {
  test('manifest e handlers batendo sobe sem erro', async () => {
    const raiz = montarFixture([toolValida('alfa'), toolValida('beta')], ['alfa', 'beta']);
    const { tools } = await montarRegistry({ raiz });
    assert.deepEqual([...tools.keys()], ['alfa', 'beta']);
    assert.equal(typeof tools.get('alfa').handler, 'function');
  });
});

describe('registry - boot tem de falhar', () => {
  test('tool fantasma: esta no manifest e nao tem handler', async () => {
    const raiz = montarFixture([toolValida('alfa'), toolValida('fantasma')], ['alfa']);
    const problemas = await problemasDe(raiz);
    assert.ok(
      problemas.some((p) => p.includes('fantasma') && p.includes('tool fantasma')),
      `problemas: ${JSON.stringify(problemas)}`
    );
  });

  test('handler orfao: existe em src/tools e nao esta no manifest', async () => {
    const raiz = montarFixture([toolValida('alfa')], ['alfa', 'orfa']);
    const problemas = await problemasDe(raiz);
    assert.ok(
      problemas.some((p) => p.includes('orfa') && p.includes('handler orfao')),
      `problemas: ${JSON.stringify(problemas)}`
    );
  });

  test('annotations ausentes derrubam o boot', async () => {
    const raiz = montarFixture([toolValida('alfa', { annotations: undefined })], ['alfa']);
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('annotations')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('annotations erradas (readOnlyHint false) derrubam o boot', async () => {
    const raiz = montarFixture(
      [toolValida('alfa', { annotations: { readOnlyHint: false, openWorldHint: false } })],
      ['alfa']
    );
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('readOnlyHint')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('openWorldHint true derruba o boot', async () => {
    const raiz = montarFixture(
      [toolValida('alfa', { annotations: { readOnlyHint: true, openWorldHint: true } })],
      ['alfa']
    );
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('openWorldHint')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('nome fora do snake_case minusculo derruba o boot', async () => {
    const raiz = montarFixture([toolValida('AlfaBeta')], []);
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('snake_case')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('description ausente derruba o boot', async () => {
    const raiz = montarFixture([toolValida('alfa', { description: undefined })], ['alfa']);
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('description')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('inputSchema que nao e type object derruba o boot', async () => {
    const raiz = montarFixture([toolValida('alfa', { inputSchema: { type: 'string' } })], ['alfa']);
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('inputSchema')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('tool duplicada no manifest derruba o boot', async () => {
    const raiz = montarFixture([toolValida('alfa'), toolValida('alfa')], ['alfa']);
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('mais de uma vez')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('handler sem export default derruba o boot', async () => {
    const raiz = montarFixture([toolValida('alfa')], []);
    writeFileSync(join(raiz, 'src', 'tools', 'alfa.js'), 'export const nada = 1;\n', 'utf8');
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('export default')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('com exigirAgente, agente inexistente em squad/agents derruba o boot', async () => {
    const raiz = montarFixture([toolValida('alfa', { agente: 'nao-existe' })], ['alfa']);
    mkdirSync(join(raiz, 'squad', 'agents'), { recursive: true });
    const problemas = await problemasDe(raiz, { exigirAgente: true });
    assert.ok(problemas.some((p) => p.includes('nao-existe')), `problemas: ${JSON.stringify(problemas)}`);
  });

  test('com exigirAgente, agente presente passa', async () => {
    const raiz = montarFixture([toolValida('alfa', { agente: 'plasticflix-chief' })], ['alfa']);
    mkdirSync(join(raiz, 'squad', 'agents'), { recursive: true });
    writeFileSync(join(raiz, 'squad', 'agents', 'plasticflix-chief.md'), '# chief\n', 'utf8');
    const { tools } = await montarRegistry({ raiz, exigirAgente: true });
    assert.equal(tools.size, 1);
  });

  test('mcp.json ausente vira ErroDeRegistry, nao ENOENT cru', async () => {
    const raiz = join(DIR_FIXTURES, `vazio-${process.pid}`);
    mkdirSync(raiz, { recursive: true });
    const problemas = await problemasDe(raiz);
    assert.ok(problemas.some((p) => p.includes('mcp.json nao encontrado')));
  });
});

describe('manifest real deste repo', () => {
  test('declara as 10 tools do contrato, todas validas', () => {
    const manifest = lerManifest();
    const nomes = manifest.tools.map((t) => t.name);
    assert.deepEqual(nomes, [
      'perfil_plasticflix',
      'planejar_demandas',
      'calendario_projeto',
      'briefing_entrega',
      'oferta_precos',
      'base_publico',
      'escrever_copy',
      'verificar_conteudo',
      'status_lacunas',
      'documentacao',
    ]);
    for (const t of manifest.tools) {
      assert.match(t.name, /^[a-z][a-z0-9_]*$/, `${t.name} fora do snake_case`);
      assert.ok(t.agente, `${t.name} sem agente`);
      assert.ok(t.description && t.description.length > 40, `${t.name} com description curta demais`);
      assert.equal(t.inputSchema?.type, 'object', `${t.name} com inputSchema invalido`);
      assert.equal(t.annotations?.readOnlyHint, true, `${t.name} sem readOnlyHint`);
      assert.equal(t.annotations?.openWorldHint, false, `${t.name} sem openWorldHint false`);
    }
  });

  test('nenhum handler orfao em src/tools deste repo', () => {
    const nomesManifest = lerManifest().tools.map((t) => t.name);
    const orfaos = listarArquivosDeTools().filter((n) => !nomesManifest.includes(n));
    assert.deepEqual(orfaos, [], `handlers sem entrada no manifest: ${orfaos.join(', ')}`);
  });
});
