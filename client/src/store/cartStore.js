import { create } from 'zustand';
import { cartService } from '../services/cartService';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  setItems: (items) => set({ items }),

  // Busca carrinho do servidor (chamado após login)
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { items } = await cartService.getCart();
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1, size = 'M') => {
    try {
      await cartService.addItem({ productId, quantity, size });
      await get().fetchCart(); // Re-sincroniza com o servidor
    } catch (err) {
      throw err;
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      await cartService.updateItem(itemId, quantity);
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
      }));
    } catch (err) {
      throw err;
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
    } catch (err) {
      throw err;
    }
  },

  clear: async () => {
    try {
      await cartService.clearCart();
      set({ items: [] });
    } catch (err) {
      throw err;
    }
  },

  clearLocal: () => set({ items: [] }),
}));
