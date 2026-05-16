import { ChatStatus } from "@/app/types";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useChatUI(
  status: ChatStatus,
  error: string | null,
  input: string
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previousStatusRef = useRef(status);

  function focusTextarea() {
    textareaRef.current?.focus();
  }

  useEffect(() => {
    focusTextarea();
  }, []);

  useEffect(() => {
    if (!error) return;

    toast.error(error);
  }, [error]);

  useEffect(() => {
    const wasBusy = previousStatusRef.current !== "idle";
    const isNowIdle = status === "idle";

    if (wasBusy && isNowIdle) {
      focusTextarea();
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

  return {
    textareaRef,
    focusTextarea,
  };
}
