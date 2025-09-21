import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "../services/authService";
import styles from "./Signup.module.css";
import {
  User,
  Lock,
  Mic,
  Loader,
  Smile,
  Fingerprint
} from "lucide-react";

// Speech synthesis
const speakWelcome = (username) => {
  const utterance = new SpeechSynthesisUtterance(
    `Welcome back, ${username}.`
  );
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
};

function Login() {
  const [username, setUsername] = useState("");
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

  const performLogin = async () => {
    if (!username) {
      setMessage("Please enter username.");
      return;
    }
    if (!useFaceId && !password) {
      setMessage("Please enter password or enable Face ID.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      if (useFaceId) {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            timeout: 60000,
            userVerification: "preferred",
          },
        });
        console.log("FaceID credential:", credential);

        localStorage.setItem("token", "loggedin");
        localStorage.setItem("user", JSON.stringify({ firstName: username }));
        speakWelcome(username);
        navigate("/home");
      } else {
        const result = await loginUser(username, password);
        console.log("Login result:", result);

        localStorage.setItem("token", "loggedin");
        if (result && result.user) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: result.user.id,
              firstName: result.user.firstName,
              email: result.user.email,
            })
          );
        } else {
          localStorage.setItem(
            "user",
            JSON.stringify({ firstName: username })
          );
        }
        setMessage(result?.message || "Login successful!");
        speakWelcome(username);
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
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
      if (
        transcript.includes("login") ||
        transcript.includes("sign in")
      ) {
        if (!username) setUsername("demoUser");
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
    <div
      className={`${styles.pageWrapper} ${darkMode ? styles.dark : ""}`}
      style={{ transition: "background 0.3s ease" }}
    >
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={styles.toggleDark}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            <User />
            <input
              ref={usernameInputRef}
              placeholder="Username or Email"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={styles.iconButton}
            >
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
            <button
              type="button"
              onClick={handleFaceId}
              className={styles.secondaryButton}
            >
              <Smile size={16} />
              Face ID
            </button>
            <button
              type="button"
              onClick={handleThumbprint}
              className={styles.secondaryButton}
            >
              <Fingerprint size={16} />
              Thumbprint
            </button>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
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
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  const decoded = jwtDecode(credentialResponse.credential);
                  console.log("Google User:", decoded);
                  localStorage.setItem("token", "loggedin");
                  localStorage.setItem(
                    "user",
                    JSON.stringify({ email: decoded.email, firstName: decoded.name })
                  );
                  setMessage("Google login successful!");
                  speakWelcome(decoded.name);
                  navigate("/home");
                }
              }}
              onError={() => {
                console.log("Google Login Failed");
                setMessage("Google login failed.");
              }}
            />
          </div>
        </form>

        <button
          type="button"
          onClick={handleVoiceLogin}
          disabled={loading}
          className={styles.button}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <Mic /> Voice Login
        </button>

        {message && (
          <p
            className={
              message.toLowerCase().includes("success")
                ? styles.success
                : styles.error
            }
          >
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
