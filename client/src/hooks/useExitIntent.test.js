import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, fireEvent } from '@testing-library/react';
import { useExitIntent } from './useExitIntent';

function leaveThroughTop(clientY = 0) {
  fireEvent(document, new MouseEvent('mouseleave', { clientY, bubbles: true }));
}

describe('useExitIntent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dispara quando o mouse sai pelo topo', () => {
    const onExit = vi.fn();
    renderHook(() => useExitIntent(onExit));

    leaveThroughTop();

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('ignora saída pelas laterais ou por baixo', () => {
    const onExit = vi.fn();
    renderHook(() => useExitIntent(onExit));

    leaveThroughTop(400);

    expect(onExit).not.toHaveBeenCalled();
  });

  it('dispara uma vez só, e não volta na mesma sessão', () => {
    const onExit = vi.fn();
    const { unmount } = renderHook(() => useExitIntent(onExit));

    leaveThroughTop();
    leaveThroughTop();
    unmount();

    renderHook(() => useExitIntent(onExit));
    leaveThroughTop();

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('no mobile dispara após 30s parado', () => {
    const onExit = vi.fn();
    renderHook(() => useExitIntent(onExit));

    vi.advanceTimersByTime(30000);

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('qualquer interação cancela o disparo por tempo', () => {
    const onExit = vi.fn();
    renderHook(() => useExitIntent(onExit));

    fireEvent.touchStart(document);
    vi.advanceTimersByTime(30000);

    expect(onExit).not.toHaveBeenCalled();
  });

  // O cleanup removia só o `mouseleave`. Os três listeners de interação, com
  // `once`, só saem sozinhos se chegarem a disparar.
  it('desmontar remove todos os listeners que montou', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useExitIntent(vi.fn()));

    const added = add.mock.calls.map(([type, fn]) => [type, fn]);
    unmount();
    const removed = remove.mock.calls.map(([type, fn]) => [type, fn]);

    expect(added).toHaveLength(4);
    for (const pair of added) expect(removed).toContainEqual(pair);
  });
});
