import { Message, Model } from "@/app/types";

type SendChatParams = {
  model: Model;
  messages: Message[];
};

export async function sendChatRequest({ model, messages }: SendChatParams) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!res.ok) {
    const details = await res.text().catch(() => "");

    throw new Error(
      `Failed to send message (${res.status}): ${details || res.statusText}`
    );
  }

  return res;
}
