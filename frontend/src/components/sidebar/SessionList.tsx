import { MessageSquarePlus, Trash2, X } from "lucide-react";

import { ChatSession } from "@/types";

interface SessionListProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  onNewChat,
  onClose,
}: SessionListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-surface-border p-4">
        <h1 className="text-lg font-semibold">AI Workspace</h1>
        {onClose && (
          <button onClick={onClose} className="md:hidden rounded-lg p-1 hover:bg-[rgb(var(--surface))]">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length === 0 ? (
          <p className="px-3 py-2 text-sm text-[rgb(var(--text-muted))]">No conversations yet</p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <div
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
                    session.id === activeSessionId
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-[rgb(var(--surface))]"
                  }`}
                >
                  <button
                    onClick={() => onSelect(session.id)}
                    className="flex-1 truncate text-left"
                  >
                    {session.title}
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-red-500/10 hover:text-red-500 transition"
                    title="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
