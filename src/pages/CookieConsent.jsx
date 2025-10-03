import React, { useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookieConsent");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        background: "#222",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <p style={{ margin: 0, fontSize: "0.9rem" }}>
        We use cookies to enhance your experience. By continuing, you agree to our{" "}
        <a href="/cookies" style={{ color: "#4ea1f3" }}>
          Cookie Policy
        </a>.
      </p>
      <button
        onClick={acceptCookies}
        style={{
          background: "#4ea1f3",
          color: "#fff",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Accept
      </button>
    </div>
  );
}
