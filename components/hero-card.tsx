import { publicBusinessConfig } from "@/lib/env";

export function HeroCard() {
  const waLink = `https://wa.me/${publicBusinessConfig.whatsapp}`;

  return (
    <div className="card heroCard">
      <div className="badge">Diagnóstico avanzado con IA · {publicBusinessConfig.city}</div>
      <h1 id="hero-heading">{publicBusinessConfig.name}</h1>
      <p className="heroLead">
        Taller mecánico en {publicBusinessConfig.city} con cambio de aceite, mantenciones, frenos y orientación
        clara para que tomes decisiones con más confianza.
      </p>

      <div className="trustPills" aria-label="Indicadores de confianza">
        <span>★ {publicBusinessConfig.ratingValue} en Google</span>
        <span>Abierto hasta {publicBusinessConfig.openUntil}</span>
        <span>{publicBusinessConfig.address}</span>
      </div>

      <div className="ctaRow">
        <a className="btn" href={waLink} target="_blank" rel="noreferrer">
          Contáctanos por WhatsApp
        </a>
        <a className="btn secondary" href={publicBusinessConfig.phoneHref}>
          Llámanos ahora
        </a>
        <a className="btn secondary" href={publicBusinessConfig.mapsUrl} target="_blank" rel="noreferrer">
          Cómo llegar
        </a>
      </div>
    </div>
  );
}
