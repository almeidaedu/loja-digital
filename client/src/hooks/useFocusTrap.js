import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Enquanto ativo: foca o primeiro elemento do container, prende o Tab dentro
// dele e devolve o foco a quem abriu ao fechar. Escape fica com o componente —
// nem toda superfície é dispensável.
export default function useFocusTrap(active, containerRef) {
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    restoreRef.current = document.activeElement;
    const container = containerRef.current;
    (container?.querySelector(FOCUSABLE) ?? container)?.focus();

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const nodes = containerRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus?.();
    };
  }, [active, containerRef]);
}
