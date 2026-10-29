import { useEffect, useRef } from 'react';

// Uma vez por sessão do navegador. A chave era `cc_popup_shown` — a sigla do
// primeiro cliente cravada num template que vai para outros.
const SHOWN_KEY = 'exit-popup-shown';
const MOBILE_DELAY_MS = 30000;
const INTERACTION_EVENTS = ['touchstart', 'scroll', 'click'];

export function useExitIntent(onExit) {
  const fired = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_KEY)) return undefined;

    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      sessionStorage.setItem(SHOWN_KEY, '1');
      onExit();
    };

    const handleMouseLeave = (e) => {
      if (e.clientY < 10) fire();
    };

    // Mobile não tem mouse saindo pelo topo: dispara após 30s sem interação.
    const mobileTimer = setTimeout(fire, MOBILE_DELAY_MS);
    const cancelTimer = () => clearTimeout(mobileTimer);

    document.addEventListener('mouseleave', handleMouseLeave);
    INTERACTION_EVENTS.forEach((type) =>
      document.addEventListener(type, cancelTimer, { once: true })
    );

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      // `once` só remove o listener que chegou a disparar. Os outros ficavam
      // pendurados no document depois do unmount.
      INTERACTION_EVENTS.forEach((type) => document.removeEventListener(type, cancelTimer));
      clearTimeout(mobileTimer);
    };
  }, [onExit]);
}
