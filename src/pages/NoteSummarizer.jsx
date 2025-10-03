// src/pages/NoteSummarizer.js
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/NoteSummarizer.module.css";

const API_BASE = process.env.REACT_APP_API_BASE || "";

export default function NoteSummarizer() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States - USD");
  const [bullets, setBullets] = useState(5);
  const [readingLevel, setReadingLevel] = useState("grade8");

  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Language map for voice + OCR
  const LANG = {
    English: { locale: "en-US", tess: "eng" },
    Telugu:  { locale: "te-IN", tess: "tel" },
    Hindi:   { locale: "hi-IN", tess: "hin" },
    Spanish: { locale: "es-ES", tess: "spa" },
    French:  { locale: "fr-FR", tess: "fra" },
    German:  { locale: "de-DE", tess: "deu" },
  };
  const selected = LANG[language] || LANG.English;

  // ====== Voice input ======
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = selected.locale;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? `${prev} ${t}` : t));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [selected.locale]);

  const startStopVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) { setError("Voice input not supported in this browser."); return; }
    if (listening) { rec.stop(); setListening(false); }
    else { setError(""); setListening(true); rec.start(); }
  };

  // ====== Read aloud with real voice selection ======
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

  // ====== Helpers ======
  const readJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const snippet = await res.text();
      throw new Error(`Expected JSON but got ${ct || "unknown"}: ${snippet.slice(0, 200)}…`);
    }
    return res.json();
  };

  // ====== Actions ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSummary("");
    const text = input.trim();
    if (text.length < 10) { setError("Please paste more content (≥ 10 characters)."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/note-summarizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          text,
          bullets: Number(bullets) || 5,
          reading_level: readingLevel,
          reply_language: language,           // <-- make backend answer in selected language
          ocr_language: language,
          ocr_lang_code: selected.tess,
          region_currency: region,
        }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Request failed.");
      const out = data.summary || data.result || data.text || "No summary returned by the server.";
      setSummary(out);
    } catch (err) {
      setError(err?.message || "Failed to summarize.");
    } finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setSummary(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bullets", String(Number(bullets) || 5));
      fd.append("reading_level", readingLevel);
      fd.append("reply_language", language);  // <-- selected language for summary
      fd.append("ocr_language", language);
      fd.append("ocr_lang_code", selected.tess);
      fd.append("region_currency", region);

      const res = await fetch(`${API_BASE}/api/ai/note-summarizer/upload`, { method: "POST", body: fd });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      const out = data.summary || data.extracted_text || "Uploaded and processed successfully.";
      setSummary(out);
    } catch (err) {
      setError(err?.message || "Failed to process the file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // Extra UX
  const copySummary = async () => {
    if (!summary) return;
    try { await navigator.clipboard.writeText(summary); alert("Copied!"); } catch {}
  };
  const clearAll = () => { setInput(""); setSummary(""); setError(""); };

  const count = input.length;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>📝</span>
          <h2>Note Summarizer</h2>
        </div>
        <p className={styles.muted}>Paste notes, speak, or upload PDFs/images. We’ll produce a concise summary.</p>

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

            <label className={styles.field}>
              <span>Bullet Count</span>
              <input type="number" min="1" max="12" value={bullets} onChange={(e) => setBullets(e.target.value)} />
            </label>

            <label className={styles.field}>
              <span>Reading Level</span>
              <select value={readingLevel} onChange={(e) => setReadingLevel(e.target.value)}>
                <option value="grade6">grade6</option>
                <option value="grade8">grade8</option>
                <option value="grade10">grade10</option>
                <option value="college">college</option>
              </select>
            </label>
          </div>

          <div className={styles.textareaWrap}>
            <textarea
              rows={8}
              placeholder="Paste notes here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className={styles.counter}>{count.toLocaleString()} chars</div>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.primary}`} type="submit" disabled={loading}>
              {loading ? "Summarizing…" : "Summarize"}
            </button>
            <label className={`${styles.btn} ${styles.secondary}`} style={{ cursor: "pointer" }}>
              📄 Upload PDF / Image
              <input id="fileUpload" type="file" accept=".pdf,image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
            <button type="button" className={styles.btn} onClick={startStopVoice}>
              {listening ? "🎙️ Stop" : "🎤 Voice Input"}
            </button>
            <button type="button" className={styles.btn} onClick={() => speak(summary || input)}>🔊 Read Aloud</button>
            <button type="button" className={styles.btn} onClick={copySummary}>📋 Copy</button>
            <button type="button" className={styles.btn} onClick={clearAll}>🧹 Clear</button>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {summary && (
          <div className={styles.result}>
            <h3>Summary</h3>
            <pre>{summary}</pre>
          </div>
        )}

        <p className={styles.disclaimer}>⚠️ AI-generated. For information only.</p>
      </div>
    </div>
  );
}
