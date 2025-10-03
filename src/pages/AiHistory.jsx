import React, { useState } from "react";
import styles from "../styles/AiHistory.module.css";
import { extractTextFromFile } from "../utils/extractText";

export default function AiHistory() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [selectedRegion, setSelectedRegion] = useState("US-USD");
  const [isRecording, setIsRecording] = useState(false);

  // Mapping OCR language code to browser locale
  const languageMap = {
    eng: "en-US",
    hin: "hi-IN",
    tel: "te-IN",
    spa: "es-ES",
    fra: "fr-FR"
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = languageMap[selectedLanguage] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
      alert("Voice input failed. Please try again.");
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };

    recognition.start();
  };

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[selectedLanguage] || "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant that explains and summarizes medical history. Translate the result into the user's selected language: ${selectedLanguage}.`
            },
            { role: "user", content: input },
          ],
        }),
      });

      if (!res.ok) throw new Error("API request failed.");

      const data = await res.json();
      const text = data.choices[0].message.content;
      setResponse(text);
      speakResponse(text);
    } catch (err) {
      setError("Failed to process request. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    let allText = "";
    for (const file of files) {
      try {
        const text = await extractTextFromFile(file, selectedLanguage);
        allText += `\n[File: ${file.name}]\n${text}`;
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
        allText += `\n[File: ${file.name}] Text extraction failed.\n`;
      }
    }
    setInput((prev) => prev + "\n" + allText);
  };

  const handleEmail = (text) => {
    const subject = encodeURIComponent("My Medical History Summary");
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = (text) => {
    const message = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleSMS = (text) => {
    const message = encodeURIComponent(text);
    window.location.href = `sms:?body=${message}`;
  };

  const handleDownload = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medical_summary.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToDocs = () => {
    const title = prompt("Enter a title for this document:");
    if (!title) return;

    const saved = JSON.parse(localStorage.getItem("savedDocuments")) || [];
    saved.push({
      title,
      text: response,
      date: new Date().toISOString(),
    });

    localStorage.setItem("savedDocuments", JSON.stringify(saved));
    alert("Document saved successfully!");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📋 AI Medical History</h2>
      <p className={styles.subheading}>
        Paste your medical history, record voice, or upload files. Results will be translated to your selected language.
      </p>

      <div className={styles.selectors}>
        <label>
          OCR Language:
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={styles.select}
          >
            <option value="eng">English</option>
            <option value="hin">Hindi</option>
            <option value="tel">Telugu</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
          </select>
        </label>
        <label>
          Region & Currency:
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className={styles.select}
          >
            <option value="US-USD">United States - USD</option>
            <option value="IN-INR">India - INR</option>
            <option value="ES-EUR">Spain - EUR</option>
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className={styles.input}
          placeholder="Enter your medical history here..."
          required
        />
        <div className={styles.buttons}>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`${styles.voiceButton} ${isRecording ? styles.recording : ""}`}
          >
            {isRecording ? "🎙️ Listening..." : "🎤 Voice Input"}
          </button>
        </div>
      </form>

      <div className={styles.fileUpload}>
        <label>
          Upload Files (PDFs, Images, Videos):
          <input
            type="file"
            accept=".pdf,image/*,video/*"
            multiple
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {response && (
        <div className={styles.responseBox}>
          <strong>AI Insights:</strong>
          <p>{response}</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.shareOptions}>
        <h4 className={styles.shareHeading}>Share or Save</h4>
        <div className={styles.shareButtons}>
          <button type="button" className={styles.shareButton} onClick={() => handleEmail(response)}>
            📧 Email Doctor
          </button>
          <button type="button" className={styles.shareButton} onClick={() => handleWhatsApp(response)}>
            💬 WhatsApp
          </button>
          <button type="button" className={styles.shareButton} onClick={() => handleSMS(response)}>
            📱 SMS
          </button>
          <button type="button" className={styles.shareButton} onClick={() => handleDownload(response)}>
            💾 Save Locally
          </button>
          <button type="button" className={styles.shareButton} onClick={() => handleSaveToDocs(response)}>
            📂 Save to Documents
          </button>
        </div>
      </div>

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> Summaries are AI-generated and do not replace professional advice.
      </p>
    </div>
  );
}
