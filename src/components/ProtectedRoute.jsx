import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isAuthed = !!localStorage.getItem("auth_token"); // swap for your real auth check
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
}
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (token === "loggedin") {
    return children;
  }

  // Invalid or missing token - cleanup and redirect
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  return <Navigate to="/login" replace />;
}


