import { MessageBubble } from "@/components/chat/MessageBubble";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  streamingMessageId?: string | null;
}

export function MessageList({ messages, streamingMessageId }: MessageListProps) {
  const visible = messages.filter((message) => message.role !== "system");

  if (visible.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface-elevated px-8 py-10 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Welcome to AI Workspace</h2>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Ask a question, pick a template, or customize your system prompt to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
      {visible.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
        />
      ))}
    </div>
  );
}
