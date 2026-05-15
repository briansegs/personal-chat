import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChatSession, Message, Model } from "@/app/types";
import { appendMessage, updateMessageContent } from "@/util/messageUtils";
import {
  DEFAULT_TITLE,
  generateSessionTitle,
  isDefaultTitle,
} from "@/util/titleUtils";
import { generateAssistantResponse } from "@/lib/chatService";
import { ChatStatus } from "@/app/types";
import { createMessage } from "@/util/createMessage";

const SESSION_KEY = "chat-sessions";
const ACTIVE_SESSION = "active-chat-session";
const DEFAULT_MODEL: Model = "phi3";

function now() {
  return new Date().toISOString();
}

export function useChat() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    SESSION_KEY,
    []
  );
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>(
    ACTIVE_SESSION,
    null
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

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

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: DEFAULT_TITLE,
      model: DEFAULT_MODEL,
      createdAt: now(),
      updatedAt: now(),
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, [setSessions, setActiveSessionId]);

  useEffect(() => {
    return () => {
      stopActiveRequest();
    };
  }, []);

  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  useEffect(() => {
    if (!activeSessionId) {
      setActiveSessionId(sessions[0]?.id ?? null);
      return;
    }

    const hasActiveSession = sessions.some(
      (session) => session.id === activeSessionId
    );

    if (!hasActiveSession) {
      setActiveSessionId(sessions[0]?.id ?? null);
    }
  }, [sessions, activeSessionId, setActiveSessionId]);

  const updateSession = useCallback(
    (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...updater(session),
                updatedAt: now(),
              }
            : session
        )
      );
    },
    [setSessions]
  );

  function appendUserMessage(
    sessionId: string,
    userMessage: Message,
    nextMessages: Message[]
  ) {
    updateSession(sessionId, (session) => {
      const shouldGenerateTitle = isDefaultTitle(session.title);
      return {
        ...session,
        title: shouldGenerateTitle
          ? generateSessionTitle(userMessage.content)
          : session.title,
        messages: nextMessages,
      };
    });
  }

  async function sendMessage() {
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

    let failed = false;
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

      failed = true;
      setStatus("error");
      setError(error instanceof Error ? error.message : "Unknown error");
      console.error(error);
    } finally {
      abortControllerRef.current = null;
      if (!failed) {
        setStatus("idle");
      }
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

  function deleteSession(sessionId: string) {
    const updated = sessions.filter((session) => session.id !== sessionId);

    setSessions(updated);

    if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0]?.id ?? null);
    }
  }

  function renameSession(sessionId: string, title: string) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    updateSession(sessionId, (session) => ({
      ...session,
      title: trimmedTitle,
    }));
  }

  return {
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
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    renameSession,
    error,
  };
}
