import { create } from 'zustand';

// Pilha fixa na tela: mais que isso vira parede. O mais antigo sai para o novo caber.
const MAX_TOASTS = 3;

// Erro fica mais tempo — quem errou precisa ler antes de sumir.
const LIFETIME = { error: 7000, warning: 6000, success: 4500, info: 4500 };

let nextId = 0;
const timers = new Map();

function clearTimer(id) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

export const useUiStore = create((set, get) => ({
  cartOpen: false,
  toasts: [],

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  // { type: 'success' | 'error' | 'warning' | 'info', title?, message, duration? }
  addToast: ({ type = 'info', title, message, duration } = {}) => {
    const id = ++nextId;

    set((s) => {
      const next = [...s.toasts, { id, type, title, message }];
      next.slice(0, Math.max(0, next.length - MAX_TOASTS)).forEach((t) => clearTimer(t.id));
      return { toasts: next.slice(-MAX_TOASTS) };
    });

    timers.set(id, setTimeout(() => get().removeToast(id), duration ?? LIFETIME[type] ?? LIFETIME.info));
    return id;
  },

  removeToast: (id) => {
    clearTimer(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
