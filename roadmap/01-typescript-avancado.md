# Módulo 01 — TypeScript Avançado

Semanas 1–3 (~30 h). Fonte primária: o Handbook oficial em typescriptlang.org.

## Objetivo

Ler e escrever TypeScript no nível de quem **autora** biblioteca, não só de
quem consome: modelar domínios com tipos precisos, fazer type-level
programming (conditional, mapped e template literal types) e configurar um
`tsconfig` strict sabendo o que cada flag faz. Ao final, o esqueleto do
`sdk/` existe e os tipos de domínio da loja compilam em modo strict.

## Pré-requisitos

- JavaScript sólido (você já tem — o backend inteiro da loja é prova)
- Node 20+ instalado
- Nenhum TypeScript prévio é assumido: a semana 1 cobre a base pelo Handbook

## Leitura essencial

Leia na ordem. Use o [Playground](https://www.typescriptlang.org/play) para
testar cada conceito enquanto lê — não leia passivamente.

**Semana 1 — a base pelo Handbook:**

1. [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
2. [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
3. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
4. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
5. [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
6. Cheat sheets de [Control Flow Analysis e Types](https://www.typescriptlang.org/cheatsheets/) — imprima

**Semana 2 — Type Manipulation (o coração do módulo):**

7. [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
8. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
9. [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
10. [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)
11. [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
12. [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
13. [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
14. [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
15. [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) (Reference)

**Semana 3 — nível autor de biblioteca:**

16. [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) e
    [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
17. Modules Reference: [Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html),
    [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
    e o apêndice [ESM/CJS Interoperability](https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html)
18. Declaration Files: [Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html),
    [Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html),
    [Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html),
    [Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
19. Reference: [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html),
    [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html),
    [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
20. [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) — leia a
    família `strict` inteira e as opções de `module`/`moduleResolution`

## Conceitos para dominar

- [ ] Tipagem estrutural (vs nominal) e quando forçar nominalidade com brands
- [ ] Narrowing e control flow analysis; type predicates (`x is T`) e assertion functions
- [ ] Discriminated unions + exaustividade com `never` no `default` do switch
- [ ] Generics: constraints (`extends`), defaults, inferência — e quando NÃO usar generic
- [ ] Conditional types, `infer`, e distributividade sobre unions (e como desligá-la com `[T]`)
- [ ] Mapped types, key remapping com `as`, modificadores `+/-readonly` e `+/-?`
- [ ] Template literal types e os intrínsecos `Uppercase`/`Capitalize`/etc.
- [ ] `keyof`, `typeof`, indexed access `T[K]`
- [ ] `unknown` vs `any` vs `never` — quando cada um aparece
- [ ] Overloads vs union de parâmetros
- [ ] `satisfies`, `as const` e const type parameters
- [ ] Utility types por dentro (`Partial`, `Pick`, `Omit`, `ReturnType`, `Awaited`...)
- [ ] Arquivos `.d.ts`, declaration merging e module augmentation
- [ ] Variância (co/contravariância) em nível prático: por que callbacks invertem a direção
- [ ] `tsconfig`: família `strict`, `target`/`lib`, `module`/`moduleResolution` (`node16` vs `bundler`), `declaration`, `isolatedModules`, `verbatimModuleSyntax`

## Exercícios

Rascunhos em `roadmap/exercicios/01-typescript/`. Critério de aceite em cada um.

**1. type-challenges.** No repo
[type-challenges/type-challenges](https://github.com/type-challenges/type-challenges),
resolva **todos os easy** e estes medium: Get Return Type, Omit, Readonly 2,
Deep Readonly, Tuple to Union, Chainable Options, Last of Array, Pop, Type
Lookup, Trim Left, Trim, Capitalize, Replace, ReplaceAll, Append Argument,
Flatten.
Aceite: cada solução passa nos testes do playground do challenge, sem `any`.

**2. Utility types do zero.** Em `utility-types.ts`, reimplemente sem olhar:
`MyPartial`, `MyRequired`, `MyReadonly`, `MyPick`, `MyOmit`, `MyRecord`,
`MyExclude`, `MyExtract`, `MyReturnType`, `MyAwaited`. Valide contra os
nativos com o helper de igualdade do type-challenges:

```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type _t1 = Expect<Equal<MyOmit<Order, 'items'>, Omit<Order, 'items'>>>;
```

Aceite: compila em strict com casos cobrindo objetos aninhados e unions.

**3. Tipos de domínio da loja.** A partir de `server/prisma/schema.prisma`,
escreva à mão em `sdk/src/types/domain.ts`: `User`, `Category`, `Product`,
`Order`, `OrderItem`, `CartItem`. Regras:

- IDs com brand — impossível cruzar um `OrderId` onde se espera `ProductId`:

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };
export type ProductId = Brand<string, 'ProductId'>;
export type OrderId = Brand<string, 'OrderId'>;
```

- `OrderStatus` e `PaymentStatus` como union de literais (hoje o banco guarda
  string livre — o tipo vira a documentação das transições válidas)
- Datas como `string` ISO no wire format (é o que a API JSON retorna), não `Date`

Aceite: `tsc --noEmit` passa; um teste de tipo prova que `ProductId` não é
atribuível a `OrderId`.

**4. `Result<T, E>`.** Implemente um result type com `ok()`, `err()`, `map()`
e `unwrapOr()`, sem exceptions. Aceite: narrowing funciona —
`if (r.ok) r.value` compila, `r.value` fora do `if` não.

**5. Event emitter tipado.** Um `TypedEmitter<Events>` onde
`Events = { 'order:created': { orderId: OrderId }; 'order:paid': { orderId: OrderId; total: number } }`.
Aceite: `on('order:paid', h)` infere o payload; payload errado não compila;
`on('order:typo', ...)` não compila.

**6. Mapa de rotas tipado (prenúncio do SDK).** Um tipo `ApiRoutes` mapeando
literais como `'GET /api/products'` e `'POST /api/orders'` para
`{ query; body; response }`, e uma função `request<R extends keyof ApiRoutes>`
que infere tudo a partir da rota. Aceite: mudar o tipo de resposta de uma rota
quebra o call site em compile time.

## Entrega no capstone

Criar o pacote `sdk/` como pasta irmã de `client/` e `server/` (mesma
convenção do repo: pacotes independentes, sem workspace root).

`sdk/package.json`:

```json
{
  "name": "@storekit/sdk",
  "version": "0.0.0",
  "private": true,
  "description": "SDK TypeScript oficial da API da loja",
  "type": "module",
  "engines": { "node": ">=20" }
}
```

`sdk/tsconfig.json` (strict de verdade — saiba justificar cada flag):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

(`"lib": ["DOM"]` entra para tipar `fetch`/`Headers` no core isomórfico; a
alternativa `@types/node`-only é discutida no módulo 02.)

Estrutura inicial: `src/types/domain.ts` (exercício 3), `src/types/api.ts`
(exercício 6, versão inicial), `src/index.ts` reexportando os tipos.

Comandos (rode você — nenhum comando npm é executado pelo agente):

```
cd sdk
npm install -D typescript
npx tsc --noEmit
```

## Critérios de conclusão

- [ ] Set do type-challenges completo, sem `any`
- [ ] Explica em voz alta: distributividade de conditional types, por que
      `infer` só existe dentro de `extends`, e a diferença `unknown` vs `any`
- [ ] Escreve um `tsconfig` strict de memória e justifica cada flag
- [ ] `sdk/` compila com `npx tsc --noEmit` sem erros
- [ ] Utility types reimplementados provados idênticos aos nativos via `Equal`
- [ ] Tipos de domínio da loja espelham o `schema.prisma` com brands e unions de status

## Aprofundamento

- [Total TypeScript](https://www.totaltypescript.com) (Matt Pocock) — workshops
  gratuitos de type transformations e generics
- Release notes no [blog oficial do TypeScript](https://devblogs.microsoft.com/typescript/) —
  leia as notas das versões 4.9+ (`satisfies`), 5.0 (const type params) até a
  atual, e acompanhe o port nativo do compilador (tsgo / TypeScript 7)
- Handbook [Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) e
  [Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html)
