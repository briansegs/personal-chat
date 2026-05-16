import { ChatStatus } from "@/app/types";
import { useEffect, useRef, useState } from "react";

export function useChatRequest() {
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  function startRequest() {
    const controller = new AbortController();

    abortControllerRef.current = controller;

    setError(null);
    setStatus("streaming");

    return controller;
  }

  function finishRequest() {
    abortControllerRef.current = null;
    setStatus("idle");
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

  return {
    status,
    error,
    setError,
    startRequest,
    finishRequest,
    cancelRequest,
    stopActiveRequest,
  };
}
