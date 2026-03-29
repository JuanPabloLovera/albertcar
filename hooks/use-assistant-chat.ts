"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  INITIAL_OIL_FORM,
  type ChatMessage,
  type ChatResponseBody,
  type ConversationStep,
  type OilForm,
  type ServiceType,
} from "@/lib/types";

type PostChatPayload = {
  step: ConversationStep;
  message?: string;
  formData?: Partial<OilForm>;
};

type PostChatResult = {
  ok: boolean;
  data: ChatResponseBody;
};

async function postChat(body: PostChatPayload): Promise<PostChatResult> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as ChatResponseBody;
  return { ok: response.ok, data };
}

function toFriendlyError(code: string) {
  switch (code) {
    case "invalid_form":
      return "Hay datos por corregir en el formulario.";
    case "rate_limited":
      return "Se detectaron muchas solicitudes seguidas.";
    case "server_error":
      return "Ocurrió un error interno en el servidor.";
    case "network_error":
      return "No fue posible conectar con el servidor.";
    default:
      return "Ocurrió un problema al procesar la solicitud.";
  }
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<ConversationStep>("start");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<OilForm>(INITIAL_OIL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => !isLoading && input.trim().length > 0, [input, isLoading]);

  const pushUserMessage = useCallback((content: string) => {
    setMessages((current) => [...current, { role: "user", content }]);
  }, []);

  const pushBotMessage = useCallback((content: string) => {
    setMessages((current) => [...current, { role: "bot", content }]);
  }, []);

  const applyResponse = useCallback((result: PostChatResult) => {
    pushBotMessage(result.data.reply);
    setStep(result.data.next);
    setShowForm(Boolean(result.data.form));
    setErrorMessage(result.ok ? "" : toFriendlyError(result.data.error || "request_error"));
  }, [pushBotMessage]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await postChat({ step: "start" });
      setMessages([{ role: "bot", content: result.data.reply }]);
      setStep(result.data.next);
      setShowForm(Boolean(result.data.form));
    } catch {
      setMessages([
        {
          role: "bot",
          content: "No fue posible iniciar el asistente. Revise la conexión e intente nuevamente.",
        },
      ]);
      setStep("start");
      setShowForm(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void startConversation();
  }, [startConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showForm, isLoading]);

  const sendServiceSelection = useCallback(async (serviceLabel: string, _serviceValue: ServiceType) => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");
    pushUserMessage(serviceLabel);

    try {
      const result = await postChat({
        step,
        message: serviceLabel,
      });
      applyResponse(result);
    } catch {
      pushBotMessage("No se pudo procesar la solicitud. Intente nuevamente.");
      setErrorMessage(toFriendlyError("network_error"));
    } finally {
      setIsLoading(false);
    }
  }, [applyResponse, isLoading, pushBotMessage, pushUserMessage, step]);

  const sendMessage = useCallback(async () => {
    if (!canSend) return;

    const currentMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setErrorMessage("");
    pushUserMessage(currentMessage);

    try {
      const result = await postChat({
        step,
        message: currentMessage,
      });
      applyResponse(result);
    } catch {
      pushBotMessage("No se pudo procesar la solicitud. Intente nuevamente.");
      setErrorMessage(toFriendlyError("network_error"));
    } finally {
      setIsLoading(false);
    }
  }, [applyResponse, canSend, input, pushBotMessage, pushUserMessage, step]);

  const submitForm = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await postChat({ step: "submit_oil_form", formData });
      applyResponse(result);
    } catch {
      pushBotMessage("No se pudo enviar el formulario. Intente nuevamente.");
      setErrorMessage(toFriendlyError("network_error"));
    } finally {
      setIsLoading(false);
    }
  }, [applyResponse, formData, isLoading, pushBotMessage]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setStep("start");
    setShowForm(false);
    setFormData(INITIAL_OIL_FORM);
    setErrorMessage("");
    void startConversation();
  }, [startConversation]);

  const updateFormField = useCallback((field: keyof OilForm, value: string) => {
    setFormData((current) => {
      if (field === "marca") {
        const brandChanged = current.marca.trim().toLowerCase() !== value.trim().toLowerCase();

        return {
          ...current,
          marca: value,
          modelo: brandChanged ? "" : current.modelo,
        };
      }

      return { ...current, [field]: value };
    });
  }, []);

  return {
    canSend,
    errorMessage,
    formData,
    input,
    isLoading,
    messages,
    messagesEndRef,
    resetChat,
    sendMessage,
    sendServiceSelection,
    setInput,
    showForm,
    step,
    submitForm,
    updateFormField,
  };
}
