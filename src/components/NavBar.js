import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import styles from "./NavBar.module.css";
import { Menu, Sun, Moon, LogOut } from "lucide-react";

export default function NavBar({ darkMode, toggleDarkMode, onUpgrade }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link to="/home" className={styles.logoLink}>
          <img src={logo} alt="One Doctor Logo" className={styles.logo} />
          <span className={styles.logoText}>One Doctor</span>
        </Link>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
          Menu
        </button>
        {menuOpen && (
          <div className={styles.dropdown}>
            <Link to="/home">Home</Link>
            <Link to="/submit-data">Submit Data</Link>
            <Link to="/view-data">View Data</Link>
            <Link to="/medical-history">Medical History</Link>
            <Link to="/documents">Documents</Link>
            <Link to="/app-selector">Choose App Mode</Link>
            <Link to="/find-doctors">Find Doctors</Link>
            <Link to="/landing">Landing Page</Link>
            <Link to="/chat">Chat</Link>
          </div>
        )}
      </div>
      <div className={styles.right}>
        <button onClick={onUpgrade} className={styles.upgradeButton}>
          Upgrade
        </button>
        <button onClick={toggleDarkMode} className={styles.iconButton}>
          {darkMode ? <Sun /> : <Moon />}
        </button>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}
