import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import './PaymentPending.css';

const PIX_EXPIRY_SECONDS = 30 * 60; // 30 minutes

export default function PaymentPending() {
  const location = useLocation();
  const navigate = useNavigate();
  const pixData = location.state?.pixData;

  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PIX_EXPIRY_SECONDS);
  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'expired'
  const pollRef = useRef(null);
  const countdownRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!pixData?.paymentId) return;

    pollRef.current = setInterval(async () => {
      try {
        const { status: payStatus } = await paymentService.getStatus(pixData.paymentId);
        if (payStatus === 'approved') {
          clearInterval(pollRef.current);
          clearInterval(countdownRef.current);
          setStatus('approved');
          navigate('/pagamento/sucesso', {
            replace: true,
            search: `?external_reference=${pixData.orderId}`,
          });
        }
      } catch {
        // silent — keep polling
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [pixData, navigate]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pixData?.qrCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  if (!pixData) {
    return (
      <div className="pix-page">
        <p style={{ color: 'var(--text-muted)' }}>Nenhum dado de pagamento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="pix-page">
      <h1 className="pix-title">PAGAMENTO PIX</h1>
      <p className="pix-subtitle">
        Escaneie o QR Code ou copie o código para pagar
      </p>

      {pixData.qrCodeBase64 && (
        <div className="pix-qr">
          <img
            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
            alt="QR Code Pix"
          />
        </div>
      )}

      {pixData.qrCode && (
        <>
          <p className="pix-copy-label">Pix Copia e Cola</p>
          <div className="pix-copy-box">
            <span className="pix-code">{pixData.qrCode}</span>
            <button className="pix-copy-btn" onClick={handleCopy}>
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
        </>
      )}

      <div className="pix-countdown">
        <span className="pix-countdown-label">Expira em</span>
        <span className={`pix-countdown-time${secondsLeft < 300 ? ' pix-countdown-urgent' : ''}`}>
          {minutes}:{seconds}
        </span>
      </div>

      {status === 'pending' && (
        <div className="pix-status">
          <span className="spinner" />
          Aguardando confirmação...
        </div>
      )}

      {status === 'expired' && (
        <div className="pix-expired">
          <p>⏰ QR Code expirado. Por favor, gere um novo pagamento.</p>
          <button
            className="btn-ghost"
            style={{ marginTop: 16 }}
            onClick={() => navigate('/checkout')}
          >
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
