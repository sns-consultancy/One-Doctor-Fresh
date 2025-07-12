import React, { useState } from "react";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a helpful medical assistant that helps users check their symptoms." },
            { role: "user", content: `Please analyze this symptom: ${input}` }
          ]
        })
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      const text = data.choices[0].message.content;
      setResponse(text);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Symptom Checker</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: "0.5rem" }}
          placeholder="Describe your symptoms..."
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check Symptoms"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      {response && (
        <div style={{ marginTop: "1rem", background: "#f1f1f1", padding: "1rem", borderRadius: "4px" }}>
          <strong>AI Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
