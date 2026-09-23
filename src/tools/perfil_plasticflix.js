/**
 * perfil_plasticflix — contexto do projeto, e o primeiro passo de toda sessao.
 *
 * Existe para impedir os dois erros que este cliente convida a cometer:
 *
 * 1. Escrever para paciente. A Stark atende uma carteira de cirurgioes que
 *    vendem procedimento a leigo; aqui o comprador e o proprio cirurgiao, e
 *    quase todo reflexo treinado la esta errado.
 * 2. Afirmar dado que a reuniao nao estabeleceu. O ano do evento nunca foi dito
 *    em voz alta no kickoff, o hospital da cirurgia ao vivo nao existe e as
 *    datas de virada de lote nao foram definidas.
 *
 * Por isso a secao `atencao` sai em TODA resposta, inclusive nos recortes — e o
 * recorte que mais tenta o agente a esquecer.
 */
import { carregarYaml } from '../data/carregar.js';

/** Campos que estao null de proposito, com o que cada um trava. */
function dadosEmAberto(perfil) {
  const abertos = [];

  if (perfil.evento?.ano === null) {
    abertos.push({
      campo: 'evento.ano',
      trava: 'qualquer peca, LP ou prazo de lote que mencione data',
      nota: perfil.evento.ano_nota,
    });
  }

  const cirurgia = (perfil.evento?.grade || []).find((d) => d.formato === 'cirurgia_ao_vivo');
  if (cirurgia && cirurgia.local === null) {
    abertos.push({
      campo: 'evento.grade[cirurgia_ao_vivo].local',
      trava: 'a peca do dia 07/03',
      nota: cirurgia.local_nota,
    });
  }

  if (perfil.objetivos?.meta_comercial_minima === null) {
    abertos.push({
      campo: 'objetivos.meta_comercial_minima',
      trava: 'declarar meta de viabilidade em documento',
      nota: perfil.objetivos.meta_comercial_nota,
    });
  }

  if (perfil.clickup?.space_ou_folder === null) {
    abertos.push({
      campo: 'clickup.space_ou_folder',
      trava: 'o lancamento das tarefas',
      nota: perfil.clickup.space_ou_folder_nota,
    });
  }

  return abertos;
}

export default async function perfilPlasticflix(args = {}) {
  const perfil = carregarYaml('perfil-plasticflix');
  const secao = args.secao || 'tudo';

  // Sai sempre, em qualquer recorte. E o ponto do arquivo.
  const atencao = {
    nao_existe_paciente_neste_projeto:
      'O comprador e cirurgiao plastico, otorrino ou residente formal, e compra formacao tecnica. ' +
      'CTA de agendamento, conteudo educativo para leigo e linguagem de captacao de paciente estao todos errados aqui.',
    idioma_publico: 'ingles, por decisao do Dr. Mattioli. Ver data/comunicacao.yaml.',
    gate_de_elegibilidade:
      'RQE ou comprovacao de residencia conferidos ANTES de efetivar inscricao. E protecao juridica, nao filtro comercial.',
    dado_nao_confirmado:
      'O que o kickoff nao estabeleceu esta null nos dados. A regra R-007 bloqueia peca que afirme esses campos, ' +
      'e se desarma sozinha quando eles forem preenchidos.',
  };

  const recortes = {
    socios: () => ({ estrutura_societaria: perfil.estrutura_societaria, organizacao: perfil.organizacao }),
    evento: () => ({ evento: perfil.evento }),
    objetivo: () => ({ objetivos: perfil.objetivos }),
    time: () => ({ time_stark: perfil.time_stark, interlocutores_cliente: perfil.interlocutores_cliente }),
    governanca: () => ({
      interlocutores_cliente: perfil.interlocutores_cliente,
      clickup: perfil.clickup,
      decisor: perfil.interlocutores_cliente?.find((i) => i.papel === 'decisor') || null,
    }),
    historico: () => ({ historico: perfil.historico, ativos_existentes: perfil.ativos_existentes }),
  };

  const corpo =
    secao === 'tudo'
      ? {
          slug: perfil.slug,
          nome_projeto: perfil.nome_projeto,
          edicao: perfil.edicao,
          estrutura_societaria: perfil.estrutura_societaria,
          organizacao: perfil.organizacao,
          ativos_existentes: perfil.ativos_existentes,
          evento: perfil.evento,
          objetivos: perfil.objetivos,
          historico: perfil.historico,
          time_stark: perfil.time_stark,
          interlocutores_cliente: perfil.interlocutores_cliente,
          clickup: perfil.clickup,
        }
      : recortes[secao]
        ? recortes[secao]()
        : null;

  if (corpo === null) {
    return {
      erro: `secao "${secao}" nao existe`,
      secoes_validas: ['tudo', ...Object.keys(recortes)],
    };
  }

  const abertos = dadosEmAberto(perfil);

  return {
    fonte: perfil.fonte,
    levantamento: perfil.levantamento,
    modo: secao,
    atencao,
    ...corpo,
    dados_em_aberto: abertos,

    // A urgencia deste cliente muda a ordem de prioridade, e isso nao esta
    // obvio em nenhum campo isolado do YAML.
    leitura_de_prioridade:
      'A Face esta com vendas zeradas e o risco declarado e de R$ 700 a 800 mil. ' +
      'Isso inverte a ordem usual: base quente (22 leads, ex-alunos, sociedades) antes de captacao fria. ' +
      'Campanha de topo com R$ 10 mil em dois paises nao move esse numero no prazo.',

    proximo_passo:
      abertos.length > 0
        ? `Ha ${abertos.length} campo(s) em aberto que travam entrega. Chame status_lacunas para o pedido agrupado ao cliente.`
        : 'Sem dado em aberto. Siga para planejar_demandas ou calendario_projeto.',
  };
}
