import { create } from 'zustand';

let toastId = 0;

export const useUiStore = create((set) => ({
  cartOpen: false,
  toasts: [],

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  addToast: (msg) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, ...msg }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 5500);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
