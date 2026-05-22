import { useUiStore } from '../../../store/uiStore';

export default function Toast({ id, avatar, name, message, time }) {
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div
      className="toast"
      role="alert"
      onClick={() => removeToast(id)}
      title="Clique para fechar"
    >
      <div className="toast-avatar" aria-hidden="true">
        {avatar || (name ? name.charAt(0).toUpperCase() : '✓')}
      </div>

      <div className="toast-text">
        {name && <p className="toast-name">{name}</p>}
        {message && <p className="toast-msg">{message}</p>}
      </div>

      {time && <span className="toast-time">{time}</span>}
    </div>
  );
}
