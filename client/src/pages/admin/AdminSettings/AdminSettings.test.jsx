import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSettings from './AdminSettings';
import { settingsService } from '../../../services/settingsService';
import { useSettingsStore } from '../../../store/settingsStore';
import { useUiStore } from '../../../store/uiStore';
import { setSettings, makeSettings } from '../../../test/settings';

vi.mock('../../../services/settingsService', () => ({
  settingsService: { get: vi.fn(), update: vi.fn() },
}));

const save = () => screen.getByRole('button', { name: 'Salvar alterações' });
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('AdminSettings', () => {
  beforeEach(() => {
    setSettings();
    useUiStore.setState({ toasts: [] });
    settingsService.update.mockReset();
  });

  it('abre com os valores atuais e nada para salvar', () => {
    render(<AdminSettings />);

    expect(screen.getByLabelText('Nome da loja')).toHaveValue('Campo Cheio');
    expect(screen.getByLabelText('Frete grátis a partir de (R$)')).toHaveValue(149);
    expect(save()).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Tudo salvo');
  });

  it('mexer num campo habilita salvar; descartar volta ao que estava', () => {
    render(<AdminSettings />);

    type('Nome da loja', 'Outra Loja');
    expect(save()).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Alterações não salvas');

    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getByLabelText('Nome da loja')).toHaveValue('Campo Cheio');
    expect(save()).toBeDisabled();
  });

  // Os inputs guardam texto; a API espera número, booleano e ISO.
  it('salva com os tipos da API e atualiza a loja', async () => {
    settingsService.update.mockImplementation(async (body) => ({ settings: body }));
    render(<AdminSettings />);

    type('Frete grátis a partir de (R$)', '199.9');
    fireEvent.click(screen.getByRole('switch', { name: 'Banner de promoção na Home' }));
    type('Termina em', '2026-12-24T18:30');
    fireEvent.click(save());

    await waitFor(() => expect(settingsService.update).toHaveBeenCalled());
    const body = settingsService.update.mock.calls[0][0];
    expect(body.shipping.freeThreshold).toBe(199.9);
    expect(body.promo.enabled).toBe(true);
    expect(body.promo.endsAt).toBe(new Date('2026-12-24T18:30').toISOString());
    expect(body.social.stats).toBeNull();

    await waitFor(() => expect(useSettingsStore.getState().settings.shipping.freeThreshold).toBe(199.9));
    expect(useUiStore.getState().toasts[0].type).toBe('success');
    expect(save()).toBeDisabled();
  });

  it('a nota só aparece e só vai junto com o switch ligado', async () => {
    settingsService.update.mockImplementation(async (body) => ({ settings: body }));
    render(<AdminSettings />);
    expect(screen.queryByLabelText('Nota média (0 a 5)')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Mostrar nota média e total de avaliações' }));
    type('Nota média (0 a 5)', '4.8');
    type('Total de avaliações', '1240');
    fireEvent.click(save());

    await waitFor(() => expect(settingsService.update).toHaveBeenCalled());
    expect(settingsService.update.mock.calls[0][0].social.stats).toEqual({ rating: 4.8, reviews: 1240 });
  });

  // O servidor diz qual campo recusou; o formulário marca e leva o foco até ele.
  it('erro de validação marca e foca o campo certo', async () => {
    settingsService.update.mockRejectedValue({
      response: { status: 422, data: { message: 'Valor do frete inválido.', field: 'shipping.standardCost' } },
    });
    render(<AdminSettings />);

    type('Valor do frete (R$)', '-3');
    fireEvent.click(save());

    const cost = screen.getByLabelText('Valor do frete (R$)');
    await waitFor(() => expect(cost).toHaveAttribute('aria-invalid', 'true'));
    expect(cost).toHaveAccessibleDescription('Valor do frete inválido.');
    expect(cost).toHaveFocus();
    expect(useSettingsStore.getState().settings).toEqual(makeSettings());
  });

  it('corrigir o campo apaga o erro dele', async () => {
    settingsService.update.mockRejectedValue({
      response: { status: 422, data: { message: 'Valor do frete inválido.', field: 'shipping.standardCost' } },
    });
    render(<AdminSettings />);
    type('Valor do frete (R$)', '-3');
    fireEvent.click(save());
    const cost = screen.getByLabelText('Valor do frete (R$)');
    await waitFor(() => expect(cost).toHaveAttribute('aria-invalid', 'true'));

    type('Valor do frete (R$)', '12');

    expect(cost).not.toHaveAttribute('aria-invalid');
  });
});
