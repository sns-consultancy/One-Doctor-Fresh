// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";

export default function NavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className={styles.navbar}>
      {/* === LEFT SIDE: Logo & Brand === */}
      <div className={styles["nav-left"]}>
        <Link to="/home" className={styles.logoLink}>
          <img src="/logo192.png" alt="Logo" className={styles.logo} />
          <span className={styles.logoText}>OneDoctor</span>
        </Link>
      </div>

      {/* === RIGHT SIDE: Menu Buttons === */}
      <div className={styles["nav-right"]}>
        {/* Quick Links */}
        <Link to="/symptom-checker" className={styles.iconButton}>🩺 Symptoms</Link>
        <Link to="/note-summarizer" className={styles.iconButton}>🧾 Summarizer</Link>
        <Link to="/medical-history" className={styles.iconButton}>📂 Records</Link>
        <Link to="/camera-heart-rate" className={styles.iconButton}>❤️ <span>Camera HR</span></Link>

        {/* Dropdown Menu */}
        <div className={styles.dropdown}>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰ Menu
          </button>
          {menuOpen && (
            <div className={styles.dropdownContent}>
              <Link to="/settings" onClick={() => setMenuOpen(false)}>⚙️ Settings</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Advanced Controls */}
        <button
          className={styles.iconButton}
          onClick={() => alert("AI Assistant opening soon...")}
        >
          🧠 AI
        </button>
        <button
          className={styles.iconButton}
          onClick={() => document.body.classList.toggle("dark")}
        >
          🌙
        </button>
        <button
          className={styles.upgradeButton}
          onClick={() => navigate("/upgrade")}
        >
          🚀 Upgrade
        </button>
      </div>
    </header>
  );
}
