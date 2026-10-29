import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import UrgencyBanner from './UrgencyBanner';
import { setSettings } from '../../../test/settings';

const NOW = new Date('2026-11-01T12:00:00Z').getTime();

// Valores fixados pelo teste, não os padrões de fábrica (G-12).
const PROMO = {
  enabled: true,
  tag: 'Oferta',
  title: 'Leve 3, pague 2',
  subtitle: 'Só esta semana',
  endsAt: null,
};

function renderWith(promo) {
  setSettings({ promo: { ...PROMO, ...promo } });
  return render(<UrgencyBanner />);
}

describe('UrgencyBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('desligada no config, não aparece', () => {
    const { container } = renderWith({ enabled: false });

    expect(container).toBeEmptyDOMElement();
  });

  it('ligada mas sem título, também não', () => {
    const { container } = renderWith({ title: '' });

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra tag, título e subtítulo do config', () => {
    renderWith({});

    expect(screen.getByRole('heading', { name: 'Leve 3, pague 2' })).toBeInTheDocument();
    expect(screen.getByText('Oferta')).toBeInTheDocument();
    expect(screen.getByText('Só esta semana')).toBeInTheDocument();
  });

  // Regressão: o contador antigo aparecia sempre, com prazo inventado.
  it('sem prazo, não tem contador', () => {
    renderWith({});

    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('com prazo, mostra o contador com dias', () => {
    renderWith({ endsAt: new Date(NOW + 3 * 86400000).toISOString() });

    const timer = screen.getByRole('timer');
    expect(timer).toHaveTextContent('3Dias');
  });

  it('prazo já vencido: some', () => {
    const { container } = renderWith({ endsAt: new Date(NOW - 1000).toISOString() });

    expect(container).toBeEmptyDOMElement();
  });

  it('some sozinho no segundo em que o prazo passa', () => {
    const { container } = renderWith({ endsAt: new Date(NOW + 1000).toISOString() });
    expect(screen.getByRole('timer')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));

    expect(container).toBeEmptyDOMElement();
  });
});
