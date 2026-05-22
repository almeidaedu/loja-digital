const { Preference, Payment } = require('mercadopago');
const mpClient = require('../config/mercadopago');
const prisma = require('../config/database');
const { verifyMpSignature } = require('../utils/mpSignatureVerify');

async function createPreference(req, res, next) {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    });

    if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const preference = new Preference(mpClient);
    const response = await preference.create({
      body: {
        items: order.items.map((i) => ({
          title: i.productName,
          unit_price: parseFloat(i.unitPrice),
          quantity: i.quantity,
          currency_id: 'BRL',
          picture_url: i.productImage || undefined,
        })),
        payer: { name: order.user.name, email: order.user.email },
        back_urls: {
          success: `${process.env.CLIENT_URL}/pagamento/sucesso`,
          failure: `${process.env.CLIENT_URL}/pagamento/falha`,
          pending: `${process.env.CLIENT_URL}/pagamento/pendente`,
        },
        auto_return: 'approved',
        external_reference: orderId,
        statement_descriptor: 'CAMPO CHEIO',
        notification_url: `${process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`}/api/payments/webhook`,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { mpPreferenceId: response.id, paymentMethod: 'checkout_pro' },
    });

    res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    });
  } catch (err) {
    next(err);
  }
}

async function createPix(req, res, next) {
  try {
    const { orderId, payerEmail, payerCPF } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
    });

    if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const payment = new Payment(mpClient);
    const response = await payment.create({
      body: {
        transaction_amount: parseFloat(order.totalAmount),
        payment_method_id: 'pix',
        payer: {
          email: payerEmail || req.user.email,
          identification: { type: 'CPF', number: payerCPF.replace(/\D/g, '') },
        },
        external_reference: orderId,
        statement_descriptor: 'CAMPO CHEIO',
      },
    });

    const txData = response.point_of_interaction?.transaction_data;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: String(response.id),
        paymentMethod: 'pix',
        status: 'waiting_payment',
        pixQrCode: txData?.qr_code ?? null,
        pixQrCodeBase64: txData?.qr_code_base64 ?? null,
        pixExpiration: txData?.expiration_date ? new Date(txData.expiration_date) : null,
      },
    });

    res.json({
      paymentId: response.id,
      qrCode: txData?.qr_code,
      qrCodeBase64: txData?.qr_code_base64,
      pixCopyPaste: txData?.qr_code,
      expirationDate: txData?.expiration_date,
      orderId,
    });
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const payment = new Payment(mpClient);
    const response = await payment.get({ id: req.params.paymentId });

    const order = await prisma.order.findFirst({
      where: { paymentId: String(req.params.paymentId) },
      select: { id: true },
    });

    res.json({ status: response.status, orderId: order?.id ?? null });
  } catch (err) {
    next(err);
  }
}

async function webhook(req, res) {
  try {
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];

    let body;
    try {
      body = JSON.parse(req.body.toString('utf8'));
    } catch {
      return res.sendStatus(400);
    }

    const dataId = body?.data?.id;

    if (process.env.MP_WEBHOOK_SECRET && xSignature && xRequestId) {
      const valid = verifyMpSignature(xSignature, xRequestId, String(dataId));
      if (!valid) {
        console.warn('[webhook] Assinatura inválida');
        return res.sendStatus(401);
      }
    }

    if (body.type !== 'payment' || !dataId) return res.sendStatus(200);

    const payment = new Payment(mpClient);
    const mpPayment = await payment.get({ id: dataId });

    const orderId = mpPayment.external_reference;
    if (!orderId) return res.sendStatus(200);

    const statusMap = {
      approved: 'approved',
      rejected: 'rejected',
      cancelled: 'cancelled',
      in_process: 'in_process',
      pending: 'waiting_payment',
      authorized: 'approved',
    };
    const newStatus = statusMap[mpPayment.status] || 'in_process';

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus, paymentId: String(dataId) },
      });

      if (mpPayment.status === 'approved') {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('[webhook] Erro:', err.message);
    res.sendStatus(200);
  }
}

module.exports = { createPreference, createPix, getStatus, webhook };
