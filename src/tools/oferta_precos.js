/**
 * oferta_precos — tabela, lotes, descontos e o argumento por objecao.
 *
 * A tool devolve argumento pronto, nao so a tabela. A razao e concreta: a
 * equipe comercial ja foi questionada por uma lead sobre a variacao entre
 * R$ 20 mil e R$ 25 mil, e a resposta certa nao e explicar a diferenca — e
 * mostrar que existe uma regra de lote com prazo. Deixar isso para o agente
 * improvisar produz uma versao diferente da regra a cada atendimento, que e
 * exatamente o defeito que o cliente relatou.
 *
 * O piso negociado da Face sai marcado como INTERNO. Ele existe nos dados
 * porque o comercial precisa da margem, e nao pode aparecer em peca.
 */
import { carregarYaml } from '../data/carregar.js';

/** Argumentos por objecao. A chave e casada por palavra, nao por igualdade. */
const ARGUMENTOS = [
  {
    gatilho: ['preco', 'caro', 'valor', 'alto', 'price', 'expensive'],
    argumento:
      'Nao justifique o valor pelo conteudo — justifique pela regra de lote: "o primeiro lote vai ate o dia X". ' +
      'E a unica justificativa aceita neste projeto. Corte publico de preco esta proibido.',
  },
  {
    gatilho: ['variacao', 'mudou', '20', '25', 'diferenca', 'aumentou'],
    argumento:
      'Foi a objecao real relatada pela Fran: uma medica questionou a oscilacao entre R$ 20 mil e R$ 25 mil. ' +
      'A resposta e a regra de lote com prazo declarado, escrita IGUAL na LP, no WhatsApp e no comercial. ' +
      'Se a regra nao estiver visivel nos tres lugares, o preco vira negociacao desde o primeiro contato.',
  },
  {
    gatilho: ['desconto', 'abatimento', 'condicao', 'discount'],
    argumento:
      'So existem duas excecoes previstas: o combo Rino + Face (-10%) e sociedade parceira (-10%, com contrapartida ' +
      'de divulgacao no site oficial). Qualquer outro desconto publico e veto (R-005).',
  },
  {
    gatilho: ['face', 'sessenta', '60', 'negociar', 'proposta'],
    argumento:
      'Na Face houve resistencia ao valor de tabela. O caminho combinado NAO e baixar o preco no site: e o comercial ' +
      'ouvir o valor que o lead considera justo e levar essa proposta a diretoria para apreciacao. ' +
      'Cortar no site desvaloriza para quem ja pagou e para quem ainda vai pagar; proposta individual preserva a ancora ' +
      'e ainda informa o que o mercado aceita.',
  },
  {
    gatilho: ['parcel', 'pagamento', 'cartao', 'entrada'],
    argumento:
      '30% de entrada e o restante em ate seis vezes no cartao. O link e gerado pela Mara, a pedido da Fran — ' +
      'controle financeiro centralizado. Nao prometa condicao diferente sem a diretoria.',
  },
];

function argumentoPara(objecao) {
  if (!objecao) return null;
  const texto = String(objecao).toLowerCase();
  const achados = ARGUMENTOS.filter((a) => a.gatilho.some((g) => texto.includes(g)));
  if (achados.length === 0) {
    return {
      encontrado: false,
      nota:
        'Nenhum argumento catalogado bate com essa objecao. Nao improvise condicao comercial: ' +
        'a regra de lote e a unica justificativa de preco, e desconto fora das duas excecoes previstas e veto.',
    };
  }
  return { encontrado: true, argumentos: achados.map((a) => a.argumento) };
}

export default async function ofertaPrecos(args = {}) {
  const dados = carregarYaml('produtos');
  const filtro = args.produto && args.produto !== 'todos' ? args.produto : null;

  const mapa = {
    teorica_rino: 'P-001',
    teorica_face: 'P-002',
    lab_rino: 'P-003',
    lab_face: 'P-004',
    cirurgia_ao_vivo: 'P-005',
    combo: 'P-006',
  };

  let produtos = dados.produtos;
  if (filtro) {
    const id = mapa[filtro];
    produtos = dados.produtos.filter((p) => p.id === id);
    if (produtos.length === 0) {
      return { erro: `produto "${filtro}" nao existe`, produtos_validos: ['todos', ...Object.keys(mapa)] };
    }
  }

  // O piso da Face nao pode vazar para peca. Sai marcado, nunca solto.
  const produtosSaida = produtos.map((p) => {
    if (!p.piso_negociado) return p;
    const { piso_negociado, ...resto } = p;
    return {
      ...resto,
      piso_negociado: {
        ...piso_negociado,
        USO: 'INTERNO — argumentacao comercial apenas. Nenhum destes valores pode aparecer em peca publica, LP ou anuncio.',
      },
    };
  });

  return {
    fonte: dados.fonte,
    moeda: dados.moeda,
    modo: filtro || 'todos',

    lotes: dados.lotes,
    produtos: produtosSaida,
    descontos_permitidos: dados.descontos_permitidos,
    pagamento: dados.pagamento,
    regras_comerciais: dados.regras_comerciais,

    ...(args.objecao ? { argumento_para_a_objecao: argumentoPara(args.objecao) } : {}),

    datas_de_virada:
      dados.lotes?.virada_lote_1 === null
        ? {
            definidas: false,
            nota: dados.lotes.virada_nota,
            consequencia:
              'Sem data de virada, a regra de lote nao pode ser declarada em peca — e ela e a unica justificativa de ' +
              'preco aceita. A regra R-007 bloqueia peca que afirme data de virada enquanto o campo for null.',
          }
        : { definidas: true, lote_1: dados.lotes.virada_lote_1, lote_2: dados.lotes.virada_lote_2 },

    proximo_passo:
      'Para saber com quem falar e por qual base comecar, chame base_publico. ' +
      'Para escrever a peca com esses valores, chame escrever_copy — e verifique com verificar_conteudo antes de publicar.',
  };
}
