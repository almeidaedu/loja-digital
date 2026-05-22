const express = require('express');
const { getAll, create, update, remove } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.get('/', getAll);
router.post('/', authMiddleware, adminOnly, create);
router.put('/:id', authMiddleware, adminOnly, update);
router.delete('/:id', authMiddleware, adminOnly, remove);

module.exports = router;
