"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ClearChatButton } from "@/components/ClearChatButton";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Model = "phi3" | "llama3.1" | "qwen2.5-coder";

const validModels: Model[] = ["phi3", "llama3.1", "qwen2.5-coder"];

function isModel(value: string): value is Model {
  return validModels.includes(value as Model);
}

const STORAGE_KEY = "local-chat-messages";
const MODEL = "local-chat-model";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<Model>(() => {
    if (typeof window === "undefined") {
      return "phi3";
    }

    const saved = localStorage.getItem(MODEL);

    return saved && isModel(saved) ? saved : "phi3";
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : [];
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 200;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    localStorage.setItem(MODEL, model);
  }, [model]);

  useEffect(() => {
    const filtered = messages.filter((m) => {
      if (m.role === "assistant" && m.content.trim() === "") {
        return false;
      }
      return true;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    try {
      setLoading(true);

      const userMessage: Message = {
        role: "user",
        content: input,
      };

      const updatedMessages = [...messages, userMessage];

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: updatedMessages,
        }),
      });

      if (!res.ok) {
        const details = await res.text().catch(() => "");
        throw new Error(
          `Failed to send message (${res.status}): ${details || res.statusText}`
        );
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            const content = json.message?.content;

            if (content) {
              assistantText += content;

              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: assistantText,
                };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    sendMessage();
  }

  function clearChat() {
    setMessages([]);
    setModel("phi3");

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MODEL);
  }

  return (
    <main className="w-3xl mx-auto p-6 h-screen flex flex-col">
      <Header />

      <ClearChatButton clearChat={clearChat} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-gutter-stable scroll-smooth">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg whitespace-pre-wrap ${
              msg.role === "user" && "bg-blue-100 ml-auto w-fit"
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
      </div>

      <form
        onSubmit={(e) => handleSubmit(e)}
        className="flex flex-col gap-2 border rounded-lg p-2"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !loading) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="w-full border p-4 rounded-lg resize-none"
          rows={1}
          placeholder="Ask something..."
        />

        <div className="flex items-center justify-between">
          <select
            name="model"
            id="model-select"
            value={model}
            className="cursor-pointer"
            onChange={(e) => {
              const value = e.target.value;

              if (isModel(value)) {
                setModel(value);
              }
            }}
          >
            <option value="phi3">phi3</option>
            <option value="llama3.1">llama3.1</option>
            <option value="qwen2.5-coder">qwen2.5-coder</option>
          </select>

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </form>
    </main>
  );
}
