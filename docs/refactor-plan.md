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
| B3 | `AdminLayout.jsx:46` + `.css:150` | CSS esconde `span:last-child` → esconde o ícone, não o label | 14 |
| B4 | `CartDrawer.jsx:29` | Overlay sem exit; painel com transition 350ms → backdrop some na hora | 5 |
| B5 | `Header.jsx:68` | Pill medida por rect com dep `[activeKey]` → desalinha no resize | 6 |
| B6 | `ProductCard.jsx:64` | `<article>` sem `<Link>` → produto não é clicável | 10 |
| B7 | `ProductCard.css:212` | `margin-top:12px` anula o `margin-top:auto` → CTAs desalinhados | 10 |
| B8 | `ProtectedRoute.jsx` | `isLoading` → `return null` → tela branca no refresh | 7a |
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
| `CartItem.jsx:45`, `:69` | `⚽`, `−` | 5 |
| `CartDrawer.jsx:63`, `:92` | `🛒`, `🎉` | 5 |
| `FreteBar.jsx:20` | `🎉` | 6 |
| `ExitPopup.jsx:43` | `✕` | 7b |
| `Checkout.jsx:214` | `←` | 11 |
| `ProductDetail.jsx:88`, `:103`, `:175` | `←`, `−` | 11 |
| `PaymentSuccess.jsx:37`, `PaymentFailure.jsx:15`,`:42`, `PaymentPending.jsx:101`,`:123` | `✓`, `✕`, `💬`, `📋`, `⏰` | 12 |
| `Orders.jsx:97` | `▲` / `▼` | 14 |
| `AdminProducts.jsx:392` | `✕` | 15 |

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
| 6 | Header/FreteBar um material; pill `layoutId` (B5) | `Header.{jsx,css}`, `FreteBar.css`, `Layout.{jsx,css}` |
| 7a | Shell honesto e boot (B8) | `App.jsx`, `AppRouter.jsx`, `ProtectedRoute.jsx`, `AdminRoute.jsx` |
| 7b | ExitPopup sobre `Modal` | `ExitPopup.{jsx,css}` |
| 8 | Home: de-dup, reveals, prova social honesta (B9) | `Home.{jsx,css}`, `Categories.{jsx,css}`, `Testimonials.jsx` |
| 9 | Hero, FAQ spring, promo gated | `Hero.{jsx,css}`, `FAQ.{jsx,css}`, `UrgencyBanner.jsx` |
| 10 | Catálogo: card link, paginação real (B1,B6,B7) | `ProductCard.{jsx,css}`, `ProductListing.{jsx,css}`, `ProductGrid.jsx` |
| 11 | PDP + Checkout | `ProductDetail.{jsx,css}`, `Checkout.{jsx,css}` |
| 12 | `ResultPage` único (B2) | `ui/ResultPage/{jsx,css}`, `Payment{Success,Failure,Pending}.jsx` |
| 13 | Auth + Conta | `Login.{jsx,css}`, `Register.{jsx,css}`, `Account.jsx` |
| 14 | Pedidos + shell do admin (B3) | `Orders.{jsx,css}`, `AdminLayout.{jsx,css}`, `AdminDashboard.css` |
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
| G5 | **ESLint + Prettier + Vitest + CI** | O repo não tem nenhum dos três — maior lacuna de qualidade |
| G6 | `sdk/` em TS strict + `openapi.yaml` + docs | Capstone do roadmap |
| G7 | Multi-tenant: theming via `storeConfig` + seed por cliente | Tese do template revendável |

## Verificação

**Existe:** diagnostics do VS Code nos arquivos tocados + navegador em `localhost:5173`.
**Não existe:** type-checker, linter, testes (nem em `client/`, nem em `server/`). Nenhuma
fase é reportada como "testada" — o termo é "diagnostics limpos + verificada no navegador".
Fechar isso é G5.

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

## Progresso

- [x] 1 — Tokens, primitivas e fontes únicas
- [x] 2 — Primitivas estáticas
- [x] 3 — Fundação de motion
- [x] 4 — Toasts
- [x] H1 — Hotfix "Adicionar ao Carrinho" *(verificado no navegador)*
- [x] 5a — CartDrawer sheet *(diagnostics limpos; falta conferir arraste e reduced-motion)*
- [ ] 5b — CartItem + FreteBar + limpeza
- [ ] 6 — Header
- [ ] 7a — Shell · [ ] 7b — ExitPopup
- [ ] 8 — Home · [ ] 9 — Hero/FAQ
- [ ] 10 — Catálogo · [ ] 11 — PDP+Checkout · [ ] 12 — Resultados · [ ] 13 — Auth
- [ ] 14 — Pedidos+Admin shell · [ ] 15 — Admin CRUD
- [ ] 16 — Varredura · [ ] 17 — Deleções
