import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: { logout: vi.fn() },
}));

describe('authStore.logout', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { assign: vi.fn() });
    authService.logout.mockResolvedValue(undefined);
    useAuthStore.setState({
      user: { id: 1, name: 'Admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('encerra a sessão no servidor e recarrega em /', async () => {
    await useAuthStore.getState().logout();

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(window.location.assign).toHaveBeenCalledWith('/');
  });

  it('sai mesmo se o servidor recusar — a sessão pode já ter expirado', async () => {
    authService.logout.mockRejectedValue(new Error('401'));

    await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();
    expect(window.location.assign).toHaveBeenCalledWith('/');
  });

  // Regressão do G-07. O bug: limpar a store derruba `isAuthenticated` num
  // render que ainda está na rota antiga, o ProtectedRoute captura o destino e
  // manda para `/login?redirect=%2Fadmin` — e o login seguinte devolve o
  // usuário ao painel de onde ele tentou sair. Não dá para consertar por ordem
  // de chamada: update de store externa é síncrono por contrato e `navigate`
  // com `v7_startTransition` é adiável. Por isso o logout NÃO mexe na store:
  // quem limpa tudo é o reload, e sem render intermediário não há o que o guard
  // capturar. Se alguém "otimizar" isto de volta para `clearUser()` + navigate
  // do router, este teste cai.
  it('não deixa a store deslogada antes da navegação (G-07)', async () => {
    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).not.toBeNull();
  });
});
