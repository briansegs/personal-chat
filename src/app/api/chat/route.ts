export async function POST(req: Request) {
  const { messages } = await req.json();

  const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.1",
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
