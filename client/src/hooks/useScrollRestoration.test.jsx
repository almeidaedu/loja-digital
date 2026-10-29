import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useScrollRestoration } from './useScrollRestoration';

// O hook depende do tipo de navegação (PUSH, REPLACE, POP), e isso só existe se
// a navegação acontecer de verdade dentro do mesmo router — remontar o
// MemoryRouter com outra entrada daria POP em tudo e não testaria nada.
function Nav() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/produtos')}>produtos</button>
      <button onClick={() => navigate('/#faq')}>faq na home</button>
      <button onClick={() => navigate({ hash: '#faq' })}>faq aqui</button>
      <button onClick={() => navigate({ hash: '#faq' }, { replace: true })}>spy</button>
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
        <Route path="/" element={<section id="faq">home</section>} />
        <Route path="/produtos" element={<p>produtos</p>} />
      </Routes>
    </>
  );
}

function renderAt(entry = '/') {
  return render(
    // Os mesmos flags do `App.jsx`. `v7_startTransition` muda a prioridade da
    // atualização de rota, e é exatamente isso que fez o bug do logout existir
    // (G-07) — teste com router configurado diferente da produção mente.
    <MemoryRouter initialEntries={[entry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </MemoryRouter>
  );
}

// ResizeObserver controlável: o teste dispara a "mudança de altura" na mão.
let resize = () => {};
const disconnect = vi.fn();

describe('useScrollRestoration', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
    disconnect.mockClear();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          resize = callback;
        }
        observe() {}
        disconnect = disconnect;
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete Element.prototype.scrollIntoView;
  });

  it('não rola no primeiro render — a rota não mudou, só montou', () => {
    renderAt();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  // Instantâneo de verdade: o `html` tem `scroll-behavior: smooth`, e um
  // `scrollTo(0, 0)` cru animaria.
  it('vai ao topo, sem animação, ao trocar de pathname', () => {
    renderAt();
    fireEvent.click(screen.getByText('produtos'));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });

  it('não rola em POP — o browser restaura a posição sozinho', () => {
    renderAt();
    fireEvent.click(screen.getByText('produtos'));
    fireEvent.click(screen.getByText('voltar'));

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  // O bug do Footer: vindo de outra página, rolava uma vez antes de Categorias e
  // Produtos carregarem, e a seção era empurrada para baixo.
  it('vindo de outra rota, leva até a âncora e realinha quando a página cresce', () => {
    renderAt('/produtos');
    fireEvent.click(screen.getByText('faq na home'));

    const scroll = Element.prototype.scrollIntoView;
    expect(scroll).toHaveBeenCalledWith({ behavior: 'instant' });
    expect(window.scrollTo).not.toHaveBeenCalled();

    resize();
    resize();
    expect(scroll).toHaveBeenCalledTimes(3);
  });

  it('para de perseguir a âncora assim que o usuário rola', () => {
    renderAt('/produtos');
    fireEvent.click(screen.getByText('faq na home'));

    fireEvent.wheel(window);

    expect(disconnect).toHaveBeenCalled();
  });

  it('para de perseguir sozinho depois que a página assenta', () => {
    vi.useFakeTimers();
    renderAt('/produtos');
    fireEvent.click(screen.getByText('faq na home'));

    vi.advanceTimersByTime(2000);

    expect(disconnect).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('na mesma rota, rola suave até a âncora', () => {
    renderAt();
    fireEvent.click(screen.getByText('faq aqui'));

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  // REPLACE é o scroll-spy reescrevendo a URL enquanto o usuário rola. Reagir a
  // ele jogaria a página de volta para a seção a cada frame.
  it('ignora hash por REPLACE', () => {
    renderAt();
    fireEvent.click(screen.getByText('spy'));

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
