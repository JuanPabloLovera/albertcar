import { describe, expect, it } from 'vitest';

import { sanitizeChatRequest, sanitizeOilForm, validateOilForm } from '@/lib/validation';

describe('validation', () => {
  it('sanea el formulario y normaliza campos clave', () => {
    const result = sanitizeOilForm({
      patente: ' ab-cd 12 ',
      telefono: '+56 9 1234 5678',
      anio: ' 2020 ',
      kilometraje: '150.000 km',
      marca: ' Toyota ',
      modelo: ' Yaris ',
      combustible: ' gasolina ',
    });

    expect(result.patente).toBe('AB-CD 12');
    expect(result.telefono).toBe('56912345678');
    expect(result.anio).toBe('2020');
    expect(result.kilometraje).toBe('150000');
    expect(result.marca).toBe('Toyota');
    expect(result.modelo).toBe('Yaris');
    expect(result.combustible).toBe('Bencina');
  });

  it('trunca teléfono, patente y kilometraje a tamaños seguros', () => {
    const result = sanitizeOilForm({
      telefono: '+56 9 1234 5678 999 777',
      patente: 'ABC-DEF-123456',
      kilometraje: '123456789999 km',
    });

    expect(result.telefono).toBe('569123456789997');
    expect(result.patente).toBe('ABC-DEF-12');
    expect(result.kilometraje).toBe('1234567');
  });

  it('devuelve errores cuando faltan campos requeridos', () => {
    const result = validateOilForm({
      marca: '',
      modelo: '',
      anio: '20',
      combustible: '',
      kilometraje: '',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('La marca es obligatoria.');
    expect(result.errors).toContain('El modelo es obligatorio.');
    expect(result.errors).toContain('El año debe tener 4 dígitos.');
    expect(result.errors).toContain('El combustible es obligatorio.');
    expect(result.errors).toContain('El kilometraje es obligatorio.');
  });

  it('rechaza años imposibles o fuera de rango', () => {
    const result = validateOilForm({
      marca: 'Kia',
      modelo: 'Rio',
      anio: '1940',
      combustible: 'Bencina',
      kilometraje: '50000',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El año ingresado no parece válido.');
  });

  it('acepta un formulario válido y completa con defaults', () => {
    const result = validateOilForm({
      marca: 'Kia',
      modelo: 'Rio',
      anio: '2018',
      combustible: 'Bencina',
      kilometraje: '98000',
    });

    expect(result.isValid).toBe(true);
    expect(result.data.marca).toBe('Kia');
    expect(result.data.nombre).toBe('');
    expect(result.data.telefono).toBe('');
  });

  it('genera advertencia si el modelo no coincide con la marca conocida', () => {
    const result = validateOilForm({
      marca: 'Toyota',
      modelo: 'Rio',
      anio: '2021',
      combustible: 'Bencina',
      kilometraje: '65000',
    });

    expect(result.isValid).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/no coincide con las sugerencias conocidas/i);
  });

  it('genera advertencia para vehículos eléctricos', () => {
    const result = validateOilForm({
      marca: 'BYD',
      modelo: 'Dolphin',
      anio: '2025',
      combustible: 'Eléctrico',
      kilometraje: '12000',
    });

    expect(result.isValid).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/eléctricos normalmente no requieren cambio de aceite/i);
  });

  it('sanea requests inválidos con un fallback seguro', () => {
    expect(sanitizeChatRequest(null)).toEqual({ step: 'start' });
  });

  it('normaliza el step a un valor permitido', () => {
    const result = sanitizeChatRequest({
      step: 'paso-raro',
      message: ' hola   mundo ',
      formData: { telefono: '+56 9 9999 8888' },
    });

    expect(result.step).toBe('start');
    expect(result.message).toBe('hola mundo');
    expect(result.formData?.telefono).toBe('56999998888');
  });
});
