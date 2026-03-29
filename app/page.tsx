import { AssistantChatShell } from "@/components/assistant-chat-shell";
import { HeroCard } from "@/components/hero-card";
import { LocalBusinessSchema } from "@/components/local-business-schema";
import { StickyContactBar } from "@/components/sticky-contact-bar";
import { publicBusinessConfig } from "@/lib/env";

const reasons = [
  "Diagnóstico automotriz con IA para orientar fallas con mayor precisión.",
  `Ubicación en ${publicBusinessConfig.city} para responder rápido a clientes de la comuna y sectores cercanos.`,
  `Calificación ${publicBusinessConfig.ratingValue} en Google con ${publicBusinessConfig.reviewCount} reseñas visibles.`,
  "Atención clara y cercana: explicamos cada revisión y el siguiente paso sugerido.",
  "Servicios clave en un solo lugar: mantención, aceite, frenos y diagnóstico general.",
];

const faqs = [
  {
    question: `¿Dónde está ubicado ${publicBusinessConfig.name}?`,
    answer: `Estamos en ${publicBusinessConfig.address}. Puedes abrir la ubicación en Google Maps desde el botón “Cómo llegar”.`,
  },
  {
    question: "¿Qué servicios puedo cotizar?",
    answer:
      "Puedes consultar por cambio de aceite, mantención preventiva, frenos y diagnóstico automotriz con apoyo de IA.",
  },
  {
    question: "¿Cómo funciona el diagnóstico con IA?",
    answer:
      "Se combinan datos del vehículo, revisión técnica y orientación asistida para entregar una recomendación más clara y rápida.",
  },
  {
    question: "¿Cómo contacto al taller?",
    answer: `Escríbenos por WhatsApp, llámanos al ${publicBusinessConfig.phone} o abre la ruta en Google Maps.`,
  },
];

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />

      <main className="page shellSpacing">
        <section className="hero" aria-labelledby="hero-heading">
          <HeroCard />
          <AssistantChatShell />
        </section>

        <section className="section trustSection" aria-labelledby="trust-heading">
          <div className="sectionIntro">
            <span className="eyebrow">Confianza local</span>
            <h2 id="trust-heading">Información clara para decidir más rápido</h2>
            <p>
              Reforzamos la propuesta comercial con señales de confianza, lenguaje local y accesos directos
              para contacto inmediato en {publicBusinessConfig.city}.
            </p>
          </div>

          <div className="infoGrid">
            <article className="infoCard">
              <span className="metric">★ {publicBusinessConfig.ratingValue}</span>
              <h3>Reseñas visibles en Google</h3>
              <p>{publicBusinessConfig.reviewCount} opiniones activas para apoyar la confianza desde el primer vistazo.</p>
            </article>
            <article className="infoCard">
              <span className="metric">Hasta {publicBusinessConfig.openUntil}</span>
              <h3>Horario extendido</h3>
              <p>Mostramos la disponibilidad en la misma landing para reducir fricción antes del contacto.</p>
            </article>
            <article className="infoCard">
              <span className="metric">{publicBusinessConfig.city}</span>
              <h3>Ubicación local destacada</h3>
              <p>{publicBusinessConfig.address}</p>
            </article>
          </div>
        </section>

        <section className="section" id="servicios" aria-labelledby="services-heading">
          <div className="sectionIntro">
            <span className="eyebrow">Servicios</span>
            <h2 id="services-heading">Servicios automotrices en {publicBusinessConfig.city}</h2>
            <p>
              Sumamos contenido descriptivo para mejorar SEO local y explicar mejor los servicios más buscados.
            </p>
          </div>

          <div className="contentGrid">
            <article className="contentCard">
              <h3>Diagnóstico con IA</h3>
              <p>
                Orientación técnica con apoyo de IA para identificar fallas, priorizar revisiones y dar una explicación más clara.
              </p>
            </article>
            <article className="contentCard">
              <h3>Cambio de aceite</h3>
              <p>
                Recomendación guiada de aceite y filtro según marca, modelo, año, motor y uso del vehículo.
              </p>
            </article>
            <article className="contentCard">
              <h3>Mantención preventiva</h3>
              <p>
                Revisión de puntos críticos para anticipar problemas y cuidar el rendimiento general del auto.
              </p>
            </article>
            <article className="contentCard">
              <h3>Frenos y seguridad</h3>
              <p>
                Atención enfocada en seguridad para revisar desgaste, síntomas y mantenimiento del sistema de frenos.
              </p>
            </article>
          </div>
        </section>

        <section className="section highlightSection" aria-labelledby="why-heading">
          <div className="sectionIntro">
            <span className="eyebrow">Diferenciación</span>
            <h2 id="why-heading">¿Por qué elegir {publicBusinessConfig.name}?</h2>
            <p>
              Esta sección recoge la ventaja competitiva sugerida en el diagnóstico: tecnología, cercanía y rapidez.
            </p>
          </div>

          <ul className="checkList">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className="section" id="resenas" aria-labelledby="reviews-heading">
          <div className="sectionIntro">
            <span className="eyebrow">Prueba social</span>
            <h2 id="reviews-heading">Reseñas y credibilidad</h2>
            <p>
              Evitamos inventar testimonios y dejamos una base real apoyada en la calificación pública visible.
            </p>
          </div>

          <div className="reviewPanel cardLite">
            <div>
              <p className="reviewScore">{publicBusinessConfig.ratingValue} ★ en Google</p>
              <p className="reviewText">
                Actualmente se destacan {publicBusinessConfig.reviewCount} reseñas visibles. El enlace directo a Google ayuda a validar la confianza sin salir de la intención de compra.
              </p>
            </div>
            <a className="btn secondary" href={publicBusinessConfig.reviewsUrl} target="_blank" rel="noreferrer">
              Ver reseñas
            </a>
          </div>
        </section>

        <section className="section" id="faq" aria-labelledby="faq-heading">
          <div className="sectionIntro">
            <span className="eyebrow">FAQ</span>
            <h2 id="faq-heading">Preguntas frecuentes</h2>
            <p>
              Añadimos preguntas frecuentes con lenguaje local para cubrir dudas comunes y reforzar keywords de intención.
            </p>
          </div>

          <div className="faqList">
            {faqs.map((faq) => (
              <details key={faq.question} className="faqItem">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section contactSection cardLite" aria-labelledby="contact-heading">
          <div>
            <span className="eyebrow">Contacto</span>
            <h2 id="contact-heading">Listos para atenderte en {publicBusinessConfig.city}</h2>
            <p>
              La landing ahora cierra con una llamada a la acción más completa: ubicación, teléfono, horario y rutas directas.
            </p>
          </div>

          <div className="contactDetails">
            <p><strong>Dirección:</strong> {publicBusinessConfig.address}</p>
            <p><strong>Teléfono:</strong> {publicBusinessConfig.phone}</p>
            <p><strong>Horario visible:</strong> abierto hasta las {publicBusinessConfig.openUntil}</p>
          </div>

          <div className="ctaRow">
            <a className="btn" href={`https://wa.me/${publicBusinessConfig.whatsapp}`} target="_blank" rel="noreferrer">
              Contáctanos por WhatsApp
            </a>
            <a className="btn secondary" href={publicBusinessConfig.phoneHref}>
              Llámanos ahora
            </a>
            <a className="btn secondary" href={publicBusinessConfig.mapsUrl} target="_blank" rel="noreferrer">
              Cómo llegar
            </a>
          </div>
        </section>
      </main>

      <StickyContactBar />
    </>
  );
}
