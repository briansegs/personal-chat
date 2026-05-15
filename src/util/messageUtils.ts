import { Message } from "@/app/types";

export function appendMessage(messages: Message[], message: Message) {
  return [...messages, message];
}

export function updateMessageContent(
  messages: Message[],
  messageId: string,
  content: string
) {
  return messages.map((message) =>
    message.id === messageId
      ? {
          ...message,
          content,
        }
      : message
  );
}
