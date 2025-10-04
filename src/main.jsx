// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

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

  fetch("/api/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((err) => console.error("Error reporting web vitals:", err));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="980512048890-h26265srv0cbkgtmtp1foi81d8c98qtm.apps.googleusercontent.com">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals(sendToMetrics);
