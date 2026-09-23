# Plasticflix Prime — MCP e squad do projeto

Servidor MCP e squad AIOX do projeto **Plasticflix Prime**: congresso presencial
de rinoplastia e face no Instituto Quirontec, São Paulo, organizado pela Cenacon
e atendido pela Stark Marketing.

Este README é a documentação do projeto e é servido pelo protocolo através da
tool `documentacao` — o servidor não implementa `resources`, então nenhum
arquivo do repositório é alcançável pelo MCP por outro caminho.

**Fonte do domínio:** kickoff de 22/09/2026 (gravação e transcrição integral).
Fonte única. Não há histórico de campanha, DNA validado ou peça aprovada.

---

## secao: visao-geral

O projeto tem dois eixos sob um CNPJ único:

| Eixo | Sócios | Convidado internacional |
|---|---|---|
| Rinoplastia | Dr. Frederico Ken · Dr. Sérgio Furtado · Dr. Manuel Pereira | Dr. Cercan (Turquia) |
| Face | Dr. Fernando Mattioli · Dr. Valdemar Pena | 3 convidados (EUA) |

A organização executiva é da **Cenacon** (Gislaine). Existe uma plataforma de
aulas online semanais às terças, mantida pela **Neo ID**, que serve de
aquecimento para o presencial.

**Objetivo declarado pelo cliente:** posicionamento científico dos sócios, no
mesmo patamar de autoridade dos convidados internacionais.

**Objetivo real, que mede o projeto:** preencher as vagas de Face. As vendas
estão zeradas e o risco declarado é de R$ 700 a 800 mil de prejuízo.

---

## secao: evento

Instituto Quirontec, São Paulo — primeira semana de março. O evento saiu do
hotel Rosewood para o Quirontec para conter despesa.

| Dia | Atividade | Capacidade |
|---|---|---|
| 03/03 | Teóricas de Rinoplastia | 70 (anfiteatro) |
| 04/03 | Teóricas de Face | 70 (anfiteatro) |
| 05/03 | Cadáver lab de Rinoplastia | 5 vagas — 1 aluno por peça |
| 06/03 | Cadáver lab de Face | 10 vagas — 2 alunos por peça |
| 07/03 | Cirurgia ao vivo | 4 observadores por cirurgião operante |

**O ano não foi dito no kickoff** e está vazio nos dados de propósito. O hospital
da cirurgia ao vivo também não foi definido. Enquanto esses campos estiverem
vazios, a regra R-007 bloqueia qualquer peça que os afirme.

**Não há transmissão das cirurgias.** Decisão fechada: custaria cerca de R$ 100
mil, traria problema de organização e risco de superlotação com não pagantes.

---

## secao: publico

Restrito a **cirurgiões plásticos, otorrinolaringologistas e residentes
formais**. Médico generalista ou não especialista está proibido.

A equipe comercial confere **RQE ou comprovação de residência antes de efetivar
qualquer inscrição**. Isso não é filtro de qualidade de lead: é proteção contra
represália de sociedade médica, e foi o ponto mais enfático do cliente.

**Mercados, por prioridade:** México, Argentina, Chile. América Central e Europa
foram descartadas por restrição financeira ou logística. Facebook ficou fora —
médico usa pouco.

Não existe lista negra: contato desqualificado é descartado no atendimento.

---

## secao: oferta

| Produto | 1º lote | 2º lote | Vagas |
|---|---|---|---|
| Teóricas (cada eixo) | R$ 5.000 — 30 primeiros | R$ 7.000 | 70/dia |
| Cadáver lab Rinoplastia | R$ 20.000 | R$ 25.000 | 5 |
| Cadáver lab Face | R$ 60.000 (tabela) | — | 10 |
| Cirurgia ao vivo | ~R$ 10.000/vaga | — | 4 por cirurgião |
| Combo Rinoplastia + Face | −10% | | rodapé das duas LPs |
| Sociedade parceira | −10% | | em troca de divulgação no site oficial |

**Regras comerciais:**
- Dois lotes por prazo, com data de virada declarada. A justificativa ao lead é
  sempre a regra de lote.
- O site nunca baixa. Resistência de preço vira proposta do lead à diretoria —
  na Face houve resistência a R$ 60 mil, com R$ 50 mil e R$ 40 mil citados.
- Teóricas fecham online; cadáver lab exige atendimento humanizado no WhatsApp.
- Pagamento: 30% de entrada + até 6× no cartão. Link gerado pela Mara.

---

## secao: frentes

| Frente | Dono | Escopo |
|---|---|---|
| F1 Landing pages | Gustavo | duas LPs separadas, WhatsApp próprio por eixo, rodapé do combo |
| F2 Tráfego | Mateus | R$ 10 mil / 2 meses — R$ 5 mil México + R$ 5 mil Argentina |
| F3 Conteúdo | Íris | Instagram em inglês, mínimo 3 posts/semana |
| F4 Comercial e base | Marielly, com Fran e Mara | 22 leads, ex-alunos, fluxo de fechamento |
| F5 Parcerias | Cliente, com apoio Stark | sociedades de BR, AR, CL, VE, MX |

**Time da Stark:** Gustavo Ferro (estratégia), Mateus Borgo (tráfego), Íris
Gonçalves (copy), Marielly Oliveira (CS).

**Interlocutores do cliente:** Dr. Fernando Mattioli (decisor), Gislaine /
Cenacon (organização), Francieli Terres Andrade (comercial), Mara Lima
(financeiro e base de leads).

---

## secao: comunicacao

**Idioma: inglês.** Decisão do Dr. Mattioli, contra a sugestão de espanhol — os
convidados são americanos e turcos, e o público latino-americano de alto padrão
consome conteúdo internacional. É hipótese não testada: se México e Argentina
performarem mal, volta à mesa.

**As três provas do projeto:**
1. Proporção de supervisão — 1 aluno por peça na rinoplastia, 2 na face.
2. Corpo docente internacional ao lado dos sócios.
3. Semana encadeada: teoria, anatomia, cirurgia ao vivo.

**Instagram é etapa intermediária do funil**, não vitrine. O cliente queria
mandar o anúncio direto para a LP; a posição da Stark é que num produto de
R$ 20 a 60 mil a objeção cai no meio do caminho. Ficou como alerta no gate, não
como veto — é posição da agência, e o combinado foi medir.

---

## secao: regras

Nove regras em `src/rules/`, rodadas por `verificar_conteudo`. Oito com veto, uma
só de alerta.

| Id | Regra | Veto |
|---|---|---|
| R-001 | Elegibilidade e RQE | sim |
| R-002 | Sem transmissão de cirurgia | sim |
| R-003 | Sem tráfego pago no Brasil | sim |
| R-004 | Idioma inglês na peça pública | sim |
| R-005 | Preço e lote | sim |
| R-006 | Promessa e CFM | sim |
| R-007 | Dado não confirmado | sim |
| R-008 | Etapa do funil | não — alerta |
| R-009 | Lacuna bloqueante | sim |

Toda regra que depende de um fato **lê o fato do YAML**. Quando o dado for
preenchido, o veto se desarma sozinho. Isso corrige de propósito um defeito
conhecido do repo AExPI, onde um veto ficou embutido em código, o fato mudou no
mundo e o verificador seguiu reprovando copy correta.

---

## secao: arquitetura

```
mcp.json              manifest único das 10 tools — fonte da verdade
src/server.js         transporte e roteamento
src/registry.js       valida manifest ↔ handler ↔ agente; derruba o boot se divergir
src/tools/<name>.js   um handler por tool, descoberto por convenção de nome
src/rules/            as 9 regras e o motor
data/*.yaml           os dados do projeto
squad/agents/*.md     os 8 agentes do squad
scripts/              os gates de CI
```

**Invariantes garantidos em código:**
- Tool no manifest sem handler derruba o boot (tool fantasma).
- Handler sem entrada no manifest derruba o boot (handler órfão).
- Tool sem agente existente em `squad/agents/` derruba o boot.
- Versão existe só no `package.json`.
- YAML que nenhuma tool lê é erro de gate.

Nenhuma tool faz I/O de rede. Os handlers devolvem instruções para o agente
executar com os conectores já autenticados — ClickUp, Google Drive, Meta Ads.
Por isso o servidor roda com env vazio e não carrega credencial nenhuma.

---

## secao: como-rodar

```bash
npm install
npm run validate   # todos os gates
npm test           # node --test
npm run smoke      # handshake MCP
npm start          # sobe o servidor em stdio
```

Registro no cliente, via `.mcp.json` do repositório:

```json
{ "mcpServers": { "plasticflix": { "command": "node", "args": ["C:\\Users\\danie\\PLASTICFLIX\\src\\server.js"], "env": {} } } }
```

---

## secao: pendencias

O que trava, com dono do lado de lá:

| Pendência | Trava | Dono |
|---|---|---|
| Ano do evento | tudo que tenha data | Cliente |
| Hospital da cirurgia ao vivo | peça do dia 07/03 | Cliente |
| Datas de virada de lote | LP, peças e argumento comercial | Diretoria |
| Link de pagamento por produto | checkout das LPs | Mara |
| Planilha dos 22 leads | negociação ativa | Mara |
| Base de ex-alunos | exclusão e recompra | Mara |
| Fotos de autores e professores | carrosséis de corpo docente | Grupo |
| Mailings das sociedades | mala direta | Cenacon |
| Piso real da Face | argumentação comercial | Diretoria |
| Acesso ao site atual | reestruturação das LPs | Cliente |
| Container do projeto no ClickUp | lançamento das tarefas | **Stark** |

A última é ação interna: não depende de ninguém de fora.

Use `status_lacunas` para o estado atual e o rascunho do pedido agrupado — uma
mensagem com todos os itens, não pedido pingado.
