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
