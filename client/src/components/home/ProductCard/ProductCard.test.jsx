import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';

const PRODUCT = {
  id: 7,
  name: 'Camisa Brasil Home',
  slug: 'camisa-brasil-home',
  price: '149.00',
  originalPrice: '219.00',
  imageUrl: null,
  badge: 'best_seller',
  rating: '4.9',
  reviewCount: 248,
  categoryName: 'Seleção Brasileira',
};

function renderCard(product = PRODUCT) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProductCard product={product} />
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { id: 1 }, isAuthenticated: true, isLoading: false });
    useUiStore.setState({ toasts: [] });
  });

  // B6: o card não levava a lugar nenhum.
  it('o nome é um link para a página do produto', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Camisa Brasil Home' })).toHaveAttribute(
      'href',
      '/produtos/camisa-brasil-home'
    );
  });

  it('coração e carrinho são botões próprios, fora do link', () => {
    renderCard();

    const link = screen.getByRole('link');
    for (const name of ['Adicionar aos favoritos', 'Adicionar ao Carrinho']) {
      expect(link).not.toContainElement(screen.getByRole('button', { name }));
    }
  });

  // Decimal chega como string: `'99.00' > '149.00'` é true em texto.
  it('compara preços como número, não como texto', () => {
    renderCard({ ...PRODUCT, price: '149.00', originalPrice: '99.00' });

    expect(screen.queryByText(/^De /)).not.toBeInTheDocument();
  });

  it('mostra o preço "de" riscado quando é maior, anunciado como "De"', () => {
    renderCard();

    expect(screen.getByText('De')).toHaveClass('sr-only');
  });

  it('a nota vira uma imagem nomeada', () => {
    renderCard();

    expect(screen.getByRole('img', { name: '4,9 de 5 estrelas' })).toBeInTheDocument();
  });

  it('confirma "Adicionado!" quando o item entra no carrinho', async () => {
    const addItem = vi.fn().mockResolvedValue(undefined);
    useCartStore.setState({ addItem });
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao Carrinho' }));

    expect(await screen.findByRole('button', { name: 'Adicionado!' })).toBeDisabled();
    expect(addItem).toHaveBeenCalledWith(7, 1, 'M');
  });

  // Antes o card mostrava "Adicionado!" mesmo quando o hook recusava.
  it('sem login, não finge que adicionou', async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    const addItem = vi.fn();
    useCartStore.setState({ addItem });
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao Carrinho' }));

    // Espera o hook terminar de decidir (o toast é o sinal) antes de conferir o botão.
    await waitFor(() => expect(useUiStore.getState().toasts[0]?.type).toBe('info'));
    expect(screen.queryByRole('button', { name: 'Adicionado!' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar ao Carrinho' })).toBeEnabled();
    expect(addItem).not.toHaveBeenCalled();
  });
});
