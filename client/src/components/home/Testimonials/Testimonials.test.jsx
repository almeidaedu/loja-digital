import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Testimonials from './Testimonials';
import { setSettings } from '../../../test/settings';

const SOCIAL = { stats: null, seedTestimonials: true };

function renderWith(social) {
  setSettings({ social: { ...SOCIAL, ...social } });
  return render(<Testimonials />);
}

describe('Testimonials', () => {
  // As configurações são do lojista: cada cliente do template muda esses
  // valores. A suíte fixa o próprio ponto de partida em vez de depender dos
  // padrões de fábrica.
  beforeEach(() => {
    setSettings({ social: SOCIAL });
  });

  it('é dono da própria seção: âncora do Header e um título só', () => {
    const { container } = render(<Testimonials />);

    expect(container.querySelector('section#prova-social')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  });

  // Regressão do 8b. "98%", "+5.000 avaliações verificadas" e o selo de
  // verificado em depoimento de exemplo eram afirmações sem dado por trás.
  it('sem stats no config, não mostra número nenhum nem selo de verificado', () => {
    const { container } = render(<Testimonials />);

    expect(container).not.toHaveTextContent(/\d+\s*%/);
    expect(container).not.toHaveTextContent(/avalia/i);
    expect(container).not.toHaveTextContent(/verificad/i);
  });

  it('cada depoimento é uma citação com nota e autor', () => {
    render(<Testimonials />);

    const figures = screen.getAllByRole('figure');
    expect(figures.length).toBeGreaterThan(0);
    for (const figure of figures) {
      expect(within(figure).getByRole('img', { name: /de 5 estrelas/ })).toBeInTheDocument();
      expect(figure.querySelector('blockquote')).not.toBeEmptyDOMElement();
      expect(figure.querySelector('figcaption')).not.toBeEmptyDOMElement();
    }
  });

  it('com stats declarado, mostra a nota e o total em pt-BR', () => {
    renderWith({ stats: { rating: 4.8, reviews: 1240 } });

    expect(screen.getByText('4,8')).toBeInTheDocument();
    expect(screen.getByText('1.240 avaliações')).toBeInTheDocument();
  });

  it('com os depoimentos de exemplo desligados, a seção some', () => {
    const { container } = renderWith({ seedTestimonials: false });

    expect(container).toBeEmptyDOMElement();
  });
});
