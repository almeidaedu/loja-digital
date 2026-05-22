const express = require('express');
const { createOrder, getMyOrders, getOneOrder, adminGetAll, updateStatus } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.use(authMiddleware);

// Rotas do cliente
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOneOrder);

// Rotas do admin (montadas também em /api/admin/orders via app.js)
router.get('/admin/all', adminOnly, adminGetAll);
router.put('/admin/:id/status', adminOnly, updateStatus);

module.exports = router;
