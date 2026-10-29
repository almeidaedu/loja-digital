import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Categories from './Categories';
import { categoryService } from '../../../services/categoryService';

vi.mock('../../../services/categoryService', () => ({
  categoryService: { getAll: vi.fn() },
}));

function category(slug, product_count = 3) {
  return { slug, name: slug.toUpperCase(), product_count };
}

function renderCategories() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Categories />
    </MemoryRouter>
  );
}

describe('Categories', () => {
  beforeEach(() => {
    categoryService.getAll.mockReset();
  });

  it('mostra o skeleton enquanto carrega, sem link nenhum', () => {
    categoryService.getAll.mockReturnValue(new Promise(() => {}));
    const { container } = renderCategories();

    expect(container.querySelectorAll('.category-card--skeleton')).toHaveLength(6);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  // Era um <button> com navigate(): sem href, sem abrir em nova aba, e o slug
  // ia cru para a query string.
  it('cada categoria é um link para a listagem filtrada', async () => {
    categoryService.getAll.mockResolvedValue({ categories: [category('sao paulo&fc')] });
    renderCategories();

    const link = await screen.findByRole('link', { name: /SAO PAULO&FC/ });
    expect(link).toHaveAttribute('href', '/produtos?category=sao%20paulo%26fc');
  });

  it('flexiona a contagem', async () => {
    categoryService.getAll.mockResolvedValue({
      categories: [category('um', 1), category('varios', 4)],
    });
    renderCategories();

    expect(await screen.findByText('1 produto')).toBeInTheDocument();
    expect(screen.getByText('4 produtos')).toBeInTheDocument();
  });

  it('esconde categoria sem produto e corta em seis', async () => {
    categoryService.getAll.mockResolvedValue({
      categories: [category('vazia', 0), ...['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((s) => category(s))],
    });
    renderCategories();

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(6);
    expect(screen.queryByText('VAZIA')).not.toBeInTheDocument();
  });

  // Antes o `.catch(() => {})` da Home deixava o skeleton girando para sempre.
  it('some quando a API falha, em vez de ficar no skeleton', async () => {
    categoryService.getAll.mockRejectedValue(new Error('500'));
    const { container } = renderCategories();

    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
