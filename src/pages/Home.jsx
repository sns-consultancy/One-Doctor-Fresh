import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";
import { motion } from "framer-motion";
import {
  PlusCircle,
  ClipboardList,
  FolderArchive,
  Stethoscope,
  FileText,
  Brain,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMedicalHistory } from "../services/healthService";
import UpgradeModal from "../components/UpgradeModal";

// Use your aliased assets (works if you have `@` alias set in Vite)
// src/pages/Home.jsx
import femaleDoc from "../assets/female-doctor.png";
import maleDoc   from "../assets/male-doctor.png";

export default function Home() {
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setUser(stored);
  }, []);

  useEffect(() => {
    const checkMedicalHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const response = await getMedicalHistory(userId);
          setHasMedicalHistory(Boolean(response && response.data));
        }
      } catch (error) {
        console.error("Error checking medical history:", error);
        setHasMedicalHistory(false);
      } finally {
        setLoading(false);
      }
    };
    checkMedicalHistory();
  }, []);

  return (
    <div className={styles.root}>
      {/* ===== HERO HEADER (ADDED) ===== */}
      <header className={styles.hero}>
        {/* Decorative images: alt="" prevents visible fallback text */}
      <img src="/assets/female-doctor.png" alt="" className={`${styles.heroImg} ${styles.heroImgLeft}`} aria-hidden="true" />
      <img src="/assets/male-doctor.png"   alt="" className={`${styles.heroImg} ${styles.heroImgRight}`} aria-hidden="true" />


        {/* Title & subtitle preserved from your snippet */}
        <h1 className={styles.heroTitle}>One Doctor App</h1>
        <p className={styles.heroSubtitle}>Your personal AI health assistant</p>
      </header>

      {/* ===== EXISTING HEADER STRIP WITH MOTION (KEPT) ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={styles.header}
      >
        {/* If you want to hide these because the hero now has images,
            you can remove them later—kept here to avoid deleting features */}
        <img
          src="/female-doctor.png"
          alt="Doctor Female"
          className={styles.doctorImage}
        />
        <div className={styles.headerText}>
          <h1 className={styles.title}>Hello, {user?.firstName || "there"}!</h1>
          <p className={styles.subtitle}>
            Welcome back to your personalized health dashboard.
          </p>
        </div>
        <img
          src="/male-doctor.png"
          alt="Doctor Male"
          className={styles.doctorImage}
        />
      </motion.div>

      {/* ===== CARD GRID (UNCHANGED) ===== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={styles.cardGrid}
      >
        {/* Medical History */}
        <Link
          to="/medical-history"
          className={`${styles.card} ${loading ? styles.cardLoading : ""}`}
        >
          {loading ? (
            <div className={styles.cardLoader}></div>
          ) : (
            <>
              {hasMedicalHistory ? (
                <ClipboardList className={styles.icon} size={40} />
              ) : (
                <PlusCircle className={styles.icon} size={40} />
              )}
              <h2 className={styles.cardTitle}>Medical History</h2>
              <p className={styles.cardDescription}>
                {hasMedicalHistory
                  ? "View and manage your records"
                  : "Add your medical history"}
              </p>
            </>
          )}
        </Link>

        {/* Saved Documents */}
        <Link to="/documents" className={styles.card}>
          <FolderArchive className={styles.icon} size={40} />
          <h2 className={styles.cardTitle}>Saved Documents</h2>
          <p className={styles.cardDescription}>
            Access your summaries and reports.
          </p>
        </Link>

        {/* Symptom Checker */}
        <Link to="/symptom-checker" className={styles.card}>
          <Stethoscope className={styles.icon} size={40} />
          <h2 className={styles.cardTitle}>Symptom Checker</h2>
          <p className={styles.cardDescription}>Get suggestions for symptoms.</p>
        </Link>

        {/* Note Summarizer */}
        <Link to="/note-summarizer" className={styles.card}>
          <FileText className={styles.icon} size={40} />
          <h2 className={styles.cardTitle}>Note Summarizer</h2>
          <p className={styles.cardDescription}>
            Summarize your health notes instantly.
          </p>
        </Link>

        {/* AI Medical History */}
        <Link to="/ai-history" className={styles.card}>
          <Brain className={styles.icon} size={40} />
          <h2 className={styles.cardTitle}>AI Medical History</h2>
          <p className={styles.cardDescription}>
            Let AI help analyze your records.
          </p>
        </Link>

        {/* Health Chatbot */}
        <Link to="/health-chatbot" className={styles.card}>
          <MessageSquare className={styles.icon} size={40} />
          <h2 className={styles.cardTitle}>Health Chatbot</h2>
          <p className={styles.cardDescription}>
            Chat with your AI health assistant.
          </p>
        </Link>
      </motion.div>

      {/* ===== UPGRADE (UNCHANGED) ===== */}
      <div className={styles.upgradeContainer}>
        <button className={styles.upgradeButton} onClick={() => setShowModal(true)}>
          Upgrade Now
        </button>
      </div>

      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
