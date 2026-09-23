/**
 * R-003 — Sem trafego pago no Brasil nesta fase. BLOQUEIO.
 *
 * Decisao do kickoff: os R$ 10 mil de 2 meses vao para Mexico (R$ 5 mil) e
 * Argentina (R$ 5 mil). O Brasil sai por WhatsApp, mala direta e sociedades —
 * o publico brasileiro ja conhece os cursos e o argumento do cliente e de falta
 * de poder aquisitivo, nao de falta de alcance.
 *
 * A regra dispara quando contexto.praca e brasil E contexto.canal e anuncio.
 * Fora dessa combinacao, anuncio e permitido e Brasil e permitido.
 *
 * Le a distribuicao de verba de data/frentes.yaml (F2). Se o Brasil entrar no
 * orcamento um dia, basta sair de orcamento.brasil: excluido — a regra
 * acompanha.
 */
import { achado, canalDe, normalizar } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

export default function trafegoBrasil(texto, contexto = {}) {
  const praca = normalizar(contexto.praca ?? '');
  const canal = canalDe(contexto);

  if (canal !== 'anuncio') return null;

  const frentes = carregarYaml('frentes');
  const f2 = (frentes?.frentes ?? []).find((f) => f.id === 'F2');
  const orcamento = f2?.orcamento ?? {};
  const pracasPagas = (orcamento.distribuicao ?? []).map((d) => normalizar(d.praca));
  const brasilExcluido = normalizar(orcamento.brasil ?? '') === 'excluido';

  if (praca === 'brasil' && brasilExcluido) {
    return achado(
      'R-003',
      'BLOQUEIO',
      'Anuncio pago com praca declarada Brasil, e o Brasil esta fora do trafego pago nesta fase.',
      `A verba aprovada e de R$ ${orcamento.total_brl} por ${orcamento.periodo_meses} meses, dividida entre ` +
        `${pracasPagas.join(' e ')}. O Brasil vai por WhatsApp, mala direta e sociedades. ` +
        'Se esta peca precisa existir, ela e e-mail, mala direta ou mensagem de WhatsApp — nao anuncio.',
      { padrao: 'trafego-brasil', pracas_permitidas: pracasPagas }
    );
  }

  // Anuncio sem praca declarada nao pode passar por omissao: e justamente a
  // combinacao que a regra precisa enxergar.
  if (!praca) {
    return achado(
      'R-003',
      'ALERTA',
      'Anuncio sem praca declarada no contexto.',
      `Declare contexto.praca. As pracas com verba aprovada sao ${pracasPagas.join(' e ')}; ` +
        'Brasil esta fora do pago nesta fase.',
      { padrao: 'anuncio-sem-praca', pracas_permitidas: pracasPagas }
    );
  }

  // Praca paga fora das duas aprovadas tambem merece aviso, sem veto: pode ser
  // teste autorizado depois dos 2 meses.
  if (!pracasPagas.includes(praca)) {
    return achado(
      'R-003',
      'ALERTA',
      `Anuncio com praca "${contexto.praca}", que nao esta na distribuicao de verba aprovada.`,
      `A verba aprovada cobre ${pracasPagas.join(' e ')}. Praca nova so depois da leitura dos 2 meses ` +
        '(ver a fase decisao em data/calendario.yaml).',
      { padrao: 'praca-fora-do-orcamento', pracas_permitidas: pracasPagas }
    );
  }

  return null;
}
