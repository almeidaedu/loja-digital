import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CloseIcon } from '../Icons';
import useScrollLock from '../../../hooks/useScrollLock';
import useFocusTrap from '../../../hooks/useFocusTrap';
import { fade, popIn, spring, tween, withReducedMotion } from '../../../styles/motion';
import './Modal.css';

// Diálogo em portal com scrim, trava de scroll, Escape, foco preso e devolvido.
// Scrim e painel saem juntos pelo AnimatePresence — o backdrop não some antes.
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  dismissible = true,
  className = '',
  children,
}) {
  const reduced = useReducedMotion();
  const dialogRef = useRef(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-desc`;

  useScrollLock(open);
  useFocusTrap(open, dialogRef);

  const dismiss = useCallback(() => {
    if (dismissible) onClose?.();
  }, [dismissible, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, dismiss]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-scrim"
          variants={fade}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={tween.fast}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismiss();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={`modal-panel modal-panel--${size}${className ? ` ${className}` : ''}`}
            variants={withReducedMotion(popIn, reduced)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={reduced ? tween.fast : spring.snappy}
          >
            {(title || onClose) && (
              <header className="modal-header">
                {title && <h2 id={titleId} className="modal-title">{title}</h2>}
                {onClose && (
                  <button
                    type="button"
                    className="modal-dismiss"
                    onClick={onClose}
                    aria-label="Fechar"
                  >
                    <CloseIcon sx={{ fontSize: '1.125rem' }} />
                  </button>
                )}
              </header>
            )}
            {description && (
              <p id={descriptionId} className="modal-description">{description}</p>
            )}
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
