import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/app/types";

import { useEffect, useRef, useState } from "react";
import { ReturnToBottomButton } from "./ReturnToBottomButton";

type MessagesContainerProps = {
  messages: Message[];
};

export function MessagesContainer({ messages }: MessagesContainerProps) {
  const [showNewMessages, setShowNewMessages] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const threshold = 120;

      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      const isNearBottom = distanceFromBottom < threshold;

      shouldAutoScroll.current = isNearBottom;

      setShowNewMessages((prev) => {
        if (prev === !isNearBottom) return prev;
        return !isNearBottom;
      });
    };

    el.addEventListener("scroll", handleScroll);

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!shouldAutoScroll.current) return;

    const isStreaming = messages[messages.length - 1]?.role === "assistant";

    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [messages]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    shouldAutoScroll.current = true;
    setShowNewMessages(false);
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-gutter-stable overscroll-contain"
    >
      {showNewMessages && (
        <ReturnToBottomButton scrollToBottom={scrollToBottom} />
      )}

      {messages.map((msg, i) => (
        <div
          key={i}
          className={`p-3 rounded-lg whitespace-pre-wrap  ${
            msg.role === "user"
              ? "bg-secondary text-foreground ml-auto w-fit"
              : "text-muted-foreground"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const { children, className } = props;

                const match = /language-(\w+)/.exec(className || "");

                return match ? (
                  <SyntaxHighlighter
                    PreTag="div"
                    language={match[1]}
                    style={oneDark}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-200 px-1 py-0.5 rounded">
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
