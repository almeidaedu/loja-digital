import { motion, useReducedMotion } from 'motion/react';
import {
  CancelIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  WarningIcon,
} from '../Icons';
import { useUiStore } from '../../../store/uiStore';
import { rise, spring, tween, withReducedMotion } from '../../../styles/motion';

const ICON = {
  success: CheckCircleIcon,
  error: CancelIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

export default function Toast({ id, type = 'info', title, message }) {
  const reduced = useReducedMotion();
  const removeToast = useUiStore((s) => s.removeToast);
  const Icon = ICON[type] ?? ICON.info;

  return (
    <motion.li
      // Erro interrompe o leitor de tela; o resto entra na fila educada do container.
      role={type === 'error' ? 'alert' : undefined}
      className={`toast toast--${type}`}
      layout={!reduced}
      variants={withReducedMotion(rise, reduced)}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={reduced ? tween.fast : spring.snappy}
    >
      <Icon
        className="toast-icon"
        // Cor via sx: o emotion do MUI entra no head depois do nosso CSS e ganharia o empate
        sx={{ fontSize: '1.25rem', color: 'var(--tone)' }}
        aria-hidden="true"
      />

      <div className="toast-text">
        {title && <p className="toast-title">{title}</p>}
        {message && <p className="toast-message">{message}</p>}
      </div>

      <button
        type="button"
        className="toast-dismiss"
        onClick={() => removeToast(id)}
        aria-label="Fechar aviso"
      >
        <CloseIcon sx={{ fontSize: '1rem' }} />
      </button>
    </motion.li>
  );
}
