import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('env', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('normaliza NEXT_PUBLIC_SITE_URL aunque venga sin protocolo', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'albertcar.cl';

    const { publicBusinessConfig, getSafeMetadataBase } = await import('@/lib/env');

    expect(publicBusinessConfig.siteUrl).toBe('https://albertcar.cl');
    expect(getSafeMetadataBase().toString()).toBe('https://albertcar.cl/');
  });

  it('cae a valores seguros cuando maps o reviews traen URLs inválidas', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL = 'notaurl';
    process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL = 'ftp://reviews.example.com';

    const { publicBusinessConfig } = await import('@/lib/env');

    expect(publicBusinessConfig.mapsUrl).toMatch(/^https:\/\//);
    expect(publicBusinessConfig.reviewsUrl).toMatch(/^https:\/\//);
  });

  it('normaliza phoneHref y whatsapp desde texto libre', async () => {
    process.env.NEXT_PUBLIC_BUSINESS_PHONE = '+56 9 1111 2222';
    process.env.NEXT_PUBLIC_BUSINESS_PHONE_HREF = '56933334444';
    process.env.NEXT_PUBLIC_WHATSAPP = '+56 9 5555 6666';

    const { publicBusinessConfig } = await import('@/lib/env');

    expect(publicBusinessConfig.phoneHref).toBe('tel:+56933334444');
    expect(publicBusinessConfig.whatsapp).toBe('56955556666');
  });
});
