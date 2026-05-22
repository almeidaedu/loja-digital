const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Muitas tentativas. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  }
  next();
}

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha obrigatória.'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
