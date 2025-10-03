import React, { useState } from "react";
import styles from "../styles/FindDoctors.module.css";

const sampleDoctors = [
  {
    id: 1,
    name: "Dr. Anjali Mehta",
    specialization: "Cardiologist",
    location: "1.2 miles",
    reviews: 4.8,
    copay: "$25",
    network: "In Network",
  },
  {
    id: 2,
    name: "Dr. Ravi Kumar",
    specialization: "General Physician",
    location: "0.8 miles",
    reviews: 4.5,
    copay: "$20",
    network: "In Network",
  },
  {
    id: 3,
    name: "Dr. Sara Ahmed",
    specialization: "Dermatologist",
    location: "2.0 miles",
    reviews: 4.9,
    copay: "$30",
    network: "Out of Network",
  },
];

export default function FindDoctors() {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(sampleDoctors);

  const handleSearch = () => {
    setFiltered(
      sampleDoctors.filter((doc) =>
        doc.specialization.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>🔍 Find Doctors & Hospitals</h2>
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Enter specialization (e.g., Cardiologist)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className={styles.results}>
        {filtered.map((doc) => (
          <div key={doc.id} className={styles.card}>
            <h3>{doc.name}</h3>
            <p><strong>Specialization:</strong> {doc.specialization}</p>
            <p><strong>Distance:</strong> {doc.location}</p>
            <p><strong>Reviews:</strong> ⭐ {doc.reviews}</p>
            <p><strong>Co-pay:</strong> {doc.copay}</p>
            <p><strong>Network:</strong> {doc.network}</p>
            <button className={styles.profileButton}>View Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}
