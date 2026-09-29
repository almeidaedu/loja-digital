import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';

const FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

// O Login lê `?redirect=` do `useSearchParams`; aqui basta expor a location
// inteira para a asserção.
function LoginStub() {
  const { pathname, search } = useLocation();
  return <p>{`${pathname}${search}`}</p>;
}

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]} future={FUTURE}>
      <Routes>
        <Route path="/login" element={<LoginStub />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/meus-pedidos" element={<p>pedidos</p>} />
          <Route path="/produtos" element={<p>produtos</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  });

  // Regressão do B8. Era `return null`: dar F5 numa rota protegida deixava o
  // miolo em branco até o `getMe` do boot responder.
  it('espera o boot com um spinner, sem redirecionar (B8)', () => {
    renderAt('/meus-pedidos');

    expect(screen.getByRole('status', { name: 'Verificando sessão' })).toBeInTheDocument();
    expect(screen.queryByText('/login')).not.toBeInTheDocument();
  });

  it('manda para o login quando o boot termina sem sessão', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false });
    renderAt('/meus-pedidos');

    expect(screen.getByText('/login?redirect=%2Fmeus-pedidos')).toBeInTheDocument();
  });

  // Sem `encodeURIComponent`, `?category=camisas` viraria um segundo parâmetro
  // da URL do login e o `searchParams.get('redirect')` devolveria `/produtos`.
  it('preserva a query string do destino, codificada', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false });
    renderAt('/produtos?category=camisas&page=2');

    expect(
      screen.getByText('/login?redirect=%2Fprodutos%3Fcategory%3Dcamisas%26page%3D2')
    ).toBeInTheDocument();
  });

  it('libera a rota com sessão válida', () => {
    useAuthStore.setState({
      user: { id: 1, name: 'Eduardo' },
      isAuthenticated: true,
      isLoading: false,
    });
    renderAt('/meus-pedidos');

    expect(screen.getByText('pedidos')).toBeInTheDocument();
  });
});
