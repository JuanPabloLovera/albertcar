import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { checkRateLimit, getRequestKey } from "@/lib/rate-limit";
import { createServiceResponse, createStartResponse } from "@/lib/chat-engine";
import { createVehicleFingerprint } from "@/lib/privacy";
import { generateRecommendationReply } from "@/lib/recommendation";
import { saveInteraction } from "@/lib/storage";
import { sanitizeChatRequest, validateOilForm } from "@/lib/validation";
import type { ChatResponseBody } from "@/lib/types";

export const runtime = "nodejs";

function jsonResponse(body: ChatResponseBody, status = 200) {
  return NextResponse.json(body, { status });
}

function buildRecommendationReply(reply: string, warnings: string[], traceId: string) {
  const sections: string[] = [];

  if (warnings.length) {
    sections.push(`Observaciones previas:\n- ${warnings.join("\n- ")}`);
  }

  sections.push(reply);
  sections.push(`Trazabilidad: solicitud ${traceId.slice(0, 8)} registrada para seguimiento interno del taller.`);

  return sections.join("\n\n");
}

function isJsonParseError(error: unknown) {
  return error instanceof SyntaxError || (error instanceof Error && /json|body/i.test(error.message));
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getRequestKey(request));
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        reply: "Hay muchas solicitudes seguidas. Intente nuevamente en unos instantes.",
        next: "await_service",
        error: "rate_limited",
      },
      429,
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch (error) {
    const errorCode = isJsonParseError(error) ? "invalid_request" : "server_error";
    const status = errorCode === "invalid_request" ? 400 : 500;

    return jsonResponse(
      {
        reply:
          errorCode === "invalid_request"
            ? "La solicitud no tiene un JSON válido. Revisa el formato e inténtalo nuevamente."
            : "Ocurrió un error procesando la solicitud.",
        next: "start",
        error: errorCode,
      },
      status,
    );
  }

  try {
    const body = sanitizeChatRequest(rawBody);
    const step = body.step || "start";

    if (step === "start") return jsonResponse(createStartResponse());

    if (step === "await_service" || step === "done" || step === "show_oil_form") {
      return jsonResponse(createServiceResponse(body.message || "", step));
    }

    if (step === "submit_oil_form") {
      const validation = validateOilForm(body.formData);

      if (!validation.isValid) {
        return jsonResponse(
          {
            reply: `Faltan o sobran datos por corregir:\n\n- ${validation.errors.join("\n- ")}`,
            next: "show_oil_form",
            form: { type: "oil_change" },
            error: "invalid_form",
            meta: { warnings: validation.warnings },
          },
          400,
        );
      }

      const traceId = randomUUID();
      const recommendation = await generateRecommendationReply(validation.data);
      const vehicleFingerprint = createVehicleFingerprint(validation.data);
      const reply = buildRecommendationReply(recommendation.reply, validation.warnings, traceId);

      const persistence = await saveInteraction({
        service: "cambio de aceite",
        formData: validation.data,
        recommendation: reply,
        recommendationSource: recommendation.source,
        warnings: validation.warnings,
        traceId,
      });

      if (!persistence.ok && !persistence.skipped) {
        console.error("[storage] No se pudo persistir la interacción", { traceId });
      }

      return jsonResponse({
        reply,
        next: "done",
        meta: {
          traceId,
          source: recommendation.source,
          warnings: validation.warnings,
          vehicleFingerprint,
        },
      });
    }

    return jsonResponse({ reply: "No entendí la solicitud.", next: "start" });
  } catch (error) {
    console.error("[api/chat] Error procesando la solicitud", error);

    return jsonResponse(
      {
        reply: "Ocurrió un error procesando la solicitud.",
        next: "start",
        error: "server_error",
      },
      500,
    );
  }
}
