import React, { useState, useRef, useEffect } from "react";

export default function AIChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // { text, from: "user" | "bot" }
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // auto-scroll to last message
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { text: input.trim(), from: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 🔒 Call serverless function. Do NOT send any OpenAI key from the client.
      const res = await fetch("/.netlify/functions/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Function accepts either {from,text} or {role,content}
          messages: [...messages, userMsg],
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Support both real OpenAI response and echo fallback
      const reply =
        data?.choices?.[0]?.message?.content ??
        data?.reply ??
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [...prev, { text: reply, from: "bot" }]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I had trouble responding. Please try again.", from: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem", maxWidth: 420 }}>
      <h3 style={{ marginTop: 0 }}>🤖 Chat with Health Assistant</h3>

      <div
        ref={listRef}
        style={{ maxHeight: 260, overflowY: "auto", marginBottom: ".5rem", paddingRight: 4 }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: ".5rem", textAlign: m.from === "user" ? "right" : "left" }}>
            <span
              style={{
                background: m.from === "user" ? "#e0f7fa" : "#f1f8e9",
                padding: ".4rem .6rem",
                borderRadius: 6,
                display: "inline-block",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ opacity: 0.7 }}>Assistant is typing…</div>}
      </div>

      <div style={{ display: "flex", gap: ".5rem" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question…"
          rows={2}
          style={{ flex: 1, resize: "vertical" }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
