export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  responseTimeMs?: number;
  tokenUsage?: TokenUsage;
  incomplete?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  tokenUsage: TokenUsage;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: "builtin" | "custom";
  prompt: string;
  description?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  available: boolean;
}

export interface ProviderStatus {
  id: string;
  name: string;
  configured: boolean;
}

export interface HealthResponse {
  status: string;
  providers: ProviderStatus[];
}

export interface StreamError {
  code: string;
  message: string;
}
