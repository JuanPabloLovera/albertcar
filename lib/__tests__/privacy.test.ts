import { describe, expect, it } from 'vitest';

import { createVehicleFingerprint, detectSensitiveFlags, redactOilFormForStorage } from '@/lib/privacy';

describe('privacy helpers', () => {
  it('detecta banderas de datos sensibles', () => {
    const result = detectSensitiveFlags({
      nombre: 'Juan Pérez',
      telefono: '56912345678',
      patente: 'ABCD12',
    });

    expect(result).toEqual({
      hasName: true,
      hasPhone: true,
      hasPlate: true,
    });
  });

  it('redacta nombre, teléfono y patente para almacenamiento', () => {
    const result = redactOilFormForStorage({
      nombre: 'Juan Pérez',
      telefono: '56912345678',
      patente: 'ABCD12',
      marca: 'Toyota',
      modelo: 'Yaris',
      combustible: 'Bencina',
    });

    expect(result?.nombre).not.toBe('Juan Pérez');
    expect(result?.telefono).not.toBe('56912345678');
    expect(result?.patente).not.toBe('ABCD12');
    expect(result?.marca).toBe('Toyota');
  });

  it('genera una huella estable del vehículo', () => {
    const first = createVehicleFingerprint({
      marca: 'Toyota',
      modelo: 'Yaris',
      anio: '2020',
      motor: '1.5',
      combustible: 'Bencina',
    });

    const second = createVehicleFingerprint({
      marca: 'Toyota',
      modelo: 'Yaris',
      anio: '2020',
      motor: '1.5',
      combustible: 'Bencina',
    });

    expect(first).toHaveLength(16);
    expect(second).toBe(first);
  });
});
