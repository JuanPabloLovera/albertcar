import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const getRequestKeyMock = vi.fn();
const generateRecommendationReplyMock = vi.fn();
const saveInteractionMock = vi.fn();

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getRequestKey: getRequestKeyMock,
}));

vi.mock('@/lib/recommendation', () => ({
  generateRecommendationReply: generateRecommendationReplyMock,
}));

vi.mock('@/lib/storage', () => ({
  saveInteraction: saveInteractionMock,
}));

import { POST } from '@/app/api/chat/route';

describe('POST /api/chat', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    getRequestKeyMock.mockReset();
    generateRecommendationReplyMock.mockReset();
    saveInteractionMock.mockReset();

    checkRateLimitMock.mockReturnValue({ allowed: true, remaining: 20 });
    getRequestKeyMock.mockReturnValue('test-ip');
    generateRecommendationReplyMock.mockResolvedValue({
      reply: 'Respuesta de prueba',
      source: 'fallback',
    });
    saveInteractionMock.mockResolvedValue({ ok: true, skipped: false });
  });

  it('responde con 429 cuando supera el rate limit', async () => {
    checkRateLimitMock.mockReturnValueOnce({ allowed: false, remaining: 0 });

    const response = await POST(new Request('http://localhost/api/chat', { method: 'POST', body: '{}' }));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe('rate_limited');
    expect(body.next).toBe('await_service');
  });

  it('responde con el saludo inicial en step start', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'start' }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.next).toBe('await_service');
    expect(body.reply).toMatch(/¿Qué servicio necesitas\?/);
    expect(generateRecommendationReplyMock).not.toHaveBeenCalled();
  });

  it('atiende una consulta de frenos desde await_service', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'await_service', message: 'Frenos' }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      reply:
        'Cuéntame si notas ruido, vibración o menor respuesta al frenar para orientarte mejor sobre la revisión.',
      next: 'done',
    });
  });


  it('mantiene el formulario abierto cuando el usuario escribe texto libre durante cambio de aceite', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'show_oil_form', message: 'hola' }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      reply:
        'Sigo mostrando el formulario de cambio de aceite. Completa marca, modelo, año, kilometraje y combustible, o elige otro servicio si cambió tu necesidad.',
      next: 'show_oil_form',
      form: { type: 'oil_change' },
    });
  });

  it('sanea un step inválido y cae al saludo inicial', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'cualquier-cosa', message: 'hola' }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.next).toBe('await_service');
    expect(body.reply).toMatch(/Hola\. Soy el asistente/);
  });

  it('valida el formulario antes de generar recomendación', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'submit_oil_form',
          formData: { marca: '', modelo: '', anio: '20', combustible: '' },
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.next).toBe('show_oil_form');
    expect(body.error).toBe('invalid_form');
    expect(body.reply).toMatch(/La marca es obligatoria/);
    expect(generateRecommendationReplyMock).not.toHaveBeenCalled();
  });

  it('genera la recomendación, agrega trazabilidad y guarda interacción cuando el formulario es válido', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'submit_oil_form',
          formData: {
            marca: 'Toyota',
            modelo: 'Yaris',
            anio: '2020',
            combustible: 'Bencina',
            kilometraje: '65000',
          },
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.next).toBe('done');
    expect(body.reply).toContain('Respuesta de prueba');
    expect(body.reply).toContain('Trazabilidad: solicitud');
    expect(body.meta).toEqual(
      expect.objectContaining({
        source: 'fallback',
        traceId: expect.any(String),
        vehicleFingerprint: expect.any(String),
      }),
    );
    expect(generateRecommendationReplyMock).toHaveBeenCalledOnce();
    expect(saveInteractionMock).toHaveBeenCalledOnce();
    expect(saveInteractionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'cambio de aceite',
        recommendationSource: 'fallback',
        traceId: expect.any(String),
      }),
    );
  });

  it('responde 400 cuando el body no trae JSON válido', async () => {
    const brokenRequest = {
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
    } as unknown as Request;

    const response = await POST(brokenRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('invalid_request');
    expect(body.next).toBe('start');
  });

  it('responde 500 cuando falla el procesamiento interno', async () => {
    generateRecommendationReplyMock.mockRejectedValueOnce(new Error('azure down'));

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'submit_oil_form',
          formData: {
            marca: 'Toyota',
            modelo: 'Yaris',
            anio: '2020',
            combustible: 'Bencina',
            kilometraje: '65000',
          },
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('server_error');
    expect(body.next).toBe('start');
  });
});
