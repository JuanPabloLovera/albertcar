import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { publicBusinessConfig } from '@/lib/env';

vi.mock('@/components/assistant-chat-shell', () => ({
  AssistantChatShell: function AssistantChatShellStub() {
    return <div data-testid="assistant-chat-stub">Asistente cargado</div>;
  },
}));

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renderiza las secciones clave de SEO local, confianza y contacto', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 2, name: /Información clara para decidir más rápido/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: new RegExp(`Servicios automotrices en ${publicBusinessConfig.city}`, 'i') })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: new RegExp(`¿Por qué elegir ${publicBusinessConfig.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?`, 'i') })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Preguntas frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: new RegExp(`Listos para atenderte en ${publicBusinessConfig.city}`, 'i') })).toBeInTheDocument();

    expect(screen.getByTestId('assistant-chat-stub')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver reseñas' })).toHaveAttribute('href', publicBusinessConfig.reviewsUrl);
    expect(screen.getByRole('link', { name: 'Contáctanos por WhatsApp' })).toHaveAttribute(
      'href',
      `https://wa.me/${publicBusinessConfig.whatsapp}`,
    );
  });
});
