import { Message } from "@/app/types";
import { createMessage } from "@/util/createMessage";

type CreateChatTurnResult = {
  userMessage: Message;
  assistantMessage: Message;
  nextMessages: Message[];
};

export function createChatTurn(
  input: string,
  messages: Message[]
): CreateChatTurnResult {
  const userMessage = createMessage({
    role: "user",
    content: input,
  });

  const assistantMessage = createMessage({
    role: "assistant",
    content: "",
  });

  return {
    userMessage,
    assistantMessage,
    nextMessages: [...messages, userMessage, assistantMessage],
  };
}
