export type ServiceType = "oil_change" | "maintenance" | "brakes" | "diagnostic";

export type ConversationStep =
  | "start"
  | "await_service"
  | "show_oil_form"
  | "submit_oil_form"
  | "done";

export type MessageRole = "bot" | "user";

export type ChatMessage = {
  role: MessageRole;
  content: string;
};

export type OilForm = {
  patente: string;
  marca: string;
  modelo: string;
  anio: string;
  motor: string;
  kilometraje: string;
  combustible: string;
  nombre: string;
  telefono: string;
};

export type ChatRequestBody = {
  step?: ConversationStep;
  message?: string;
  formData?: Partial<OilForm>;
};

export type RecommendationSource = "fallback" | "azure" | "policy";

export type ChatResponseBody = {
  reply: string;
  next: ConversationStep;
  form?: {
    type: "oil_change";
  };
  error?: string;
  meta?: {
    traceId?: string;
    source?: RecommendationSource;
    warnings?: string[];
    vehicleFingerprint?: string;
  };
};

export type RecommendationResult = {
  aceite: string;
  filtro: string;
  precioAceite: string;
  precioFiltro: string;
  motivo: string;
};

export const INITIAL_OIL_FORM: OilForm = {
  patente: "",
  marca: "",
  modelo: "",
  anio: "",
  motor: "",
  kilometraje: "",
  combustible: "",
  nombre: "",
  telefono: "",
};

export const SERVICE_BUTTONS: Array<{ label: string; value: ServiceType }> = [
  { label: "Cambio de aceite", value: "oil_change" },
  { label: "Mantención", value: "maintenance" },
  { label: "Frenos", value: "brakes" },
  { label: "Diagnóstico", value: "diagnostic" },
];
