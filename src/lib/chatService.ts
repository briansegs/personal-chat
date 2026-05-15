import { Message, Model } from "@/app/types";
import { streamChat } from "@/lib/streamChat";

type GenerateAssistantResponseOptions = {
  messages: Message[];
  model: Model;
  signal?: AbortSignal;
  onChunk: (content: string) => void;
};

export async function generateAssistantResponse({
  messages,
  model,
  signal,
  onChunk,
}: GenerateAssistantResponseOptions) {
  let assistantText = "";

  await streamChat({
    messages,
    model,
    signal,

    onChunk(content) {
      assistantText += content;

      onChunk(assistantText);
    },
  });
}
