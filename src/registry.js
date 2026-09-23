/**
 * Registry de tools: carrega o manifest, importa os handlers e VALIDA a
 * correspondencia entre os dois antes de o servidor subir.
 *
 * Motivo de existir
 * -----------------
 * O defeito classico de servidor MCP e manter duas listas paralelas na mao: o
 * manifest declara N tools e o mapa de handlers cobre N menos algumas. As que
 * sobram aparecem em tools/list e estouram em tools/call com "Unknown tool".
 * O agente as ve, chama, e leva um erro.
 *
 * A correcao aqui nao e disciplina, e arquitetura - existe UMA lista (o
 * manifest, em mcp.json), os handlers sao descobertos por convencao de nome, e
 * qualquer divergencia derruba o boot.
 *
 * Convencao: a tool `perfil_plasticflix` mora em
 * `src/tools/perfil_plasticflix.js` e faz
 * `export default async function(args, ctx) {...}`.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ } from './version.js';

export class ErroDeRegistry extends Error {
  /** @param {string[]} problemas */
  constructor(problemas) {
    super('Registry invalido:\n  - ' + problemas.join('\n  - '));
    this.name = 'ErroDeRegistry';
    this.problemas = problemas;
  }
}

/**
 * @param {string} raiz raiz do projeto; parametrizavel so para os testes
 *   montarem repositorios de fixture em diretorio temporario.
 */
export function lerManifest(raiz = RAIZ) {
  const caminho = join(raiz, 'mcp.json');
  if (!existsSync(caminho)) {
    throw new ErroDeRegistry([`mcp.json nao encontrado em ${caminho}`]);
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(caminho, 'utf8'));
  } catch (e) {
    throw new ErroDeRegistry([`mcp.json nao e JSON valido: ${e.message}`]);
  }
  if (!Array.isArray(manifest.tools)) {
    throw new ErroDeRegistry(['mcp.json precisa de um array "tools"']);
  }
  return manifest;
}

/**
 * Monta o registry e falha alto se algo nao fechar.
 *
 * @param {{ exigirAgente?: boolean, raiz?: string }} opcoes
 *   exigirAgente: se true, cada tool precisa apontar para um agente existente
 *   em squad/agents/. Fica desligado enquanto o squad nao existe, e o gate
 *   scripts/validate-manifest.js o liga assim que squad/agents/ passa a existir.
 *   raiz: so os testes passam, para validar um repositorio de fixture.
 * @returns {Promise<{ manifest: object, tools: Map<string, {definicao: object, handler: Function}> }>}
 */
export async function montarRegistry({ exigirAgente = false, raiz = RAIZ } = {}) {
  const dirTools = join(raiz, 'src', 'tools');
  const dirAgentes = join(raiz, 'squad', 'agents');

  const manifest = lerManifest(raiz);
  const problemas = [];
  const tools = new Map();

  const nomesManifest = [];
  for (const definicao of manifest.tools) {
    if (!definicao || typeof definicao.name !== 'string' || !definicao.name) {
      problemas.push('ha uma entrada em "tools" sem campo "name"');
      continue;
    }
    nomesManifest.push(definicao.name);
  }

  const duplicados = nomesManifest.filter((n, i) => nomesManifest.indexOf(n) !== i);
  for (const nome of new Set(duplicados)) {
    problemas.push(`tool "${nome}" aparece mais de uma vez no manifest`);
  }

  for (const definicao of manifest.tools) {
    const nome = definicao?.name;
    if (!nome) continue;

    if (!/^[a-z][a-z0-9_]*$/.test(nome)) {
      problemas.push(`tool "${nome}": nome deve ser snake_case minusculo`);
    }
    if (!definicao.description) {
      problemas.push(`tool "${nome}": falta "description"`);
    }
    if (!definicao.inputSchema || definicao.inputSchema.type !== 'object') {
      problemas.push(`tool "${nome}": "inputSchema" deve ser um objeto JSON Schema com type "object"`);
    }

    // Toda tool deste servidor e leitura pura: os handlers nao fazem I/O de rede
    // nem escrevem em disco. Declarar isso deixa o cliente pular a confirmacao de
    // execucao. Se um dia alguma tool passar a escrever, o autor tem de mexer aqui
    // - e o gate obriga a pensar nisso em vez de herdar a anotacao por descuido.
    const a = definicao.annotations;
    if (!a || a.readOnlyHint !== true || a.openWorldHint !== false) {
      problemas.push(
        `tool "${nome}": falta "annotations" com readOnlyHint true e openWorldHint false. ` +
          'Se esta tool realmente escreve ou acessa rede, ela contraria o desenho do servidor - reveja.'
      );
    }

    // Handler por convencao de nome.
    const arquivo = join(dirTools, `${nome}.js`);
    if (!existsSync(arquivo)) {
      problemas.push(`tool "${nome}" esta no manifest mas nao existe src/tools/${nome}.js (tool fantasma)`);
      continue;
    }

    let modulo;
    try {
      modulo = await import(pathToFileURL(arquivo).href);
    } catch (e) {
      problemas.push(`tool "${nome}": falha ao importar src/tools/${nome}.js - ${e.message}`);
      continue;
    }
    if (typeof modulo.default !== 'function') {
      problemas.push(`tool "${nome}": src/tools/${nome}.js precisa de "export default" como funcao`);
      continue;
    }

    // A associacao tool -> agente vive DENTRO da entrada do manifest, nunca em
    // uma segunda estrutura. E a segunda estrutura que cria as tools fantasma.
    if (exigirAgente) {
      if (!definicao.agente) {
        problemas.push(`tool "${nome}": falta o campo "agente"`);
      } else if (!existsSync(join(dirAgentes, `${definicao.agente}.md`))) {
        problemas.push(`tool "${nome}": agente "${definicao.agente}" nao existe em squad/agents/`);
      }
    }

    tools.set(nome, { definicao, handler: modulo.default });
  }

  // Direcao inversa: handler sem entrada no manifest e codigo morto que o
  // agente nunca alcanca. Tambem e erro.
  const orfaos = listarArquivosDeTools(raiz).filter((n) => !nomesManifest.includes(n));
  for (const nome of orfaos) {
    problemas.push(`src/tools/${nome}.js existe mas "${nome}" nao esta no manifest (handler orfao)`);
  }

  if (problemas.length > 0) throw new ErroDeRegistry(problemas);
  return { manifest, tools };
}

/** Nomes de tool derivados dos arquivos em src/tools/, ignorando o que comeca com "_". */
export function listarArquivosDeTools(raiz = RAIZ) {
  const dirTools = join(raiz, 'src', 'tools');
  if (!existsSync(dirTools)) return [];
  return readdirSync(dirTools)
    .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .map((f) => f.slice(0, -3));
}
