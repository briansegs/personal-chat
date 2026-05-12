type StreamHandlers = {
  onContent: (content: string) => void;
};

export async function readChatStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  { onContent }: StreamHandlers
) {
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

        onContent(content);
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
        onContent(content);
      }
    } catch (error) {
      console.error("Failed to parse final stream chunk:", error);
    }
  }
}
