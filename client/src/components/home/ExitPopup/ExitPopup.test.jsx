import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ExitPopup from './ExitPopup';
import { useUiStore } from '../../../store/uiStore';
import { setSettings } from '../../../test/settings';

// Diferente do padrão de fábrica: prova que o texto vem das configurações (G-12).
const DISCOUNT = '15% OFF';

// O popup só aparece pelo exit intent: mouse saindo pelo topo da janela.
function triggerExitIntent() {
  fireEvent(document, new MouseEvent('mouseleave', { clientY: 0, bubbles: true }));
}

describe('ExitPopup', () => {
  beforeEach(() => {
    // O hook grava `exit-popup-shown` no primeiro disparo e nunca mais abre.
    sessionStorage.clear();
    useUiStore.setState({ toasts: [] });
    setSettings({ leadCapture: { discount: DISCOUNT } });
  });

  it('fica fechado até o exit intent disparar', () => {
    render(<ExitPopup />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // O diálogo é do `ui/Modal`: o nome acessível vem do `aria-labelledby` que a
  // primitiva liga no título. Sem `title`, o dialog ficaria anônimo.
  it('abre um dialog nomeado, com o desconto vindo das configurações', () => {
    render(<ExitPopup />);
    triggerExitIntent();

    expect(screen.getByRole('dialog', { name: `Espera! ${DISCOUNT}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Quero ${DISCOUNT}` })).toBeInTheDocument();
  });

  // Regressão dos dois warnings de a11y da fase: a recusa era um
  // `<span role="button">` com `onKeyDown` só de Enter.
  it('a recusa é um button de verdade, não um span com role', async () => {
    render(<ExitPopup />);
    triggerExitIntent();

    const skip = screen.getByRole('button', { name: 'Não, prefiro pagar mais caro' });
    expect(skip.tagName).toBe('BUTTON');

    fireEvent.click(skip);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  // Escape, scrim e trava de scroll passaram a ser do Modal — este teste existe
  // para o caso de alguém desfazer isso e voltar a escrever o diálogo à mão.
  it('fecha no Escape, que quem trata é o Modal', async () => {
    render(<ExitPopup />);
    triggerExitIntent();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('não envia e-mail vazio', () => {
    render(<ExitPopup />);
    triggerExitIntent();

    fireEvent.submit(screen.getByRole('button', { name: `Quero ${DISCOUNT}` }).closest('form'));

    expect(useUiStore.getState().toasts).toHaveLength(0);
  });

  it('confirma o cupom por toast e fecha', async () => {
    render(<ExitPopup />);
    triggerExitIntent();

    fireEvent.change(screen.getByLabelText('Seu e-mail'), {
      target: { value: 'eduardo@exemplo.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: `Quero ${DISCOUNT}` }));

    const [toast] = useUiStore.getState().toasts;
    expect(toast.type).toBe('success');
    expect(toast.message).toContain(DISCOUNT);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
