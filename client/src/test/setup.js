import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest não isola o DOM entre testes do mesmo arquivo; sem isto o segundo
// `render` encontra a árvore do primeiro ainda montada e as queries ficam
// ambíguas.
afterEach(cleanup);

// A loja só renderiza com as configurações carregadas (o App espera a API). Nos
// testes, todo componente começa com os padrões de fábrica.
//
// Import dinâmico de propósito: `settings.js` puxa store → service → api →
// authStore → authService. Importado no topo, esta cadeia carregaria antes dos
// `vi.mock` de cada arquivo de teste, e os mocks não pegariam. Dentro do hook, o
// arquivo de teste já registrou os dele.
beforeEach(async () => {
  const { setSettings } = await import('./settings');
  setSettings();
});

// O jsdom não implementa IntersectionObserver, e o `whileInView` do motion (o
// `ui/Reveal`) quebra no mount sem ele. Stub mudo: nada entra em view, então
// teste nenhum deve afirmar visibilidade de reveal — isso é verificação de
// navegador.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// Também ausente no jsdom; o useScrollRestoration observa a altura da página.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
