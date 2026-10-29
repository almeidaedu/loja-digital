import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rating from './Rating';

const stars = (container) =>
  [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('data-testid'));

describe('Rating', () => {
  it('é uma imagem nomeada pela nota, em pt-BR', () => {
    render(<Rating value={4.6} />);

    expect(screen.getByRole('img', { name: '4,6 de 5 estrelas' })).toBeInTheDocument();
  });

  it('arredonda para a meia estrela mais próxima', () => {
    const { container } = render(<Rating value={4.3} />);

    expect(stars(container)).toEqual(['StarIcon', 'StarIcon', 'StarIcon', 'StarIcon', 'StarHalfIcon']);
  });

  it('nota inteira não ganha meia estrela', () => {
    const { container } = render(<Rating value={4.2} />);

    expect(stars(container)).toEqual(['StarIcon', 'StarIcon', 'StarIcon', 'StarIcon', 'StarBorderIcon']);
  });

  // Decimal do Prisma chega como string; nota fora da faixa não quebra o desenho.
  it('aceita string e limita a 0–5', () => {
    render(<Rating value="7" />);
    expect(screen.getByRole('img', { name: '5,0 de 5 estrelas' })).toBeInTheDocument();
  });
});
