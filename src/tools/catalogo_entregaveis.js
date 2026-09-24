/**
 * catalogo_entregaveis — o que precisa ser produzido, item a item.
 *
 * Todo item deste catalogo EXISTIU no ciclo anterior. Nada foi imaginado: o
 * campo `referencia` aponta o arquivo original no Drive. Essa e a diferenca
 * entre um catalogo e uma lista de desejos, e e o que torna o escopo
 * defensavel numa conversa com o cliente.
 *
 * A tool cruza os itens com as lacunas: um entregavel travado por dado que nao
 * existe nao e "a fazer", e "bloqueado" — e misturar os dois faz um backlog
 * parecer saudavel quando metade dele nao pode comecar.
 */
import { carregarYaml } from '../data/carregar.js';

/**
 * Separa as travas de um item em duas listas: as que apontam para uma lacuna
 * catalogada e as que estao so em prosa.
 *
 * A segunda lista existe porque ela sumia. A primeira versao desta funcao so
 * extraia ids `L-\d{3}`, e dependencias reais escritas em texto — "carga
 * horaria", "composicao do kit" — desapareciam do balanco, fazendo o backlog
 * parecer mais livre do que e. Dependencia sem id ainda e dependencia; ela so
 * nao tem dono nem cobranca, que e justamente o que falta resolver.
 */
function travasDe(item, categoria) {
  const fontes = [
    ...(Array.isArray(item.trava) ? item.trava : item.trava ? [item.trava] : []),
    categoria.trava_geral,
    categoria.bloqueado_por,
  ].filter(Boolean);

  const ids = new Set();
  const semLacuna = [];

  for (const f of fontes) {
    const texto = String(f);
    const m = texto.match(/L-\d{3}/g);
    if (m) {
      m.forEach((id) => ids.add(id));
      continue;
    }
    semLacuna.push(texto);
  }

  return { ids: [...ids], semLacuna };
}

export default async function catalogoEntregaveis(args = {}) {
  const dados = carregarYaml('entregaveis');
  const { lacunas } = carregarYaml('lacunas');

  const porId = new Map(lacunas.map((l) => [l.id, l]));

  const filtro = args.categoria && args.categoria !== 'todas' ? args.categoria : null;
  const categorias = filtro ? dados.categorias.filter((c) => c.id === filtro) : dados.categorias;

  if (categorias.length === 0) {
    return {
      erro: `categoria "${args.categoria}" nao existe`,
      categorias_validas: ['todas', ...dados.categorias.map((c) => c.id)],
    };
  }

  const montarItem = (item, categoria) => {
    const { ids, semLacuna } = travasDe(item, categoria);
    const bloqueantes = ids.filter((id) => porId.get(id)?.bloqueante);
    return {
      item: item.item,
      categoria: categoria.id,
      referencia_no_ciclo_anterior: item.referencia,
      ...(item.copy_existe ? { copy_ja_existe: true } : {}),
      ...(item.cobre ? { cobre: item.cobre } : {}),
      ...(item.nota ? { nota: item.nota } : {}),
      ...(item.alerta ? { alerta: item.alerta } : {}),
      ...(item.prioridade ? { prioridade: item.prioridade } : {}),
      ...(item.arquivos_2025 ? { arquivos_do_ciclo_anterior: item.arquivos_2025 } : {}),
      travado_por: ids.map((id) => ({
        id,
        titulo: porId.get(id)?.titulo ?? '(lacuna nao catalogada)',
        bloqueante: porId.get(id)?.bloqueante ?? null,
      })),
      ...(semLacuna.length
        ? {
            dependencias_sem_lacuna: {
              quais: semLacuna,
              nota:
                'Dependencia real que ainda nao virou lacuna catalogada — logo nao tem dono nem cobranca. ' +
                'Se travar de fato, registre em data/lacunas.yaml.',
            },
          }
        : {}),
      pode_comecar: bloqueantes.length === 0,
    };
  };

  const saida = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    clickup: c.clickup,
    ...(c.nota_geral ? { nota_geral: c.nota_geral } : {}),
    ...(c.alerta ? { alerta: c.alerta } : {}),
    itens: c.itens.map((i) => montarItem(i, c)),
  }));

  const todos = saida.flatMap((c) => c.itens);
  const livres = todos.filter((i) => i.pode_comecar);
  const travados = todos.filter((i) => !i.pode_comecar);

  return {
    fonte: dados.fonte,
    pasta_mae: dados.pasta_mae,
    frente: dados.frente,
    clickup: dados.clickup,
    ciclos_inventariados: dados.ciclos_inventariados,

    modo: filtro || 'todas',
    total_de_itens: todos.length,

    categorias: saida,

    // A separacao que importa: backlog com metade bloqueada parece saudavel
    // ate alguem tentar comecar.
    balanco: {
      pode_comecar: livres.length,
      bloqueado: travados.length,
      itens_bloqueados: travados.map((i) => ({
        item: i.item,
        por: i.travado_por.filter((l) => l.bloqueante).map((l) => `${l.id} ${l.titulo}`),
      })),
      // Nao entram na conta de bloqueados porque nao ha lacuna catalogada — mas
      // tambem nao podem sumir do relatorio.
      itens_com_dependencia_nao_catalogada: todos
        .filter((i) => i.dependencias_sem_lacuna)
        .map((i) => ({ item: i.item, quais: i.dependencias_sem_lacuna.quais })),
    },

    o_que_ja_existe_do_proximo_ciclo: dados.o_que_ja_existe_do_proximo_ciclo,
    leituras: dados.leituras,

    instrucoes: [
      'Todo item deste catalogo existiu no ciclo anterior. Antes de criar do zero, abra a referencia no Drive.',
      'Item com copy_ja_existe tem texto pronto para adaptar — nao reescrever do zero.',
      'Item com alerta traz um erro concreto ja cometido antes. Ler antes de produzir.',
    ],

    proximo_passo:
      travados.length > 0
        ? `${travados.length} de ${todos.length} itens estao bloqueados por lacuna. Chame status_lacunas para o pedido agrupado ao cliente.`
        : 'Nenhum item bloqueado. Use briefing_entrega para especificar a peca antes de produzir.',
  };
}
