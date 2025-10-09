// src/components/SymptomChecker.jsx
import React, { useState, useRef } from "react";
import { callAnalyze } from "../helpers/api";
// ⬇️ Point to your styles folder (not components)
import styles from "../styles/SymptomChecker.module.css";

export default function SymptomChecker() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");
  const [region, setRegion] = useState("US");
  const [loading, setLoading] = useState(false);

  // NEW: editable text + UI flags (does not remove any existing state)
  const [analysisText, setAnalysisText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const recRef = useRef(null);

  const handleAnalyze = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await callAnalyze({ text, lang, region }, files);
      setResult(JSON.stringify(res, null, 2));

      // NEW: capture human-readable text (fallbacks preserve behavior)
      const editable =
        res?.analysis?.summary ||
        res?.analysis ||
        res?.message ||
        (typeof res === "string" ? res : "");
      setAnalysisText(editable || "");
      setIsEditing(false);
    } catch (err) {
      setError("Error analyzing symptoms: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
  };

  const handleRemoveFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleVoice = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        setError("Speech recognition not supported in this browser.");
        return;
      }
      const recognition = new SR();
      recRef.current = recognition;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const heard = event?.results?.[0]?.[0]?.transcript || "";
        setText((t) => (t ? t + " " + heard : heard));
      };
      recognition.onerror = (e) =>
        setError("Speech error: " + (e?.error || "unknown"));
      recognition.start();
    } catch {
      setError("Unable to start voice input.");
    }
  };

  const handleStopVoice = () => {
    try {
      recRef.current?.stop?.();
    } catch {}
  };

  // UPDATED: prefer edited text for speech, fallback to parsed JSON or raw result
  const speakResult = () => {
    try {
      const preferred = (analysisText || "").trim();
      if (preferred) {
        const u = new SpeechSynthesisUtterance(preferred);
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
        return;
      }
      if (!result) return;
      const parsed = JSON.parse(result);
      const textToSpeak =
        parsed?.analysis?.summary ||
        parsed?.analysis ||
        parsed?.message ||
        (typeof parsed === "string" ? parsed : result);
      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    } catch {
      const u = new SpeechSynthesisUtterance(result || "");
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  // NEW: utilities for copy & download (work for both text & JSON views)
  const handleCopy = async () => {
    const toCopy = showJson ? (result || "") : (analysisText || "");
    try {
      await navigator.clipboard.writeText(toCopy);
    } catch {
      setError("Unable to copy to clipboard.");
    }
  };

  const handleDownload = () => {
    const content = showJson ? (result || "") : (analysisText || "");
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = showJson
      ? "symptom-analysis.json"
      : "symptom-analysis.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Symptom Checker</h2>
      <p className={styles.subheading}>
        Describe your symptoms and (optionally) attach files.
      </p>

      <div className={styles.selectRow}>
        <label>
          Language
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className={styles.input}
          >
            <option value="en">English</option>
            <option value="es">Spanish (es)</option>
            <option value="fr">French (fr)</option>
            <option value="de">German (de)</option>
            <option value="hi">Hindi (hi)</option>
            <option value="te">Telugu (te)</option>
          </select>
        </label>

        <label>
          Region
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={styles.input}
          >
            <option value="US">United States</option>
            <option value="EU">Europe</option>
            <option value="IN">India</option>
          </select>
        </label>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className={styles.input}
        placeholder="e.g., headache for 2 days, mild fever, light sensitivity…"
      />

      <div className={styles.fileUpload}>
        <label>
          Attach files
          <input type="file" multiple onChange={handleFilesPicked} />
        </label>

        {files?.length > 0 && (
          <div className={styles.uploadPreview}>
            <ul>
              {files.map((f, i) => (
                <li key={i}>
                  {f.name}{" "}
                  <button type="button" onClick={() => handleRemoveFile(i)}>
                    remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.buttons}>
        <button
          onClick={handleAnalyze}
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        <button onClick={handleVoice} className={styles.voiceButton}>
          🎤 Voice Input
        </button>
        <button onClick={handleStopVoice} className={styles.button}>
          ⏹ Stop
        </button>
        <button onClick={speakResult} className={styles.button} disabled={!result}>
          🔊 Read Out
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* RESULT VIEWER with edit controls */}
      {result && (
        <div className={styles.responseBox}>
          {/* Controls */}
          <div className={styles.buttons} style={{ marginBottom: "0.5rem" }}>
            <button
              onClick={() => setShowJson(false)}
              className={styles.button}
              aria-pressed={!showJson}
              title="Show editable text"
            >
              Show Text
            </button>
            <button
              onClick={() => setShowJson(true)}
              className={styles.button}
              aria-pressed={showJson}
              title="Show raw JSON"
            >
              Show JSON
            </button>

            {!showJson && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={styles.button}
              >
                Edit Text
              </button>
            )}
            {!showJson && isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.button}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    // Rebuild from JSON if user wants to revert
                    try {
                      const parsed = JSON.parse(result);
                      const original =
                        parsed?.analysis?.summary ||
                        parsed?.analysis ||
                        parsed?.message ||
                        (typeof parsed === "string" ? parsed : "");
                      setAnalysisText(original || "");
                    } catch {
                      // keep current analysisText
                    }
                    setIsEditing(false);
                  }}
                  className={styles.button}
                >
                  Cancel
                </button>
              </>
            )}

            <button onClick={handleCopy} className={styles.button}>
              Copy
            </button>
            <button onClick={handleDownload} className={styles.button}>
              Download
            </button>
          </div>

          {/* Viewers */}
          {showJson ? (
            <pre
              style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >
              {result}
            </pre>
          ) : isEditing ? (
            <textarea
              className={styles.input}
              style={{ minHeight: 300 }}
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
            />
          ) : (
            <pre
              style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >
              {analysisText || "(No analysis text)"}
            </pre>
          )}
        </div>
      )}

      <p className={styles.disclaimer}>
        This tool doesn’t provide medical diagnoses. If you’re experiencing
        severe or worsening symptoms, seek urgent care.
      </p>
    </div>
  );
}
