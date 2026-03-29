import { randomUUID } from "node:crypto";

import { CosmosClient } from "@azure/cosmos";

import { cosmosConfig, hasCosmosConfig } from "@/lib/env";
import { createVehicleFingerprint, detectSensitiveFlags, redactOilFormForStorage } from "@/lib/privacy";
import type { OilForm } from "@/lib/types";

let cosmosClient: CosmosClient | null = null;

function getCosmosContainer() {
  if (!hasCosmosConfig()) return null;

  if (!cosmosClient) {
    cosmosClient = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
    });
  }

  return cosmosClient.database(cosmosConfig.databaseId).container(cosmosConfig.containerId);
}

export async function saveInteraction(data: {
  service: string;
  formData?: OilForm;
  recommendation: string;
  recommendationSource?: string;
  warnings?: string[];
  traceId?: string;
}) {
  const container = getCosmosContainer();
  if (!container) return { ok: false as const, skipped: true as const };

  try {
    await container.items.create({
      id: randomUUID(),
      sessionId: randomUUID(),
      createdAt: new Date().toISOString(),
      service: data.service,
      recommendation: data.recommendation,
      recommendationSource: data.recommendationSource,
      warnings: data.warnings ?? [],
      traceId: data.traceId ?? randomUUID(),
      piiFlags: detectSensitiveFlags(data.formData),
      vehicleFingerprint: createVehicleFingerprint(data.formData),
      formDataRedacted: redactOilFormForStorage(data.formData),
    });
    return { ok: true as const, skipped: false as const };
  } catch (error) {
    console.error("[storage] Cosmos save failed", {
      traceId: data.traceId,
      service: data.service,
      error,
    });
    return { ok: false as const, skipped: false as const };
  }
}
