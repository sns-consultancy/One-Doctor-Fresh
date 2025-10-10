import React from "react";

export default function About() {
  return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <h1>About OneDoctor</h1>

      <p>
        <strong>OneDoctor</strong> is your AI-powered health companion. It helps you securely
        store your medical repository (labs, notes, prescriptions), track vitals, and get
        smart, privacy-conscious symptom insights and summaries powered by AI and ML.
      </p>
   
     <p>
        Beyond storage, One Doctor actively analyzes your health data to provide personalized
        symptom insights and smart suggestions. Whether you’re tracking daily vitals, monitoring
        chronic conditions, or checking early warning signs, our algorithms help you recognize
        health trends and get meaningful recommendations — instantly.
      </p>

      <p>
        The app is designed for both convenience and safety, ensuring your medical information
        stays encrypted and accessible anytime, anywhere. Combined with AI-driven symptom checking,
        early prediction models, and health monitoring integrations (like smartwatch sensors),
        One Doctor empowers you to take control of your wellness with confidence.
      </p>

      <h3>What OneDoctor can do</h3>
      <ul>
        <li>🗂️ <strong>Secure medical records vault</strong> with quick search & organization</li>
        <li>🤒 <strong>Symptom analyzer & triage suggestions</strong> (non-diagnostic)</li>
        <li>📷 <strong>Camera heart-rate & breathing coach</strong> (with Apple Watch support)</li>
        <li>🧠 <strong>Visit note & report summarizer</strong> for doctor appointments</li>
        <li>📤 <strong>PDF export</strong> to share a 30/90-day snapshot with clinicians</li>
      </ul>

      <h3>Security & Privacy</h3>
      <ul>
        <li>🔒 Encrypted storage and privacy-first design</li>
        <li>🧭 You control what you share and when</li>
      </ul>

      <p style={{ opacity: 0.8, marginTop: 16 }}>
        <strong>Disclaimer:</strong> OneDoctor provides wellness insights and educational
        suggestions only. It is <em>not</em> medical advice, diagnosis, or treatment. For
        emergencies, call your local emergency number.
      </p>
    </div>
  );
}
