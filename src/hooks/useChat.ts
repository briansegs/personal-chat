import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Model } from "@/app/types";
import { appendMessage, updateMessageContent } from "@/util/messageUtils";

import { generateAssistantResponse } from "@/lib/chatService";
import { ChatStatus } from "@/app/types";
import { createMessage } from "@/util/createMessage";
import { DEFAULT_MODEL, useChatSessions } from "./useChatSessions";

export function useChat() {
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);

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

  const abortControllerRef = useRef<AbortController | null>(null);

  const messages = activeSession?.messages ?? [];

  const model = activeSession?.model ?? DEFAULT_MODEL;

  function setModel(model: Model) {
    if (!activeSessionId) return;

    updateSession(activeSessionId, (session) => ({
      ...session,
      model,
    }));
  }

  function stopActiveRequest() {
    abortControllerRef.current?.abort();
  }

  function resetRequestState() {
    abortControllerRef.current = null;
    setStatus("idle");
    setError(null);
  }

  function cancelRequest() {
    stopActiveRequest();
    resetRequestState();
  }

  useEffect(() => {
    return () => {
      stopActiveRequest();
    };
  }, []);

  async function sendMessage(
    input: string,
    setInput: Dispatch<SetStateAction<string>>
  ) {
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

    setInput("");
    setError(null);
    setStatus("streaming");

    try {
      const controller = new AbortController();

      abortControllerRef.current = controller;

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
      abortControllerRef.current = null;
      setStatus("idle");
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
