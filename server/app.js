require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// O webhook do Mercado Pago precisa do body raw para verificar a assinatura HMAC.
// Por isso, a rota de webhook é montada ANTES do express.json() global.
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Atalhos de admin — reaproveitam os métodos do orderController diretamente
const authMiddleware = require('./src/middleware/auth');
const adminOnly = require('./src/middleware/adminOnly');
const { adminGetAll, updateStatus } = require('./src/controllers/orderController');
app.get('/api/admin/orders', authMiddleware, adminOnly, adminGetAll);
app.put('/api/admin/orders/:id/status', authMiddleware, adminOnly, updateStatus);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Erro centralizado — deve ser o último middleware
app.use(errorHandler);

module.exports = app;
