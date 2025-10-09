import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styles from "./Signup.module.css";
import {
  User, Mail, Lock, Phone, Calendar, MapPin, Upload,
  Mic, Fingerprint, Smile, CheckCircle
} from "lucide-react";

// Firebase
import { auth, db, storage } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  doc, setDoc, serverTimestamp
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL
} from "firebase/storage";

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
    profilePhoto: null,
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
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPhotoPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVoiceInput = (field) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({ ...prev, [field]: transcript }));
    };
  };

  const handleFaceId = () => alert("Face ID simulated. (Integrate WebAuthn for real biometrics.)");
  const handleThumbprint = () => alert("Thumbprint simulated. (Integrate WebAuthn for real biometrics.)");

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

  const handleVerifyOtp = async () => {
    if (otp.trim() !== "123456") {
      setMessage("Invalid OTP. Try 123456 for demo.");
      return;
    }
    setMessage("");
    setStep(3);
    await handleRegister();
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      // 1) Create Firebase Auth user (this generates the UID)
      const { user } = await createUserWithEmailAndPassword(
        auth, formData.email, formData.password
      );

      // 2) Optional: upload profile photo
      let photoURL = null;
      if (formData.profilePhoto) {
        const pRef = ref(storage, `profiles/${user.uid}/${formData.profilePhoto.name}`);
        await uploadBytes(pRef, formData.profilePhoto);
        photoURL = await getDownloadURL(pRef);
      }

      // 3) Update display name / photo
      await updateProfile(user, {
        displayName: formData.fullName || user.email,
        photoURL: photoURL || undefined,
      });

      // 4) Persist additional fields to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        dob: formData.dob || null,
        mobile: formData.mobile || null,
        country: formData.country || null,
        photoURL: photoURL || null,
        consentGmail,
        consentPhone,
        createdAt: serverTimestamp(),
      });

      setMessage("Registration successful!");
      setTimeout(() => navigate("/login"), 1200);
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
              <button type="button" onClick={() => handleVoiceInput("fullName")} className={styles.iconButton}>
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
                required
              />
              <button type="button" onClick={() => handleVoiceInput("email")} className={styles.iconButton}>
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
                I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
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
              <button type="button" onClick={handleFaceId} className={styles.secondaryButton}>
                <Smile size={16} />
                Face ID
              </button>
              <button type="button" onClick={handleThumbprint} className={styles.secondaryButton}>
                <Fingerprint size={16} />
                Thumbprint
              </button>
            </div>

            <button className={styles.button} disabled={loading}>
              Continue
            </button>

            {/* Google Sign In (prefills; account is created at Login via Google) */}
            <div className={styles.googleButton}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    const decoded = jwtDecode(credentialResponse.credential);
                    setFormData((prev) => ({
                      ...prev,
                      email: decoded.email || prev.email,
                      fullName: decoded.name || prev.fullName,
                    }));
                    alert("Google verified – details prefilled.");
                  }
                }}
                onError={() => setMessage("Google verification failed.")}
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
            <button onClick={handleVerifyOtp} className={styles.button} disabled={loading}>
              Verify OTP
            </button>
          </div>
        )}

        {/* Success */}
        {step === 3 && (
          <div className={styles.success}>
            <CheckCircle size={48} />
            <p>Account created successfully! Redirecting…</p>
          </div>
        )}

        {/* Message */}
        {message && (
          <p className={message.includes("successful") ? styles.success : styles.error}>
            {message}
          </p>
        )}

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;