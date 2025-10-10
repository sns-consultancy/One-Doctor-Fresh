import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";   // ✅ keep this import
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Send web-vitals to your API (uses beacon when possible)
function sendToMetrics(metric) {
  const body = JSON.stringify(metric);

  

  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/metrics", blob);
      return;
    } catch {}
  }
// index.jsx (or wherever you call sendToMetrics)
function sendToMetrics(metric) {
  if (import.meta.env.PROD) return; // skip on Netlify prod
  const body = JSON.stringify(metric);
  navigator.sendBeacon?.('/api/metrics', new Blob([body], { type: 'application/json' }));
}

  fetch("/api/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((err) => console.error("Error reporting web vitals:", err));
}

reportWebVitals(sendToMetrics);  // ✅ now defined
