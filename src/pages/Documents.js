import React, { useEffect, useState } from "react";
import styles from "../styles/Documents.module.css";

function safeParse(key) {
  try {
    const raw = localStorage.getItem(key);
    const val = raw ? JSON.parse(raw) : [];
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

function normalize(item, source) {
  // Support older shapes: {title, text, date} or {title, summary, date}
  const title = (item.title || "Untitled").toString().trim() || "Untitled";
  const text = (item.text ?? item.summary ?? "").toString();
  const date = item.date || new Date().toISOString();
  return { title, text, date, source };
}

function dedupe(docs) {
  const seen = new Set();
  const out = [];
  for (const d of docs) {
    const k = `${d.title}|${d.date}|${d.text}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(d);
    }
  }
  // newest first
  out.sort((a, b) => new Date(b.date) - new Date(a.date));
  return out;
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState("");

  // Merge & migrate saved docs on mount
  useEffect(() => {
    const merged = []
      .concat(safeParse("savedDocuments").map((d) => normalize(d, "documents")))
      .concat(safeParse("savedSymptomReports").map((d) => normalize(d, "symptoms")))
      .concat(safeParse("savedNoteSummaries").map((d) => normalize(d, "notes")));

    const unique = dedupe(merged);
    setDocuments(unique);
    // Persist the unified list so future reads are consistent
    localStorage.setItem("savedDocuments", JSON.stringify(unique));
  }, []);

  const handleDownload = (doc) => {
    const blob = new Blob([doc.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = doc.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 80);
    link.href = url;
    link.download = `${safeName || "document"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch {
      alert("Copy failed");
    }
  };

  const handleDelete = (index) => {
    const updated = documents.filter((_, i) => i !== index);
    setDocuments(updated);
    localStorage.setItem("savedDocuments", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (!window.confirm("Delete all saved documents? This cannot be undone.")) return;
    setDocuments([]);
    localStorage.setItem("savedDocuments", JSON.stringify([]));
  };

  const filtered = documents.filter((d) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.text.toLowerCase().includes(q) ||
      (d.source || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📂 Saved Documents</h2>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search title, text, or source…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {documents.length > 0 && (
          <button className={styles.clearAll} onClick={handleClearAll}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No documents found.</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((doc, index) => (
            <li key={`${doc.title}-${doc.date}-${index}`} className={styles.item}>
              <div className={styles.meta}>
                <strong>{doc.title}</strong>
                <small>
                  {new Date(doc.date).toLocaleString()}
                  {doc.source ? ` · ${doc.source}` : ""}
                </small>
              </div>

              {/* Built-in expander to avoid custom modal CSS */}
              <details className={styles.preview}>
                <summary>Preview</summary>
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{doc.text}</pre>
              </details>

              <div className={styles.actions}>
                <button onClick={() => handleDownload(doc)}>💾 Download</button>
                <button onClick={() => handleCopy(doc.text)}>📋 Copy</button>
                <button onClick={() => handleDelete(index)}>🗑️ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
