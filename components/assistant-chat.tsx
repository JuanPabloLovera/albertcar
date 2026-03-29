"use client";

import type { ChangeEvent, KeyboardEvent } from "react";

import { OilFormCard } from "@/components/oil-form";
import { ServiceGrid } from "@/components/service-grid";
import { useAssistantChat } from "@/hooks/use-assistant-chat";

export function AssistantChat() {
  const {
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
    submitForm,
    updateFormField,
  } = useAssistantChat();

  return (
    <div className="card chatBox" aria-labelledby="chat-heading">
      <div className="chatHeader">
        <div>
          <strong id="chat-heading">Asistente del taller</strong>
          <p className="small">Responde dudas rápidas y orienta cotizaciones básicas.</p>
        </div>
        <button type="button" className="ghostBtn" onClick={resetChat} disabled={isLoading}>
          Reiniciar
        </button>
      </div>

      <ServiceGrid disabled={isLoading} onSelect={sendServiceSelection} />

      <div className="messages" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`msg ${message.role}`}>
            {message.content}
          </div>
        ))}

        {showForm && (
          <OilFormCard formData={formData} disabled={isLoading} onChange={updateFormField} onSubmit={submitForm} />
        )}

        {isLoading && <div className="msg bot">Procesando...</div>}
        <div ref={messagesEndRef} />
      </div>

      {errorMessage && <div className="small errorBanner">{errorMessage}</div>}

      <div className="inputRow">
        <input
          className="textInput"
          placeholder="Ej: ¿Qué aceite usa mi Kia Rio 2018 1.4?"
          aria-label="Escribe tu mensaje"
          value={input}
          disabled={isLoading}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void sendMessage();
            }
          }}
        />
        <button type="button" className="sendBtn" onClick={() => void sendMessage()} disabled={!canSend}>
          Enviar
        </button>
      </div>
    </div>
  );
}
