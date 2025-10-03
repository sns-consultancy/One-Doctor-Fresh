import React, { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Lock } from "lucide-react";

// Dummy fetch function (replace with real API calls)
const fetchProfile = async () => {
  return {
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    phone: "+123456789",
    gender: "Male",
    dob: "1990-05-15",
    address: "123 Health Street",
    country: "USA",
    subscription: "Pro",
    renewalDate: "2025-08-01",
    profilePhoto: null
  };
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchProfile();
      setProfile(data);
    };
    loadProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = () => {
    setEditing(false);
    setMessage("Profile updated successfully!");
    // TODO: Save to server
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }
    setMessage("Password updated successfully!");
    // TODO: Update password on server
    setPasswords({ old: "", new: "", confirm: "" });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>My Profile</h2>

        {/* Profile Photo */}
        <div className={styles.photoSection}>
          <img
            src={
              profile.profilePhoto ||
              "https://via.placeholder.com/100?text=Avatar"
            }
            alt="Profile"
            className={styles.profilePhoto}
          />
          <input
            type="file"
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                profilePhoto: URL.createObjectURL(e.target.files[0])
              }))
            }
          />
        </div>

        {/* Personal Info */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Personal Information</h3>
            {editing ? (
              <>
                <button onClick={saveProfile} title="Save">
                  <Save />
                </button>
                <button onClick={() => setEditing(false)} title="Cancel">
                  <X />
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} title="Edit">
                <Edit />
              </button>
            )}
          </div>

          <div className={styles.fields}>
            <label>
              <User />
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                disabled={!editing}
              />
            </label>
            <label>
              <User />
              <input
                name="username"
                value={profile.username}
                disabled
              />
            </label>
            <label>
              <Mail />
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editing}
              />
            </label>
            <label>
              <Phone />
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!editing}
              />
            </label>
            <label>
              <Calendar />
              <input
                name="dob"
                type="date"
                value={profile.dob}
                onChange={handleChange}
                disabled={!editing}
              />
            </label>
            <label>
              <User />
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!editing}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              <MapPin />
              <input
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!editing}
              />
            </label>
            <label>
              <MapPin />
              <input
                name="country"
                value={profile.country}
                onChange={handleChange}
                disabled={!editing}
              />
            </label>
          </div>
        </div>

        {/* Change Password */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Change Password</h3>
          </div>
          <div className={styles.fields}>
            <label>
              <Lock />
              <input
                type="password"
                placeholder="Old Password"
                value={passwords.old}
                onChange={(e) => setPasswords((p) => ({ ...p, old: e.target.value }))}
              />
            </label>
            <label>
              <Lock />
              <input
                type="password"
                placeholder="New Password"
                value={passwords.new}
                onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
              />
            </label>
            <label>
              <Lock />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              />
            </label>
            <button
              className={styles.button}
              onClick={handlePasswordChange}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Subscription</h3>
          </div>
          <p>Current Plan: <strong>{profile.subscription}</strong></p>
          <p>Renewal Date: {profile.renewalDate}</p>
          <div className={styles.subscriptionActions}>
            <button className={styles.button}>Upgrade Plan</button>
            <button className={styles.buttonAlt}>Cancel Subscription</button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
