import { AnimatePresence } from 'motion/react';
import { useUiStore } from '../../../store/uiStore';
import Toast from './Toast';
import './Toast.css';

// A região viva fica sempre no DOM, mesmo vazia: leitor de tela só anuncia o que
// entra numa região que já existia. Montar a região junto com o texto não anuncia nada.
export default function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <ol className="toast-container" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </ol>
  );
}
