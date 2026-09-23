/**
 * planejar_demandas — o backlog do projeto, por frente, com dono e dependencia.
 *
 * Duas decisoes de desenho:
 *
 * 1. O modo padrao e `resumo`, nao `clickup`. O payload de criacao custa varias
 *    vezes mais contexto e so serve na hora de lancar. O agente que nao sabe
 *    chama sem argumento, entao o padrao tem de ser o barato.
 *
 * 2. O que depende do cliente sai separado, como bloqueio nomeado — nunca
 *    misturado com tarefa da Stark. Misturar tem um efeito especifico e ruim:
 *    no dia da cobranca, a conversa vira sobre quem falhou em vez de sobre o
 *    que falta.
 */
import { carregarYaml } from '../data/carregar.js';

/** Demandas cujo dono esta do lado do cliente. */
const DONOS_DO_CLIENTE = ['Mara', 'Fran', 'Cliente', 'Cenacon', 'Clinica Mattioli', 'Grupo', 'Comercial', 'Diretoria'];

function ehDoCliente(dono) {
  if (!dono) return false;
  return DONOS_DO_CLIENTE.some((d) => String(dono).toLowerCase().includes(d.toLowerCase()));
}

/** A ordem que importa — tres demandas destravam as outras. */
const DESTRAVAM = {
  titulo: 'As tres que destravam o resto',
  itens: [
    'A planilha dos 22 leads sai da Mara para a Fran — e a unica acao que pode gerar receita nesta semana.',
    'As duas landing pages sobem — sem elas, trafego e conteudo nao tem para onde apontar.',
    'As listas de ex-alunos chegam — servem a dois usos ao mesmo tempo: exclusao em campanha e oferta de recompra.',
  ],
  nota: 'O resto roda em paralelo. Essa ordem nao muda porque a agenda ficou cheia.',
};

function montarPayloadClickUp(frentes, demandas, perfil) {
  const porFrente = new Map();
  for (const d of demandas) {
    if (!porFrente.has(d.frente)) porFrente.set(d.frente, []);
    porFrente.get(d.frente).push(d);
  }

  return {
    destino: perfil.clickup?.space_ou_folder || null,
    destino_nota:
      perfil.clickup?.space_ou_folder === null
        ? 'BLOQUEADO: o Space/Folder ainda nao foi decidido. O payload esta pronto, mas nao ha onde criar. ' +
          'E acao interna da Stark, nao pendencia do cliente.'
        : null,

    task_mae: {
      nome: 'Plasticflix Prime',
      descricao:
        'Projeto do congresso Plasticflix Prime — rinoplastia e face, Instituto Quirontec, Sao Paulo. ' +
        'Cinco frentes. A documentacao do projeto e servida pela tool documentacao do MCP plasticflix.',
    },

    frentes: frentes.map((f) => ({
      nome: `${f.id} · ${f.nome}`,
      assignee: f.dono,
      descricao: [
        `Objetivo: ${f.objetivo}`,
        '',
        'Entregas:',
        ...(f.entregas || []).map((e) => `- ${e}`),
        '',
        `Criterio de pronto: ${f.criterio_de_pronto}`,
        ...(f.depende_de ? ['', `Depende de: ${f.depende_de}`] : []),
      ].join('\n'),

      subtasks: (porFrente.get(f.id) || []).map((d) => ({
        nome: d.titulo,
        assignee: d.dono,
        // Conteudo integral na descricao, nao link para outro lugar. Quem
        // executa abre a task e encontra o que precisa.
        descricao: [
          d.descricao,
          '',
          `Dono: ${d.dono}`,
          `Frente: ${d.frente}`,
          ...(d.dependencia ? [`Depende de: ${d.dependencia}`] : []),
          ...(d.bloqueante ? ['', 'BLOQUEANTE — trava outras entregas.'] : []),
          ...(ehDoCliente(d.dono)
            ? ['', 'Esta demanda e do CLIENTE. Entra como bloqueio acompanhado, nao como tarefa da Stark.']
            : []),
        ].join('\n'),
        tags: [d.frente, ...(d.bloqueante ? ['bloqueante'] : []), ...(ehDoCliente(d.dono) ? ['cliente'] : [])],
      })),
    })),

    instrucoes: [
      'Uma peca e uma subtask. Agrupar cinco pecas numa task so parece organizado ate alguem precisar saber o que ja saiu.',
      'A descricao leva o conteudo integral, nao um link para outro lugar.',
      'Confira o estado do destino com um GET antes de criar — nao crie em cima do que ja existe.',
    ],
  };
}

export default async function planejarDemandas(args = {}) {
  const { frentes } = carregarYaml('frentes');
  const { demandas, total } = carregarYaml('demandas');
  const perfil = carregarYaml('perfil-plasticflix');

  const filtroFrente = args.frente && args.frente !== 'todas' ? args.frente : null;
  const filtroDono = args.dono ? String(args.dono).toLowerCase() : null;

  let selecionadas = demandas;
  if (filtroFrente) selecionadas = selecionadas.filter((d) => d.frente === filtroFrente);
  if (filtroDono) selecionadas = selecionadas.filter((d) => String(d.dono).toLowerCase().includes(filtroDono));

  const frentesSelecionadas = filtroFrente ? frentes.filter((f) => f.id === filtroFrente) : frentes;

  if (selecionadas.length === 0) {
    return {
      total_no_projeto: total,
      encontradas: 0,
      filtros: { frente: args.frente || 'todas', dono: args.dono || null },
      nota: 'Nenhuma demanda bate com esses filtros. Frentes validas: F1 a F5.',
      donos_conhecidos: [...new Set(demandas.map((d) => d.dono))],
    };
  }

  if (args.formato === 'clickup') {
    return {
      modo: 'clickup',
      total_no_projeto: total,
      payload: montarPayloadClickUp(frentesSelecionadas, selecionadas, perfil),
    };
  }

  const daStark = selecionadas.filter((d) => !ehDoCliente(d.dono));
  const doCliente = selecionadas.filter((d) => ehDoCliente(d.dono));

  return {
    modo: 'resumo',
    total_no_projeto: total,
    encontradas: selecionadas.length,
    filtros: { frente: args.frente || 'todas', dono: args.dono || null },

    frentes: frentesSelecionadas.map((f) => ({
      id: f.id,
      nome: f.nome,
      dono: f.dono,
      objetivo: f.objetivo,
      criterio_de_pronto: f.criterio_de_pronto,
      demandas: selecionadas.filter((d) => d.frente === f.id).length,
    })),

    demandas_da_stark: daStark.map((d) => ({
      id: d.id,
      titulo: d.titulo,
      dono: d.dono,
      frente: d.frente,
      bloqueante: d.bloqueante,
      dependencia: d.dependencia,
    })),

    // Separado de proposito. Ver o comentario do topo.
    bloqueios_do_cliente: doCliente.map((d) => ({
      id: d.id,
      titulo: d.titulo,
      dono: d.dono,
      frente: d.frente,
      bloqueante: d.bloqueante,
      o_que_trava: d.dependencia || 'ver data/lacunas.yaml',
    })),

    ordem: DESTRAVAM,

    nota_de_modo:
      args.formato === 'clickup'
        ? null
        : 'Para o payload de criacao no ClickUp — hierarquia, nomes e descricoes prontas — chame com formato: "clickup".',

    proximo_passo:
      doCliente.length > 0
        ? `${doCliente.length} demanda(s) dependem do cliente. Chame status_lacunas para o pedido agrupado numa unica mensagem.`
        : 'Todas as demandas filtradas sao da Stark. Siga para calendario_projeto para datar.',
  };
}
