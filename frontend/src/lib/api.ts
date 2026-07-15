import { ChatSession, Message, TokenUsage } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export function getApiBase(): string {
  return API_BASE;
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error("Health check failed");
  return response.json();
}

export async function fetchModels() {
  const response = await fetch(`${API_BASE}/api/models`);
  if (!response.ok) throw new Error("Failed to load models");
  return response.json();
}

interface ChatPayload {
  model: string;
  messages: { role: string; content: string }[];
}

export interface StreamCallbacks {
  onChunk: (content: string) => void;
  onUsage: (usage: TokenUsage) => void;
  onDone: (responseTimeMs: number) => void;
  onError: (code: string, message: string) => void;
}

export async function streamChat(payload: ChatPayload, callbacks: StreamCallbacks, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, stream: true }),
    signal,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    const code = response.status === 401 ? "invalid_api_key" : response.status === 400 ? "empty_prompt" : "connection_failed";
    callbacks.onError(code, message);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError("connection_failed", "No response stream available");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.trim()) continue;

      let eventType = "message";
      let dataLine = "";

      for (const line of part.split("\n")) {
        if (line.startsWith("event:")) eventType = line.slice(6).trim();
        if (line.startsWith("data:")) dataLine = line.slice(5).trim();
      }

      if (!dataLine) continue;

      try {
        const data = JSON.parse(dataLine);
        if (eventType === "chunk") callbacks.onChunk(data.content);
        else if (eventType === "usage") {
          callbacks.onUsage({
            prompt: data.prompt_tokens ?? 0,
            completion: data.completion_tokens ?? 0,
            total: data.total_tokens ?? 0,
          });
        } else if (eventType === "done") callbacks.onDone(data.response_time_ms ?? 0);
        else if (eventType === "error") callbacks.onError(data.code, data.message);
      } catch {
        // ignore malformed events
      }
    }
  }
}

export function exportSessionJson(session: ChatSession): void {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${sanitizeFilename(session.title)}.json`);
}

export function exportSessionMarkdown(session: ChatSession): void {
  const lines = [`# ${session.title}`, "", `Model: ${session.model}`, `Exported: ${new Date().toISOString()}`, ""];

  if (session.systemPrompt.trim()) {
    lines.push("## System Prompt", "", session.systemPrompt, "");
  }

  for (const message of session.messages) {
    if (message.role === "system") continue;
    const label = message.role === "user" ? "You" : "Assistant";
    lines.push(`## ${label}`, "", message.content, "");
    if (message.responseTimeMs) lines.push(`_Response time: ${message.responseTimeMs}ms_`, "");
    if (message.tokenUsage) lines.push(`_Tokens: ${message.tokenUsage.total}_`, "");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  downloadBlob(blob, `${sanitizeFilename(session.title)}.md`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 50) || "chat-export";
}

export function createId(): string {
  return crypto.randomUUID();
}

export function createMessage(role: Message["role"], content: string): Message {
  return { id: createId(), role, content, timestamp: Date.now() };
}

export function deriveSessionTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed || "New Chat";
}

export function emptyTokenUsage(): TokenUsage {
  return { prompt: 0, completion: 0, total: 0 };
}

export function addTokenUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    prompt: a.prompt + b.prompt,
    completion: a.completion + b.completion,
    total: a.total + b.total,
  };
}
