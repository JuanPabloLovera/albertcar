# Cambios aplicados al proyecto

## 1) SEO local
- Título y descripción orientados a `Cerro Navia`
- Keywords locales en metadata
- Canonical, Open Graph y viewport
- `sitemap.xml` y `robots.txt`
- JSON-LD `AutoRepair` / `LocalBusiness`

## 2) Conversión comercial
- CTA principal corregido y reforzado: `Contáctanos por WhatsApp`
- CTA secundarios: llamada y cómo llegar
- Hero con señales de confianza: rating, horario y dirección
- Cierre comercial con contacto directo
- Barra móvil fija para WhatsApp y llamada

## 3) Contenido y credibilidad
- Nuevas secciones: servicios, diferenciación, reseñas, FAQ y contacto
- Enfoque en lenguaje local y servicios reales
- Prueba social basada en rating visible y enlace a reseñas

## 4) Accesibilidad y UX
- `aria-label` en input del chat
- Labels invisibles para inputs del formulario
- Estilos de foco visible
- Mejor estructura visual en móvil
- Carga diferida del asistente para priorizar el contenido principal

## 5) Configuración
- `.env.example` ampliado con variables del negocio
- `README.md` actualizado con los cambios y variables necesarias

## 6) Mejoras inspiradas en el PDF
- **Normalización**: combustible se canoniza (`Gasolina` → `Bencina`, `Diesel` → `Diésel`, etc.)
- **Detección de incoherencias**: se generan advertencias si el modelo no coincide con la marca sugerida por catálogo
- **Privacidad / PII**: al persistir en Cosmos se guardan datos sensibles redactados y banderas PII
- **Procedencia / trazabilidad**: cada respuesta puede devolver `traceId` y `vehicleFingerprint`
- **Política técnica**: si el vehículo es eléctrico, la recomendación cambia de forma segura para no sugerir aceite de motor cuando no corresponde

## Pendiente recomendado
- Reemplazar URLs placeholder por las definitivas del negocio
- Confirmar `NEXT_PUBLIC_SITE_URL` con el dominio real
- Agregar fotos reales del taller cuando estén disponibles
- Reemplazar el enlace de reseñas por el enlace real de Google Business
- Conectar una tabla real de compatibilidades por marca/modelo/motor o por patente/VIN

## Mejora UX adicional
- Formulario con selección dependiente **marca → modelo**: al elegir una marca, el campo modelo muestra sugerencias asociadas y permite escribir manualmente si no aparece en catálogo.
- Si cambia la marca, el modelo se limpia para evitar combinaciones inconsistentes.
- Se añadió una nota de privacidad visible en el formulario para reforzar confianza y cumplimiento básico.

## Pruebas agregadas después de la mejora
- Se agregaron pruebas unitarias para `lib/vehicle-catalog.ts`.
- Se agregaron pruebas unitarias para `lib/storage.ts` cubriendo persistencia, redacción de PII y manejo de fallos de Cosmos.

## Ajustes finales aplicados
- Wrapper cliente para `next/dynamic` con `ssr: false` compatible con Next.js 15.
- Normalización segura de `NEXT_PUBLIC_SITE_URL`, Maps, Reviews, WhatsApp y `tel:` para evitar caídas por variables mal formadas.
- API `/api/chat` devuelve `400 invalid_request` cuando el body no trae JSON válido.
- Persistencia en Cosmos ahora registra errores en logs sin romper la respuesta al usuario.
- Tests endurecidos para entorno/configuración y para requests inválidos.
