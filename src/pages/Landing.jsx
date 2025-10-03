import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, UserPlus, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Landing() {
  const [transcriptText, setTranscriptText] = useState("");
  const navigate = useNavigate();

  const handleVoiceLogin = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      setTranscriptText(transcript);

      if (transcript.includes("login")) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance("Navigating to login page.")
        );
        navigate("/login");
      } else if (transcript.includes("sign up") || transcript.includes("signup")) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance("Navigating to sign up page.")
        );
        navigate("/signup");
      } else if (transcript.includes("home")) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance("Navigating to home page.")
        );
        navigate("/home");
      } else if (transcript.includes("contact")) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance("Navigating to contact page.")
        );
        navigate("/contact");
      } else if (transcript.includes("pricing")) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance("Navigating to pricing page.")
        );
        navigate("/pricing");
      } else {
        alert(`Unrecognized phrase: "${transcript}". Try saying login, sign up, home, contact, or pricing.`);
      }
    };
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <img
          src="/female-doctor.PNG"
          alt="Doctor Female"
          className={styles.doctorImage}
        />
        <div>
          <h1 className={styles.title}>One Doctor App</h1>
          <p className={styles.subtitle}>Your personal AI health assistant</p>
        </div>
        <img
          src="/maledoctor.PNG"
          alt="Doctor Male"
          className={styles.doctorImage}
        />
      </div>

      {/* Animated center text */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className={styles.centerText}
      >
        {/* Optional slogan */}
        <p>Get started with your health journey today.</p>
      </motion.div>

      {/* Animated card grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={styles.cardGrid}
      >
        <Link to="/signup" className={styles.card}>
          <UserPlus className={styles.icon} size={36} />
          <h2 className={styles.cardTitle}>Sign Up</h2>
        </Link>

        <Link to="/login" className={styles.card}>
          <Stethoscope className={styles.icon} size={36} />
          <h2 className={styles.cardTitle}>Login</h2>
        </Link>

        <button className={styles.voiceButton} onClick={handleVoiceLogin}>
          <Mic className={styles.icon} size={36} />
          Voice Command
        </button>
      </motion.div>

      {/* Voice transcript feedback */}
      {transcriptText && (
        <p className={styles.transcript}>
          You said: "{transcriptText}"
        </p>
      )}
    </div>
  );
}
