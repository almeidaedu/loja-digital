# Gotchas

Padrões de erro já cometidos neste projeto, convertidos em regra. Ler no início
da sessão.

## G-01 — Não confiar num diagnóstico que não reproduz o sintoma relatado

**O que aconteceu:** diagnostiquei "Adicionar ao Carrinho" como bug do catálogo
(`onAddToCart` não passado em `ProductListing`) e como falta de login. O usuário
corrigiu: falha **logado também**, e o **botão do carrinho no header** também não
abre o drawer. O segundo sintoma é puro estado de cliente — nenhuma das minhas
causas o explicava.

**Regra:** antes de fechar um diagnóstico, conferir se a causa proposta explica
**todos** os sintomas relatados. Se sobra sintoma, o diagnóstico está incompleto —
dizer isso em vez de entregar a parte que fecha. Análise estática de agente
ranqueia hipóteses; ela não observa o sistema rodando.

## G-02 — Pedir o dado bruto antes da terceira hipótese

**O que aconteceu:** gastei três passadas de leitura de arquivo procurando um
bloqueador global de clique (RouteTransition, ExitPopup, nav-pill, z-index) sem
achar nada.

**Regra:** duas passadas estáticas sem resultado = parar e pedir console +
aba Network. Neste projeto não posso rodar `npm` (regra do usuário), então o
navegador é dele — o dado bruto tem que ser pedido, não deduzido.

## G-03 — `catch` que engole erro produz sucesso falso

**O que aconteceu:** `cartStore.fetchCart` tinha `catch {}` vazio. Como `addItem`
dependia dele para ver o resultado, um `GET /cart` falho resolvia normalmente e a
UI mostrava toast de sucesso com carrinho vazio.

**Regra:** `catch` vazio só é aceitável quando a falha é esperada e irrelevante —
e aí leva comentário dizendo por quê. Se outro fluxo lê o resultado daquela
chamada, o erro tem que chegar até ele.

## G-04 — Prop opcional com bail silencioso esconde fiação faltando

**O que aconteceu:** `ProductCard.jsx:52` faz `if (!onAddToCart) return;`. Com
`ProductListing` esquecendo de passar o prop, o botão ficou morto desde o commit
inicial — sem erro, sem log, sem mudança visual.

**Regra:** handler que é a razão de existir do componente não é opcional. Ou
falha alto, ou o componente busca a dependência sozinho.

## G-05 — Medição do motion é `layoutScroll`, não `layoutRoot`

**O que aconteceu:** troquei a pill do header de medição manual para `layoutId`
(Fase 6). Saindo de uma seção rolada para `/produtos`, a pill entrava deslizando
de baixo. Errei **duas** correções antes de acertar: `layoutRoot` sozinho, depois
`layout layoutRoot`. Nenhuma mudou o sintoma em nada.

**Causa real** (`motion-dom/dist/es/projection/node/`):

- `HTMLProjectionNode.mjs:24` — `checkIsScrollRoot: (instance) =>
  getComputedStyle(instance).position === "fixed"`. O motion **entende**
  `position: fixed`.
- `create-projection-node.mjs:656` — `measurePageBox()` mede em coordenadas de
  viewport e, se `!wasInScrollRoot`, **soma o `scrollY` da página** para converter
  em coordenadas de documento.
- `create-projection-node.mjs:597` — `updateScroll()` só roda com
  `Boolean(this.options.layoutScroll && this.instance)`. Sem `layoutScroll`, o
  ancestral `fixed` **nunca é testado** como scroll root.

Resultado: a pill era medida com o `scrollY` somado. Ao trocar de rota a altura do
documento muda, o browser clampa o `scrollY` entre o snapshot e a nova medição, e
esse delta vira o deslocamento vertical. Do topo o delta é zero — por isso o teste
inicial passou.

**Onde meu modelo estava errado:** tratei `layoutRoot` como "define o espaço de
coordenadas da medição". Não define. `layoutRoot` governa **projeção relativa
entre nós que animam**; o espaço de coordenadas é decidido em `measurePageBox`,
por scroll root. São dois subsistemas, e eu confundi os dois duas vezes seguidas.

**Regra:** container `position: fixed` (ou `sticky`) com layout animation dentro
leva **`layoutScroll`**. Não precisa de `layout` junto — `willUpdate` (`:423-434`)
chama `updateScroll("snapshot")` em todo o `path`, com ou sem `layout`. E teste de
animação ligada a rota tem que sair de scroll ≠ 0.

**Regra de processo:** correção de API que não muda o sintoma **em nada** não é
"quase lá", é modelo errado. Segunda tentativa já vai na fonte em `node_modules`,
não na segunda variação da mesma ideia.

## G-06 — Trava por tempo não distingue scroll programático de scroll do usuário

**O que aconteceu, parte 1:** estando em `/produtos` e clicando "FAQ", a pill
viajava por Início → Categorias → Avaliações → FAQ.
`scrollIntoView({ behavior: 'smooth' })` emite dezenas de eventos no caminho, o
spy reescreve o hash em cada um, e a pill segue a URL. A animação estava certa; o
estado é que estava sendo pilotado pelo spy.

**Parte 2 — a correção virou bug pior:** travei o spy e **renovei a trava a cada
evento de scroll** (debounce de 150ms). Só que evento de roda do mouse é idêntico
a evento de scroll suave. Rolando com o mouse, os eventos chegam a ~16ms e renovam
a trava indefinidamente: o spy congelava exatamente enquanto o usuário rolava. Eu
troquei um bug visível por um pior, e só apareceu porque o usuário testou de novo.

**Correção:** a trava guarda o **alvo** do clique e dura até chegar nele
(`getActiveSection() === target`), com `wheel`/`touchstart` cancelando na hora e
timeout de 1200ms como rede. Condição de saída baseada em estado, não em silêncio
de eventos.

**Regra:** spy de scroll e scroll programático são dois donos do mesmo estado. A
trava entre eles precisa de condição de saída **observável** (cheguei no alvo) ou
de sinal que só o usuário produz (`wheel`, `touchstart`). Nunca "parou de chegar
evento" — o usuário produz os mesmos eventos. E ao suprimir eventos de um
listener, perguntar sempre: *quem mais depende deste listener?*

## G-07 — Logout dentro de rota protegida: corrida que não se ganha por ordem

**O que aconteceu:** no painel admin o "Sair" fazia logout e, ao logar de novo, o
usuário voltava direto para o painel — sem saída.

**Tentativa errada:** `navigate('/', { replace: true })` **antes** de
`clearUser()`, achando que era só ordem de chamada. Não mudou nada, e o usuário
reportou o mesmo sintoma. Ordem de *chamada* não é ordem de *render*.

**Causa real, das duas fontes:**

- zustand v5 assina por `React.useSyncExternalStore`
  (`node_modules/zustand/esm/react.mjs`). Update de store externa é **síncrono
  por contrato** — o React não pode adiá-lo, senão haveria tearing.
- `navigate()` com `v7_startTransition` (ligado no `App.jsx`) vira
  `startTransitionImpl(() => setStateImpl(newState))`
  (`react-router-dom/dist/index.js:640`) — lane **adiável**.

Então existe **sempre** um render com `isAuthenticated: false` ainda na rota
antiga, não importa a ordem das chamadas: o guard vê o usuário deslogado em
`/admin`, manda para `/login?redirect=%2Fadmin`, e essa navegação atropela a
transição pendente. O login seguinte honra o `redirect` e desfaz o logout.

**Correção:** um dono só — `authStore.logout()` — que faz `window.location.assign('/')`.
Navegação dura não tem render intermediário para o guard observar, e de quebra
nada do usuário anterior sobrevive em memória.

**Regra:** quando dois estados que decidem a mesma navegação vivem em sistemas
com **prioridades de atualização diferentes** (store externa vs. transição do
React), não existe ordenação que sincronize os dois. Ou se elimina o render
intermediário (navegação dura), ou se ensina o guard a reconhecer a situação.
Reordenar chamadas é tratar sintoma. E: duas cópias do mesmo fluxo (`Header` e
`AdminLayout` implementavam logout cada um do seu jeito) são duas cópias do
mesmo bug.

## G-08 — Seletor estrutural em CSS quebra em silêncio quando o JSX muda

**O que aconteceu (B3):** `.admin-nav-item span:last-child { display: none }`
existia para esconder o label na sidebar colapsada. Mas o JSX renderizava o label
como texto solto e o ícone dentro de um `<span>` — então `span:last-child` era o
**ícone**. No mobile a sidebar de 60px mostrava a palavra espremida e nenhum
ícone, que é o inverso exato da intenção. Junto vivia
`.admin-logout-btn span:last-child`, regra morta: aquele botão não tinha span
nenhum.

**Regra:** CSS que depende da **posição** de um elemento (`:last-child`,
`:nth-child`, `+`, `>`) é um acoplamento invisível com a árvore do JSX — não
falha, acerta o alvo errado e o diagnostics não vê nada. Dar classe ao que se
quer estilizar. E ao tocar um CSS, conferir se cada seletor ainda casa com algo:
regra morta não dá erro, só ocupa espaço e mente sobre a intenção.
