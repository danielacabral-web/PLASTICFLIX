/**
 * R-004 — Idioma da peca publica. BLOQUEIO em canal publico, ALERTA nos diretos.
 *
 * A regra e SIMETRICA: detecta o idioma do texto e compara com o idioma
 * vigente em data/comunicacao.yaml, seja ele qual for.
 *
 * A primeira versao nao era. Ela so sabia responder a uma pergunta — "este
 * texto esta em portugues quando deveria estar em ingles?" — e comecava com
 * `if (idiomaPublico !== 'en') return null`. Quando a decisao do idioma foi
 * revertida para portugues em 24/09/2026, a regra parou de bloquear portugues
 * (correto) mas tambem parou de bloquear QUALQUER COISA: uma peca em ingles
 * passava com APROVADO.
 *
 * Isso e pior que reprovar errado. Uma regra inerte da a impressao de que a
 * peca foi checada. O dado mudou como o desenho previa, mas a regra so cobria
 * metade do espaco de decisao — e meia regra nao se percebe sozinha.
 *
 * As excecoes seguem vindo do YAML: WhatsApp fala a lingua do lead e material
 * interno e em portugues. La e alerta, nunca veto.
 */
import { achado, normalizar, canalDe, CANAIS_DIRETOS, palavras } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

// Marcadores funcionais. Palavra de conteudo nao serve: "lab" e "face" existem
// nas duas linguas.
const MARCADORES = {
  pt: [
    'que', 'para', 'com', 'nao', 'uma', 'dos', 'das', 'pelo', 'pela', 'mais',
    'voce', 'sua', 'seu', 'sobre', 'como', 'nossa', 'nosso', 'sera', 'esta',
    'aulas', 'vagas', 'inscricao', 'inscricoes', 'cirurgiao', 'cirurgiões',
    'cirurgioes', 'teorica', 'teoricas', 'ao', 'da', 'do', 'na', 'no', 'em',
  ],
  en: [
    'the', 'and', 'with', 'you', 'your', 'our', 'for', 'this', 'will', 'from',
    'seats', 'registration', 'surgeon', 'surgeons', 'week', 'live', 'about',
    'of', 'to', 'in', 'on', 'at', 'is', 'are',
  ],
};

/** Reduz "pt-BR" a "pt", "en-US" a "en". */
function base(codigo) {
  return normalizar(codigo).split('-')[0];
}

function contar(texto, lista) {
  const tokens = new Set(palavras(normalizar(texto)));
  return lista.filter((m) => tokens.has(m)).length;
}

/**
 * Idioma detectado, ou null quando nao ha sinal claro.
 * Exige dois marcadores e maioria — texto curto ou bilingue nao cai por acidente.
 */
function detectar(texto) {
  const pt = contar(texto, MARCADORES.pt);
  const en = contar(texto, MARCADORES.en);
  if (pt >= 2 && pt > en) return { idioma: 'pt', pt, en };
  if (en >= 2 && en > pt) return { idioma: 'en', pt, en };
  return { idioma: null, pt, en };
}

const NOME = { pt: 'portugues', en: 'ingles' };

export default function idioma(texto, contexto = {}) {
  const comunicacao = carregarYaml('comunicacao');
  const esperado = base(comunicacao?.idioma?.publico ?? '');
  if (!esperado) return null;

  const canaisDaRegra = (comunicacao?.idioma?.aplica_a ?? []).map((c) => normalizar(c));
  const canal = canalDe(contexto);

  // O contexto pode declarar outro idioma de proposito (peca de teste, material
  // de time). Se o que foi pedido nao e o publico, a regra nao tem o que dizer.
  const pedido = contexto.idioma ? base(contexto.idioma) : esperado;
  if (pedido !== esperado) return null;

  const original = String(texto ?? '');
  if (palavras(original).length < 6) return null;

  const { idioma: detectado, pt, en } = detectar(original);
  if (!detectado || detectado === esperado) return null;

  const decidido = comunicacao?.idioma?.decidido_por ?? 'a Stark';
  const em = comunicacao?.idioma?.decidido_em ? ` em ${comunicacao.idioma.decidido_em}` : '';

  if (CANAIS_DIRETOS.has(canal)) {
    return achado(
      'R-004',
      'ALERTA',
      `Peca em ${NOME[detectado]} no canal "${canal}", que tem excecao declarada de idioma.`,
      'WhatsApp fala a lingua do lead e material interno e em portugues, entao isso esta provavelmente certo. ' +
        'Confira apenas se a peca nao vai virar post ou anuncio depois.',
      { padrao: 'idioma-em-canal-direto', detectado, esperado, marcadores_pt: pt, marcadores_en: en }
    );
  }

  const ehCanalDaRegra = canaisDaRegra.includes(canal) || canaisDaRegra.length === 0 || !canal;

  return achado(
    'R-004',
    ehCanalDaRegra ? 'BLOQUEIO' : 'ALERTA',
    `Peca publica escrita em ${NOME[detectado]}, e o idioma vigente para ${canaisDaRegra.join(', ') || 'peca publica'} e ${NOME[esperado] ?? esperado}.`,
    `Reescreva em ${NOME[esperado] ?? esperado}. A decisao vigente e de ${decidido}${em}. ` +
      'O historico das decisoes de idioma esta em data/comunicacao.yaml — se a regra parecer errada, ' +
      'o conserto e mudar o dado, nunca relaxar a regra.',
    { padrao: 'idioma-publico', detectado, esperado, marcadores_pt: pt, marcadores_en: en }
  );
}
