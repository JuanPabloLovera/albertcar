import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocalBusinessSchema } from '@/components/local-business-schema';

describe('LocalBusinessSchema', () => {
  it('inyecta JSON-LD válido con datos del taller', () => {
    const { container } = render(<LocalBusinessSchema />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();

    const schema = JSON.parse(script?.textContent ?? '{}');

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('AutoRepair');
    expect(schema.name).toBe('Servicio automotriz AlbertCar');
    expect(schema.address.addressLocality).toBe('Cerro Navia');
    expect(schema.aggregateRating.ratingValue).toBe(5);
    expect(schema.aggregateRating.reviewCount).toBe(4);
    expect(schema.sameAs[0]).toContain('google.com/maps/search');
    expect(schema).not.toHaveProperty('openingHoursSpecification');
  });
});
