import React from "react";
import styles from "../styles/AppSelector.module.css";



const apps = [
  { name: "One Doctor", path: "/one-doctor" },
  { name: "GingerTips", path: "/ginger-tips" },
  { name: "LifeSync", path: "/life-sync" },
  { name: "Investify", path: "/investify" },
  { name: "HomeGenie", path: "/homegenie" },
  { name: "TravelPlanner", path: "/travel-planner" },
  { name: "LegalAid", path: "/legal-aid" },
  { name: "MoneyMatters", path: "/money-matters" },
  { name: "EduMentor", path: "/edu-mentor" },
  { name: "FitNest", path: "/fitnest" },
];

export default function AppSelector() {
  return (
    <div className={styles.container}>
      <h2>Select an App</h2>
      <div className={styles.grid}>
        {apps.map((app) => (
          <a key={app.name} href={app.path} className={styles.appCard}>
            {app.name}
          </a>
        ))}
      </div>
    </div>
  );
}
