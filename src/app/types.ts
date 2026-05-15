export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const MODELS = ["phi3", "llama3.1", "qwen2.5-coder"] as const;

export type Model = (typeof MODELS)[number];

export type ChatSession = {
  id: string;
  title: string;
  model: Model;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

export type ChatStatus = "idle" | "streaming" | "error";
