import { useEffect, useState } from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Tempo restante até `target` (ISO ou qualquer coisa que o `Date` entenda).
 * Devolve `null` sem prazo — ou com prazo inválido — e `ended: true` quando zera,
 * para quem usa poder sumir no segundo em que a oferta acaba.
 *
 * Antes não recebia prazo nenhum: inventava "domingo 23:59" na primeira visita,
 * guardava no `localStorage` e renovava toda semana. Cada visitante via um
 * relógio diferente, e a oferta nunca acabava.
 */
export function useCountdown(target) {
  const targetMs = target ? new Date(target).getTime() : NaN;
  const valid = Number.isFinite(targetMs);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!valid || Date.now() >= targetMs) return undefined;

    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= targetMs) clearInterval(id);
    }, SECOND);
    return () => clearInterval(id);
  }, [valid, targetMs]);

  if (!valid) return null;

  const diff = Math.max(0, targetMs - now);
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
    ended: diff === 0,
  };
}
