import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true durante o getMe inicial no boot

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  /**
   * Encerra a sessão e recarrega a aplicação em `/`.
   *
   * O recarregamento não é preguiça: dentro do SPA este logout é uma corrida que
   * não dá para vencer por ordem de chamada. `clearUser` é update de store
   * externa (zustand v5 = `useSyncExternalStore`), que o React é obrigado a
   * aplicar de forma síncrona para não haver tearing; já `navigate()` com
   * `v7_startTransition` — ligado no `App.jsx` — entra como transição, que o
   * React pode adiar (`react-router-dom/dist/index.js:640`). Logo existe sempre
   * um render com `isAuthenticated: false` na rota antiga: saindo de `/admin`, o
   * ProtectedRoute captura o destino, manda para `/login?redirect=%2Fadmin`, e o
   * login seguinte devolve o usuário ao painel de onde ele tentou sair.
   *
   * `location.assign` derruba a página inteira, então não há render intermediário
   * para o guard ver — e de quebra nada do usuário anterior (carrinho, caches de
   * página) sobrevive em memória, que é exatamente o que se quer ao sair de uma
   * sessão de admin. Por isso também não é preciso chamar `clearUser` nem
   * `clearLocal` aqui: nada disso sobrevive ao reload.
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // A sessão pode já ter expirado no servidor; o cookie sai no reload de qualquer forma.
    }
    window.location.assign('/');
  },
}));
