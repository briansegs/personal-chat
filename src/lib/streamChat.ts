import { Message, Model } from "@/app/types";

type StreamChatOptions = {
  messages: Message[];
  model: Model;
  signal?: AbortSignal;
  onChunk: (content: string) => void;
};

export async function streamChat({
  messages,
  model,
  signal,
  onChunk,
}: StreamChatOptions) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
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

  const reader = res.body?.getReader();

  if (!reader) {
    throw new Error("Response body is missing.");
  }

  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");

    buffer = lines.pop() ?? "";

    for (const line of lines) {
      try {
        const json = JSON.parse(line);

        const content = json.message?.content;

        if (!content) continue;

        onChunk(content);
      } catch (error) {
        console.error("Failed to parse stream chunk:", error);
      }
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    try {
      const json = JSON.parse(buffer);

      const content = json.message?.content;

      if (content) {
        onChunk(content);
      }
    } catch (error) {
      console.error("Failed to parse final stream chunk:", error);
    }
  }
}
