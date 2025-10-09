// src/helpers/api.js
const BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
// rest of file unchanged…


async function readJsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const txt = await res.text();
  throw new Error(`Expected JSON, got ${ct || "unknown"}: ${txt.slice(0, 200)}…`);
}

export async function callAnalyze(payload, files = []) {
  const hasFiles = Array.isArray(files) && files.length > 0;
  const url = `${BASE}/analyze`;
  let res;

  if (hasFiles) {
    const form = new FormData();
    form.append("text", payload?.text || "");
    form.append("lang", payload?.lang || "en");
    form.append("region", payload?.region || "US");
    for (const f of files) form.append("files", f, f.name);

    res = await fetch(url, {
      method: "POST",
      body: form,
      headers: { Accept: "application/json" },
    });
  } else {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload || {}),
    });
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json())?.error || msg; } catch {}
    throw new Error(msg);
  }
  return readJsonOrText(res);
}
