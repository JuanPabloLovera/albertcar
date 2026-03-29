import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeroCard } from '@/components/hero-card';

describe('HeroCard', () => {
  it('muestra el contenido comercial principal y los CTA críticos', () => {
    render(<HeroCard />);

    expect(screen.getByRole('heading', { level: 1, name: 'Servicio automotriz AlbertCar' })).toBeInTheDocument();
    expect(screen.getByText(/Taller mecánico en Cerro Navia/i)).toBeInTheDocument();
    expect(screen.getByText(/★ 5.0 en Google/)).toBeInTheDocument();
    expect(screen.getByText(/Libertad 1508, Cerro Navia/)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Contáctanos por WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/56996137720',
    );
    expect(screen.getByRole('link', { name: 'Llámanos ahora' })).toHaveAttribute('href', 'tel:+56996137720');
    expect(screen.getByRole('link', { name: 'Cómo llegar' })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps/search'),
    );
  });
});
