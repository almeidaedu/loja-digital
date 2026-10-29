// Regra única de frete e totais do pedido. O checkout do cliente aplica a mesma
// fórmula só para exibir; quem decide o que é cobrado é esta.

// Em centavos inteiros: somar reais em ponto flutuante deixa resíduo
// (0.1 + 0.2 !== 0.3), e aqui o resíduo vira cobrança.
const toCents = (value) => Math.round(Number(value) * 100);

function computeShippingCents(subtotalCents, { freeThreshold, standardCost }) {
  return subtotalCents >= toCents(freeThreshold) ? 0 : toCents(standardCost);
}

// `items`: [{ unitPrice, quantity }] — unitPrice pode vir como Decimal do Prisma.
function computeOrderTotals(items, shippingSettings) {
  const subtotalCents = items.reduce((sum, i) => sum + toCents(i.unitPrice) * i.quantity, 0);
  const shippingCents = computeShippingCents(subtotalCents, shippingSettings);

  return {
    subtotal: subtotalCents / 100,
    shippingCost: shippingCents / 100,
    totalAmount: (subtotalCents + shippingCents) / 100,
  };
}

module.exports = { computeOrderTotals };
