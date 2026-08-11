# Roadmap: TypeScript/JavaScript Expert — SDKs e APIs profissionais

Plano de estudo prático para dominar TypeScript e JavaScript no nível exigido
para construir SDKs escaláveis e APIs de alto padrão — o mesmo nível de
engenharia de um `stripe-node` ou `@anthropic-ai/sdk`.

Tudo aqui é ancorado no projeto real deste repositório (a loja em `client/` +
`server/`). Nenhum exercício é descartável: cada módulo produz uma peça de um
produto vendável.

## O norte (capstone)

Ao final do roadmap, um cliente que compra a loja recebe:

1. Uma API documentada com spec **OpenAPI 3.1** e docs navegáveis (Scalar)
2. Um SDK TypeScript publicado no npm (`@storekit/sdk`) com tipos estritos,
   retries automáticos, paginação por async iterator e erros tipados
3. Changelog e releases automatizados via CI

Integração em 5 linhas:

```ts
import { StoreClient } from '@storekit/sdk';

const store = new StoreClient({ baseURL: 'https://api.minhaloja.com' });
const camisas = await store.products.list({ category: 'camisas' });
```

## Como usar

- Cadência: ~10 h/semana, divididas em ~40% leitura e ~60% construção.
- Siga os módulos em ordem — cada um assume o anterior.
- Todo módulo termina com **Critérios de conclusão**. Só avance quando todos
  passarem. O cronograma é indicativo; os critérios é que mandam.
- Marque os checkboxes direto nestes arquivos para registrar progresso.
- Rascunhos e exercícios ficam em `roadmap/exercicios/<NN-modulo>/`. Código
  que vira produto (tipos de domínio, transporte HTTP) vai direto para `sdk/`.

## Regras de estudo

1. `strict: true` sempre. `any` é proibido — use `unknown` e prove o tipo.
2. Leia código-fonte de SDK profissional toda semana (stripe-node,
   anthropic-sdk-typescript, octokit). É a melhor documentação que existe.
3. Docs oficiais primeiro; tutorial de terceiros só como apoio.
4. Quando travar, escreva o problema em uma frase antes de procurar a solução.
5. Todo módulo termina com um artefato funcionando, não só leitura.

## Cronograma (10 h/semana, ~16–18 semanas)

| Semanas | Módulo | Entrega no capstone |
|---|---|---|
| 1–3 | [01 TypeScript Avançado](01-typescript-avancado.md) | `sdk/` criado, tipos de domínio compilando em strict |
| 4–5 | [02 Runtime JavaScript](02-runtime-javascript.md) | Transporte HTTP com retry/backoff, runtime-agnostic |
| 6–7 | [03 Design de APIs HTTP](03-design-de-apis-http.md) | Auditoria + fixes reais no `server/`, guia de estilo de API |
| 8–10 | [04 Arquitetura de SDK](04-arquitetura-de-sdk.md) | `StoreClient` completo funcionando contra a API local |
| 11–12 | [05 Testes](05-testes.md) | Suite do SDK: unit + rede mockada + type tests |
| 13–14 | [06 npm e Packaging](06-npm-e-packaging.md) | Build dual ESM/CJS passando publint e arethetypeswrong |
| 15–16 | [07 OpenAPI](07-openapi.md) | `openapi.yaml` completo + docs navegáveis + teste anti-drift |
| 17–18 | [08 CI/CD e Releases](08-ci-cd-e-releases.md) | Pipeline completo com release automatizado |
| — | [09 Capstone](09-capstone-store-sdk.md) | Checklist final de montagem |

## Progresso

- [ ] 01 — TypeScript Avançado
- [ ] 02 — Runtime JavaScript
- [ ] 03 — Design de APIs HTTP
- [ ] 04 — Arquitetura de SDK
- [ ] 05 — Testes
- [ ] 06 — npm e Packaging
- [ ] 07 — OpenAPI
- [ ] 08 — CI/CD e Releases
- [ ] 09 — Capstone montado

## Baseline do projeto (agosto/2026)

Por que este roadmap tem esta forma — lacunas reais do repo hoje:

- Zero TypeScript: `server/` em CommonJS JavaScript, `client/` em JSX
- Zero testes, lint e CI (nenhum `.github/`, nenhum test runner)
- O contrato da API é uma tabela manual no README, já desatualizada em
  relação às rotas reais
- Validação de body só nas rotas de auth
- Statuses de pedido/pagamento como string livre no Prisma (sem enum)

Cada uma dessas lacunas vira exercício em algum módulo. Ao fechar o roadmap,
todas estarão resolvidas no produto.
