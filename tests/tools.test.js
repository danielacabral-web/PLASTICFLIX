/**
 * Testes das tools. Cobrem o contrato que o registry NAO consegue garantir:
 * que o handler responde algo util, que o modo barato e mesmo o padrao, e que
 * dado nao confirmado nunca sai preenchido.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import perfil from '../src/tools/perfil_plasticflix.js';
import demandas from '../src/tools/planejar_demandas.js';
import calendario from '../src/tools/calendario_projeto.js';
import briefing from '../src/tools/briefing_entrega.js';
import oferta from '../src/tools/oferta_precos.js';
import publico from '../src/tools/base_publico.js';
import copy from '../src/tools/escrever_copy.js';
import verificar from '../src/tools/verificar_conteudo.js';
import lacunas from '../src/tools/status_lacunas.js';
import documentacao from '../src/tools/documentacao.js';
import { carregarYaml } from '../src/data/carregar.js';

describe('perfil_plasticflix', () => {
  test('o aviso de que nao existe paciente sai em TODO recorte', async () => {
    for (const secao of ['tudo', 'socios', 'evento', 'objetivo', 'time', 'governanca', 'historico']) {
      const r = await perfil({ secao });
      assert.ok(r.atencao?.nao_existe_paciente_neste_projeto, `secao ${secao} perdeu o aviso`);
    }
  });

  test('lista os campos em aberto em vez de preenche-los', async () => {
    const r = await perfil();
    assert.ok(Array.isArray(r.dados_em_aberto));
    assert.ok(r.dados_em_aberto.some((d) => d.campo === 'evento.ano'));
    assert.equal(r.evento.ano, null);
  });

  test('secao invalida devolve erro com as validas', async () => {
    const r = await perfil({ secao: 'inexistente' });
    assert.ok(r.erro);
    assert.ok(r.secoes_validas.includes('tudo'));
  });
});

describe('planejar_demandas', () => {
  test('o padrao e o resumo, nao o payload do ClickUp', async () => {
    const r = await demandas();
    assert.equal(r.modo, 'resumo');
    assert.equal(r.payload, undefined);
  });

  test('separa demanda do cliente de demanda da Stark', async () => {
    const r = await demandas();
    assert.ok(Array.isArray(r.demandas_da_stark));
    assert.ok(Array.isArray(r.bloqueios_do_cliente));
    assert.ok(r.bloqueios_do_cliente.length > 0, 'o kickoff tem demandas com dono do lado do cliente');
  });

  // O numero de frentes vem do YAML, nao daqui. A versao anterior deste teste
  // travava em 5 e quebrou quando a F6 (materiais e impressos) entrou a partir
  // do inventario do ciclo anterior. Um teste que precisa ser editado toda vez
  // que o dado cresce nao esta testando o handler — esta testando o YAML.
  test('formato clickup devolve hierarquia mae -> frente -> subtask', async () => {
    const { frentes } = carregarYaml('frentes');
    const r = await demandas({ formato: 'clickup' });
    assert.equal(r.modo, 'clickup');
    assert.ok(r.payload.task_mae.nome);
    assert.equal(r.payload.frentes.length, frentes.length);
    assert.ok(r.payload.frentes.some((f) => f.subtasks.length > 0));
  });

  // O container foi decidido em 24/09/2026: lista "Planos de Acao" (901306206394),
  // a mesma da task-mae da OpenMind. Ate essa data o teste cobria o caminho
  // oposto — destino null com nota de BLOQUEADO. Preencher o dado mudou o
  // comportamento sem que nenhuma linha do handler fosse tocada, que e
  // exatamente o desenho pretendido: o codigo le o dado, nao o repete.
  test('com o destino decidido, o payload aponta para a lista e nao acusa bloqueio', async () => {
    const r = await demandas({ formato: 'clickup' });
    assert.equal(r.payload.destino, '901306206394');
    assert.equal(r.payload.destino_nota, null);
  });

  test('filtro sem resultado explica em vez de devolver lista vazia', async () => {
    const r = await demandas({ dono: 'ninguem-com-esse-nome' });
    assert.equal(r.encontradas, 0);
    assert.ok(r.donos_conhecidos.length > 0);
  });
});

describe('calendario_projeto', () => {
  test('sem data de referencia, nao inventa hoje', async () => {
    const r = await calendario();
    assert.equal(r.contagem_regressiva.calculada, false);
    assert.match(r.contagem_regressiva.motivo, /referencia/i);
  });

  test('com data valida mas ano do evento nulo, explica por que nao conta', async () => {
    const r = await calendario({ hoje: '2026-09-23' });
    assert.equal(r.contagem_regressiva.calculada, false);
    assert.match(r.contagem_regressiva.motivo, /ano do evento/i);
  });

  test('data em formato ambiguo e recusada, nao adivinhada', async () => {
    const r = await calendario({ hoje: '23/09/2026' });
    assert.equal(r.contagem_regressiva.calculada, false);
    assert.match(r.contagem_regressiva.motivo, /AAAA-MM-DD/);
  });
});

describe('briefing_entrega', () => {
  test('escolhe UMA prova como espinha dorsal', async () => {
    const r = await briefing({ tipo: 'landing_page', eixo: 'face' });
    assert.ok(r.briefing.espinha_dorsal.prova);
    assert.match(r.briefing.espinha_dorsal.instrucao, /nao carrega nenhuma/);
  });

  test('avisa o que esta travado por dado nao confirmado', async () => {
    const r = await briefing({ tipo: 'carrossel', eixo: 'rinoplastia' });
    assert.ok(r.dados_travados.quais.some((q) => /ano do evento/.test(q)));
  });

  test('tipo sem template devolve os validos', async () => {
    const r = await briefing({ tipo: 'outdoor', eixo: 'face' });
    assert.ok(r.erro);
    assert.ok(r.tipos_validos.includes('landing_page'));
  });
});

describe('oferta_precos', () => {
  test('o piso da Face sai marcado como interno', async () => {
    const r = await oferta({ produto: 'lab_face' });
    const p = r.produtos[0];
    assert.match(p.piso_negociado.USO, /INTERNO/);
  });

  test('objecao de variacao de preco devolve a regra de lote', async () => {
    const r = await oferta({ objecao: 'a medica perguntou por que mudou de 20 para 25' });
    assert.equal(r.argumento_para_a_objecao.encontrado, true);
    assert.ok(r.argumento_para_a_objecao.argumentos.some((a) => /lote/.test(a)));
  });

  test('objecao desconhecida nao improvisa condicao comercial', async () => {
    const r = await oferta({ objecao: 'xyzzy' });
    assert.equal(r.argumento_para_a_objecao.encontrado, false);
    assert.match(r.argumento_para_a_objecao.nota, /Nao improvise/);
  });

  test('datas de virada saem como nao definidas', async () => {
    const r = await oferta();
    assert.equal(r.datas_de_virada.definidas, false);
  });
});

describe('base_publico', () => {
  test('as bases saem ordenadas por temperatura', async () => {
    const r = await publico({ recorte: 'bases' });
    const ordens = r.bases.map((b) => b.ordem_de_temperatura);
    assert.deepEqual(ordens, [...ordens].sort((a, b) => a - b));
  });

  test('a elegibilidade traz as parafrases que tambem reprovam', async () => {
    const r = await publico({ recorte: 'elegibilidade' });
    assert.ok(r.elegibilidade.parafrases_que_tambem_falham.includes('open to all physicians'));
  });
});

describe('escrever_copy', () => {
  test('entrega a regua e nao o texto', async () => {
    const r = await copy({ tipo: 'carrossel', eixo: 'face' });
    assert.ok(r.o_leitor.quem_e);
    assert.equal(r.texto, undefined);
  });

  test('pedir portugues numa peca publica gera alerta de idioma', async () => {
    const r = await copy({ tipo: 'carrossel', eixo: 'face', idioma: 'pt' });
    assert.ok(r.alerta_de_idioma);
    assert.match(r.alerta_de_idioma, /R-004/);
  });
});

describe('verificar_conteudo', () => {
  test('texto vazio e recusado', async () => {
    const r = await verificar({ texto: '   ' });
    assert.ok(r.erro);
  });

  test('APROVADO com contexto incompleto vem com aviso explicito', async () => {
    const r = await verificar({ texto: 'Five days of hands-on training.' });
    if (r.veredito === 'APROVADO') {
      assert.match(r.aviso_de_contexto.consequencia, /nao deve ser tratado como aprovacao/);
    }
    assert.ok(r.aviso_de_contexto.faltando.length > 0);
  });

  test('promessa de transmissao da cirurgia e bloqueada', async () => {
    const r = await verificar({
      texto: 'Watch the live surgery streaming from anywhere in the world.',
      canal: 'instagram',
      eixo: 'face',
      idioma: 'en',
      praca: 'internacional',
    });
    assert.equal(r.veredito, 'BLOQUEADO');
    assert.ok(r.blockers.some((b) => b.regra_id === 'R-002'));
  });

  test('convite a publico nao elegivel e bloqueado', async () => {
    const r = await verificar({
      texto: 'Open to all physicians. Sign up now and secure your spot immediately.',
      canal: 'landing_page',
      eixo: 'rinoplastia',
      idioma: 'en',
      praca: 'internacional',
    });
    assert.equal(r.veredito, 'BLOQUEADO');
    assert.ok(r.blockers.some((b) => b.regra_id === 'R-001'));
  });

  test('o catalogo de regras sai junto do veredito', async () => {
    const r = await verificar({ texto: 'Hands-on training.', canal: 'interno', eixo: 'face', idioma: 'pt', praca: 'brasil' });
    assert.equal(r.catalogo_de_regras.length, 9);
  });
});

describe('status_lacunas', () => {
  test('o padrao e so as bloqueantes', async () => {
    const r = await lacunas();
    assert.match(r.modo, /apenas_bloqueantes/);
    assert.ok(r.nota_de_modo);
  });

  test('completo traz todas', async () => {
    const curto = await lacunas();
    const completo = await lacunas({ completo: true });
    assert.ok(completo.lacunas.length >= curto.lacunas.length);
    assert.equal(completo.lacunas.length, completo.total);
  });

  test('gera a mensagem de cobranca em vez de instruir a gerar', async () => {
    const r = await lacunas({ completo: true });
    assert.equal(r.pedido_agrupado.ha_o_que_pedir, true);
    assert.ok(r.pedido_agrupado.rascunho.length > 100);
  });

  test('acao interna da Stark nao entra no pedido ao cliente', async () => {
    const r = await lacunas({ completo: true });
    for (const interna of r.acao_interna) {
      assert.ok(!r.pedido_agrupado.ids.includes(interna.id), `${interna.id} vazou para o pedido ao cliente`);
    }
  });
});

describe('documentacao', () => {
  test('sem argumento devolve o indice, nao o documento', async () => {
    const r = await documentacao();
    assert.match(r.modo, /indice/);
    assert.ok(r.secoes.length > 0);
    assert.equal(r.conteudo, undefined);
  });

  test('cada secao do indice e recuperavel', async () => {
    const indice = await documentacao();
    for (const s of indice.secoes) {
      const r = await documentacao({ secao: s.id });
      assert.ok(r.conteudo, `secao ${s.id} veio vazia`);
    }
  });

  test('secao inexistente devolve as validas', async () => {
    const r = await documentacao({ secao: 'nao-existe' });
    assert.ok(r.erro);
    assert.ok(r.secoes_validas.length > 0);
  });
});
