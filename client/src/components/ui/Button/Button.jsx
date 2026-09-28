import { Link } from 'react-router-dom';
import './Button.css';

// Um botão só. `to` renderiza <Link>, `href` renderiza <a>, sem nenhum dos dois
// renderiza <button>. Ícone vai como children — o .btn já tem gap.
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--block',
    loading && 'btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="btn-label">{children}</span>
      {loading && <span className="btn-spinner" aria-hidden="true" />}
    </>
  );

  if (to || href) {
    const linkProps = {
      className: classes,
      'aria-disabled': isDisabled || undefined,
      'aria-busy': loading || undefined,
      tabIndex: isDisabled ? -1 : undefined,
      ...rest,
    };

    return to ? (
      <Link to={to} {...linkProps}>{content}</Link>
    ) : (
      <a href={href} {...linkProps}>{content}</a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
