// netlify/functions/ai-chat.js

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    const { messages = [] } = JSON.parse(event.body || "{}");

    // Normalize to OpenAI role/content shape
    const normalized = messages.map((m) => {
      if (m?.role && m?.content) return m;
      if (m?.from && m?.text) {
        const role = m.from === "user" ? "user" : m.from === "system" ? "system" : "assistant";
        return { role, content: m.text };
      }
      return null;
    }).filter(Boolean);

    // Fallback prompt guard
    if (!normalized.length) {
      normalized.push({
        role: "system",
        content: "You are a helpful health assistant. You do not provide medical advice; you summarize and explain.",
      });
      normalized.push({ role: "user", content: "Say hello." });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no key configured, return a friendly echo so dev still works
    if (!apiKey) {
      const lastUser =
        [...normalized].reverse().find((m) => m.role === "user")?.content || "Hello!";
      const content = `You said: "${lastUser}". (Demo reply — set OPENAI_API_KEY in Netlify to enable real AI.)`;

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        body: JSON.stringify({
          choices: [{ message: { role: "assistant", content } }],
        }),
      };
    }

    // Call OpenAI Chat Completions (adjust model if you like)
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: normalized,
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, headers: CORS_HEADERS, body: text };
    }

    const data = await resp.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
}
