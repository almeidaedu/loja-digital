const crypto = require('crypto');

/**
 * Verifica a assinatura HMAC-SHA256 enviada pelo Mercado Pago no header x-signature.
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 *
 * @param {string} xSignature  - Valor do header x-signature (ex: "ts=...;v1=...")
 * @param {string} xRequestId  - Valor do header x-request-id
 * @param {string} dataId      - ID do recurso (ex: payment ID)
 * @returns {boolean}
 */
function verifyMpSignature(xSignature, xRequestId, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(';').map((p) => p.split('='))
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

module.exports = { verifyMpSignature };
