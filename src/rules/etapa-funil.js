/**
 * R-008 — Etapa do funil. ALERTA, sem veto.
 *
 * O cliente queria mandar o anuncio direto para a LP; o Gustavo defende manter
 * o Instagram no percurso, porque e onde a objecao cai e o corpo docente e
 * apresentado. Num produto de R$ 20 a 60 mil, anuncio direto para LP tende a
 * nao converter.
 *
 * Isto NAO e veto de proposito. A posicao ainda vai ser provada com dado no
 * primeiro ciclo, e regra que veta hipotese impede justamente o teste que
 * resolveria a discussao. O alerta existe para que ninguem faca isso por
 * descuido — so por decisao.
 *
 * Le o papel do Instagram em data/comunicacao.yaml e os produtos de alto valor
 * em data/produtos.yaml (formato lab e cirurgia ao vivo).
 */
import { achado, canalDe, normalizar } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

const FORMATOS_DE_ALTO_VALOR = new Set(['lab', 'cirurgia_ao_vivo']);

export default function etapaFunil(texto, contexto = {}) {
  const canal = canalDe(contexto);
  if (canal !== 'anuncio') return null;

  const comunicacao = carregarYaml('comunicacao');
  const papelDoInstagram = comunicacao?.funil?.instagram?.papel ?? null;
  if (papelDoInstagram !== 'etapa intermediaria') return null;

  const produtos = carregarYaml('produtos');
  const produto = (produtos?.produtos ?? []).find((p) => p.id === contexto.produto_ref);
  if (!produto) return null;
  if (!FORMATOS_DE_ALTO_VALOR.has(String(produto.formato))) return null;

  const destino = normalizar(contexto.destino ?? '').replace(/[\s-]+/g, '_');
  const apontaDireto = destino === 'landing_page' || destino === 'lp' || destino === 'site' || destino === 'checkout';
  if (!apontaDireto) return null;

  const preco = produto?.lote_1?.preco;

  return achado(
    'R-008',
    'ALERTA',
    `Anuncio do produto ${produto.id} (${produto.nome}` +
      (typeof preco === 'number' ? `, R$ ${preco.toLocaleString('pt-BR')}` : '') +
      `) apontando direto para ${contexto.destino}, sem etapa intermediaria.`,
    'O Instagram e etapa intermediaria do funil neste projeto: e onde a objecao cai e o corpo docente e ' +
      'apresentado. Num produto de alto valor, anuncio direto para LP tende a nao converter. ' +
      'Se for decisao deliberada de teste, registre o combinado e leia o dado junto do cliente no primeiro ' +
      'ciclo — que e exatamente o acordo do kickoff. Nao e impedimento.',
    { padrao: 'funil-sem-etapa-intermediaria', produto_ref: produto.id, destino: contexto.destino }
  );
}
