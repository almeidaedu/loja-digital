const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFeatured, getAll, getOne, adminGetAll, create, update, remove } = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  }
  next();
}

// Inputs de formulário chegam como string — as regras convertem para os tipos do schema
const optionalFields = [
  body('stock').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Estoque inválido.').toInt(),
  body('originalPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Preço original inválido.').toFloat(),
  body('badge').optional({ values: 'falsy' }).isIn(['best_seller', 'urgency', 'new']).withMessage('Badge inválido.'),
  body('featured').optional().isBoolean({ loose: true }).toBoolean(),
  body('active').optional().isBoolean({ loose: true }).toBoolean(),
];

const createRules = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
  body('price').notEmpty().withMessage('Preço é obrigatório.').isFloat({ min: 0 }).withMessage('Preço inválido.').toFloat(),
  body('categoryId').notEmpty().withMessage('Categoria é obrigatória.').isInt().withMessage('Categoria inválida.').toInt(),
  ...optionalFields,
];

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.'),
  body('price').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Preço inválido.').toFloat(),
  body('categoryId').optional({ values: 'falsy' }).isInt().withMessage('Categoria inválida.').toInt(),
  ...optionalFields,
];

router.get('/featured', getFeatured);
router.get('/', getAll);
router.get('/admin/all', authMiddleware, adminOnly, adminGetAll);
router.get('/:slug', getOne);
router.post('/', authMiddleware, adminOnly, createRules, validate, create);
router.put('/:id', authMiddleware, adminOnly, updateRules, validate, update);
router.delete('/:id', authMiddleware, adminOnly, remove);

module.exports = router;
