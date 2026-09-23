/**
 * R-002 — Sem transmissao de cirurgia. BLOQUEIO.
 *
 * Decisao fechada no kickoff: nao ha transmissao das cirurgias para o
 * anfiteatro nem para lugar nenhum. Custo aproximado de R$ 100 mil, risco de
 * superlotacao com nao pagantes e problema de organizacao.
 *
 * O que existe e presencial e contado: 4 observadores por cirurgiao operante.
 * Prometer qualquer coisa alem disso cria uma expectativa que o evento nao pode
 * cumprir — e o cliente ja disse nao.
 *
 * Le a decisao de data/perfil-plasticflix.yaml. Se um dia a transmissao for
 * contratada, o campo evento.transmissao_de_cirurgia.permitida vira true e esta
 * regra para de bloquear sozinha.
 */
import { achado, normalizar } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

const PROMESSA_DE_TRANSMISSAO = [
  'transmissao ao vivo da cirurgia',
  'transmissao da cirurgia',
  'cirurgia transmitida',
  'transmitida ao vivo',
  'transmissao para o anfiteatro',
  'assista de onde estiver',
  'assista de qualquer lugar',
  'assista online',
  'acompanhe online',
  'acompanhe a distancia',
  'sala de transmissao',
  'telao',
  'streaming da cirurgia',
  'live surgery streaming',
  'live streaming',
  'watch from anywhere',
  'watch it live online',
  'watch online',
  'broadcast of the surgery',
  'surgery broadcast',
  'livestream',
  'remote access to the surgery',
  'attend remotely',
  'virtual attendance',
];

// Coocorrencia: "ao vivo" + verbo de assistir a distancia entrega a mesma
// promessa sem usar nenhuma das expressoes acima.
const VERBO_DE_ASSISTIR = ['assistir', 'assista', 'ver de casa', 'de casa', 'watch', 'stream', 'online', 'remoto', 'remote'];
const A_DISTANCIA = ['de onde estiver', 'de qualquer lugar', 'online', 'a distancia', 'remotamente', 'from anywhere', 'from home', 'remotely'];

export default function transmissaoCirurgia(texto, contexto = {}) {
  const perfil = carregarYaml('perfil-plasticflix');
  const decisao = perfil?.evento?.transmissao_de_cirurgia ?? {};

  // O fato mora no YAML. Se a transmissao for contratada um dia, a regra
  // desliga sozinha — nao ha veto hardcoded aqui.
  if (decisao.permitida === true) return null;

  const original = String(texto ?? '');
  const alvo = normalizar(original);

  const mencionaCirurgia = /\b(cirurgia|operacao|live surgery|surgery|surgical)\b/iu.test(alvo);
  if (!mencionaCirurgia) return null;

  const diretos = PROMESSA_DE_TRANSMISSAO.filter((t) => alvo.includes(normalizar(t)));
  if (diretos.length > 0) {
    return achado(
      'R-002',
      'BLOQUEIO',
      `A peca promete transmissao ou acesso remoto a cirurgia: "${diretos.join('", "')}".`,
      'Retire. Nao ha transmissao — decisao fechada do cliente. ' +
        (decisao.motivo ? `Motivo registrado: ${String(decisao.motivo).trim()} ` : '') +
        'O que existe e presencial e contado: 4 observadores por cirurgiao operante, no dia 07/03.',
      { padrao: 'promessa-de-transmissao', termos: diretos }
    );
  }

  const assistir = VERBO_DE_ASSISTIR.filter((t) => alvo.includes(normalizar(t)));
  const distancia = A_DISTANCIA.filter((t) => alvo.includes(normalizar(t)));
  if (assistir.length > 0 && distancia.length > 0) {
    return achado(
      'R-002',
      'BLOQUEIO',
      `A peca associa assistir a cirurgia a estar longe ("${assistir[0]}" + "${distancia[0]}"), o que promete transmissao por parafrase.`,
      'Reescreva. A cirurgia ao vivo e presencial, com 4 observadores por cirurgiao operante. ' +
        'Nao ha formulacao segura que sugira acompanhar a distancia.',
      { padrao: 'transmissao-por-parafrase', termos: [...assistir, ...distancia] }
    );
  }

  // Vaga alem do contado tambem e promessa que o evento nao cumpre.
  if (/\b(vagas?\s+ilimitadas|unlimited seats|todos os inscritos podem assistir|all attendees can watch)\b/iu.test(alvo)) {
    return achado(
      'R-002',
      'BLOQUEIO',
      'A peca sugere acesso ilimitado a cirurgia ao vivo.',
      'O acesso e de 4 observadores por cirurgiao operante. Qualquer numero acima disso nao existe.',
      { padrao: 'vaga-ilimitada' }
    );
  }

  return null;
}
