/**
 * R-005 — Preco e lote. BLOQUEIO.
 *
 * Tres coisas caem aqui, e as tres saem de data/produtos.yaml. Nenhum valor
 * esta escrito neste arquivo de proposito: preco muda por decisao de diretoria,
 * e regra que guarda copia do preco fica bloqueando copy correta depois que o
 * mundo muda.
 *
 *   1. Preco divergente da tabela. Foi o problema relatado pela Fran: o mesmo
 *      lead ouviu R$ 20 mil e R$ 25 mil.
 *   2. Desconto publico fora das duas excecoes previstas — combo Rino + Face e
 *      sociedade parceira. Qualquer outro percentual publico e corte de valor.
 *   3. Justificativa de preco que nao seja a regra de lote. "Promocao",
 *      "condicao especial" e "ultimas horas" destroem a ancora; "1o lote ate o
 *      dia X" e a unica justificativa autorizada.
 *
 * O piso negociado da Face (50 mil discutido, 40 mil citado) e informacao de
 * negociacao individual. Se aparecer em peca, e veto.
 */
import { achado, normalizar, valoresEmReais, percentuaisDeDesconto } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

const JUSTIFICATIVA_PROIBIDA = [
  'promocao',
  'promocional',
  'valor promocional',
  'condicao especial',
  'oferta relampago',
  'desconto relampago',
  'so hoje',
  'ultimas horas',
  'black friday',
  'queima de estoque',
  'preco de lancamento',
  'special offer',
  'limited time offer',
  'flash sale',
  'today only',
  'special price',
  'discount code',
];

const JUSTIFICATIVA_DE_LOTE = /\b(1[oº]?\s*lote|2[oº]?\s*lote|primeiro lote|segundo lote|lote\s*\d|first batch|early bird|batch\s*\d|early registration)\b/iu;

function coletarPrecos(produtos) {
  const validos = new Set();
  for (const p of produtos?.produtos ?? []) {
    for (const chave of ['lote_1', 'lote_2']) {
      const v = p?.[chave]?.preco;
      if (typeof v === 'number') validos.add(v);
    }
    const piso = p?.piso_negociado;
    if (piso) {
      // O valor de tabela e publicavel; o piso e os valores discutidos nao sao.
      if (typeof piso.tabela === 'number') validos.add(piso.tabela);
    }
  }
  return validos;
}

function coletarPisosSigilosos(produtos) {
  const sigilosos = new Map();
  for (const p of produtos?.produtos ?? []) {
    const piso = p?.piso_negociado;
    if (!piso) continue;
    for (const chave of ['piso_discutido', 'piso_citado']) {
      if (typeof piso[chave] === 'number') sigilosos.set(piso[chave], `${p.id} (${chave})`);
    }
  }
  return sigilosos;
}

export default function precoLote(texto, contexto = {}) {
  const achados = [];
  const original = String(texto ?? '');
  const alvo = normalizar(original);

  const produtos = carregarYaml('produtos');
  const precosValidos = coletarPrecos(produtos);
  const pisosSigilosos = coletarPisosSigilosos(produtos);
  const descontosPermitidos = (produtos?.descontos_permitidos ?? []).map((d) => d.percentual);
  const nomesDosDescontos = (produtos?.descontos_permitidos ?? []).map((d) => `${d.nome} (${d.percentual}%)`);

  const citados = valoresEmReais(original);

  // 1. Piso de negociacao em peca. Pior caso: e sigiloso E divergente da tabela.
  for (const v of citados) {
    if (pisosSigilosos.has(v)) {
      achados.push(
        achado(
          'R-005',
          'BLOQUEIO',
          `A peca cita R$ ${v.toLocaleString('pt-BR')}, que e piso de negociacao interna (${pisosSigilosos.get(v)}), nao valor de tabela.`,
          'Retire. Piso de negociacao vive na conversa individual da diretoria, nunca em peca. ' +
            'Publicar o piso derruba a ancora de tabela para todo mundo.',
          { padrao: 'piso-em-peca', valor: v }
        )
      );
    }
  }

  // 2. Preco divergente da tabela.
  const divergentes = citados.filter((v) => !precosValidos.has(v) && !pisosSigilosos.has(v));
  if (divergentes.length > 0) {
    achados.push(
      achado(
        'R-005',
        'BLOQUEIO',
        `A peca traz valor que nao esta na tabela: R$ ${divergentes.map((v) => v.toLocaleString('pt-BR')).join(', R$ ')}.`,
        'Os precos validos sao os de data/produtos.yaml: ' +
          [...precosValidos].sort((a, b) => a - b).map((v) => `R$ ${v.toLocaleString('pt-BR')}`).join(', ') +
          '. Preco tem de ser identico em LP, WhatsApp e comercial — foi essa divergencia que gerou o ' +
          'R$ 20 mil x R$ 25 mil relatado pela Fran.',
        { padrao: 'preco-divergente', valores: divergentes, validos: [...precosValidos] }
      )
    );
  }

  // 3. Desconto publico fora das duas excecoes.
  const percentuais = percentuaisDeDesconto(original);
  const foraDaExcecao = percentuais.filter((p) => !descontosPermitidos.includes(p));
  if (foraDaExcecao.length > 0) {
    achados.push(
      achado(
        'R-005',
        'BLOQUEIO',
        `A peca oferece desconto de ${foraDaExcecao.join('%, ')}%, fora das excecoes previstas.`,
        `So existem dois descontos publicos: ${nomesDosDescontos.join(' e ')}. ` +
          'Qualquer outro e corte publico de valor e queima a ancora.',
        { padrao: 'desconto-nao-previsto', percentuais: foraDaExcecao, permitidos: descontosPermitidos }
      )
    );
  }

  // 4. Justificativa de preco que nao e a regra de lote.
  const proibidas = JUSTIFICATIVA_PROIBIDA.filter((t) => alvo.includes(normalizar(t)));
  if (proibidas.length > 0) {
    achados.push(
      achado(
        'R-005',
        'BLOQUEIO',
        `A peca justifica preco por "${proibidas.join('", "')}", e nao pela regra de lote.`,
        `Regra do projeto: ${String(produtos?.lotes?.regra ?? '').trim()} ` +
          'Reescreva a justificativa como prazo de lote.',
        { padrao: 'justificativa-fora-de-lote', termos: proibidas }
      )
    );
  }

  // 5. Peca com preco e sem nenhuma justificativa de lote: alerta.
  if (citados.length > 0 && !JUSTIFICATIVA_DE_LOTE.test(original) && proibidas.length === 0) {
    achados.push(
      achado(
        'R-005',
        'ALERTA',
        'A peca traz preco sem ancorar na regra de lote.',
        'Todo preco anunciado vem acompanhado do lote a que pertence. Sem isso, a virada de preco vira ' +
          'surpresa para o lead e a ancora se perde.',
        { padrao: 'preco-sem-lote', valores: citados }
      )
    );
  }

  return achados;
}
