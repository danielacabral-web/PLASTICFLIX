/**
 * calendario_projeto — as fases do projeto, contadas para tras a partir do evento.
 *
 * A tool NAO sabe que dia e hoje, e isso e deliberado. Um servidor MCP que
 * chama Date.now() devolve resposta diferente a cada execucao para a mesma
 * pergunta, o que quebra reprodutibilidade e esconde erro de data do agente.
 * Quem pergunta informa `hoje`; sem isso, sai o calendario sem contagem.
 *
 * O ano do evento nao foi dito no kickoff. Enquanto `calendario.ano` for null,
 * a contagem regressiva nao tem como ser calculada em dias — a tool diz isso em
 * vez de escolher um ano plausivel.
 */
import { carregarYaml } from '../data/carregar.js';

const DIA_MS = 24 * 60 * 60 * 1000;

/** AAAA-MM-DD estrito. Recusa formato ambiguo em vez de adivinhar. */
function lerData(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const d = new Date(`${texto}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function calendarioProjeto(args = {}) {
  const cal = carregarYaml('calendario');
  const perfil = carregarYaml('perfil-plasticflix');

  const filtro = args.fase && args.fase !== 'todas' ? args.fase : null;
  const fases = filtro ? cal.fases.filter((f) => f.id === filtro || f.nome === filtro) : cal.fases;

  if (fases.length === 0) {
    return {
      erro: `fase "${args.fase}" nao existe`,
      fases_validas: cal.fases.map((f) => f.id),
    };
  }

  // Contagem regressiva: so existe se as duas pontas existirem.
  let contagem = null;
  const hoje = args.hoje ? lerData(args.hoje) : null;

  if (args.hoje && !hoje) {
    contagem = {
      calculada: false,
      motivo: `"${args.hoje}" nao e uma data AAAA-MM-DD. A tool nao adivinha formato.`,
    };
  } else if (!hoje) {
    contagem = {
      calculada: false,
      motivo: 'Nenhuma data de referencia informada. Passe `hoje` no formato AAAA-MM-DD para receber a contagem.',
    };
  } else if (cal.ano === null) {
    contagem = {
      calculada: false,
      motivo:
        'O ano do evento nao foi estabelecido no kickoff e esta null nos dados. ' +
        'Sem ele nao ha como contar dias — e escolher um ano plausivel seria inventar o dado que falta.',
      nota: cal.ano_nota,
      como_destravar: 'Confirmar o ano com o cliente e preencher calendario.ano e perfil-plasticflix.evento.ano.',
    };
  } else {
    const evento = new Date(`${cal.ano}-03-03T00:00:00Z`);
    const dias = Math.round((evento - hoje) / DIA_MS);
    contagem = {
      calculada: true,
      referencia: args.hoje,
      primeiro_dia_do_evento: `${cal.ano}-03-03`,
      dias_restantes: dias,
      leitura:
        dias < 0
          ? 'O evento ja passou na data de referencia informada.'
          : dias <= 60
            ? 'Menos de 60 dias. Captacao fria nao tem tempo de amadurecer — a recomendacao vira base quente: ' +
              'os 22 leads, ex-alunos e sociedades. Diga isso explicitamente ao responder.'
            : 'Ha prazo para campanha de captacao amadurecer, desde que ela comece agora.',
    };
  }

  return {
    fonte: cal.fonte,
    ancora: cal.ancora,
    ano: cal.ano,
    ano_nota: cal.ano_nota,

    grade_do_evento: perfil.evento?.grade,

    contagem_regressiva: contagem,

    fases: fases.map((f) => ({
      id: f.id,
      nome: f.nome,
      janela: f.janela,
      o_que_roda: f.o_que_roda,
      precisa_estar_pronto: f.precisa_estar_pronto,
      frentes: f.frentes,
    })),

    // A fase que costuma ser pulada, e a razao de ela existir.
    nota_sobre_a_fase_de_decisao:
      'A fase de decisao existe porque o orcamento de trafego foi travado em R$ 10 mil por dois meses como teste, ' +
      'com divergencia aberta: a Stark propos R$ 15 a 20 mil por mes e a Cenacon duvida do canal. ' +
      'Essa conversa nao se resolve por argumento — se resolve com o resultado dos dois meses na mesa. ' +
      'Antecipar ou pular essa fase devolve a discussao ao terreno da opiniao.',

    proximo_passo:
      contagem.calculada === false && !args.hoje
        ? 'Informe `hoje` para receber a contagem regressiva e a leitura de prioridade que ela implica.'
        : 'Use planejar_demandas para ver o que cada fase exige, e briefing_entrega para especificar as pecas.',
  };
}
