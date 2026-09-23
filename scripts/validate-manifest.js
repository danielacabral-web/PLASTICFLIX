#!/usr/bin/env node
/**
 * Gate: manifest <-> handlers.
 *
 * Mesma checagem que o boot faz, disponivel como comando. Roda em npm run
 * validate e pode ser ligado como hook. Contrato dos gates: exit 0 = PASS,
 * exit 2 = FAIL.
 *
 * A exigencia de agente se LIGA SOZINHA quando squad/agents/ passa a existir -
 * nao ha flag para lembrar de virar, e por isso ninguem esquece.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { montarRegistry, ErroDeRegistry } from '../src/registry.js';
import { RAIZ } from '../src/version.js';

const exigirAgente = existsSync(join(RAIZ, 'squad', 'agents'));

try {
  const { tools } = await montarRegistry({ exigirAgente });
  console.log(
    `PASS  manifest e handlers conferem: ${tools.size} tool(s)` +
      (exigirAgente
        ? ' com agente do squad validado'
        : ' (checagem de agente desligada: squad/agents/ ainda nao existe)')
  );
  console.log(`      ${[...tools.keys()].join(', ')}`);
  process.exit(0);
} catch (e) {
  if (e instanceof ErroDeRegistry) {
    console.error('FAIL  registry inconsistente:');
    for (const p of e.problemas) console.error(`      - ${p}`);
    process.exit(2);
  }
  console.error(`FAIL  erro inesperado: ${e.stack || e}`);
  process.exit(2);
}
