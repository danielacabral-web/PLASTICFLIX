/**
 * status_lacunas — o que trava, o que segue mesmo assim, e o pedido pronto.
 *
 * Tres decisoes herdadas da revisao do repo aexpi, que valem aqui:
 *
 * 1. O padrao e o modo barato (so as bloqueantes). O agente que nao sabe chama
 *    sem argumento, entao o default nao pode ser o payload caro.
 * 2. A tool GERA a mensagem de cobranca em vez de instruir o agente a gerar.
 *    Instrucao em prosa produz cinco versoes diferentes da mesma cobranca.
 * 3. Lacuna interna da Stark sai separada do pedido ao cliente. Cobrar o
 *    cliente por pendencia que e nossa e o erro mais constrangedor possivel.
 */
import { carregarYaml } from '../data/carregar.js';

/** Situacoes que sao acao interna da Stark, nao pedido ao cliente. */
const INTERNAS = new Set(['pendente_interno', 'acao_interna_urgente', 'decisao_interna']);

function redigirPedido(lacunas) {
  const paraOCliente = lacunas.filter(
    (l) => !INTERNAS.has(l.situacao) && l.pedido_ao_cliente && !/^\s*Nada/i.test(l.pedido_ao_cliente)
  );

  if (paraOCliente.length === 0) {
    return {
      ha_o_que_pedir: false,
      nota: 'Nenhuma pendencia atual depende do cliente. As abertas sao acao interna da Stark.',
    };
  }

  const itens = paraOCliente.map((l, i) => `${i + 1}. ${String(l.pedido_ao_cliente).trim().replace(/\s+/g, ' ')}`);

  return {
    ha_o_que_pedir: true,
    quantidade: paraOCliente.length,
    ids: paraOCliente.map((l) => l.id),
    rascunho:
      'Pessoal, para seguirmos com as entregas precisamos de alguns itens. Reunimos todos aqui para facilitar:\n\n' +
      itens.join('\n\n') +
      '\n\nQualquer um que ja esteja pronto pode vir por aqui mesmo. Seguimos com o que nao depende desses pontos.',
    instrucoes: [
      'Envie de uma vez so. Pedido pingado se perde.',
      'Itens de acao interna da Stark foram omitidos de proposito — nao sao pedido ao cliente.',
      'Diga junto o que segue mesmo assim. Cobranca sem isso soa como projeto parado.',
    ],
  };
}

export default async function statusLacunas(args = {}) {
  const { levantamento, fonte, lacunas } = carregarYaml('lacunas');

  const completo = args.completo === true;
  const selecionadas = completo ? lacunas : lacunas.filter((l) => l.bloqueante);

  const bloqueantes = lacunas.filter((l) => l.bloqueante);
  const internas = lacunas.filter((l) => INTERNAS.has(l.situacao));

  return {
    fonte,
    levantamento,
    total: lacunas.length,
    bloqueantes: bloqueantes.length,
    modo: completo ? 'completo' : 'apenas_bloqueantes (padrao)',
    ...(completo
      ? {}
      : {
          nota_de_modo:
            `Mostrando as ${bloqueantes.length} bloqueantes de ${lacunas.length}. ` +
            'Para o quadro completo, chame com completo: true — custa mais contexto.',
        }),

    lacunas: selecionadas.map((l) => ({
      id: l.id,
      titulo: l.titulo,
      situacao: l.situacao,
      bloqueante: l.bloqueante,
      depende_do_cliente: !INTERNAS.has(l.situacao),
      evidencia: l.evidencia,
      bloqueia: l.bloqueia,
      segue_mesmo_assim: l.segue_mesmo_assim,
      pedido_ao_cliente: l.pedido_ao_cliente,
    })),

    acao_interna: internas.map((l) => ({
      id: l.id,
      titulo: l.titulo,
      bloqueante: l.bloqueante,
      o_que_fazer: l.pedido_ao_cliente,
    })),

    pedido_agrupado: redigirPedido(lacunas),

    instrucoes: [
      'Ao relatar uma lacuna, diga sempre o que segue mesmo assim. A lista existe para destravar trabalho, nao para justificar parada.',
      'Nunca preencha dado ausente com estimativa. Se a entrega depende dele, devolva BLOQUEADO nomeando o id.',
      'Confira acao_interna antes de cobrar o cliente — ha pendencia bloqueante que e so nossa.',
    ],

    proximo_passo: internas.some((l) => l.bloqueante)
      ? 'Ha lacuna BLOQUEANTE que e acao interna da Stark. Feche essa primeiro: nao depende de ninguem de fora.'
      : 'Use pedido_agrupado.rascunho para cobrar o cliente numa unica mensagem.',
  };
}
