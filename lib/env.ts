function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizePhoneHref(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("tel:")) return trimmed;

  const digits = onlyDigits(trimmed);
  return digits ? `tel:+${digits}` : fallback;
}

function normalizeWhatsAppNumber(value: string, fallback: string) {
  const digits = onlyDigits(value);
  return digits || fallback;
}

function ensureAbsoluteUrl(value: string, fallback: string) {
  const candidate = value.trim();
  const fallbackUrl = new URL(fallback);

  if (!candidate) return fallbackUrl.toString().replace(/\/$/, "");

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return fallbackUrl.toString().replace(/\/$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallbackUrl.toString().replace(/\/$/, "");
  }
}

const defaultName = "Servicio automotriz AlbertCar";
const defaultAddress = "Libertad 1508, Cerro Navia, Región Metropolitana";
const defaultPhone = "+56 9 9613 7720";
const defaultPhoneHref = "tel:+56996137720";
const defaultWhatsAppNumber = "56996137720";
const defaultMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Libertad+1508,+Cerro+Navia,+Regi%C3%B3n+Metropolitana";
const defaultSiteUrl = "https://example.com";

const rawPhone = getOptionalEnv("NEXT_PUBLIC_BUSINESS_PHONE");
const rawPhoneHref = getOptionalEnv("NEXT_PUBLIC_BUSINESS_PHONE_HREF");
const rawWhatsApp = getOptionalEnv("NEXT_PUBLIC_WHATSAPP");
const rawMapsUrl = getOptionalEnv("NEXT_PUBLIC_GOOGLE_MAPS_URL");
const rawReviewsUrl = getOptionalEnv("NEXT_PUBLIC_GOOGLE_REVIEWS_URL");
const rawSiteUrl = getOptionalEnv("NEXT_PUBLIC_SITE_URL");

const safeSiteUrl = ensureAbsoluteUrl(rawSiteUrl, defaultSiteUrl);
const safeMapsUrl = ensureAbsoluteUrl(rawMapsUrl, defaultMapsUrl);
const safeReviewsUrl = ensureAbsoluteUrl(rawReviewsUrl, safeMapsUrl);
const safePhoneHref = normalizePhoneHref(rawPhoneHref || rawPhone, defaultPhoneHref);
const safeWhatsAppNumber = normalizeWhatsAppNumber(rawWhatsApp || rawPhone, defaultWhatsAppNumber);

export const publicBusinessConfig = {
  name: getOptionalEnv("NEXT_PUBLIC_BUSINESS_NAME") || defaultName,
  legalOrAlternateName: getOptionalEnv("NEXT_PUBLIC_BUSINESS_ALT_NAME") || defaultName,
  city: getOptionalEnv("NEXT_PUBLIC_BUSINESS_CITY") || "Cerro Navia",
  region: getOptionalEnv("NEXT_PUBLIC_BUSINESS_REGION") || "Región Metropolitana",
  country: getOptionalEnv("NEXT_PUBLIC_BUSINESS_COUNTRY") || "CL",
  address: getOptionalEnv("NEXT_PUBLIC_BUSINESS_ADDRESS") || defaultAddress,
  phone: rawPhone || defaultPhone,
  phoneHref: safePhoneHref,
  whatsapp: safeWhatsAppNumber,
  reviewsUrl: safeReviewsUrl,
  mapsUrl: safeMapsUrl,
  ratingValue: getOptionalEnv("NEXT_PUBLIC_RATING_VALUE") || "5.0",
  reviewCount: getOptionalEnv("NEXT_PUBLIC_REVIEW_COUNT") || "4",
  opensAt: getOptionalEnv("NEXT_PUBLIC_OPEN_FROM"),
  openUntil: getOptionalEnv("NEXT_PUBLIC_OPEN_UNTIL") || "23:00",
  siteUrl: safeSiteUrl,
  geo: {
    latitude: getOptionalEnv("NEXT_PUBLIC_BUSINESS_LATITUDE") || "-33.4167",
    longitude: getOptionalEnv("NEXT_PUBLIC_BUSINESS_LONGITUDE") || "-70.75",
  },
};

export const azureConfig = {
  endpoint: getOptionalEnv("AZURE_OPENAI_ENDPOINT"),
  apiKey: getOptionalEnv("AZURE_OPENAI_KEY"),
  deployment: getOptionalEnv("AZURE_OPENAI_DEPLOYMENT"),
  apiVersion: getOptionalEnv("AZURE_OPENAI_API_VERSION"),
};

export const cosmosConfig = {
  endpoint: getOptionalEnv("COSMOS_ENDPOINT"),
  key: getOptionalEnv("COSMOS_KEY"),
  databaseId: getOptionalEnv("COSMOS_DATABASE"),
  containerId: getOptionalEnv("COSMOS_CONTAINER"),
};

export function hasAzureConfig() {
  return Boolean(
    azureConfig.endpoint && azureConfig.apiKey && azureConfig.deployment && azureConfig.apiVersion,
  );
}

export function hasCosmosConfig() {
  return Boolean(
    cosmosConfig.endpoint && cosmosConfig.key && cosmosConfig.databaseId && cosmosConfig.containerId,
  );
}

export function getSafeMetadataBase() {
  return new URL(publicBusinessConfig.siteUrl);
}
