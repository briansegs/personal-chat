"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ClearChatButton } from "@/components/ClearChatButton";
import { Message, Model } from "./types";
import { MessagesContainer } from "@/components/MessagesContainer";
import { InputContainer } from "@/components/InputContainer";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const MESSAGES_KEY = "local-chat-messages";
const MODEL_KEY = "local-chat-model";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useLocalStorage<Model>(MODEL_KEY, "phi3");
  const [messages, setMessages] = useLocalStorage<Message[]>(MESSAGES_KEY, []);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 200;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

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

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    sendMessage();
  }

  function clearChat() {
    setMessages([]);
    setModel("phi3");
  }

  function triggerSendMessage(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="w-3xl mx-auto p-6 h-screen flex flex-col">
      <Header />

      <ClearChatButton clearChat={clearChat} />

      <MessagesContainer messages={messages} />

      <InputContainer
        handleSubmit={handleSubmit}
        textareaRef={textareaRef}
        input={input}
        setInput={setInput}
        loading={loading}
        triggerSendMessage={triggerSendMessage}
        model={model}
        setModel={setModel}
      />
    </main>
  );
}
