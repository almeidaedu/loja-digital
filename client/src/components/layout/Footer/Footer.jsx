import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../../store/settingsStore';
import { WhatsAppIcon } from '../../ui/Icons';
import './Footer.css';

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/produtos', label: 'Categorias' },
  { to: '/produtos', label: 'Produtos' },
  // Era `/#avaliacoes`, âncora que nunca existiu (a seção é `#prova-social`).
  // Desligada junto com a seção, como no Header.
  { to: '/#prova-social', label: 'Avaliações', needsTestimonials: true },
  { to: '/produtos?oferta=1', label: 'Ofertas' },
];

const ATENDIMENTO_LINKS = [
  { to: '/#faq', label: 'FAQ' },
  { to: '/politica-trocas', label: 'Política de Trocas' },
  { to: '/rastrear-pedido', label: 'Rastrear Pedido' },
  { to: '/fale-conosco', label: 'Fale Conosco' },
];

const INSTITUCIONAL_LINKS = [
  { to: '/sobre', label: 'Sobre Nós' },
  { to: '/privacidade', label: 'Privacidade' },
  { to: '/termos', label: 'Termos' },
  { to: '/revendedor', label: 'Seja Revendedor' },
];

const PAY_BADGES = [
  { label: 'PIX', className: 'pay-badge pix' },
  { label: 'VISA', className: 'pay-badge' },
  { label: 'MASTER', className: 'pay-badge' },
  { label: 'AMEX', className: 'pay-badge' },
  { label: 'BOLETO', className: 'pay-badge' },
  { label: '12x', className: 'pay-badge' },
];

export default function Footer() {
  const brand = useSettingsStore((s) => s.settings.brand);
  const whatsapp = useSettingsStore((s) => s.settings.contact.whatsapp);
  const seedTestimonials = useSettingsStore((s) => s.settings.social.seedTestimonials);

  const [brandPrefix, brandSuffix] = brand.nameParts;

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              {brandPrefix} <span>{brandSuffix}</span>
            </Link>
            <p>
              O melhor do futebol ao alcance de todos. Camisas, chuteiras e
              acessórios com qualidade e estilo para quem vive o esporte.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              className="footer-wpp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon sx={{ fontSize: '16px' }} />
              WhatsApp
            </a>
          </div>

          {/* Navegação */}
          <div className="footer-col">
            <p className="footer-col-title">Navegação</p>
            <ul className="footer-links">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  {l.needsTestimonials && !seedTestimonials ? (
                    <span className="footer-link--disabled" aria-disabled="true">
                      {l.label}
                    </span>
                  ) : (
                    <Link to={l.to}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div className="footer-col">
            <p className="footer-col-title">Atendimento</p>
            <ul className="footer-links">
              {ATENDIMENTO_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div className="footer-col">
            <p className="footer-col-title">Institucional</p>
            <ul className="footer-links">
              {INSTITUCIONAL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
          </p>
          <div className="footer-pay-icons">
            {PAY_BADGES.map((b) => (
              <span key={b.label} className={b.className}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
