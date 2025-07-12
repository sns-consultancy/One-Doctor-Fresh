import React, { useState } from "react";
import NavBar from '../components/NavBar';
import styles from './ViewHealthData.module.css';
// Use environment variable for API key
const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

export function ViewHealthData() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setError("");
    try {
    const response = await fetch(`${API_URL}/api/health/${userId}`, {
        headers: { "x-api-key": API_KEY }
      });
      const result = await response.json();
      if (response.ok) setData(result.data);
      else setError(result.message);
    } catch (err) {
      setError("Failed to fetch data");
    }
  };

  return (
    <div className={styles.container}>
        <NavBar />
      <h2 className={styles.title}>View Health Data</h2>
      <input
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className={styles.input}
      />
      <button onClick={fetchData} className={styles.button}>
        Fetch
      </button>
      {error && <p className={styles.message}>{error}</p>}
      {console.log("Current error:", error)}
      {data && (
        <table className={styles.table}>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className={styles.tr}>
                <th className={styles.th}>{key.replace(/_/g, " ")}</th>
                <td className={styles.td}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}