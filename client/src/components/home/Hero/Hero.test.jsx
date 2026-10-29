import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { storeConfig } from '../../../config/storeConfig';
import { formatCurrency } from '../../../utils/formatCurrency';

const originalSocial = { ...storeConfig.social };

describe('Hero', () => {
  // Valores fixados pelo teste, não lidos do arquivo (G-12).
  beforeEach(() => {
    Object.assign(storeConfig.social, { stats: null });
  });

  afterEach(() => {
    Object.assign(storeConfig.social, originalSocial);
  });

  // Regressão da Fase 9: "+12.000 pedidos entregues", "4.9 / 5.0" e "+500
  // vendidos essa semana" estavam cravados no JSX.
  it('sem stats no config, não mostra número de prova social', () => {
    const { container } = render(<Hero />);

    expect(container).not.toHaveTextContent(/pedidos entregues|vendidos|avalia/i);
    expect(container).not.toHaveTextContent(/\d[.,]\d\s*\/\s*5/);
  });

  it('com stats declarado, mostra a nota e o total em pt-BR', () => {
    Object.assign(storeConfig.social, { stats: { rating: 4.7, reviews: 320 } });
    render(<Hero />);

    expect(screen.getByText('4,7')).toBeInTheDocument();
    expect(screen.getByText(/320 avaliações/)).toBeInTheDocument();
  });

  // O Intl separa "R$" do valor com espaço inquebrável; os dois lados são
  // normalizados para não depender disso.
  it('o limite do frete grátis vem do storeConfig', () => {
    render(<Hero />);
    const spaces = (text) => text.replace(/\s+/g, ' ');

    const pill = screen.getByText(/Frete grátis acima de/);
    expect(spaces(pill.textContent)).toContain(
      spaces(`Frete grátis acima de ${formatCurrency(storeConfig.shipping.freeThreshold)}`)
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
