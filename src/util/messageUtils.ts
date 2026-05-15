import { Message } from "@/app/types";

export function appendMessage(messages: Message[], message: Message) {
  return [...messages, message];
}

export function upsertAssistantMessage(
  messages: Message[],
  content: string
): Message[] {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage?.role === "assistant") {
    return [
      ...messages.slice(0, -1),
      {
        role: "assistant",
        content,
      },
    ];
  }

  return [
    ...messages,
    {
      role: "assistant",
      content,
    },
  ];
}
