import React, { useState, useEffect } from "react";

export default function AIChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, from: "user" }]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: `You are a friendly health assistant. ${input}`,
          max_tokens: 150,
          temperature: 0.6
        })
      });
      const data = await res.json();
      const reply = data.choices[0].text.trim();
      setMessages((prev) => [...prev, { text: reply, from: "bot" }]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [...prev, { text: "Sorry, I had trouble responding.", from: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", maxWidth: "400px" }}>
      <h3>🤖 Chat with Health Assistant</h3>
      <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "0.5rem" }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "0.5rem",
              textAlign: m.from === "user" ? "right" : "left"
            }}
          >
            <span
              style={{
                background: m.from === "user" ? "#e0f7fa" : "#f1f8e9",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                display: "inline-block"
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1 }}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
