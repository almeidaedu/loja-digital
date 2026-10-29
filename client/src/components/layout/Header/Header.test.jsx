import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Header from './Header';

// O NAV_LINKS lê o storeConfig no import, então o config desligado precisa
// estar no lugar antes do módulo carregar.
vi.mock('../../../config/storeConfig', async (importOriginal) => {
  const { storeConfig } = await importOriginal();
  const config = { ...storeConfig, social: { ...storeConfig.social, seedTestimonials: false } };
  return { storeConfig: config, default: config };
});

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

describe('Header com os depoimentos desligados', () => {
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
