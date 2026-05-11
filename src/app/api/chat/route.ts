export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  return new Response(ollamaResponse.body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
