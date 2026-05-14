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
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (sessions.length === 0) {
      if (!activeSessionId) {
        createNewSession();
      }

      return;
    }

    const hasActiveSession = sessions.some(
      (session) => session.id === activeSessionId
    );

    if (!hasActiveSession) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId, createNewSession, setActiveSessionId]);

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

  async function sendToApi(
    nextMessages: Message[],
    sessionId: string,
    model: Model
  ) {
    const controller = new AbortController();

    abortControllerRef.current = controller;

    let assistantText = "";

    function appendAssistantMessage(sessionId: string, content: string) {
      assistantText += content;

      updateSession(sessionId, (session) => {
        const copy = [...session.messages];

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

        return {
          ...session,
          messages: copy,
        };
      });
    }

    await streamChat({
      messages: nextMessages,
      model,
      signal: controller.signal,

      onChunk(content) {
        appendAssistantMessage(sessionId, content);
      },
    });
  }

  function generateSessionTitle(content: string) {
    return content.length > 25
      ? content.slice(0, 25).trim() + "..."
      : content.trim();
  }

  async function sendMessage() {
    if (!input.trim() || loading || !activeSessionId) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setInput("");
    setLoading(true);

    const nextMessages = [...messages, userMessage];

    updateSession(activeSessionId, (session) => {
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

    try {
      await sendToApi(nextMessages, activeSessionId, model);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error(error);
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  }

  function clearChat() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setLoading(false);

    if (!activeSessionId) return;

    updateSession(activeSessionId, (session) => ({
      ...session,
      messages: [],
      updatedAt: now(),
    }));
  }

  function stopGenerating() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
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
