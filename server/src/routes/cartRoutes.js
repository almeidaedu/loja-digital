const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.delete('/', clearCart);

module.exports = router;
