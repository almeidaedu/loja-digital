import { useId } from 'react';
import './Switch.css';

// Liga/desliga. Checkbox com `.form-input` ficava errado, e um checkbox estilizado
// esconde o estado; `role="switch"` + `aria-checked` diz "ligado/desligado" ao
// leitor de tela. É um <button>: Espaço e Enter já funcionam, e o <label> com
// `htmlFor` o aciona porque botão é elemento rotulável.
export default function Switch({ label, hint, checked, onChange, id, disabled = false }) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const hintId = `${switchId}-hint`;

  return (
    <div className="switch-field">
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        className={`switch${checked ? ' switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" aria-hidden="true" />
      </button>
      <div className="switch-text">
        <label htmlFor={switchId} className="switch-label">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="form-hint">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
