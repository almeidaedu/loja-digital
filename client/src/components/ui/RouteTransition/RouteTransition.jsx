import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './RouteTransition.css';

export default function RouteTransition() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (prevPathname.current === location.pathname) return;
    prevPathname.current = location.pathname;

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return <div className="route-progress-bar" />;
}
