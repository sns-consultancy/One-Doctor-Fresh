import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Logo({
  to = "/home",
  label = "One Doctor",
  imgSize = 32,
  className = "",
}) {
  return (
    <Link
      to={to}
      className={`logo-container ${className}`}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
      aria-label={`${label} Logo`}
    >
      <img
        src={logo}
        alt={`${label} Logo`}
        width={imgSize}
        height={imgSize}
        style={{ display: "block" }}
      />
      <span style={{ fontWeight: 600, fontSize: "1.2rem", letterSpacing: "0.5px" }}>
        {label}
      </span>
    </Link>
  );
}
