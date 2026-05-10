"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResponse("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;

    while (!done) {
      const result = await reader.read();

      done = result.done;

      const chunk = decoder.decode(result.value);

      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);

          if (parsed.response) {
            setResponse((prev) => prev + parsed.response);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Personal Chat</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full border p-4 rounded-lg mb-4"
        rows={6}
        placeholder="Ask something..."
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <div className="mt-6 border rounded-lg p-4 whitespace-pre-wrap min-h-[200px]">
        {response}
      </div>
    </main>
  );
}
