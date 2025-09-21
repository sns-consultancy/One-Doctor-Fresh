import React from "react";
import styles from "../styles/UpgradeModal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import plans from "../config/pricing";

export default function UpgradeModal({ isOpen, onClose }) {
  const handleUpgrade = async (priceId) => {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: localStorage.getItem("userId"),
        }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className={styles.title}>Upgrade Your Plan</h2>
            <p className={styles.description}>
              Choose a plan to unlock premium features and grow your health journey.
            </p>

            <div className={styles.plans}>
              {Array.isArray(plans) && plans.length > 0 ? (
                plans
                  .filter((plan) => plan.price > 0)
                  .map((plan) => (
                    <div key={plan.id} className={styles.plan}>
                      <h3>{plan.name}</h3>
                      <p className={styles.price}>${plan.price}/month</p>
                      <p className={styles.planDescription}>{plan.description}</p>
                      <ul className={styles.features}>
                        {Array.isArray(plan.features) &&
                          plan.features.map((feature, idx) => (
                            <li key={idx}>✅ {feature}</li>
                          ))}
                      </ul>
                      <button
                        onClick={() => handleUpgrade(plan.stripePriceId)}
                        className={styles.upgradeButton}
                      >
                        Upgrade to {plan.name}
                      </button>
                    </div>
                  ))
              ) : (
                <p className={styles.noPlans}>No plans available.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
