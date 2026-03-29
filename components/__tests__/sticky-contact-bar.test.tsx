import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StickyContactBar } from '@/components/sticky-contact-bar';

describe('StickyContactBar', () => {
  it('expone accesos rápidos para WhatsApp y llamada', () => {
    render(<StickyContactBar />);

    expect(screen.getByLabelText('Accesos rápidos de contacto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/56996137720');
    expect(screen.getByRole('link', { name: 'Llamar' })).toHaveAttribute('href', 'tel:+56996137720');
  });
});
