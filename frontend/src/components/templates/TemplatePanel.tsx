import { BookmarkPlus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { PromptTemplate } from "@/types";

interface TemplatePanelProps {
  templates: PromptTemplate[];
  onSave: (name: string, prompt: string) => void;
  onDelete: (id: string) => void;
}

export function TemplatePanel({ templates, onSave, onDelete }: TemplatePanelProps) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !prompt.trim()) return;
    onSave(name.trim(), prompt.trim());
    setName("");
    setPrompt("");
    setShowForm(false);
  };

  return (
    <div className="border-t border-surface-border p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
          Templates
        </h2>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="rounded p-1 hover:bg-[rgb(var(--surface))] text-accent"
          title="Save custom template"
        >
          <BookmarkPlus className="h-4 w-4" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 space-y-2 rounded-lg border border-surface-border p-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Template name"
            className="w-full rounded-lg border border-surface-border bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Use {{input}} as placeholder"
            rows={3}
            className="w-full resize-none rounded-lg border border-surface-border bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Save Template
          </button>
        </form>
      )}

      <ul className="max-h-32 space-y-1 overflow-y-auto text-xs">
        {templates.map((template) => (
          <li
            key={template.id}
            className="group flex items-center justify-between rounded px-2 py-1.5 hover:bg-[rgb(var(--surface))]"
          >
            <span className="truncate">{template.name}</span>
            {template.category === "custom" && (
              <button
                onClick={() => onDelete(template.id)}
                className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
