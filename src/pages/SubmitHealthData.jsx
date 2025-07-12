import React, { useState } from "react";
import styles from './SubmitHealthData.module.css';
import NavBar from '../components/NavBar';
// Use environment variable for API key
const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;
export function SubmitHealthData() {
  const [form, setForm] = useState({
    user_id: "",
    heartbeat: "",
    temperature: "",
    blood_pressure: "",
    oxygen_level: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add last_updated only in the background
 const dataToSend = {
      user_id: form.user_id,
      heartbeat: parseInt(form.heartbeat, 10),
      temperature: parseFloat(form.temperature),
      bloodPressure: form.bloodPressure,
      oxygenLevel: parseFloat(form.oxygenLevel),
      lastUpdated: new Date().toISOString(),
    };
    const response = await fetch(`${API_URL}/api/health`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(dataToSend),
    });
    const result = await response.json();
    setMessage(result.message);
    
  };

  return (
    <div className={styles.container}>
       <NavBar />
      <h2 className={styles.title}>Submit Health Data</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.keys(form).map((field) => (
          <div key={field} className={styles.inputGroup}>
            <input
              name={field}
              placeholder={field}
              value={form[field]}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        ))}
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}