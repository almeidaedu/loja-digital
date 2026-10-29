import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { setSettings } from '../../../test/settings';
import Header from './Header';

function LocationProbe() {
  const { pathname, hash } = useLocation();
  return <output>{`${pathname}${hash}`}</output>;
}

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe('Header com os depoimentos ligados', () => {
  it('"Avaliações" fica habilitado', () => {
    renderAt('/');

    expect(screen.getByRole('button', { name: 'Avaliações' })).toBeEnabled();
  });
});

describe('Header com os depoimentos desligados', () => {
  beforeEach(() => {
    setSettings({ social: { seedTestimonials: false } });
  });

  it('"Avaliações" fica no menu, mas desabilitado', () => {
    renderAt('/');

    expect(screen.getByRole('button', { name: 'Avaliações' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'FAQ' })).toBeEnabled();
  });

  // O bug relatado: de outra página, o clique levava para `/#prova-social`, uma
  // âncora que não existe — na prática, um redirecionamento mudo para a Home.
  it('o clique não navega', () => {
    renderAt('/produtos');

    fireEvent.click(screen.getByRole('button', { name: 'Avaliações' }));

    expect(screen.getByRole('status')).toHaveTextContent('/produtos');
  });

  it('não ganha a pill mesmo com o hash na URL', () => {
    renderAt('/#prova-social');

    expect(screen.getByRole('button', { name: 'Avaliações' })).not.toHaveAttribute('aria-current');
  });
});
