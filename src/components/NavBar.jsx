import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/home" className={location.pathname === "/home" ? styles.active : styles.link}>Home</Link>
      <Link to="/view" className={location.pathname === "/view" ? styles.active : styles.link}>View Data</Link>
      <Link to="/submit" className={location.pathname === "/submit" ? styles.active : styles.link}>Submit Data</Link>
      <button className={styles.logout} onClick={handleLogout}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </button>
    </nav>
  );
}