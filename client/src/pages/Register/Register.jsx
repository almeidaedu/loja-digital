import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, email, password, confirmPassword } = form;

    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await authService.register({ name, email, password });
      setUser(user);
      await fetchCart();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="register-logo">
          CAMPO <span>CHEIO</span>
        </div>
        <p className="register-title">Criar conta</p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Seu nome"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
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
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar senha</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-input${error === 'As senhas não coincidem.' ? ' error' : ''}`}
              placeholder="Repita a senha"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? <span className="spinner" /> : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="register-footer-link">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
