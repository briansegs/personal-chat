export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Model = "phi3" | "llama3.1" | "qwen2.5-coder";
