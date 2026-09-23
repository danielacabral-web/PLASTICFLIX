# Motor de regras — Plasticflix Prime

Nove regras verificam toda peça antes de ela existir como entrega. O motor é
`index.js`; cada regra mora num arquivo próprio.

## Contrato

Uma regra é uma **função pura** `(texto, contexto)` que devolve:

- `null` — nada a dizer;
- **um achado**;
- **uma lista de achados**.

Achado:

```js
{ regra_id: 'R-005', nivel: 'BLOQUEIO' | 'ALERTA', detalhe: '...', acao: '...' }
```

Campos extras (`padrao`, `termos`, `valores`, `produto_ref`…) são livres e
servem para a tool explicar o veredito a quem escreveu a peça.

`detalhe` diz **o que** a regra viu. `acao` diz **o que fazer** — um bloqueio sem
saída só paralisa.

## Veredito

`runRules(texto, contexto)` roda as nove e consolida:

| Situação | Veredito |
| --- | --- |
| ao menos um `BLOQUEIO` | `BLOQUEADO` |
| só `ALERTA` | `AJUSTAR` |
| nada | `APROVADO` |

Regra que lança exceção **vira bloqueio**, com detalhe dizendo que o erro é de
sistema, não da peça. Regra quebrada nunca aprova por omissão.

## A regra de ouro: o fato mora no YAML

**Nenhum veto guarda cópia de um fato dentro do JavaScript.** Preço, data,
hospital, idioma, praça, lacuna — tudo é lido de `data/*.yaml` via
`carregarYaml`.

Isso corrige um defeito conhecido do repo da AExPI: lá a regra de sigilo tinha o
veto escrito no código, e quando o fato mudou no mundo o motor continuou
bloqueando copy correta. Aqui, quando alguém preencher `evento.ano` em
`data/perfil-plasticflix.yaml`, a R-007 para de bloquear sozinha — sem tocar em
uma linha de JS.

Se você está prestes a escrever um valor literal numa regra, pergunte se esse
valor pode mudar por decisão de cliente ou de diretoria. Se puder, ele vai para
o YAML.

## As nove regras

| id | nome | veto | lê de |
| --- | --- | --- | --- |
| R-001 | Elegibilidade e RQE | sim | `publico.yaml` |
| R-002 | Sem transmissão de cirurgia | sim | `perfil-plasticflix.yaml` |
| R-003 | Sem tráfego pago no Brasil | sim | `frentes.yaml` (F2) |
| R-004 | Idioma da peça pública | sim | `comunicacao.yaml` |
| R-005 | Preço e regra de lote | sim | `produtos.yaml` |
| R-006 | Promessa e CFM | sim | — (padrões de linguagem) |
| R-007 | Dado não confirmado | sim | `perfil-plasticflix.yaml`, `produtos.yaml` |
| R-008 | Etapa do funil | **não** | `comunicacao.yaml`, `produtos.yaml` |
| R-009 | Lacuna bloqueante | sim | `lacunas.yaml` |

R-008 é alerta de propósito: a posição de manter o Instagram no percurso ainda
vai ser provada com dado no primeiro ciclo, e regra que veta hipótese impede o
teste que resolveria a discussão.

## Contexto esperado

```js
runRules(texto, {
  canal: 'instagram' | 'stories' | 'anuncio' | 'landing_page' | 'email' | 'mala_direta' | 'whatsapp' | 'interno',
  praca: 'brasil' | 'mexico' | 'argentina' | 'chile' | 'venezuela' | 'internacional',
  idioma: 'en' | 'pt-BR',
  produto_ref: 'P-004',        // id de data/produtos.yaml
  destino: 'landing_page',     // para onde o CTA leva
  fluxo: 'inscricao',          // quando a peça descreve o fluxo comercial
  gate_rqe: true,              // a checagem de credencial existe no fluxo
  depende_de: ['L-005'],       // ids de data/lacunas.yaml
});
```

## Como adicionar uma regra

1. Crie `src/rules/<nome>.js` com `export default function (texto, contexto)`.
   Use `achado()` de `_util.js` para montar a saída — o formato importa.
2. Leia todo fato de `data/*.yaml`. Se o dado ainda não existe, trate `null`
   explicitamente (é assim que R-007 sabe que deve bloquear).
3. Escolha o nível com honestidade: **BLOQUEIO** só para o que não pode ir ao ar
   de jeito nenhum. Regra que veta demais é desligada pelo time, e aí ela não
   protege mais nada.
4. Escreva `acao` dizendo o caminho: o que fazer agora, e o que ainda dá para
   entregar enquanto isso.
5. Registre a regra em `REGRAS`, no `index.js`, com id, nome e `veto`. Regra fora
   dessa lista não existe para o motor.
6. Cubra a regra num teste com pelo menos dois casos: um que dispara e um que
   passa limpo. O caso limpo é o que pega falso positivo.

O comentário de cabeçalho de cada arquivo explica **por que** a regra existe, não
o que ela faz — isso o código já diz.
