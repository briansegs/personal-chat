import { Message } from "@/app/types";

export function updateAssistantMessage(messages: Message[], content: string) {
  const copy = [...messages];

  const lastMessage = copy[copy.length - 1];

  if (lastMessage?.role === "assistant") {
    copy[copy.length - 1] = {
      role: "assistant",
      content,
    };
  } else {
    copy.push({
      role: "assistant",
      content,
    });
  }

  return copy;
}
