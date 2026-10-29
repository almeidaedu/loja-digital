import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FAQ from './FAQ';

const FIRST = 'Qual é o prazo de entrega?';
const SECOND = 'Os produtos são originais?';

describe('FAQ', () => {
  it('é dono da âncora que o Header e o Footer usam', () => {
    const { container } = render(<FAQ />);

    expect(container.querySelector('section#faq')).toBeInTheDocument();
  });

  it('começa fechado, sem resposta no DOM', () => {
    render(<FAQ />);

    expect(screen.getByRole('button', { name: FIRST })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  // A resposta é uma região nomeada pela pergunta, e o botão aponta para ela.
  it('abre a resposta ligada à pergunta', () => {
    render(<FAQ />);
    const question = screen.getByRole('button', { name: FIRST });

    fireEvent.click(question);

    const answer = screen.getByRole('region', { name: FIRST });
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(question).toHaveAttribute('aria-controls', answer.id);
    expect(answer).toHaveTextContent(/despachados no mesmo dia útil/);
  });

  it('uma aberta por vez', async () => {
    render(<FAQ />);

    fireEvent.click(screen.getByRole('button', { name: FIRST }));
    fireEvent.click(screen.getByRole('button', { name: SECOND }));

    expect(screen.getByRole('button', { name: FIRST })).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.getAllByRole('region')).toHaveLength(1));
    expect(screen.getByRole('region', { name: SECOND })).toBeInTheDocument();
  });

  it('clicar de novo fecha', async () => {
    render(<FAQ />);
    const question = screen.getByRole('button', { name: FIRST });

    fireEvent.click(question);
    fireEvent.click(question);

    expect(question).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument());
  });
});
