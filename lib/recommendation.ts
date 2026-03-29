import OpenAI from "openai";

import { azureConfig, hasAzureConfig } from "@/lib/env";
import type { OilForm, RecommendationResult, RecommendationSource } from "@/lib/types";

function parseMileage(value: string) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function isElectricFuel(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes("eléctr") || normalized.includes("electr");
}

function isHybridFuel(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes("híbrido") || normalized.includes("hibrido");
}

export function fallbackRecommendation(data: OilForm): RecommendationResult {
  const marca = data.marca.toLowerCase();
  const kilometraje = parseMileage(data.kilometraje);
  const combustible = data.combustible.toLowerCase();

  const isDiesel = combustible.includes("diésel") || combustible.includes("diesel");
  const isHighMileage = kilometraje >= 120000;
  const isToyota = marca.includes("toyota");

  let aceite = "5W-30 sintético";
  let filtro = "Filtro de aceite equivalente OEM";
  let precioAceite = "$28.000 a $42.000 CLP";
  let precioFiltro = "$6.000 a $18.000 CLP";
  let motivo = "Recomendación base conservadora para motores livianos modernos.";

  if (isElectricFuel(data.combustible)) {
    aceite = "No aplica cambio de aceite de motor";
    filtro = "Revisión de filtro de cabina y líquidos auxiliares";
    precioAceite = "$0 CLP en aceite de motor";
    precioFiltro = "$12.000 a $35.000 CLP";
    motivo = "Los vehículos 100% eléctricos normalmente no usan aceite de motor; conviene revisar líquidos auxiliares, frenos y filtro de cabina según pauta del fabricante.";
  } else if (isHybridFuel(data.combustible)) {
    aceite = isToyota ? "0W-20 sintético" : "5W-30 sintético";
    filtro = "Filtro de aceite equivalente OEM para híbrido";
    precioAceite = isToyota ? "$30.000 a $46.000 CLP" : "$28.000 a $43.000 CLP";
    precioFiltro = "$7.000 a $20.000 CLP";
    motivo = "En híbridos se mantiene una recomendación conservadora y se valida la viscosidad exacta según motor térmico.";
  } else if (isDiesel) {
    aceite = isHighMileage ? "10W-40 diésel semisintético" : "5W-40 diésel sintético";
    filtro = "Filtro de aceite para diésel compatible";
    precioAceite = "$34.000 a $55.000 CLP";
    precioFiltro = "$8.000 a $24.000 CLP";
    motivo = "Los motores diésel suelen requerir especificaciones distintas y, con mayor kilometraje, una opción más conservadora.";
  } else if (isToyota && !isHighMileage) {
    aceite = "0W-20 sintético";
    filtro = "Filtro de aceite Toyota equivalente OEM";
    precioAceite = "$30.000 a $46.000 CLP";
    precioFiltro = "$8.000 a $20.000 CLP";
    motivo = "Muchos Toyota modernos usan 0W-20 como referencia habitual, sujeto a validación final por motor específico.";
  } else if (isHighMileage) {
    aceite = "10W-40 semisintético";
    precioAceite = "$26.000 a $39.000 CLP";
    motivo = "Para kilometraje alto se sugiere una recomendación inicial más conservadora, siempre validando especificación del fabricante.";
  }

  return { aceite, filtro, precioAceite, precioFiltro, motivo };
}

function buildFallbackReply(fallback: RecommendationResult, source: RecommendationSource = "fallback") {
  const sourceLine =
    source === "policy"
      ? "Fuente aplicada: política técnica del taller para casos donde cambio de aceite no corresponde de forma estándar."
      : "Fuente aplicada: heurística conservadora local del taller, pendiente de validación por patente o VIN.";

  return [
    `Aceite recomendado: ${fallback.aceite}`,
    `Valor estimado del aceite: ${fallback.precioAceite}`,
    `Filtro sugerido: ${fallback.filtro}`,
    `Valor estimado del filtro: ${fallback.precioFiltro}`,
    "Total estimado: valor referencial según marca, especificación y stock disponible.",
    `Respaldo: ${fallback.motivo}`,
    sourceLine,
    "Dónde comprar aceite en Chile: distribuidores oficiales, tiendas automotrices y lubricentros confiables.",
    "Dónde comprar filtro en Chile: repuesteras, concesionario o tiendas con búsqueda por patente.",
    "Validación final: confirme compatibilidad exacta con patente o VIN antes de comprar.",
  ].join("\n\n");
}

let openAiClient: OpenAI | null = null;

function getAzureClient() {
  if (!hasAzureConfig()) return null;
  if (openAiClient) return openAiClient;

  const cleanEndpoint = azureConfig.endpoint.endsWith("/") ? azureConfig.endpoint : `${azureConfig.endpoint}/`;

  openAiClient = new OpenAI({
    apiKey: azureConfig.apiKey,
    baseURL: `${cleanEndpoint}openai/deployments/${azureConfig.deployment}`,
    defaultQuery: { "api-version": azureConfig.apiVersion },
    defaultHeaders: { "api-key": azureConfig.apiKey },
  });

  return openAiClient;
}

export async function generateRecommendationReply(data: OilForm) {
  const fallback = fallbackRecommendation(data);
  const replySource: RecommendationSource = isElectricFuel(data.combustible) ? "policy" : "fallback";
  const fallbackReply = buildFallbackReply(fallback, replySource);

  if (replySource === "policy") {
    return { reply: fallbackReply, source: replySource };
  }

  const client = getAzureClient();

  if (!client) {
    return { reply: fallbackReply, source: "fallback" as const };
  }

  const prompt = `
Eres un asesor técnico automotriz en Chile.
Con los datos entregados, responde en español y en formato breve.
Debes incluir:
1. Aceite recomendado
2. Valor estimado del aceite en CLP
3. Filtro sugerido
4. Valor estimado del filtro en CLP
5. Total estimado en CLP
6. Respaldo breve
7. Dónde comprar aceite en Chile
8. Dónde comprar filtro en Chile
9. Aviso de validación final por patente o VIN
10. Una línea final llamada "Fuente aplicada" indicando si fue una orientación conservadora o una referencia habitual del fabricante

No inventes catálogos exactos no confirmados.
Si no estás seguro, entrega una respuesta conservadora.

Datos:
- Patente: ${data.patente}
- Marca: ${data.marca}
- Modelo: ${data.modelo}
- Año: ${data.anio}
- Motor: ${data.motor}
- Kilometraje: ${data.kilometraje}
- Combustible: ${data.combustible}
`.trim();

  try {
    const response = await client.chat.completions.create({
      model: azureConfig.deployment,
      messages: [
        {
          role: "system",
          content:
            "Responde con precisión y no inventes catálogos exactos no confirmados. Da valores estimados en pesos chilenos y explicita la fuente aplicada.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 550,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { reply: fallbackReply, source: "fallback" as const };
    return { reply: content, source: "azure" as const };
  } catch {
    return { reply: fallbackReply, source: "fallback" as const };
  }
}
