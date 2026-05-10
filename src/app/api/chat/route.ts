export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.1",
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();

  return Response.json({
    response: data.response,
  });
}
