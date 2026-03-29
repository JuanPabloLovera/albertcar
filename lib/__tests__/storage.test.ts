import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };
const createMock = vi.fn();
const containerMock = {
  items: {
    create: createMock,
  },
};
const containerFactoryMock = vi.fn(() => containerMock);
const databaseMock = vi.fn(() => ({ container: containerFactoryMock }));
const CosmosClientMock = vi.fn(() => ({ database: databaseMock }));

vi.mock('@azure/cosmos', () => ({
  CosmosClient: CosmosClientMock,
}));

describe('storage', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('omite persistencia cuando Cosmos no está configurado', async () => {
    delete process.env.COSMOS_ENDPOINT;
    delete process.env.COSMOS_KEY;
    delete process.env.COSMOS_DATABASE;
    delete process.env.COSMOS_CONTAINER;

    const { saveInteraction } = await import('@/lib/storage');

    const result = await saveInteraction({
      service: 'cambio de aceite',
      recommendation: 'Texto de prueba',
    });

    expect(result).toEqual({ ok: false, skipped: true });
    expect(CosmosClientMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('guarda interacción con datos redactados, banderas PII y huella del vehículo', async () => {
    process.env.COSMOS_ENDPOINT = 'https://cosmos.example.com';
    process.env.COSMOS_KEY = 'cosmos-key';
    process.env.COSMOS_DATABASE = 'db';
    process.env.COSMOS_CONTAINER = 'container';
    createMock.mockResolvedValueOnce({});

    const { saveInteraction } = await import('@/lib/storage');

    const result = await saveInteraction({
      service: 'cambio de aceite',
      recommendation: 'Recomendación generada',
      recommendationSource: 'policy',
      warnings: ['Revisar patente'],
      traceId: 'trace-fixed',
      formData: {
        nombre: 'Juan Pérez',
        telefono: '56912345678',
        patente: 'ABCD12',
        marca: 'Toyota',
        modelo: 'Yaris',
        anio: '2020',
        motor: '1.5',
        kilometraje: '80000',
        combustible: 'Bencina',
      },
    });

    expect(result).toEqual({ ok: true, skipped: false });
    expect(CosmosClientMock).toHaveBeenCalledWith({
      endpoint: 'https://cosmos.example.com',
      key: 'cosmos-key',
    });
    expect(databaseMock).toHaveBeenCalledWith('db');
    expect(containerFactoryMock).toHaveBeenCalledWith('container');
    expect(createMock).toHaveBeenCalledTimes(1);

    const savedDocument = createMock.mock.calls[0]?.[0];
    expect(savedDocument).toMatchObject({
      service: 'cambio de aceite',
      recommendation: 'Recomendación generada',
      recommendationSource: 'policy',
      warnings: ['Revisar patente'],
      traceId: 'trace-fixed',
      piiFlags: {
        hasName: true,
        hasPhone: true,
        hasPlate: true,
      },
      formDataRedacted: {
        marca: 'Toyota',
        modelo: 'Yaris',
        anio: '2020',
        motor: '1.5',
        kilometraje: '80000',
        combustible: 'Bencina',
      },
      vehicleFingerprint: expect.any(String),
      id: expect.any(String),
      sessionId: expect.any(String),
      createdAt: expect.any(String),
    });
    expect(savedDocument.vehicleFingerprint).toHaveLength(16);
    expect(savedDocument.formDataRedacted.nombre).not.toBe('Juan Pérez');
    expect(savedDocument.formDataRedacted.telefono).not.toBe('56912345678');
    expect(savedDocument.formDataRedacted.patente).not.toBe('ABCD12');
  });

  it('retorna fallo controlado cuando Cosmos responde con error', async () => {
    process.env.COSMOS_ENDPOINT = 'https://cosmos.example.com';
    process.env.COSMOS_KEY = 'cosmos-key';
    process.env.COSMOS_DATABASE = 'db';
    process.env.COSMOS_CONTAINER = 'container';
    createMock.mockRejectedValueOnce(new Error('write failed'));

    const { saveInteraction } = await import('@/lib/storage');

    const result = await saveInteraction({
      service: 'cambio de aceite',
      recommendation: 'Texto de prueba',
    });

    expect(result).toEqual({ ok: false, skipped: false });
    expect(createMock).toHaveBeenCalledTimes(1);
  });
});
