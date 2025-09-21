// src/pages/HealthChatbot.js
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/HealthChatbot.module.css";

const API_BASE = process.env.REACT_APP_API_BASE || "";

export default function HealthChatbot() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States - USD");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // UI language -> locale + tess code
  const LANG = {
    English: { locale: "en-US", tess: "eng" },
    Telugu:  { locale: "te-IN", tess: "tel" },
    Hindi:   { locale: "hi-IN", tess: "hin" },
    Spanish: { locale: "es-ES", tess: "spa" },
    French:  { locale: "fr-FR", tess: "fra" },
    German:  { locale: "de-DE", tess: "deu" },
  };
  const selected = LANG[language] || LANG.English;

  // load STT engine for the selected language
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = selected.locale;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const transcript = e.results?.[0]?.[0]?.transcript || "";
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, [selected.locale]);

  // Load TTS voices once & pick best match
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices() || []);
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);
  const pickVoice = (locale) => {
    const list = voices || [];
    let v = list.find(v => v.lang?.toLowerCase() === locale.toLowerCase());
    if (v) return v;
    const base = locale.split("-")[0];
    return list.find(v => v.lang?.toLowerCase().startsWith(base)) || null;
  };

  const startStopListening = () => {
    if (!recognitionRef.current) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setError("");
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1; u.pitch = 1; u.lang = selected.locale;
      const v = pickVoice(selected.locale);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const readJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const snippet = await res.text();
      throw new Error(`Expected JSON but got ${ct || "unknown"}: ${snippet.slice(0, 200)}…`);
    }
    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResponse("");
    if (!input.trim()) { setError("Please type a question."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/health-chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          prompt: input,
          reply_language: language,       // ensures answer in selected language
          ocr_language: language,
          ocr_lang_code: selected.tess,   // tess code for OCR
          region_currency: region,
        }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Request failed.");
      const text = data.reply || data.answer || data.message || "No response received.";
      setResponse(text);
      speak(text);
    } catch (err) {
      setError(err?.message || "Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("ocr_language", language);
    fd.append("ocr_lang_code", selected.tess);
    fd.append("reply_language", language);   // respond in selected language
    fd.append("region_currency", region);

    setLoading(true); setResponse("");
    try {
      const res = await fetch(`${API_BASE}/api/ai/health-chatbot/upload`, { method: "POST", body: fd });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      const text = data.reply || data.extracted_text || data.summary || "";
      setResponse(text || "Uploaded and processed successfully.");
      if (text) speak(text);
    } catch (err) {
      setError(err?.message || "Failed to process the file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>💬</span>
          <h2>Health Chatbot</h2>
        </div>
        <p className={styles.muted}>Ask your health-related questions, record voice, or upload files.</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option><option>Spanish</option><option>French</option>
                <option>German</option><option>Telugu</option><option>Hindi</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Region &amp; Currency</span>
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option>United States - USD</option><option>India - INR</option>
                <option>United Kingdom - GBP</option><option>Europe - EUR</option>
              </select>
            </label>
          </div>

          <div className={styles.textareaWrap}>
            <textarea
              rows={6}
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.primary}`} type="submit" disabled={loading}>
              {loading ? "Asking…" : "Ask"}
            </button>
            <button className={styles.btn} type="button" onClick={startStopListening} disabled={!recognitionRef.current}>
              {listening ? "🎙️ Stop" : "🎤 Voice Input"}
            </button>
            <label className={`${styles.btn} ${styles.secondary}`} style={{ cursor: "pointer" }}>
              📄 Upload PDF / Image / Video
              <input type="file" accept=".pdf,image/*,video/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {response && (
          <div className={styles.result}>
            <h3>Answer</h3>
            <pre>{response}</pre>
          </div>
        )}

        <p className={styles.disclaimer}>
          ⚠️ This AI does not provide medical diagnoses or prescriptions. Always consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}
