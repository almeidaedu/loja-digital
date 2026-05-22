import { useState, useCallback } from 'react';
import { useExitIntent } from '../../../hooks/useExitIntent';
import { useUiStore } from '../../../store/uiStore';
import { GiftIcon } from '../../../components/ui/Icons';
import './ExitPopup.css';

export default function ExitPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const addToast = useUiStore((s) => s.addToast);

  const handleExit = useCallback(() => {
    setVisible(true);
  }, []);

  useExitIntent(handleExit);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    addToast({ type: 'success', message: 'Seu cupom de 10% OFF foi enviado para o seu e-mail!' });
    setVisible(false);
    setEmail('');
  };

  if (!visible) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && setVisible(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div className="modal-box popup-box">
        <button
          className="popup-close"
          onClick={() => setVisible(false)}
          aria-label="Fechar"
          type="button"
        >
          ✕
        </button>

        <span className="popup-tag"><GiftIcon sx={{ fontSize: '14px' }} /> Oferta Exclusiva</span>

        <h2 className="popup-title" id="popup-title">
          Espera!{' '}
          <span>10% OFF</span>
        </h2>

        <p className="popup-subtitle">
          Antes de sair, pegue seu desconto exclusivo. Insira seu e-mail e
          receba o cupom na hora.
        </p>

        <form className="popup-form" onSubmit={handleSubmit}>
          <input
            className="form-input popup-input"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Seu e-mail"
          />
          <button type="submit" className="btn-primary popup-submit">
            Quero 10% OFF
          </button>
        </form>

        <span
          className="popup-skip"
          onClick={() => setVisible(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setVisible(false)}
        >
          Não, prefiro pagar mais caro
        </span>
      </div>
    </div>
  );
}
