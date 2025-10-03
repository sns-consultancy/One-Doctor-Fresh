// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  isAllowed,                  // optional override boolean
  redirectTo = "/login",
  children,
}) {
  const location = useLocation();

  // Default check: token in localStorage
  const allowed =
    typeof isAllowed === "boolean"
      ? isAllowed
      : !!localStorage.getItem("authToken") || !!localStorage.getItem("token");

  if (!allowed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return children ?? <Outlet />;
}
