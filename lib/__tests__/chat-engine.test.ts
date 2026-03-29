import { describe, expect, it } from 'vitest';

import {
  createServiceResponse,
  createStartResponse,
  normalizeServiceMessage,
} from '@/lib/chat-engine';

describe('chat-engine', () => {
  it('normaliza servicios esperados desde texto libre', () => {
    expect(normalizeServiceMessage('Necesito cambio de aceite')).toBe('oil_change');
    expect(normalizeServiceMessage('Quiero una mantención completa')).toBe('maintenance');
    expect(normalizeServiceMessage('Quiero una mantencion completa')).toBe('maintenance');
    expect(normalizeServiceMessage('Necesito mantenimiento programado')).toBe('maintenance');
    expect(normalizeServiceMessage('Revisar frenos')).toBe('brakes');
    expect(normalizeServiceMessage('Diagnóstico por testigo encendido')).toBe('diagnostic');
    expect(normalizeServiceMessage('lavado')).toBeNull();
  });

  it('crea la respuesta inicial del asistente con foco comercial', () => {
    expect(createStartResponse()).toEqual({
      reply:
        'Hola. Soy el asistente de Servicio automotriz AlbertCar. Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?',
      next: 'await_service',
    });
  });

  it('muestra el formulario cuando se solicita cambio de aceite', () => {
    expect(createServiceResponse('Cambio de aceite', 'await_service')).toEqual({
      reply: 'Perfecto. Completa los datos del vehículo para recomendar aceite y filtro.',
      next: 'show_oil_form',
      form: { type: 'oil_change' },
    });
  });

  it('responde sobre mantención con paso done', () => {
    expect(createServiceResponse('Mantención', 'await_service')).toEqual({
      reply:
        'Indica marca, modelo y año para orientar la mantención preventiva o escribe directo por WhatsApp si prefieres cotizar ahora.',
      next: 'done',
    });
  });

  it('responde sobre frenos con una pregunta de diagnóstico inicial', () => {
    expect(createServiceResponse('Frenos', 'await_service')).toEqual({
      reply:
        'Cuéntame si notas ruido, vibración o menor respuesta al frenar para orientarte mejor sobre la revisión.',
      next: 'done',
    });
  });

  it('reinicia al saludo cuando el estado es start y no reconoce servicio', () => {
    expect(createServiceResponse('hola', 'start')).toEqual(createStartResponse());
  });

  it('guía al usuario cuando no reconoce el servicio en flujo activo', () => {
    expect(createServiceResponse('alineación', 'await_service')).toEqual({
      reply:
        'Puedes elegir un servicio del panel o escribir cambio de aceite, mantención, frenos o diagnóstico.',
      next: 'await_service',
    });
  });

  it('mantiene visible el formulario si el usuario escribe texto libre mientras está abierto', () => {
    expect(createServiceResponse('hola', 'show_oil_form')).toEqual({
      reply:
        'Sigo mostrando el formulario de cambio de aceite. Completa marca, modelo, año, kilometraje y combustible, o elige otro servicio si cambió tu necesidad.',
      next: 'show_oil_form',
      form: { type: 'oil_change' },
    });
  });
});
