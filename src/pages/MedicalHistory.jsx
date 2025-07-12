import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, Clipboard, Heart, Activity, AlertCircle, 
  Pill,  Loader, CheckCircle, Trash, 
  CheckSquare, ChevronDown, ChevronUp
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar";
import { getMedicalHistory, saveMedicalHistory } from "../services/healthService";
import styles from "./MedicalHistory.module.css";

// Categorized medical history data
const medicalHistoryData = [
  { category: "Environmental Allergy", condition: "Pollen" },
  { category: "Environmental Allergy", condition: "Dust Mites" },
  { category: "Environmental Allergy", condition: "Pet Dander" },
  { category: "Food Allergy", condition: "Peanuts" },
  { category: "Food Allergy", condition: "Shellfish" },
  { category: "Food Allergy", condition: "Eggs" },
  { category: "Food Allergy", condition: "Milk" },
  { category: "Food Allergy", condition: "Wheat (Celiac)" },
  { category: "Medication Allergy", condition: "Penicillin" },
  { category: "Medication Allergy", condition: "NSAIDs (Ibuprofen, Aspirin)" },
  { category: "Medication Allergy", condition: "Latex" },
  { category: "Insect Allergy", condition: "Bee Stings" },
  { category: "Insect Allergy", condition: "Fire Ants" },
  { category: "Surgery", condition: "Appendectomy" },
  { category: "Surgery", condition: "Gallbladder Removal" },
  { category: "Surgery", condition: "Heart Bypass Surgery" },
  { category: "Surgery", condition: "Cesarean Section" },
  { category: "Surgery", condition: "Mastectomy" },
  { category: "Surgery", condition: "Hernia Repair" },
  { category: "Minor Surgery", condition: "Tonsillectomy" },
  { category: "Minor Surgery", condition: "Cataract Surgery" },
  { category: "Minor Surgery", condition: "Mole Removal" },
  { category: "Genetic Disease", condition: "Diabetes Type 1/2" },
  { category: "Genetic Disease", condition: "Breast Cancer (BRCA1/2)" },
  { category: "Genetic Disease", condition: "Colon Cancer" },
  { category: "Genetic Disease", condition: "Sickle Cell Anemia" },
  { category: "Genetic Disease", condition: "Cystic Fibrosis" },
  { category: "Genetic Disease", condition: "Thalassemia" },
  { category: "Genetic Disease", condition: "Hemophilia" },
  { category: "Neurological Genetic", condition: "Alzheimer's" },
  { category: "Neurological Genetic", condition: "Parkinson's" },
  { category: "Neurological Genetic", condition: "Bipolar Disorder" },
  { category: "Chronic Condition", condition: "Hypertension" },
  { category: "Chronic Condition", condition: "Asthma" },
  { category: "Chronic Condition", condition: "Heart Disease" },
  { category: "Chronic Condition", condition: "COPD" },
  { category: "Chronic Condition", condition: "Arthritis" },
  { category: "Chronic Condition", condition: "Thyroid Disease" },
  { category: "Chronic Condition", condition: "Kidney Disease" },
  { category: "Chronic Condition", condition: "Liver Disease" },
  { category: "Mental Health", condition: "Depression" },
  { category: "Mental Health", condition: "Anxiety" },
];

// Group conditions by category
const groupedConditions = medicalHistoryData.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item.condition);
  return acc;
}, {});

export function MedicalHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Form data state matching the API structure with categorized conditions
  const [formData, setFormData] = useState({
    user_id: "",
    conditions: [],
    categorizedConditions: {}, // Store conditions by category
    otherConditions: "",
    allergies: [],
    otherAllergies: "",
    medications: [],
    otherMedications: "",
    surgeries: [],
    otherSurgeries: "",
    family_history: {
      heart_disease: false,
      diabetes: false,
      cancer: false,
      hypertension: false,
      stroke: false,
      mental_illness: false,
      other: ""
    },
    last_updated: new Date().toISOString()
  });

  // Initialize expanded state for each category
  useEffect(() => {
    const initialExpandedState = Object.keys(groupedConditions).reduce((acc, category) => {
      acc[category] = true; // Start with all categories expanded
      return acc;
    }, {});
    setExpandedCategories(initialExpandedState);
  }, []);

  // Check for token and get userId on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Extract user ID from token or get it from local storage
    const userIdFromStorage = localStorage.getItem('userId');
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      setFormData(prev => ({ ...prev, user_id: userIdFromStorage }));
      fetchMedicalHistory(userIdFromStorage);
    } else {
      setError("User ID not found. Please log in again.");
    }
  }, [navigate]);
  
  // Load draft from localStorage if available
  useEffect(() => {
    if (userId) {
      const savedDraft = localStorage.getItem('medicalHistoryDraft');
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          if (parsedDraft.user_id === userId) {
            setFormData(parsedDraft);
          }
        } catch (e) {
          console.error("Could not parse saved draft");
        }
      }
    }
  }, [userId]);
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.conditions.length > 0 || formData.allergies.length > 0) {
        localStorage.setItem('medicalHistoryDraft', JSON.stringify(formData));
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(timer);
  }, [formData]);

  const fetchMedicalHistory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMedicalHistory(id);
      
      if (response.data) {
        // Process the medical history response
        const conditions = response.data.conditions || [];
        
        // Create categorized structure from flat conditions array
        const categorizedConditions = {};
        conditions.forEach(condition => {
          // Find which category this condition belongs to
          for (const item of medicalHistoryData) {
            if (item.condition === condition) {
              if (!categorizedConditions[item.category]) {
                categorizedConditions[item.category] = [];
              }
              categorizedConditions[item.category].push(condition);
              break;
            }
          }
        });
        
        // Transform API data to form data structure
        setFormData({
          user_id: id,
          conditions: conditions,
          categorizedConditions: categorizedConditions,
          allergies: response.data.allergies || [],
          medications: response.data.medications || [],
          surgeries: response.data.surgeries || [],
          family_history: response.data.family_history || {
            heart_disease: false,
            diabetes: false, 
            cancer: false,
            hypertension: false,
            stroke: false,
            mental_illness: false,
            other: ""
          },
          last_updated: response.data.last_updated || new Date().toISOString(),
          otherConditions: "",
          otherAllergies: "",
          otherMedications: "",
          otherSurgeries: ""
        });
      }
    } catch (err) {
      console.error("Error fetching medical history:", err);
      setError("Failed to load your medical history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCategorizedConditionChange = (category, condition) => {
    setFormData(prev => {
      // Check if condition is already selected
      const isSelected = prev.conditions.includes(condition);
      
      let updatedConditions = [...prev.conditions];
      let updatedCategorizedConditions = { ...prev.categorizedConditions };
      
      if (isSelected) {
        // Remove condition from both arrays
        updatedConditions = updatedConditions.filter(c => c !== condition);
        
        if (updatedCategorizedConditions[category]) {
          updatedCategorizedConditions[category] = updatedCategorizedConditions[category].filter(c => c !== condition);
          
          // If category is now empty, remove it
          if (updatedCategorizedConditions[category].length === 0) {
            delete updatedCategorizedConditions[category];
          }
        }
      } else {
        // Add condition to both arrays
        updatedConditions.push(condition);
        
        if (!updatedCategorizedConditions[category]) {
          updatedCategorizedConditions[category] = [];
        }
        updatedCategorizedConditions[category].push(condition);
      }
      
      return {
        ...prev,
        conditions: updatedConditions,
        categorizedConditions: updatedCategorizedConditions
      };
    });
  };

  const handleCheckboxChange = (category, value) => {
    setFormData(prev => {
      if (prev[category].includes(value)) {
        return {
          ...prev,
          [category]: prev[category].filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...prev[category], value]
        };
      }
    });
  };

  const handleFamilyHistoryChange = (condition, value) => {
    setFormData(prev => ({
      ...prev,
      family_history: {
        ...prev.family_history,
        [condition]: value
      }
    }));
  };

  const handleArrayInputChange = (category, e) => {
    const { value } = e.target;
    if (value.trim() !== undefined) {
      setFormData(prev => ({
        ...prev,
        [`other${category.charAt(0).toUpperCase() + category.slice(1)}`]: value
      }));
    }
  };

  const addCustomItem = (category) => {
    const fieldName = `other${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const value = formData[fieldName]?.trim();
    
    if (value) {
      setFormData(prev => ({
        ...prev,
        [category]: [...prev[category], value],
        [fieldName]: ""
      }));
    }
  };
  
  const resetForm = () => {
    // Show confirmation first
    if (window.confirm("Are you sure you want to clear all entries?")) {
      setFormData({
        user_id: userId,
        conditions: [],
        categorizedConditions: {},
        otherConditions: "",
        allergies: [],
        otherAllergies: "",
        medications: [],
        otherMedications: "",
        surgeries: [],
        otherSurgeries: "",
        family_history: {
          heart_disease: false,
          diabetes: false,
          cancer: false,
          hypertension: false,
          stroke: false,
          mental_illness: false,
          other: ""
        },
        last_updated: new Date().toISOString()
      });
      // Also remove draft from localStorage
      localStorage.removeItem('medicalHistoryDraft');
    }
  };

  // Pre-validation before showing confirmation dialog
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.conditions.length === 0) {
      setError("Please select at least one medical condition");
      return;
    }
    
    setError(null);
    // Show confirmation dialog
    setShowConfirm(true);
  };
  
  // Actual form submission after confirmation
  const submitForm = async () => {
    setSaving(true);
    
    try {
      // Prepare data for API
      const dataToSave = {
        user_id: userId,
        conditions: formData.conditions,
        allergies: formData.allergies,
        medications: formData.medications,
        surgeries: formData.surgeries,
        family_history: formData.family_history,
        last_updated: new Date().toISOString()
      };
      
      await saveMedicalHistory(dataToSave);
      setSuccess(true);
      
      // Clear draft after successful save
      localStorage.removeItem('medicalHistoryDraft');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving medical history:", err);
      setError("Failed to save your medical history. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <NavBar />
        <div className={styles.loadingContainer}>
          <Loader className={styles.loadingIcon} size={40} />
          <p>Loading your medical history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <NavBar />
      <div className={styles.container}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>
            <Clipboard className={styles.titleIcon} />
            Medical History
          </h1>
          <p className={styles.subtitle}>
            Please provide your medical information to help us serve you better
          </p>
        </motion.div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <motion.div 
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle size={20} />
            Your medical history has been saved successfully!
          </motion.div>
        )}

        <motion.form 
          className={styles.form}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
        >
          {/* Categorized Medical Conditions Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Heart size={20} />
              Medical Conditions
            </h2>
            <div className={styles.formGroup}>
              <p className={styles.formInstruction}>
                Please select all conditions that apply to you. Click on category headers to expand or collapse sections.
              </p>
              
              {/* Render categorized conditions */}
              {Object.keys(groupedConditions).map((category) => (
                <div key={category} className={styles.categorySection}>
                  <div 
                    className={styles.categoryHeader}
                    onClick={() => toggleCategoryExpand(category)}
                  >
                    <div className={styles.categoryTitle}>
                      {category}
                      <span className={styles.categoryCount}>
                        {formData.categorizedConditions[category]?.length || 0}
                        /{groupedConditions[category].length}
                      </span>
                    </div>
                    {expandedCategories[category] ? 
                      <ChevronUp size={18} /> : 
                      <ChevronDown size={18} />
                    }
                  </div>
                  
                  {expandedCategories[category] && (
                    <div className={styles.checkboxGrid}>
                      {groupedConditions[category].map((condition) => (
                        <div className={styles.checkboxOption} key={condition}>
                          <input
                            type="checkbox"
                            id={`condition${condition.replace(/\s+/g, '')}`}
                            checked={formData.conditions.includes(condition)}
                            onChange={() => handleCategorizedConditionChange(category, condition)}
                          />
                          <label htmlFor={`condition${condition.replace(/\s+/g, '')}`}>
                            {condition}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Custom condition input */}
              <div className={styles.addCustomField}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter other condition"
                  value={formData.otherConditions}
                  onChange={(e) => handleArrayInputChange('conditions', e)}
                />
                <button 
                  type="button" 
                  className={styles.addButton}
                  onClick={() => addCustomItem('conditions')}
                  disabled={!formData.otherConditions?.trim()}
                >
                  Add
                </button>
              </div>
              
              {/* Display selected conditions summary */}
              {formData.conditions.length > 0 && (
                <div className={styles.selectedSummary}>
                  <h3 className={styles.summaryTitle}>
                    <CheckSquare size={18} />
                    Selected Conditions Summary
                  </h3>
                  <div className={styles.tagList}>
                    {formData.conditions.map((condition, index) => (
                      <div className={styles.tag} key={index}>
                        {condition}
                        <button 
                          type="button"
                          onClick={() => {
                            // Find category for this condition
                            let foundCategory = null;
                            for (const item of medicalHistoryData) {
                              if (item.condition === condition) {
                                foundCategory = item.category;
                                break;
                              }
                            }
                            
                            if (foundCategory) {
                              handleCategorizedConditionChange(foundCategory, condition);
                            } else {
                              handleCheckboxChange('conditions', condition);
                            }
                          }}
                          className={styles.removeTag}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Allergies Section - we'll keep this as is since allergies are now part of the categorized conditions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Pill size={20} />
              Current Medications
            </h2>
            <div className={styles.formGroup}>
              <label htmlFor="medications">
                List all medications you are currently taking
              </label>
              <div className={styles.addCustomField}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter medication (e.g., Lisinopril 10mg daily)"
                  value={formData.otherMedications}
                  onChange={(e) => handleArrayInputChange('medications', e)}
                />
                <button 
                  type="button" 
                  className={styles.addButton}
                  onClick={() => addCustomItem('medications')}
                  disabled={!formData.otherMedications?.trim()}
                >
                  Add
                </button>
              </div>
              
              {formData.medications.length > 0 && (
                <div className={styles.selectedItems}>
                  <p>Current medications:</p>
                  <div className={styles.tagList}>
                    {formData.medications.map((medication, index) => (
                      <div className={styles.tag} key={index}>
                        {medication}
                        <button 
                          type="button" 
                          onClick={() => handleCheckboxChange('medications', medication)}
                          className={styles.removeTag}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.medications.length === 0 && (
                <p className={styles.note}>No medications added yet</p>
              )}
            </div>
          </div>

          {/* Family History Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Activity size={20} />
              Family History
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.checkboxGroupLabel}>
                Has anyone in your immediate family been diagnosed with:
              </label>
              <div className={styles.familyHistoryOptions}>
                {[
                  { id: 'heart_disease', label: 'Heart Disease' },
                  { id: 'diabetes', label: 'Diabetes' },
                  { id: 'cancer', label: 'Cancer' },
                  { id: 'hypertension', label: 'Hypertension' },
                  { id: 'stroke', label: 'Stroke' },
                  { id: 'mental_illness', label: 'Mental Illness' }
                ].map((condition) => (
                  <div className={styles.checkboxOption} key={condition.id}>
                    <input
                      type="checkbox"
                      id={`family${condition.id}`}
                      checked={formData.family_history[condition.id]}
                      onChange={(e) => handleFamilyHistoryChange(condition.id, e.target.checked)}
                    />
                    <label htmlFor={`family${condition.id}`}>{condition.label}</label>
                  </div>
                ))}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="familyOther">Other family medical conditions:</label>
                <textarea
                  id="familyOther"
                  className={styles.textarea}
                  placeholder="Please describe any other conditions that run in your family"
                  value={formData.family_history.other}
                  onChange={(e) => handleFamilyHistoryChange('other', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.clearButton}
              onClick={resetForm}
            >
              <Trash size={18} />
              Clear Form
            </button>
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <Loader size={18} className={styles.spinningIcon} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Medical History
                </>
              )}
            </button>
          </div>
        </motion.form>
        
        {/* Confirmation Dialog */}
      {/* Enhanced Confirmation Dialog */}
{showConfirm && (
  <div className={styles.confirmationOverlay}>
    <motion.div 
      className={styles.confirmationDialog}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.confirmationHeader}>
        <AlertCircle size={20} />
        <h3>Submit Medical History?</h3>
      </div>
      
      <div className={styles.confirmationContent}>
        <p>Please review and confirm your medical history information:</p>
        
        <div className={styles.confirmationSummary}>
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Medical Conditions:</span>
            <span className={styles.confirmValue}>{formData.conditions.length} selected</span>
          </div>
          
          {formData.medications.length > 0 && (
            <div className={styles.confirmItem}>
              <span className={styles.confirmLabel}>Medications:</span>
              <span className={styles.confirmValue}>{formData.medications.length} listed</span>
            </div>
          )}
          
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Family History:</span>
            <span className={styles.confirmValue}>
              {Object.entries(formData.family_history)
                .filter(([key, value]) => value === true)
                .length} items
            </span>
          </div>
          
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Last Updated:</span>
            <span className={styles.confirmValue}>
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.confirmButtons}>
        <button 
          onClick={() => setShowConfirm(false)}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            setShowConfirm(false);
            submitForm();
          }}
          className={styles.confirmButton}
        >
          Confirm & Submit
        </button>
      </div>
    </motion.div>
  </div>
)}
        
      </div>
    </div>
  );
}

export default MedicalHistory;