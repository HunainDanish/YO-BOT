import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createId, createMessage, deriveSessionTitle, emptyTokenUsage } from "@/lib/api";
import { BUILTIN_TEMPLATES } from "@/lib/templates";
import { ChatSession, Message, PromptTemplate, TokenUsage } from "@/types";

interface WorkspaceState {
  darkMode: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  customTemplates: PromptTemplate[];
  isStreaming: boolean;
  error: string | null;

  toggleDarkMode: () => void;
  createSession: () => string;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  updateSession: (id: string, patch: Partial<ChatSession>) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, patch: Partial<Message>) => void;
  setSystemPrompt: (sessionId: string, prompt: string) => void;
  setModel: (sessionId: string, model: string) => void;
  setStreaming: (value: boolean) => void;
  setError: (error: string | null) => void;
  saveCustomTemplate: (name: string, prompt: string) => void;
  deleteCustomTemplate: (id: string) => void;
  getActiveSession: () => ChatSession | null;
  getAllTemplates: () => PromptTemplate[];
  addTokenUsage: (sessionId: string, messageId: string, usage: TokenUsage, responseTimeMs?: number) => void;
}

function createEmptySession(): ChatSession {
  const now = Date.now();
  return {
    id: createId(),
    title: "New Chat",
    messages: [],
    systemPrompt: "You are a helpful AI assistant.",
    model: "gpt-4o-mini",
    createdAt: now,
    updatedAt: now,
    tokenUsage: emptyTokenUsage(),
  };
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      sessions: [],
      activeSessionId: null,
      customTemplates: [],
      isStreaming: false,
      error: null,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      createSession: () => {
        const session = createEmptySession();
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: session.id,
          error: null,
        }));
        return session.id;
      },

      deleteSession: (id) =>
        set((state) => {
          const sessions = state.sessions.filter((session) => session.id !== id);
          let activeSessionId = state.activeSessionId;
          if (activeSessionId === id) {
            activeSessionId = sessions[0]?.id ?? null;
          }
          return { sessions, activeSessionId };
        }),

      setActiveSession: (id) => set({ activeSessionId: id, error: null }),

      updateSession: (id, patch) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...patch, updatedAt: Date.now() } : session,
          ),
        })),

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session;
            const isFirstUser = message.role === "user" && session.messages.filter((m) => m.role === "user").length === 0;
            return {
              ...session,
              title: isFirstUser ? deriveSessionTitle(message.content) : session.title,
              messages: [...session.messages, message],
              updatedAt: Date.now(),
            };
          }),
        })),

      updateMessage: (sessionId, messageId, patch) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.map((message) =>
                    message.id === messageId ? { ...message, ...patch } : message,
                  ),
                  updatedAt: Date.now(),
                }
              : session,
          ),
        })),

      setSystemPrompt: (sessionId, prompt) => get().updateSession(sessionId, { systemPrompt: prompt }),

      setModel: (sessionId, model) => get().updateSession(sessionId, { model }),

      setStreaming: (value) => set({ isStreaming: value }),

      setError: (error) => set({ error }),

      saveCustomTemplate: (name, prompt) =>
        set((state) => ({
          customTemplates: [
            ...state.customTemplates,
            { id: createId(), name, prompt, category: "custom" },
          ],
        })),

      deleteCustomTemplate: (id) =>
        set((state) => ({
          customTemplates: state.customTemplates.filter((template) => template.id !== id),
        })),

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((session) => session.id === activeSessionId) ?? null;
      },

      getAllTemplates: () => [...BUILTIN_TEMPLATES, ...get().customTemplates],

      addTokenUsage: (sessionId, messageId, usage, responseTimeMs) =>
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session;
            return {
              ...session,
              tokenUsage: {
                prompt: session.tokenUsage.prompt + usage.prompt,
                completion: session.tokenUsage.completion + usage.completion,
                total: session.tokenUsage.total + usage.total,
              },
              messages: session.messages.map((message) =>
                message.id === messageId
                  ? { ...message, tokenUsage: usage, responseTimeMs }
                  : message,
              ),
              updatedAt: Date.now(),
            };
          }),
        })),
    }),
    {
      name: "ai-workspace",
      partialize: (state) => ({
        darkMode: state.darkMode,
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        customTemplates: state.customTemplates,
      }),
    },
  ),
);

export { createMessage };
