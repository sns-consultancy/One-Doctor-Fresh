// netlify/functions/ai-chat.js
export const handler = async (event) => {
  try {
    const { messages = [] } = JSON.parse(event.body || "{}");

    // TODO: call your FastAPI, or OpenAI server-side here and craft a reply.
    // Example stub (echo last user message):
    const lastUser = [...messages].reverse().find(m => m.from === "user");
    const reply = lastUser
      ? `You said: "${lastUser.text}". I'm here to help with health questions (non-medical advice).`
      : "Hello! How can I help today?";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};
