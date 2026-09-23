/**
 * R-001 — Elegibilidade e RQE. BLOQUEIO.
 *
 * O gate do Plasticflix Prime nao e preferencia de comunicacao: curso de
 * cadaver e cirurgia ao vivo aberto a generalista e risco declarado de
 * represalia de sociedade medica — e sociedade medica e justamente o canal de
 * mailing e de desconto deste projeto. Convidar errado queima o canal.
 *
 * Duas coisas sao vetadas aqui:
 *   1. Convite a publico nao elegivel, inclusive por parafrase. "Aberto a todos
 *      os medicos" nao cita generalista e convida generalista do mesmo jeito.
 *   2. Promessa de inscricao imediata sem passar pela conferencia de RQE ou de
 *      comprovacao de residencia.
 *
 * Le a lista de permitidos e proibidos de data/publico.yaml. Se o cliente mudar
 * o criterio de entrada, muda no YAML e esta regra acompanha.
 */
import { achado, normalizar, canalDe, CANAIS_PUBLICOS } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

// Parafrases de abertura de publico. Em portugues e em ingles, porque a peca
// publica deste projeto sai em ingles.
const CONVITE_ABERTO = [
  'aberto a todos os medicos',
  'aberto a todos os profissionais',
  'aberto a todos',
  'para todos os medicos',
  'qualquer profissional da area',
  'qualquer profissional da saude',
  'qualquer medico',
  'todo medico pode',
  'nao precisa ser especialista',
  'sem pre-requisito',
  'sem prerequisito',
  'sem requisito',
  'open to all physicians',
  'open to all doctors',
  'open to all',
  'any physician',
  'any doctor',
  'any healthcare professional',
  'no prerequisites',
  'no prerequisite',
  'all medical professionals are welcome',
];

// Especialidades que o gate exclui, quando citadas como publico convidado.
const PUBLICO_PROIBIDO = [
  'clinico geral',
  'medico generalista',
  'generalista',
  'general practitioner',
  'esteticista',
  'biomedico',
  'dentista',
  'enfermeir',
];

// Promessa de inscricao sem gate.
const INSCRICAO_IMEDIATA = [
  'inscricao imediata',
  'garanta sua vaga agora',
  'garanta ja a sua vaga',
  'basta se inscrever',
  'inscreva-se em 1 minuto',
  'inscricao sem burocracia',
  'sem analise de cadastro',
  'instant enrollment',
  'enroll now, no questions asked',
  'secure your seat instantly',
  'sign up in one click',
  'no approval needed',
];

// Sinais de que o gate esta presente na peca.
const MENCIONA_GATE = /\b(rqe|residencia|resid[êe]ncia|residency|board[- ]certified|especialista|specialist|cirurgi[ãa]o pl[áa]stico|plastic surgeon|otorrino|ent surgeon|otolaryngolog)/iu;

export default function elegibilidade(texto, contexto = {}) {
  const achados = [];
  const original = String(texto ?? '');
  const alvo = normalizar(original);
  const canal = canalDe(contexto);

  const publico = carregarYaml('publico');
  const permitidos = (publico?.elegibilidade?.permitidos ?? []).map((p) => p.titulo).filter(Boolean);
  const proibidosYaml = publico?.elegibilidade?.proibidos ?? [];

  // 1. Convite aberto a qualquer um.
  const convites = CONVITE_ABERTO.filter((t) => alvo.includes(normalizar(t)));
  if (convites.length > 0) {
    achados.push(
      achado(
        'R-001',
        'BLOQUEIO',
        `A peca abre o publico para alem do gate de elegibilidade: "${convites.join('", "')}".`,
        `O Prime aceita apenas ${permitidos.join(', ')}. Reescreva nomeando o publico elegivel. ` +
          'Convite aberto e risco de represalia de sociedade medica — e sociedade e o canal de mailing deste projeto.',
        { padrao: 'convite-aberto', termos: convites, permitidos }
      )
    );
  }

  // 2. Publico explicitamente proibido sendo convidado.
  const proibidos = PUBLICO_PROIBIDO.filter((t) => alvo.includes(normalizar(t)));
  if (proibidos.length > 0) {
    // "generalista" so acusa quando esta em posicao de convite, nao quando a
    // peca diz que generalista NAO entra.
    const negado = /\b(nao|n[ãa]o|exclusivamente|apenas|somente|only|not open|restrito|restricted)\b[^.]{0,80}$/iu.test(
      alvo.slice(0, alvo.indexOf(normalizar(proibidos[0])) + 1)
    );
    if (!negado) {
      achados.push(
        achado(
          'R-001',
          'BLOQUEIO',
          `A peca cita publico nao elegivel como convidado: "${proibidos.join('", "')}".`,
          `Publico proibido, conforme data/publico.yaml: ${proibidosYaml.join('; ')}. ` +
            'Se a mencao existe para EXCLUIR esse publico, deixe a negacao explicita na mesma frase.',
          { padrao: 'publico-proibido', termos: proibidos }
        )
      );
    }
  }

  // 3. Promessa de inscricao sem conferencia.
  const imediatas = INSCRICAO_IMEDIATA.filter((t) => alvo.includes(normalizar(t)));
  if (imediatas.length > 0 && !MENCIONA_GATE.test(original)) {
    achados.push(
      achado(
        'R-001',
        'BLOQUEIO',
        `A peca promete inscricao sem conferencia de credencial: "${imediatas[0]}".`,
        'A equipe comercial confere RQE ou comprovacao de residencia ANTES de efetivar qualquer inscricao. ' +
          'Reescreva o CTA como solicitacao de vaga, nao como inscricao concluida.',
        { padrao: 'inscricao-sem-gate', termos: imediatas }
      )
    );
  }

  // 4. Fluxo declarado sem o gate. Vale para peca de WhatsApp e para descricao
  //    de fluxo comercial, onde o gate deveria estar escrito.
  if (contexto.fluxo === 'inscricao' && contexto.gate_rqe !== true) {
    achados.push(
      achado(
        'R-001',
        'BLOQUEIO',
        'O fluxo declarado e de inscricao e o contexto nao confirma a checagem de RQE ou residencia.',
        'Passe contexto.gate_rqe true so quando a etapa de qualificacao existir de fato no fluxo. ' +
          'No WhatsApp, a pergunta de credencial vem antes da proposta.',
        { padrao: 'fluxo-sem-gate' }
      )
    );
  }

  // Peca publica que convida para o lab sem nomear o publico elegivel: alerta,
  // nao veto. Nem todo criativo precisa carregar a regra inteira, mas a LP sim.
  if (CANAIS_PUBLICOS.has(canal) && canal === 'landing_page' && !MENCIONA_GATE.test(original)) {
    achados.push(
      achado(
        'R-001',
        'ALERTA',
        'A landing page nao deixa visivel quem pode se inscrever.',
        `Traga o gate para a pagina: ${permitidos.join(', ')}, com conferencia de RQE ou residencia. ` +
          'Isso filtra lead desqualificado antes de chegar no comercial.',
        { padrao: 'lp-sem-gate-visivel' }
      )
    );
  }

  return achados;
}
