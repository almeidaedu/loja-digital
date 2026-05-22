# Loja Digital — Full Stack E-Commerce Template

Stack completa pronta para produção: **React 18 + Vite** (frontend), **Node.js + Express** (backend), **PostgreSQL + Prisma ORM**, pagamentos via **Mercado Pago** (Checkout Pro + Pix).

Desenvolvida para ser reaproveitada em múltiplos clientes — troque nome, cores, produtos e imagens sem alterar a estrutura.

---

## Funcionalidades

### Loja
- Listagem de produtos com filtro por categoria e busca textual
- Página de detalhe do produto com seletor de tamanho e quantidade
- Carrinho persistente (sincronizado com banco quando logado, local quando visitante)
- Checkout com endereço de entrega
- Pagamento via **Cartão/Boleto** (Mercado Pago Checkout Pro) e **Pix** (Transparent Checkout)
- Polling de status de pagamento em tempo real
- Histórico de pedidos do cliente

### UI / UX
- Header responsivo com navegação por hash (scroll tracking automático, pill animada)
- Ícones via Material UI Icons (zero emojis)
- Animação de progresso de rota (progress bar no topo)
- Exit popup com captura de e-mail
- Drawer do carrinho com animação
- Toasts de feedback de ações
- Banner de frete grátis configurável
- Skeleton loaders nas listagens

### Admin
- Dashboard com métricas de pedidos e receita
- CRUD completo de produtos (nome, categoria, preço, estoque, imagem, badge, destaque)
- Gerenciamento de pedidos com atualização de status

### Segurança
- Autenticação via JWT em cookie `httpOnly`
- Rotas admin protegidas por middleware
- Webhook do Mercado Pago com verificação HMAC
- `helmet`, `cors`, rate limit no Express
- Erros internos nunca expostos ao cliente

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite, React Router v6, Zustand |
| Ícones | `@mui/icons-material` |
| Backend | Node.js, Express |
| ORM | Prisma (schema-first, migrations gerenciadas) |
| Banco | PostgreSQL 14+ |
| Pagamentos | Mercado Pago SDK v2 |
| Auth | JWT + cookie httpOnly |
| Imagens | WebP, múltiplos tamanhos (`240/320/480px`), servidos como estáticos |

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

---

## Setup (primeira vez)

### 1. Instalar dependências

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Variáveis de ambiente

```bash
cp server/.env.example server/.env
# edite o arquivo com suas credenciais
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL (`postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | String aleatória longa (mín. 64 chars) |
| `JWT_EXPIRES_IN` | Expiração do token (ex: `7d`) |
| `MP_ACCESS_TOKEN` | Token do Mercado Pago (use `TEST-...` para sandbox) |
| `MP_PUBLIC_KEY` | Chave pública do MP |
| `MP_WEBHOOK_SECRET` | Chave de assinatura do webhook (dashboard MP > Webhooks) |
| `CLIENT_URL` | URL do frontend (ex: `http://localhost:5173`) |
| `PORT` | Porta do servidor (default: `3001`) |

### 3. Criar banco e rodar migrations

```bash
cd server

# Cria todas as tabelas via Prisma
npx prisma migrate dev --name init

# Popula categorias e produtos de exemplo
npm run seed
```

### 4. Criar usuário admin

Após se registrar normalmente na aplicação:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

---

## Rodando em desenvolvimento

```bash
# Terminal 1 — servidor (porta 3001)
cd server && npm run dev

# Terminal 2 — cliente (porta 5173)
cd client && npm run dev
```

Acesse: `http://localhost:5173`

O Vite faz proxy automático de `/api` → `http://localhost:3001`.

---

## Estrutura do projeto

```
/
├── client/                         # React 18 + Vite
│   ├── public/
│   │   └── images/products/        # Imagens dos produtos (WebP, 240/320/480px)
│   └── src/
│       ├── components/
│       │   ├── home/               # Hero, TrustBar, Categories, ProductCard,
│       │   │                       # ProductGrid, Testimonials, Benefits, FAQ,
│       │   │                       # UrgencyBanner, ExitPopup
│       │   ├── layout/             # Header (pill nav), Footer, FreteBar
│       │   ├── cart/               # CartDrawer, CartItem
│       │   └── ui/                 # Icons.jsx (MUI re-exports), Toast,
│       │                           # RouteTransition, Spinner
│       ├── pages/
│       │   ├── Home/
│       │   ├── Login/ Register/
│       │   ├── ProductListing/ ProductDetail/
│       │   ├── Checkout/
│       │   ├── PaymentSuccess/ PaymentPending/ PaymentFailure/
│       │   ├── Orders/ Account/
│       │   └── admin/              # AdminDashboard, AdminProducts, AdminOrders
│       ├── store/                  # Zustand: authStore, cartStore, uiStore
│       ├── services/               # api.js (axios), authService, productService,
│       │                           # cartService, orderService, paymentService
│       ├── hooks/                  # useScrollAnimation, useCountdown, useExitIntent
│       ├── router/                 # AppRouter.jsx, ProtectedRoute
│       └── styles/                 # globals.css, fonts.css (variáveis CSS)
│
└── server/
    ├── prisma/
    │   ├── schema.prisma           # Models: User, Category, Product, Order,
    │   │                           # OrderItem, CartItem
    │   └── migrations/             # Histórico de migrations gerado pelo Prisma
    ├── src/
    │   ├── config/                 # database.js (Prisma singleton), mercadopago.js
    │   ├── controllers/            # auth, product, category, cart, order, payment
    │   ├── routes/                 # Express routers por domínio
    │   ├── middleware/             # auth.js, adminOnly.js, errorHandler.js
    │   ├── db/
    │   │   └── seed.js             # Seed de categorias e produtos
    │   └── utils/                  # jwt.js, hash.js, mpSignatureVerify.js
    ├── app.js
    └── server.js
```

---

## Personalização para um novo cliente

### 1. Nome e identidade visual

Edite as variáveis CSS em `client/src/styles/globals.css`:

```css
:root {
  --accent-green: #00ff87;   /* cor de destaque principal */
  --font-display: 'Bebas Neue';
  --font-condensed: 'Barlow Condensed';
}
```

Troque o nome da loja em `client/src/components/layout/Header/Header.jsx` e no `<title>` do `index.html`.

### 2. Produtos e categorias

Edite `server/src/db/seed.js` com os produtos e categorias do cliente, depois rode:

```bash
cd server
npx prisma migrate reset   # limpa banco e roda seed automaticamente
```

### 3. Imagens

Coloque as imagens em `client/public/images/products/<cliente>/`:

```
public/images/products/
└── nome-do-cliente/
    ├── produto-a-240.webp
    ├── produto-a-320.webp
    └── produto-a-480.webp
```

Convenção de nomenclatura: `<slug-do-produto>-<tamanho>.webp`

Referencie no seed com `imageUrl: '/images/products/nome-do-cliente/produto-a-480.webp'`.

### 4. Credenciais do Mercado Pago

Cada cliente tem sua própria conta MP. Basta trocar as variáveis `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY` e `MP_WEBHOOK_SECRET` no `.env` do servidor.

---

## API Endpoints

### Auth
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login (define cookie JWT `httpOnly`) |
| `POST` | `/api/auth/logout` | Logout (limpa cookie) |
| `GET`  | `/api/auth/me` | Usuário autenticado atual |

### Produtos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/products/featured` | Produtos em destaque (home) |
| `GET` | `/api/products` | Listagem (`?category=slug&q=texto&page=1&limit=12`) |
| `GET` | `/api/products/:slug` | Produto individual |
| `POST` | `/api/products` | [Admin] Criar produto |
| `PUT` | `/api/products/:id` | [Admin] Atualizar produto |
| `DELETE` | `/api/products/:id` | [Admin] Desativar produto (soft delete) |

### Categorias
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/categories` | Lista com contagem de produtos |
| `POST/PUT/DELETE` | `/api/categories/:id` | [Admin] CRUD |

### Carrinho (auth obrigatório)
```
GET    /api/cart
POST   /api/cart/items         { product_id, quantity, size }
PUT    /api/cart/items/:id     { quantity }
DELETE /api/cart/items/:id
DELETE /api/cart
```

### Pedidos
```
POST  /api/orders                         Cria pedido a partir do carrinho
GET   /api/orders                         Meus pedidos
GET   /api/orders/:id                     Pedido individual
GET   /api/orders/admin/all               [Admin] Todos os pedidos
PUT   /api/orders/admin/:id/status        [Admin] Atualizar status
```

### Pagamento
```
POST  /api/payments/preference   Checkout Pro → { initPoint, sandboxInitPoint }
POST  /api/payments/pix          Pix → { qrCode, qrCodeBase64, pixCopyPaste }
GET   /api/payments/status/:id   Polling de status do pagamento
POST  /api/payments/webhook      Webhook IPN (verificação HMAC automática)
```

---

## Fluxo de pagamento

### Cartão / Boleto (Checkout Pro)
1. Usuário finaliza carrinho → preenche endereço → clica "Pagar com Mercado Pago"
2. Backend cria Preference no MP → retorna `initPoint`
3. Frontend redireciona para o checkout do MP
4. Após pagamento, MP redireciona para `/pagamento/sucesso?collection_id=ID`
5. Webhook assíncrono: MP notifica `/api/payments/webhook` → status e estoque atualizados

### Pix
1. Usuário seleciona Pix → informa CPF e e-mail → clica "Gerar QR Code"
2. Backend chama MP Payments API com `payment_method_id: "pix"`
3. Frontend exibe QR code e faz polling a cada 5s em `/api/payments/status/:id`
4. Ao receber `approved` → navega para `/pagamento/sucesso`

---

## Comandos úteis

```bash
# Resetar banco e recriar do zero
cd server && npx prisma migrate reset

# Interface visual do banco
cd server && npx prisma studio

# Build de produção do cliente
cd client && npm run build
# Saída em client/dist/ — sirva com nginx ou express.static
```

---

## Produção

```bash
# Variáveis adicionais para produção
NODE_ENV=production
API_URL=https://seudominio.com.br
CLIENT_URL=https://seudominio.com.br
```

Configure o nginx para:
- Servir `client/dist/` como arquivos estáticos
- Fazer proxy de `/api` para `http://localhost:3001`
- Apontar o webhook do MP para `https://seudominio.com.br/api/payments/webhook`
