import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFreteProgress from './useFreteProgress';
import { useCartStore } from '../store/cartStore';
import { setSettings } from '../test/settings';

const FREE_THRESHOLD = 149;

function withItems(items) {
  useCartStore.setState({ items });
  return renderHook(() => useFreteProgress()).result.current;
}

describe('useFreteProgress', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    setSettings({ shipping: { freeThreshold: FREE_THRESHOLD } });
  });

  it('carrinho vazio: falta o limite inteiro e nada preenchido', () => {
    const r = withItems([]);

    expect(r.total).toBe(0);
    expect(r.count).toBe(0);
    expect(r.remaining).toBe(FREE_THRESHOLD);
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
    const r = withItems([{ price: String(FREE_THRESHOLD), quantity: 1 }]);

    expect(r.unlocked).toBe(true);
    expect(r.remaining).toBe(0);
    expect(r.fillPct).toBe(100);
  });

  // A barra tem `overflow: hidden`, mas `fillPct` também alimenta texto e
  // aria — 180% escrito na tela seria absurdo.
  it('não passa de 100% nem deixa remaining negativo acima do limite', () => {
    const r = withItems([{ price: String(FREE_THRESHOLD * 2), quantity: 1 }]);

    expect(r.fillPct).toBe(100);
    expect(r.remaining).toBe(0);
    expect(r.unlocked).toBe(true);
  });

  // Em ponto flutuante, 3 × 33.03 = 99.08999… e ficaria abaixo de 99,09; o
  // servidor conta em centavos e liberaria o frete. Os dois têm que concordar.
  it('conta em centavos, como o servidor', () => {
    setSettings({ shipping: { freeThreshold: 99.09, standardCost: 15 } });
    const r = withItems([{ price: '33.03', quantity: 3 }]);

    expect(r.unlocked).toBe(true);
    expect(r.remaining).toBe(0);
    expect(r.shippingCost).toBe(0);
  });

  it('abaixo do limite, o frete é o valor configurado', () => {
    setSettings({ shipping: { freeThreshold: FREE_THRESHOLD, standardCost: 22.5 } });

    expect(withItems([{ price: '10', quantity: 1 }]).shippingCost).toBe(22.5);
  });

  // O painel aceita limite 0: frete sempre grátis. Sem o caso especial, a barra
  // dividiria 0 por 0.
  it('limite 0 é frete sempre grátis, com a barra cheia', () => {
    setSettings({ shipping: { freeThreshold: 0, standardCost: 15 } });
    const r = withItems([]);

    expect(r.unlocked).toBe(true);
    expect(r.fillPct).toBe(100);
    expect(r.shippingCost).toBe(0);
  });
});
