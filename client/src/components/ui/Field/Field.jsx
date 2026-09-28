import { useId } from 'react';

// Label + controle + erro/dica com os ids amarrados. `as` aceita 'input' (padrão),
// 'select' ou 'textarea'; o estilo vive nas classes .form-* do globals.css.
export default function Field({
  label,
  as = 'input',
  id,
  error,
  hint,
  required = false,
  className = '',
  children,
  ...rest
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = [error && errorId, hint && !error && hintId]
    .filter(Boolean)
    .join(' ');

  const controlProps = {
    id: fieldId,
    className: `form-input${error ? ' error' : ''}`,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    ...rest,
  };

  const Control = as;

  return (
    <div className={`form-group${className ? ` ${className}` : ''}`}>
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}

      {as === 'input' ? (
        <Control {...controlProps} />
      ) : (
        <Control {...controlProps}>{children}</Control>
      )}

      {hint && !error && <p id={hintId} className="form-hint">{hint}</p>}
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
    </div>
  );
}
