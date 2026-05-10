"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    });

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

    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Personal Chat</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto w-fit"
                : "bg-gray-100 w-fit"
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

      <div className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border p-4 rounded-lg mb-4"
          rows={2}
          placeholder="Ask something..."
        />

        <button
          onClick={() => sendMessage()}
          className="bg-black text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </main>
  );
}
