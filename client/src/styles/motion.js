// Curvas e variantes compartilhadas. Spring para gesto, entrada e saída;
// hover e press continuam em CSS transition. Só transform e opacity.

export const spring = {
  gentle: { type: 'spring', stiffness: 260, damping: 30 },
  snappy: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
  sheet: { type: 'spring', stiffness: 340, damping: 38 },
};

export const tween = {
  fast: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  base: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const sheetUp = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0 },
};

// Com prefers-reduced-motion o contrato de variantes é o mesmo — some o
// deslocamento, fica o fade. Quem anima chama useReducedMotion() e passa aqui.
export function withReducedMotion(variants, reduced) {
  return reduced ? fade : variants;
}
