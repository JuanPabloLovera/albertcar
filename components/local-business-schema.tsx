import { publicBusinessConfig } from "@/lib/env";

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function LocalBusinessSchema() {
  const openingHoursSpecification = publicBusinessConfig.opensAt
    ? [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: publicBusinessConfig.opensAt,
          closes: publicBusinessConfig.openUntil,
        },
      ]
    : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: publicBusinessConfig.name,
    alternateName: publicBusinessConfig.legalOrAlternateName,
    image: [],
    url: publicBusinessConfig.siteUrl,
    telephone: publicBusinessConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: publicBusinessConfig.address,
      addressLocality: publicBusinessConfig.city,
      addressRegion: publicBusinessConfig.region,
      addressCountry: publicBusinessConfig.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: toNumber(publicBusinessConfig.geo.latitude),
      longitude: toNumber(publicBusinessConfig.geo.longitude),
    },
    openingHoursSpecification,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: toNumber(publicBusinessConfig.ratingValue),
      reviewCount: toNumber(publicBusinessConfig.reviewCount),
    },
    sameAs: [publicBusinessConfig.mapsUrl, publicBusinessConfig.reviewsUrl].filter(Boolean),
    areaServed: publicBusinessConfig.city,
    priceRange: "$$",
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
