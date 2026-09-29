import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useScrollRestoration } from './useScrollRestoration';

// O hook depende do tipo de navegação (PUSH vs POP), e isso só existe se a
// navegação acontecer de verdade dentro do mesmo router — remontar o
// MemoryRouter com outra entrada daria POP em tudo e não testaria nada.
function Nav() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/produtos')}>produtos</button>
      <button onClick={() => navigate('/produtos#grade')}>produtos com hash</button>
      <button onClick={() => navigate(-1)}>voltar</button>
    </>
  );
}

function App() {
  useScrollRestoration();
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/produtos" element={<p>produtos</p>} />
      </Routes>
    </>
  );
}

function renderApp() {
  return render(
    // Os mesmos flags do `App.jsx`. `v7_startTransition` muda a prioridade da
    // atualização de rota, e é exatamente isso que fez o bug do logout existir
    // (G-07) — teste com router configurado diferente da produção mente.
    <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </MemoryRouter>
  );
}

describe('useScrollRestoration', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('não rola no primeiro render — a rota não mudou, só montou', () => {
    renderApp();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('vai ao topo ao trocar de pathname', () => {
    renderApp();
    fireEvent.click(screen.getByText('produtos'));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('não rola quando há hash — quem posiciona é o scrollIntoView do Header', () => {
    renderApp();
    fireEvent.click(screen.getByText('produtos com hash'));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('não rola em POP — o browser restaura a posição sozinho', () => {
    renderApp();
    fireEvent.click(screen.getByText('produtos'));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('voltar'));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });
});
