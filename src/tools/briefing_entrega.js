/**
 * briefing_entrega — a especificacao de uma peca, antes de alguem produzi-la.
 *
 * A tool monta o briefing a partir do template do tipo, cruzado com o eixo, a
 * fase e as provas disponiveis. Ela NAO escreve a peca: quem escreve e o
 * agente, com a regua de escrever_copy, e quem julga e verificar_conteudo.
 *
 * Um cuidado especifico: a tool escolhe UMA prova como espinha dorsal e diz
 * qual. Peca que tenta carregar as tres nao carrega nenhuma, e o repertorio
 * deste projeto e pequeno o bastante para que a tentacao de empilhar seja real.
 */
import { carregarYaml } from '../data/carregar.js';

/**
 * Qual prova sustenta melhor cada tipo de peca.
 * Produto de alto valor pede a proporcao de supervisao (numero verificavel);
 * topo de funil pede o corpo docente (e o que para o scroll).
 */
const PROVA_POR_TIPO = {
  landing_page: 'PR-001',
  carrossel: 'PR-002',
  reels: 'PR-003',
  anuncio: 'PR-002',
  email: 'PR-001',
  whatsapp: 'PR-001',
  mala_direta: 'PR-001',
};

export default async function briefingEntrega(args = {}) {
  const { tipo, eixo } = args;
  const tpl = carregarYaml('briefing-templates');
  const com = carregarYaml('comunicacao');
  const produtos = carregarYaml('produtos');
  const perfil = carregarYaml('perfil-plasticflix');
  const calendario = carregarYaml('calendario');

  const template = (tpl.templates || []).find((t) => t.tipo === tipo);
  if (!template) {
    return {
      erro: `tipo "${tipo}" nao tem template`,
      tipos_validos: (tpl.templates || []).map((t) => t.tipo),
    };
  }

  const provaId = PROVA_POR_TIPO[tipo];
  const prova = (com.provas || []).find((p) => p.id === provaId) || null;

  const doEixo =
    eixo === 'combo'
      ? produtos.produtos.filter((p) => p.eixo === 'ambos')
      : produtos.produtos.filter((p) => p.eixo === eixo || p.eixo === 'ambos');

  const grade =
    eixo === 'combo'
      ? perfil.evento?.grade
      : (perfil.evento?.grade || []).filter((d) => d.eixo === eixo || d.eixo === 'ambos');

  const fase = args.fase ? (calendario.fases || []).find((f) => f.id === args.fase || f.nome === args.fase) : null;

  // Idioma: a excecao e do canal, nao do gosto de quem escreve.
  const excecaoIdioma = (com.idioma?.excecoes || []).find((e) => e.canal === tipo);
  const idioma = excecaoIdioma ? excecaoIdioma.idioma : com.idioma?.publico;

  const dadosTravados = [];
  if (perfil.evento?.ano === null) dadosTravados.push('o ano do evento — nao escrever nenhuma data com ano');
  if (produtos.lotes?.virada_lote_1 === null) dadosTravados.push('as datas de virada de lote — nao declarar prazo');
  const cirurgia = (perfil.evento?.grade || []).find((d) => d.formato === 'cirurgia_ao_vivo');
  if (cirurgia?.local === null) dadosTravados.push('o hospital da cirurgia ao vivo — nao nomear');

  return {
    fonte: tpl.fonte,

    briefing: {
      tipo,
      eixo,
      tema: args.tema || null,
      fase: fase ? { id: fase.id, nome: fase.nome, janela: fase.janela } : null,
      idioma,
      idioma_nota: excecaoIdioma
        ? `Excecao de canal: ${excecaoIdioma.nota}`
        : `Peca publica sai em ${com.idioma?.publico} por decisao do ${com.idioma?.decidido_por}.`,

      objetivo: template.objetivo,
      campos_obrigatorios: template.campos_obrigatorios,
      criterio_de_aceite: template.criterio_de_aceite,
      restricoes_aplicaveis: template.restricoes,

      espinha_dorsal: prova
        ? {
            prova: prova.id,
            nome: prova.nome,
            afirmacao: prova.afirmacao,
            lastro: prova.lastro,
            pendencia: prova.pendencia || null,
            instrucao:
              'Use ESTA prova como espinha dorsal. Peca que tenta carregar as tres nao carrega nenhuma. ' +
              'As outras duas podem aparecer como apoio, nunca disputando o espaco principal.',
          }
        : null,

      produtos_do_eixo: doEixo.map((p) => ({
        id: p.id,
        nome: p.nome,
        vagas: p.vagas,
        lote_1: p.lote_1,
        lote_2: p.lote_2,
        canal_de_venda: p.canal_de_venda,
      })),

      grade_do_eixo: grade,

      gate_de_elegibilidade:
        'A peca deixa visivel quem pode se inscrever: cirurgiao plastico, otorrinolaringologista ou residente formal. ' +
        'Nao e letra miuda de rodape — e o filtro que evita lead desqualificado no comercial e protege o evento de ' +
        'represalia de sociedade medica.',
    },

    dados_travados: dadosTravados.length
      ? {
          quais: dadosTravados,
          consequencia:
            'A regra R-007 bloqueia peca que afirme qualquer um destes enquanto o campo estiver vazio nos dados. ' +
            'O conserto e preencher o dado com o cliente, nunca contornar a regra.',
        }
      : null,

    campos_comuns: tpl.campos_comuns,

    anti_padroes: com.anti_padroes,
    termos_proibidos: com.termos_proibidos,

    proximo_passo:
      `Com o briefing fechado, chame escrever_copy (tipo: "${tipo}", eixo: "${eixo}") para a regua de escrita. ` +
      'Depois de escrita, a peca passa por verificar_conteudo antes de ir para qualquer lugar.',
  };
}
