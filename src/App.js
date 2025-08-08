import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Landing } from "./pages/Landing";
import Home from "./pages/Home";
import { SubmitHealthData } from "./pages/SubmitHealthData";
import { ViewHealthData } from "./pages/ViewHealthData";
import { MedicalHistory } from "./pages/MedicalHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SymptomChecker from "./pages/SymptomChecker";
import HealthChatbot from "./pages/HealthChatbot";
import NoteSummarizer from "./pages/NoteSummarizer";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import GrowthTracker from "./pages/GrowthTracker";
import VitalsMonitoring from "./pages/VitalsMonitoring";
import DietMentalHealth from "./pages/DietMentalHealth";
import Appointments from "./pages/Appointments";
import DocumentVault from "./pages/DocumentVault";
import Teleconsultation from "./pages/Teleconsultation";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from './components/NavBar';
import "./App.css";
import {
  Home as HomeIcon,
  FilePlus,
  Eye,
  FileText,
  Info,
  FileLock,
  Mail,
  Moon,
  Sun,
  User,
  TrendingUp,
  Activity,
  Heart,
  Calendar,
  Folder,
  Video
} from "lucide-react";

function AppContent() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  const location = window.location.pathname;
  const hideNav = location === "/";

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {!hideNav && (
        <>
          <Navbar />

          {/* Classic Text Menu */}
          <nav className="navbar">
            <Link to="/home">Home</Link> |{" "}
            <Link to="/submit">Submit Data</Link> |{" "}
            <Link to="/view">View Data</Link> |{" "}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#007BFF",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ☰ AI Menu
            </button>
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  background: "#F9F9F9",
                  border: "1px solid #ddd",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  zIndex: 10,
                }}
              >
                <Link to="/symptom-checker" onClick={() => setMenuOpen(false)}>
                  Symptom Checker
                </Link>
                <br />
                <Link to="/health-chatbot" onClick={() => setMenuOpen(false)}>
                  Health Chatbot
                </Link>
                <br />
                <Link to="/note-summarizer" onClick={() => setMenuOpen(false)}>
                  Note Summarizer
                </Link>
                <br />
                <Link to="/medical-history" onClick={() => setMenuOpen(false)}>
                  AI Medical History
                </Link>
              </div>
            )}
          </nav>

          {/* Icon Dropdown Menu */}
          <div className="menu-actions">
            <button className="menu-button" onClick={toggleDropdown}>☰ Menu</button>
            <button className="toggle-theme" onClick={toggleDarkMode}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {showDropdown && (
            <div className="dropdown-list" ref={dropdownRef}>
              <ul className="dropdown-menu-list">
                <li onClick={() => handleNav("/home")}><HomeIcon size={16} /> Home</li>
                <li onClick={() => handleNav("/submit")}><FilePlus size={16} /> Submit Data</li>
                <li onClick={() => handleNav("/view")}><Eye size={16} /> View Data</li>
                <li onClick={() => handleNav("/profile")}><User size={16} /> Profiles</li>
                <li onClick={() => handleNav("/growth")}><TrendingUp size={16} /> Growth</li>
                <li onClick={() => handleNav("/vitals")}><Activity size={16} /> Vitals</li>
                <li onClick={() => handleNav("/diet-mental")}><Heart size={16} /> Diet & Mental</li>
                <li onClick={() => handleNav("/appointments")}><Calendar size={16} /> Appointments</li>
                <li onClick={() => handleNav("/documents")}><Folder size={16} /> Documents</li>
                <li onClick={() => handleNav("/teleconsult")}><Video size={16} /> Teleconsultation</li>
                <li onClick={() => handleNav("/medical-history")}><FileText size={16} /> Medical History</li>
                <li onClick={() => handleNav("/about")}><Info size={16} /> About Us</li>
                <li onClick={() => handleNav("/terms")}><FileLock size={16} /> Terms & Conditions</li>
                <li onClick={() => handleNav("/contact")}><Mail size={16} /> Contact Us</li>
              </ul>
            </div>
          )}
        </>
      )}

      {hideNav && (
        <div className="banner">
          <h1>Welcome to One Doctor App</h1>
          <p>Your AI-powered health assistant – anytime, anywhere.</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitHealthData /></ProtectedRoute>} />
        <Route path="/view" element={<ProtectedRoute><ViewHealthData /></ProtectedRoute>} />
        <Route path="/medical-history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
        <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
        <Route path="/health-chatbot" element={<ProtectedRoute><HealthChatbot /></ProtectedRoute>} />
        <Route path="/note-summarizer" element={<ProtectedRoute><NoteSummarizer /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/growth" element={<ProtectedRoute><GrowthTracker /></ProtectedRoute>} />
        <Route path="/vitals" element={<ProtectedRoute><VitalsMonitoring /></ProtectedRoute>} />
        <Route path="/diet-mental" element={<ProtectedRoute><DietMentalHealth /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/teleconsult" element={<ProtectedRoute><Teleconsultation /></ProtectedRoute>} />
      </Routes>

      <footer>
        <p>© 2025 One Doctor App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
