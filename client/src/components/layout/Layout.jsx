import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import FreteBar from './FreteBar/FreteBar';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { WhatsAppIcon } from '../ui/Icons';
import { storeConfig } from '../../config/storeConfig';
import './Layout.css';

export default function Layout() {
  // A elevação é do chrome inteiro, não do header — por isso o estado mora aqui.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* `layoutScroll`: o chrome é `position: fixed`, e é essa prop que faz o motion
          testá-lo como scroll root (`checkIsScrollRoot` = `position === 'fixed'`). Sem
          ela, `measurePageBox` soma o `scrollY` da página na medição da pill do header
          — e como a altura do documento muda ao trocar de rota, o scroll é clampado
          entre o snapshot e a medição. Esse delta é a pill "vindo de baixo". */}
      <motion.div layoutScroll className={`chrome${scrolled ? ' chrome--scrolled' : ''}`}>
        <FreteBar />
        <Header />
      </motion.div>

      <main className="layout-main">
        <Outlet />
      </main>

      <Footer />

      <a
        href={`https://wa.me/${storeConfig.contact.whatsapp}`}
        className="wpp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <WhatsAppIcon sx={{ fontSize: '1.25rem' }} />
        <span className="wpp-label">Fale Conosco</span>
      </a>
    </>
  );
}
