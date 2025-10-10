// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";

// OPTIONAL: Netlify Function + Stripe Checkout
async function createCheckout(priceId) {
  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    // Support either `url` (Stripe session URL) or `id` pattern you used
    if (data?.url) window.location.href = data.url;
    else if (data?.id) window.location.href = `https://checkout.stripe.com/pay/${data.id}`;
  } catch (e) {
    console.error("Checkout error:", e);
  }
}

export default function NavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // existing dropdown (Settings/Profile/Logout)
  const [aiOpen, setAiOpen] = useState(false);     // new AI dropdown

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpgrade = async () => {
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
    if (priceId) {
      await createCheckout(priceId);
    } else {
      // Fallback to your existing upgrade route
      navigate("/upgrade");
    }
  };

  return (
    <header className={styles.navbar}>
      {/* LEFT: Logo / Brand (unchanged) */}
      <div className={styles["nav-left"]}>
        <Link to="/home" className={styles.logoLink}>
          <img src="/logo192.png" alt="Logo" className={styles.logo} />
          <span className={styles.logoText}>OneDoctor</span>
        </Link>
      </div>

      {/* RIGHT: Quick links + menus */}
      <div className={styles["nav-right"]}>
        {/* Quick Links (preserved) */}
        <Link to="/symptom-checker" className={styles.iconButton}>🩺 Symptoms</Link>
        <Link to="/note-summarizer" className={styles.iconButton}>🧾 Summarizer</Link>
        <Link to="/medical-history" className={styles.iconButton}>📂 Records</Link>
        <Link to="/camera-heart-rate" className={styles.iconButton}>❤️ <span>Camera HR</span></Link>

        {/* New: About page as first-class link */}
        <NavLink to="/about" className={styles.iconButton}>ℹ️ About</NavLink>

        {/* New: AI dropdown (kept separate from Menu) */}
        <div
          className={styles.dropdown}
          onMouseLeave={() => setAiOpen(false)}
        >
          <button
            className={styles.menuButton}
            onClick={() => setAiOpen((v) => !v)}
            aria-expanded={aiOpen}
            aria-haspopup="menu"
          >
            🧠 AI
          </button>
          {aiOpen && (
            <div className={styles.dropdownContent} role="menu">
              <NavLink to="/ai/chatbot" className={styles.iconButton} onClick={() => setAiOpen(false)}>
                Health Chatbot
              </NavLink>
              <NavLink to="/ai/symptom-analyzer" className={styles.iconButton} onClick={() => setAiOpen(false)}>
                Symptom Analyzer
              </NavLink>
              <NavLink to="/ai/note-summarizer" className={styles.iconButton} onClick={() => setAiOpen(false)}>
                Note Summarizer
              </NavLink>
              <NavLink to="/ai/data-view" className={styles.iconButton} onClick={() => setAiOpen(false)}>
                Data View
              </NavLink>
            </div>
          )}
        </div>

        {/* Existing: Menu dropdown (Settings/Profile/Logout) */}
        <div className={styles.dropdown}>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            ☰ Menu
          </button>
          {menuOpen && (
            <div className={styles.dropdownContent} role="menu">
              <Link to="/settings" onClick={() => setMenuOpen(false)}>⚙️ Settings</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Upgrade (now uses Netlify Function if configured) */}
        <button className={styles.upgradeButton} onClick={handleUpgrade}>
          🚀 Upgrade
        </button>
      </div>
    </header>
  );
}
