#!/usr/bin/env node
/**
 * plasticflix-mcp - servidor MCP do projeto Plasticflix Prime.
 *
 * Transporte e roteamento apenas. A logica de cada tool vive em src/tools/,
 * as regras com veto em src/rules/, e os dados do projeto em data/.
 *
 * Nenhuma tool deste servidor faz I/O de rede. Os handlers devolvem instrucoes
 * para o agente executar com os conectores ja autenticados (Google Drive,
 * ClickUp, Reportei, Meta Ads). Por isso o servidor roda com env vazio e nao
 * carrega credencial nenhuma.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { NOME_SERVIDOR, VERSAO, RAIZ } from './version.js';
import { montarRegistry, ErroDeRegistry } from './registry.js';
import { registrar } from './telemetry.js';

async function principal() {
  // Enquanto o squad nao existe, a checagem tool -> agente fica desligada,
  // sem afrouxar nenhuma das demais.
  const exigirAgente = existsSync(join(RAIZ, 'squad', 'agents'));

  let registry;
  try {
    registry = await montarRegistry({ exigirAgente });
  } catch (e) {
    if (e instanceof ErroDeRegistry) {
      // Falha alto e barulhento. O erro que estamos evitando aqui e o oposto:
      // subir com uma tool listada que quebra quando o agente a chama.
      process.stderr.write(
        `\n[plasticflix-mcp] O servidor nao subiu porque o registry de tools esta inconsistente.\n\n${e.message}\n\n`
      );
      process.exit(1);
    }
    throw e;
  }

  const { tools } = registry;

  const servidor = new Server(
    { name: NOME_SERVIDOR, version: VERSAO },
    { capabilities: { tools: {} } }
  );

  // tools/list sai do MESMO mapa validado que atende tools/call.
  // Nao existe segunda estrutura para divergir.
  servidor.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [...tools.values()].map(({ definicao }) => ({
      name: definicao.name,
      description: definicao.description,
      inputSchema: definicao.inputSchema,
      annotations: definicao.annotations,
    })),
  }));

  servidor.setRequestHandler(CallToolRequestSchema, async (pedido) => {
    const nome = pedido.params.name;
    const args = pedido.params.arguments ?? {};
    const entrada = tools.get(nome);

    // Inalcancavel pela validacao de boot, mas o guard fica: se um dia alguem
    // reintroduzir uma segunda lista, o erro precisa ser legivel.
    if (!entrada) {
      registrar('tool_desconhecida', { tool: nome });
      return {
        isError: true,
        content: [{ type: 'text', text: `Tool desconhecida: ${nome}` }],
      };
    }

    const inicio = Date.now();
    try {
      const resultado = await entrada.handler(args, { tools });
      registrar('tool_ok', { tool: nome, ms: Date.now() - inicio });
      return {
        content: [{ type: 'text', text: JSON.stringify(resultado, null, 2) }],
      };
    } catch (e) {
      // Erro de handler volta como conteudo de erro, nao derruba o servidor:
      // uma tool com defeito nao pode tirar as outras nove do ar.
      registrar('tool_erro', { tool: nome, ms: Date.now() - inicio, erro: e.message });
      return {
        isError: true,
        content: [{ type: 'text', text: `Erro em ${nome}: ${e.message}` }],
      };
    }
  });

  registrar('boot', { versao: VERSAO, tools: tools.size, exigirAgente });
  await servidor.connect(new StdioServerTransport());
}

principal().catch((e) => {
  process.stderr.write(`[plasticflix-mcp] falha fatal: ${e?.stack || e}\n`);
  process.exit(1);
});
