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

/**
 * Percentuais de DESCONTO citados no texto ("-10%", "10% off", "10% de desconto").
 *
 * Nem todo percentual e desconto. A condicao de pagamento do projeto e "30% de
 * entrada e o restante em ate 6x", e esse 30 nao pode ser lido como corte de
 * preco — mas era o que acontecia: a versao anterior testava o padrao "-\d%"
 * contra o TEXTO INTEIRO em vez da janela ao redor do numero. Bastava a peca
 * citar o combo de -10% em qualquer paragrafo para que todo percentual do
 * documento virasse desconto, inclusive a entrada. Erro de escopo, e ele
 * reprovou copy correta em tres pecas de venda.
 *
 * A regra de leitura que vale aqui: gate que bloqueia peca certa nao e
 * rigoroso, e quebrado. Ele treina o time a ignorar o veredito.
 */
const CONTEXTO_DE_DESCONTO = /desconto|off\b|discount|abatimento|combo|parceir|sociedade|society|a menos/;
const CONTEXTO_DE_PAGAMENTO = /entrada|parcel|cartao|sinal|a vista|financiamento/;

export function percentuaisDeDesconto(texto) {
  const original = String(texto ?? '');
  const alvo = normalizar(original);
  const achados = [];

  for (const m of alvo.matchAll(/(\d{1,2})\s*%/g)) {
    const idx = m.index ?? 0;
    const janela = alvo.slice(Math.max(0, idx - 40), Math.min(alvo.length, idx + 40));

    // Condicao de pagamento vence: "30% de entrada" nunca e desconto.
    if (CONTEXTO_DE_PAGAMENTO.test(janela)) continue;

    // O sinal de menos colado tambem so conta se estiver NESTE numero.
    const menosColado = new RegExp(`-\\s*${m[1]}\\s*%`).test(janela);

    if (CONTEXTO_DE_DESCONTO.test(janela) || menosColado) {
      achados.push(Number(m[1]));
    }
  }
  return [...new Set(achados)];
}

/**
 * O termo aparece SEMPRE negado? ("nao ha promocao", "nunca por promocao")
 *
 * Existe porque a regra de preco reprovava a frase que DECLARA a politica
 * correta: "Nao ha promocao, condicao especial nem corte de valor fora dessa
 * regra". A peca estava certa e o gate a derrubou por casar a palavra sem ler
 * a frase. Dizer de frente o que nao se faz e uma das sete regras de tom do
 * projeto — o verificador nao pode punir justamente isso.
 *
 * Basta UMA ocorrencia afirmativa para o veto valer.
 */
export function apareceSempreNegado(textoNormalizado, termo) {
  const t = String(textoNormalizado ?? '');
  const alvo = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let houveOcorrencia = false;

  for (const m of t.matchAll(new RegExp(alvo, 'g'))) {
    houveOcorrencia = true;
    const antes = t.slice(Math.max(0, (m.index ?? 0) - 45), m.index ?? 0);
    const negado = /\b(nao ha|nao existe|nao e|nao sao|nunca|sem|jamais|nada de|fora de)\b[^.]*$/.test(antes);
    if (!negado) return false;
  }
  return houveOcorrencia;
}
