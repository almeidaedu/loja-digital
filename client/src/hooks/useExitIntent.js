import { useEffect, useRef } from 'react';

export function useExitIntent(onExit) {
  const fired = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem('cc_popup_shown')) return;

    const handleMouseLeave = (e) => {
      if (e.clientY < 10 && !fired.current) {
        fired.current = true;
        sessionStorage.setItem('cc_popup_shown', '1');
        onExit();
      }
    };

    // Mobile: dispara após 30s sem interação
    const mobileTimer = setTimeout(() => {
      if (!fired.current) {
        fired.current = true;
        sessionStorage.setItem('cc_popup_shown', '1');
        onExit();
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    const cancel = () => clearTimeout(mobileTimer);
    ['touchstart', 'scroll', 'click'].forEach((e) => document.addEventListener(e, cancel, { once: true }));

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [onExit]);
}
