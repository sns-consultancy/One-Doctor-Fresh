import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { registerUser } from "../services/authService";
import styles from "./Signup.module.css";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Upload,
  Mic,
  Fingerprint,
  Smile,
  CheckCircle
} from "lucide-react";

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    email: "",
    mobile: "",
    country: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState("");
  const [consentGmail, setConsentGmail] = useState(false);
  const [consentPhone, setConsentPhone] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVoiceInput = (field) => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({ ...prev, [field]: transcript }));
    };
  };

  const handleFaceId = () => {
    alert("Face ID simulated. (Use WebAuthn APIs for real biometrics.)");
  };

  const handleThumbprint = () => {
    alert("Thumbprint simulated. (Use WebAuthn APIs for real biometrics.)");
  };

  const handleSubmitDetails = (e) => {
    e.preventDefault();
    if (!formData.email && !formData.mobile) {
      setMessage("Please provide either Email or Mobile Number.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setMessage("You must agree to the terms.");
      return;
    }
    setMessage("");
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otp.trim() === "123456") {
      setStep(3);
      setMessage("");
      handleRegister();
    } else {
      setMessage("Invalid OTP. Try 123456 for demo.");
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) payload.append(key, formData[key]);
      });
      payload.append("consentGmail", consentGmail);
      payload.append("consentPhone", consentPhone);

      await registerUser(payload);

      setMessage("Registration successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setMessage(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Your Health Profile</h2>

        {step === 1 && (
          <form onSubmit={handleSubmitDetails} className={styles.form}>
            {/* Full Name */}
            <label className={styles.label}>
              <User />
              <input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => handleVoiceInput("fullName")}
                className={styles.iconButton}
              >
                <Mic size={16} />
              </button>
            </label>

            {/* DOB */}
            <label className={styles.label}>
              <Calendar />
              <input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </label>

            {/* Email */}
            <label className={styles.label}>
              <Mail />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleVoiceInput("email")}
                className={styles.iconButton}
              >
                <Mic size={16} />
              </button>
            </label>

            {/* Mobile */}
            <label className={styles.label}>
              <Phone />
              <input
                name="mobile"
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                disabled={loading}
              />
            </label>

            {/* Country */}
            <label className={styles.label}>
              <MapPin />
              <input
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
              />
            </label>

            {/* Password */}
            <label className={styles.label}>
              <Lock />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </label>

            {/* Confirm Password */}
            <label className={styles.label}>
              <Lock />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </label>

            {/* Profile Photo */}
            <label className={styles.label}>
              <Upload />
              <input
                name="profilePhoto"
                type="file"
                onChange={handleChange}
                disabled={loading}
              />
            </label>
            {photoPreview && (
              <div className={styles.preview}>
                <img src={photoPreview} alt="Preview" />
              </div>
            )}

            {/* Consents */}
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={loading}
                required
              />
              <span>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noreferrer">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>.
              </span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={consentGmail}
                onChange={(e) => setConsentGmail(e.target.checked)}
                disabled={loading}
              />
              <span>Sync Gmail contacts</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={consentPhone}
                onChange={(e) => setConsentPhone(e.target.checked)}
                disabled={loading}
              />
              <span>Sync phone contacts</span>
            </label>

            {/* Biometric Buttons */}
            <div className={styles.actionsRow}>
              <button
                type="button"
                onClick={handleFaceId}
                className={styles.secondaryButton}
              >
                <Smile size={16} />
                Face ID
              </button>
              <button
                type="button"
                onClick={handleThumbprint}
                className={styles.secondaryButton}
              >
                <Fingerprint size={16} />
                Thumbprint
              </button>
            </div>

            {/* Continue Button */}
            <button className={styles.button} disabled={loading}>
              Continue
            </button>

            {/* Google Sign In */}
            <div className={styles.googleButton}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    const decoded = jwtDecode(credentialResponse.credential);
                    console.log("Decoded Google User:", decoded);
                    setFormData((prev) => ({
                      ...prev,
                      email: decoded.email,
                      fullName: decoded.name
                    }));
                    alert("Google sign-in successful!");
                  }
                }}
                onError={() => {
                  console.log("Google Login Failed");
                  setMessage("Google sign-in failed.");
                }}
              />
            </div>
          </form>
        )}

        {/* OTP Verification */}
        {step === 2 && (
          <div className={styles.form}>
            <p>Enter the OTP sent to your email or mobile:</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP (use 123456)"
            />
            <button
              onClick={handleVerifyOtp}
              className={styles.button}
              disabled={loading}
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Success */}
        {step === 3 && (
          <div className={styles.success}>
            <CheckCircle size={48} />
            <p>Account created successfully! Redirecting...</p>
          </div>
        )}

        {/* Message */}
        {message && (
          <p
            className={
              message.includes("successful") ? styles.success : styles.error
            }
          >
            {message}
          </p>
        )}

        {/* Footer */}
        <p className={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
