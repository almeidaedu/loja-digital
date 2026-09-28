import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
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
      <div className={`chrome${scrolled ? ' chrome--scrolled' : ''}`}>
        <FreteBar />
        <Header />
      </div>

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
