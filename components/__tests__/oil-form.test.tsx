import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OilFormCard } from '@/components/oil-form';
import { INITIAL_OIL_FORM } from '@/lib/types';

describe('OilFormCard', () => {
  it('renderiza todos los campos accesibles y propaga cambios', async () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    render(<OilFormCard formData={INITIAL_OIL_FORM} onChange={onChange} onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    expect(screen.getByLabelText('Patente')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toBeInTheDocument();
    expect(screen.getByLabelText('Modelo')).toBeInTheDocument();
    expect(screen.getByLabelText('Año')).toBeInTheDocument();
    expect(screen.getByLabelText('Motor')).toBeInTheDocument();
    expect(screen.getByLabelText('Kilometraje')).toBeInTheDocument();
    expect(screen.getByLabelText('Combustible')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Marca'), 'Toyota');
    expect(onChange).toHaveBeenLastCalledWith('marca', 'Toyota');

    await userEvent.click(screen.getByRole('button', { name: 'Enviar datos' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('muestra ejemplos dentro de los inputs y opciones desplegables útiles', () => {
    render(<OilFormCard formData={INITIAL_OIL_FORM} onChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText('Ej: Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 9 1234 5678')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: ABCD12')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Toyota')).toHaveAttribute('list');
    expect(screen.getByPlaceholderText('Ej: Yaris')).toHaveAttribute('list');
    expect(screen.getByPlaceholderText('Ej: 1.5')).toHaveAttribute('list');

    const fuelSelect = screen.getByLabelText('Combustible');
    expect(fuelSelect.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Bencina' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Diésel' })).toBeInTheDocument();
  });

  it('cambia las sugerencias de modelo según la marca seleccionada', () => {
    const { container, rerender } = render(
      <OilFormCard
        formData={{ ...INITIAL_OIL_FORM, marca: 'Toyota' }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const modelInput = screen.getByLabelText('Modelo');
    const datalistId = modelInput.getAttribute('list');
    expect(datalistId).toBeTruthy();

    let datalist = container.querySelector(`#${datalistId}`);
    expect(datalist).not.toBeNull();
    expect(within(datalist as HTMLElement).getByDisplayValue('Yaris')).toBeInTheDocument();
    expect(within(datalist as HTMLElement).getByDisplayValue('Corolla')).toBeInTheDocument();
    expect(screen.getByText(/Sugerencias para Toyota/i)).toBeInTheDocument();

    rerender(
      <OilFormCard
        formData={{ ...INITIAL_OIL_FORM, marca: 'Kia' }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    datalist = container.querySelector(`#${datalistId}`);
    expect(datalist).not.toBeNull();
    expect(within(datalist as HTMLElement).getByDisplayValue('Rio')).toBeInTheDocument();
    expect(within(datalist as HTMLElement).getByDisplayValue('Sportage')).toBeInTheDocument();
  });

  it('permite escribir un modelo manual cuando la marca no está en catálogo', () => {
    render(
      <OilFormCard
        formData={{ ...INITIAL_OIL_FORM, marca: 'Marca X' }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText(/Puedes escribir el modelo manualmente/i)).toBeInTheDocument();
  });

  it('muestra una nota visible de privacidad', () => {
    render(<OilFormCard formData={INITIAL_OIL_FORM} onChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByText(/Privacidad:/i)).toBeInTheDocument();
  });

  it('respeta el estado disabled en inputs y botón', () => {
    render(<OilFormCard formData={INITIAL_OIL_FORM} onChange={vi.fn()} onSubmit={vi.fn()} disabled />);

    expect(screen.getByLabelText('Marca')).toBeDisabled();
    expect(screen.getByLabelText('Combustible')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  });
});
