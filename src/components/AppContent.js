import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
import CookieConsent from "./components/CookieConsent";
import ProtectedRoute from "./components/ProtectedRoute";
import Logo from "./components/Logo";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { SubmitHealthData } from "./pages/SubmitHealthData";
import { ViewHealthData } from "./pages/ViewHealthData";
import MedicalHistory from "./pages/MedicalHistory";
import SymptomChecker from "./pages/SymptomChecker";
import HealthChatbot from "./pages/HealthChatbot";
import NoteSummarizer from "./pages/NoteSummarizer";
import AiHistory from "./pages/AiHistory";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Subscribe from "./pages/Subscribe";
import BillingHistory from "./pages/BillingHistory";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import EULA from "./pages/EULA";
import Disclaimer from "./pages/Disclaimer";
import CookiePolicy from "./pages/CookiePolicy";

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  const menuRef = useRef(null);
  const aiMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next);
      return next;
    });
  };

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

  const userToken = localStorage.getItem("token");

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ priceId: "price_1NXXXXXX" })
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error", err);
      toast.error("Could not start checkout.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const hideNav = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      {!hideNav && (
        <nav className="navbar">
          <div className="nav-left">
            <Logo className="h-8 w-8" />
          </div>

          <div className="nav-right">
            {/* Main Menu */}
            <div className="dropdown" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="dropdown-toggle"
              >
                ☰ Menu
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
                  <Link to="/submit" onClick={() => setMenuOpen(false)}>Submit Data</Link>
                  <Link to="/view" onClick={() => setMenuOpen(false)}>View Data</Link>
                  <Link to="/medical-history" onClick={() => setMenuOpen(false)}>Medical History</Link>
                  <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                  <Link to="/terms" onClick={() => setMenuOpen(false)}>Terms</Link>
                  <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                  <hr />
                  <Link to="/billing-history" onClick={() => setMenuOpen(false)}>Billing History</Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.5rem 0",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left"
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* AI Menu */}
            <div className="dropdown" ref={aiMenuRef}>
              <button
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                className="dropdown-toggle"
              >
                ☰ AI Menu
              </button>
              {aiMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/symptom-checker" onClick={() => setAiMenuOpen(false)}>Symptom Checker</Link>
                  <Link to="/health-chatbot" onClick={() => setAiMenuOpen(false)}>Health Chatbot</Link>
                  <Link to="/note-summarizer" onClick={() => setAiMenuOpen(false)}>Note Summarizer</Link>
                  <Link to="/ai-history" onClick={() => setAiMenuOpen(false)}>AI Medical History</Link>
                </div>
              )}
            </div>

            {/* Dark Mode */}
            <button onClick={toggleDarkMode} className="theme-toggle">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Upgrade */}
            <button onClick={handleUpgrade} className="upgrade-button">
              Upgrade
            </button>
          </div>
        </nav>
      )}

      {hideNav && (
        <div className="banner">
          <h1>Welcome to One Doctor App</h1>
          <p>Your AI-powered health assistant – anytime, anywhere.</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Landing />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Login />
              </motion.div>
            }
          />
          <Route
            path="/signup"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Signup />
              </motion.div>
            }
          />

          {/* Protected Routes */}
          {[
            { path: "/home", component: Home },
            { path: "/submit", component: SubmitHealthData },
            { path: "/view", component: ViewHealthData },
            { path: "/medical-history", component: MedicalHistory },
            { path: "/symptom-checker", component: SymptomChecker },
            { path: "/health-chatbot", component: HealthChatbot },
            { path: "/note-summarizer", component: NoteSummarizer },
            { path: "/ai-history", component: AiHistory }
          ].map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                </motion.div>
              }
            />
          ))}

          {/* Other Public Info */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscribe/:planId" element={<Subscribe />} />
          <Route path="/billing-history" element={<BillingHistory />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/eula" element={<EULA />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/cookies" element={<CookiePolicy />} />
        </Routes>
      </AnimatePresence>

      {!hideNav && (
        <footer>
          <p>© 2025 One Doctor App. All rights reserved.</p>
          <nav style={{ marginTop: "0.5rem" }}>
            <a href="/terms">Terms</a> |{" "}
            <a href="/privacy">Privacy</a> |{" "}
            <a href="/eula">EULA</a> |{" "}
            <a href="/disclaimer">Disclaimer</a> |{" "}
            <a href="/cookies">Cookies</a>
          </nav>
        </footer>
      )}

      <ToastContainer />
      <CookieConsent />
    </div>
  );
}

export default AppContent;
