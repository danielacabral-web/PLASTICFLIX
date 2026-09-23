#!/usr/bin/env node
/**
 * Gate: a versao existe em um lugar so.
 *
 * Servidor MCP costuma carregar versao divergente em quatro arquivos
 * (package.json, o .js do servidor, o mcp.json, o plugin.yaml). Ninguem sabe
 * qual e a real, e o servidor anuncia uma coisa enquanto o manifest diz outra.
 *
 * Aqui: package.json e a unica fonte. Este gate falha se qualquer outro arquivo
 * declarar uma versao propria.
 *
 * exit 0 = PASS, exit 2 = FAIL.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { RAIZ, VERSAO } from '../src/version.js';

const problemas = [];

// mcp.json nao deve ter campo version.
const manifest = JSON.parse(readFileSync(join(RAIZ, 'mcp.json'), 'utf8'));
if (manifest.version !== undefined) {
  problemas.push(
    `mcp.json declara version "${manifest.version}". Remova o campo: a versao vive so no package.json, ` +
      'lida em runtime por src/version.js.'
  );
}

// squad.yaml e squad/config.yaml, quando existirem, tem de bater com o
// package.json. O config.yaml declara version porque o validador do AIOX exige
// o campo - e por isso ele entra aqui tambem, senao viraria a quinta versao
// divergente que este gate existe para impedir.
for (const rel of [join('squad', 'squad.yaml'), join('squad', 'config.yaml')]) {
  const caminho = join(RAIZ, rel);
  if (!existsSync(caminho)) continue;
  const doc = parse(readFileSync(caminho, 'utf8'));
  const versaoDeclarada = doc?.squad?.version ?? doc?.version;
  if (versaoDeclarada && versaoDeclarada !== VERSAO) {
    problemas.push(`${rel} declara version "${versaoDeclarada}", package.json diz "${VERSAO}"`);
  }
}

// Nenhum .js deve ter versao literal hardcoded.
const suspeitos = [join('src', 'server.js'), join('src', 'registry.js'), join('src', 'version.js')];
for (const rel of suspeitos) {
  const caminho = join(RAIZ, rel);
  if (!existsSync(caminho)) continue;
  const texto = readFileSync(caminho, 'utf8');
  const achado = texto.match(/version\s*[:=]\s*['"]\d+\.\d+\.\d+['"]/);
  if (achado) problemas.push(`${rel} tem versao hardcoded: ${achado[0]}`);
}

if (problemas.length > 0) {
  console.error(`FAIL  ${problemas.length} problema(s) de versao:`);
  for (const p of problemas) console.error(`      - ${p}`);
  process.exit(2);
}

console.log(`PASS  versao unica: ${VERSAO} (package.json)`);
process.exit(0);
