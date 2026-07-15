import { Download, Menu, Moon, Sun, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { ModelSelector, SystemPromptEditor } from "@/components/settings/SettingsBar";
import { SessionList } from "@/components/sidebar/SessionList";
import { TemplatePanel } from "@/components/templates/TemplatePanel";
import { exportSessionJson, exportSessionMarkdown, fetchHealth, fetchModels, streamChat } from "@/lib/api";
import { createMessage, useWorkspaceStore } from "@/stores/workspaceStore";
import { ModelInfo, ProviderStatus } from "@/types";

export default function App() {
  const {
    darkMode,
    sessions,
    activeSessionId,
    isStreaming,
    error,
    toggleDarkMode,
    createSession,
    deleteSession,
    setActiveSession,
    addMessage,
    updateMessage,
    setSystemPrompt,
    setModel,
    setStreaming,
    setError,
    saveCustomTemplate,
    deleteCustomTemplate,
    getActiveSession,
    getAllTemplates,
    addTokenUsage,
  } = useWorkspaceStore();

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeSession = getActiveSession();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    } else if (!activeSessionId) {
      setActiveSession(sessions[0].id);
    }
  }, [sessions.length, activeSessionId, createSession, setActiveSession, sessions]);

  useEffect(() => {
    fetchModels()
      .then((data) => setModels(data.models ?? []))
      .catch(() => setError("Could not connect to the API. Is the backend running?"));
  }, [setError]);

  useEffect(() => {
    fetchHealth()
      .then((data) => setProviders(data.providers ?? []))
      .catch(() => undefined);
  }, []);

  const handleSend = async (content: string) => {
    if (!activeSession || isStreaming) return;

    const userMessage = createMessage("user", content);
    addMessage(activeSession.id, userMessage);

    const assistantMessage = createMessage("assistant", "");
    addMessage(activeSession.id, assistantMessage);
    setStreamingMessageId(assistantMessage.id);
    setStreaming(true);
    setError(null);

    const messages = [
      ...(activeSession.systemPrompt.trim()
        ? [{ role: "system" as const, content: activeSession.systemPrompt.trim() }]
        : []),
      ...activeSession.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user" as const, content },
    ];

    abortRef.current = new AbortController();
    let accumulated = "";
    let latestUsage = { prompt: 0, completion: 0, total: 0 };

    await streamChat(
      { model: activeSession.model, messages },
      {
        onChunk: (chunk) => {
          accumulated += chunk;
          updateMessage(activeSession.id, assistantMessage.id, { content: accumulated });
        },
        onUsage: (usage) => {
          latestUsage = usage;
        },
        onDone: (responseTimeMs) => {
          addTokenUsage(activeSession.id, assistantMessage.id, latestUsage, responseTimeMs);
          setStreaming(false);
          setStreamingMessageId(null);
        },
        onError: (code, message) => {
          if (accumulated) {
            updateMessage(activeSession.id, assistantMessage.id, {
              content: accumulated,
              incomplete: true,
            });
          } else {
            updateMessage(activeSession.id, assistantMessage.id, {
              content: `**Error:** ${message}`,
            });
          }
          setError(message);
          setStreaming(false);
          setStreamingMessageId(null);
          if (code === "invalid_api_key") {
            setError("Invalid API key. Configure OPENAI_API_KEY in backend/.env");
          }
        },
      },
      abortRef.current.signal,
    );
  };

  const sessionTokens = activeSession?.tokenUsage.total ?? 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-surface-border bg-surface-elevated transition md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={(id) => {
            setActiveSession(id);
            setSidebarOpen(false);
          }}
          onDelete={deleteSession}
          onNewChat={() => {
            createSession();
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
        <TemplatePanel
          templates={getAllTemplates()}
          onSave={saveCustomTemplate}
          onDelete={deleteCustomTemplate}
        />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-surface-border bg-surface-elevated px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-[rgb(var(--surface))] md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 flex-wrap items-center gap-3">
            {activeSession && (
              <ModelSelector
                models={models}
                value={activeSession.model}
                onChange={(model) => setModel(activeSession.id, model)}
                disabled={isStreaming}
              />
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1 rounded-lg bg-[rgb(var(--surface))] px-2.5 py-1.5 text-xs text-[rgb(var(--text-muted))] sm:inline-flex">
                <Zap className="h-3.5 w-3.5" />
                {sessionTokens.toLocaleString()} tokens
              </span>

              <div className="relative">
                <button
                  onClick={() => setExportMenuOpen((value) => !value)}
                  disabled={!activeSession || activeSession.messages.length === 0}
                  className="rounded-lg border border-surface-border p-2 hover:bg-[rgb(var(--surface))] disabled:opacity-50"
                  title="Export chat"
                >
                  <Download className="h-4 w-4" />
                </button>
                {exportMenuOpen && activeSession && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-surface-border bg-surface-elevated py-1 shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--surface))]"
                      onClick={() => {
                        exportSessionMarkdown(activeSession);
                        setExportMenuOpen(false);
                      }}
                    >
                      Export Markdown
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--surface))]"
                      onClick={() => {
                        exportSessionJson(activeSession);
                        setExportMenuOpen(false);
                      }}
                    >
                      Export JSON
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={toggleDarkMode}
                className="rounded-lg border border-surface-border p-2 hover:bg-[rgb(var(--surface))]"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!providers.some((provider) => provider.id === "openai" && provider.configured) && providers.length > 0 && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
            OpenAI API key not configured. Set OPENAI_API_KEY in backend/.env to enable chat.
          </div>
        )}

        {activeSession && (
          <SystemPromptEditor
            value={activeSession.systemPrompt}
            onChange={(value) => setSystemPrompt(activeSession.id, value)}
            disabled={isStreaming}
          />
        )}

        {activeSession ? (
          <>
            <MessageList messages={activeSession.messages} streamingMessageId={streamingMessageId} />
            <ChatInput
              disabled={isStreaming}
              onSend={handleSend}
              templates={getAllTemplates()}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[rgb(var(--text-muted))]">
            Create a chat to begin
          </div>
        )}
      </main>
    </div>
  );
}
