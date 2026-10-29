import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest não isola o DOM entre testes do mesmo arquivo; sem isto o segundo
// `render` encontra a árvore do primeiro ainda montada e as queries ficam
// ambíguas.
afterEach(cleanup);

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
