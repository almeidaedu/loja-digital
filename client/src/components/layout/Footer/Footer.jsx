import { Link } from 'react-router-dom';
import './Footer.css';

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/produtos', label: 'Categorias' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/#avaliacoes', label: 'Avaliações' },
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
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              CAMPO <span>CHEIO</span>
            </Link>
            <p>
              O melhor do futebol ao alcance de todos. Camisas, chuteiras e
              acessórios com qualidade e estilo para quem vive o esporte.
            </p>
            <a
              href="https://wa.me/5511999999999"
              className="footer-wpp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Navegação */}
          <div className="footer-col">
            <p className="footer-col-title">Navegação</p>
            <ul className="footer-links">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
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
            © {new Date().getFullYear()} Campo Cheio. Todos os direitos reservados.
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
