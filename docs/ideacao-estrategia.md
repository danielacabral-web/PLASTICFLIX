# Plasticflix Prime — Ideação estratégica

> **Agente:** estratégico (April Dunford como persona principal; Neumeier no teste de onliness; offer-gtm-architect na parte de oferta e patrocínio).
> **Fontes de dado:** `data/*.yaml` do repo PLASTICFLIX (kickoff 22/09/2026, revertido em 24/09 no idioma) + `README.md` + plano de projeto v1.
> **Regra de honestidade:** tudo com origem citada. O que é meu, está marcado `[HIPÓTESE]`. O que falta para decidir, está marcado ⬜.
> **Restrições aplicadas:** R-001 elegibilidade · R-002 sem transmissão · R-005 preço só por lote · R-006 sem promessa/superlativo · R-007 dado não confirmado (ano, edição, hospital, datas de lote) · R-004 pt-BR.

---

## 1 · POSICIONAMENTO (método Dunford)

### 1.1 — Alternativas competitivas

*O que este cirurgião usaria se o Prime não existisse.* Esta lista **não** veio de entrevista com cliente final — o projeto não tem histórico de campanha nem pesquisa (README, "fonte única"). Ela é reconstruída do que o cliente afirmou no kickoff mais leitura de categoria. Marcada conforme o lastro.

| # | Alternativa | Tipo | Lastro | O que ela faz bem |
|---|---|---|---|---|
| A1 | Curso de cadáver avulso de sociedade ou de serviço universitário | Direta | **Dado** — `publico.yaml`: "excesso de cursos de cadáver concorrendo e preços baixos praticados por sociedades" | Preço baixo, marca institucional, proximidade geográfica |
| A2 | Congresso / jornada (SBCP, regionais, eventos internacionais) | Adjacente | **Dado** — `comunicacao.yaml` eixo: "quem ele só vê em congresso" | Volume de nomes, networking, pontuação e vitrine |
| A3 | Fellowship ou *observership* no exterior com nome de referência | Adjacente | `[HIPÓTESE]` | Profundidade real, marca no currículo |
| A4 | Ir operar com um mentor conhecido (preceptoria informal) | DIY | `[HIPÓTESE]` | Custo quase zero, relação de confiança, caso real |
| A5 | Conteúdo gravado e aula online — inclusive **a própria plataforma das terças da Neo ID** | Adjacente/DIY | **Dado** — `perfil-plasticflix.yaml`, `ativos_existentes.plataforma_online` | Barato, assíncrono, repetível |
| A6 | **Não fazer nada** — aprender pela própria casuística | Status quo | `[HIPÓTESE]`, mas é quase sempre a alternativa mais forte | Custo zero e nenhum atrito de agenda |

Duas leituras que mudam o jogo:

- **A5 é a alternativa mais desconfortável do projeto.** O próprio cliente opera a plataforma online semanal. Ela é descrita como "aquecimento"; ela também é substituto parcial. Se a comunicação do Prime disser "aprenda a técnica X com o Dr. Y", a resposta racional do cirurgião é: *já vejo isso na terça, de graça ou barato*. O Prime tem que vender explicitamente **o que a terça não entrega**.
- **A1 é a alternativa que envenena o preço.** É por isso que a Face a R$ 60 mil trava (`produtos.yaml` P-004, `lacunas.yaml` L-008). Não é objeção de valor — é objeção de **categoria**. Volto a isso em 1.5.

### 1.2 — Atributos únicos

Só entra aqui o que tem lastro no YAML. Nada inventado.

| # | Atributo | Tipo | Quais alternativas não têm | Lastro |
|---|---|---|---|---|
| U1 | **1 aluno por peça na Rino, 2 na Face** | Método / capacidade declarada | A1 (a economia do curso barato exige 4–8 por peça `[HIPÓTESE]`), A2, A5, A6 | `perfil-plasticflix.yaml` grade · PR-001 |
| U2 | **Docente internacional operando junto, não palestrando** — Dr. Cercan (Turquia) na Rino, 3 convidados americanos na Face | Corpo docente | A1, A4, A5, A6. Só A2 e A3 chegam perto, e por caminhos caros | PR-002 · `perfil-plasticflix.yaml` (⬜ nomes dos 3 americanos não confirmados — L-005) |
| U3 | **Semana encadeada: teoria → anatomia → cirurgia ao vivo, mesmo lugar, mesma turma** | Arquitetura do produto | **Todas.** Nenhuma alternativa entrega as três etapas coladas | PR-003 · `perfil-plasticflix.yaml` grade |
| U4 | **Escala pequena por desenho** — 5 vagas no lab Rino, 10 no lab Face, 4 observadores por cirurgião | Capacidade estrutural | A1, A2, A5 | `produtos.yaml` P-003/P-004/P-005 |
| U5 | **Sala 100% de pares** — RQE ou residência conferidos antes de efetivar inscrição | Gate de admissão | A1 e A2, onde a barreira costuma ser só pagar `[HIPÓTESE]` | `publico.yaml` elegibilidade · R-001 |

U5 merece uma nota: o cliente trata o gate como **defesa jurídica e política** (represália de sociedade médica). Ele também é, sem que ninguém tenha dito isso no kickoff, um **atributo de produto**. Sala só de titulados e residentes formais muda o nível da discussão dentro do lab. `[HIPÓTESE]` minha, derivada do dado — vale testar na fala com 3 ou 4 dos 22 leads antes de virar mensagem.

### 1.3 — Valor (e prova)

Aplicando o "e daí?" até chegar num resultado que o cirurgião reconheça. **Sem promessa de domínio, de resultado ou de retorno** (R-006): tudo aqui é descrição de condição de aprendizado, não de desfecho.

| Atributo | O que permite | Resultado para o cirurgião | Prova |
|---|---|---|---|
| U1 | Executar o passo inteiro, não a parte que sobrou do colega | **Sai de "vi a técnica" para "executei o passo com alguém olhando"** — a lacuna que trava | PR-001, verificável na grade e na contagem de vagas |
| U2 | Perguntar diretamente a quem ele só encontra em auditório | Discussão de conduta sobre a peça na mão, no momento da dúvida | PR-002 (⬜ depende de L-005 para nomear) |
| U3 | Ver o mesmo gesto em três estados na mesma semana — explicado, dissecado e operado | Curva compactada: a teoria de segunda vira decisão no lab de quinta e é revista no vivo de sábado | PR-003, verificável na grade |
| U4 | Turma pequena o bastante para ter nome e acompanhamento | Atenção individual em vez de fila | `produtos.yaml`, contagem de vagas |
| U5 | Turma inteira no mesmo patamar técnico | Nenhum tempo gasto em nivelamento básico | Gate operacional da Fran, R-001 |

**Três temas de valor, em ordem de força:**

1. **Execução supervisionada** (U1 + U4) — o mais forte, o mais fácil de provar, e o único que nenhuma alternativa consegue copiar sem mudar a própria economia.
2. **Acesso direto ao docente** (U2 + U5).
3. **Encadeamento** (U3).

A ordem importa: a comunicação do projeto hoje tende a liderar pelo corpo docente (carrosséis de palestrantes, `comunicacao.yaml` cadência). **Corpo docente é a prova mais bonita e o valor mais fraco** — é justamente o que A2 e A3 também oferecem. Liderar por ele nos coloca na briga errada.

### 1.4 — Quem se importa MUITO

Não é "cirurgião plástico". Características, não demografia:

**Perfil de melhor encaixe**
- Já assistiu à técnica — em congresso, na plataforma das terças, em vídeo — e **não conseguiu reproduzir**. A lacuna dele é de execução, não de informação.
- Opera pouco rino/face hoje e quer abrir ou consolidar a linha.
- Já gasta com formação fora do país ou já foi a congresso internacional — o orçamento de milhares de dólares não é novidade para ele.
- Está num serviço ou numa cidade com **baixo volume** desses casos, então a casuística própria não resolve (A6 fecha a porta).
- **Ex-aluno que voltou.** `publico.yaml` PB-001 é o dado mais valioso do projeto: *"costumam repetir curso por insegurança prática"*. Isso é o perfil confessando o problema em voz alta. Esse único dado sustenta o posicionamento inteiro melhor do que qualquer pesquisa que ainda não temos.

**Gatilhos de compra** `[HIPÓTESE]`: um caso que deu trabalho · um paciente perdido para o colega que opera nariz · abrir agenda de face · terminar a residência sem volume de rino.

**NÃO é encaixe** — e isto precisa ficar visível na peça, não só no atendimento:
- Generalista, não especialista, não médico (R-001, veto).
- Quem procura certificado ou pontuação.
- Quem está comparando preço por dia de curso — essa pessoa é cliente de A1, e disputá-la destrói a âncora.

### 1.5 — Categoria de mercado — *a decisão mais importante deste documento*

Categoria é contexto. Ela define quem somos comparados e **quanto o mercado acha que isso deveria custar**.

| Categoria candidata | Clareza | Alinhamento com U1–U5 | Viabilidade | Expectativa de preço que ela carrega |
|---|---|---|---|---|
| "Curso de cadáver de rino/face" | 5/5 | 2/5 | 5/5 | **Baixa** — é exatamente a categoria que o cliente diz estar saturada e barata |
| "Congresso / jornada" | 5/5 | 1/5 | 4/5 | Muito baixa (centenas, não dezenas de milhares) |
| "Fellowship / imersão internacional" | 3/5 | 4/5 | 2/5 | Alta — mas implica duração de meses; não sustentamos |
| **"Semana de imersão cirúrgica supervisionada em rinoplastia e face"** | 4/5 | **5/5** | 4/5 | **Alta** — ancora em fellowship encurtado, não em curso avulso |

**Escolha: Big fish, small pond.** Não criar categoria nova (caro, lento, e não precisamos), não competir de frente no "curso de cadáver" (é perder pelo preço antes de começar). O Prime domina uma sub-categoria estreita: **imersão cirúrgica supervisionada de uma semana, para cirurgião titulado, em rinoplastia e face.**

Por que isso resolve o problema que o projeto declara ter:

- A Face a R$ 60 mil só é "cara" **dentro da categoria errada**. Comparada a um curso de cadáver de fim de semana, é absurda. Comparada a uma semana fora do país com nome internacional, passagem, estadia e agenda parada, entra na conversa. `[HIPÓTESE]` — não sei o preço de mercado de um *observership* internacional e **não vou inventar número**. Para saber, precisaríamos de: 3 a 5 cotações reais de programas comparáveis (EUA/Turquia/Europa) e a leitura do que os 22 leads já compararam quando receberam o link. A Fran tem essa conversa gravada na memória; vale extraí-la antes da reunião.
- O gate de elegibilidade deixa de ser burocracia e vira **traço da categoria** — imersão de titulados.
- E resolve o conflito com a plataforma das terças (A5): ela é **aula**, o Prime é **imersão**. Categorias diferentes, mesma casa, sem canibalização.

**Statement de posicionamento** (alinhamento interno; não é copy, não é assinatura):

> Para o cirurgião plástico, otorrinolaringologista ou residente formal que **já viu a técnica e ainda não a executou com segurança**, o Plasticflix Prime é uma **semana de imersão cirúrgica supervisionada em rinoplastia e face** que coloca a peça anatômica sob a mão dele com instrutor dedicado, e encadeia teoria, anatomia e cirurgia ao vivo na mesma semana e com a mesma turma. Diferente das alternativas disponíveis, a proporção é de **1 aluno por peça na Rinoplastia e 2 na Face**, com docentes internacionais ao lado dos sócios.

**Teste de onliness (Neumeier):** *"O único programa em que o cirurgião executa a própria peça sob instrutor dedicado e vê o mesmo gesto na cirurgia ao vivo, na mesma semana e com a mesma turma."* — Preenche os dois espaços. Passa.

---

## 2 · A BIG IDEA

> # A sua mão em cada etapa.

**Afirmativa. Sem inimigo. Sem comparação. Sem promessa.**

Por que essa:

- **Carrega as três provas de uma vez.** "Sua mão" é PR-001 (a peça é sua, o instrutor é seu). "Cada etapa" é PR-003 (segunda a sábado, teoria → lab → cirurgia). PR-002 entra como o **quem** está do outro lado — o docente ao lado da sua mão.
- **É verdadeira nos dois eixos.** Funciona na Rino (1:1) e na Face (2:1) sem precisar de nota de rodapé.
- **Não fere R-006.** Não promete domínio, resultado nem retorno. Descreve a condição, não o desfecho.
- **Não fere R-002.** Nada nela sugere assistir de longe — ao contrário, ela é *presença*.
- **Desqualifica sozinha.** Quem quer certificado e conteúdo lê isso e sabe que não é para ele. Posicionamento que não afasta ninguém não é posicionamento.
- **Sobrevive às lacunas abertas.** Não depende de ano, edição, hospital nem data de lote (R-007). Pode entrar em produção hoje.

Descartadas, e por quê:

| Candidata | Por que cai |
|---|---|
| "Opere ao lado de quem você só vê em congresso" (eixo atual, `comunicacao.yaml`) | Boa, e quase lá — mas *"só vê em congresso"* é comparação com A2 embutida, e lidera pelo valor mais fraco (corpo docente). Vira **mensagem de apoio**, não big idea. |
| "Você não veio assistir" | Inimigo declarado e forma negativa. Fora por instrução do projeto. |
| "A semana que encurta a curva" | Promessa de desfecho disfarçada. Esbarra em R-006. |
| "Uma peça. Um cirurgião." | Bonita, mas só é literal na Rino. Mente na Face. |

⬜ **Isto é proposta, não assinatura aprovada.** `comunicacao.yaml` registra `mote: null` e L-013 está aberta: nenhuma peça deve usar assinatura de campanha até o Dr. Mattioli aprovar. A big idea vai à reunião junto com as duas LPs.

---

## 3 · AS FASES DA CAMPANHA

Contadas para trás a partir de 03/03 (⬜ ano — L-001).

**O que eu mudo no `calendario.yaml` atual, e por quê.** As 7 fases de hoje são coerentes, mas contêm um erro de lógica comercial: elas tratam a Face como se ela fosse ser vendida pelo funil, no lote 1, em dez/jan. **Dez vagas a R$ 60 mil não se vendem por funil.** Isso é venda consultiva 1:1, de ciclo longo, sobre base quente — e a base quente já existe hoje (22 leads, ex-alunos, sociedades: `publico.yaml` PB-001/002/003). Se a venda da Face só começar de fato na Fase 4, restam 8 semanas para mover o número que define o projeto.

Três alterações:
1. **A Face vira frente comercial na Fase 1**, não resultado da Fase 4.
2. **"Prova pública" ganha fase própria (F2)**, antes do tráfego. Hoje ela está diluída em "conteúdo 3×/semana". Os vídeos dos palestrantes são descritos em `entregaveis.yaml` como *"ativo de maior retorno da frente de conteúdo"* e dependem de agenda de professor — precisam ser pedidos cedo, e o tráfego não deve subir sem eles.
3. **Patrocínio entra explicitamente**, aberto na F2 e decidido na F4.

| Fase | Janela | Objetivo | O que se comunica | Prova que sustenta | Indicador de que funcionou |
|---|---|---|---|---|---|
| **F1 · Destrave + venda ativa da Face** | set–out | Tirar as 11 lacunas do caminho e **abrir negociação individual nas 10 vagas da Face** | Nada público ainda além do que já existe. A comunicação aqui é 1:1, no WhatsApp da Fran, e **interna** (pedido agrupado das lacunas ao cliente) | PR-001 e PR-003 na conversa de venda; a grade é o material | Duas LPs no ar · WhatsApp separado por eixo · **os 22 leads todos contatados com resposta registrada** · ≥1 proposta formal de Face em mesa |
| **F2 · Prova pública** | out | Construir o estoque de prova antes de pagar por atenção | Corpo docente com rosto e voz · o que é 1 aluno por peça · o encadeamento da semana | PR-002 (⬜ L-005: fotos e nomes) e PR-001 | ≥6 vídeos de palestrante gravados · fotos no Drive · 3 posts/semana rodando em pt-BR · engajamento vindo de **perfis médicos**, não de volume |
| **F3 · Teste de tráfego** | out–nov | Descobrir o custo real de um lead **elegível** no México e na Argentina | Anúncio → Instagram → LP. Topo pela execução supervisionada, nunca pelo preço | PR-001 como gancho; PR-002 como sustentação no perfil | **Custo por lead qualificado (RQE conferido) por praça** — não CPL bruto, não seguidor. Expectativa calibrada **por escrito antes de começar** (risco 2 do plano) |
| **F4 · Decisão** | nov | Transformar dado em três decisões: orçamento, funil e patrocínio | Interno. Reunião técnica (D-17) | Relatório dos 2 meses por praça | Três decisões registradas com data e dono: orçamento (os R$ 15–20 mil voltam **com dado**) · Instagram no percurso, sim ou não · patrocínio entra ou não |
| **F5 · Lote 1 + sociedades** | dez–jan | Converter o topo aquecido no preço de entrada e abrir os canais de BR | Regra de lote, idêntica em LP, WhatsApp e comercial · mala direta às sociedades · oferta dirigida a ex-alunos | PR-003 (a semana inteira justifica o ticket) | Vagas de teórica vendidas no lote 1 · ≥1 acordo de −10% assinado com divulgação publicada (critério da F5 em `frentes.yaml`) · ⬜ depende de L-004 e L-006 |
| **F6 · Lote 2 + escassez real** | jan–fev | Usar a única urgência verdadeira que temos | Virada de lote (R-005) e **vagas restantes** — 5 na Rino, 10 na Face | PR-001: a escassez **é** o diferencial. O número pequeno de vagas é consequência da proporção de supervisão, não artifício | Ritmo de fechamento na virada · Face com ≥metade das vagas comprometida |
| **F7 · Reta final** | fev | Fechar as últimas vagas e a logística | Últimas vagas · contagem regressiva · confirmação do hospital | PR-003 | Lotação · ⬜ L-002 resolvida · material de evento na gráfica (F6 do `frentes.yaml` abre em novembro) |
| **F8 · Evento e captação do próximo** | 03–07/03 | Executar e **transformar a turma em prova do próximo episódio** | Cobertura, depoimento, #EUVOU | A própria semana vira PR-001/002/003 com imagem real — hoje não temos nenhuma | Depoimentos em vídeo captados **dentro do lab** · lista de interesse para o próximo episódio |

**Observação sobre F6.** A escassez aqui não é técnica de venda: 5 e 10 vagas são consequência direta da proporção 1:1 e 2:1. É o raro caso em que urgência e diferencial são a mesma frase — e, como aponta `entregaveis.yaml`, **a escassez por vaga não depende de data nenhuma**, então pode ser comunicada já, com o ano e os lotes ainda em aberto.

---

## 4 · PLANO DE PATROCÍNIO

### 4.1 — Por que isso importa neste projeto, especificamente

O kickoff não tocou no assunto. O inventário do Drive mostra que existiu: pasta *Patrocinadores*, *PDF Patrocinadores*, *Patrocinados/Método LD (FACE e RINO)*, *Banner - Site CENACON* (`entregaveis.yaml`, categoria `patrocinadores`, ClickUp 86akpdzw3).

O argumento é aritmético, não criativo:

- O risco declarado é **R$ 700–800 mil**, ≈ R$ 150 mil por sócio (`perfil-plasticflix.yaml`).
- A Face está zerada e tem **10 vagas**. Mesmo lotação cheia a R$ 60 mil são R$ 600 mil — e é o produto que não vende.
- **Patrocínio é a única linha de receita que não disputa vaga com o gate de elegibilidade.** O patrocinador não precisa de RQE, não ocupa cadeira no anfiteatro e não entra na conta de peças anatômicas.
- E o ciclo de venda dele é **paralelo**, não sequencial: negociar cota com indústria não consome a agenda do comercial que negocia lab.

`[HIPÓTESE]` minha, e explícita: **não sei quanto vale uma cota nesse mercado e não vou inventar.** Para saber: (a) abrir o *PDF Patrocinadores* do ciclo anterior — ele tem os níveis e possivelmente os valores praticados; (b) perguntar à Gislaine quem patrocinou as edições anteriores e quanto entrou. Sem isso, o desenho abaixo é de **estrutura**, não de preço.

### 4.2 — Desenho das cotas

O erro clássico aqui é vender **audiência**. Não temos audiência: são 70 pessoas por dia. O que temos é **qualificação** — 100% RQE conferido, todo mundo decisor de compra de material, ticket de R$ 20 a 60 mil comprovando o perfil. A cota certa não vende logo em banner: vende **o produto do patrocinador na mão do cirurgião durante o lab**.

| Cota | Ideia central | Entrega | Observações e travas |
|---|---|---|---|
| **Master (exclusiva por categoria — 1 única)** | O material dele é o material usado no lab | Fornecimento e presença do produto no cadáver lab · marca no backdrop e na sinalização do lab · estande · inserção técnica na grade teórica ⬜ (depende de L-012) · marca em certificado e site | O que a indústria realmente quer é demonstração em uso, não impressão. **Exclusividade por categoria é o que justifica o valor mais alto** |
| **Ouro** | Presença de estande e marca no percurso | Estande · marca em backdrop, certificado, site e kit do participante · menção nas peças de divulgação | Escalável a 3–4 empresas de categorias distintas |
| **Prata** | Marca e kit | Marca em site e materiais impressos · item no kit do participante | Porta de entrada, ciclo de venda curto |
| **Permuta (não financeira)** | Alcance por alcance | Banner no site da Cenacon e menção, em troca de divulgação no canal do parceiro | **Já existe a mecânica**: é exatamente o acordo de −10% com sociedades (`produtos.yaml` D-002). Serve para sociedades, mídia médica e o próprio Instituto Quirontec |

**Três regras que precisam estar escritas na cota, não descobertas depois:**
1. Patrocínio **não compra vaga** e não dá acesso de não elegível ao lab ou à cirurgia ao vivo (R-001 continua valendo para representante comercial).
2. Nada na cota pode prometer transmissão da cirurgia (R-002) — inclusive gravação para uso do patrocinador ⬜, que precisa de decisão à parte.
3. Lista de participantes **só com opt-in**. Não é item de cota por padrão.

### 4.3 — Prospectos naturais

`[HIPÓTESE]` em todos: são categorias, não empresas contatadas. A seleção sai da grade — quem vende para quem opera nariz e face.

| Eixo do patrocinador | Por que ele compra | Encaixe |
|---|---|---|
| **Implantes e biomateriais de face** (implante facial, placas e parafusos, enxertos, PDS, malhas) | O cirurgião decide a marca no centro cirúrgico. Ver o produto na peça é a melhor demonstração que existe | **Master** — e é o encaixe mais natural com a Face, o eixo que precisa de receita |
| **Instrumental e descartáveis de rinoplastia** (rasp, osteótomo, bisturi ultrassônico / piezo) | Piezo em rinoplastia é decisão de equipamento de alto ticket, tomada por demonstração | **Master ou Ouro** |
| **Tecnologias de energia** (laser, RF, ultrassom microfocado, lifting não cirúrgico) | O cirurgião de face é o comprador-alvo direto deles | **Ouro** |
| **Farma de estética injetável** (toxina, preenchedor, bioestimulador) | Público de face; barreira: compliance de promoção médica — pede cota discreta, sem claim | **Ouro / Prata**, com revisão jurídica |
| **Fios de sustentação e suturas** | Ticket menor, ciclo de decisão curto | **Prata** |
| **Serviços da clínica** (software de gestão, CRM médico, financiamento de procedimento, seguro de responsabilidade médica) | Compra o perfil do público, não a técnica | **Prata** |
| **Institucional** (Instituto Quirontec, banco de tecidos, mídia médica, sociedades) | Contrapartida de visibilidade | **Permuta** |

### 4.4 — Quando isso roda

Abrir na **F2 (outubro)**, decidir na **F4 (novembro)**. Justificativa vem do dado: `entregaveis.yaml` registra que, no ciclo anterior, *"certificados, crachás e patrocinadores saíram entre novembro e fevereiro"*. Se o material do patrocinador é produzido em novembro, **a cota tem que estar vendida em outubro**. Começar em novembro é chegar atrasado ao próprio histórico.

⬜ **Bloqueios da frente:** L-010 (número da edição — entra em backdrop, certificado e arte de patrocinado) · PDF de cotas do ciclo anterior não lido · dono do lado do cliente não definido (é venda de relacionamento: `[HIPÓTESE]` a Gislaine e o Mattioli, não a Stark).

---

## 5 · A REUNIÃO DE APRESENTAÇÃO AO CLIENTE

Regra da casa: **caminhos possíveis, não mega-plano.** O documento acima é nosso raciocínio; a reunião não é a leitura dele.

### 5.1 — Estrutura (≈45 min)

| Bloco | Tempo | Conteúdo | Por quê |
|---|---|---|---|
| **1. O número** | 3 min | Face zerada, R$ 700–800 mil de exposição, 10 vagas. Só isso. | Abrir pela realidade do cliente. Nada de "a Stark preparou". |
| **2. A leitura** | 7 min | A Face não é objeção de preço, é objeção de **categoria**: comparada a um curso de cadáver de fim de semana, R$ 60 mil é absurdo; comparada a uma semana de imersão com instrutor dedicado e docente internacional, entra na conversa. | É o único insight da reunião. Se eles concordarem aqui, o resto flui. Se discordarem, o resto não importa. |
| **3. O que sustenta** | 5 min | As três provas — e a inversão de ordem: **a supervisão lidera, o corpo docente sustenta.** | Mexe diretamente no que o Mattioli declarou querer (posicionamento científico dos sócios) sem contrariá-lo: a proporção 1:1 **é** argumento científico, e é dos sócios, não dos convidados. |
| **4. A big idea** | 5 min | "A sua mão em cada etapa." Uma frase, três justificativas, e a nota de que **não existe assinatura aprovada hoje** (L-013). | |
| **5. Os caminhos** | 15 min | A, B e C abaixo, com consequência declarada. | O miolo. |
| **6. O que trava** | 5 min | As 11 lacunas, em **uma mensagem agrupada**, com dono e o que cada uma segura. Não pedido pingado. | |
| **7. O aviso do idioma** | 3 min | A comunicação sai em **pt-BR**. Reverte decisão explícita do Mattioli no kickoff. Dizer na reunião, não deixar ele descobrir numa peça. | `comunicacao.yaml`, `atencao_ao_cliente`. Conversa muito melhor antes do que depois. |

### 5.2 — Os caminhos

**Caminho A — Prova primeiro** *(nossa recomendação)*
Outubro e novembro inteiros construindo prova e vendendo Face 1:1 sobre base quente. Tráfego roda no valor já aprovado (R$ 10 mil), como **teste de aprendizado**, não como motor de venda. Lote 1 abre em dezembro com estoque de prova pronto.
- **Consequência:** menos volume no topo agora. O ciclo de venda da Face começa cedo, que é o que ele precisa.
- **O que dá errado:** se nenhuma Face fechar até dezembro, sobram 8 semanas e a discussão vira preço — e aí a régua de lote fica sob pressão.

**Caminho B — Escala de topo**
Puxar o orçamento de tráfego já agora (a conversa dos R$ 15–20 mil, hoje travada em R$ 10 mil), abrir o Chile junto de México e Argentina.
- **Consequência:** exige decisão de caixa **antes** do dado. Entramos no leilão contra cursos que cobram menos e conversam com um público maior.
- **O que dá errado:** se não vier, queima o argumento do canal e a próxima conversa de verba fica pior do que está hoje.

**Caminho C — Receita que não depende de vaga**
Abrir a frente de patrocínio agora, com meta explícita de abater uma fatia do risco.
- **Consequência:** consome agenda da Gislaine e do Mattioli — cota se vende por relacionamento, não por mídia. E precisa do PDF de cotas e do número da edição ⬜.
- **O que dá errado:** se o cliente não puser gente nisso, vira tarefa órfã e nada acontece.

**A e C não competem.** Rodam em paralelo com times diferentes. B compete com os dois por caixa e por atenção.

### 5.3 — O que pedir de decisão, ponto a ponto

| # | Decisão | Quem decide | Se não decidir |
|---|---|---|---|
| 1 | **Categoria e âncora da Face.** Mantemos R$ 60 mil e reposicionamos a Face fora de "curso de cadáver", ou baixamos a tabela? Se baixar: muda **por lote**, e a régua tem que sair igual em LP, WhatsApp e comercial (R-005 — foi o que gerou o R$ 20 mil × R$ 25 mil relatado pela Fran). | Diretoria | Toda peça de Face fica travada, e o comercial segue improvisando piso (L-008) |
| 2 | **Patrocínio entra neste ciclo? Com quem do lado de vocês?** | Mattioli + Gislaine | A janela fecha: no ciclo anterior o material de patrocinador saiu em novembro |
| 3 | **Ano do evento e datas de corte dos dois lotes.** | Cliente + Diretoria | Nenhuma peça pode citar data, e a urgência do lote não existe (R-007, L-001, L-004) |

Secundárias, se sobrar tempo: caminho escolhido (A, B ou C) · aprovação da big idea como assinatura · ciente do pt-BR.

---

## 6 · O QUE EU NÃO SEI

Registro explícito, para não virar suposição depois:

1. **Preço de mercado de curso de cadáver no Brasil.** O cliente afirma "preços baixos praticados por sociedades". Não tenho número. Para saber: levantar 5 a 8 cursos concorrentes com preço e proporção aluno/peça publicados.
2. **Preço de *observership* / fellowship curto internacional.** É a âncora de que o reposicionamento da Face depende. Sem isso, o argumento é lógico mas não é demonstrável.
3. **Por que os 22 leads não fecharam.** É a pesquisa mais barata e mais valiosa do projeto inteiro. A Fran tem as conversas. Extrair antes da reunião muda a qualidade do bloco 2.
4. **O que os ex-alunos diriam.** `publico.yaml` afirma que eles repetem por insegurança prática. Cinco ligações confirmam ou derrubam o posicionamento inteiro.
5. **Valores e histórico de cotas de patrocínio.** No PDF do Drive e na cabeça da Gislaine.
6. **Tamanho do mercado endereçável.** Não sei quantos cirurgiões plásticos e otorrinos no México, Argentina e Chile cabem nesse perfil. **Não vou estimar.** Sem isso, o orçamento de tráfego é chute dos dois lados — e é exatamente por isso que a divergência Gustavo × Gislaine não fecha por argumento.
