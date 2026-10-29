# Refactor da Loja — Plano Consolidado

Sucessor do `.md` da raiz (plano de redesign nunca executado), re-baselinado contra o
código real depois que o commit `dd03c28` aplicou uma variante da Fase 1 com nomes de
token próprios. Referência de design: `.claude/skills/apple-design/SKILL.md` (as `§`
apontam para lá).

## Decisões vinculantes

| Decisão | Escolha |
|---|---|
| Ordem | Frontend primeiro; backend (roadmap 03) vira Estágio G |
| Tokens | Manter nomes atuais (`--brand-accent`, `--surface-*`, `--ink-*`) |
| TypeScript | Não migrar agora; TS só no futuro `sdk/` |
| Motion | `motion@13.4.4` instalado; API vem de `motion/react` |

## Convenções

- Classe sem prefixo só é **definida** em `globals.css`. Classe de componente/página começa
  com o prefixo do bloco (`.header-`, `.cart-`, `.admin-`, …).
- Spring para gesto/entrada/saída; CSS transition só para hover/press. Só `transform`/`opacity`.
  Todo componente animado chama `useReducedMotion()`.
- Fonte única: `config/storeConfig.js` (frete, contato, promo, flags) e
  `constants/orderStatus.js` (label + tom).
- Máx. 5 arquivos por fase; diagnostics limpos + verificação no navegador; aprovação
  explícita antes da próxima. Arquivo >300 LOC ganha commit de limpeza antes.

## Bugs confirmados (baseline)

| # | Onde | Defeito | Fase |
|---|---|---|---|
| B1 | `ProductListing.jsx:35` | ~~Lê `data.totalPages`; API devolve `{products,total,page,limit}`. Paginação nunca renderiza~~ ✅ `Math.ceil(total / limit)` | 10b |
| B2 | `PaymentPending.jsx:45` | `navigate(path,{search})` não existe no RR6; success perde o `orderId` | 12 |
| B3 | `AdminLayout.jsx` + `.css` | ~~CSS esconde `span:last-child` → esconde o ícone, não o label~~ ✅ label ganhou classe própria | H2 |
| B4 | `CartDrawer.jsx:29` | Overlay sem exit; painel com transition 350ms → backdrop some na hora | 5 |
| B5 | ~~`Header.jsx:68`~~ | ~~Pill medida por rect com dep `[activeKey]` → desalinha no resize~~ ✅ `layoutId` | 6 |
| B6 | `ProductCard.jsx:64` | ~~`<article>` sem `<Link>` → produto não é clicável~~ ✅ link do nome esticado sobre o card | 10a |
| B7 | `ProductCard.css:212` | ~~`margin-top:12px` anula o `margin-top:auto` → CTAs desalinhados~~ ✅ | 10a |
| B8 | `ProtectedRoute.jsx` | ~~`isLoading` → `return null` → tela branca no refresh~~ ✅ gate com spinner; `AdminRoute` herda | 7a |
| B9 | `Categories.jsx` | ~~IntersectionObserver monta antes dos dados → cards invisíveis~~ ✅ `ui/Reveal` na grade | 8a |

## Colisões de classe global (achado da Fase 2)

Classe sem prefixo redefinida fora do `globals.css`. Como cada CSS de componente é
importado depois do `globals.css`, **o último arquivo de rota carregado vence** — a
aparência do badge hoje depende da ordem de navegação. Todas usam hex cravado
(`#ffc800` ≠ `--brand-warning`) e `text-transform: uppercase`, que o `.badge` do
globals não tem. Deletar o bloco duplicado quando a fase dona tocar o arquivo.

| Classe | Arquivo | Fase que limpa |
|---|---|---|
| `.badge`, `.badge--{green,yellow,red}` | `Orders.css:74` | 14 |
| `.badge`, `.badge--{green,yellow,red}` | `AdminOrders.css:100` | 15 |
| `.badge`, `.badge--yellow` | `AdminProducts.css:148` | 15 |
| `.badge`, `.badge--{green,yellow,red}` | `AdminDashboard.css:114` | 14 |
| `.form-label` | `Login.css:68`, `Register.css:50` | 13 |
| `.qty-btn` (achado no H5) | `CartItem.css`, `ProductDetail.css` | 11 |
| ~~`.section-title`, `.section-subtitle`~~ | ~~`Categories.css:11,19`~~ | ✅ 8a |
| ~~`.skeleton`~~ | ~~`Categories.css:85`~~ ✅ 8a, ~~`ProductGrid.css:36`~~ ✅ 10b | — |
| ~~`.category-count`~~ (achado na 10b) | ~~`ProductListing.css`~~ (virou `.listing-filter-count`) | ✅ 10b |

## Emoji e glifos como ícone (varredura da Fase 4)

Regra do projeto: ícone é MUI via `ui/Icons.jsx`, nunca emoji nem glifo solto. Cada
fase remove os do arquivo que ela toca — a Fase 16 confere que a lista zerou.

| Arquivo | Glifo | Fase |
|---|---|---|
| ~~`CartItem.jsx:45`, `:69`~~ | ~~`⚽`, `−`~~ | ✅ 5b |
| ~~`CartDrawer.jsx:63`, `:92`~~ | ~~`🛒`, `🎉`~~ | ✅ 5a |
| ~~`FreteBar.jsx:20`~~ | ~~`🎉`~~ | ✅ 5b |
| ~~`ExitPopup.jsx:43`~~ | ~~`✕`~~ | ✅ 7b |
| `Checkout.jsx:214` | `←` | 11 |
| `ProductDetail.jsx:88`, `:103`, `:175` | `←`, `−` | 11 |
| `PaymentSuccess.jsx:37`, `PaymentFailure.jsx:15`,`:42`, `PaymentPending.jsx:101`,`:123` | `✓`, `✕`, `💬`, `📋`, `⏰` | 12 |
| `Orders.jsx:97` | `▲` / `▼` | 14 |
| `AdminProducts.jsx:392` | `✕` | 15 |

## SVG inline (achado da Fase 5b)

Mesma regra: ícone é MUI. Estes são `<svg>` cravados no JSX.

| Arquivo | O quê | Fase |
|---|---|---|
| ~~`Header.jsx:218`~~ | ~~carrinho~~ | ✅ 6 |
| ~~`Layout.jsx:26`~~ | ~~WhatsApp~~ | ✅ 6 |
| `Footer.jsx:55` | WhatsApp (mesmo path que estava no Layout) | 16 |
| ~~`Hero.jsx:62`~~ | ~~ornamento do hero~~ | ✅ 9a |

## Valores cravados fora do storeConfig

| Valor | Onde | Fase |
|---|---|---|
| ~~`149`~~ | ~~`Hero.jsx:30` ("Frete grátis +R$149" em texto)~~ | ✅ 9a |
| `149`, `15` | `Checkout.jsx:10-11` (`SHIPPING_THRESHOLD`, `SHIPPING_COST` locais; o `useFreteProgress` já lê do storeConfig) | 11 |
| ~~`5511999999999`~~ | ~~`Layout.jsx:20`~~ | ✅ 6 |
| `5511999999999` | `Footer.jsx:50` | 16 |
| `5511999999999` | `PaymentFailure.jsx:4` (`WHATSAPP_NUMBER` local) | 12 |

`storeConfig.contact.whatsapp` e `storeConfig.shipping.freeThreshold` já existem — é só consumir.

## Dívidas conscientes da Fase 6

- `.highlight` em `FreteBar.jsx` é classe sem prefixo em JSX. Só existe como
  `.frete-bar-inner .highlight`, então não colide de fato; renomear custaria um 6º
  arquivo na fase. Vai na **Fase 16**.
- `.frete-progress-fill` anima `width`, não `transform`. Barra de 4px dentro de um
  track com `overflow: hidden` — o scaleX exigiria contra-escala para não deformar as
  pontas arredondadas. Exceção documentada no próprio CSS.

## Hotfix da Fase 6 — os dois bugs da pill

Reportados pelo usuário depois da entrega da fase. Sintomas parecidos, causas sem
relação nenhuma. Levou três rodadas — as duas primeiras erraram, registro abaixo.

| Sintoma | Causa | Correção |
|---|---|---|
| Pill entra "de baixo" ao ir de seção rolada → `/produtos` | `measurePageBox` soma o `scrollY` da página na medição, a não ser que um ancestral seja scroll root — e o motion só testa isso (`position: fixed`) em nó com `layoutScroll`. Trocar de rota muda a altura do documento, o browser clampa o `scrollY` entre snapshot e medição, e o delta vira deslocamento vertical | `Layout.jsx`: `<motion.div layoutScroll>` no `.chrome` |
| De `/produtos`, clicar FAQ faz a pill percorrer Início → Categorias → Avaliações → FAQ | `scrollIntoView` suave emite dezenas de eventos; o scroll-spy reescreve o hash em cada um e a pill segue a URL | `Header.jsx`: trava com alvo — `lockSpy(target)`, libera ao chegar (`getActiveSection() === target`), `wheel`/`touchstart` cancelam, timeout de 1200ms de rede |

**Tentativas erradas (registradas por serem instrutivas):** `layoutRoot` sozinho e
depois `layout layoutRoot` no `.chrome` — nenhuma mudou o sintoma, porque
`layoutRoot` é projeção relativa entre nós que animam, não espaço de coordenadas
de medição. E a primeira versão da trava do spy renovava por evento (debounce de
150ms), o que congelava o spy enquanto o usuário rolava com o mouse: evento de
roda é indistinguível de evento de scroll suave. Detalhe completo em G-05 e G-06
do `gotchas.md`.

## Achado da Fase 6: sem restauração de scroll → ✅ Fase 7a

Nenhuma rota resetava o scroll. Saindo da home rolada para `/produtos`, a página
abria no meio. Foi o que expôs o bug da pill (`layoutScroll`, corrigido), mas era
bug próprio. Resolvido em `hooks/useScrollRestoration.js`: gatilho no `pathname`
(nunca na location inteira — o scroll-spy da home reescreve o hash a cada frame e
jogaria a página ao topo sem parar), pula quando há hash (quem posiciona é o
`scrollIntoView` do Header) e pula em `POP` (o browser restaura sozinho; forçar o
topo faria "voltar" do produto perder o lugar no catálogo).

## Dívidas conscientes da Fase 7a

| O quê | Onde | Fase |
|---|---|---|
| 404 em branco: `path="*"` renderiza o chrome com `<main>` vazio. `TODO` no código | `AppRouter.jsx:58` | 12 |
| Tela "ACESSO RESTRITO" com 25 linhas de `style` inline + `--text-muted` (alias legado) + `btn-primary` | `AdminRoute.jsx:16-38` | 12 |
| ~~`setLoading` no `authStore` ficou sem nenhum consumidor — 1 linha morta~~ | ~~`authStore.js:10`~~ | ✅ H2 |
| Spinner centrado com `style` inline repetido em 7 lugares (convenção atual do projeto; virou 8 com o gate do ProtectedRoute) | `Orders.jsx:60`, `AdminOrders.jsx:110`, `AdminDashboard.jsx:80`, `AdminProducts.jsx:313`, `ProtectedRoute.jsx:15`, … | 16 |
| ~~`handlePageChange` não rola ao topo — `page` é state local~~ | ~~`ProductListing.jsx:55`~~ | ✅ 10b |

Os dois primeiros são a mesma forma (página centrada: título, texto, CTA) e o
`ui/ResultPage` da Fase 12 é o dono natural dos dois. Construí-lo na 7a só para
servir um 404 que nenhum link do app alcança seria antecipar escopo.

## Achado da Fase 7a: admin era um portão paralelo

`AdminRoute` duplicava os checks de `isLoading` e `isAuthenticated` do
`ProtectedRoute` — incluindo o mesmo bug B8 — e cravava `redirect=/admin` à mão.
Agora `<Route element={<ProtectedRoute />}>` é o pai de `<AdminRoute />`, que
ficou só com o check de papel. Um dono para autenticação.

## Achados e dívidas da Fase 7b

O `ui/Modal` foi construído na Fase 3 e **não tinha nenhum consumidor** até aqui.
O `ExitPopup` era um diálogo escrito à mão: sem portal, sem trava de scroll, sem
foco preso, sem Escape e sem animação de saída — tudo isso já existia pronto na
primitiva. O popup passou a montar `<Modal>` e perdeu ~50 linhas de CSS.

O layout mudou de propósito: o título e o botão de fechar agora vivem no
`.modal-header` da primitiva (alinhados à esquerda), e a pílula "Oferta
Exclusiva" desceu para o corpo, acima do formulário. Era isso ou brigar com a
primitiva no CSS para reproduzir o bloco centrado antigo. A única discordância
que sobrou é o tamanho do título (`--text-display-size`), documentada no CSS.

| O quê | Onde | Fase |
|---|---|---|
| ~~`storeConfig.leadCapture.enabled` não é lido por ninguém: o popup monta e arma os listeners de saída mesmo com a campanha desligada~~ | ~~`App.jsx:33`~~ | ✅ H3 |
| ~~`useExitIntent` registra `touchstart`/`scroll`/`click` com `{ once: true }` e **não os remove** no cleanup~~ | ~~`useExitIntent.js:28`~~ | ✅ H3 |
| ~~Chave de sessionStorage `cc_popup_shown` tem a marca do cliente cravada num template revendável~~ | ~~`useExitIntent.js:7`~~ | ✅ H3 |
| `.modal-overlay` / `.modal-box` no `globals.css` ficaram com **um único** consumidor. Quando a Fase 15 migrar o modal de produtos, as três regras viram lixo | `globals.css:548-580`, `AdminProducts.jsx:390` | 17 |

`storeConfig.leadCapture.discount` passou a alimentar o título, o botão e o texto
do toast — antes `10% OFF` estava cravado três vezes no JSX.

## Hotfix H3 — pendências do exit intent (fora da numeração de fases)

Os três primeiros itens da tabela acima, fechados antes da Fase 8.

- **Gate da campanha no `App.jsx`**, não no hook. Com `leadCapture.enabled: false`
  o `ExitPopup` nem monta, então nenhum listener é armado. A alternativa, um
  `if (!onExit) return` no hook, é o bail silencioso que o G-04 proíbe.
- **Vazamento:** o cleanup agora remove os três listeners de interação. `once` só
  tira o listener que chegou a disparar.
- **Chave neutra:** `cc_popup_shown` → `exit-popup-shown`.
- `useExitIntent.test.js` *(novo)*, 6 testes. O de cleanup foi rodado contra a
  versão antiga do hook e **falha** nela, ou seja, pega o bug de verdade.

## Fase 8a — reveals e de-dup da Home

**A Fase 8 virou 8a + 8b.** A lista original (5 arquivos) não fechava: `Benefits.jsx`
também usava `animate-on-scroll`, então aposentar o `useScrollAnimation` sem migrá-lo
deixaria os cards presos em `opacity: 0`; e tirar os números inventados do
`Testimonials.jsx` deixa CSS morto no `Testimonials.css`. Sete arquivos.

- **B9:** `Categories` e `Benefits` revelam a **grade** com `ui/Reveal`. Na grade e não
  em cada card: o motion deixa `transform` inline no elemento que anima, e isso
  anularia o `:hover { transform }` dos cards. A grade do skeleton é a mesma dos
  dados, então a troca não anima de novo.
- **De-dup:** a Home embrulhava `Benefits` e `FAQ` numa segunda `<section>` com um
  segundo `h2` ("POR QUE CAMPO CHEIO?" sobre "Por Que Comprar Aqui?", "DÚVIDAS
  FREQUENTES" sobre "Perguntas Frequentes") e padding vertical em dobro. Agora cada
  bloco é dono da própria seção e a Home só compõe. O título com a marca cravada saiu
  junto.
- **Colisão global desfeita:** o `Categories.css` redefinia `.section-title`,
  `.section-subtitle` e `.skeleton`, e por ser importado depois do `globals.css` ditava
  o estilo de **toda** seção da Home. Com isso fora, os títulos passam a seguir o
  `globals.css` (tipografia de sistema, `--text-display-size`). **Mudança visível de
  propósito.**
- `Categories` busca os próprios dados (como o `ProductGrid`), e a Home perdeu o
  estado. O `.catch(() => {})` da Home deixava o skeleton girando para sempre; agora
  falha ou lista vazia escondem a seção. Categoria sem produto ativo não vira card.
- Card de categoria virou `<Link>` (antes `<button>` + `navigate`, sem href e com slug
  sem `encodeURIComponent`). Contagem flexiona ("1 produto").
- `src/test/setup.js` ganhou stub de `IntersectionObserver`: o jsdom não tem e o
  `whileInView` quebra no mount. Stub mudo, então teste nenhum afirma reveal.

| Achado | Onde | Fase |
|---|---|---|
| A API devolve `flagEmoji` (spread do Prisma em camelCase) e o card lia `flag_emoji`: a bandeira **nunca** apareceu. Como emoji é proibido no projeto, a leitura saiu e o ícone ficou fixo. A coluna `flag_emoji` no banco e no CRUD de categorias continua lá sem uso no front | `categoryController.js:10`, `schema.prisma:28` | 15 / G |
| `useScrollAnimation.js` e `.animate-on-scroll` (`globals.css:506-515`) ficaram **sem consumidor** | | 8b / 17 |
| Bundle único > 500 kB minificado: nenhuma rota usa `lazy()`. Admin e checkout vão para todo visitante da Home | `AppRouter.jsx` | 16 |

## Fase 8b — prova social honesta

**Troca na lista:** o `globals.css` saiu e o `storeConfig.js` entrou. O
`storeConfig.social` tinha dois campos que ninguém lia, e o `stats: null` prometia
"não exibir números que não temos" sem dizer o formato do dado real. Agora o
comentário documenta `{ rating, reviews }`. A deleção do `.animate-on-scroll` foi
para a Fase 17, junto do `useScrollAnimation.js`, que é o par dela.

- **Números inventados fora:** "98%", "+5.000 avaliações verificadas" (no
  `Testimonials`) e "Mais de 5.000 pedidos entregues" (no subtítulo da Home).
  Número só aparece se o lojista preencher `social.stats`, formatado em pt-BR.
- **Selos de "Verificado" e "Compra verificada" fora:** os depoimentos são de exemplo
  e ninguém verificou compra nenhuma. O texto dos depoimentos não mudou.
- `seedTestimonials: false` faz a seção sumir, porque ainda não existe fonte de
  depoimento real.
- `Testimonials` é dono da própria seção (`#prova-social`, título, fundo). A Home
  agora só compõe, e o `Home.css` foi deletado.
- Card virou `<figure>` + `<blockquote>` + `<figcaption>`. Estrelas com
  `role="img"` e nome ("5 de 5 estrelas"): antes era `aria-label` num `<div>` sem
  papel, que leitor de tela ignora. Iniciais derivadas do nome, tons do avatar dos
  tokens `--brand-*-dim`. `#FFD700` cravado virou `--brand-warning`.
- `Testimonials.test.jsx` *(novo)*, 5 testes. Rodados contra a versão antiga do
  componente, **os 5 falham**.

| Achado | Onde | Fase |
|---|---|---|
| ~~Hero mostra "4.9 / 5.0 avaliação" cravado. Mesmo caso do 8b: deve ler `social.stats` ou sumir~~ | ~~`Hero.jsx:50`~~ | ✅ 9a |
| Estrelas desenhadas à mão em três lugares, dois deles com `#FFD700` e `rgba` cravados. Candidato a `ui/Rating` quando o `ProductCard` for tocado. O mesmo `Intl.NumberFormat` de nota está repetido no `Hero` e no `Testimonials`: vai junto | `ProductCard.jsx:27`, `ProductDetail.jsx:116`, `Testimonials.jsx`, `Hero.jsx` | 10 |
| ~~Com `seedTestimonials: false` a seção some, mas o link "Avaliações" do Header continua apontando para `#prova-social`~~ | ~~`Header.jsx:29`~~ | ✅ H4 |
| `Product` tem `reviewCount` no schema. Uma média real por loja poderia vir da API em vez de ser declarada à mão no `storeConfig` | `schema.prisma:48` | G |

## Hotfix H4 — cursor e link de seção desligada (fora da numeração de fases)

Dois relatos do teste no navegador da 8b.

- **Cursor:** o `cursor: auto` do navegador mostrava o I de texto sobre qualquer
  parágrafo. Agora há uma regra global no reset do `globals.css`: seta por padrão,
  mão em `a[href]`, `button`, `select`, `summary`, `[role=button]` e inputs de
  clique, e o I só em `input`, `textarea` e `contenteditable`. O
  `.trust-item { cursor: default }` do TrustBar era um remendo local para o mesmo
  problema e saiu.
- **"Avaliações" com `seedTestimonials: false`:** o link continua no menu (o menu não
  muda de forma de cliente para cliente), mas como `<button disabled>`, com
  `opacity: 0.55` (a mesma do `.btn`) e seta. Não navega e não ganha a pill, nem
  com `#prova-social` na URL. `Header.test.jsx` *(novo)*, 3 testes, todos falham
  com o Header antigo.
- **Testes presos ao config:** os do `Testimonials` quebraram porque o
  `storeConfig` em disco estava com os valores do teste manual. Agora cada teste
  fixa o próprio ponto de partida. G-12.

## Hotfix H5 — cursor de desabilitado unificado (fora da numeração de fases)

Decisão do usuário: "não clicável = seta" vale também para desabilitado.

- Uma regra no `globals.css`: `:disabled` e `[aria-disabled='true']` levam seta. As
  9 cópias locais (`not-allowed` em `.btn`, `.btn-primary`, `.form-input`,
  `CartItem` ×2, `ProductDetail`, `ProductListing`, `AdminProducts`; `default` em
  `ProductCard` e no `Header`) saíram.
- **`!important` de propósito.** Sem ele a regra perdia para `.btn`, `.chip`,
  `.produto-btn`, `select.form-input`…: mesmo peso ou mais, e carregados depois.
  "Desabilitado" é estado e precisa vencer o estilo base de qualquer componente.
- Botão em loading fica de fora (`:not([aria-busy='true'])`): mantém o `progress`.
- **Exceção ao limite de 5 arquivos:** 8 arquivos, mas 7 deles com só uma linha
  apagada, conferidos por `grep` (não sobrou nenhum `not-allowed` no projeto).

## Hotfix H6 — checagem visual no navegador (fora da numeração de fases)

Primeira checagem feita por mim no navegador (Playwright na aba do usuário), antes
da dele. Quatro defeitos das fases 8 e 9a, corrigidos:

- **Cabide no Hero:** o `ShirtIcon` do projeto é o `Checkroom` do MUI, um cabide. O
  MUI não tem camisa; o Hero passou a usar `SoccerBallIcon` (`SportsSoccer`, +1
  linha no `Icons.jsx`).
- **Título escondido sob o header** ao navegar por âncora: regressão da 8a, que o
  padding dobrado da Home mascarava. `section[id] { scroll-margin-top }` no
  `globals.css`.
- **`<main>` dentro de `<main>`:** o Layout e a Home declaravam um cada. A Home
  agora devolve fragmento.
- **"Avaliações" no Footer** apontava para `/#avaliacoes`, âncora que nunca existiu,
  e ignorava o `seedTestimonials` (a mesma falha do G-11, que esqueci no Footer).
  Agora `/#prova-social`, desligado junto com a seção.

| Achado da checagem | Onde | Fase |
|---|---|---|
| ~~Link de âncora do Footer vindo de outra página (`/login` → FAQ) para no lugar errado~~ | ~~`Footer.jsx`, `useScrollRestoration.js`, `Header.jsx:177`~~ | ✅ H7 |
| ~~O cabide também é o placeholder de imagem do `ProductCard`~~ | ~~`ProductCard.jsx`~~ | ✅ 10a |
| ~~TrustBar ainda diz "Entrega em 24h", agora em conflito com o Hero~~ | ~~`TrustBar.jsx`~~ | ✅ H7 |
| ~~`Benefits.css` e `UrgencyBanner.css` cravam fontes que não são carregadas~~ | ~~`Benefits.css`, `UrgencyBanner.css`~~ | ✅ 9b, 9c |
| Footer: 7 links para rotas que não existem (`/politica-trocas`, `/sobre`, …) caem no 404 em branco; "Categorias" aponta para `/produtos`; marca e WhatsApp cravados; `<svg>` do WhatsApp | `Footer.jsx` | 12 / 16 |
| Scroll-spy: entre Categorias e FAQ (produtos, promo, benefícios) a pill fica presa em "Categorias" | `Header.jsx` | 16 |


## Hotfix H7 — âncoras que chegam de outra página (fora da numeração de fases)

- **Âncora por PUSH é do `useScrollRestoration`.** Footer, Header vindo de outra
  página e qualquer `<Link>` para `/#secao`. Em rota nova, `followAnchor` alinha a
  seção e realinha a cada mudança de altura do `body` (ResizeObserver) por até 2s,
  porque Categorias e Produtos carregam depois e empurravam a seção para baixo. Roda,
  toque, clique ou tecla devolvem o scroll ao usuário na hora. Na mesma rota, rola
  suave. REPLACE (o scroll-spy reescrevendo a URL) é ignorado e não interrompe a
  perseguição.
- O `setTimeout(scrollIntoView, 100)` do Header saiu: era o remendo que falhava.
- **`scrollTo(0, 0)` não era instantâneo**, ao contrário do que o comentário dizia:
  o `html` tem `scroll-behavior: smooth`. Agora `{ behavior: 'instant' }`.
- TrustBar: "Entrega em 24h" → "Envio no mesmo dia", como no Hero (aprovado).
- Verificado no navegador: `/login` → FAQ pelo Footer, `/produtos` → FAQ e `/login` →
  Categorias pelo Header. Nos três o título para em y≈180, abaixo do chrome (y=101).
- `useScrollRestoration.test.jsx` reescrito: 8 testes.

## Fases 9b + 9c — promo condicionada ao config e Benefícios

**9b (promo):**
- `UrgencyBanner` lê tag, título, subtítulo e `endsAt` do `storeConfig.promo`. Some
  desligado, sem título ou com prazo vencido, e some **sozinho no segundo** em que o
  prazo passa.
- `useCountdown(target)` recebe o prazo. O antigo inventava "domingo 23:59" na
  primeira visita, guardava no `localStorage` e renovava toda semana: cada visitante
  via um relógio diferente e a oferta nunca acabava. Sem prazo, não há contador. O
  `exhaustive-deps` do ratchet sumiu junto (25 → 24 warnings).
- `Countdown` só apresenta. Ganhou bloco de dias (antes "97 horas"), algarismos
  tabulares, e perdeu os ":" de texto posicionados com `margin-top: -20px`.
- Verificado no navegador com a promo ligada e prazo de 3 dias: "3 Dias 03 Horas…".

**9c:**
- `storeConfig.promo` documenta o formato de `endsAt` e traz a campanha de exemplo
  ("Oferta Especial", "Leve 3, pague 2"), **desligada**. Subtítulo vazio: o antigo
  ("Só até domingo à meia-noite") afirmava um prazo que não existia.
- Benefícios: só tokens e `.section` global. As fontes cravadas não eram carregadas.

`useCountdown.test.js` (5) e `UrgencyBanner.test.jsx` (7) *(novos)*.

## Testes ativos logado (conta local do usuário)

Sem erro de página em nenhum fluxo: login → volta para `/`; carrinho (+, −, "−"
desabilitado com 1 item, Escape fecha, foco entra no drawer); checkout (resumo e
frete grátis corretos); meus pedidos; minha conta; admin (dashboard, produtos,
pedidos). Parei antes de confirmar pedido para não criar cobrança.

| Achado | Onde | Fase |
|---|---|---|
| `normalizeEmail()` do express-validator tira os pontos de e-mail Gmail: entra-se com `eduardo.hpa87@…` e a conta mostra `eduardohpa87@…` | `server/src/routes/authRoutes.js` | G |
| **O servidor não cobra frete.** `totalAmount` = só os produtos; os R$ 15 existem apenas na tela do checkout | `orderController.js:24`, `Checkout.jsx:10-11` | Configurações (S) |

## Feature S — Configurações da loja no painel admin

Especificação aprovada pelo usuário (arquivo de plano da sessão). O `storeConfig.js`
estático passa a viver no banco, editável em `/admin/configuracoes`, e **o servidor
passa a cobrar frete**. Seis fases: S1 banco · S2 API · S3 pedido com frete · S4 base
do cliente · S5 consumidores · S6 painel.

**S1 — banco** *(migration rodada pelo usuário)*
- `Order` ganhou `subtotal` e `shipping_cost`; `total_amount` = os dois somados.
  Migration editada à mão: coluna anulável → `UPDATE orders SET subtotal =
  total_amount` (pedidos antigos não tinham frete) → `NOT NULL`. O pedido existente
  ficou com subtotal 1225 / frete 0 / total 1225.
- `store_settings`: uma linha (`CHECK (id = 1)` no banco), objeto inteiro em `JSONB`.

**S2 — API** · `config/storeDefaults.js`, `services/settings.js`,
`controllers/settingsController.js`, `routes/settingsRoutes.js`, `app.js`
- `GET /api/settings` público; `PUT /api/admin/settings` admin, substituição do
  objeto inteiro, 422 com `{ message, field }`.
- `withDefaults`: defaults por baixo, banco por cima, guiado pelas chaves dos
  defaults — campo novo nasce com padrão, campo removido some. Cache em memória
  invalidado no PUT.
- Verificado por `curl`: GET, 401 sem login, 7 PUTs inválidos com campo certo, PUT
  válido; chave desconhecida não chega ao banco; strings saneadas para número; trim.
- O `shipping.js` saiu da S2 para a S3 (onde é usado) para o controller caber.

**S3 — pedido com frete** · `services/shipping.js`, `orderController.js`, `paymentController.js`
- `createOrder` lê as configurações vigentes e grava `subtotal`, `shippingCost` e
  `totalAmount`. Conta em centavos inteiros (`0.1 + 0.2 !== 0.3`, e aqui o resíduo
  vira cobrança).
- Checkout Pro: `shipments: { mode: 'not_specified', cost }` quando há frete — a
  preference cobra pela soma dos itens, e o frete sumia. Pix já usa `totalAmount`.
- `statement_descriptor: 'CAMPO CHEIO'` (nome na fatura do cartão) estava cravado
  nos dois pagamentos; agora vem de `brand.name`.
- Verificado com 2 pedidos reais no banco local (autorizado), mesmo carrinho de
  R$ 189: limite 149 → 189 / 0 / 189; limite 500 (via PUT) → 189 / 15 / 204.
  Configuração e carrinho restaurados, pedidos de teste apagados. Nenhum pagamento
  criado no MP.

**S4 — cliente: base** · `services/settingsService.js`, `store/settingsStore.js`,
`App.jsx`, `test/settings.js`, `test/setup.js` (+ `.boot-error` no `globals.css`)
- `App` carrega configurações e sessão em paralelo; a loja só monta com
  `status: 'ready'` (spinner de boot; falha → "Tentar de novo"). Título da aba vem
  de `brand.name`; o `<title>` do `index.html` segue estático (é o que buscador lê).
- `setSettings()` antes de todo teste, por `import()` dinâmico no setup (G-14).
- O `SettingsIcon` saiu da S4 para a S6, onde é usado.

**S5 — cliente: consumidores** (3 sub-agentes em paralelo, revisados por mim)
- Lote A: Header, Footer, Layout, AdminLayout (+ teste do Header). Leituras de topo
  de módulo entraram nos componentes. Footer: logo, WhatsApp, © e o `<svg>` do
  WhatsApp (virou `WhatsAppIcon`) vêm das configurações.
- Lote B: Hero, Testimonials, UrgencyBanner, ExitPopup, `useFreteProgress` (+ testes,
  agora com `setSettings`, sem `Object.assign` no config).
- Lote C: Checkout, PaymentFailure, Login, Register — constantes de frete, WhatsApp
  e logo cravados saíram.
- Revisão: o cliente somava o subtotal em float e o servidor em centavos — no
  limite exato os dois podiam discordar do frete. `useFreteProgress` passou a contar
  em centavos e a ser a única conta de frete do cliente (o Checkout usa o hook);
  limite 0 ("sempre grátis") não divide mais 0 por 0. +3 testes.
- **`client/src/config/storeConfig.js` deletado.** Nenhuma referência restante.
- 77 testes, lint 0 erros, build ok.
- Navegador: valores trocados pela API (limite R$ 300, promo ligada, logo "LOJA
  TESTE") apareceram na barra de frete, no Hero, no banner, no Header e no Footer.

**S6 — painel** · `ui/Switch/{jsx,css}` *(novo)*, `pages/admin/AdminSettings/{jsx,css}`
*(novo)*, `AppRouter.jsx` (+1 item na sidebar do `AdminLayout`, +1 linha no `Icons.jsx`)
- `/admin/configuracoes`: cinco cartões (Marca e contato · Frete · Promoção · Popup de
  saída · Prova social), barra de ações fixa com "Descartar"/"Salvar alterações" só
  ativos com alteração, prévia do logo, aviso de data de término já vencida,
  `beforeunload` com alteração pendente.
- 422 do servidor marca o campo (`aria-invalid` + mensagem) e leva o foco até ele;
  editar o campo limpa o erro.
- `ui/Switch`: `button role="switch"` + `aria-checked`; o `<label>` aciona.
- +10 testes (`Switch.test.jsx`, `AdminSettings.test.jsx`): 87 no total.
- Navegador, logado como admin: salvar limite R$ 250 + promo ligada → toast, e a loja
  na mesma aba (sem recarregar) mostrou "Faltam R$ 61,00", Hero R$ 250 e o banner;
  WhatsApp com máscara → campo marcado, mensagem do servidor, foco nele. Tudo
  desfeito pela própria tela.

| Pendente da feature | Onde | Fase |
|---|---|---|
| `brand.name` e `brand.nameParts` são independentes: dá para trocar o logo e esquecer o nome (título da aba, ©, fatura). **Decisão do usuário: fica assim** até a feature de logo personalizado (G8), que muda o que o logo é | `AdminSettings.jsx` | G8 |
| Navegação interna com alteração não salva não avisa (só `beforeunload`): exige data router | `App.jsx` / `AppRouter.jsx` | G |
| Telas de pedido não mostram subtotal/frete separados | `Orders.jsx`, `AdminOrders.jsx` | 14 |

## Fase 10 — catálogo (10a card + 10b listagem)

**10a — card**
- **B6:** o nome do produto é o link, esticado sobre o card por `::after`; coração e
  "Adicionar" ficam por cima (`z-index`). Um `<Link>` em volta do card aninharia
  botões em link (HTML inválido). Foco visível no card inteiro via `:has()`.
- **B7:** botão só com `margin-top: auto`; o `12px` declarado depois anulava o auto.
- **Preço comparado como texto:** Decimal do Prisma chega string, e `'99.00' >
  '149.00'` é true — preço "de" menor aparecia riscado. Agora `Number()`.
- **"Adicionado!" falso:** aparecia mesmo quando o `useAddToCart` recusava (sem
  login). O card agora busca a ação sozinho (G-04) e só confirma com `true`.
- `ui/Rating` *(novo)*: meia estrela, `role="img"` nomeado em pt-BR ("4,5 de 5
  estrelas"); as estrelas antigas tinham `aria-label` em `<span>` sem papel.
- Placeholder sem imagem: `ImagePlaceholderIcon` no lugar do cabide. Badge com tokens
  (`.produto-badge--best/urgency/new`, antes `badge--green` sem prefixo). "De" do
  preço riscado em `.sr-only` (novo utilitário no globals).

**10b — listagem**
- **B1:** total de páginas = `Math.ceil(total / limit)`.
- Categoria e página na URL (`?category=&page=`), como **links**: compartilhável,
  abre em nova aba, o voltar devolve a página. Primeira/última página: link
  desabilitado (`aria-disabled`), sem `href`.
- Paginação: `nav` "Paginação", `aria-current`, glifos `‹ ›` viraram ícones nomeados.
- Classes com prefixo `listing-` (colisão de `.category-count` com o Categories).
- `ProductCardSkeleton` *(novo)* compartilhado por vitrine e catálogo; o
  `ProductGrid.css` redefinia `.skeleton` e o próprio shimmer. `ProductGrid` usa o
  `productService` (era `fetch` cru).
- Testes: `Rating` (4), `ProductCard` (7 — o de "sem login" falha com a lógica
  antiga), `ProductListing` (6). 104 no total.
- Navegador: 2 páginas (12 + 5), voltar devolve a página 1, botões alinhados nas 4
  linhas, clique na imagem abre o produto.

| Achado | Onde | Fase |
|---|---|---|
| PDP mostra **"(47 avaliações)" cravado** no JSX — o mesmo produto tem 248 no card | `ProductDetail.jsx:118` | 11 |
| `ui/Rating` ainda não adotado nos depoimentos e na PDP | `Testimonials.jsx`, `ProductDetail.jsx` | 11 |
| "12x sem juros" cravado no card, na PDP e no TrustBar — condição comercial, candidata às configurações | `ProductCard.jsx`, `ProductDetail.jsx`, `TrustBar.jsx` | G |
| Favorito (coração) só vive no estado do card: some ao recarregar | `ProductCard.jsx` | decisão do usuário |

## Fase 9a — Hero honesto e FAQ com spring

**A Fase 9 virou 9a + 9b.** Gate de promo de verdade precisa do `Countdown.jsx` e do
`useCountdown.js`: hoje o contador inventa um prazo "até domingo" por visitante
(guardado no `localStorage`, renova toda semana) e ignora o `promo.endsAt`. Com o
Hero e o FAQ seriam 8 arquivos.

**Hero**
- **Fora, por não virem de dado:** "+12.000 pedidos entregues" com quatro avatares
  de letra, "4.9 / 5.0 avaliação", "+500 vendidos essa semana" e a etiqueta "Mais
  vendida". A nota volta, formatada em pt-BR, se o lojista declarar `social.stats`.
- **`<svg>` desenhado à mão com "CBF" no peito** (marca de terceiro, e SVG é vetado
  no projeto) virou o `ShirtIcon` do MUI num halo.
- **Copy alterada, conferir:** "Temporada 2024/25" (vencido) → "Nova temporada";
  "Entrega em 24h" → "Envio no mesmo dia", que é o que o FAQ garante para todo
  pedido (24h ele só diz que "costuma" valer em capitais). O resto do texto é o
  original.
- Frete grátis lê `storeConfig.shipping.freeThreshold` via `formatCurrency`.
- CTA virou `ui/Button` com `href`, saindo do `.btn-primary` legado.
- Entrada por spring do motion (`rise` + `popIn`), no lugar de dois `@keyframes`.
- **Padding dobrado:** o `main` já desconta o header (`Layout.css`); o Hero somava
  mais 100px e `min-height: 100vh` inteiro, empurrando a dobra. Agora é
  `calc(100svh - var(--header-total))`.
- `.green` (classe sem prefixo no JSX) → `.hero-headline-accent`. CSS de 315 para
  ~140 linhas, só tokens. Passo 0 (limpeza antes de refatorar arquivo >300 LOC)
  conferido: nenhuma regra era morta, então não houve commit de limpeza separado.

**FAQ**
- Acordeão por spring com altura `auto` medida pelo motion. Era
  `max-height: 300px` em CSS, que cortava resposta longa e levava o mesmo tempo
  para uma linha ou dez. Exceção documentada à regra de só animar
  transform/opacity, como a barra do FreteBar.
- O `+` em texto virou `PlusIcon` girando 45° por spring.
- Padrão de acordeão acessível: pergunta em `h3 > button` com `aria-controls`, e
  resposta como `role="region"` nomeada pela pergunta. Resposta fechada sai do DOM.
- `id="faq"` entrou no FAQ e o `<div>` embrulho saiu da Home. **As quatro âncoras da
  Home agora pertencem aos próprios blocos.**
- `.open` (sem prefixo) → `.faq-item--open`.

`Hero.test.jsx` e `FAQ.test.jsx` *(novos)*, 5 + 5 testes. Contra os componentes
antigos, 7 dos 10 falham; os 3 que passam são comportamento preservado (FAQ começa
fechado, segundo clique fecha, CTA é link).

## Fases

| # | Título | Arquivos |
|---|---|---|
| 1 | Completar tokens, primitivas e fontes únicas | `globals.css`, `main.jsx`, `fonts.css` (del), `config/storeConfig.js`, `constants/orderStatus.js` |
| 2 | Primitivas estáticas | `ui/Button/{jsx,css}`, `ui/Field`, `ui/StatusBadge` |
| — | ~~MANUAL: `npm i motion`~~ — feito, `motion@13.4.4` instalado | |
| 3 | Fundação de motion | `styles/motion.js`, `hooks/useScrollLock.js`, `ui/Reveal`, `ui/Modal/{jsx,css}` (+1 linha em `Icons.jsx`: `CloseIcon`) |
| 4 | Toasts tipados | `uiStore.js`, `Toast.jsx`, `ToastContainer.jsx`, `Toast.css`, `Icons.jsx` (+1 linha em `ProductGrid.jsx`: call site do toast) |
| 5a | CartDrawer como sheet arrastável (B4) | `hooks/useFreteProgress.js`, `hooks/useFocusTrap.js`, `Icons.jsx`, `CartDrawer.{jsx,css}` |
| 5b | CartItem, FreteBar e limpeza | `CartItem.{jsx,css}`, `FreteBar.jsx`, `Modal.jsx` (usa `useFocusTrap`), `globals.css` (del. alias `.badge-green`) |
| 6 | Header/FreteBar um material; pill `layoutId` (B5) | `Header.{jsx,css}`, `FreteBar.css`, `Layout.{jsx,css}` (+1 linha em `Icons.jsx`: `WhatsAppIcon`) |
| 7a | Shell honesto e boot (B8) | `App.jsx`, `AppRouter.jsx`, `ProtectedRoute.jsx`, `AdminRoute.jsx`, `hooks/useScrollRestoration.js` *(novo)* |
| 7b | ExitPopup sobre `Modal` | `ExitPopup.{jsx,css}` |
| 8a | Home: de-dup, reveals (B9) | `Home.{jsx,css}`, `Categories.{jsx,css}`, `Benefits.jsx` |
| 8b | Prova social honesta | `Testimonials.{jsx,css}`, `Home.jsx`, `Home.css` (del), `config/storeConfig.js` |
| 9a | Hero honesto, FAQ spring | `Hero.{jsx,css}`, `FAQ.{jsx,css}`, `Home.jsx` |
| 9b | Promo condicionada ao config | `UrgencyBanner.{jsx,css}`, `Countdown.{jsx,css}`, `hooks/useCountdown.js` |
| 9c | Benefícios + formato da promo | `Benefits.{jsx,css}`, `config/storeConfig.js` |
| 10a | Card: link, `ui/Rating`, preço e "Adicionado!" honestos (B6, B7) | `ProductCard.{jsx,css}`, `ui/Rating/{jsx,css}` (+`sr-only` no `globals.css`, +ícones) |
| 10b | Catálogo: paginação real, URL, skeleton único (B1) | `ProductListing.{jsx,css}`, `ProductGrid.{jsx,css}`, `ProductCardSkeleton.jsx` *(novo)* |
| 11 | PDP + Checkout | `ProductDetail.{jsx,css}`, `Checkout.{jsx,css}` |
| 12 | `ResultPage` único (B2) | `ui/ResultPage/{jsx,css}`, `Payment{Success,Failure,Pending}.jsx` |
| 13 | Auth + Conta | `Login.{jsx,css}`, `Register.{jsx,css}`, `Account.jsx` |
| 14 | Pedidos + shell do admin | `Orders.{jsx,css}`, `AdminLayout.{jsx,css}`, `AdminDashboard.css` |
| 15 | CRUD do admin: modais, toasts, preview | `AdminProducts.{jsx,css}`, `AdminOrders.{jsx,css}`, `AdminDashboard.jsx` |
| 16 | Varredura final | `globals.css`, `Countdown.jsx`, `UrgencyBanner.css`, `ProductGrid.css`, `Footer.jsx` |
| 17 | Deleção de arquivos mortos | `RouteTransition.*`, `useScrollAnimation.js` + `.animate-on-scroll` do `globals.css`, `Payment{Success,Failure}.css`, raiz: `index.html`, `package-lock.json` |

## Grafo de dependências

```
F1 tokens -> F2 primitivas -> [npm i motion] -> F3 motion
F3 -> F4 toasts -> F5 cart -> F6 header -> F7a shell -> F7b popup
F7a -> F8 home -> F9 hero/FAQ/promo
F2+F4 -> F10 catalogo -> F11 PDP+checkout -> F12 resultados -> F13 auth
F2+F3 -> F14 pedidos+shell -> F15 admin CRUD
tudo -> F16 varredura -> F17 delecoes -> [Estagio G]
```

## Estágio G — melhorias além do redesign (sessão própria)

| # | Item | Por quê |
|---|---|---|
| G1 | `docs/api-audit.md` + `docs/api-guidelines.md` (roadmap 03) | Contrato hoje é tabela no README, desatualizada |
| G2 | `problem+json` + validação em products/cart/orders + rota admin canônica | `GET /api/orders/:id` declarada antes de `/admin/all` sombreia a rota; só os aliases do `app.js:46-48` funcionam |
| G3 | Enums de status no Prisma + `Idempotency-Key` em `POST /api/orders` | Status é `String` livre; dinheiro exige idempotência |
| G4 | Webhook MP: tolerância de timestamp + log estruturado | Valida HMAC mas aceita payload de ontem |
| G5 | ~~ESLint + Prettier + Vitest~~ ✅ no `client/` (T1) · falta **CI** e o `server/` | O repo não tinha nenhum dos três |
| G6 | `sdk/` em TS strict + `openapi.yaml` + docs | Capstone do roadmap |
| G7 | Multi-tenant: theming via `storeConfig` + seed por cliente | Tese do template revendável |
| G8 | **Logo personalizado** (pedido do usuário): upload no painel de Configurações, convertido em alta qualidade, substituindo o logo de texto em Header, Footer, admin, Login/Cadastro | Hoje o logo é texto em duas partes (`brand.nameParts`) |

## Verificação

**Existe:** diagnostics do VS Code + navegador em `localhost:5173` + **ESLint e Vitest no
`client/`** (T1). O node é gerenciado por `fnm` e não está no PATH do shell; rodar exige
`export PATH="$HOME/AppData/Roaming/fnm/node-versions/v22.15.0/installation:$PATH"` e
chamar `./node_modules/.bin/{eslint,vitest}`.
**Ainda não existe:** type-checker (decisão explícita: sem `checkJs`; o `no-undef` do
ESLint cobre a maior parte do que `tsc` pegaria em JS puro), CI, nada no `server/`.

## T1 — ferramental do frontend (antecipado do G5)

Decidido com o usuário: **sem type-checker**, ESLint no nível *recommended + react-hooks
+ jsx-a11y*, e Vitest com jsdom + Testing Library.

| Arquivo | O quê |
|---|---|
| `package.json` | devDeps + scripts `lint`, `lint:fix`, `format:check`, `format:all`, `test`, `test:watch` |
| `eslint.config.js` *(novo)* | Flat config, ESLint 9. `react`, `react-hooks`, `react-refresh`, `jsx-a11y` |
| `.prettierrc` + `.prettierignore` *(novos)* | Aspas simples, ponto e vírgula, 100 colunas — o estilo que o código já tem |
| `vite.config.js` | Bloco `test`: jsdom, `globals: false`, `css: false` |
| `src/test/setup.js` *(novo)* | `jest-dom` + `cleanup` entre testes |

**Resultado da primeira passada:** 29 problemas. Dois eram código morto e foram
deletados na hora (`catch (err)` sem uso em `ProductGrid.jsx`, const `SIZES` órfã em
`Checkout.jsx`). Ficou **0 erro / 27 warnings, exit 0**.

**`react/prop-types` desligado.** Sem type-checker, a alternativa seria anotar propTypes
na árvore inteira — custo alto para um projeto que vai virar TS no `sdk/`.

### Ratchet de acessibilidade

As 26 ocorrências restantes eram de cinco regras do `jsx-a11y`, todas em arquivos de fases
futuras. Corrigir tudo na T1 seria editar sete arquivos fora de fase, então elas ficaram
como `warn`: o lint sai com código 0 e já pode virar gate, e os achados continuam
visíveis. **Qualquer outra regra de a11y segue como erro** — código novo não entra torto.

**A regra que chega a zero volta para `error` na hora, não na Fase 16.** Um `warn` que
já não acusa nada só serve para deixar entrar código novo torto. A Fase 7b zerou
`no-noninteractive-element-interactions` (era só o overlay do ExitPopup) e a devolveu
para `error`. Restam **24 ocorrências de quatro regras**, mais o `exhaustive-deps` do
`useCountdown` — 25 warnings no total.

| Arquivo | Ocorrências | O quê | Fase |
|---|---|---|---|
| `Checkout.jsx` | 9 | `<label>` sem `htmlFor` e `<input>` sem `id` — clicar no rótulo não foca o campo, em **todo o checkout** | 11 |
| `AdminProducts.jsx` | 10 | 8× o mesmo `<label>` solto + `<div onClick>` sem teclado | 15 |
| `Account.jsx` | 3 | `<label>` sem `htmlFor` | 13 |
| ~~`ExitPopup.jsx`~~ | ~~2~~ | ~~overlay com `onClick` sem equivalente de teclado~~ | ✅ 7b |
| `Orders.jsx` | 2 | `role="button"` sem `tabIndex` nem handler de tecla | 14 |
| ~~`useCountdown.js`~~ | ~~1~~ | ~~`exhaustive-deps`: falta `calc`~~ | ✅ 9b |

A Fase 16 fecha as regras que ainda sobrarem e liga `--max-warnings 0`.

**`format:all` não deve ser rodado agora.** Reformatar `src/` inteiro no meio de um
refactor de 17 fases produz um diff que ninguém revisa e enterra as mudanças reais. O
uso correto é por arquivo, na fase que já é dona dele:
`npx prettier --write src/pages/Home/Home.jsx`.

**Sem lockfile commitado:** o `.gitignore` da raiz ignora `*-lock.json`. Enquanto isso
valer não dá para fazer `npm ci` em CI nem garantir instalação reproduzível entre
clientes do template. Decisão para o Estágio G, junto do item de CI.

## T2 — testes de regressão

**16 testes, 4 arquivos, todos passando.** Um por bug que já mordeu mais de uma vez.
A partir daqui cada fase que mexe em comportamento traz os seus: a 7b somou 6
(`ExitPopup.test.jsx`), o H3 mais 6 (`useExitIntent.test.js`), a 8a mais 5
(`Categories.test.jsx`), a 8b mais 5 (`Testimonials.test.jsx`) e o H4 mais 3
(`Header.test.jsx`), a 9a mais 10 (`Hero.test.jsx`, `FAQ.test.jsx`), o H7 mais 4
(`useScrollRestoration` reescrito) e a 9b mais 12 (`useCountdown`, `UrgencyBanner`),
fechando em **67 testes, 13 arquivos**.

| Arquivo | Cobre |
|---|---|
| `store/authStore.test.js` | G-07: o logout **não** pode deixar a store deslogada antes de navegar. Se alguém trocar de volta por `clearUser()` + `navigate`, o teste cai |
| `router/ProtectedRoute.test.jsx` | B8 (spinner no boot, sem redirect prematuro) + query string do destino preservada e codificada |
| `hooks/useScrollRestoration.test.jsx` | As três regras: não rola ao montar, rola no PUSH com pathname novo, não rola com hash, não rola em POP |
| `hooks/useFreteProgress.test.js` | `price` como string (Decimal do Prisma), limite exato libera, `fillPct` não passa de 100 |
| `components/home/Categories/Categories.test.jsx` | Skeleton sem links, link com slug codificado, contagem flexionada, filtro de vazias e corte em seis, falha da API some em vez de girar |
| `components/home/Hero/Hero.test.jsx` | Sem `stats` nenhum número de prova social; com `stats`, nota em pt-BR; frete do config; CTA é link; nenhum `<svg>` à mão nem "CBF" |
| `components/home/FAQ/FAQ.test.jsx` | Âncora `#faq`, começa fechado, resposta como região nomeada pela pergunta, uma aberta por vez, segundo clique fecha |
| `components/layout/Header/Header.test.jsx` | Com `seedTestimonials: false`: "Avaliações" desabilitado, o clique não navega, sem pill mesmo com o hash na URL |
| `components/home/Testimonials/Testimonials.test.jsx` | Sem `stats` não aparece número nem selo de verificado; com `stats`, nota e total em pt-BR; `seedTestimonials: false` some; uma `<section id="prova-social">` com um `h2` só |
| `hooks/useExitIntent.test.js` | Topo dispara, laterais não; uma vez por sessão; timer de 30s e seu cancelamento; cleanup remove **todos** os listeners |
| `components/home/ExitPopup/ExitPopup.test.jsx` | O popup é `ui/Modal`: dialog com nome acessível, Escape fecha, recusa é `<button>` de verdade, desconto vem do `storeConfig`, e-mail vazio não dispara toast |

Os testes de rota usam os mesmos `future` flags do `App.jsx` — `v7_startTransition` muda
a prioridade da atualização de rota e foi a causa do G-07; router configurado diferente
da produção testa outra coisa.

**Fases 2, 3 e 4 saíram sem diagnostics** na sessão em que foram escritas. A partir do
restart seguinte `mcp__client__problems` voltou a responder e `client/src` acusou **zero
erros** — dívida fechada.

**Smoke completo (após F12, F15, F17):** Home → categoria → catálogo paginado → PDP →
adicionar (drawer abre) → arrastar para fechar → checkout 2 passos → Pix → sucesso com
resumo → `/meus-pedidos` → admin CRUD.

## Hotfix H1 — "Adicionar ao Carrinho" morto (fora da numeração de fases)

Bug de produção encontrado durante a Fase 5, corrigido fora do plano por impedir venda.
Verificado no navegador: adiciona logado, redireciona deslogado, Network correto.

| Falha | Onde | Correção |
|---|---|---|
| `onAddToCart` nunca passado → botão morto em `/produtos` | `ProductListing.jsx:105` | passa `addToCart` |
| Sem guard de auth na PDP; redirect mudo na home | `ProductDetail.jsx:38`, `ProductGrid.jsx:56` | guard + toast no hook |
| `catch {}` em `fetchCart` → toast de sucesso com carrinho vazio | `cartStore.js:16` | devolve `bool`; `addItem` falha se não sincronizar |
| Mensagem do servidor descartada | os 3 call sites | hook lê `err.response.data.message` |

Arquivos: `hooks/useAddToCart.js` *(novo)*, `cartStore.js`, `ProductListing.jsx`,
`ProductDetail.{jsx,css}`, `ProductGrid.jsx`.

Pendente: `ProductCard.jsx:52` ainda faz `if (!onAddToCart) return;` — bail silencioso que
escondeu o bug por seis meses. A Fase 10 é dona do arquivo e torna o handler obrigatório.

**Decisão de produto em aberto:** carrinho guest. Hoje `cartRoutes.js:7` exige auth em tudo
e não há persistência local — deslogado é impossível adicionar. Habilitar é mudança de
arquitetura (persist local + merge no login), candidata a item do Estágio G.

## Hotfix H2 — sem saída do painel admin (fora da numeração de fases)

Reportado pelo usuário depois da Fase 7a: *"quando eu estou no painel admin não
tem como sair de lá"*. O painel não tinha nenhum caminho de volta para a loja, e o
"Sair" tinha um loop — logout dentro de `/admin`, o guard captura o destino, e o
login seguinte devolve o usuário ao painel.

| Falha | Onde | Correção |
|---|---|---|
| Sem troca de visão: o admin entra no painel e não tem link de volta para a loja | `AdminLayout.jsx` | `<Link to="/">` "Ver loja" no rodapé da sidebar, espelhando o item "Admin" do dropdown do Header |
| Logout se auto-reverte: volta ao painel no login seguinte (G-07) | `authStore.js`, `AdminLayout.jsx`, `Header.jsx` | `authStore.logout()` com `location.assign('/')`; os dois call sites passam a chamá-lo |
| Logout do admin não limpava o carrinho local | `AdminLayout.jsx` | Resolvido pelo reload — nada em memória sobrevive |
| **B3**: `span:last-child` escondia o ícone, não o label (G-08) | `AdminLayout.{jsx,css}` | label com `.admin-nav-label`; ícone com `.admin-nav-icon` |
| `CAMPO`/`CHEIO` cravados no JSX e `content: 'CC'` cravado no CSS | `AdminLayout.{jsx,css}` | `storeConfig.brand.nameParts`, iniciais derivadas; `.admin-logo-{full,short}` |
| `setLoading` morto no `authStore` (dívida da 7a) | `authStore.js` | Deletado |

**A primeira correção do logout estava errada** e o usuário pegou no teste:
reordenar `navigate` antes de `clearUser` não muda nada, porque os dois updates
vivem em lanes de prioridade diferentes — store externa (`useSyncExternalStore`)
é síncrona por contrato, `navigate` com `v7_startTransition` é adiável. Sempre
existe um render deslogado na rota antiga. Detalhe completo em G-07.

B3 entrou junto por necessidade, não por escopo: qualquer item novo na sidebar
herdava a regra quebrada do mobile. `AdminLayout.{jsx,css}` fica então
**parcialmente consumido** antes da Fase 14 — sobram para ela os alias legados
(`--bg-dark`, `--bg-card`, `--accent-green`, `--text-muted`, `--border`,
`--font-condensed`), o `#ff3b3b` cravado no hover do Sair, o `border-left: 3px`
do item ativo (que desloca o ícone na sidebar de 60px) e a topbar.
`Header.jsx` recebeu 3 linhas (a mesma cópia do bug de logout vivia lá) — Fase 6
continua entregue.

## Progresso

- [x] 1 — Tokens, primitivas e fontes únicas
- [x] 2 — Primitivas estáticas
- [x] 3 — Fundação de motion
- [x] 4 — Toasts
- [x] H1 — Hotfix "Adicionar ao Carrinho" *(verificado no navegador)*
- [x] 5a — CartDrawer sheet *(verificado no navegador)*
- [x] 5b — CartItem + FreteBar + limpeza *(verificado no navegador)*
- [x] 6 — Header + hotfix da pill *(verificado no navegador)*
- [x] 7a — Shell *(diagnostics limpos; falta verificação no navegador)* · [x] 7b — ExitPopup sobre `Modal` *(lint 0 erros, 22 testes passando; falta verificação no navegador)*
- [x] S1 — Banco (configurações + frete no pedido) · [x] S2 — API de configurações *(verificado por curl)* · [x] S3 — Pedido com frete *(2 pedidos de teste)* · [x] S4 · [x] S5 · [x] S6 — painel *(verificado no navegador)*
- [x] H7 — Âncoras vindas de outra página + TrustBar *(verificado por mim no navegador)*
- [x] H6 — Checagem visual: ícone, âncora sob o header, `<main>` duplo, link do Footer *(verificado por mim no navegador)*
- [x] H5 — Cursor de desabilitado unificado *(falta verificação no navegador)*
- [x] H4 — Cursor global + "Avaliações" desabilitado *(41 testes; falta verificação no navegador)*
- [x] H3 — Gate do `leadCapture` + vazamento do `useExitIntent` *(28 testes passando)*
- [x] H2 — Hotfix saída do painel admin + B3 *(diagnostics limpos; falta verificação no navegador)*
- [x] T1 — Ferramental do frontend *(lint 0 erros / 25 warnings, exit 0)* · [x] T2 — 67 testes de regressão passando
- [x] 8a — Home: reveals + de-dup (B9) *(lint 0 erros, 33 testes, build ok; falta verificação no navegador)* · [x] 8b — Prova social honesta *(lint 0 erros, 38 testes, build ok; falta verificação no navegador)*
- [x] 9a — Hero honesto + FAQ spring *(lint 0 erros, 51 testes, build ok; falta verificação no navegador)* · [x] 9b — Promo · [x] 9c — Benefícios *(67 testes, lint 0 erros / 24 warnings, build ok)*
- [x] 10 — Catálogo *(10a card + 10b listagem; 104 testes, verificado no navegador)* · [ ] 11 — PDP+Checkout · [ ] 12 — Resultados · [ ] 13 — Auth
- [ ] 14 — Pedidos+Admin shell · [ ] 15 — Admin CRUD
- [ ] 16 — Varredura · [ ] 17 — Deleções
