/**
 * Fonte UNICA da versao e do nome do servidor.
 *
 * A versao existe em um lugar so: o package.json, lido em runtime. O gate
 * scripts/validate-version-sync.js garante que nenhum outro arquivo do repo
 * declare uma versao propria - e assim ninguem precisa lembrar de sincronizar
 * quatro manifestos na mao.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raizProjeto = join(dirname(fileURLToPath(import.meta.url)), '..');

const pkg = JSON.parse(readFileSync(join(raizProjeto, 'package.json'), 'utf8'));

export const RAIZ = raizProjeto;
export const NOME_SERVIDOR = pkg.name;
export const VERSAO = pkg.version;
