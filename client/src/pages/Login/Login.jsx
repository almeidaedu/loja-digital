import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { LockIcon } from '../../components/ui/Icons';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const setUser = useAuthStore((s) => s.setUser);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await authService.login(form);
      setUser(user);
      await fetchCart();
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-secure-banner">
          <LockIcon sx={{ fontSize: '14px' }} /> Área segura
        </div>

        <div className="login-logo">
          CAMPO <span>CHEIO</span>
        </div>
        <p className="login-title">Entrar na sua conta</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input${error ? ' error' : ''}`}
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input${error ? ' error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? <span className="spinner" /> : 'ENTRAR'}
          </button>
        </form>

        <div className="login-footer-link">
          Não tem conta?{' '}
          <Link to="/cadastro">Criar conta grátis</Link>
        </div>
      </div>
    </div>
  );
}
