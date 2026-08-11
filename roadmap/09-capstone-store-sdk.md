# Módulo 09 — Capstone: @storekit/sdk

Sem semanas fixas — é a montagem final. Se os módulos 01–08 fecharam com
todos os critérios verdes, este módulo é uma semana de integração e
polimento; qualquer buraco que aparecer aqui aponta o módulo a revisitar.

## Objetivo

Provar a promessa do README do roadmap de ponta a ponta, na pele de quem
compra: um cliente que adquire a loja recebe API documentada, SDK no npm e
releases automatizados — e integra em 5 linhas. Este módulo não ensina nada
novo; ele força tudo que existe a funcionar **junto**, partindo de uma
máquina limpa.

## Pré-requisitos

- Módulos 01–08 concluídos (todos os critérios, não "quase todos")

## Checklist de montagem

Verifique cada item **executando**, não lembrando. O que falhar vira issue
com o número do módulo dono do problema.

**A API (módulos 03 e 07):**

- [ ] Setup do zero documentado: clonar o repo, `.env` a partir de um
      `.env.example` completo, migrate + seed, server no ar — cronometrado,
      sem precisar perguntar nada a ninguém
- [ ] 100% dos erros saem `application/problem+json` (teste com rota
      inexistente, body inválido e recurso alheio)
- [ ] Paginação por cursor no catálogo; `Idempotency-Key` honrada em
      `POST /api/orders`
- [ ] Webhook do MP rejeita assinatura inválida e timestamp velho
- [ ] `GET /docs` navegável; try-it funciona; spec passa Spectral com as
      regras da casa

**O SDK (módulos 01, 02, 04, 05, 06):**

- [ ] `npm i @storekit/sdk` num projeto **novo** → autocomplete do
      construtor ao campo da resposta, sem abrir doc
- [ ] Fluxo de checkout completo via SDK contra o server local (login,
      carrinho, pedido, Pix)
- [ ] Erros por `instanceof`, com `requestId` e `problem` preenchidos
- [ ] `for await` atravessa o catálogo inteiro (seed com 2+ páginas)
- [ ] Suite verde em máquina sem Postgres; integração verde com
      `RUN_INTEGRATION=1`; publint + attw limpos no tarball publicado
- [ ] Funciona em Node CJS, Node ESM, TS `node16` e no próprio `client/`
      via Vite

**O pipeline (módulo 08):**

- [ ] PR sabotado não mergeia; PR limpo mergeia sozinho depois dos checks
- [ ] Release por changeset: merge → publish com provenance → CHANGELOG →
      GitHub Release, zero passos manuais
- [ ] Docs públicas no Pages atualizando a cada merge

**A prova das 5 linhas (a promessa literal do README):**

Num diretório vazio, fora do repo:

```ts
import { StoreClient } from '@storekit/sdk';

const store = new StoreClient({ baseURL: 'http://localhost:3001' });
const camisas = await store.products.list({ category: 'camisas' });
console.log(camisas.data.map((p) => p.name));
```

- [ ] `npm i @storekit/sdk && npx tsx demo.ts` imprime os produtos do
      seed. Se precisar de QUALQUER coisa além disso, a promessa não está
      cumprida — conserte antes de seguir

## Fresh eyes: a revisão de venda

Encerre como o roadmap manda: persona de usuário novo. Você é um dev
contratado por um cliente que comprou a loja e precisa integrar um app
mobile via SDK. Só pode usar o que está publicado (README do pacote, docs
no Pages, mensagens de erro). Cronometre:

- [ ] Tempo até a primeira chamada com sucesso < 10 min
- [ ] As três primeiras dúvidas que você teve — as docs respondiam? Se
      não, corrija as docs, não a memória
- [ ] Provoque 3 erros de propósito (baseURL errada, sem auth, body
      inválido): as mensagens dizem o que fazer em seguida?
- [ ] Anote toda fricção em `roadmap/exercicios/09-capstone/fresh-eyes.md`
      e corrija o que for barato; o resto vira backlog

## Critérios de conclusão

- [ ] Checklist de montagem 100% verde, executado (não lembrado)
- [ ] A prova das 5 linhas roda num diretório vazio
- [ ] Fresh eyes feito, fricções corrigidas ou registradas
- [ ] O checkbox "09 — Capstone montado" do README do roadmap marcado —
      junto com todos os outros
- [ ] Você consegue apresentar o produto em 10 minutos para um cliente
      técnico: API, docs, SDK, release — e defender qualquer decisão de
      design citando o módulo que a originou

## Depois do capstone (backlog v0.2+)

Ideias com dono claro, em ordem de valor:

- `store.webhooks.verify(payload, headers)` — verificação de assinatura do
  MP **dentro do SDK**, estilo `stripe.webhooks.constructEvent` (o cliente
  que compra a loja hoje precisa reimplementar isso)
- `orders.watchStatus(id)` — SSE + `for await` (aprofundamento do módulo
  04 virando feature)
- Rate-limit awareness: ler os headers de rate limit e enfileirar em vez
  de estourar 429
- Sistema de plugins à la octokit para customizações por cliente — a tese
  do template revendável aplicada ao SDK
- Publicar também no JSR; avaliar v2 ESM-only (módulo 06, aprofundamento)
- O multi-tenant do template: um `seed` por cliente + theming — o roadmap
  de produto que esta stack agora sustenta

E o hábito que fica: continue lendo SDK profissional toda semana. O
stripe-node de hoje é diferente do de 6 meses atrás — as ferramentas
mudam, o gosto por API bem feita é o que você levou daqui.
