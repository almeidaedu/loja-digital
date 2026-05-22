import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { PackageIcon } from '../../components/ui/Icons';
import './Account.css';

const ROLE_LABELS = { admin: 'Admin', user: 'Cliente' };

export default function Account() {
  const user = useAuthStore((s) => s.user);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setSuccess('Senha alterada com sucesso!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="account-page">
      <div className="container">
        <h1 className="account-title">MINHA CONTA</h1>

        <div className="account-grid">
          {/* Profile card */}
          <div className="account-card">
            <div className="account-avatar">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <h2 className="account-name">{user?.name}</h2>
            <p className="account-email">{user?.email}</p>
            {user?.role && (
              <span className="account-role-badge">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            )}

            <Link to="/meus-pedidos" className="btn-ghost account-orders-link">
              <PackageIcon sx={{ fontSize: '16px' }} /> Ver Meus Pedidos
            </Link>
          </div>

          {/* Password change */}
          <div className="account-card">
            <h3 className="account-section-title">Alterar Senha</h3>
            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Senha atual</label>
                <input
                  name="currentPassword"
                  type="password"
                  className="form-input"
                  placeholder="Sua senha atual"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Nova senha</label>
                <input
                  name="newPassword"
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Confirmar nova senha</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className={`form-input${error === 'As novas senhas não coincidem.' ? ' error' : ''}`}
                  placeholder="Repita a nova senha"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
              {success && <p className="account-success-msg">{success}</p>}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '13px' }}
              >
                {loading ? <span className="spinner" /> : 'SALVAR SENHA'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
