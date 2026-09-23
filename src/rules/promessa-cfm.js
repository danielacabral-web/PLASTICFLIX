/**
 * R-006 — Promessa e CFM. BLOQUEIO.
 *
 * O aluno deste evento e medico, nao paciente. Isso muda o que e arriscado:
 * nao se trata de publicidade de procedimento, e sim de prometer formacao,
 * dominio de tecnica ou retorno financeiro a um par — que e o tipo de promessa
 * que uma sociedade medica cobra, e que o proprio posicionamento cientifico do
 * cliente nao sustenta.
 *
 * Tres familias caem aqui:
 *   1. Promessa de resultado ou de dominio de tecnica ao medico-aluno.
 *   2. Promessa de retorno financeiro ("aumente seu faturamento").
 *   3. Superlativo sem lastro ("o melhor curso", "unico no mundo").
 *
 * A comunicacao autorizada e em chave de tecnica, supervisao e atualizacao.
 */
import { achado, normalizar } from './_util.js';

const PROMESSA_DE_RESULTADO = [
  'resultado garantido',
  'garantia de resultado',
  'resultados garantidos',
  'sem complicacoes',
  'sem intercorrencias',
  'zero complicacoes',
  'risco zero',
  'sem risco',
  'guaranteed results',
  'zero complications',
  'risk-free',
  'no complications',
];

const PROMESSA_DE_DOMINIO = [
  'dominio da tecnica',
  'domine a tecnica',
  'domine a rinoplastia',
  'saia operando',
  'saia dominando',
  'voce vai dominar',
  'formacao completa em uma semana',
  'torne-se especialista em',
  'vire referencia em',
  'master the technique',
  'you will master',
  'become an expert in one week',
  'walk out operating',
  'full mastery',
];

const PROMESSA_FINANCEIRA = [
  'aumente seu faturamento',
  'dobre seu faturamento',
  'aumente seus ganhos',
  'retorno garantido',
  'roi garantido',
  'pague o curso com',
  'se paga em',
  'lucre mais',
  'double your revenue',
  'increase your revenue',
  'guaranteed roi',
  'pays for itself',
  'boost your income',
];

const SUPERLATIVO_SEM_LASTRO = [
  'o melhor curso',
  'o melhor do mundo',
  'a melhor formacao',
  'unico no mundo',
  'unico do pais',
  'o maior evento de',
  'o mais completo do mundo',
  'referencia mundial absoluta',
  'incomparavel',
  'sem igual',
  'the best course',
  'the best in the world',
  'the only one in the world',
  'the largest event',
  'unmatched',
  'unrivaled',
  'world-class leader',
];

// Sinais de que ha lastro citado junto ao superlativo. Nao basta existir: e
// preciso estar na mesma peca.
const TEM_LASTRO = /\b(segundo|conforme|de acordo com|according to|source:|fonte:|dados de|ranking|edicao|5[oº]\s*epis[oó]dio)\b/iu;

export default function promessaCfm(texto, contexto = {}) {
  const achados = [];
  const original = String(texto ?? '');
  const alvo = normalizar(original);

  const bloquear = (padrao, lista, detalhe, acao) => {
    const encontrados = lista.filter((t) => alvo.includes(normalizar(t)));
    if (encontrados.length > 0) {
      achados.push(
        achado('R-006', 'BLOQUEIO', `${detalhe}: "${encontrados.join('", "')}".`, acao, {
          padrao,
          termos: encontrados,
        })
      );
    }
  };

  bloquear(
    'promessa-de-resultado',
    PROMESSA_DE_RESULTADO,
    'Promete resultado cirurgico ou ausencia de complicacao',
    'Retire. Nenhum curso responde pelo resultado da cirurgia de quem assistiu. ' +
      'Fale de tecnica, de supervisao e de atualizacao — que e o que o Prime entrega de fato.'
  );

  bloquear(
    'promessa-de-dominio',
    PROMESSA_DE_DOMINIO,
    'Promete dominio de tecnica ao medico-aluno',
    'Reescreva. Uma semana de teoria, lab e observacao nao forma nem certifica ninguem. ' +
      'O que a peca pode afirmar e a proporcao de supervisao (1 aluno por peca na Rino, 2 na Face), ' +
      'o corpo docente e o encadeamento teoria-anatomia-cirurgia.'
  );

  bloquear(
    'promessa-financeira',
    PROMESSA_FINANCEIRA,
    'Promete retorno financeiro ao medico-aluno',
    'Retire. O objetivo declarado do cliente e posicionamento cientifico, nao argumento de faturamento — ' +
      'e promessa de retorno num curso de R$ 20 a 60 mil e exatamente o que uma sociedade medica cobra.'
  );

  const superlativos = SUPERLATIVO_SEM_LASTRO.filter((t) => alvo.includes(normalizar(t)));
  if (superlativos.length > 0 && !TEM_LASTRO.test(original)) {
    achados.push(
      achado(
        'R-006',
        'BLOQUEIO',
        `Usa superlativo sem lastro: "${superlativos.join('", "')}".`,
        'Troque por fato verificavel. O Prime tem tres provas reais e nenhuma delas precisa de superlativo: ' +
          'proporcao de supervisao por peca, corpo docente internacional e semana encadeada. ' +
          'Se o superlativo tiver fonte, cite a fonte na mesma peca.',
        { padrao: 'superlativo-sem-lastro', termos: superlativos }
      )
    );
  }

  // Certificado ou titulo prometido: alerta. Pode existir, mas precisa de
  // confirmacao do cliente — o kickoff nao falou de certificacao.
  if (/\b(certificad|certificat|titulo de especialista|board certification)\w*/iu.test(alvo)) {
    achados.push(
      achado(
        'R-006',
        'ALERTA',
        'A peca menciona certificado ou titulo.',
        'O kickoff nao tratou de certificacao. Confirme com a Gislaine o que exatamente e emitido ' +
          'antes de publicar — e nunca sugira titulo de especialista.',
        { padrao: 'certificacao-nao-confirmada' }
      )
    );
  }

  return achados;
}
