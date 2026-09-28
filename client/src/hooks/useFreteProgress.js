import { useCartStore } from '../store/cartStore';
import { storeConfig } from '../config/storeConfig';

// Progresso rumo ao frete grátis. CartDrawer e FreteBar cravavam o mesmo 149 e
// refaziam a conta cada um do seu jeito — agora o número vem do storeConfig e a
// conta mora aqui.
export default function useFreteProgress() {
  const items = useCartStore((s) => s.items);
  const threshold = storeConfig.shipping.freeThreshold;

  const total = items.reduce((sum, i) => sum + (Number.parseFloat(i.price) || 0) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    total,
    count,
    threshold,
    remaining: Math.max(0, threshold - total),
    fillPct: Math.min(100, (total / threshold) * 100),
    unlocked: total >= threshold,
  };
}
