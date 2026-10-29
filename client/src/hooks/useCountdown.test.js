import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

const NOW = new Date('2026-11-01T12:00:00Z').getTime();

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sem prazo, não há contador', () => {
    expect(renderHook(() => useCountdown(null)).result.current).toBeNull();
  });

  it('prazo inválido também não', () => {
    expect(renderHook(() => useCountdown('domingo')).result.current).toBeNull();
  });

  it('separa dias, horas, minutos e segundos', () => {
    const target = NOW + 2 * 86400000 + 3 * 3600000 + 4 * 60000 + 5000;
    const { result } = renderHook(() => useCountdown(new Date(target).toISOString()));

    expect(result.current).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5, ended: false });
  });

  it('conta a cada segundo e marca o fim ao zerar', () => {
    const { result } = renderHook(() => useCountdown(new Date(NOW + 2000).toISOString()));

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.seconds).toBe(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.ended).toBe(true);
  });

  // Regressão: o hook antigo ignorava prazo, gravava "domingo 23:59" no
  // localStorage na primeira visita e renovava toda semana.
  it('não inventa prazo nem toca no localStorage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    renderHook(() => useCountdown(null));

    expect(setItem).not.toHaveBeenCalled();
  });
});
