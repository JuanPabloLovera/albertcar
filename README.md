# Taller IA Mejorado

Landing page + asistente para taller mecánico en Chile, construido con Next.js App Router.

## Cambios aplicados sobre el diagnóstico ejecutivo
- Hero reforzado con propuesta local en Cerro Navia
- CTA corregidos y ampliados: WhatsApp, llamada y cómo llegar
- Metadata SEO local con título, descripción, canonical y Open Graph
- Contenido nuevo para servicios, diferenciación, FAQ, reseñas y cierre comercial
- JSON-LD `AutoRepair` / `LocalBusiness` para reforzar SEO técnico
- `sitemap.xml` y `robots.txt` generados desde App Router
- CTA móvil fijo para WhatsApp y llamada
- Mejoras de accesibilidad: `aria-label`, labels invisibles y foco visible
- Refactor del asistente: lógica extraída a un hook para reducir acoplamiento UI/estado
- Carga diferida del asistente para priorizar contenido principal
- Normalización de combustible y validación marca → modelo en formulario
- Trazabilidad básica por solicitud con `traceId` y huella de vehículo
- Privacidad reforzada: guardado redactado de nombre, teléfono y patente
- Respuesta adaptada para vehículos eléctricos, evitando sugerir cambio de aceite cuando no corresponde

## Requisitos
- Node.js 20+
- npm 10+

## Instalación
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables recomendadas
Configura al menos estas variables para dejar la versión lista para producción:

```bash
NEXT_PUBLIC_BUSINESS_NAME="Servicio automotriz AlbertCar"
NEXT_PUBLIC_BUSINESS_CITY="Cerro Navia"
NEXT_PUBLIC_BUSINESS_ADDRESS="Libertad 1508, Cerro Navia, Región Metropolitana"
NEXT_PUBLIC_BUSINESS_PHONE="+56 9 9613 7720"
NEXT_PUBLIC_BUSINESS_PHONE_HREF="tel:+56996137720"
NEXT_PUBLIC_WHATSAPP="56996137720"
NEXT_PUBLIC_GOOGLE_MAPS_URL="https://www.google.com/maps/search/?api=1&query=Libertad+1508,+Cerro+Navia,+Regi%C3%B3n+Metropolitana"
NEXT_PUBLIC_GOOGLE_REVIEWS_URL="https://g.page/r/TU_RESEÑA/review"
NEXT_PUBLIC_RATING_VALUE="5.0"
NEXT_PUBLIC_REVIEW_COUNT="4"
NEXT_PUBLIC_OPEN_UNTIL="23:00"
NEXT_PUBLIC_SITE_URL="https://tu-dominio.cl"
```

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run typecheck:test
npm test
```

## Estructura principal
```txt
app/
  api/chat/route.ts
  globals.css
  layout.tsx
  page.tsx
  robots.ts
  sitemap.ts
components/
  assistant-chat.tsx
  hooks/use-assistant-chat.ts
  hero-card.tsx
  local-business-schema.tsx
  oil-form.tsx
  service-grid.tsx
  sticky-contact-bar.tsx
lib/
  chat-engine.ts
  env.ts
  privacy.ts
  rate-limit.ts
  recommendation.ts
  storage.ts
  types.ts
  validation.ts
  vehicle-catalog.ts
```

## Qué se reforzó desde el PDF adjunto
Tomando como referencia el enfoque del PDF, esta versión incorpora una capa más robusta para:

- **Normalización de datos**: combustible canonizado y revisión de consistencia básica del vehículo
- **Detección de incoherencias**: advertencia cuando el modelo no coincide con el catálogo sugerido para la marca
- **Procedencia / trazabilidad**: cada recomendación puede devolver `traceId` y `vehicleFingerprint`
- **Privacidad**: en almacenamiento se redactan nombre, teléfono y patente; además se marcan banderas PII
- **QA funcional**: se amplía el foco de pruebas hacia validaciones, recomendaciones y respuestas especiales

## Nota
La recomendación automática del asistente sigue siendo orientativa. Para precisión final de compatibilidad de aceite o repuestos, valida por patente o VIN.

## Mejora reciente
- El formulario de aceite ahora incluye sugerencias dependientes **marca → modelo** para acelerar el ingreso y reducir errores, manteniendo la opción de escribir manualmente cuando el modelo no está en la lista.
- Si el vehículo es **eléctrico**, el sistema evita recomendar aceite de motor y redirige la orientación hacia revisiones coherentes con ese tipo de unidad.
