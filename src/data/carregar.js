/**
 * Loaders puros dos arquivos de dados DO PROPRIO REPO.
 *
 * Le apenas data/*.yaml versionado aqui. Nao acessa rede, nao acessa Drive,
 * nao acessa o disco fora da raiz do projeto.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { RAIZ } from '../version.js';

const cache = new Map();

/**
 * @param {string} nome nome do arquivo em data/, sem extensao
 * @returns {any} conteudo parseado
 */
export function carregarYaml(nome) {
  if (cache.has(nome)) return cache.get(nome);
  const caminho = join(RAIZ, 'data', `${nome}.yaml`);
  if (!existsSync(caminho)) {
    throw new Error(`data/${nome}.yaml nao existe`);
  }
  let dados;
  try {
    dados = parse(readFileSync(caminho, 'utf8'));
  } catch (e) {
    throw new Error(`data/${nome}.yaml nao e YAML valido: ${e.message}`);
  }
  cache.set(nome, dados);
  return dados;
}

/** Usado pelos testes para nao carregar estado entre casos. */
export function limparCache() {
  cache.clear();
}
