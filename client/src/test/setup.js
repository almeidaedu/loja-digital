import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest não isola o DOM entre testes do mesmo arquivo; sem isto o segundo
// `render` encontra a árvore do primeiro ainda montada e as queries ficam
// ambíguas.
afterEach(cleanup);
