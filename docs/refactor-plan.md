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
| B1 | `ProductListing.jsx:35` | Lê `data.totalPages`; API devolve `{products,total,page,limit}`. Paginação nunca renderiza | 10 |
| B2 | `PaymentPending.jsx:45` | `navigate(path,{search})` não existe no RR6; success perde o `orderId` | 12 |
| B3 | `AdminLayout.jsx` + `.css` | ~~CSS esconde `span:last-child` → esconde o ícone, não o label~~ ✅ label ganhou classe própria | H2 |
| B4 | `CartDrawer.jsx:29` | Overlay sem exit; painel com transition 350ms → backdrop some na hora | 5 |
| B5 | ~~`Header.jsx:68`~~ | ~~Pill medida por rect com dep `[activeKey]` → desalinha no resize~~ ✅ `layoutId` | 6 |
| B6 | `ProductCard.jsx:64` | `<article>` sem `<Link>` → produto não é clicável | 10 |
| B7 | `ProductCard.css:212` | `margin-top:12px` anula o `margin-top:auto` → CTAs desalinhados | 10 |
| B8 | `ProtectedRoute.jsx` | ~~`isLoading` → `return null` → tela branca no refresh~~ ✅ gate com spinner; `AdminRoute` herda | 7a |
| B9 | `Categories.jsx` | IntersectionObserver monta antes dos dados → cards invisíveis | 8 |

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
| `.section-title`, `.section-subtitle` | `Categories.css:11,19` | 8 |
| `.skeleton` | `Categories.css:85`, `ProductGrid.css:36` | 8, 10 |

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
| `Hero.jsx:62` | ornamento do hero | 9 |

## Valores cravados fora do storeConfig

| Valor | Onde | Fase |
|---|---|---|
| `149` | `Hero.jsx:30` ("Frete grátis +R$149" em texto) | 9 |
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
| `handlePageChange` não rola ao topo — `page` é state local, não search param, então o `useScrollRestoration` não pega | `ProductListing.jsx:55` | 10 |

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
| `storeConfig.leadCapture.enabled` não é lido por ninguém: o popup monta e arma os listeners de saída mesmo com a campanha desligada. Consertar exige um 3º arquivo (gate em `App.jsx` ou guarda `if (!onExit) return;` no hook) — fora da lista da fase | `App.jsx:33`, `useExitIntent.js:6` | a combinar |
| `useExitIntent` registra `touchstart`/`scroll`/`click` com `{ once: true }` e **não os remove** no cleanup. Se nunca dispararem, sobrevivem ao unmount | `useExitIntent.js:28` | 16 |
| Chave de sessionStorage `cc_popup_shown` tem a marca do cliente cravada num template revendável | `useExitIntent.js:7` | 16 |
| `.modal-overlay` / `.modal-box` no `globals.css` ficaram com **um único** consumidor. Quando a Fase 15 migrar o modal de produtos, as três regras viram lixo | `globals.css:548-580`, `AdminProducts.jsx:390` | 17 |

`storeConfig.leadCapture.discount` passou a alimentar o título, o botão e o texto
do toast — antes `10% OFF` estava cravado três vezes no JSX.

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
| 8 | Home: de-dup, reveals, prova social honesta (B9) | `Home.{jsx,css}`, `Categories.{jsx,css}`, `Testimonials.jsx` |
| 9 | Hero, FAQ spring, promo gated | `Hero.{jsx,css}`, `FAQ.{jsx,css}`, `UrgencyBanner.jsx` |
| 10 | Catálogo: card link, paginação real (B1,B6,B7) | `ProductCard.{jsx,css}`, `ProductListing.{jsx,css}`, `ProductGrid.jsx` |
| 11 | PDP + Checkout | `ProductDetail.{jsx,css}`, `Checkout.{jsx,css}` |
| 12 | `ResultPage` único (B2) | `ui/ResultPage/{jsx,css}`, `Payment{Success,Failure,Pending}.jsx` |
| 13 | Auth + Conta | `Login.{jsx,css}`, `Register.{jsx,css}`, `Account.jsx` |
| 14 | Pedidos + shell do admin | `Orders.{jsx,css}`, `AdminLayout.{jsx,css}`, `AdminDashboard.css` |
| 15 | CRUD do admin: modais, toasts, preview | `AdminProducts.{jsx,css}`, `AdminOrders.{jsx,css}`, `AdminDashboard.jsx` |
| 16 | Varredura final | `globals.css`, `Countdown.jsx`, `UrgencyBanner.css`, `ProductGrid.css`, `Footer.jsx` |
| 17 | Deleção de arquivos mortos | `RouteTransition.*`, `useScrollAnimation.js`, `Payment{Success,Failure}.css`, raiz: `index.html`, `package-lock.json` |

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
| `useCountdown.js` | 1 | `exhaustive-deps`: falta `calc` | 16 |

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
(`ExitPopup.test.jsx`), fechando em **22 testes, 5 arquivos**.

| Arquivo | Cobre |
|---|---|
| `store/authStore.test.js` | G-07: o logout **não** pode deixar a store deslogada antes de navegar. Se alguém trocar de volta por `clearUser()` + `navigate`, o teste cai |
| `router/ProtectedRoute.test.jsx` | B8 (spinner no boot, sem redirect prematuro) + query string do destino preservada e codificada |
| `hooks/useScrollRestoration.test.jsx` | As três regras: não rola ao montar, rola no PUSH com pathname novo, não rola com hash, não rola em POP |
| `hooks/useFreteProgress.test.js` | `price` como string (Decimal do Prisma), limite exato libera, `fillPct` não passa de 100 |
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
- [x] H2 — Hotfix saída do painel admin + B3 *(diagnostics limpos; falta verificação no navegador)*
- [x] T1 — Ferramental do frontend *(lint 0 erros / 25 warnings, exit 0)* · [x] T2 — 22 testes de regressão passando
- [ ] 8 — Home · [ ] 9 — Hero/FAQ
- [ ] 10 — Catálogo · [ ] 11 — PDP+Checkout · [ ] 12 — Resultados · [ ] 13 — Auth
- [ ] 14 — Pedidos+Admin shell · [ ] 15 — Admin CRUD
- [ ] 16 — Varredura · [ ] 17 — Deleções
