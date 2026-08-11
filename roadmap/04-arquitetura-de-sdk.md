# Módulo 04 — Arquitetura de SDK

Semanas 8–10 (~30 h). Fonte primária: **código-fonte de SDKs profissionais**.
Este é o coração do roadmap — os módulos 01–03 existem para chegar aqui.

## Objetivo

Projetar e implementar um SDK com cara de produto: ergonômico (autocomplete
guia o uso), tipado de ponta a ponta, resiliente (retry/timeout/cancelamento
por padrão), com erros que se tratam por `instanceof` e paginação que se
consome com `for await`. Ao final, o `@storekit/sdk` funciona de verdade
contra a API local.

## Pré-requisitos

- Módulos 01–03 concluídos (tipos de domínio prontos, transporte pronto,
  API auditada com erros em problem+json)

## Leitura essencial

Aqui a leitura é código. Clone os três e leia com um roteiro de perguntas:

1. [stripe-node](https://github.com/stripe/stripe-node) — o SDK mais copiado
   do mundo. Foque em: como os resources são declarados, autopaginação,
   hierarquia de erros, `maxNetworkRetries`
2. [anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript) —
   SDK TypeScript-first moderno. Foque em: o core client, options por request,
   `APIError` e subclasses por status, suporte a `AbortSignal`, streaming SSE
3. [octokit.js](https://github.com/octokit/octokit.js) — arquitetura de
   plugins. Foque em: como o client é composto e estendido sem herança

Roteiro de perguntas (responda para os três):

- Como o cliente é configurado? O que é global vs por request?
- Onde vive o retry? Quais erros/status disparam retry?
- Como um status HTTP vira uma classe de erro? O que o erro carrega
  (status, request id, body)?
- Como a paginação é tipada e consumida?
- O que o entry point exporta? O que é público vs interno?
- Como o SDK aceita um `fetch` custom e por quê?

Complemento: engenharia de quem gera SDK profissionalmente —
[stainless.com](https://www.stainless.com) e [speakeasy.com](https://www.speakeasy.com)
(procure os posts de blog sobre SDK design; é o estado da arte escrito).

## Conceitos para dominar

- [ ] Superfície pública mínima: construtor com options (`baseURL`, auth,
      `timeout`, `maxRetries`, `fetch` custom) + override das mesmas options
      por request
- [ ] Namespacing de resources: `client.products.list()` — descoberta via
      autocomplete, um arquivo por resource
- [ ] Camada de transporte única (a do módulo 02) + hooks/interceptors
      (auth, logging opt-in) — nenhum resource chama `fetch` direto
- [ ] Hierarquia de erros e mapeamento status → classe
- [ ] Paginação: método `list()` retorna a página E é async-iterável —
      `for await (const p of client.products.list())` atravessa páginas
- [ ] `Idempotency-Key`: gerado automaticamente em POSTs financeiros
      (`crypto.randomUUID()`), com opção de passar o seu
- [ ] `X-Request-Id` capturado da resposta e anexado a todo erro (debugável
      em produção)
- [ ] Confiança nos tipos vs validação em runtime na borda (zod): tradeoff
      bundle size vs garantia — decisão documentada no DESIGN.md
- [ ] Isomorfismo real: autenticação em dois modos — cookie/sessão (browser,
      como o `client/` usa hoje) e API key/Bearer (server-to-server)
- [ ] Tree-shaking: exports nomeados, sem side effects no import
- [ ] O que é API pública (semver) vs interno: convenção `src/internal/`

## Exercícios

**1. Notas comparativas.** Responda o roteiro de perguntas para os 3 SDKs em
`roadmap/exercicios/04-sdk/sdk-notes.md`, fechando com uma tabela
comparativa e uma lista "o que vou copiar / o que vou fazer diferente".
Aceite: todas as perguntas respondidas com referência a arquivo/linha real.

**2. Design doc — spec antes de código.** Escreva `sdk/DESIGN.md` com TODA a
superfície pública do v0:

- Assinatura de cada método de cada resource (`products`, `categories`,
  `cart`, `orders`, `payments`, `auth`) com tipos de params e retorno
- Options do construtor e overrides por request
- Tabela status HTTP → classe de erro
- Exemplos de uso (o "hello world" de cada resource)
- Decisões com justificativa: validação runtime ou não, modos de auth,
  política de retry

Aceite: o doc passa por uma revisão de "staff engineer" (peça a revisão em
sessão futura) antes de qualquer implementação.

**3. Core + primeiros resources.** Implemente:

```
sdk/src/
├── index.ts          # export { StoreClient } + tipos públicos + erros
├── client.ts         # StoreClient: options, merge de defaults, monta resources
├── errors.ts         # hierarquia abaixo
├── pagination.ts     # Page<T> async-iterável
├── http/transport.ts # já existe (módulo 02)
└── resources/
    ├── products.ts   # list (paginado, filtros), get(slug)
    └── categories.ts # list
```

Hierarquia de erros (padrão da indústria — compare com a do stripe-node):

```ts
export class StoreError extends Error {}
export class APIConnectionError extends StoreError {}        // rede/timeout
export class APIError extends StoreError {                   // resposta não-2xx
  status: number;
  requestId?: string;
  problem?: ProblemDetails;                                  // RFC 9457 (módulo 03)
}
export class BadRequestError extends APIError {}             // 400
export class AuthenticationError extends APIError {}         // 401
export class PermissionDeniedError extends APIError {}       // 403
export class NotFoundError extends APIError {}               // 404
export class ConflictError extends APIError {}               // 409
export class RateLimitError extends APIError {}              // 429
export class InternalServerError extends APIError {}         // 5xx
```

Aceite: contra o server local — `products.list()` retorna dados tipados;
`products.get('slug-inexistente')` rejeita com `NotFoundError` e
`err instanceof APIError` é `true`.

**4. Resources completos.** Adicione `cart`, `orders` (com `Idempotency-Key`
automático no `create`), `payments` (`createPreference`, `createPix`,
`getStatus`) e `auth` (`login`/`logout`/`me` no modo cookie). Escreva
`sdk/examples/checkout.ts`: login, adicionar ao carrinho, criar pedido, gerar
pagamento Pix — o fluxo de compra inteiro via SDK.

Comandos (rode você): `cd sdk && npx tsc --noEmit && npx tsx examples/checkout.ts`
(instale `tsx` como devDependency para rodar TS direto: `npm i -D tsx`).

Aceite: o checkout roda ponta a ponta contra o server local seedado.

## Entrega no capstone

O SDK core completo: `StoreClient` com 6 resources, erros tipados, paginação
async-iterável, idempotência automática e exemplo de checkout funcionando.
É a peça central de tudo que vem depois — testes (05), packaging (06),
contrato OpenAPI (07) e release (08).

## Critérios de conclusão

- [ ] `new StoreClient({ baseURL }).products.list()` — autocomplete completo
      do construtor ao campo da resposta, sem olhar doc
- [ ] Todo erro da API vira a subclasse certa; `instanceof` funciona;
      `requestId` presente quando o server enviar
- [ ] `for await` atravessa múltiplas páginas de produtos (seed com mais de
      uma página para provar)
- [ ] `orders.create()` reenviado com a mesma `Idempotency-Key` não duplica
      pedido (exige o suporte no server — fix do módulo 03)
- [ ] `examples/checkout.ts` roda ponta a ponta
- [ ] `DESIGN.md` reflete o código final (ou foi atualizado junto)

## Aprofundamento

- Streaming SSE: como o anthropic-sdk-typescript implementa `for await` sobre
  eventos — base para um futuro `orders.watchStatus()`
- Sistema de plugins do octokit: como oferecer extensibilidade sem quebrar
  a superfície tipada
- Edge runtimes (Cloudflare Workers): o que quebraria no seu SDK hoje?
  (Se a resposta for "nada", o módulo 02 foi bem feito.)
