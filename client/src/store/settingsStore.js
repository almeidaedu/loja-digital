import { create } from 'zustand';
import { settingsService } from '../services/settingsService';

/**
 * Configurações da loja (marca, contato, frete, promo, popup, prova social).
 * A fonte é o banco, editável em /admin/configuracoes. O App só renderiza a loja
 * com `status: 'ready'`, então dentro da árvore `settings` nunca é null.
 *
 * Valores padrão e formato: `server/src/config/storeDefaults.js`.
 */
export const useSettingsStore = create((set) => ({
  settings: null,
  status: 'idle', // idle | loading | ready | error

  load: async () => {
    set({ status: 'loading' });
    try {
      const { settings } = await settingsService.get();
      set({ settings, status: 'ready' });
    } catch {
      set({ status: 'error' });
    }
  },

  // Propaga o erro: quem salva (o painel) precisa do 422 com o campo inválido.
  save: async (settings) => {
    const { settings: saved } = await settingsService.update(settings);
    set({ settings: saved });
    return saved;
  },
}));
