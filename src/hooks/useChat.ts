import { Model } from "@/app/types";
import { appendMessage, updateMessageContent } from "@/util/messageUtils";

import { generateAssistantResponse } from "@/lib/chatService";
import { createMessage } from "@/util/createMessage";
import { DEFAULT_MODEL, useChatSessions } from "./useChatSessions";
import { useChatRequest } from "./useChatRequest";

export function useChat() {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    renameSession,
    updateSession,
    appendUserMessage,
  } = useChatSessions();

  const {
    status,
    error,
    setError,
    startRequest,
    finishRequest,
    cancelRequest,
  } = useChatRequest();

  const messages = activeSession?.messages ?? [];

  const model = activeSession?.model ?? DEFAULT_MODEL;

  function setModel(model: Model) {
    if (!activeSessionId) return;

    updateSession(activeSessionId, (session) => ({
      ...session,
      model,
    }));
  }

  async function sendMessage(input: string) {
    if (!input.trim() || status === "streaming" || !activeSessionId) {
      return;
    }

    const userMessage = createMessage({
      role: "user",
      content: input,
    });

    const session = sessions.find((session) => session.id === activeSessionId);

    if (!session) return;

    const assistantMessage = createMessage({
      role: "assistant",
      content: "",
    });

    const nextMessages = appendMessage(
      appendMessage(session.messages, userMessage),
      assistantMessage
    );

    appendUserMessage(activeSessionId, userMessage, nextMessages);

    try {
      const controller = startRequest();

      await generateAssistantResponse({
        messages: nextMessages,
        model,
        signal: controller.signal,

        onChunk(content) {
          updateSession(activeSessionId, (session) => ({
            ...session,
            messages: updateMessageContent(
              session.messages,
              assistantMessage.id,
              content
            ),
          }));
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setError(error instanceof Error ? error.message : "Unknown error");

      console.error(error);
    } finally {
      finishRequest();
    }
  }

  function clearChat() {
    cancelRequest();

    if (!activeSessionId) return;

    updateSession(activeSessionId, (session) => ({
      ...session,
      messages: [],
    }));
  }

  function stopGenerating() {
    cancelRequest();
  }

  return {
    status,
    messages,
    model,
    setModel,
    sendMessage,
    clearChat,
    stopGenerating,
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    renameSession,
    error,
  };
}
