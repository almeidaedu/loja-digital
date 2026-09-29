import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFreteProgress from './useFreteProgress';
import { useCartStore } from '../store/cartStore';
import { storeConfig } from '../config/storeConfig';

const { freeThreshold } = storeConfig.shipping;

function withItems(items) {
  useCartStore.setState({ items });
  return renderHook(() => useFreteProgress()).result.current;
}

describe('useFreteProgress', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('carrinho vazio: falta o limite inteiro e nada preenchido', () => {
    const r = withItems([]);

    expect(r.total).toBe(0);
    expect(r.count).toBe(0);
    expect(r.remaining).toBe(freeThreshold);
    expect(r.fillPct).toBe(0);
    expect(r.unlocked).toBe(false);
  });

  it('soma preço × quantidade de cada item', () => {
    const r = withItems([
      { price: '50.00', quantity: 2 },
      { price: '25.50', quantity: 1 },
    ]);

    expect(r.total).toBeCloseTo(125.5);
    expect(r.count).toBe(3);
  });

  // `price` vem do Prisma como string (Decimal). O `Number.parseFloat` existe
  // por isso — se alguém trocar por `Number(i.price)` sem pensar, um preço
  // formatado quebraria o total em NaN e a barra sumiria.
  it('aceita preço como string, que é como a API devolve', () => {
    expect(withItems([{ price: '99.90', quantity: 1 }]).total).toBeCloseTo(99.9);
  });

  it('libera exatamente no limite, não só acima dele', () => {
    const r = withItems([{ price: String(freeThreshold), quantity: 1 }]);

    expect(r.unlocked).toBe(true);
    expect(r.remaining).toBe(0);
    expect(r.fillPct).toBe(100);
  });

  // A barra tem `overflow: hidden`, mas `fillPct` também alimenta texto e
  // aria — 180% escrito na tela seria absurdo.
  it('não passa de 100% nem deixa remaining negativo acima do limite', () => {
    const r = withItems([{ price: String(freeThreshold * 2), quantity: 1 }]);

    expect(r.fillPct).toBe(100);
    expect(r.remaining).toBe(0);
    expect(r.unlocked).toBe(true);
  });
});
