/**
 * Roda as 9 regras do MCP sobre cada peca escrita pelos agentes de copy.
 *
 * Le os .md do scratchpad, quebra por peca (cada "## " vira uma peca), infere
 * canal/eixo/praca do cabecalho quando possivel, e devolve o veredito por peca.
 *
 * Uso: node verifica-copys.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { runRules } = await import(new URL('../src/rules/index.js', import.meta.url).href);

// Le as copys arquivadas no proprio repo, nao o scratchpad da sessao.
const BASE = new URL('../docs/', import.meta.url).pathname.replace(/^\//, '');

// `quebra` define o nivel de titulo que separa PECAS.
// A LP e UM documento: cada "## " dela e uma secao, nao uma peca. Quebrar por
// "## " fazia cada secao ser avaliada sozinha, e o gate de elegibilidade
// (R-001) acusava ausencia em oito secoes de uma pagina que DECLARA o gate na
// secao 2. Alerta falso nasce assim: nao da regra, do recorte.
const ARQUIVOS = [
  { nome: 'copy-lps.md', canal: 'landing_page', praca: 'internacional', quebra: /^# /m },
  { nome: 'copy-instagram.md', canal: 'instagram', praca: 'internacional', quebra: /^## /m },
  { nome: 'copy-base-quente.md', canal: 'whatsapp', praca: 'brasil', quebra: /^### /m },
];

/** Canal declarado no texto da peca ganha do padrao do arquivo. */
function canalDe(texto, padrao) {
  const t = texto.toLowerCase();
  if (/\be-?mail\b/.test(t.slice(0, 300))) return 'email';
  if (/whatsapp/.test(t.slice(0, 300))) return 'whatsapp';
  if (/landing page|\bLP\b/i.test(t.slice(0, 300))) return 'landing_page';
  if (/carrossel|reels|card|story/.test(t.slice(0, 300))) return 'instagram';
  return padrao;
}

function eixoDe(texto) {
  const t = texto.toLowerCase();
  const rino = (t.match(/rino/g) || []).length;
  const face = (t.match(/face/g) || []).length;
  if (rino > face * 1.5) return 'rinoplastia';
  if (face > rino * 1.5) return 'face';
  return 'combo';
}

let totalPecas = 0;
let bloqueadas = 0;
let ajustar = 0;

for (const { nome, canal, praca, quebra } of ARQUIVOS) {
  const caminho = `${BASE}/${nome}`;
  if (!existsSync(caminho)) {
    console.log(`\n### ${nome} — ainda nao entregue`);
    continue;
  }
  const texto = readFileSync(caminho, 'utf8');
  const partes = texto.split(quebra).slice(1);

  console.log(`\n### ${nome} — ${partes.length} bloco(s)`);

  for (const parte of partes) {
    const titulo = parte.split('\n')[0].trim().slice(0, 70);
    const corpo = parte;
    if (corpo.split(/\s+/).length < 25) continue;

    totalPecas++;
    const ctx = { canal: canalDe(corpo, canal), eixo: eixoDe(corpo), idioma: 'pt', praca };
    const r = runRules(corpo, ctx);

    if (r.veredito === 'BLOQUEADO') bloqueadas++;
    if (r.veredito === 'AJUSTAR') ajustar++;

    const marca = r.veredito === 'APROVADO' ? 'ok  ' : r.veredito === 'AJUSTAR' ? 'AJU ' : 'BLOQ';
    console.log(`  ${marca} ${titulo}`);
    for (const b of r.blockers) console.log(`         BLOQUEIO ${b.regra_id}: ${String(b.detalhe).slice(0, 110)}`);
    for (const a of r.alertas) console.log(`         alerta   ${a.regra_id}: ${String(a.detalhe).slice(0, 110)}`);
  }
}

console.log(`\n== ${totalPecas} pecas · ${bloqueadas} bloqueadas · ${ajustar} com alerta ==`);
