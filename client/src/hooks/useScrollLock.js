import { useEffect } from 'react';

// Trava o scroll do body enquanto um overlay está aberto e compensa a largura
// da scrollbar para a página não pular. Conta travas aninhadas (modal sobre
// drawer): só devolve o scroll quando a última fecha.
let lockCount = 0;
let previous = null;

export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    if (lockCount === 0) {
      const { body } = document;
      const gap = window.innerWidth - document.documentElement.clientWidth;
      previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
      body.style.overflow = 'hidden';
      if (gap > 0) body.style.paddingRight = `${gap}px`;
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0 && previous) {
        document.body.style.overflow = previous.overflow;
        document.body.style.paddingRight = previous.paddingRight;
        previous = null;
      }
    };
  }, [active]);
}
