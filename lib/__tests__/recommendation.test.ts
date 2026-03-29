import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OilForm } from '@/lib/types';

const baseForm: OilForm = {
  patente: '',
  marca: '',
  modelo: '',
  anio: '',
  motor: '',
  kilometraje: '',
  combustible: '',
  nombre: '',
  telefono: '',
};

const originalEnv = { ...process.env };

describe('fallbackRecommendation', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('prioriza diésel y kilometraje alto', async () => {
    const { fallbackRecommendation } = await import('@/lib/recommendation');

    const result = fallbackRecommendation({
      ...baseForm,
      marca: 'Ford',
      kilometraje: '160000',
      combustible: 'Diésel',
    });

    expect(result.aceite).toBe('10W-40 diésel semisintético');
    expect(result.filtro).toContain('diésel');
  });

  it('recomienda 0W-20 para Toyota moderno con kilometraje moderado', async () => {
    const { fallbackRecommendation } = await import('@/lib/recommendation');

    const result = fallbackRecommendation({
      ...baseForm,
      marca: 'Toyota',
      kilometraje: '80000',
      combustible: 'Bencina',
    });

    expect(result.aceite).toBe('0W-20 sintético');
    expect(result.filtro).toContain('Toyota');
  });

  it('usa recomendación conservadora en kilometraje alto no diésel', async () => {
    const { fallbackRecommendation } = await import('@/lib/recommendation');

    const result = fallbackRecommendation({
      ...baseForm,
      marca: 'Mazda',
      kilometraje: '140000',
      combustible: 'Gasolina',
    });

    expect(result.aceite).toBe('10W-40 semisintético');
    expect(result.motivo).toContain('kilometraje alto');
  });

  it('aplica política especial para vehículos eléctricos', async () => {
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_KEY;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
    delete process.env.AZURE_OPENAI_API_VERSION;

    const { generateRecommendationReply } = await import('@/lib/recommendation');

    const result = await generateRecommendationReply({
      ...baseForm,
      marca: 'Tesla',
      modelo: 'Model 3',
      combustible: 'Eléctrico',
    });

    expect(result.source).toBe('policy');
    expect(result.reply).toContain('No aplica cambio de aceite de motor');
    expect(result.reply).toContain('política técnica del taller');
  });

  it('genera un texto fallback completo cuando no hay Azure configurado', async () => {
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_KEY;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
    delete process.env.AZURE_OPENAI_API_VERSION;

    const { generateRecommendationReply } = await import('@/lib/recommendation');

    const result = await generateRecommendationReply({
      ...baseForm,
      marca: 'Toyota',
      kilometraje: '70000',
      combustible: 'Bencina',
    });

    expect(result.source).toBe('fallback');
    expect(result.reply).toContain('Aceite recomendado: 0W-20 sintético');
    expect(result.reply).toContain('Fuente aplicada: heurística conservadora local del taller');
    expect(result.reply).toContain('Validación final: confirme compatibilidad exacta con patente o VIN antes de comprar.');
  });

  it('usa Azure cuando la configuración existe y retorna contenido válido', async () => {
    const createMock = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Respuesta desde Azure' } }],
    });

    vi.doMock('openai', () => ({
      default: vi.fn().mockImplementation(() => ({
        chat: {
          completions: {
            create: createMock,
          },
        },
      })),
    }));

    process.env.AZURE_OPENAI_ENDPOINT = 'https://example.openai.azure.com';
    process.env.AZURE_OPENAI_KEY = 'key';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
    process.env.AZURE_OPENAI_API_VERSION = '2024-12-01-preview';

    const { generateRecommendationReply } = await import('@/lib/recommendation');

    const result = await generateRecommendationReply({
      ...baseForm,
      marca: 'Hyundai',
      modelo: 'Accent',
      anio: '2021',
      combustible: 'Bencina',
    });

    expect(result).toEqual({ reply: 'Respuesta desde Azure', source: 'azure' });
    expect(createMock).toHaveBeenCalledOnce();
  });

  it('vuelve al fallback si Azure falla', async () => {
    const createMock = vi.fn().mockRejectedValue(new Error('azure failed'));

    vi.doMock('openai', () => ({
      default: vi.fn().mockImplementation(() => ({
        chat: {
          completions: {
            create: createMock,
          },
        },
      })),
    }));

    process.env.AZURE_OPENAI_ENDPOINT = 'https://example.openai.azure.com';
    process.env.AZURE_OPENAI_KEY = 'key';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
    process.env.AZURE_OPENAI_API_VERSION = '2024-12-01-preview';

    const { generateRecommendationReply } = await import('@/lib/recommendation');

    const result = await generateRecommendationReply({
      ...baseForm,
      marca: 'Mazda',
      kilometraje: '140000',
      combustible: 'Gasolina',
    });

    expect(result.source).toBe('fallback');
    expect(result.reply).toContain('Aceite recomendado: 10W-40 semisintético');
  });
});
