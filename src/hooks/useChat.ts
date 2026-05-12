import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Message, Model } from "@/app/types";

const MESSAGES_KEY = "local-chat-messages";
const MODEL_KEY = "local-chat-model";

export function useChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useLocalStorage<Model>(MODEL_KEY, "phi3");
  const [messages, setMessages] = useLocalStorage<Message[]>(MESSAGES_KEY, []);

  async function sendToApi(nextMessages: Message[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: nextMessages,
      }),
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      throw new Error(
        `Failed to send message (${res.status}): ${details || res.statusText}`
      );
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    let assistantText = "";

    if (!reader) return;

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          const content = json.message?.content;

          if (!content) continue;

          assistantText += content;

          setMessages((prev) => {
            const copy = [...prev];

            const lastMessage = copy[copy.length - 1];

            if (lastMessage?.role === "assistant") {
              copy[copy.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
            } else {
              copy.push({
                role: "assistant",
                content: assistantText,
              });
            }

            return copy;
          });
        } catch {}
      }
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setInput("");
    setLoading(true);

    const nextMessages = (() => {
      const base = messages;
      return [...base, userMessage];
    })();

    setMessages(nextMessages);

    try {
      await sendToApi(nextMessages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setModel("phi3");
  }

  return {
    input,
    setInput,
    loading,
    messages,
    model,
    setModel,
    sendMessage,
    clearChat,
  };
}
