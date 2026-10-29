import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useSettingsStore } from './store/settingsStore';
import { settingsService } from './services/settingsService';
import { authService } from './services/authService';

vi.mock('./services/settingsService', () => ({
  settingsService: { get: vi.fn(), update: vi.fn() },
}));
vi.mock('./services/authService', () => ({
  authService: { getMe: vi.fn() },
}));

// Só o portão do boot. Com as configurações carregadas a loja inteira monta, e
// isso é verificação de navegador.
describe('App — boot', () => {
  beforeEach(() => {
    useSettingsStore.setState({ settings: null, status: 'idle' });
    authService.getMe.mockReturnValue(new Promise(() => {}));
  });

  it('espera as configurações com um spinner, sem montar a loja', () => {
    settingsService.get.mockReturnValue(new Promise(() => {}));
    render(<App />);

    expect(screen.getByRole('status', { name: 'Carregando a loja' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('se falhar, oferece tentar de novo — e tenta', async () => {
    settingsService.get.mockRejectedValue(new Error('Network Error'));
    render(<App />);

    const retry = await screen.findByRole('button', { name: 'Tentar de novo' });
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar a loja.');

    settingsService.get.mockReturnValue(new Promise(() => {}));
    fireEvent.click(retry);

    expect(await screen.findByRole('status', { name: 'Carregando a loja' })).toBeInTheDocument();
  });
});
