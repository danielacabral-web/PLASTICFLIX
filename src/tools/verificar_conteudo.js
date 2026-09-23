/**
 * verificar_conteudo — o gate. Roda as nove regras e devolve o veredito.
 *
 * O julgamento e do codigo, nao do modelo: mesmo texto e mesmo contexto
 * produzem o mesmo veredito, sempre. A tool acrescenta duas coisas ao retorno
 * cru do motor:
 *
 * 1. Um aviso quando o CONTEXTO veio incompleto. Quatro regras dependem dele, e
 *    um APROVADO obtido com contexto faltando e pior que nenhum veredito — ele
 *    da a alguem a impressao de que a peca passou.
 * 2. A lembranca de que regra que incomoda se conserta preenchendo o dado, nao
 *    relaxando a regra.
 */
import { runRules, listarRegras } from '../rules/index.js';

/** Campos de contexto que mudam o veredito, e o que cada um decide. */
const CONTEXTO_QUE_IMPORTA = {
  canal: 'separa peca publica de material interno e de WhatsApp direto (R-003, R-004)',
  eixo: 'define contra qual tabela de preco o texto e conferido (R-005)',
  idioma: 'decide se a peca publica esta no idioma acordado (R-004)',
  praca: 'decide se o anuncio esta indo para uma praca vetada nesta fase (R-003)',
};

export default async function verificarConteudo(args = {}) {
  const texto = args.texto;

  if (typeof texto !== 'string' || texto.trim() === '') {
    return { erro: 'texto vazio. Nao ha o que verificar.' };
  }

  const contexto = {
    canal: args.canal,
    eixo: args.eixo,
    idioma: args.idioma,
    praca: args.praca,
  };

  const faltando = Object.keys(CONTEXTO_QUE_IMPORTA).filter((k) => !contexto[k]);

  const resultado = runRules(texto, contexto);

  return {
    veredito: resultado.veredito,
    resumo: resultado.resumo,
    regras_avaliadas: resultado.regras_avaliadas,

    blockers: resultado.blockers,
    alertas: resultado.alertas,

    contexto_informado: contexto,
    ...(faltando.length > 0
      ? {
          aviso_de_contexto: {
            faltando,
            o_que_cada_um_decide: Object.fromEntries(faltando.map((k) => [k, CONTEXTO_QUE_IMPORTA[k]])),
            consequencia:
              resultado.veredito === 'APROVADO'
                ? 'ATENCAO: este APROVADO saiu com contexto incompleto e nao deve ser tratado como aprovacao. ' +
                  'Informe os campos que faltam e rode de novo.'
                : 'O veredito pode mudar quando o contexto estiver completo. Informe os campos que faltam.',
          },
        }
      : {}),

    catalogo_de_regras: listarRegras(),

    nota_sobre_regra_que_incomoda:
      'Se um veredito parece errado porque o fato mudou no mundo, o conserto e PREENCHER O DADO no YAML — ' +
      'nao relaxar a regra. As regras deste repo leem os dados de proposito: no repo do AExPI um veto ficou embutido ' +
      'em codigo, o fato mudou, e o verificador seguiu reprovando copy correta por tres commits.',

    proximo_passo:
      resultado.veredito === 'BLOQUEADO'
        ? 'Corrija a peca nos pontos apontados e rode de novo. BLOQUEIO nao e sugestao.'
        : resultado.veredito === 'AJUSTAR'
          ? 'Os alertas sao recomendacao com razao declarada. Avalie um a um; nenhum impede a publicacao.'
          : 'Nenhuma regra acusou problema. A peca pode seguir para aprovacao.',
  };
}
