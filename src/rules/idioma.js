/**
 * R-004 — Idioma da peca publica. BLOQUEIO em canal publico, ALERTA nos diretos.
 *
 * O idioma publico e ingles por decisao do Dr. Mattioli, contra a sugestao
 * inicial de espanhol. A justificativa dele: convidados americanos e turcos, e
 * publico latino de alto padrao consome conteudo internacional.
 *
 * Duas coisas importam no desenho desta regra:
 *
 *   1. O idioma vem de data/comunicacao.yaml (idioma.publico). Nao esta
 *      hardcoded. A decisao e uma hipotese nao testada e a propria regua manda
 *      medir por praca e reabrir com dado — quando reabrir, muda o YAML.
 *   2. WhatsApp e material interno tem excecao declarada no YAML: atendimento
 *      fala a lingua do lead. La e alerta, nao veto.
 */
import { achado, normalizar, canalDe, CANAIS_DIRETOS, palavras } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

// Marcadores funcionais do portugues. Palavra de conteudo nao serve: "lab" e
// "face" existem nas duas linguas.
const MARCADORES_PT = [
  'que', 'para', 'com', 'nao', 'uma', 'dos', 'das', 'pelo', 'pela', 'mais',
  'voce', 'sua', 'seu', 'sobre', 'como', 'nossa', 'nosso', 'sera', 'esta',
  'aulas', 'vagas', 'inscricao', 'inscricoes', 'cirurgiao', 'cirurgiões',
  'cirurgioes', 'teorica', 'teoricas', 'ao', 'da', 'do', 'na', 'no', 'em',
];

const MARCADORES_EN = [
  'the', 'and', 'with', 'you', 'your', 'our', 'for', 'this', 'will', 'from',
  'seats', 'registration', 'surgeon', 'surgeons', 'week', 'live', 'about',
  'of', 'to', 'in', 'on', 'at', 'is', 'are',
];

function contarMarcadores(texto, lista) {
  const tokens = new Set(palavras(normalizar(texto)));
  return lista.filter((m) => tokens.has(m)).length;
}

export default function idioma(texto, contexto = {}) {
  const comunicacao = carregarYaml('comunicacao');
  const idiomaPublico = String(comunicacao?.idioma?.publico ?? '').toLowerCase();
  if (!idiomaPublico || idiomaPublico !== 'en') return null;

  const canaisDaRegra = (comunicacao?.idioma?.aplica_a ?? []).map((c) => normalizar(c));
  const canal = canalDe(contexto);

  // O contexto pode pedir outro idioma explicitamente (peca de teste, material
  // de time). Nesse caso a regra nao tem o que dizer.
  const pedido = normalizar(contexto.idioma ?? idiomaPublico);
  if (pedido !== 'en') return null;

  const original = String(texto ?? '');
  if (palavras(original).length < 6) return null;

  const pt = contarMarcadores(original, MARCADORES_PT);
  const en = contarMarcadores(original, MARCADORES_EN);

  // Precisa de sinal claro: dois marcadores de portugues e mais portugues que
  // ingles. Texto curto e bilingue nao cai aqui por acidente.
  const ehPortugues = pt >= 2 && pt > en;
  if (!ehPortugues) return null;

  const decidido = comunicacao?.idioma?.decidido_por ?? 'o cliente';
  const justificativa = String(comunicacao?.idioma?.justificativa_do_cliente ?? '').trim();

  if (CANAIS_DIRETOS.has(canal)) {
    return achado(
      'R-004',
      'ALERTA',
      `Peca em portugues no canal "${canal}", que tem excecao declarada de idioma.`,
      'WhatsApp fala a lingua do lead e material interno e em portugues, entao isso esta provavelmente certo. ' +
        'Confira apenas se a peca nao vai virar post ou anuncio depois.',
      { padrao: 'portugues-em-canal-direto', marcadores_pt: pt, marcadores_en: en }
    );
  }

  const ehCanalDaRegra = canaisDaRegra.includes(canal) || canaisDaRegra.length === 0 || !canal;

  return achado(
    'R-004',
    ehCanalDaRegra ? 'BLOQUEIO' : 'ALERTA',
    `Peca publica escrita em portugues, e o idioma definido para ${canaisDaRegra.join(', ')} e ingles.`,
    `Traduza. A decisao e de ${decidido}.` +
      (justificativa ? ` Justificativa registrada: ${justificativa}` : '') +
      ' A contra-hipotese esta aberta: medir por praca (Mexico e Argentina separados) e reabrir com dado, ' +
      'nunca por argumento. Enquanto o YAML disser en, peca publica sai em ingles.',
    { padrao: 'idioma-publico', marcadores_pt: pt, marcadores_en: en, esperado: 'en' }
  );
}
