# Módulo 07 — OpenAPI

Semanas 15–16 (~20 h). Fontes primárias: a spec OpenAPI 3.1, o site oficial
de aprendizado learn.openapis.org e JSON Schema 2020-12.

## Objetivo

Escrever à mão o `openapi.yaml` 3.1 da API inteira da loja — guiado pelo
`docs/api-guidelines.md` do módulo 03 —, lintar com Spectral, servir docs
navegáveis com Scalar e, o mais importante, tornar o **drift impossível**:
um teste que falha quando o server responde diferente do spec, e tipos
gerados do spec comparados contra os tipos do SDK. Ao final, spec, server e
SDK são provadamente o mesmo contrato.

## Pré-requisitos

- Módulo 03 concluído (guidelines escritas, erros em problem+json no server)
- Módulo 05 concluído (a suite de integração é onde o anti-drift pluga)

## Leitura essencial

1. [learn.openapis.org](https://learn.openapis.org) — o guia oficial:
   estrutura do documento, paths, content, components, docs
2. [OpenAPI 3.1 — spec](https://spec.openapis.org/oas/v3.1.0) — leitura de
   referência: Paths Object, Components, Security Scheme e o **Webhooks
   Object** (novidade da 3.1 que você vai usar para o webhook do MP)
3. [JSON Schema — learnjsonschema.com](https://www.learnjsonschema.com/2020-12/) —
   OpenAPI 3.1 usa JSON Schema 2020-12 de verdade; domine `$ref`, `allOf`,
   `oneOf` + `discriminator`, `required`, `additionalProperties`
4. [Spectral](https://docs.stoplight.io/docs/spectral) — linting de spec:
   ruleset padrão `spectral:oas` e como escrever regras próprias
5. [Scalar](https://github.com/scalar/scalar) — as docs navegáveis; veja a
   integração com Express
6. [openapi-typescript](https://openapi-ts.dev) — gerar tipos TS do spec
7. Inspiração real: o [spec público da Stripe](https://github.com/stripe/openapi) —
   abra e veja como modelam erros, paginação e expansão

## Conceitos para dominar

- [ ] Spec-first vs code-first: por que aqui é spec escrito à mão (controle
      e aprendizado) e quando geradores fazem sentido
- [ ] `operationId` único e estável — é ele que vira nome de método em
      SDKs gerados e âncora de doc
- [ ] `components` como DRY do spec: `Problem` (RFC 9457) definido UMA vez e
      referenciado em toda resposta de erro; parâmetros de paginação
      (`cursor`, `limit`) e resposta paginada como componentes
- [ ] `securitySchemes` espelhando o módulo 03: cookie (`apiKey` in cookie)
      para o browser + `http: bearer` para server-to-server — e o que
      `security: []` significa em rota pública
- [ ] `webhooks` (3.1): documentar o POST que o Mercado Pago faz em
      `/api/payments/webhook`, incluindo o header `x-signature`
- [ ] `readOnly`/`writeOnly`: um schema `Product` só, servindo request e
      response sem duplicar
- [ ] `examples` nomeados por operação — as docs ficam boas na proporção
      exata dos seus examples
- [ ] Enums do domínio (`OrderStatus`, `PaymentStatus`) como schemas
      reutilizados — a union de literais do módulo 01 agora em JSON Schema
- [ ] Lint como guideline executável: cada regra do
      `docs/api-guidelines.md` que puder virar regra Spectral, vira
- [ ] Drift bidirecional: server valida contra o spec em teste
      (runtime) e SDK compara tipos gerados vs escritos (compile time)

## Exercícios

O spec é produto: vive em `docs/openapi.yaml`. Rascunhos em
`roadmap/exercicios/07-openapi/`.

**1. Esqueleto + primeiro resource.** `info`, `servers` (local :3001),
`tags`, e o caminho completo de `products` e `categories`:
`GET /api/products` (paginação cursor + filtro `category`),
`GET /api/products/{slug}`, CRUD admin. Componentes compartilhados desde o
início: `Problem`, `PageInfo`, `CursorParam`, `LimitParam`, os dois
`securitySchemes`.
Aceite: `npx spectral lint docs/openapi.yaml` com ruleset `spectral:oas`
sem erros; docs de products legíveis no Scalar.

**2. Spec completo.** Todos os endpoints reais: auth, cart, orders,
payments, admin (`/api/admin/orders`, `/api/admin/orders/{id}/status`,
`/api/admin/stats`), `/api/health` — e o webhook do MP no objeto
`webhooks`. Toda operação com `operationId`, tag, summary, exemplos, e
TODAS as respostas de erro referenciando `Problem`.
Para garantir 100% de cobertura, escreva
`server/scripts/dump-routes.js` (lista as rotas montadas no Express) e
compare com os paths do spec.
Aceite: o diff rotas-reais × spec é vazio, nos dois sentidos.

**3. Guidelines como regras Spectral.** `.spectral.yaml` estendendo
`spectral:oas` com regras suas: toda operação tem `operationId`; toda
resposta 4xx/5xx é `application/problem+json`; campos em camelCase (o
contrato que o PR #1 padronizou); parâmetros de paginação usam os
componentes compartilhados.
Aceite: um spec-fixture deliberadamente errado dispara cada regra custom;
o spec real passa limpo.

**4. Docs navegáveis.** Sirva o Scalar em `GET /docs` no server (a rota
serve o HTML do Scalar apontando para o yaml, que sai em
`GET /docs/openapi.yaml`). Botão "try it" funcionando contra o próprio
server local.
Aceite: abrir `http://localhost:3001/docs`, navegar por tag, executar um
`GET /api/products` de dentro da doc.

**5. Anti-drift runtime.** Plugue o
[express-openapi-validator](https://github.com/cdimascio/express-openapi-validator)
no app **somente em ambiente de teste**, com `validateResponses: true`, e
rode a suite de integração do módulo 05 através dele.
Aceite: renomear um campo qualquer da resposta de `products` (mutação
proposital) derruba a suite; desfazer deixa verde.

**6. Anti-drift de tipos.** Gere `sdk/src/types/generated.ts` com
`openapi-typescript` (script `npm run generate:types` no sdk) e escreva
type tests (`Equal`/`expectTypeOf`, módulo 05) provando que os tipos
escritos à mão do SDK são compatíveis com os gerados do spec.
Aceite: mudar um campo no spec quebra o type test do SDK antes de qualquer
usuário perceber.

Comandos (rode você — nenhum comando npm é executado pelo agente):

```
npx @stoplight/spectral-cli lint docs/openapi.yaml
cd sdk && npx openapi-typescript ../docs/openapi.yaml -o src/types/generated.ts
```

## Entrega no capstone

`docs/openapi.yaml` cobrindo 100% da API + `.spectral.yaml` com as regras
da casa + docs navegáveis em `/docs` + os dois testes anti-drift rodando na
suite. É a promessa nº 1 do capstone: "API documentada com spec OpenAPI 3.1
e docs navegáveis".

## Critérios de conclusão

- [ ] Spec cobre todos os endpoints reais, provado pelo diff do
      dump-routes
- [ ] Spectral limpo, incluindo as regras custom que codificam as
      guidelines
- [ ] Docs no Scalar navegáveis com try-it funcionando
- [ ] Mutação no server derruba a suite (anti-drift runtime provado)
- [ ] Mutação no spec quebra o type test do SDK (anti-drift de tipos
      provado)
- [ ] Explica por que OpenAPI 3.1 ≈ JSON Schema 2020-12 importa (um
      vocabulário só, ferramentas de validação reaproveitáveis)

## Aprofundamento

- Gere um SDK inteiro do seu spec com [Stainless](https://www.stainless.com)
  ou [Speakeasy](https://www.speakeasy.com) (têm tier gratuito) e compare
  com o seu à mão: o que o gerador fez melhor? O que você não abriria mão?
- [Schemathesis](https://schemathesis.readthedocs.io): fuzzing
  property-based derivado do spec — deixe-o torturar a API da loja
- Overlays e versionamento de spec: como evoluir `openapi.yaml` sem
  breaking (conecta com o semver do módulo 06)
- `$dynamicRef` e os limites do JSON Schema em OpenAPI — onde a
  ferramenta-média para de acompanhar a spec
