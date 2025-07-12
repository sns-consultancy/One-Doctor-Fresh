import styles from './Home.module.css';
import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <img src="/female-doctor.PNG" alt="Doctor Female" className={styles.doctorImage} />
        <div>
          <h1 className={styles.title}>One Doctor App</h1>
          <p className={styles.subtitle}>Your personal AI health assistant</p>
        </div>
        <img src="/maledoctor.PNG" alt="Doctor Male" className={styles.doctorImage} />
      </div>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={styles.centerText}
      >
       
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={styles.cardGrid}
      >
        <Link
          to="/signup"
          className={styles.card}
        >
          <UserPlus className={styles.icon} size={36} />
          <h2 className={styles.cardTitle}>Sign Up</h2>
        </Link>

        <Link
          to="/login"
          className={styles.card}
        >
          <Stethoscope className={styles.icon} size={36} />
          <h2 className={styles.cardTitle}>Login</h2>
        </Link>
      </motion.div>
    </div>
  );
}