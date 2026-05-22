const express = require('express');
const { getFeatured, getAll, getOne, create, update, remove } = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.get('/featured', getFeatured);
router.get('/', getAll);
router.get('/:slug', getOne);
router.post('/', authMiddleware, adminOnly, create);
router.put('/:id', authMiddleware, adminOnly, update);
router.delete('/:id', authMiddleware, adminOnly, remove);

module.exports = router;
