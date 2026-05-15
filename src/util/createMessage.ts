import { Message } from "@/app/types";

type CreateMessageParams = {
  role: Message["role"];
  content: string;
};

export function createMessage({ role, content }: CreateMessageParams): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}
