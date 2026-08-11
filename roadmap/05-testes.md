# Módulo 05 — Testes

Semanas 11–12 (~20 h). Fontes primárias: docs do Vitest e do MSW — e as
suites de teste dos SDKs profissionais que você leu no módulo 04.

## Objetivo

Testar o SDK como um autor de biblioteca testa: unit para lógica pura,
testes de contrato com rede mockada (nenhum teste de unidade toca a rede de
verdade), testes de tipo que travam a superfície pública, e uma suite de
integração opt-in contra o server local. Ao final, o `@storekit/sdk` tem
uma suite rápida, determinística e que quebra quando o comportamento — ou o
tipo — muda sem querer.

## Pré-requisitos

- Módulo 04 concluído (SDK core funcionando contra a API local)
- O transporte aceita `fetch` injetável (módulo 02 — é agora que isso paga)

## Leitura essencial

1. [Vitest — Guide](https://vitest.dev/guide/) — getting started, filtering,
   coverage
2. [Vitest — Mocking](https://vitest.dev/guide/mocking.html) — foco em
   **fake timers** (`vi.useFakeTimers`) e mock de funções
3. [Vitest — Testing Types](https://vitest.dev/guide/testing-types.html) —
   `expectTypeOf`, `assertType` e como os type tests rodam no `tsc`, não no
   runtime
4. [MSW — docs](https://mswjs.io/docs/) — leia a filosofia: interceptar na
   fronteira da rede em vez de mockar seu próprio código
5. Suites reais: [testes do anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/tests)
   e [do stripe-node](https://github.com/stripe/stripe-node/tree/master/test) —
   procure como eles testam retry, timeout e a hierarquia de erros

## Conceitos para dominar

- [ ] A pirâmide de um SDK: unit (lógica pura) → contrato (transporte com
      rede mockada) → integração (server real, opt-in) → type tests
- [ ] Determinismo: teste que depende de relógio, rede ou ordem de execução
      é teste quebrado esperando data para falhar
- [ ] Fake timers: testar backoff de segundos em milissegundos; por que
      `await vi.advanceTimersByTimeAsync()` e não `sleep()` real
- [ ] Mock de `Math.random()` para provar os limites do full jitter
- [ ] `fetch` injetado vs MSW: quando cada um — injeção para o transporte
      (controle total da resposta), MSW quando quiser testar o SDK inteiro
      sem tocar no transporte
- [ ] Testar `AbortSignal`: cancelamento propaga, nenhuma unhandled
      rejection fica para trás (o process não pode logar warning)
- [ ] Type tests como contrato: mudar a superfície pública sem querer tem
      que quebrar o build, não o usuário
- [ ] `@ts-expect-error` como asserção de que algo NÃO compila
- [ ] Coverage v8: o que 100% prova (pouco) e o que 60% no arquivo errado
      denuncia (muito)
- [ ] Integração opt-in por env var: a suite padrão roda em qualquer máquina
      sem Postgres; a de integração exige o server seedado

## Exercícios

Rascunhos em `roadmap/exercicios/05-testes/`; os testes de produto vivem em
`sdk/tests/`.

**1. Setup + unit da lógica pura.** Configure o Vitest no `sdk/`
(`vitest.config.ts`, scripts `test` e `test:watch`). Primeiros alvos, sem
rede: cálculo de backoff (com `Math.random` mockado, prove que o delay fica
em `[0, min(cap, base * 2^attempt)]`), parse de `Retry-After` (segundos e
data HTTP), mapeamento status → classe de erro, extração de cursor da
resposta de paginação.
Aceite: suite roda em menos de 1 s, zero acesso à rede (desligue o Wi-Fi e
ela continua verde).

**2. Retry sob fake timers.** Teste o transporte com `fetch` injetado que
falha N vezes: 503 → 503 → 200 resolve na terceira; `Retry-After: 2` espera
2 s **virtuais**; `maxRetries: 1` rejeita com o erro da última resposta;
4xx de validação NÃO faz retry. Asserte o número exato de chamadas ao fetch
mockado.
Aceite: o teste "espera" segundos de backoff mas a suite inteira termina em
milissegundos.

**3. Matriz de contrato do transporte.** Com `fetch` injetado, cubra a
matriz completa de respostas:

- 200 com JSON válido → dados tipados
- 204 sem body → não explode tentando parsear
- 400/401/403/404/409/429 com `application/problem+json` → subclasse certa,
  `problem` parseado, `err instanceof APIError` true
- 429 com `Retry-After` → espera e tenta de novo
- 5xx → retry e, esgotado, `InternalServerError`
- Erro de rede (fetch rejeita) → `APIConnectionError` com `cause` preservada
- JSON malformado com status 200 → erro claro, não `SyntaxError` solto
- `X-Request-Id` presente na resposta → anexado ao erro

E o teste que separa SDK amador de profissional: **a `Idempotency-Key` de
`orders.create()` é a MESMA em todas as tentativas de retry** — se mudar
entre tentativas, a idempotência do server não serve para nada.
Aceite: matriz completa verde; o teste da chave estável em retry existe e
passa.

**4. Paginação.** Com fetch mockado servindo 3 páginas: `for await` percorre
as 3 e para; o cursor de cada request é o `nextCursor` da resposta anterior;
página vazia encerra sem request extra.
Aceite: asserção sobre a sequência exata de URLs chamadas.

**5. Type tests.** Em `sdk/tests/types.test-d.ts`, trave a superfície
pública com `expectTypeOf`:

```ts
expectTypeOf(client.products.list).parameter(0).toMatchTypeOf<{ category?: string } | undefined>();
expectTypeOf(await client.products.get(slug)).toMatchTypeOf<Product>();
// @ts-expect-error — ProductId não é OrderId (brand do módulo 01)
client.orders.get(productId);
```

Aceite: renomear um campo de `Product` quebra o type test antes de quebrar
qualquer usuário.

**6. Integração opt-in.** `sdk/tests/integration/checkout.test.ts` — o fluxo
do `examples/checkout.ts` (módulo 04) virando teste: login, carrinho,
pedido, Pix. Roda só com `RUN_INTEGRATION=1` (senão `describe.skipIf`).
Aceite: `RUN_INTEGRATION=1` contra o server seedado passa; sem a env var, a
suite pula e continua verde em máquina limpa.

Comandos (rode você — nenhum comando npm é executado pelo agente):

```
cd sdk
npm i -D vitest @vitest/coverage-v8
npx vitest run
npx vitest run --coverage
```

## Entrega no capstone

A suite do SDK: `npm test` verde em qualquer máquina sem server; type tests
rodando junto (`typecheck: true` no config do Vitest); integração opt-in
documentada no README do `sdk/`; coverage dos arquivos core (`transport`,
`errors`, `pagination`) ≥ 90% — sem perseguir 100% global.

## Critérios de conclusão

- [ ] Explica quando usar fetch injetado, quando MSW e quando server real —
      e por que a suite padrão nunca toca a rede
- [ ] Testes de retry/backoff rodam com fake timers; suite inteira < 5 s
- [ ] Matriz de contrato cobre todos os status + erro de rede + JSON inválido
- [ ] O teste de `Idempotency-Key` estável entre retries existe e você sabe
      explicar que bug ele previne
- [ ] Type test quebra o build quando a superfície pública muda
- [ ] Coverage ≥ 90% nos arquivos core, e você sabe dizer o que os 10%
      restantes são (e por que não valem um teste)

## Aprofundamento

- Property-based testing com [fast-check](https://fast-check.dev): gere
  milhares de casos para os limites do backoff e o parser de cursor
- Mutation testing com [Stryker](https://stryker-mutator.io): descubra
  quais dos seus testes não testam nada
- O server tem zero testes: monte uma suite mínima com
  [supertest](https://github.com/ladjs/supertest) guiada pela auditoria do
  módulo 03 (os 3 fixes implementados merecem regressão)
- Snapshot testing: quando serializar o request inteiro vale mais que 10
  asserções — e quando snapshot vira ruído que todo mundo aprova sem ler
