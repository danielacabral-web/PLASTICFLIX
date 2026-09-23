/**
 * Telemetria append-only em JSONL.
 *
 * Grava em _telemetry/plasticflix-YYYY-MM.jsonl (fora do git, ver .gitignore).
 * Desliga com PLASTICFLIX_TELEMETRY=0.
 *
 * Nunca registra o texto submetido a analise - so metadados. Copy em avaliacao
 * pode conter preco de lote, nome de lead e material nao publicado; um log em
 * disco seria exatamente o vazamento que as regras do projeto existem para
 * impedir.
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './version.js';

const LIGADA = process.env.PLASTICFLIX_TELEMETRY !== '0';
const DIR = join(RAIZ, '_telemetry');

/**
 * @param {string} evento  ex.: 'tool_ok', 'tool_erro', 'boot'
 * @param {Record<string, unknown>} dados  metadados; sem conteudo de copy
 */
export function registrar(evento, dados = {}) {
  if (!LIGADA) return;
  try {
    mkdirSync(DIR, { recursive: true });
    const agora = new Date();
    const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
    const linha = JSON.stringify({ ts: agora.toISOString(), evento, ...dados });
    appendFileSync(join(DIR, `plasticflix-${mes}.jsonl`), linha + '\n', 'utf8');
  } catch {
    // Telemetria nunca derruba o servidor nem polui o stdout (que e o transporte).
  }
}
