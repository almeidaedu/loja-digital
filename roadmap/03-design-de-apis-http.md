# Módulo 03 — Design de APIs HTTP

Semanas 6–7 (~20 h). Fontes primárias: RFCs 9110/9457 e guias de referência
da indústria. Este é o módulo em que a API da loja é auditada e corrigida de
verdade.

## Objetivo

Projetar APIs que outros desenvolvedores elogiam: semântica HTTP correta,
erros consistentes em um formato só, paginação bem escolhida, idempotência
onde dinheiro está envolvido e webhooks que não podem ser forjados. O
laboratório é a API real da loja — os fixes são melhorias de produto, e o
resultado escrito (`docs/api-guidelines.md`) vira o contrato que o spec
OpenAPI (módulo 07) e o SDK (módulo 04) vão seguir.

## Pré-requisitos

- Módulos 01–02 concluídos
- A loja rodando local (`server/` na porta 3001, banco seedado)

## Leitura essencial

1. [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) —
   não leia inteira; foque nas seções 9 (métodos, com as definições de *safe*
   e *idempotent*), 15 (status codes) e 13 (conditional requests)
2. [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) —
   inteira; é curta e vira seu formato único de erro
3. [Stripe — Idempotent requests](https://docs.stripe.com/api/idempotent_requests) —
   o padrão de `Idempotency-Key` que todo mundo copia: chave gerada pelo
   cliente, resposta da primeira execução salva e repetida, expiração em 24h
4. [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) —
   leitura seletiva: naming, pagination, errors, versioning. É o melhor guia
   público de estilo de API REST
5. [Mercado Pago — Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks) —
   releia com olhos novos: validação do header `x-signature`, o template de
   HMAC e a política de retry deles (o `server/src/utils/mpSignatureVerify.js` já
   implementa a verificação; agora você vai entender cada linha)

## Conceitos para dominar

- [ ] Métodos: *safe* vs *idempotent*; por que DELETE é idempotente e POST não; PUT vs PATCH
- [ ] Disciplina de status: 200 vs 201 vs 204; 400 vs 422; 401 vs 403; 404 vs 410; 409 para conflito de estado; 429 com `Retry-After`
- [ ] Um único envelope de erro: `application/problem+json` (`type`, `title`, `status`, `detail`, `instance` + extensões suas, ex. `errors[]` de validação)
- [ ] Paginação cursor vs offset: por que offset quebra com escrita concorrente e cursor não; formato `?cursor=...&limit=...` + `next_cursor` na resposta
- [ ] Convenções de filtro e ordenação (`?category=...&sort=-created_at`)
- [ ] Versionamento: path (`/v1`) vs header; o que é breaking change de API
- [ ] Caching de leitura: `ETag`/`If-None-Match` no catálogo público
- [ ] `Idempotency-Key` em POSTs com efeito financeiro (pedido, pagamento)
- [ ] Webhooks: assinatura HMAC sobre o **raw body**, tolerância de timestamp contra replay, responder 2xx rápido e processar depois
- [ ] Autenticação: cookie JWT httpOnly (o que a loja usa, bom para browser) vs `Authorization: Bearer`/API key (o que integrações server-to-server precisam — o SDK vai expor os dois modos)

## Exercícios

Os artefatos deste módulo moram em `docs/` (raiz do repo), não em rascunho —
são documentação de produto.

**1. Auditoria completa da API.** Percorra todos os endpoints reais (use a
tabela do `README.md` como ponto de partida, mas confira contra
`server/src/routes/*.js` — a tabela está desatualizada). Para cada endpoint:
método correto? status codes corretos? valida body? formato de erro? Registre
em `docs/api-audit.md` como tabela: achado, severidade, fix proposto.

Achados já conhecidos para você confirmar e detalhar:

- Em `server/src/routes/orderRoutes.js`, `GET /:id` é declarada antes de
  `GET /admin/all` — a rota `/api/orders/admin/all` documentada no README está
  **sombreada** (cai no handler de `:id` com `id = "admin"`). Os aliases
  `GET/PUT /api/admin/orders*` definidos inline no `app.js` é que funcionam.
  Escolha um caminho canônico e mate o outro.
- Validação com express-validator existe **só** nas rotas de auth. Products,
  cart, orders e payments aceitam qualquer body.
- Statuses de pedido/pagamento são `String` livre no Prisma — nada impede um
  update para um status inexistente ou uma transição inválida.
- Cada controller monta erro do seu jeito; não há um formato único.

Aceite: `docs/api-audit.md` cobre 100% dos endpoints com severidade e fix.

**2. Guia de estilo.** Escreva `docs/api-guidelines.md` (~1 página, objetivo):
formato de erro (RFC 9457 com exemplo real da loja), paginação (cursor),
naming de recursos e campos, versionamento escolhido, headers padrão
(`Idempotency-Key`, `X-Request-Id`), regras de status code. Este documento é
o contrato do spec OpenAPI do módulo 07.
Aceite: outra pessoa conseguiria desenhar um endpoint novo só com o guia.

**3. Top fixes no `server/`.** Implemente os 3 mais importantes da auditoria.
Sugestão de escopo (respeite a regra do projeto: máx. 5 arquivos por fase;
peça revisão em sessão futura se quiser):

- Rota canônica de admin de pedidos (fix da ordem em `orderRoutes.js`,
  remoção dos aliases duplicados do `app.js`)
- `errorHandler.js` emitindo `application/problem+json` para TODO erro,
  incluindo os lançados pelos controllers
- Validação de body nas rotas de products/cart/orders (express-validator já
  está instalado — só não está sendo usado fora de auth)

Aceite: `curl` em rota inexistente, body inválido e recurso de outro usuário
retorna problem+json consistente nos três casos.

**4. Hardening do webhook.** O fluxo atual já monta `express.raw` para
`/api/payments/webhook` **antes** do `express.json()` global (necessário para
o HMAC sobre o raw body — entenda por quê). Adicione: tolerância de timestamp
(rejeitar assinatura com `ts` além de N minutos — anti-replay) e log
estruturado do evento recebido (id, tipo, resultado da verificação).
Aceite: reenviar um payload capturado ontem é rejeitado com 401; o log mostra
o motivo.

## Entrega no capstone

- `docs/api-audit.md` — a auditoria (vira material de marketing técnico: você
  saberá defender cada decisão da API para um cliente)
- `docs/api-guidelines.md` — o contrato de estilo
- Fixes aplicados no `server/` com o webhook endurecido

## Critérios de conclusão

- [ ] Justifica todo status code que a API retorna, citando a RFC 9110
- [ ] 100% dos erros da API saem como `application/problem+json`
- [ ] Explica por que a verificação HMAC exige o raw body e o que o
      timestamp na assinatura previne
- [ ] Sabe dizer quando usaria offset em vez de cursor (e por que aqui não)
- [ ] `docs/api-guidelines.md` escrito e coerente com o código após os fixes

## Aprofundamento

- [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) —
  para levar `ETag`/`Cache-Control` a sério no catálogo
- Rate limiting: `express-rate-limit` já está no server; estude os headers
  padronizados de rate limit (draft da IETF "RateLimit header fields")
- Quando REST não basta: em que cenários GraphQL ou RPC tipado (tRPC) pagam
  seu custo — e por que para SDK público REST + OpenAPI continua imbatível
