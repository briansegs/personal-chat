import { Model } from "@/app/types";
import { updateMessageContent } from "@/util/messageUtils";

import { generateAssistantResponse } from "@/lib/chatService";
import { DEFAULT_MODEL, useChatSessions } from "./useChatSessions";
import { useChatRequest } from "./useChatRequest";
import { createChatTurn } from "@/util/createChatTurn";

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
    appendChatTurn,
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

  function updateAssistantMessage(
    sessionId: string,
    messageId: string,
    content: string
  ) {
    updateSession(sessionId, (session) => ({
      ...session,
      messages: updateMessageContent(session.messages, messageId, content),
    }));
  }

  async function sendMessage(input: string) {
    if (!input.trim() || status === "streaming" || !activeSessionId) {
      return;
    }

    if (!activeSession) return;

    const { nextMessages, userMessage, assistantMessage } = createChatTurn(
      input,
      activeSession.messages
    );

    appendChatTurn(activeSessionId, userMessage, nextMessages);

    try {
      const controller = startRequest();

      await generateAssistantResponse({
        messages: nextMessages,
        model,
        signal: controller.signal,

        onChunk(content) {
          updateAssistantMessage(activeSessionId, assistantMessage.id, content);
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

  return {
    status,
    messages,
    model,
    setModel,
    sendMessage,
    clearChat,
    stopGenerating: cancelRequest,
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
