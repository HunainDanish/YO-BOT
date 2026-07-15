import { Bot, Clock, Loader2, User, Zap } from "lucide-react";

import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-accent text-white" : "bg-surface-elevated border border-surface-border"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`max-w-[85%] space-y-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-accent text-white rounded-tr-sm"
              : "bg-surface-elevated border border-surface-border rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : (
            <>
              <MarkdownMessage content={message.content || (isStreaming ? "…" : "")} />
              {isStreaming && (
                <span className="inline-flex items-center gap-1 text-xs text-[rgb(var(--text-muted))] mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                </span>
              )}
            </>
          )}
        </div>

        {!isUser && (message.responseTimeMs || message.tokenUsage || message.incomplete) && (
          <div className="flex flex-wrap items-center gap-3 px-1 text-xs text-[rgb(var(--text-muted))]">
            {message.responseTimeMs !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {(message.responseTimeMs / 1000).toFixed(1)}s
              </span>
            )}
            {message.tokenUsage && (
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {message.tokenUsage.total} tokens
              </span>
            )}
            {message.incomplete && <span className="text-amber-500">Response incomplete</span>}
          </div>
        )}
      </div>
    </div>
  );
}
