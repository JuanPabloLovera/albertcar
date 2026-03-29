import { publicBusinessConfig } from "@/lib/env";

export function StickyContactBar() {
  const waLink = `https://wa.me/${publicBusinessConfig.whatsapp}`;

  return (
    <div className="stickyCtaBar" aria-label="Accesos rápidos de contacto">
      <a className="stickyCtaBtn primary" href={waLink} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a className="stickyCtaBtn" href={publicBusinessConfig.phoneHref}>
        Llamar
      </a>
    </div>
  );
}
