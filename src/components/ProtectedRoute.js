import React from "react";
import { Navigate } from "react-router-dom";

/**
 * A component that protects routes by checking for a valid token in localStorage.
 * If the token is missing or invalid, it clears stored data and redirects to login.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Example: adjust this check if your token is a real JWT or other string
  const isAuthenticated = token === "loggedin";

  if (isAuthenticated) {
    return children;
  }

  // Token invalid or missing - cleanup and redirect
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  return <Navigate to="/login" replace />;
}
