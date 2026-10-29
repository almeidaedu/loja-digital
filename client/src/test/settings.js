import { useSettingsStore } from '../store/settingsStore';

// Configurações de teste: os padrões de fábrica do servidor
// (`server/src/config/storeDefaults.js`). Teste que depende de um valor o fixa
// com `setSettings({ ... })` em vez de contar com este (G-12).
const DEFAULTS = {
  brand: { name: 'Campo Cheio', nameParts: ['CAMPO', 'CHEIO'] },
  contact: { whatsapp: '5511999999999' },
  shipping: { freeThreshold: 149, standardCost: 15 },
  promo: { enabled: false, tag: 'Oferta Especial', title: 'Leve 3, pague 2', subtitle: '', endsAt: null },
  leadCapture: { enabled: true, discount: '10% OFF' },
  social: { stats: null, seedTestimonials: true },
};

// Mescla por seção: `{ promo: { enabled: true } }` mantém o resto da promo.
export function makeSettings(overrides = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULTS).map(([section, values]) => [
      section,
      { ...values, ...(overrides[section] ?? {}) },
    ])
  );
}

export function setSettings(overrides) {
  const settings = makeSettings(overrides);
  useSettingsStore.setState({ settings, status: 'ready' });
  return settings;
}
