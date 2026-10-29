import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';
import './PaymentFailure.css';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const whatsapp = useSettingsStore((s) => s.settings.contact.whatsapp);
  const brandName = useSettingsStore((s) => s.settings.brand.name);

  const whatsappMsg = encodeURIComponent(
    `Olá! Tive um problema no pagamento na loja ${brandName} e preciso de ajuda.`
  );

  return (
    <div className="failure-page">
      <div className="failure-box">
        <div className="failure-icon">✕</div>

        <h1 className="failure-title">PAGAMENTO NÃO APROVADO</h1>
        <p className="failure-sub">
          Infelizmente seu pagamento não foi aprovado. Isso pode acontecer por saldo
          insuficiente, dados incorretos ou recusa do emissor do cartão.
        </p>

        <ul className="failure-tips">
          <li>Verifique os dados do cartão e tente novamente</li>
          <li>Use outro cartão ou método de pagamento</li>
          <li>Confira se há limite disponível</li>
        </ul>

        <div className="failure-actions">
          <button
            className="btn-primary"
            onClick={() => navigate(-1)}
          >
            Tentar Novamente
          </button>
          <a
            href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            💬 Falar com Suporte
          </a>
        </div>
      </div>
    </div>
  );
}
