import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChatSession, Message, Model } from "@/app/types";
import { streamChat } from "@/lib/streamChat";

const SESSION_KEY = "chat-sessions";
const ACTIVE_SESSION = "active-chat-session";
const DEFAULT_MODEL: Model = "phi3";
const DEFAULT_TITLE = "New Chat";

function now() {
  return new Date().toISOString();
}

export function useChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(false);
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

  function updateAssistantMessage(sessionId: string, assistantContent: string) {
    updateSession(sessionId, (session) => {
      const copy = [...session.messages];

      const lastMessage = copy[copy.length - 1];

      if (lastMessage?.role === "assistant") {
        copy[copy.length - 1] = {
          role: "assistant",
          content: assistantContent,
        };
      } else {
        copy.push({
          role: "assistant",
          content: assistantContent,
        });
      }

      return {
        ...session,
        messages: copy,
      };
    });
  }

  async function sendToApi(
    nextMessages: Message[],
    sessionId: string,
    model: Model
  ) {
    const controller = new AbortController();

    abortControllerRef.current = controller;

    let assistantText = "";

    await streamChat({
      messages: nextMessages,
      model,
      signal: controller.signal,

      onChunk(content) {
        assistantText += content;

        updateAssistantMessage(sessionId, assistantText);
      },
    });
  }

  function generateSessionTitle(content: string) {
    return content.length > 25
      ? content.slice(0, 25).trim() + "..."
      : content.trim();
  }

  function appendUserMessage(sessionId: string, userMessage: Message) {
    const nextMessages = [...messages, userMessage];

    updateSession(sessionId, (session) => {
      const isNewChatTitle = session.title === DEFAULT_TITLE || !session.title;

      return {
        ...session,
        title: isNewChatTitle
          ? generateSessionTitle(
              userMessage.content.replace(/[?.!]/g, "").slice(0, 25).trim()
            )
          : session.title,
        messages: nextMessages,
      };
    });

    return nextMessages;
  }

  async function generateAssistantResponse(
    sessionId: string,
    messages: Message[],
    model: Model
  ) {
    await sendToApi(messages, sessionId, model);
  }

  async function sendMessage() {
    if (!input.trim() || loading || !activeSessionId) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setInput("");
    setLoading(true);

    const nextMessages = appendUserMessage(activeSessionId, userMessage);

    try {
      await generateAssistantResponse(activeSessionId, nextMessages, model);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error(error);
    } finally {
      resetRequestState();
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
    loading,
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
  };
}
