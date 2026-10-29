import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';

// Mesma conta do servidor (`server/src/services/shipping.js`): em centavos
// inteiros. Em ponto flutuante, um carrinho exatamente no limite podia aparecer
// aqui como "falta R$ 0,00" enquanto o servidor liberava o frete, ou o contrário.
const toCents = (value) => Math.round((Number.parseFloat(value) || 0) * 100);

// Progresso rumo ao frete grátis, e a única conta de frete do cliente: FreteBar,
// CartDrawer e Checkout leem daqui. Quem cobra é o servidor; isto só exibe.
export default function useFreteProgress() {
  const items = useCartStore((s) => s.items);
  const { freeThreshold, standardCost } = useSettingsStore((s) => s.settings.shipping);

  const totalCents = items.reduce((sum, i) => sum + toCents(i.price) * i.quantity, 0);
  const thresholdCents = toCents(freeThreshold);
  const unlocked = totalCents >= thresholdCents;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    total: totalCents / 100,
    count,
    threshold: freeThreshold,
    remaining: Math.max(0, thresholdCents - totalCents) / 100,
    // Limite 0 (frete sempre grátis) dividiria 0 por 0.
    fillPct: thresholdCents === 0 ? 100 : Math.min(100, (totalCents / thresholdCents) * 100),
    unlocked,
    shippingCost: unlocked ? 0 : standardCost,
  };
}
