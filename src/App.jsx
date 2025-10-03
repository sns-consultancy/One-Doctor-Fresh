import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Menu, Brain, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// Components
import logoUrl from "./assets/logo.png";
import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";

// Pages
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import SubmitHealthData from "./pages/SubmitHealthData.jsx";
import ViewHealthData from "./pages/ViewHealthData.jsx";
import MedicalHistory from "./pages/MedicalHistory.jsx";
import SymptomChecker from "./pages/SymptomChecker.jsx";
import HealthChatbot from "./pages/HealthChatbot.jsx";
import NoteSummarizer from "./pages/NoteSummarizer.jsx";
import AiHistory from "./pages/AiHistory";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Pricing from "./pages/Pricing.jsx";
import BillingHistory from "./pages/BillingHistory.jsx";
import Profile from "./pages/Profile.jsx";
import Terms from "./pages/Terms.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import EULA from "./pages/EULA.jsx";
import Disclaimer from "./pages/Disclaimer.jsx";
import CookiePolicy from "./pages/CookiePolicy.jsx";
import AppSelector from "./pages/AppSelector.jsx";
import FindDoctors from "./pages/FindDoctors.jsx";
import AIChatbot from "./components/AIChatbot";

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const menuRef = useRef(null);
  const aiMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target)) {
        setAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpgrade = async () => {
    const userToken = localStorage.getItem("token");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          priceId: process.env.REACT_APP_STRIPE_PRICE_ID,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout session could not be created.");
      }
    } catch (err) {
      console.error("Checkout error", err);
      toast.error("Could not start checkout.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const hideNav = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      {!hideNav && (
        <nav className="navbar">
          <div className="nav-left">
            <img
    src={logoUrl}
    alt="One Doctor Logo"
    style={{
      height: 64, // bigger size
      width: "auto",
      display: "block",
      filter: "brightness(0) saturate(100%) invert(100%)", // turns logo white
    }}
  />
  <span style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}>
    One Doctor
  </span>
          </div>
          <div className="nav-right">
            {/* Main Menu */}
            <div className="dropdown" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="dropdown-toggle"
                aria-label="Main menu"
              >
                <Menu size={20} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/submit" onClick={() => setMenuOpen(false)}>Submit Data</Link>
                    <Link to="/view" onClick={() => setMenuOpen(false)}>View Data</Link>
                    <Link to="/medical-history" onClick={() => setMenuOpen(false)}>Medical History</Link>
                    <Link to="/find-doctors" onClick={() => setMenuOpen(false)}>Find Doctors</Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/billing-history" onClick={() => setMenuOpen(false)}>Billing History</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                    <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                    <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
                    <Link to="/terms" onClick={() => setMenuOpen(false)}>Terms</Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="logout-button"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Menu */}
            <div className="dropdown" ref={aiMenuRef}>
              <button
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                className="dropdown-toggle"
                aria-label="AI menu"
              >
                <Brain size={20} />
              </button>
              <AnimatePresence>
                {aiMenuOpen && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to="/symptom-checker" onClick={() => setAiMenuOpen(false)}>Symptom Checker</Link>
                    <Link to="/health-chatbot" onClick={() => setAiMenuOpen(false)}>Health Chatbot</Link>
                    <Link to="/note-summarizer" onClick={() => setAiMenuOpen(false)}>Note Summarizer</Link>
                    <Link to="/ai-history" onClick={() => setAiMenuOpen(false)}>AI Medical History</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleDarkMode}
              className="theme-toggle"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleUpgrade}
              className="upgrade-button"
            >
              Upgrade
            </button>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitHealthData /></ProtectedRoute>} />
        <Route path="/view" element={<ProtectedRoute><ViewHealthData /></ProtectedRoute>} />
        <Route path="/medical-history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
        <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
        <Route path="/health-chatbot" element={<ProtectedRoute><HealthChatbot /></ProtectedRoute>} />
        <Route path="/note-summarizer" element={<ProtectedRoute><NoteSummarizer /></ProtectedRoute>} />
        <Route path="/ai-history" element={<ProtectedRoute><AiHistory /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/billing-history" element={<BillingHistory />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/eula" element={<EULA />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/app-selector" element={<AppSelector />} />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/chat" element={<AIChatbot />} />
      </Routes>

      {!hideNav && (
        <footer>
          <p>© 2025 One Doctor App. All rights reserved.</p>
          <nav>
            <Link to="/terms">Terms</Link> |{" "}
            <Link to="/privacy">Privacy</Link> |{" "}
            <Link to="/eula">EULA</Link> |{" "}
            <Link to="/disclaimer">Disclaimer</Link> |{" "}
            <Link to="/cookies">Cookies</Link>
          </nav>
        </footer>
      )}

      <CookieConsent />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/" element={<Home />} />
      {/* add routes here */}
      <AppContent />
      <Route path="*" element={<NotFound />} />
    </Router>
  );
}
