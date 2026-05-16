"use client";

import { Header } from "@/components/Header";
import { ClearChatButton } from "@/components/ClearChatButton";
import { MessagesContainer } from "@/components/MessagesContainer";
import { InputContainer } from "@/components/InputContainer";
import { useChat } from "@/hooks/useChat";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { ChatSidebar } from "./ChatSidebar";
import { useChatUI } from "@/hooks/useChatUI";

export default function ChatClient() {
  const {
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

  const { input, setInput, textareaRef, focusTextarea } = useChatUI(
    status,
    error
  );

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    sendMessage(input, setInput);
  }

  function triggerSendMessage(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && status === "idle") {
      e.preventDefault();

      sendMessage(input, setInput);
    }
  }

  function handleClearChat() {
    clearChat();
    focusTextarea();
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
          focusTextarea={focusTextarea}
        />
        <div className="absolute z-50 bg-sidebar">
          <SidebarTrigger size="icon-lg" />
        </div>

        <main className="h-screen flex flex-col bg-background">
          <div className="absolute md:left-72 top-4 left-16">
            <Header />
          </div>

          <div className="flex justify-center pb-2 absolute right-4 top-4">
            <ClearChatButton handleClearChat={handleClearChat} />
          </div>

          <MessagesContainer
            messages={messages}
            focusTextarea={focusTextarea}
          />

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
