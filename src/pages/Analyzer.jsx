// src/pages/Analyzer.jsx
import React, { useState } from "react";
import ReportCard from "../components/ReportCard";
import { speak } from "../helpers/tts";
import EmailModal from "../components/EmailModal";

/** POST /analyze — works for text-only and file uploads */
async function callAnalyze({ text, lang = "en", region = "US" }, files = []) {
  const base =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";
  const url = `${base}/analyze`;

  try {
    let res;
    if (files?.length) {
      const form = new FormData();
      form.append("text", text ?? "");
      form.append("lang", lang);
      form.append("region", region);
      files.forEach((f) => form.append("files", f));
      res = await fetch(url, { method: "POST", body: form, credentials: "include" });
    } else {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, lang, region }),
      });
    }

    const ct = res.headers.get("content-type") || "";
    if (!res.ok) {
      const errText = ct.includes("application/json")
        ? (await res.json())?.detail || "Error"
        : await res.text();
      return { ok: false, error: errText, inputs: { lang, region, files: files.map(f => f.name) } };
    }

    if (ct.includes("application/json")) {
      const data = await res.json();
      // normalize to { ok, analysis, inputs }
      return { ok: true, ...data, inputs: data.inputs ?? { lang, region, files: files.map(f => f.name) } };
    } else {
      const textOut = await res.text();
      return { ok: true, analysis: textOut, inputs: { lang, region, files: files.map(f => f.name) } };
    }
  } catch (e) {
    return { ok: false, error: String(e), inputs: { lang, region, files: files.map(f => f.name) } };
  }
}

export default function Analyzer() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [toast, setToast] = useState("");

  const onAnalyze = async () => {
    setLoading(true);
    const out = await callAnalyze({ text, lang: "en", region: "US" }, files);
    setResult(out);
    setLoading(false);
    if (!out?.ok) {
      setToast(out?.error || "Analyze failed");
      setTimeout(() => setToast(""), 1800);
    }
  };

  const onCopy = async (val) => {
    try {
      await navigator.clipboard.writeText(val || "");
      setToast("Copied!");
      setTimeout(() => setToast(""), 1200);
    } catch {}
  };

  /** POST /share-email — uses current `result` */
  const sendEmailRequest = async ({ email, subject }) => {
    const base =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "";
    try {
      const res = await fetch(`${base}/share-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: email,
          subject,
          analysis: result?.analysis || "",
          meta: result?.inputs || {},
        }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const errText = ct.includes("application/json")
          ? (await res.json())?.detail || "Error"
          : await res.text();
        return { ok: false, error: errText };
      }
      return ct.includes("application/json") ? await res.json() : { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };

  return (
    <div className="p-4">
      {!!toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-3">
        <textarea
          className="w-full min-h-[140px] rounded-xl border p-3"
          placeholder="Describe symptoms..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <button
            onClick={onAnalyze}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      <ReportCard
        result={result}
        onSpeak={(a) => speak(a)}
        onCopy={onCopy}
        onEmail={() => setEmailOpen(true)}
      />

      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        onSend={sendEmailRequest}
      />
    </div>
  );
}
