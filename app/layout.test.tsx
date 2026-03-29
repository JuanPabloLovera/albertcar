import { describe, expect, it } from 'vitest';

import RootLayout, { metadata, viewport } from '@/app/layout';
import { publicBusinessConfig } from '@/lib/env';

describe('app/layout', () => {
  it('expone metadata local y base URL segura', () => {
    expect(metadata.title).toBe(`${publicBusinessConfig.name} | Taller mecánico en ${publicBusinessConfig.city}`);
    expect(metadata.description).toContain('Diagnóstico automotriz con IA');
    expect(metadata.keywords).toContain(`taller mecánico en ${publicBusinessConfig.city}`);
    expect(metadata.openGraph?.locale).toBe('es_CL');
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(String(metadata.metadataBase)).toBe(`${publicBusinessConfig.siteUrl}/`);
  });

  it('define viewport correcto para móvil', () => {
    expect(viewport).toEqual({
      width: 'device-width',
      initialScale: 1,
      themeColor: '#111827',
    });
  });

  it('usa html en español de Chile', () => {
    const element = RootLayout({ children: 'contenido' });

    expect(element.props.lang).toBe('es-CL');
    expect(element.props.children.type).toBe('body');
    expect(element.props.children.props.children).toBe('contenido');
  });
});
