import { INITIAL_OIL_FORM, type ChatRequestBody, type OilForm } from "@/lib/types";
import { getModelOptions, isKnownBrand, isKnownModelForBrand } from "@/lib/vehicle-catalog";

function sanitizeText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeFuel(value: string) {
  const normalized = sanitizeText(value).toLowerCase();

  if (!normalized) return "";
  if (["bencina", "gasolina"].includes(normalized)) return "Bencina";
  if (["diesel", "diésel", "diesel euro"].includes(normalized)) return "Diésel";
  if (normalized.includes("hibrido enchufable") || normalized.includes("híbrido enchufable")) return "Híbrido enchufable";
  if (normalized.includes("hibrido") || normalized.includes("híbrido")) return "Híbrido";
  if (normalized.includes("glp") || normalized.includes("gas")) return "GLP / Gas";
  if (normalized.includes("electrico") || normalized.includes("eléctrico")) return "Eléctrico";

  return sanitizeText(value);
}

export function sanitizeChatRequest(body: unknown): ChatRequestBody {
  if (!body || typeof body !== "object") {
    return { step: "start" };
  }

  const input = body as Record<string, unknown>;

  return {
    step: sanitizeStep(input.step),
    message: sanitizeText(input.message),
    formData: sanitizeOilForm(input.formData),
  };
}

function sanitizeStep(value: unknown) {
  const allowed = new Set(["start", "await_service", "show_oil_form", "submit_oil_form", "done"]);
  const normalized = sanitizeText(value);
  return allowed.has(normalized) ? (normalized as ChatRequestBody["step"]) : "start";
}

export function sanitizeOilForm(input: unknown): OilForm {
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};

  return {
    nombre: sanitizeText(source.nombre),
    telefono: onlyDigits(sanitizeText(source.telefono)).slice(0, 15),
    patente: sanitizeText(source.patente).toUpperCase().slice(0, 10),
    marca: sanitizeText(source.marca),
    modelo: sanitizeText(source.modelo),
    anio: onlyDigits(sanitizeText(source.anio)).slice(0, 4),
    motor: sanitizeText(source.motor),
    kilometraje: onlyDigits(sanitizeText(source.kilometraje)).slice(0, 7),
    combustible: normalizeFuel(String(source.combustible ?? "")),
  };
}

export function validateOilForm(formData: Partial<OilForm> | undefined) {
  const sanitized = sanitizeOilForm(formData);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!sanitized.marca) errors.push("La marca es obligatoria.");
  if (!sanitized.modelo) errors.push("El modelo es obligatorio.");
  if (!sanitized.anio || sanitized.anio.length !== 4) errors.push("El año debe tener 4 dígitos.");
  if (!sanitized.combustible) errors.push("El combustible es obligatorio.");
  if (!sanitized.kilometraje) errors.push("El kilometraje es obligatorio.");

  const currentYear = new Date().getFullYear() + 1;
  const yearNumber = Number(sanitized.anio);
  if (sanitized.anio && (yearNumber < 1950 || yearNumber > currentYear)) {
    errors.push("El año ingresado no parece válido.");
  }

  if (sanitized.kilometraje && Number.isNaN(Number(sanitized.kilometraje))) {
    errors.push("El kilometraje debe ser numérico.");
  }

  if (sanitized.telefono && sanitized.telefono.length < 8) {
    warnings.push("El teléfono parece incompleto; conviene validarlo antes de contactar al cliente.");
  }

  if (sanitized.patente && sanitized.patente.length < 5) {
    warnings.push("La patente parece incompleta; la validación final por patente o VIN podría fallar.");
  }

  if (sanitized.marca && !isKnownBrand(sanitized.marca)) {
    warnings.push("La marca no está en el catálogo local del formulario; se mantiene ingreso manual y validación posterior.");
  }

  const knownModelsForBrand = getModelOptions(sanitized.marca);
  const modelMatch = isKnownModelForBrand(sanitized.marca, sanitized.modelo);
  if (sanitized.marca && sanitized.modelo && knownModelsForBrand.length && modelMatch === false) {
    warnings.push(`El modelo ${sanitized.modelo} no coincide con las sugerencias conocidas para ${sanitized.marca}; revisar compatibilidad antes de cotizar.`);
  }

  if (sanitized.combustible === "Eléctrico") {
    warnings.push("Los vehículos eléctricos normalmente no requieren cambio de aceite de motor; se entregará una orientación adaptada.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: { ...INITIAL_OIL_FORM, ...sanitized },
  };
}
