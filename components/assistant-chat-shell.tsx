"use client";

import dynamic from "next/dynamic";

const AssistantChat = dynamic(
  () => import("@/components/assistant-chat").then((mod) => mod.AssistantChat),
  {
    ssr: false,
    loading: () => (
      <div className="card chatBox chatSkeleton" aria-live="polite">
        <div className="chatHeader">
          <strong>Asistente del taller</strong>
        </div>
        <div className="msg bot">Cargando asistente...</div>
      </div>
    ),
  },
);

export function AssistantChatShell() {
  return <AssistantChat />;
}
