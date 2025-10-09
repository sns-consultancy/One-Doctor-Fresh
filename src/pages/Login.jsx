import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styles from "./Signup.module.css";
import { User, Lock, Mic, Loader, Smile, Fingerprint } from "lucide-react";

// Firebase Auth
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";

// Speech synthesis helper
const speakWelcome = (name) => {
  const utterance = new SpeechSynthesisUtterance(`Welcome back, ${name}.`);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
};

function Login() {
  const [username, setUsername] = useState(""); // email
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [useFaceId, setUseFaceId] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const navigate = useNavigate();
  const usernameInputRef = useRef();

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const loginEmailPassword = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await signInWithEmailAndPassword(auth, username, password);
      const user = res.user;
      const idToken = await user.getIdToken();
      localStorage.setItem("token", idToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.uid,
          firstName: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email,
        })
      );
      speakWelcome(user.displayName || user.email || "User");
      navigate("/home");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async () => {
    if (!username) {
      setMessage("Please enter email.");
      return;
    }
    if (!useFaceId && !password) {
      setMessage("Please enter password or enable Face ID.");
      return;
    }
    if (useFaceId) {
      // Simulated Face ID
      alert("Face ID simulated (hook real WebAuthn here).");
      // In a real flow, after WebAuthn success, you would authenticate the user.
      return;
    }
    await loginEmailPassword();
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential; // Google One-Tap JWT
      const cred = GoogleAuthProvider.credential(idToken);
      const { user } = await signInWithCredential(auth, cred); // <-- creates/links Firebase user
      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.uid,
          firstName: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email,
        })
      );
      const decoded = jwtDecode(idToken);
      speakWelcome(decoded.name || user.displayName || "User");
      setMessage("Google login successful!");
      navigate("/home");
    } catch (e) {
      console.error("Google login error:", e);
      setMessage(e.message || "Google login failed.");
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setUsername(transcript);
    };
  };

  const handleVoiceLogin = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      if (transcript.includes("login") || transcript.includes("sign in")) {
        if (!username) setUsername("demo@example.com");
        if (!password && !useFaceId) setPassword("demoPassword");
        performLogin();
      } else {
        alert("Say 'login' or 'sign in' to continue.");
      }
    };
  };

  const handleFaceId = () => {
    alert("Face ID simulated. (Use WebAuthn APIs for real biometrics.)");
  };

  const handleThumbprint = () => {
    alert("Thumbprint simulated. (Use WebAuthn APIs for real biometrics.)");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    performLogin();
  };

  return (
    <div className={`${styles.pageWrapper} ${darkMode ? styles.dark : ""}`} style={{ transition: "background 0.3s ease" }}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>

        <button onClick={() => setDarkMode(!darkMode)} className={styles.toggleDark}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            <User />
            <input
              ref={usernameInputRef}
              placeholder="Email"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              disabled={loading}
              type="email"
            />
            <button type="button" onClick={handleVoiceInput} className={styles.iconButton}>
              <Mic size={16} />
            </button>
          </label>

          {!useFaceId && (
            <label className={styles.label}>
              <Lock />
              <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                disabled={loading}
              />
            </label>
          )}

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={useFaceId}
              onChange={(e) => setUseFaceId(e.target.checked)}
              disabled={loading}
            />
            <span>Use Face ID / Touch ID</span>
          </label>

          <div className={styles.actionsRow}>
            <button type="button" onClick={handleFaceId} className={styles.secondaryButton}>
              <Smile size={16} />
              Face ID
            </button>
            <button type="button" onClick={handleThumbprint} className={styles.secondaryButton}>
              <Fingerprint size={16} />
              Thumbprint
            </button>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <>
                <Loader className={styles.spin} size={18} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className={styles.googleButton}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage("Google login failed.")} />
          </div>
        </form>

        <button type="button" onClick={handleVoiceLogin} disabled={loading} className={styles.button} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Mic /> Voice Login
        </button>

        {message && (
          <p className={message.toLowerCase().includes("success") ? styles.success : styles.error}>
            {message}
          </p>
        )}

        <p className={styles.footer}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
