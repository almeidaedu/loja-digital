import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import Switch from './Switch';

function Controlled({ initial = false, onChange = () => {} }) {
  const [on, setOn] = useState(initial);
  return (
    <Switch
      label="Banner de promoção"
      hint="Desligado, não aparece."
      checked={on}
      onChange={(next) => {
        setOn(next);
        onChange(next);
      }}
    />
  );
}

describe('Switch', () => {
  it('é um switch nomeado pelo rótulo e descrito pela dica', () => {
    render(<Controlled />);

    const sw = screen.getByRole('switch', { name: 'Banner de promoção' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAccessibleDescription('Desligado, não aparece.');
  });

  it('alterna no clique e avisa o novo valor', () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  // Rótulo grande é alvo grande: clicar no texto também alterna.
  it('clicar no rótulo alterna', () => {
    render(<Controlled initial />);

    fireEvent.click(screen.getByText('Banner de promoção'));

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('desabilitado não alterna', () => {
    const onChange = vi.fn();
    render(<Switch label="X" checked={false} onChange={onChange} disabled />);

    fireEvent.click(screen.getByRole('switch'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
