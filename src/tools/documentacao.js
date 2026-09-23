/**
 * documentacao — serve o README do projeto pelo protocolo, recortado por secao.
 *
 * Existe porque o servidor nao implementa `resources`: sem esta tool, nenhum
 * arquivo do repositorio e alcancavel por um cliente MCP. O README e o espelho
 * autossuficiente da documentacao do projeto, e as secoes sao delimitadas por
 * marcadores `## secao: <id>`.
 *
 * Sem argumento devolve o INDICE, nao o documento inteiro. O agente que nao
 * sabe o que quer chama sem argumento, e servir 300 linhas nesse caso e
 * desperdicio garantido.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from '../version.js';

const MARCADOR = /^##\s+secao:\s*(\S+)\s*$/;

function lerSecoes() {
  const caminho = join(RAIZ, 'README.md');
  if (!existsSync(caminho)) {
    throw new Error('README.md nao existe na raiz do repositorio');
  }
  const linhas = readFileSync(caminho, 'utf8').split('\n');

  const secoes = new Map();
  let atual = null;
  let buffer = [];

  for (const linha of linhas) {
    const m = linha.match(MARCADOR);
    if (m) {
      if (atual) secoes.set(atual, buffer.join('\n').trim());
      atual = m[1];
      buffer = [];
      continue;
    }
    if (atual) buffer.push(linha);
  }
  if (atual) secoes.set(atual, buffer.join('\n').trim());

  return secoes;
}

/** Primeira linha util da secao, para o indice. */
function resumir(texto) {
  const linha = texto
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('|') && !l.startsWith('```') && !l.startsWith('#'));
  if (!linha) return '';
  return linha.length > 140 ? `${linha.slice(0, 137)}...` : linha;
}

export default async function documentacao(args = {}) {
  const secoes = lerSecoes();

  if (!args.secao) {
    return {
      modo: 'indice (padrao)',
      total: secoes.size,
      secoes: [...secoes.entries()].map(([id, texto]) => ({
        id,
        linhas: texto.split('\n').length,
        resumo: resumir(texto),
      })),
      onde_vive_cada_coisa: {
        documentacao_do_projeto: 'README.md deste repositorio, servido por esta tool',
        dados_do_projeto: 'data/*.yaml — lidos pelas demais tools',
        regras_com_veto: 'src/rules/ — rodadas por verificar_conteudo',
        agentes_do_squad: 'squad/agents/*.md',
        manifesto_do_squad: 'squad/squad.yaml',
        plano_de_projeto_e_clickup: 'ainda nao publicado — ver status_lacunas',
      },
      nota_de_modo: 'Chame com `secao: "<id>"` para receber o texto completo de uma secao.',
    };
  }

  const texto = secoes.get(args.secao);
  if (texto === undefined) {
    return {
      erro: `secao "${args.secao}" nao existe no README`,
      secoes_validas: [...secoes.keys()],
    };
  }

  return {
    modo: 'secao',
    secao: args.secao,
    conteudo: texto,
  };
}
