"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ClearChatButton } from "@/components/ClearChatButton";
import { MessagesContainer } from "@/components/MessagesContainer";
import { InputContainer } from "@/components/InputContainer";
import { useChat } from "@/hooks/useChat";

export default function ChatClient() {
  const {
    input,
    setInput,
    loading,
    messages,
    model,
    setModel,
    sendMessage,
    clearChat,
    stopGenerating,
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

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    sendMessage();
  }

  function triggerSendMessage(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="w-3xl mx-auto p-6 h-screen flex flex-col bg-background">
      <Header />

      <div className="flex justify-center pb-2">
        <ClearChatButton clearChat={clearChat} />
      </div>

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
        stopGenerating={stopGenerating}
      />
    </main>
  );
}
