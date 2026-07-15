import { PromptTemplate } from "@/types";

export const BUILTIN_TEMPLATES: PromptTemplate[] = [
  {
    id: "summarize",
    name: "Summarize Text",
    category: "builtin",
    description: "Condense long text into key points",
    prompt: "Summarize the following text concisely:\n\n{{input}}",
  },
  {
    id: "explain-code",
    name: "Explain Code",
    category: "builtin",
    description: "Step-by-step code explanation",
    prompt: "Explain this code step by step:\n\n```\n{{input}}\n```",
  },
  {
    id: "generate-ideas",
    name: "Generate Ideas",
    category: "builtin",
    description: "Creative ideas on a topic",
    prompt: "Generate 10 creative ideas for:\n\n{{input}}",
  },
  {
    id: "rewrite",
    name: "Rewrite Content",
    category: "builtin",
    description: "Improve clarity and tone",
    prompt: "Rewrite the following for clarity and a professional tone:\n\n{{input}}",
  },
  {
    id: "translate",
    name: "Translate",
    category: "builtin",
    description: "Translate to another language",
    prompt: "Translate the following to Spanish:\n\n{{input}}",
  },
  {
    id: "email",
    name: "Create Email",
    category: "builtin",
    description: "Draft a professional email",
    prompt: "Draft a professional email about:\n\n{{input}}",
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    category: "builtin",
    description: "Explore solutions collaboratively",
    prompt: "Brainstorm solutions for:\n\n{{input}}",
  },
];

export function applyTemplate(template: PromptTemplate, input: string): string {
  return template.prompt.replace(/\{\{input\}\}/g, input.trim());
}
