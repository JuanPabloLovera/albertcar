import { publicBusinessConfig } from "@/lib/env";
import type { ChatResponseBody, ConversationStep } from "@/lib/types";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function normalizeServiceMessage(message: string) {
  const text = normalizeText(message);

  if (text.includes("aceite")) return "oil_change" as const;
  if (text.includes("mantenc") || text.includes("manten")) return "maintenance" as const;
  if (text.includes("freno")) return "brakes" as const;
  if (text.includes("diagn")) return "diagnostic" as const;
  return null;
}

export function createStartResponse(): ChatResponseBody {
  return {
    reply:
      `Hola. Soy el asistente de ${publicBusinessConfig.name}. ` +
      "Puedo orientarte en cambio de aceite, mantención, frenos o diagnóstico. ¿Qué servicio necesitas?",
    next: "await_service",
  };
}

export function createServiceResponse(message: string, currentStep: ConversationStep): ChatResponseBody {
  const service = normalizeServiceMessage(message);

  if (!service && currentStep === "start") return createStartResponse();

  if (!service && currentStep === "show_oil_form") {
    return {
      reply:
        "Sigo mostrando el formulario de cambio de aceite. Completa marca, modelo, año, kilometraje y combustible, o elige otro servicio si cambió tu necesidad.",
      next: "show_oil_form",
      form: { type: "oil_change" },
    };
  }

  switch (service) {
    case "oil_change":
      return {
        reply: "Perfecto. Completa los datos del vehículo para recomendar aceite y filtro.",
        next: "show_oil_form",
        form: { type: "oil_change" },
      };
    case "maintenance":
      return {
        reply:
          "Indica marca, modelo y año para orientar la mantención preventiva o escribe directo por WhatsApp si prefieres cotizar ahora.",
        next: "done",
      };
    case "brakes":
      return {
        reply:
          "Cuéntame si notas ruido, vibración o menor respuesta al frenar para orientarte mejor sobre la revisión.",
        next: "done",
      };
    case "diagnostic":
      return {
        reply:
          "Describe la falla, testigo encendido o comportamiento extraño del vehículo para orientar el diagnóstico.",
        next: "done",
      };
    default:
      return {
        reply:
          "Puedes elegir un servicio del panel o escribir cambio de aceite, mantención, frenos o diagnóstico.",
        next: "await_service",
      };
  }
}
