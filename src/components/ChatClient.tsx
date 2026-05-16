"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ClearChatButton } from "@/components/ClearChatButton";
import { MessagesContainer } from "@/components/MessagesContainer";
import { InputContainer } from "@/components/InputContainer";
import { useChat } from "@/hooks/useChat";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { ChatSidebar } from "./ChatSidebar";

export default function ChatClient() {
  const {
    input,
    setInput,
    status,
    messages,
    model,
    setModel,
    sendMessage,
    clearChat,
    stopGenerating,
    sessions,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    renameSession,
    error,
  } = useChat();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    const wasBusy = previousStatusRef.current !== "idle";
    const isNowIdle = status === "idle";

    if (wasBusy && isNowIdle) {
      textareaRef.current?.focus();
    }

    previousStatusRef.current = status;
  }, [status]);

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

    textareaRef.current?.focus();
  }

  function triggerSendMessage(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && status === "idle") {
      e.preventDefault();

      sendMessage();

      textareaRef.current?.focus();
    }
  }

  return (
    <SidebarProvider>
      <div className="w-full relative">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          createNewSession={createNewSession}
          deleteSession={deleteSession}
          renameSession={renameSession}
        />
        <div className="absolute z-50 bg-sidebar">
          <SidebarTrigger size="icon-lg" />
        </div>

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
            status={status}
            triggerSendMessage={triggerSendMessage}
            model={model}
            setModel={setModel}
            stopGenerating={stopGenerating}
            error={error}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
