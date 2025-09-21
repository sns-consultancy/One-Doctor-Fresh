import React, { useState } from "react";
import styles from "../styles/AiHistory.module.css";
import { extractTextFromFile } from "../utils/extractText";

const API_BASE = process.env.REACT_APP_API_BASE || ""; // "" in dev if using CRA proxy

export default function AiHistory() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");     // pretty JSON string
  const [extracted, setExtracted] = useState("");   // OCR/text preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [isRecording, setIsRecording] = useState(false);

  const languageMap = {
    eng: "en-US",
    hin: "hi-IN",
    tel: "te-IN",
    spa: "es-ES",
    fra: "fr-FR",
  };

  // ---- utils ----
  async function readJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const txt = await res.text();
      throw new Error(`Expected JSON, got ${ct || "unknown"}: ${txt.slice(0, 200)}…`);
    }
    return res.json();
  }

  const speak = (text) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = languageMap[selectedLanguage] || "en-US";
      window.speechSynthesis.speak(u);
    } catch {}
  };

  // ---- voice input (kept, with broader browser support) ----
  const handleVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = languageMap[selectedLanguage] || "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsRecording(true);
    rec.onend = () => setIsRecording(false);
    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
      alert("Voice input failed. Please try again.");
    };
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? prev + " " : "") + transcript);
      setIsRecording(false);
    };
    rec.start();
  };

  // ---- text submit to backend ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResponse(""); setExtracted("");
    if (!input.trim()) { setError("Please enter medical history text."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/medical-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Request failed.");

      setResponse(JSON.stringify(data, null, 2));
      speak("Your medical history summary is ready.");
    } catch (err) {
      setError(err.message || "Failed to analyze.");
    } finally {
      setLoading(false);
    }
  };

  // ---- file upload: try server OCR+parse, fall back to local extract + server parse ----
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError(""); setResponse(""); setExtracted("");
    setLoading(true);

    const extractedChunks = [];
    const structuredList = [];

    try {
      for (const file of files) {
        // 1) try server-side OCR+parse
        try {
          const fd = new FormData();
          fd.append("file", file);
          const up = await fetch(`${API_BASE}/api/ai/medical-history/upload`, {
            method: "POST",
            body: fd,
          });
          const data = await readJson(up);
          if (!up.ok) throw new Error(data.error || "Upload failed.");

          if (data.extracted_text) extractedChunks.push(`[${file.name}]\n${data.extracted_text}`);
          const { extracted_text, ...structured } = data;
          structuredList.push(structured);
          continue; // next file
        } catch (serverErr) {
          console.warn("Server upload failed, falling back to client OCR:", serverErr);
        }

        // 2) client fallback: extract text locally, then ask backend to structure it
        try {
          const localText = await extractTextFromFile(file, selectedLanguage);
          if (localText?.trim()) {
            extractedChunks.push(`[${file.name}] (local OCR)\n${localText}`);
            const res = await fetch(`${API_BASE}/api/ai/medical-history`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify({ text: localText }),
            });
            const data = await readJson(res);
            if (!res.ok) throw new Error(data.error || "Parse failed.");
            structuredList.push(data);
          } else {
            extractedChunks.push(`[${file.name}] Could not extract text.`);
          }
        } catch (localErr) {
          extractedChunks.push(`[${file.name}] Text extraction failed: ${localErr.message}`);
        }
      }

      if (extractedChunks.length) {
        setExtracted(extractedChunks.join("\n\n"));
        // also append to input so the user can edit/submit if they want
        setInput((prev) => (prev ? prev + "\n\n" : "") + extractedChunks.join("\n\n"));
      }

      if (structuredList.length) {
        const out = structuredList.length === 1 ? structuredList[0] : structuredList;
        setResponse(JSON.stringify(out, null, 2));
      } else {
        setResponse("");
      }
    } catch (err) {
      setError(err.message || "Failed to process file(s).");
    } finally {
      setLoading(false);
      e.target.value = ""; // reset chooser
    }
  };

  // ---- share helpers (kept) ----
  const handleEmail = (text) => {
    const subject = encodeURIComponent("My Medical History Summary");
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const handleWhatsApp = (text) => {
    const message = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };
  const handleSMS = (text) => {
    const message = encodeURIComponent(text);
    window.location.href = `sms:?body=${message}`;
  };
  const handleDownload = (text) => {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "medical_history.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const handleSaveToDocs = () => {
    if (!response) return;
    const title = prompt("Document title:");
    if (!title) return;
    const saved = JSON.parse(localStorage.getItem("savedDocuments") || "[]");
    saved.push({ title, text: response, date: new Date().toISOString() });
    localStorage.setItem("savedDocuments", JSON.stringify(saved));
    alert("Document saved successfully!");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📋 AI Medical History</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.selectRow}>
          <label>
            Select Language:
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="eng">English</option>
              <option value="hin">Hindi</option>
              <option value="tel">Telugu</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
            </select>
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className={styles.input}
          placeholder="Enter your medical history here..."
          required
        />

        <div className={styles.buttons}>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <label className={styles.button} style={{ cursor: "pointer" }}>
            📄 Upload PDF/Image
            <input type="file" accept=".pdf,image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`${styles.voiceButton} ${isRecording ? styles.recording : ""}`}
          >
            {isRecording ? "🎙️ Listening..." : "🎤 Voice Input"}
          </button>
        </div>
      </form>

      {extracted && (
        <div className={styles.responseBox}>
          <strong>Extracted Text (preview):</strong>
          <pre>{extracted}</pre>
        </div>
      )}

      {response && (
        <div className={styles.responseBox}>
          <strong>Structured History (JSON):</strong>
          <pre>{response}</pre>
          <div className={styles.actionButtons}>
            <button type="button" onClick={() => handleEmail(response)} className={styles.button}>📧 Email</button>
            <button type="button" onClick={() => handleWhatsApp(response)} className={styles.button}>💬 WhatsApp</button>
            <button type="button" onClick={() => handleSMS(response)} className={styles.button}>📱 SMS</button>
            <button type="button" onClick={() => handleDownload(response)} className={styles.button}>⬇️ Download</button>
            <button type="button" onClick={handleSaveToDocs} className={styles.button}>💾 Save</button>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> Summaries are AI-generated and do not replace professional advice.
      </p>
    </div>
  );
}
