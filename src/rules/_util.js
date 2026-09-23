/**
 * Utilitarios compartilhados pelas regras do Plasticflix Prime.
 *
 * As pecas deste projeto sao escritas em ingles (decisao do Mattioli) mas o
 * time escreve briefing, WhatsApp e material interno em portugues. Entao toda
 * peneira precisa funcionar nas duas linguas e sem depender de acento: "cirurgia
 * ao vivo" e "cirurgia ao vivo" sem cedilha tem de cair na mesma rede, senao um
 * teclado sem acento burla o veto.
 */

/** Remove acento e baixa a caixa. Nao remove pontuacao. */
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Constroi um achado no formato que runRules espera. */
export function achado(regra_id, nivel, detalhe, acao, extra = {}) {
  return { regra_id, nivel, detalhe, acao, ...extra };
}

/**
 * Procura qualquer termo de uma lista no texto normalizado.
 * @returns {string[]} termos encontrados
 */
export function encontrarTermos(texto, termos) {
  const alvo = normalizar(texto);
  return termos.filter((t) => alvo.includes(normalizar(t)));
}

/** Palavras do texto, ja sem pontuacao nas bordas. */
export function palavras(texto) {
  return String(texto ?? '')
    .split(/\s+/)
    .map((p) => p.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);
}

/** Conta ocorrencias de um regex. */
export function contar(texto, regex) {
  return (String(texto ?? '').match(regex) ?? []).length;
}

/** Canais em que a peca e publica. Fora dessa lista o material e de time. */
export const CANAIS_PUBLICOS = new Set(['instagram', 'stories', 'anuncio', 'landing_page', 'site', 'email', 'mala_direta']);

/** Canais de conversa direta ou de time. */
export const CANAIS_DIRETOS = new Set(['whatsapp', 'interno']);

/** Normaliza o canal declarado no contexto. */
export function canalDe(contexto = {}) {
  return normalizar(contexto.canal ?? '').replace(/[\s-]+/g, '_');
}

/**
 * Extrai valores em reais do texto. Aceita "R$ 60.000", "R$ 60 mil", "60k".
 * Devolve numeros em reais, ja resolvidos.
 */
export function valoresEmReais(texto) {
  const original = String(texto ?? '');
  const achados = [];

  // "R$ 60 mil", "R$ 5 mil"
  for (const m of original.matchAll(/R\$\s*([\d.,]+)\s*(mil|k)\b/giu)) {
    const n = Number(String(m[1]).replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(n)) achados.push(n * 1000);
  }
  // "R$ 60.000", "R$ 60.000,00"
  for (const m of original.matchAll(/R\$\s*([\d]{1,3}(?:\.[\d]{3})+|[\d]{4,})(?:,\d{2})?(?!\s*(?:mil|k)\b)/giu)) {
    const n = Number(String(m[1]).replace(/\./g, ''));
    if (Number.isFinite(n)) achados.push(n);
  }
  // "USD 5,000" e "$5,000" nao sao tratados: a tabela e em real e converter
  // seria inventar cambio. Peca em dolar precisa passar pelo comercial.
  return [...new Set(achados)];
}

/** Percentuais de desconto citados no texto ("-10%", "10% off", "10% de desconto"). */
export function percentuaisDeDesconto(texto) {
  const original = String(texto ?? '');
  const alvo = normalizar(original);
  const achados = [];
  for (const m of alvo.matchAll(/(\d{1,2})\s*%/g)) {
    const idx = m.index ?? 0;
    const janela = alvo.slice(Math.max(0, idx - 40), Math.min(alvo.length, idx + 40));
    if (/desconto|off|discount|abatimento|menos|combo|parceir|sociedade|society/.test(janela) || /-\s*\d{1,2}\s*%/.test(alvo)) {
      achados.push(Number(m[1]));
    }
  }
  return [...new Set(achados)];
}
