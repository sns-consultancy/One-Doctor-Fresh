import React, { useEffect } from "react";
import styles from "../styles/UpgradeModal.module.css"; // this file already exists in your repo

/**
 * Minimal modal used by Home.jsx.
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onUpgrade: () => void
 */
export default function UpgradeModal({ open, onClose, onUpgrade }) {
  if (!open) return null;

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.title}>Upgrade to Pro</h2>
        <p className={styles.body}>
          Unlock unlimited AI chats, AI history, note summarizer, and more.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Not now
          </button>
          <button type="button" className={styles.primary} onClick={onUpgrade}>
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
