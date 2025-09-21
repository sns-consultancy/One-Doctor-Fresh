import React, { useState } from "react";
import styles from "../styles/SymptomChecker.module.css";
import { extractTextFromImage } from "../utils/ocr";

const API_BASE = process.env.REACT_APP_API_BASE || ""; // "" in dev with CRA proxy

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States - USD");

  async function readJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const txt = await res.text();
      throw new Error(`Expected JSON, got ${ct || "unknown"}: ${txt.slice(0, 200)}…`);
    }
    return res.json();
  }

  // voice input (kept, with safer fallback)
  const handleVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice recognition not supported.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => setInput(e.results?.[0]?.[0]?.transcript || "");
    rec.onerror = (e) => {
      console.warn("Speech error:", e.error);
      setError(
        e.error === "not-allowed"
          ? "Microphone permission denied."
          : e.error === "no-speech"
          ? "No speech detected."
          : "Speech recognition failed."
      );
    };
    rec.start();
  };

  const speakResponse = (text) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); setResponse("");

    try {
      const res = await fetch(`${API_BASE}/api/ai/symptom-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ prompt: input, ocr_language: language, region_currency: region }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "API request failed");

      setResponse(data.summary || "");
      speakResponse(data.summary || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side OCR helper (kept) – appends recognized text to the input
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    let allText = "";
    for (const file of files) {
      try {
        const text = await extractTextFromImage(file);
        allText += `\n[File: ${file.name}]\n${text}`;
      } catch (err) {
        console.error(`OCR failed for ${file.name}:`, err);
        allText += `\n[File: ${file.name}] OCR failed.\n`;
      }
    }
    if (allText) setInput((prev) => (prev ? prev + "\n" : "") + allText);
  };

  // share helpers (kept)
  const handleEmail = () => {
    if (!response) return;
    const subject = encodeURIComponent("Symptom Analysis Report");
    const body = encodeURIComponent(response);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const handleWhatsApp = () => {
    if (!response) return;
    const message = encodeURIComponent(response);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };
  const handleSMS = () => {
    if (!response) return;
    const message = encodeURIComponent(response);
    window.location.href = `sms:?body=${message}`;
  };
  const handleDownload = () => {
    if (!response) return;
    const blob = new Blob([response], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "symptom_analysis.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleSaveToDocs = () => {
    if (!response) return;
    const title = prompt("Enter a title for this report:");
    if (!title) return;
    const saved = JSON.parse(localStorage.getItem("savedSymptomReports") || "[]");
    saved.push({ title, text: response, date: new Date().toISOString() });
    localStorage.setItem("savedSymptomReports", JSON.stringify(saved));
    alert("Report saved successfully!");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>🩺 Symptom Checker</h2>
      <p className={styles.subheading}>
        Enter your symptoms, record voice, or upload files. Results will be translated to your selected language.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.selectRow}>
          <label>
            OCR Language:
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </label>
          <label>
            Region & Currency:
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>United States - USD</option>
              <option>Europe - EUR</option>
              <option>India - INR</option>
            </select>
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className={styles.input}
          placeholder="Describe your symptoms in detail..."
          required
        />

        <div className={styles.buttons}>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button type="button" onClick={handleVoiceInput} className={styles.voiceButton}>
            🎤 Voice Input
          </button>
        </div>

        <div className={styles.fileUpload}>
          <label>
            Upload Files (PDFs, Images, Videos):
            <input type="file" accept=".pdf,image/*,video/*" multiple onChange={handleFileUpload} />
          </label>
        </div>
      </form>

      {response && (
        <div className={styles.responseBox}>
          <strong>Possible Causes:</strong>
          <p>{response}</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.shareRow}>
        <button onClick={handleEmail}>📧 Email</button>
        <button onClick={handleWhatsApp}>💬 WhatsApp</button>
        <button onClick={handleSMS}>📱 SMS</button>
        <button onClick={handleDownload}>📂 Download</button>
        <button onClick={handleSaveToDocs}>💾 Save to Documents</button>
      </div>

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> This analysis is AI-generated and does not replace professional medical advice.
      </p>
    </div>
  );
}
