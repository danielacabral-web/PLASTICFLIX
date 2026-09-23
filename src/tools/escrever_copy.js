/**
 * escrever_copy — a regua com que a peca e escrita, e pela qual sera julgada.
 *
 * A tool nao escreve. Ela entrega leitor, idioma, provas com lastro,
 * anti-padroes e o que reprova no gate — e o agente escreve. A razao de nao
 * escrever e simples: a peca precisa passar por verificar_conteudo, e uma tool
 * que gerasse o texto estaria julgando o proprio trabalho.
 *
 * O bloco `o_leitor` e o que mais importa aqui. O erro mais provavel neste
 * projeto e escrever para paciente, porque e o reflexo treinado na carteira da
 * Stark, onde o leitor e sempre leigo.
 */
import { carregarYaml } from '../data/carregar.js';

export default async function escreverCopy(args = {}) {
  const { tipo, eixo } = args;
  const com = carregarYaml('comunicacao');
  const publico = carregarYaml('publico');
  const produtos = carregarYaml('produtos');

  const excecaoIdioma = (com.idioma?.excecoes || []).find((e) => e.canal === tipo);
  const idiomaPadrao = excecaoIdioma ? excecaoIdioma.idioma : com.idioma?.publico;
  const idioma = args.idioma || idiomaPadrao;

  const conflitoIdioma =
    args.idioma && idiomaPadrao && !String(idiomaPadrao).startsWith(args.idioma)
      ? `Voce pediu "${args.idioma}", mas o padrao deste canal e "${idiomaPadrao}". ` +
        'Se a peca e publica, R-004 vai reprovar. Se e interna, declare canal: "interno" na verificacao.'
      : null;

  const doEixo =
    eixo === 'combo'
      ? produtos.produtos.filter((p) => p.eixo === 'ambos')
      : produtos.produtos.filter((p) => p.eixo === eixo || p.eixo === 'ambos');

  return {
    fonte: com.fonte,
    tipo,
    eixo,
    idioma,
    ...(conflitoIdioma ? { alerta_de_idioma: conflitoIdioma } : {}),

    o_leitor: {
      quem_e:
        'Um cirurgiao plastico ou otorrino estabelecido, que ja viu muito curso e ja foi a muito congresso. ' +
        'Nao precisa que expliquem o que e rinoplastia.',
      o_que_ele_avalia: ['quem ensina', 'quanto ele vai operar de fato', 'quanto custa'],
      erro_mais_provavel:
        'Escrever para ele como se escreve para paciente. E o reflexo natural de quem vem da carteira de cirurgioes ' +
        'da Stark, onde o leitor e sempre leigo — e aqui e o proprio especialista.',
      elegibilidade: publico.elegibilidade?.permitidos,
    },

    idioma_detalhe: {
      publico: com.idioma?.publico,
      decidido_por: com.idioma?.decidido_por,
      justificativa_do_cliente: com.idioma?.justificativa_do_cliente,
      excecoes: com.idioma?.excecoes,
      instrucao:
        'Escreva em ingles de verdade, nao em portugues traduzido. Termo tecnico na forma que o cirurgiao usa: ' +
        'cadaver lab, specimen, live surgery, hands-on.',
      status: 'Hipotese nao testada. Se Mexico e Argentina performarem mal, a decisao volta a mesa com dado.',
    },

    big_idea: com.eixo,
    provas: com.provas,

    o_que_da_prova: [
      '"One trainee per specimen in rhinoplasty, two in face" — numero verificavel',
      '"Five days: theory, anatomy lab, live surgery" — encadeamento, nao lista de atividades',
      'Os nomes do corpo docente, com procedencia',
    ],
    o_que_so_enfeita: [
      '"unique", "unmissable", "the best course in Brazil"',
      '"transform your practice", "master the technique"',
      'qualquer frase que sobreviveria colada no site de outro curso',
    ],
    nota_sobre_o_enfeite:
      'O segundo bloco nao e so fraco: parte dele REPROVA no gate. Promessa de dominio de tecnica e superlativo sem ' +
      'lastro batem em R-006.',

    anti_padroes_de_ia: com.anti_padroes,
    termos_proibidos: com.termos_proibidos,

    precos_do_eixo: doEixo.map((p) => ({
      id: p.id,
      nome: p.nome,
      lote_1: p.lote_1,
      lote_2: p.lote_2,
    })),
    nota_sobre_preco:
      'Se a peca cita valor, ele tem de bater com data/produtos.yaml e a justificativa tem de ser a regra de lote. ' +
      'R-005 le o YAML e compara.',

    pendencia_de_marca: com.pendencia_de_marca,
    mote: com.mote,
    regua_de_tom: com.regua_de_tom,

    antes_de_entregar:
      'Chame verificar_conteudo com o texto E o contexto completo: canal, eixo, idioma e praca. ' +
      'Contexto incompleto produz veredito que nao vale nada. Se voltar BLOQUEADO, o conserto e a peca — ' +
      'nao o contexto que voce informou.',
  };
}
