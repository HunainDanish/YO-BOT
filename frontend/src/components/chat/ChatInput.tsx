import { Send, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

import { applyTemplate } from "@/lib/templates";
import { PromptTemplate } from "@/types";

interface ChatInputProps {
  disabled?: boolean;
  onSend: (content: string) => void;
  templates: PromptTemplate[];
}

export function ChatInput({ disabled, onSend, templates }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    setSelectedTemplate("");
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setInput(applyTemplate(template, input || " "));
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-surface-border bg-surface-elevated p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent shrink-0" />
          <select
            value={selectedTemplate}
            onChange={(event) => handleTemplateChange(event.target.value)}
            className="flex-1 rounded-lg border border-surface-border bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            disabled={disabled}
          >
            <option value="">Prompt templates…</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Ask anything… (Shift+Enter for new line)"
            rows={2}
            disabled={disabled}
            className="flex-1 resize-none rounded-xl border border-surface-border bg-[rgb(var(--surface))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="flex h-auto items-center justify-center rounded-xl bg-accent px-4 text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
