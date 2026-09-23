/**
 * Motor de regras do Plasticflix Prime.
 *
 * Contrato de cada regra: funcao pura que recebe (texto, contexto) e devolve
 * null, um achado, ou uma lista de achados. Achado tem
 * { regra_id, nivel: 'BLOQUEIO'|'ALERTA', detalhe, acao }.
 *
 * Veredito: um BLOQUEIO derruba a peca. So alertas pedem ajuste. Nada, aprovado.
 *
 * Duas decisoes de desenho valem registro:
 *
 *   1. A lista de regras e uma constante deste arquivo e cada regra declara seu
 *      id — nao ha como uma regra existir sem entrar no motor.
 *   2. TODA regra que depende de um fato le o fato de data/*.yaml. Nenhum veto
 *      guarda copia de preco, de data ou de decisao dentro do JavaScript. Isso
 *      e correcao de um defeito conhecido do repo da AExPI, onde a regra de
 *      sigilo tinha o veto hardcoded e continuou bloqueando copy correta depois
 *      que o fato mudou no mundo.
 */
import elegibilidade from './elegibilidade.js';
import transmissaoCirurgia from './transmissao-cirurgia.js';
import trafegoBrasil from './trafego-brasil.js';
import idioma from './idioma.js';
import precoLote from './preco-lote.js';
import promessaCfm from './promessa-cfm.js';
import dadoNaoConfirmado from './dado-nao-confirmado.js';
import etapaFunil from './etapa-funil.js';
import lacuna from './lacuna.js';

export const REGRAS = [
  { id: 'R-001', nome: 'Elegibilidade e RQE', fn: elegibilidade, veto: true },
  { id: 'R-002', nome: 'Sem transmissao de cirurgia', fn: transmissaoCirurgia, veto: true },
  { id: 'R-003', nome: 'Sem trafego pago no Brasil', fn: trafegoBrasil, veto: true },
  { id: 'R-004', nome: 'Idioma da peca publica', fn: idioma, veto: true },
  { id: 'R-005', nome: 'Preco e regra de lote', fn: precoLote, veto: true },
  { id: 'R-006', nome: 'Promessa e CFM', fn: promessaCfm, veto: true },
  { id: 'R-007', nome: 'Dado nao confirmado', fn: dadoNaoConfirmado, veto: true },
  { id: 'R-008', nome: 'Etapa do funil', fn: etapaFunil, veto: false },
  { id: 'R-009', nome: 'Lacuna bloqueante', fn: lacuna, veto: true },
];

/**
 * @param {string} texto
 * @param {object} contexto
 *   canal: 'instagram' | 'stories' | 'anuncio' | 'landing_page' | 'email' |
 *          'mala_direta' | 'whatsapp' | 'interno'
 *   praca: 'brasil' | 'mexico' | 'argentina' | 'chile' | 'venezuela' | 'internacional'
 *   idioma: 'en' | 'pt-BR'
 *   produto_ref: id de data/produtos.yaml (P-001 a P-006)
 *   destino: para onde o CTA leva ('instagram', 'landing_page', 'whatsapp', 'checkout')
 *   fluxo: 'inscricao' quando a peca descreve o fluxo comercial
 *   gate_rqe: true quando a checagem de credencial existe no fluxo
 *   depende_de: id ou lista de ids de data/lacunas.yaml
 * @returns {{ veredito: string, blockers: object[], alertas: object[], regras_avaliadas: number, resumo: string }}
 */
export function runRules(texto, contexto = {}) {
  const blockers = [];
  const alertas = [];
  const erros = [];

  for (const regra of REGRAS) {
    let saida;
    try {
      saida = regra.fn(texto, contexto);
    } catch (e) {
      // Uma regra que quebra nao pode aprovar a peca por omissao. Vira bloqueio.
      erros.push({
        regra_id: regra.id,
        nivel: 'BLOQUEIO',
        detalhe: `A regra ${regra.id} (${regra.nome}) falhou ao executar: ${e.message}`,
        acao: 'Erro de sistema, nao da peca. Corrija a regra antes de confiar neste veredito.',
      });
      continue;
    }

    const lista = saida === null || saida === undefined ? [] : Array.isArray(saida) ? saida : [saida];
    for (const item of lista) {
      if (!item) continue;
      if (item.nivel === 'BLOQUEIO') blockers.push(item);
      else alertas.push(item);
    }
  }

  blockers.push(...erros);

  const veredito = blockers.length > 0 ? 'BLOQUEADO' : alertas.length > 0 ? 'AJUSTAR' : 'APROVADO';

  const resumo =
    veredito === 'APROVADO'
      ? 'Nenhuma regra acusou problema.'
      : veredito === 'AJUSTAR'
        ? `${alertas.length} ajuste(s) recomendado(s), nenhum impedimento.`
        : `${blockers.length} impedimento(s)` + (alertas.length ? ` e ${alertas.length} ajuste(s).` : '.');

  return {
    veredito,
    blockers,
    alertas,
    regras_avaliadas: REGRAS.length,
    resumo,
  };
}

/** Catalogo das regras, para documentacao e para as tools exporem. */
export function listarRegras() {
  return REGRAS.map(({ id, nome, veto }) => ({ id, nome, veto }));
}
