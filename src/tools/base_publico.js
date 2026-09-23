/**
 * base_publico — quem pode comprar, onde procurar, e o que ja existe de base.
 *
 * O recorte `bases` sai ordenado por TEMPERATURA, nao pela ordem do YAML. A
 * pergunta que chega a esta tool costuma ser "de onde tiro mais lead", e a
 * resposta certa neste projeto quase nunca e "anuncio": ha uma planilha de 22
 * contatos ja abordados parada, e ela e a unica coisa capaz de gerar receita em
 * dias.
 */
import { carregarYaml } from '../data/carregar.js';

/** Do mais quente para o mais frio. Ordena a saida de `bases`. */
const TEMPERATURA = {
  'leads-abordados': 1,
  'ex-alunos': 2,
  sociedades: 3,
  'captacao-fria': 4,
};

function temperaturaDe(base) {
  const chave = Object.keys(TEMPERATURA).find(
    (k) => String(base.id).toLowerCase().includes(k) || String(base.nome).toLowerCase().includes(k.replace('-', ' '))
  );
  return chave ? TEMPERATURA[chave] : 99;
}

export default async function basePublico(args = {}) {
  const publico = carregarYaml('publico');
  const dadosBases = carregarYaml('bases');
  const recorte = args.recorte || 'tudo';

  const elegibilidade = {
    ...publico.elegibilidade,
    veto: 'R-001. Peca que convide publico mais amplo, ou que prometa inscricao sem o gate, e bloqueada.',
    parafrases_que_tambem_falham: [
      'aberto a todos os medicos',
      'open to all physicians',
      'para profissionais da area',
      'medicos interessados',
    ],
  };

  const bases = [...(dadosBases.bases || [])]
    .sort((a, b) => temperaturaDe(a) - temperaturaDe(b))
    .map((b, i) => ({ ordem_de_temperatura: i + 1, ...b }));

  const recortes = {
    elegibilidade: () => ({ elegibilidade }),
    mercados: () => ({
      leitura_de_mercado: publico.leitura_de_mercado,
      canais_descartados: publico.canais_descartados,
    }),
    bases: () => ({ bases, publicos_de_base: publico.publicos_de_base }),
    sociedades: () => ({ acordos_com_sociedades: dadosBases.acordos_com_sociedades }),
  };

  const corpo =
    recorte === 'tudo'
      ? {
          elegibilidade,
          leitura_de_mercado: publico.leitura_de_mercado,
          canais_descartados: publico.canais_descartados,
          publicos_de_base: publico.publicos_de_base,
          bases,
          acordos_com_sociedades: dadosBases.acordos_com_sociedades,
        }
      : recortes[recorte]
        ? recortes[recorte]()
        : null;

  if (corpo === null) {
    return { erro: `recorte "${recorte}" nao existe`, recortes_validos: ['tudo', ...Object.keys(recortes)] };
  }

  return {
    fonte: publico.fonte,
    modo: recorte,
    ...corpo,

    ordem_de_ataque:
      'Da base mais quente para a mais fria: (1) os 22 leads ja abordados, (2) ex-alunos das edicoes anteriores, ' +
      '(3) sociedades parceiras, (4) captacao fria por anuncio no Mexico e na Argentina. ' +
      'Quando pedirem "mais leads", comece pela 1 — ela esta pronta e parada.',

    nota_sobre_ex_alunos:
      'Ex-aluno tem dois usos ao mesmo tempo: exclusao nas campanhas de captacao e oferta de recompra. ' +
      'A recompra tem lastro real — ex-aluno costuma repetir curso por inseguranca pratica, nao por desconto.',

    nota_sobre_lista_negra:
      'Nao existe lista negra neste cliente. Contato desqualificado (nao medico) e descartado no atendimento inicial.',

    proximo_passo:
      'Para preco e argumento de objecao, chame oferta_precos. Para especificar a peca, chame briefing_entrega.',
  };
}
