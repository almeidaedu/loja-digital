import { create } from 'zustand';
import { cartService } from '../services/cartService';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items) => set({ items }),

  // Busca o carrinho do servidor. Não propaga o erro — é chamada no boot, onde
  // falhar é normal (visitante sem sessão). Devolve se conseguiu sincronizar
  // para quem precisa dessa resposta.
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { items } = await cartService.getCart();
      set({ items, isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err });
      return false;
    }
  },

  addItem: async (productId, quantity = 1, size = 'M') => {
    await cartService.addItem({ productId, quantity, size });

    // A verdade visível do carrinho vem do servidor. Se a re-sincronia falhar,
    // o item está no banco mas a UI não sabe — isso é erro, não sucesso.
    const synced = await get().fetchCart();
    if (!synced) {
      throw new Error('Item adicionado, mas não foi possível atualizar o carrinho. Recarregue a página.');
    }
  },

  updateItem: async (itemId, quantity) => {
    await cartService.updateItem(itemId, quantity);
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    }));
  },

  removeItem: async (itemId) => {
    await cartService.removeItem(itemId);
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
  },

  clear: async () => {
    await cartService.clearCart();
    set({ items: [] });
  },

  clearLocal: () => set({ items: [], error: null }),
}));
