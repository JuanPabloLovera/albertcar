# Pruebas profundas incorporadas

Se agregó una batería de pruebas más amplia para cubrir el proyecto desde varios ángulos, priorizando el flujo comercial del taller, la confiabilidad del asistente y la base SEO/local del sitio.

## Qué cubren

### 1. API del asistente
Archivo: `app/api/chat/route.test.ts`

Casos cubiertos:
- rate limit `429`
- saludo inicial (`step=start`)
- selección de servicio en flujo activo
- saneamiento de `step` inválido
- validación de formulario con errores
- recomendación exitosa
- trazabilidad (`traceId`) y metadatos de respuesta
- error interno del servidor

### 2. Asistente de chat
Archivo: `components/__tests__/assistant-chat.test.tsx`

Casos cubiertos:
- arranque del chat
- selección de servicio rápido
- renderizado del formulario de aceite
- envío por Enter
- error traducido de rate limit
- submit del formulario
- reinicio del flujo

### 3. Componentes críticos de conversión/SEO
Archivos:
- `components/__tests__/hero-card.test.tsx`
- `components/__tests__/oil-form.test.tsx`
- `components/__tests__/sticky-contact-bar.test.tsx`
- `components/__tests__/local-business-schema.test.tsx`
- `app/page.test.tsx`
- `app/layout.test.tsx`

Casos cubiertos:
- CTAs principales
- datos locales visibles
- accesibilidad básica de inputs
- JSON-LD correcto
- presencia de secciones clave de landing
- metadata y viewport
- ayuda contextual del formulario

### 4. Lógica y utilidades
Archivos:
- `lib/__tests__/chat-engine.test.ts`
- `lib/__tests__/validation.test.ts`
- `lib/__tests__/rate-limit.test.ts`
- `lib/__tests__/recommendation.test.ts`
- `lib/__tests__/env.test.ts`
- `lib/__tests__/privacy.test.ts`
- `lib/__tests__/vehicle-catalog.test.ts`
- `lib/__tests__/storage.test.ts`

Casos cubiertos:
- normalización de intención
- respuestas por servicio
- saneamiento de formularios y requests
- límites de longitud
- reglas de año válido
- advertencias por teléfono/patente/catálogo
- policy fallback para vehículos eléctricos
- rate limiting por ventana
- fallback y uso de Azure
- lectura de variables de entorno
- redacción y fingerprint para almacenamiento
- catálogo local de marcas/modelos y normalización
- persistencia en Cosmos con redacción y manejo de fallos

## Cómo ejecutarlas

```bash
npm install
npm test
```

Chequeos recomendados extra:

```bash
npm run typecheck
npm run typecheck:test
npm run build
```

## Observaciones
- Las pruebas están pensadas para detectar regresiones en conversión, UX, SEO local, backend básico y protección mínima de datos.
- No se agregó Playwright porque el proyecto actual no trae esa dependencia ni su configuración.
- Si luego quieres, el siguiente paso ideal es sumar E2E reales para:
  - navegación móvil
  - CTA sticky en viewport chico
  - validación visual del hero
  - smoke test de `/api/chat`
  - flujo completo con respuestas distintas para bencina, diésel, híbrido y eléctrico

## Validaciones agregadas en esta iteración
- `lib/__tests__/env.test.ts`: URLs públicas y datos de contacto.
- `app/api/chat/route.test.ts`: JSON inválido y fallo interno controlado.
- Ajuste de tests para evitar acoplamiento innecesario a textos fijos de configuración.
