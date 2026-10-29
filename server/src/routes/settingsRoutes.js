const express = require('express');
const { body, validationResult } = require('express-validator');
const { show, update } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

// Como nas outras rotas, mas devolvendo também o campo: o painel marca o input
// certo em vez de só mostrar a mensagem.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [first] = errors.array();
    return res.status(422).json({ message: first.msg, field: first.path });
  }
  next();
}

const hasStats = (_value, { req }) => req.body.social?.stats != null;

// PUT substitui o objeto inteiro, então todo campo é obrigatório. Formato e
// padrões: `config/storeDefaults.js`.
const settingsRules = [
  body('brand.name').isString().trim().isLength({ min: 1, max: 60 })
    .withMessage('Nome da loja: de 1 a 60 caracteres.'),
  body('brand.nameParts').isArray({ min: 2, max: 2 })
    .withMessage('O logo tem exatamente duas partes.'),
  body('brand.nameParts.*').isString().trim().isLength({ min: 1, max: 30 })
    .withMessage('Cada parte do logo: de 1 a 30 caracteres.'),

  body('contact.whatsapp').isString().trim().matches(/^\d{10,13}$/)
    .withMessage('WhatsApp: só números, com DDI e DDD (10 a 13 dígitos).'),

  body('shipping.freeThreshold').isFloat({ min: 0, max: 100000 })
    .withMessage('Frete grátis a partir de: valor inválido.').toFloat(),
  body('shipping.standardCost').isFloat({ min: 0, max: 10000 })
    .withMessage('Valor do frete inválido.').toFloat(),

  body('promo.enabled').isBoolean().withMessage('Promoção: ligado ou desligado.').toBoolean(),
  body('promo.tag').isString().trim().isLength({ max: 30 })
    .withMessage('Etiqueta da promoção: até 30 caracteres.'),
  body('promo.title').isString().trim().isLength({ max: 60 })
    .withMessage('Título da promoção: até 60 caracteres.')
    .custom((title, { req }) => !req.body.promo?.enabled || title.length > 0)
    .withMessage('Promoção ligada precisa de título.'),
  body('promo.subtitle').isString().trim().isLength({ max: 120 })
    .withMessage('Subtítulo da promoção: até 120 caracteres.'),
  body('promo.endsAt').optional({ values: 'null' }).isISO8601({ strict: true })
    .withMessage('Data de término da promoção inválida.'),

  body('leadCapture.enabled').isBoolean().withMessage('Popup: ligado ou desligado.').toBoolean(),
  body('leadCapture.discount').isString().trim().isLength({ min: 1, max: 20 })
    .withMessage('Desconto do popup: de 1 a 20 caracteres.'),

  body('social.stats').custom((stats) => stats === null || (typeof stats === 'object' && !Array.isArray(stats)))
    .withMessage('Nota e avaliações inválidas.'),
  body('social.stats.rating').if(hasStats).isFloat({ min: 0, max: 5 })
    .withMessage('Nota média: de 0 a 5.').toFloat(),
  body('social.stats.reviews').if(hasStats).isInt({ min: 0 })
    .withMessage('Total de avaliações: número inteiro.').toInt(),
  body('social.seedTestimonials').isBoolean()
    .withMessage('Depoimentos de exemplo: ligado ou desligado.').toBoolean(),
];

// Público: nada aqui é segredo, e a loja inteira depende disso no boot.
router.get('/settings', show);
router.put('/admin/settings', authMiddleware, adminOnly, settingsRules, validate, update);

module.exports = router;
