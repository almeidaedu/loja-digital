import { useState, useEffect } from 'react';

function getTarget() {
  const key = 'cc_countdown_target';
  let stored = localStorage.getItem(key);
  if (!stored) {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const target = new Date(now);
    target.setDate(now.getDate() + daysUntilSunday);
    target.setHours(23, 59, 59, 0);
    stored = target.getTime().toString();
    localStorage.setItem(key, stored);
  }
  return parseInt(stored, 10);
}

export function useCountdown() {
  const target = getTarget();

  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
      m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
