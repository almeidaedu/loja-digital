import { useCallback, useState } from 'react';
import { useExitIntent } from '../../../hooks/useExitIntent';
import { useUiStore } from '../../../store/uiStore';
import { storeConfig } from '../../../config/storeConfig';
import Modal from '../../ui/Modal/Modal';
import { GiftIcon } from '../../ui/Icons';
import './ExitPopup.css';

const { discount } = storeConfig.leadCapture;

export default function ExitPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const addToast = useUiStore((s) => s.addToast);

  const handleExit = useCallback(() => setVisible(true), []);
  useExitIntent(handleExit);

  const close = () => setVisible(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    addToast({ type: 'success', message: `Seu cupom de ${discount} foi enviado para o seu e-mail!` });
    setVisible(false);
    setEmail('');
  };

  return (
    <Modal
      open={visible}
      onClose={close}
      className="popup"
      title={
        <>
          Espera! <span className="popup-accent">{discount}</span>
        </>
      }
      description="Antes de sair, pegue seu desconto exclusivo. Insira seu e-mail e receba o cupom na hora."
    >
      <span className="popup-tag">
        <GiftIcon sx={{ fontSize: '14px' }} /> Oferta Exclusiva
      </span>

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
          Quero {discount}
        </button>
      </form>

      <button type="button" className="popup-skip" onClick={close}>
        Não, prefiro pagar mais caro
      </button>
    </Modal>
  );
}
