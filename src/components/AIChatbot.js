import React, { useState } from "react";

export default function AIChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, from: "user" }]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a friendly health assistant." },
            ...messages.map(m => ({
              role: m.from === "user" ? "user" : "assistant",
              content: m.text
            })),
            { role: "user", content: input }
          ]
        })
      });

      const data = await res.json();
      const reply = data.choices[0].message.content.trim();

      setMessages(prev => [...prev, { text: reply, from: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: "Error getting response.", from: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "0.5rem" }}>
      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "0.5rem 0" }}>
            <b>{m.from === "user" ? "You:" : "Bot:"}</b> {m.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "80%", marginRight: "0.5rem" }}
        onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
