export type Message = {
  role: "user" | "assistant";
  content: string;
};

export const MODELS = ["phi3", "llama3.1", "qwen2.5-coder"] as const;

export type Model = (typeof MODELS)[number];
