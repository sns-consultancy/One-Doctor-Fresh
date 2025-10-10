// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./NavBar.module.css";

// Load Stripe.js once (publishable key only)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Calls your Netlify Function to create a Checkout Session, then redirects
async function createCheckout(priceId) {
  const res = await fetch("/.netlify/functions/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json(); // { id: 'cs_...' }

  const stripe = await stripePromise;
  const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
  if (error) throw error;
}

export default function NavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Settings/Profile/Logout
  const [aiOpen, setAiOpen] = useState(false);     // AI dropdown

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpgrade = async () => {
    try {
      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
      if (!priceId) return navigate("/upgrade");
      await createCheckout(priceId);
    } catch (e) {
      console.error("Checkout error:", e);
    }
  };

  return (
    <header className={styles.navbar}>
      {/* Brand */}
      <div className={styles.left}>
        <button
          className={styles.burger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <Link to="/home" className={styles.logoLink}>
          <img src="/logo192.png" alt="Logo" className={styles.logo} />
          <span className={styles.logoText}>OneDoctor</span>
        </Link>
      </div>

      {/* Main app links */}
      <nav className={styles.mainNav}>
        <NavLink to="/home" end className={styles.pill}>Home</NavLink>
        <NavLink to="/symptom-checker" className={styles.pill}>🩺 Symptoms</NavLink>
        <NavLink to="/note-summarizer" className={styles.pill}>🧾 Summarizer</NavLink>
        <NavLink to="/medical-history" className={styles.pill}>📂 Records</NavLink>
        <NavLink to="/camera-heart-rate" className={styles.pill}>❤️ Camera HR</NavLink>
        <NavLink to="/about" className={styles.pill}>ℹ️ About</NavLink>
      </nav>

      {/* Right side: AI dropdown + Menu + Upgrade */}
      <div className={styles.right}>
        {/* AI dropdown — separate from Menu */}
        <div className={styles.dropdown} onMouseLeave={() => setAiOpen(false)}>
          <button
            className={styles.menuButton}
            onClick={() => setAiOpen((v) => !v)}
            aria-expanded={aiOpen}
            aria-haspopup="menu"
          >
            🧠 AI
          </button>
          {aiOpen && (
            <div className={styles.menu} role="menu">
              <NavLink to="/ai/chatbot" onClick={() => setAiOpen(false)}>Health Chatbot</NavLink>
              <NavLink to="/ai/symptom-analyzer" onClick={() => setAiOpen(false)}>Symptom Analyzer</NavLink>
              <NavLink to="/ai/note-summarizer" onClick={() => setAiOpen(false)}>Note Summarizer</NavLink>
              <NavLink to="/ai/data-view" onClick={() => setAiOpen(false)}>Data View</NavLink>
            </div>
          )}
        </div>

        {/* App Menu */}
        <div className={styles.dropdown}>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            ☰ Menu
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu">
              <NavLink to="/settings" onClick={() => setMenuOpen(false)}>⚙️ Settings</NavLink>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>👤 Profile</NavLink>
              <button onClick={handleLogout} className={styles.logout}>🚪 Logout</button>
            </div>
          )}
        </div>

        {/* Stripe Upgrade (kept separate) */}
        <button className={styles.upgrade} onClick={handleUpgrade}>
          🚀 Upgrade
        </button>
      </div>
    </header>
  );
}
