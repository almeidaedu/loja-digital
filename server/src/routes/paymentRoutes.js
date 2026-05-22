const express = require('express');
const { createPreference, createPix, getStatus, webhook } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Webhook não usa authMiddleware (chamado pelo MP, não pelo usuário)
// Body já é express.raw() — veja app.js
router.post('/webhook', webhook);

router.use(authMiddleware);
router.post('/preference', createPreference);
router.post('/pix', createPix);
router.get('/status/:paymentId', getStatus);

module.exports = router;
