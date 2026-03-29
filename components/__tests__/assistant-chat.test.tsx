import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantChat } from '@/components/assistant-chat';

const fetchMock = vi.fn();

describe('AssistantChat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  it('inicia la conversación, permite elegir cambio de aceite y muestra el formulario', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
          next: 'await_service',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: 'Perfecto. Completa los datos del vehículo para recomendar aceite y filtro.',
          next: 'show_oil_form',
          form: { type: 'oil_change' },
        }),
      });

    render(<AssistantChat />);

    expect(await screen.findByText(/¿Qué servicio necesitas\?/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cambio de aceite' }));

    expect(
      await screen.findByText('Perfecto. Completa los datos del vehículo para recomendar aceite y filtro.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Patente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar datos' })).toBeInTheDocument();
  });

  it('muestra un mensaje amigable cuando falla el inicio', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'));

    render(<AssistantChat />);

    expect(
      await screen.findByText('No fue posible iniciar el asistente. Revise la conexión e intente nuevamente.'),
    ).toBeInTheDocument();
  });

  it('envía mensajes libres al presionar Enter y muestra la respuesta del bot', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
          next: 'await_service',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Indica marca, modelo y año para orientar la mantención preventiva o escribe directo por WhatsApp si prefieres cotizar ahora.',
          next: 'done',
        }),
      });

    render(<AssistantChat />);

    await screen.findByText(/¿Qué servicio necesitas\?/);

    const input = screen.getByLabelText('Escribe tu mensaje');
    expect(input).toHaveAttribute('placeholder', 'Ej: ¿Qué aceite usa mi Kia Rio 2018 1.4?');
    await userEvent.type(input, 'Mantención{enter}');

    expect(await screen.findByText('Mantención')).toBeInTheDocument();
    expect(await screen.findByText(/orientar la mantención preventiva/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('muestra un error traducido cuando la API responde rate limit', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
          next: 'await_service',
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          reply: 'Hay muchas solicitudes seguidas. Intente nuevamente en unos instantes.',
          next: 'await_service',
          error: 'rate_limited',
        }),
      });

    render(<AssistantChat />);

    await screen.findByText(/¿Qué servicio necesitas\?/);
    await userEvent.click(screen.getByRole('button', { name: 'Diagnóstico' }));

    expect(
      await screen.findByText('Hay muchas solicitudes seguidas. Intente nuevamente en unos instantes.'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Se detectaron muchas solicitudes seguidas.')).toBeInTheDocument();
  });

  it('envía el formulario de aceite y muestra la recomendación final', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
          next: 'await_service',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: 'Perfecto. Completa los datos del vehículo para recomendar aceite y filtro.',
          next: 'show_oil_form',
          form: { type: 'oil_change' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: 'Aceite recomendado: 0W-20 sintético',
          next: 'done',
        }),
      });

    render(<AssistantChat />);

    await screen.findByText(/¿Qué servicio necesitas\?/);
    await userEvent.click(screen.getByRole('button', { name: 'Cambio de aceite' }));

    await userEvent.type(screen.getByLabelText('Marca'), 'Toyota');
    await userEvent.type(screen.getByLabelText('Modelo'), 'Yaris');
    await userEvent.type(screen.getByLabelText('Año'), '2020');
    await userEvent.selectOptions(screen.getByLabelText('Combustible'), 'Bencina');

    await userEvent.click(screen.getByRole('button', { name: 'Enviar datos' }));

    expect(await screen.findByText('Aceite recomendado: 0W-20 sintético')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it('reinicia la conversación y vuelve a pedir el servicio', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
          next: 'await_service',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply:
            'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
          next: 'await_service',
        }),
      });

    render(<AssistantChat />);

    await screen.findByText(/¿Qué servicio necesitas\?/);
    await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText(/¿Qué servicio necesitas\?/).length).toBeGreaterThanOrEqual(1);
  });
});
