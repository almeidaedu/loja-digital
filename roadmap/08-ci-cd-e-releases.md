# Módulo 08 — CI/CD e Releases

Semanas 17–18 (~20 h). Fontes primárias: docs do GitHub Actions, Changesets
e npm (publicação com provenance).

## Objetivo

Automatizar tudo que até aqui era disciplina manual: cada PR passa por
typecheck, lint, testes, packaging e lint de spec antes de poder mergear; e
release vira consequência de merge — Changesets versiona, gera CHANGELOG,
publica no npm com provenance e cria a GitHub Release, sem passo manual. Ao
final, o repo tem o pipeline que você esperaria encontrar no stripe-node.

## Pré-requisitos

- Módulos 05–07 concluídos (o CI só orquestra o que já existe: testes,
  publint/attw, spectral, anti-drift)
- Conta no npm com o escopo do pacote criado (a org `storekit` — o nome
  estava livre na checagem de agosto/2026; confirme ao criar) — configure
  antes, é pré-requisito manual

## Leitura essencial

1. [GitHub Actions — Quickstart](https://docs.github.com/en/actions/writing-workflows/quickstart)
   e [Workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions) —
   triggers, jobs, needs, matrix, concurrency
2. [Service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers) —
   Postgres efêmero para o job de integração
3. [Publishing Node.js packages](https://docs.github.com/en/actions/use-cases-and-examples/publishing-packages/publishing-nodejs-packages)
   + [npm — Trusted publishing / provenance](https://docs.npmjs.com/generating-provenance-statements) —
   publicar do CI via OIDC, sem token de longa duração
4. [Changesets](https://github.com/changesets/changesets) — o README e o
   [changesets/action](https://github.com/changesets/action)
5. [Branch protection / rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) —
   required status checks
6. CI dos profissionais: `.github/workflows/` do
   [stripe-node](https://github.com/stripe/stripe-node/tree/master/.github/workflows) e do
   [anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/.github/workflows)

## Conceitos para dominar

- [ ] Anatomia de workflow: `on`, `jobs`, `steps`, `needs`, matrix (Node
      20/22), `concurrency` com cancel-in-progress (PR novo cancela run
      velho)
- [ ] Cache de dependências (`actions/setup-node` com `cache: npm`) e o que
      NÃO cachear
- [ ] `npm ci` vs `npm install` — por que CI usa `ci`
- [ ] Job de integração hermético: Postgres como service container +
      migrate + seed + server no ar + suite de integração e anti-drift —
      nasce e morre dentro do job, zero estado
- [ ] Required status checks: merge bloqueado até tudo verde; por que isso
      é o contrato social do repo, não burocracia
- [ ] Fluxo Changesets: PR de feature carrega um changeset (patch/minor/
      major + resumo); o action abre/atualiza o "Version Packages" PR;
      mergear ELE publica — versionamento é decisão de quem escreve o PR,
      não de quem faz release
- [ ] OIDC / trusted publishing: o job troca identidade do workflow por
      credencial efêmera do npm; nenhum secret de npm guardado no GitHub
- [ ] Provenance: o que o atestado prova (este tarball saiu deste commit
      neste workflow) e o selo na página do npm
- [ ] `GITHUB_TOKEN` com permissões mínimas (`permissions:` explícito por
      job; `id-token: write` só onde publica)
- [ ] Segurança de supply chain básica: pin de actions por SHA vs tag,
      Dependabot/Renovate para as próprias actions

## Exercícios

Workflows são produto: vivem em `.github/workflows/`. Rascunhos em
`roadmap/exercicios/08-ci/`.

**1. Quality gates locais primeiro.** O repo não tem lint nenhum. Antes do
CI: ESLint flat config com `typescript-eslint` (preset
`strict-type-checked`) no `sdk/`, e ESLint base no `server/` (JS). Script
`npm run check` em cada pacote = typecheck + lint + testes unitários.
Aceite: `npm run check` verde nos dois pacotes; pelo menos 1 bug real
apontado pelo lint type-checked corrigido (ele SEMPRE acha algum).

**2. `ci.yml` — o pipeline de PR.** Três jobs:

- **sdk** (matrix Node 20/22): `npm ci`, typecheck, lint, `vitest run`,
  build, `publint`, `attw --pack`
- **server**: lint + `spectral lint docs/openapi.yaml` + diff do
  dump-routes × spec (anti-drift de rotas do módulo 07)
- **integration** (needs: sdk): service container Postgres, `prisma
  migrate deploy` + seed, server no ar em background, suite de integração
  com `RUN_INTEGRATION=1` + anti-drift runtime

`concurrency` cancelando runs obsoletos; `permissions: contents: read` no
topo. Depois, configure branch protection exigindo os três checks.
Aceite: PR de teste mostra os três verdes; um teste quebrado de propósito
bloqueia o merge no botão; push direto na main recusado.

**3. `release.yml` — Changesets + publish com provenance.** `changesets
init` no `sdk/`; workflow no push da main rodando `changesets/action`: sem
changesets pendentes, não faz nada; com, abre o PR "Version Packages";
merge do PR publica com `npm publish --provenance --access public` via
OIDC (configure o trusted publisher na página do pacote no npm), cria tag
e GitHub Release com o changelog.
Antes do primeiro publish: remover `"private": true` do `sdk/package.json`.
Aceite: `@storekit/sdk@0.1.0` no ar com selo de provenance na página do
npm; CHANGELOG.md gerado; tag e Release no GitHub — e nenhum token de npm
guardado em secret.

**4. Docs publicadas.** Job no push da main publicando as docs do módulo
07 no GitHub Pages: um `index.html` estático do Scalar + o `openapi.yaml`
(actions `upload-pages-artifact` + `deploy-pages`).
Aceite: URL pública `https://<user>.github.io/<repo>/` mostra as docs; um
merge que muda o spec atualiza a página sozinho.

**5. Simulação de release completa.** O teste de fogo, ponta a ponta: crie
um branch adicionando um método pequeno ao SDK (ex.:
`orders.cancel(id)`), com teste, atualização do spec e um changeset
`minor`. PR → checks verdes → merge → "Version Packages" aparece → merge →
0.2.0 publicado → `npm i @storekit/sdk@0.2.0` num projeto limpo e o
método novo está lá, tipado.
Aceite: o ciclo inteiro sem nenhum comando manual de versão/publish/tag.

Comandos (rode você — nenhum comando npm é executado pelo agente):

```
cd sdk
npm i -D eslint typescript-eslint @changesets/cli
npx changeset init
npx changeset          # cria um changeset interativamente
```

## Entrega no capstone

`.github/workflows/ci.yml` + `release.yml` + Pages; branch protection
ativa; o pacote publicado no npm com provenance e CHANGELOG automatizado.
É a promessa nº 3 do capstone: "changelog e releases automatizados via CI".

## Critérios de conclusão

- [ ] PR com teste quebrado NÃO consegue mergear (provado com PR sabotado)
- [ ] Job de integração roda hermético: Postgres service container, sem
      nenhum estado da sua máquina
- [ ] Release acontece por merge de PR de changeset — zero comandos manuais
- [ ] Pacote no npm com provenance; você explica o que o atestado prova e
      por que OIDC > token guardado
- [ ] Docs públicas atualizando sozinhas a cada merge
- [ ] O ciclo do exercício 5 rodou ponta a ponta uma vez, de verdade

## Aprofundamento

- Canary releases: publicar `next` a cada merge na main
  (`npm publish --tag next`) e o fluxo de snapshot releases do Changesets
- [size-limit](https://github.com/ai/size-limit) como check de PR: o
  orçamento de bundle do módulo 06 virando gate com comentário automático
- [CodeQL](https://codeql.github.com) e Dependabot alerts: o mínimo de
  segurança contínua para um repo público
- [Biome](https://biomejs.dev) como lint+format unificado e mais rápido —
  vale a troca do ESLint aqui?
- CD do produto em si: deploy automático do `server/` (Railway/Render/Fly)
  e do `client/` (Vercel) por merge — fora do escopo do SDK, mas é o mesmo
  músculo
