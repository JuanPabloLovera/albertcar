import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('extrae la IP priorizando x-forwarded-for', async () => {
    const { getRequestKey } = await import('@/lib/rate-limit');

    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
        'x-real-ip': '9.9.9.9',
      },
    });

    expect(getRequestKey(request)).toBe('1.2.3.4');
  });

  it('permite hasta 30 solicitudes y bloquea la 31 dentro de la ventana', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');

    let lastResult = { allowed: true, remaining: 0 };
    for (let i = 0; i < 30; i += 1) {
      lastResult = checkRateLimit('ip-1');
    }

    expect(lastResult).toEqual({ allowed: true, remaining: 0 });
    expect(checkRateLimit('ip-1')).toEqual({ allowed: false, remaining: 0 });
  });

  it('reinicia el contador al pasar la ventana de tiempo', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');

    for (let i = 0; i < 31; i += 1) {
      checkRateLimit('ip-2');
    }

    expect(checkRateLimit('ip-2')).toEqual({ allowed: false, remaining: 0 });

    vi.advanceTimersByTime(60_001);

    expect(checkRateLimit('ip-2')).toEqual({ allowed: true, remaining: 29 });
  });
});
