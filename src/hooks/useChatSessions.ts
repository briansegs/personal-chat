import { ChatSession, Message, Model } from "@/app/types";
import { useLocalStorage } from "./useLocalStorage";
import { useCallback, useEffect } from "react";
import {
  DEFAULT_TITLE,
  generateSessionTitle,
  isDefaultTitle,
} from "@/util/titleUtils";

const SESSION_KEY = "chat-sessions";
const ACTIVE_SESSION = "active-chat-session";
export const DEFAULT_MODEL: Model = "phi3";

function now() {
  return new Date().toISOString();
}

export function useChatSessions() {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    SESSION_KEY,
    []
  );
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>(
    ACTIVE_SESSION,
    null
  );

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

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

  function appendChatTurn(
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

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    renameSession,
    updateSession,
    appendChatTurn,
  };
}
