import { ModelInfo } from "@/types";

interface ModelSelectorProps {
  models: ModelInfo[];
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, value, onChange, disabled }: ModelSelectorProps) {
  const availableModels = models.filter((model) => model.available);

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || availableModels.length === 0}
      className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
    >
      {availableModels.length === 0 ? (
        <option value="">No models available</option>
      ) : (
        availableModels.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))
      )}
      {models
        .filter((model) => !model.available)
        .map((model) => (
          <option key={model.id} value={model.id} disabled>
            {model.name} (coming soon)
          </option>
        ))}
    </select>
  );
}

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SystemPromptEditor({ value, onChange, disabled }: SystemPromptEditorProps) {
  return (
    <div className="border-b border-surface-border bg-surface-elevated px-4 py-3">
      <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
        System Prompt
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="You are a professional software engineer."
        className="w-full rounded-lg border border-surface-border bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
      />
    </div>
  );
}
