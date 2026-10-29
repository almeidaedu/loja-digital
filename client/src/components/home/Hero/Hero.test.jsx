import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { formatCurrency } from '../../../utils/formatCurrency';
import { setSettings } from '../../../test/settings';

describe('Hero', () => {
  // Valores fixados pelo teste, não os padrões de fábrica (G-12).
  beforeEach(() => {
    setSettings({ social: { stats: null } });
  });

  // Regressão da Fase 9: "+12.000 pedidos entregues", "4.9 / 5.0" e "+500
  // vendidos essa semana" estavam cravados no JSX.
  it('sem stats no config, não mostra número de prova social', () => {
    const { container } = render(<Hero />);

    expect(container).not.toHaveTextContent(/pedidos entregues|vendidos|avalia/i);
    expect(container).not.toHaveTextContent(/\d[.,]\d\s*\/\s*5/);
  });

  it('com stats declarado, mostra a nota e o total em pt-BR', () => {
    setSettings({ social: { stats: { rating: 4.7, reviews: 320 } } });
    render(<Hero />);

    expect(screen.getByText('4,7')).toBeInTheDocument();
    expect(screen.getByText(/320 avaliações/)).toBeInTheDocument();
  });

  // O Intl separa "R$" do valor com espaço inquebrável; os dois lados são
  // normalizados para não depender disso.
  it('o limite do frete grátis vem das configurações da loja', () => {
    setSettings({ shipping: { freeThreshold: 199 } });
    render(<Hero />);
    const spaces = (text) => text.replace(/\s+/g, ' ');

    const pill = screen.getByText(/Frete grátis acima de/);
    expect(spaces(pill.textContent)).toContain(
      spaces(`Frete grátis acima de ${formatCurrency(199)}`)
    );
  });

  it('o CTA é um link para a vitrine', () => {
    render(<Hero />);

    expect(screen.getByRole('link', { name: 'Ver Coleção Agora' })).toHaveAttribute(
      'href',
      '#produtos'
    );
  });

  it('não tem <svg> desenhado à mão nem marca de terceiro', () => {
    const { container } = render(<Hero />);

    // Os ícones do MUI também são <svg>, mas com `data-testid` próprio.
    const handDrawn = [...container.querySelectorAll('svg')].filter(
      (svg) => !svg.hasAttribute('data-testid')
    );
    expect(handDrawn).toHaveLength(0);
    expect(container).not.toHaveTextContent('CBF');
  });
});
