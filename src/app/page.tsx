"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ClearChatButton } from "@/components/ClearChatButton";
import { MessagesContainer } from "@/components/MessagesContainer";
import { InputContainer } from "@/components/InputContainer";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const {
    input,
    setInput,
    loading,
    messages,
    model,
    setModel,
    clearChat,
    handleSubmit,
    triggerSendMessage,
  } = useChat();

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
