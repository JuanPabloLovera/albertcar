import { describe, expect, it } from 'vitest';

import {
  getModelOptions,
  isKnownBrand,
  isKnownModelForBrand,
  normalizeBrand,
} from '@/lib/vehicle-catalog';

describe('vehicle-catalog', () => {
  it('normaliza la marca removiendo acentos, espacios y mayúsculas', () => {
    expect(normalizeBrand('  Peugéot  ')).toBe('peugeot');
    expect(normalizeBrand('HYUNDAI')).toBe('hyundai');
  });

  it('devuelve modelos sugeridos para una marca aunque venga con formato irregular', () => {
    expect(getModelOptions('  TOYOTA ')).toEqual(['Yaris', 'Corolla', 'RAV4', 'Hilux', 'Avensis', 'Rush']);
    expect(getModelOptions('Peugéot')).toContain('208');
  });

  it('reconoce marcas conocidas y rechaza marcas fuera del catálogo local', () => {
    expect(isKnownBrand('Kía')).toBe(true);
    expect(isKnownBrand('BYD')).toBe(false);
  });

  it('valida modelos compatibles con la marca usando comparación normalizada', () => {
    expect(isKnownModelForBrand('Toyota', 'rav4')).toBe(true);
    expect(isKnownModelForBrand('Volkswagen', 'Amarok')).toBe(true);
    expect(isKnownModelForBrand('Toyota', 'Rio')).toBe(false);
  });

  it('devuelve null cuando no hay catálogo para la marca o el modelo está vacío', () => {
    expect(isKnownModelForBrand('Marca X', 'Modelo Y')).toBeNull();
    expect(isKnownModelForBrand('Toyota', '   ')).toBeNull();
  });
});
