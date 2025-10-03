import React, { useState, useEffect } from "react";
import {
  Save,
  Clipboard,
  Heart,
  Activity,
  Pill,
  Loader,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Mic
  // Trash, // Uncomment if you plan to use later
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import styles from "./MedicalHistory.module.css";
import { getMedicalHistory, saveMedicalHistory } from "../services/healthService";

const medicalHistoryData = [
  { category: "Environmental Allergy", condition: "Pollen" },
  { category: "Food Allergy", condition: "Peanuts" },
  { category: "Medication Allergy", condition: "Penicillin" },
  { category: "Insect Allergy", condition: "Bee Stings" },
  { category: "Surgery", condition: "Appendectomy" },
  { category: "Genetic Disease", condition: "Diabetes Type 1/2" },
  { category: "Neurological Genetic", condition: "Alzheimer's" },
  { category: "Chronic Condition", condition: "Hypertension" },
  { category: "Mental Health", condition: "Depression" }
];

const groupedConditions = medicalHistoryData.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item.condition);
  return acc;
}, {});

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;
  const progress = (currentPage / totalPages) * 100;

  const [formData, setFormData] = useState({
    user_id: "",
    fullName: "",
    dob: "",
    conditions: [],
    categorizedConditions: {},
    medications: [],
    surgeries: [],
    family_history: {
      heart_disease: false,
      diabetes: false,
      cancer: false,
      hypertension: false,
      stroke: false,
      mental_illness: false
    }
  });

  // Load saved medical history
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (storedId) {
      setLoading(true);
      getMedicalHistory(storedId)
        .then((res) => {
          const data = res.data;
          const categorized = {};
          (data.conditions || []).forEach((c) => {
            for (const item of medicalHistoryData) {
              if (item.condition === c) {
                if (!categorized[item.category]) categorized[item.category] = [];
                categorized[item.category].push(c);
              }
            }
          });
          setFormData((prev) => ({
            ...prev,
            user_id: storedId,
            fullName: data.fullName || "",
            dob: data.dob || "",
            conditions: data.conditions || [],
            categorizedConditions: categorized,
            medications: data.medications || [],
            surgeries: data.surgeries || [],
            family_history: data.family_history || prev.family_history
          }));
        })
        .catch(() => setError("Failed to load medical history."))
        .finally(() => setLoading(false));
    }
  }, [navigate]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleCondition = (category, condition) => {
    setFormData((prev) => {
      const selected = prev.conditions.includes(condition);
      const updatedConditions = selected
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition];
      const updatedCategorized = { ...prev.categorizedConditions };
      if (selected) {
        updatedCategorized[category] = updatedCategorized[category]?.filter(
          (c) => c !== condition
        );
      } else {
        if (!updatedCategorized[category]) updatedCategorized[category] = [];
        updatedCategorized[category].push(condition);
      }
      return {
        ...prev,
        conditions: updatedConditions,
        categorizedConditions: updatedCategorized
      };
    });
  };

  const toggleFamilyHistory = (key) => {
    setFormData((prev) => ({
      ...prev,
      family_history: {
        ...prev.family_history,
        [key]: !prev.family_history[key]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dob) {
      setError("Full name and date of birth are required.");
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      await saveMedicalHistory(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save data.");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      alert(`You said: ${transcript}`);
      // You could parse and update formData here if desired
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.loadingIcon} size={48} />
        <p>Loading medical history...</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <NavBar />
      <div className={styles.container}>
        <h1 className={styles.title}>
          <Clipboard className={styles.titleIcon} />
          Medical History
        </h1>
        <p className={styles.subtitle}>
          Please complete your medical history information.
        </p>

        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            <CheckCircle /> Saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {currentPage === 1 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Heart /> Personal Information
              </div>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value
                    }))
                  }
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dob: e.target.value
                    }))
                  }
                  className={styles.input}
                />
              </div>
              <button
                type="button"
                onClick={startVoiceRecognition}
                className={styles.voiceButton}
              >
                <Mic size={18} /> Speak
              </button>
            </div>
          )}

          {currentPage === 2 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Activity /> Medical Conditions
              </div>
              {Object.keys(groupedConditions).map((category) => (
                <div key={category} className={styles.categorySection}>
                  <div
                    className={styles.categoryHeader}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className={styles.categoryTitle}>
                      {category}
                      {formData.categorizedConditions[category]?.length > 0 && (
                        <span className={styles.categoryCount}>
                          {formData.categorizedConditions[category].length}
                        </span>
                      )}
                    </span>
                    {expandedCategories[category] ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>
                  {expandedCategories[category] && (
                    <div className={styles.checkboxGrid}>
                      {groupedConditions[category].map((c) => (
                        <label key={c} className={styles.checkboxOption}>
                          <input
                            type="checkbox"
                            checked={formData.conditions.includes(c)}
                            onChange={() => toggleCondition(category, c)}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentPage === 3 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Pill /> Family History
              </div>
              <div className={styles.familyHistoryOptions}>
                {Object.keys(formData.family_history).map((key) => (
                  <label key={key} className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={formData.family_history[key]}
                      onChange={() => toggleFamilyHistory(key)}
                    />
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className={styles.clearButton}
              >
                ⬅ Back
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className={styles.submitButton}
              >
                Next ➡
              </button>
            )}
            {currentPage === totalPages && (
              <button
                type="submit"
                disabled={saving}
                className={styles.submitButton}
              >
                <Save /> {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationDialog}>
            <h3>Confirm Save</h3>
            <p>Are you sure you want to save your medical history?</p>
            <div className={styles.confirmButtons}>
              <button
                onClick={() => setShowConfirm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className={styles.confirmButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
