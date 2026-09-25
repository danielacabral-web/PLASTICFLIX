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
import catalogo from '../src/tools/catalogo_entregaveis.js';
import { carregarYaml } from '../src/data/carregar.js';

describe('perfil_plasticflix', () => {
  test('o aviso de que nao existe paciente sai em TODO recorte', async () => {
    for (const secao of ['tudo', 'socios', 'evento', 'objetivo', 'time', 'governanca', 'historico']) {
      const r = await perfil({ secao });
      assert.ok(r.atencao?.nao_existe_paciente_neste_projeto, `secao ${secao} perdeu o aviso`);
    }
  });

  // O teste era sobre o ANO estar vazio. O ano foi confirmado em 24/09 por
  // fonte publica do proprio cliente, entao o caso mudou de lado. O que
  // precisa continuar verdadeiro nao e "o ano e null" — e que a tool NUNCA
  // preenche sozinha um campo vazio e sempre declara quais estao em aberto.
  test('declara os campos em aberto em vez de preenche-los', async () => {
    const r = await perfil();
    assert.ok(Array.isArray(r.dados_em_aberto));
    const perfilYaml = carregarYaml('perfil-plasticflix');
    const cirurgia = (perfilYaml.evento?.grade || []).find((d) => d.formato === 'cirurgia_ao_vivo');
    if (cirurgia?.local === null) {
      assert.ok(
        r.dados_em_aberto.some((d) => d.campo.includes('cirurgia_ao_vivo')),
        'o hospital segue vazio e precisa aparecer como campo em aberto'
      );
    }
    for (const d of r.dados_em_aberto) {
      assert.ok(d.trava, `${d.campo} nao diz o que trava`);
    }
  });

  test('quando um campo e preenchido, ele sai da lista de abertos', async () => {
    const r = await perfil();
    const { evento } = carregarYaml('perfil-plasticflix');
    if (evento.ano !== null) {
      assert.ok(
        !r.dados_em_aberto.some((d) => d.campo === 'evento.ano'),
        'o ano foi preenchido e nao deveria mais constar como aberto'
      );
    }
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

  // Antes de 24/09 o ano era null e este teste cobria a recusa de contar. Com
  // o ano confirmado, o caso inverteu: a contagem PRECISA sair, e sair certa.
  // A condicao testada continua sendo a mesma regra — a tool so conta quando
  // tem as duas pontas.
  test('com data de referencia e ano conhecido, a contagem sai', async () => {
    const { ano } = carregarYaml('calendario');
    const r = await calendario({ hoje: '2026-09-24' });
    if (ano === null) {
      assert.equal(r.contagem_regressiva.calculada, false);
      assert.match(r.contagem_regressiva.motivo, /ano do evento/i);
      return;
    }
    assert.equal(r.contagem_regressiva.calculada, true);
    assert.equal(typeof r.contagem_regressiva.dias_restantes, 'number');
    assert.ok(r.contagem_regressiva.dias_restantes > 0, 'o evento ainda nao aconteceu');
    assert.ok(r.contagem_regressiva.leitura, 'a contagem sem leitura de prioridade nao serve');
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

  // O ano saiu da lista quando foi confirmado. O que o briefing precisa
  // continuar fazendo e avisar sobre o que AINDA esta vazio — hoje, o hospital
  // da cirurgia ao vivo e as datas de virada de lote.
  test('avisa o que esta travado por dado nao confirmado', async () => {
    const r = await briefing({ tipo: 'carrossel', eixo: 'rinoplastia' });
    const { lotes } = carregarYaml('produtos');
    if (lotes.virada_lote_1 === null) {
      assert.ok(
        r.dados_travados.quais.some((q) => /virada de lote/.test(q)),
        'as datas de lote seguem vazias e precisam ser sinalizadas'
      );
    }
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

  // O idioma publico foi revertido para pt-BR em 24/09/2026. Ate entao este
  // teste cobria o caso inverso — pedir portugues gerava alerta. O caso testado
  // e sempre "pedir o idioma que NAO e o vigente", e o vigente vem do YAML.
  test('pedir um idioma diferente do vigente gera alerta', async () => {
    const { idioma } = carregarYaml('comunicacao');
    const outro = String(idioma.publico).startsWith('pt') ? 'en' : 'pt';
    const r = await copy({ tipo: 'carrossel', eixo: 'face', idioma: outro });
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

describe('catalogo_entregaveis', () => {
  test('todo item declara a referencia do ciclo anterior', async () => {
    const r = await catalogo();
    const itens = r.categorias.flatMap((c) => c.itens);
    assert.ok(itens.length > 0);
    for (const i of itens) {
      assert.ok(i.referencia_no_ciclo_anterior, `${i.item} nao diz de onde veio`);
    }
  });

  test('separa o que pode comecar do que esta bloqueado por lacuna', async () => {
    const r = await catalogo();
    assert.equal(r.balanco.pode_comecar + r.balanco.bloqueado, r.total_de_itens);
    assert.ok(r.balanco.bloqueado > 0, 'ha lacunas bloqueantes abertas, entao ha item travado');
  });

  test('o logo esta bloqueado pela divergencia de numeracao da edicao', async () => {
    const r = await catalogo({ categoria: 'identidade' });
    const logo = r.categorias[0].itens[0];
    assert.equal(logo.pode_comecar, false);
    assert.ok(logo.travado_por.some((l) => l.id === 'L-010'));
  });

  // Dependencia escrita em prosa nao vira lacuna sozinha — mas tambem nao pode
  // sumir do relatorio, senao o backlog parece mais livre do que e.
  test('dependencia sem lacuna catalogada aparece no balanco', async () => {
    const r = await catalogo();
    assert.ok(Array.isArray(r.balanco.itens_com_dependencia_nao_catalogada));
    const comDep = r.categorias
      .flatMap((c) => c.itens)
      .filter((i) => i.dependencias_sem_lacuna);
    assert.equal(comDep.length, r.balanco.itens_com_dependencia_nao_catalogada.length);
  });

  test('categoria invalida devolve as validas', async () => {
    const r = await catalogo({ categoria: 'inexistente' });
    assert.ok(r.erro);
    assert.ok(r.categorias_validas.includes('certificados'));
  });
});

describe('calendario_projeto — revisao de 8 fases', () => {
  test('toda fase diz para que existe e como se sabe que funcionou', async () => {
    const r = await calendario();
    assert.equal(r.fases.length, 8);
    for (const f of r.fases) {
      assert.ok(f.objetivo, `${f.id} sem objetivo`);
      assert.ok(f.indicador, `${f.id} sem indicador`);
      assert.ok(f.prova, `${f.id} sem prova`);
    }
  });

  test('a fase de prova publica vem antes da de trafego', async () => {
    const r = await calendario();
    const prova = r.fases.findIndex((f) => f.nome === 'prova_publica');
    const trafego = r.fases.findIndex((f) => f.nome === 'teste_de_trafego');
    assert.ok(prova >= 0 && trafego >= 0);
    assert.ok(prova < trafego, 'nao se paga por atencao sem ter o que mostrar');
  });
});

describe('documentacao — indice x secoes', () => {
  // O README tem um indice no topo que aponta para as secoes. Indice e secoes
  // sao duas listas mantidas no mesmo arquivo, e duas listas paralelas sempre
  // divergem — foi o padrao que produziu as sete tools fantasma do
  // stark-agenda. Aqui o teste e a unica coisa que impede a divergencia.
  test('toda secao do README aparece no indice, e vice-versa', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { RAIZ } = await import('../src/version.js');
    const texto = readFileSync(join(RAIZ, 'README.md'), 'utf8');

    const secoes = [...texto.matchAll(/^##\s+secao:\s*(\S+)\s*$/gm)].map((m) => m[1]);
    const noIndice = [...texto.matchAll(/\[([a-z-]+)\]\(#secao-([a-z-]+)\)/g)].map((m) => m[2]);

    for (const s of secoes) {
      assert.ok(noIndice.includes(s), `a secao "${s}" existe no README e nao esta no indice`);
    }
    for (const i of new Set(noIndice)) {
      assert.ok(secoes.includes(i), `o indice aponta para "${i}", que nao existe como secao`);
    }
  });

  test('nenhuma secao do README ficou vazia', async () => {
    const indice = await documentacao();
    for (const s of indice.secoes) {
      assert.ok(s.linhas > 3, `a secao "${s.id}" tem ${s.linhas} linhas — provavelmente ficou vazia`);
    }
  });
});

describe('R-005 — os dois falsos positivos que reprovaram copy correta', () => {
  // Achados em 24/09, quando o squad de copy entregou 33 pecas e quatro foram
  // bloqueadas sem motivo. Gate que reprova peca certa nao e rigoroso, e
  // quebrado: treina o time a ignorar o veredito.
  test('"30% de entrada" e condicao de pagamento, nao desconto', async () => {
    const { runRules } = await import('../src/rules/index.js');
    const texto =
      'O lab de Face custa R$ 60.000 no 1o lote. Pagamento: 30% de entrada e o restante em ate 6x ' +
      'no cartao. O combo Rino + Face tem 10% de desconto.';
    const r = runRules(texto, { canal: 'whatsapp', eixo: 'face', idioma: 'pt', praca: 'brasil' });
    const desconto = r.blockers.filter((b) => b.padrao === 'desconto-nao-previsto');
    assert.equal(desconto.length, 0, 'a entrada de 30% foi lida como desconto');
  });

  test('desconto real fora das excecoes segue bloqueando', async () => {
    const { runRules } = await import('../src/rules/index.js');
    const r = runRules('25% de desconto no lab de Face para quem fechar esta semana.', {
      canal: 'whatsapp', eixo: 'face', idioma: 'pt', praca: 'brasil',
    });
    assert.ok(r.blockers.some((b) => b.padrao === 'desconto-nao-previsto'));
  });

  test('negar promocao nao e justificar preco por promocao', async () => {
    const { runRules } = await import('../src/rules/index.js');
    const texto =
      'O preco se move por lote, com data declarada. Nao ha promocao, condicao especial nem corte ' +
      'de valor fora dessa regra. O 1o lote vai ate a data declarada.';
    const r = runRules(texto, { canal: 'landing_page', eixo: 'face', idioma: 'pt', praca: 'brasil' });
    const just = r.blockers.filter((b) => b.padrao === 'justificativa-fora-de-lote');
    assert.equal(just.length, 0, 'a peca declara a politica correta e foi reprovada por isso');
  });

  test('promocao afirmada segue bloqueando', async () => {
    const { runRules } = await import('../src/rules/index.js');
    const r = runRules('Aproveite nossa promocao de lancamento no lab de Face por tempo limitado.', {
      canal: 'landing_page', eixo: 'face', idioma: 'pt', praca: 'brasil',
    });
    assert.ok(r.blockers.some((b) => b.padrao === 'justificativa-fora-de-lote'));
  });
});
