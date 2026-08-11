# Módulo 06 — npm e Packaging

Semanas 13–14 (~20 h). Fontes primárias: docs do npm e do Node.js
(Packages), publint.dev e arethetypeswrong.

## Objetivo

Transformar o `sdk/` em um pacote npm de verdade: build dual ESM/CJS com
`exports` map correto, tipos que resolvem em todos os module resolutions,
tarball enxuto e auditado, e disciplina de semver de quem mantém API pública.
Ao final, o pacote passa **publint** e **arethetypeswrong** limpos e instala
funcionando em CJS, ESM, TypeScript `node16` e bundler — as quatro
combinações que seus futuros usuários vão ter.

## Pré-requisitos

- Módulos 01–05 concluídos (em especial: interop ESM/CJS do módulo 02 e a
  suite de testes do 05 — refatorar packaging sem testes é andar no escuro)

## Leitura essencial

1. [Node.js — Packages](https://nodejs.org/api/packages.html) — releia
   inteira, agora como **autor**: `exports` conditions, ordem de resolução,
   dual package hazard
2. [npm — package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) —
   `files`, `publishConfig`, `sideEffects` não é campo do npm mas leia junto
   (doc do webpack)
3. [npm — publish](https://docs.npmjs.com/cli/v10/commands/npm-publish) e
   [pack](https://docs.npmjs.com/cli/v10/commands/npm-pack) — `--dry-run` é
   seu melhor amigo
4. [publint — rules](https://publint.dev/rules) — cada regra é uma aula de
   packaging
5. [arethetypeswrong — problems](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems.md) —
   o catálogo de tudo que pode dar errado com tipos publicados (masquerading,
   FalseESM…)
6. [tsup](https://tsup.egoist.dev) — o bundler que gera o dual build
7. [semver.org](https://semver.org/lang/pt-BR/) — a spec inteira; é curta
8. TypeScript Handbook, revisão:
   [Modules — Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)

## Conceitos para dominar

- [ ] Anatomia de package.json de biblioteca: `exports` é a verdade;
      `main`/`module`/`types` só existem para tooling antigo
- [ ] `exports` map: por que a condition `types` vem primeiro, `import` vs
      `require`, subpath exports, e o que fecha quando você não expõe `./*`
- [ ] Dual build de tipos: `.d.ts` para ESM e `.d.cts` para CJS — e qual
      erro do attw aparece quando você serve um só
- [ ] Dual package hazard na prática: o app do usuário carrega as DUAS
      cópias e `err instanceof APIError` retorna `false` — o pior bug de SDK
      para debugar (conecta com a hierarquia de erros do módulo 04)
- [ ] `files` whitelist vs `.npmignore` (armadilha) — o que um `npm pack`
      leva de verdade
- [ ] `sideEffects: false` e tree-shaking: o que quebra se você mentir
- [ ] Dependencies de SDK: o ideal é **zero** em runtime; quando algo vira
      `peerDependency`; por que `devDependencies` não afetam o usuário
- [ ] Semver de tipos: estreitar parâmetro é breaking, alargar retorno é
      breaking, campo opcional novo em resposta é minor — saber classificar
- [ ] `prepublishOnly` como trava: impossível publicar sem build + testes
- [ ] `engines`, `license`, `repository`, `keywords`: os metadados que fazem
      o pacote parecer (e ser) profissional na página do npm

## Exercícios

Rascunhos em `roadmap/exercicios/06-packaging/`.

**1. Build dual + exports map.** Configure o tsup no `sdk/`:

```ts
// sdk/tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
});
```

E o package.json ganha:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "sideEffects": false
}
```

Aceite: `npx publint` sem erros e
`npx --package @arethetypeswrong/cli attw --pack .` sem problemas em nenhum
resolution mode.

**2. Lab das 4 combinações.** Em `roadmap/exercicios/06-packaging/consumo/`,
crie 4 projetos mínimos consumindo o **tarball** (`npm pack` no sdk, instale
o `.tgz`): (a) Node CJS com `require`, (b) Node ESM com `import`, (c) TS com
`moduleResolution: node16` e `tsc --noEmit`, (d) Vite (o próprio `client/`
serve). Em cada um: chame `products.list()`, force um 404 e confira
`err instanceof NotFoundError`.
Aceite: os 4 compilam/rodam; autocomplete e go-to-definition funcionam nos
projetos TS.

**3. Dual package hazard ao vivo.** No lab, monte o cenário: um app CJS que
`require` o SDK e também importa um helper ESM que `import` o SDK — as duas
cópias carregam juntas. Capture o `instanceof` falhando entre elas. Depois
escolha e implemente a mitigação (as opções, em ordem de robustez: checar
por marcador próprio tipo `error.name`/`code` em vez de `instanceof` na doc
pública; `Symbol.hasInstance` customizado; ou assumir o hazard como
limitação documentada — o que o stripe-node faz). Registre a decisão no
`sdk/DESIGN.md`.
Aceite: repro por escrito + mitigação escolhida com teste cobrindo.

**4. Katas de semver.** Para 10 mudanças concretas no SDK, classifique
patch/minor/major com justificativa: campo opcional novo na resposta; campo
obrigatório novo em request; renomear `nextCursor`; nova subclasse de erro;
mudar default de `maxRetries` de 2 para 3; corrigir tipo mentiroso (o
runtime já retornava outra coisa); remover export não documentado; apertar
validação de input; suportar Node 18 de novo; dropar Node 18.
Aceite: gabarito escrito em `semver-katas.md`; você defende cada resposta.

**5. Auditoria do tarball.** `npm pack --dry-run` e responda: o que está
indo? Sourcemaps vão? (decida e justifique) Testes vão? `.env` NUNCA vai?
Qual o tamanho do pacote e do `dist/` — e qual seu orçamento (defina um, ex.
< 25 kB)?
Aceite: tarball contém exatamente `dist/` + README + LICENSE +
package.json, dentro do orçamento.

Comandos (rode você — nenhum comando npm é executado pelo agente):

```
cd sdk
npm i -D tsup publint
npm run build && npx publint
npx --package @arethetypeswrong/cli attw --pack .
npm pack --dry-run
```

## Entrega no capstone

O pacote publicável: build dual reproduzível (`npm run build`), publint +
attw limpos, `prepublishOnly` rodando build + testes, README do `sdk/` com
install + quickstart de 5 linhas (o do capstone), LICENSE escolhida. A
publicação real no npm acontece **pelo CI** no módulo 08 — aqui o pacote
fica pronto a ponto de `npm publish --dry-run` não ter nenhuma surpresa.

## Critérios de conclusão

- [ ] Explica cada linha do `exports` map e o que quebra se `types` não
      vier primeiro
- [ ] publint e attw verdes **no tarball** (não só no diretório)
- [ ] As 4 combinações de consumo funcionam, com tipos resolvendo
- [ ] Reproduz o dual package hazard de memória e defende a mitigação
      escolhida
- [ ] Classifica mudanças de tipo sob semver sem consultar o gabarito
- [ ] `npm publish --dry-run` mostra exatamente o conteúdo planejado

## Aprofundamento

- ESM-only em 2026: Node ≥ 22.12 faz `require(esm)` nativo — leia o caso a
  favor de dropar CJS ([e18e](https://e18e.dev) e o manifesto do
  sindresorhus) e decida quando o `@storekit/sdk` v2 pode ir ESM-only
- [tsdown](https://tsdown.dev) — o sucessor do tsup baseado em Rolldown;
  troque o build e compare tempo e output
- [size-limit](https://github.com/ai/size-limit) — orçamento de bundle
  como teste (vira gate de CI no módulo 08)
- [JSR](https://jsr.io) — o registry moderno da Deno: publique o SDK lá
  também e veja o que ele valida que o npm não valida
