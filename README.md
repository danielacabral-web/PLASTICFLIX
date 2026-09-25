# Plasticflix Prime — MCP e squad do projeto

Servidor MCP e squad AIOX do **Plasticflix Prime**: congresso de rinoplastia e
face no Instituto Quirontec, São Paulo, **03 a 07 de março de 2027**. Organização
da Cenacon, atendimento da Stark Marketing.

| | |
|---|---|
| **O número que mede o projeto** | Face com vendas zeradas · risco de R$ 700–800 mil |
| **Quem compra** | cirurgião plástico, otorrino ou residente formal — nunca paciente |
| **Idioma** | português *(o inglês do kickoff foi revertido em 24/09)* |
| **Estado** | 11 tools · 9 regras · 8 agentes · 67 testes · 4 gates |

> Este README **é** a documentação do projeto, e é servido pelo protocolo através
> da tool `documentacao`. O servidor não implementa `resources`, então nenhum
> outro arquivo do repositório é alcançável pelo MCP.

**Fontes do domínio, em ordem de descoberta:** kickoff de 22/09/2026 (gravação e
transcrição) → inventário do Drive (24/09) → canais públicos do cliente (24/09).
As duas últimas contradizem a primeira em pontos importantes — ver
[conflitos](#secao-conflitos).

---

## Índice

| Seção | O que responde |
|---|---|
| [visao-geral](#secao-visao-geral) | o que é o projeto e quem é quem |
| [evento](#secao-evento) | os cinco dias, capacidade e o que está confirmado |
| [publico](#secao-publico) | quem pode comprar e o gate de RQE |
| [oferta](#secao-oferta) | preços, lotes e regras comerciais |
| [posicionamento](#secao-posicionamento) | a categoria, e por que a Face "cara" não é problema de preço |
| [comunicacao](#secao-comunicacao) | idioma, provas, narrativa e o conflito de tom |
| [frentes](#secao-frentes) | as 13 frentes e seus donos |
| [entregaveis](#secao-entregaveis) | as 28 peças e o que trava cada uma |
| [calendario](#secao-calendario) | as 8 fases, contadas para trás |
| [conflitos](#secao-conflitos) | onde o cliente contradiz o cliente |
| [regras](#secao-regras) | os 9 vetos e como funcionam |
| [arquitetura](#secao-arquitetura) | como o servidor é montado e o que ele garante |
| [tools](#secao-tools) | as 11 tools, o que cada uma faz |
| [como-rodar](#secao-como-rodar) | instalar, validar, registrar |
| [pendencias](#secao-pendencias) | as 16 lacunas, com dono |

---

## secao: visao-geral

Dois eixos sob um **CNPJ único**, com organização executiva da **Cenacon**:

| Eixo | Sócios | Convidado internacional |
|---|---|---|
| Rinoplastia | Dr. Frederico Ken · Dr. Sérgio Furtado · Dr. Manuel Pereira | Dr. Cercan (Turquia) |
| Face | Dr. Fernando Mattioli · Dr. Valdemar Pena | 3 convidados dos EUA ⬜ nomes não confirmados |

Existe também uma **plataforma de aulas online semanais às terças** (Neo ID), que
serve de aquecimento — e que é, ao mesmo tempo, a alternativa competitiva mais
desconfortável do projeto. Ver [posicionamento](#secao-posicionamento).

### Os dois objetivos, que não são o mesmo

**Declarado pelo cliente:** posicionamento científico dos sócios, no mesmo
patamar dos convidados internacionais. Lucro imediato não é a meta.

**Real, que mede o projeto:** preencher as vagas de **Face**. Vendas zeradas,
risco declarado de **R$ 700 a 800 mil** — cerca de R$ 150 mil por sócio.

Isso inverte a ordem usual: **base quente antes de captação fria**. Os 22 leads
já abordados, os ex-alunos e as sociedades movem esse número em semanas;
campanha de topo com R$ 10 mil em dois países, não.

### Quem é quem

**Stark** — Gustavo Ferro (estratégia, e coordenador de fato) · Íris Gonçalves
(copy e design) · Mateus Borgo (opera a mídia) · Marielly Oliveira (CS).

**Cliente** — Dr. Fernando Mattioli (**decisor**: preço, idioma, orçamento,
escopo) · Gislaine / Cenacon (organização) · Francieli "Fran" (comercial, valida
as LPs) · Mara Lima (financeiro, link de pagamento, base de leads).

⚠️ O Mattioli decide sozinho e **já decidiu contra a recomendação da Stark duas
vezes** — orçamento de tráfego e Instagram no funil. Não é problema a corrigir: é
o mapa de poder. Registrar a recomendação, executar a decisão, voltar com dado.

---

## secao: evento

**Instituto Quirontec, São Paulo** — prédio de três andares perto do aeroporto,
com salas de aula, laboratório de anatomia e andares para expositores e coffee
break. O evento saiu do hotel Rosewood para conter despesa.

| Dia | Atividade | Capacidade |
|---|---|---|
| 03/03 | Teóricas — Rinoplastia | 70 (anfiteatro) |
| 04/03 | Teóricas — Face | 70 (anfiteatro) |
| 05/03 | Cadáver lab — Rinoplastia | **5 vagas · 1 aluno por peça** |
| 06/03 | Cadáver lab — Face | **10 vagas · 2 alunos por peça** |
| 07/03 | Cirurgia ao vivo | 4 observadores por cirurgião ⬜ hospital a definir |

A ordem não é arbitrária: **teoria → anatomia → cirurgia ao vivo**, mesma turma,
cinco dias.

### O ano: confirmado, mas não pelo cliente à Stark

O kickoff falou em "primeira semana de março" **sem dizer o ano**. Em 24/09 a
varredura dos canais públicos encontrou:

- bio do Instagram **@plasticflixbrasil**: *"Hands on Cadaver Lab Face/Nariz:
  **03-07 março 2027** São Paulo / **inscrições abertas**: +55 11 981047813"*
- site **plasticflixacademy.com.br**: página **PRIME 2027** no ar, com preços

`evento.ano` foi preenchido com a fonte registrada. ⚠️ O site publica **03 a
05/03**; a bio e o kickoff dizem **03 a 07/03** — dois canais do próprio cliente
divergem sobre a duração.

### Transmissão: decisão do kickoff, contradita pelo site

O kickoff fechou que **não haverá transmissão** (custo ~R$ 100 mil, risco de
superlotação com não pagantes). Virou a regra R-002, com veto.

**O site vende transmissão.** Ver [conflitos](#secao-conflitos).

---

## secao: publico

**Permitidos:** cirurgião plástico · otorrinolaringologista · residente formal.
**Proibidos:** generalista · não especialista nas áreas · não médico.

### O gate de elegibilidade

**RQE ou comprovação de residência, conferidos ANTES de efetivar inscrição.**

Não é filtro de qualidade de lead: curso de cadáver aberto a generalista queima a
relação com as sociedades médicas — que são justamente o canal de mailing e de
desconto do projeto. Foi o ponto mais enfático do cliente.

Peça que convide público mais amplo reprova em R-001, inclusive por paráfrase:
*"aberto a todos os médicos"*, *"para profissionais da área"*.

E o gate é também **atributo de produto**: sala só de titulados muda o nível da
discussão dentro do lab.

**Não existe lista negra** — contato desqualificado é descartado no atendimento.

### Mercados

**México → Argentina → Chile.** América Central e Europa descartadas por
restrição financeira ou logística. Facebook fora (médico usa pouco).

**Brasil não recebe tráfego pago nesta fase** — vai por grupos de WhatsApp, mala
direta e sociedades.

### Bases, por temperatura

| # | Base | Uso | Dono |
|---|---|---|---|
| 1 | **22 leads já abordados** | negociação ativa — receita em dias | Mara → Fran |
| 2 | **Ex-alunos** | exclusão em campanha **e** recompra | Mara |
| 3 | **Sociedades parceiras** | −10% com contrapartida de divulgação | Cliente |
| 4 | Captação fria por anúncio | México e Argentina | Stark |

A base 1 é a única capaz de gerar receita em dias, e está parada.

---

## secao: oferta

| Produto | 1º lote | 2º lote | Vagas | Canal |
|---|---|---|---|---|
| Teóricas (cada eixo) | R$ 5.000 — 30 primeiros | R$ 7.000 | 70/dia | online |
| Cadáver lab Rinoplastia | R$ 20.000 | R$ 25.000 | 5 | WhatsApp |
| Cadáver lab Face | R$ 60.000 | — | 10 | WhatsApp |
| Cirurgia ao vivo | ~R$ 10.000/vaga | — | 4/cirurgião | WhatsApp |
| Combo Rino + Face | **−10%** | | | rodapé das LPs |
| Sociedade parceira | **−10%** | | | com contrapartida |

⚠️ **A tabela do site é outra.** Ver [conflitos](#secao-conflitos).

### As regras que não se negociam

- **Preço muda por lote, nunca por promoção.** A justificativa ao lead é sempre
  *"o primeiro lote vai até o dia X"*.
- **O site nunca baixa.** Resistência vira **proposta do lead à diretoria**.
- A regra de lote precisa estar **escrita e igual** em LP, WhatsApp e comercial —
  foi a ausência disso que gerou a objeção do R$ 20 mil × R$ 25 mil.
- **Pagamento:** 30% de entrada + até 6× no cartão. Link gerado **pela Mara**.

### O piso da Face

Tabela R$ 60 mil · piso discutido R$ 50 mil · R$ 40 mil citado.

⚠️ **Uso interno.** Nenhum desses valores em peça pública — no MCP eles saem
marcados. E o de R$ 50 mil tem um significado que ninguém notou no kickoff: era
**o preço do ano passado**.

---

## secao: posicionamento

### A Face não tem objeção de preço. Tem objeção de categoria.

Dentro de *"curso de cadáver"* — categoria que o próprio cliente descreve como
saturada e barata — R$ 60 mil é absurdo. Dentro de *"imersão cirúrgica
supervisionada"*, ancorada em fellowship e observership, entra na conversa.

**Categoria escolhida:** semana de imersão cirúrgica supervisionada em
rinoplastia e face. **Estratégia:** big fish, small pond.

> Para o cirurgião plástico, otorrino ou residente formal que **já viu a técnica e
> ainda não a executou com segurança**, o Plasticflix Prime é uma semana de
> imersão cirúrgica supervisionada que coloca a peça anatômica sob a mão dele com
> instrutor dedicado, e encadeia teoria, anatomia e cirurgia ao vivo na mesma
> semana e com a mesma turma.

### As seis alternativas

A1 curso de cadáver avulso · A2 congresso · A3 fellowship no exterior · A4
preceptoria informal · **A5 a própria plataforma das terças** · A6 não fazer nada.

**A5 é a mais desconfortável: o cliente a opera.** Se a comunicação disser
*"aprenda a técnica X com o Dr. Y"*, a resposta racional é *já vejo isso na
terça*. A categoria resolve — a terça é **aula**, o Prime é **imersão**.

### A inversão

Valor, em ordem de força: **execução supervisionada · acesso ao docente ·
encadeamento**.

A cadência tende a liderar por corpo docente — a prova mais bonita e o **valor
mais fraco**, porque é o que congresso e fellowship também oferecem.

**A supervisão lidera. O docente sustenta.**

---

## secao: comunicacao

### Idioma: português

Revertido em 24/09 por decisão da Daniela. O inglês era decisão do Dr. Mattioli
no kickoff, com justificativa própria.

⚠️ **Avisar o Mattioli antes que ele veja uma peça em português.**

O histórico das duas decisões está em `data/comunicacao.yaml`. A regra R-004 lê o
YAML e compara com o idioma detectado — **nos dois sentidos**.

### As três provas

| | Prova | Afirmação |
|---|---|---|
| **PR-001** | proporção de supervisão | 1 aluno por peça na Rino, 2 na Face |
| **PR-002** | corpo docente internacional | ao lado dos sócios, não acima ⬜ nomes |
| **PR-003** | semana encadeada | teoria → anatomia → cirurgia, mesma turma |

**Uma prova por peça.** Peça que carrega as três não carrega nenhuma.

### A narrativa

**Ideia de controle:** *cirurgião aprende operando; por isso o Prime conta peça,
e não plateia.*

Três atos: **reconhecimento** (+ currículo → − lacuna) → **estrutura** (− lacuna
→ + estrutura conhecida) → **escolha sob pressão** (decisão, com custo).

**O que muda do início ao fim:** de quem é a pergunta. Entra como *"esse evento é
bom?"* e sai como *"eu caibo nessa turma?"*.

### O Instagram no funil

**Etapa intermediária, não vitrine.** O cliente queria mandar o anúncio direto
para a LP; num produto de R$ 20 a 60 mil a objeção cai no meio do caminho.

No MCP isso é **alerta, nunca veto** (R-008) — é posição da agência, não regra do
cliente. O combinado foi medir.

### ⚠️ O conflito de tom, não resolvido

O registro vigente do cliente é **superlativo e promessa**: *"Seu Passaporte para
a Excelência"*, *"maestria, confiança e técnica"*, *"A MAIOR plataforma do
mundo"*. E a **Persona dele no Drive** usa o framework EJACA, cuja quinta etapa é
*"apontar a culpa para seus inimigos"*.

A régua que produzimos bane as duas coisas — número no lugar do adjetivo, eixo
afirmativo sem inimigo.

Não é diferença de estilo: é a diferença entre a campanha **soar como o cliente**
ou soar como outra marca. Decisão pendente, na F12.

### Nada de assinatura ainda

`mote`, `manifesto` e `regua_de_tom` estão `null` **de propósito**. Existem
quatro propostas de mote, manifesto de 238 palavras, arco em três atos, régua de
sete regras e 16 hooks — nenhum aprovado. Até lá, **nenhuma peça usa assinatura
de campanha**; as três provas sustentam a cadência sem ela.

---

## secao: frentes

Treze frentes. Cinco vieram do kickoff, uma do inventário do Drive, cinco da
estrutura da OpenMind e duas da ideação.

| | Frente | Dono | Origem |
|---|---|---|---|
| **F1** | Landing pages | Gustavo | kickoff |
| **F2** | Tráfego pago | Gustavo | kickoff |
| **F3** | Conteúdo e Instagram | **Íris** | kickoff |
| **F4** | Comercial e base | Gustavo | kickoff |
| **F5** | Parcerias e mailings | Gustavo *(executa: cliente)* | kickoff |
| **F6** | Materiais e impressos | **Íris** | inventário do Drive |
| **F7** | Estratégia e modelo de vendas | Gustavo | OpenMind |
| **F8** | Destravar dependências | Gustavo | OpenMind |
| **F9** | Gestão da comunicação | Gustavo | OpenMind |
| **F10** | Cronograma | Gustavo | OpenMind |
| **F11** | Preparar e integrar o squad | Gustavo | OpenMind |
| **F12** | Ideação e narrativa | **Íris** | ideação |
| **F13** | Patrocínio | Gustavo | inventário do Drive |

**Divisão de 24/09:** estratégia com Gustavo Ferro, copy e design com Íris
Gonçalves. ⬜ Mateus e Marielly não receberam tarefa nesta divisão, embora operem
mídia e CS.

### A ordem que importa

1. **A planilha dos 22 leads sai da Mara para a Fran** — única ação que gera
   receita nesta semana
2. **As duas LPs sobem** — sem elas, tráfego e conteúdo não têm para onde apontar
3. **As listas de ex-alunos chegam** — exclusão e recompra ao mesmo tempo

---

## secao: entregaveis

**28 peças**, levantadas no inventário do ciclo anterior. Todo item **existiu de
fato** — o campo `referencia` aponta o arquivo no Drive. É a diferença entre
catálogo e lista de desejos.

| Categoria | Itens |
|---|---|
| Certificados e credenciais | 7 |
| Impressos e sinalização | 5 |
| Papelaria do participante | 4 |
| Programação e slides | 4 |
| Patrocinadores | 2 |
| Identidade visual | 1 |
| Vídeos e divulgação | 5 |

**Balanço: 20 podem começar, 8 estão bloqueados** — a maioria presa na grade de
programação (L-012) e na numeração da edição (L-010).

Três leituras que o inventário entregou e o kickoff não tinha:

1. **O volume real é muito maior que as cinco frentes do kickoff.**
2. **A produção começa em novembro**, não em janeiro.
3. **O inglês não era novidade** — há pasta de edição em inglês desde maio/2025.

Consulte com `catalogo_entregaveis`.

---

## secao: calendario

Oito fases, contadas para trás a partir de **03/03/2027**.

| Fase | Janela | Indicador de que funcionou |
|---|---|---|
| 1 · Destrave + **venda ativa da Face** | set–out | 22 leads contatados · ≥1 proposta de Face em mesa |
| 2 · **Prova pública** | out | ≥6 vídeos de palestrante · engajamento de perfis médicos |
| 3 · Teste de tráfego | out–nov | custo por lead **com RQE conferido**, por praça |
| 4 · Decisão | nov | três decisões com data e dono |
| 5 · Lote 1 + sociedades | dez–jan | ≥1 acordo de −10% com divulgação publicada |
| 6 · Lote 2 + escassez real | jan–fev | Face com ≥metade comprometida |
| 7 · Reta final | fev | lotação · material na gráfica |
| 8 · Evento e captação | 03–07/03 | depoimentos captados dentro do lab |

**Eram sete.** A revisão corrigiu um erro de lógica comercial: as fases tratavam
a Face como resultado do funil, no lote 1. **Dez vagas a R$ 60 mil não se vendem
por funil** — é venda consultiva sobre base quente, e a base quente já existe.

E **"prova pública" virou fase própria, antes do tráfego**: não se paga por
atenção sem ter o que mostrar.

⚠️ A escassez da fase 6 **não é técnica de venda**: 5 e 10 vagas são consequência
direta da proporção. É o raro caso em que urgência e diferencial são a mesma
frase — e ela não depende de data nenhuma.

---

## secao: conflitos

Levantados em 24/09 nos canais públicos do cliente. **Nenhum foi dito no
kickoff**, e todos estão em `data/lacunas.yaml`.

### 🚨 L-014 · O site vende transmissão ao vivo

O kickoff proibiu; virou veto R-002. Mas o site anuncia *"transmissões em tempo
real de cirurgias"* — e **no ciclo anterior isso era produto de tabela**:

| Modalidade | Preço |
|---|---|
| Cadáver lab Face assistido | R$ 20.000 |
| Transmissão Face | R$ 10.000 |
| Transmissão Rino | R$ 5.000 |

Não é divergência de comunicação: é **uma linha de receita que não consome vaga
física** — não ocupa peça, não ocupa cadeira, não esbarra na proporção. Num
evento cujo produto-problema tem dez lugares, é o tipo de receita que tapa
buraco.

**Não mexer na R-002 antes da resposta do cliente.**

### 🚨 L-015 · A tabela do site diverge da do kickoff

| Produto | Site | Kickoff | Ciclo anterior |
|---|---|---|---|
| Hands-on Rino + teoria | R$ 20.000 | R$ 20.000 → 25.000 | R$ 30.000 |
| Hands-on Face + teoria | R$ 60.000 | R$ 60.000 | **R$ 50.000** |
| Teoria Face | **R$ 10.000** | **R$ 5.000 → 7.000** | R$ 10.000 |
| Teoria Rino | R$ 5.000 | R$ 5.000 → 7.000 | R$ 5.000 |

A teórica de Face diverge em dobro, e **o site não menciona lote** — que é o
único argumento de preço autorizado.

**E a Face subiu 20%** de um ciclo para o outro, num mercado que o cliente diz
estar saturado. O "piso" que a diretoria cogita conceder é, na prática, o preço
do ano passado.

### L-016 · As inscrições já estão abertas

Com um telefone que não é nenhum canal nosso. Não se sabe quem atende nem **se
há conferência de RQE nesse fluxo** — e o RQE é o veto mais forte do projeto.

### L-010 · A numeração da edição não fecha

Drive: Prime 3 = 2025, **LOGO PRIME 4** = 2026. Kickoff: *"5º episódio"*. Pasta
criada pelo cliente: **"PRIME 6 2027"**.

Bloqueia o logo — que entra em certificado, crachá, backdrop, slide, papelaria e
em cada peça.

---

## secao: regras

Nove regras em `src/rules/`, rodadas por `verificar_conteudo`. Oito com veto, uma
de alerta.

| Id | Regra | Veto |
|---|---|---|
| R-001 | Elegibilidade e RQE | sim |
| R-002 | Sem transmissão de cirurgia | sim ⚠️ em conflito |
| R-003 | Sem tráfego pago no Brasil | sim |
| R-004 | Idioma da peça pública | sim |
| R-005 | Preço e lote | sim |
| R-006 | Promessa e CFM | sim |
| R-007 | Dado não confirmado | sim |
| R-008 | Etapa do funil | **não — alerta** |
| R-009 | Lacuna bloqueante | sim |

### O princípio

**Toda regra que depende de um fato lê o fato do YAML.** Quando o dado é
preenchido, o veto se desarma sozinho.

Isso corrige de propósito um defeito do repo AExPI, onde um veto ficou embutido
em código, o fato mudou no mundo e o verificador seguiu reprovando copy correta
por três commits.

**Se um veredito parece errado, o conserto é preencher o dado — nunca relaxar a
regra.**

### A lição da R-004

A regra de idioma nasceu assimétrica: só sabia perguntar *"está em português
quando deveria estar em inglês?"*. Quando o idioma foi revertido, ela parou de
bloquear português — correto — **e também parou de bloquear qualquer coisa**.
Peça em inglês passava como APROVADO.

Regra inerte é pior que regra errada: dá a impressão de que a peça foi checada.
Hoje ela detecta o idioma do texto e compara com o vigente, nos dois sentidos.

---

## secao: arquitetura

```
mcp.json              manifest único das 11 tools — fonte da verdade
src/server.js         transporte e roteamento
src/registry.js       valida manifest ↔ handler ↔ agente; derruba o boot se divergir
src/tools/<name>.js   um handler por tool, descoberto por convenção de nome
src/rules/            as 9 regras e o motor
data/*.yaml           os 11 arquivos de dados do projeto
squad/agents/*.md     os 8 agentes
docs/                 a ideação completa, como produzida
scripts/              os 4 gates de CI
tests/                67 testes
```

### Invariantes garantidos em código

- Tool no manifest sem handler **derruba o boot** (tool fantasma)
- Handler sem entrada no manifest **derruba o boot** (handler órfão)
- Tool sem agente existente **derruba o boot**
- Versão existe **só** no `package.json`
- YAML que nenhuma tool lê **é erro de gate**

Nenhuma tool faz I/O de rede. Os handlers devolvem instruções para o agente
executar com os conectores já autenticados — ClickUp, Drive, Meta Ads. Por isso o
servidor roda com env vazio e **não carrega credencial nenhuma**.

### O que os gates NÃO pegam

Texto de descrição de task no ClickUp. Os YAMLs se propagam sozinhos; as
descrições não. Quando um fato muda, cada uma precisa ser varrida à mão — foi
assim que a F3 ficou dizendo "em inglês" três commits depois da reversão.

---

## secao: tools

| Tool | O que faz |
|---|---|
| `perfil_plasticflix` | contexto do projeto — **chamar primeiro** |
| `planejar_demandas` | backlog por frente; `formato: "clickup"` dá o payload pronto |
| `calendario_projeto` | as 8 fases e a contagem regressiva |
| `briefing_entrega` | especifica uma peça antes de produzir |
| `catalogo_entregaveis` | as 28 peças, com referência e o que trava |
| `oferta_precos` | tabela, lotes e argumento por objeção |
| `base_publico` | elegibilidade, mercados e bases por temperatura |
| `escrever_copy` | a régua de escrita — não escreve pelo agente |
| `verificar_conteudo` | o gate: 9 regras, veredito determinístico |
| `status_lacunas` | o que trava + rascunho da cobrança agrupada |
| `documentacao` | serve este README por seção |

**Duas disciplinas de uso:** `perfil_plasticflix` no início de toda sessão;
`verificar_conteudo` antes de qualquer peça sair — com **contexto completo**
(canal, eixo, idioma, praça). Contexto incompleto produz veredito que não vale.

---

## secao: como-rodar

```bash
npm install
npm run validate   # os 4 gates
npm test           # 67 testes
npm run smoke      # handshake MCP
npm start          # sobe o servidor em stdio
```

Registro no cliente, via `.mcp.json` do repositório:

```json
{ "mcpServers": { "plasticflix": { "command": "node", "args": ["C:\\Users\\danie\\PLASTICFLIX\\src\\server.js"], "env": {} } } }
```

⚠️ Caminho do Windows em JSON exige **barra dupla**. Nenhum gate valida o
`.mcp.json` — ele já nasceu inválido uma vez por causa disso.

---

## secao: pendencias

**16 lacunas, 13 bloqueantes.** Use `status_lacunas` para o estado atual e o
rascunho da cobrança agrupada — uma mensagem com todos os itens, nunca pedido
pingado, e sempre com o que segue mesmo assim.

| Pendência | Trava | Dono |
|---|---|---|
| **Número da edição** (L-010) | o logo, que entra em tudo | Cenacon |
| **Grade de programação** (L-012) | 7 dos 28 entregáveis | Cliente |
| **Transmissão: vale ou não** (L-014) | toda peça de cirurgia ao vivo | Mattioli |
| **Qual tabela de preços** (L-015) | LP, WhatsApp e comercial | Diretoria |
| Datas de corte dos lotes (L-004) | o argumento de preço | Diretoria |
| Piso real da Face (L-008) | argumentação comercial | Diretoria |
| Hospital da cirurgia ao vivo (L-002) | a peça do dia 07/03 | Cliente |
| Nomes e fotos do corpo docente (L-005) | carrosséis de docente | Cliente |
| Link de pagamento (L-003) | checkout das LPs | Mara |
| Planilha dos 22 leads (L-007) | a venda mais urgente | Mara |
| Mailings das sociedades (L-006) | mala direta | Cenacon |
| Acesso ao site atual (L-009) | as duas LPs | Cliente |
| Medidas do Quirontec (L-011) | sinalização e estande | Cliente |
| Mote e régua de tom (L-013) | assinatura de campanha | **Stark** |
| Quem atende o telefone público (L-016) | o gate de RQE | Cenacon |

### As seis coisas que não sabemos

Registradas para não virarem suposição: preço de mercado de cadáver no Brasil ·
**preço de observership internacional** (a âncora de que o reposicionamento
depende) · **por que os 22 leads não fecharam** · o que os ex-alunos diriam ·
valores históricos de cotas · tamanho do mercado nas praças latinas.

A mais barata e mais valiosa é a terceira. A Fran tem essas conversas, e elas
transformam o argumento de categoria de leitura em evidência.
