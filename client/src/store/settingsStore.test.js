import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from './settingsStore';
import { settingsService } from '../services/settingsService';
import { makeSettings } from '../test/settings';

vi.mock('../services/settingsService', () => ({
  settingsService: { get: vi.fn(), update: vi.fn() },
}));

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ settings: null, status: 'idle' });
  });

  it('carrega as configurações da API', async () => {
    const settings = makeSettings();
    settingsService.get.mockResolvedValue({ settings });

    const loading = useSettingsStore.getState().load();
    expect(useSettingsStore.getState().status).toBe('loading');
    await loading;

    expect(useSettingsStore.getState()).toMatchObject({ settings, status: 'ready' });
  });

  it('falha de rede vira status de erro, sem settings', async () => {
    settingsService.get.mockRejectedValue(new Error('Network Error'));

    await useSettingsStore.getState().load();

    expect(useSettingsStore.getState()).toMatchObject({ settings: null, status: 'error' });
  });

  it('salvar troca as configurações pelo que o servidor devolveu', async () => {
    const saved = makeSettings({ shipping: { freeThreshold: 300 } });
    settingsService.update.mockResolvedValue({ settings: saved });

    await useSettingsStore.getState().save(saved);

    expect(useSettingsStore.getState().settings.shipping.freeThreshold).toBe(300);
  });

  // O painel marca o campo inválido a partir do 422; engolir o erro aqui
  // deixaria o formulário achando que salvou.
  it('salvar propaga o erro e não mexe no que estava carregado', async () => {
    const current = makeSettings();
    useSettingsStore.setState({ settings: current, status: 'ready' });
    const error = Object.assign(new Error('422'), {
      response: { status: 422, data: { message: 'Valor do frete inválido.', field: 'shipping.standardCost' } },
    });
    settingsService.update.mockRejectedValue(error);

    await expect(useSettingsStore.getState().save(makeSettings())).rejects.toBe(error);
    expect(useSettingsStore.getState().settings).toBe(current);
  });
});
