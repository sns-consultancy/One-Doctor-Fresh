import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Basic token expiration check
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // Token doesn't have correct format, remove and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        return <Navigate to="/login" replace />;
      }
      
      // If all checks pass, render the protected component
      return children;
    } catch (e) {
      console.error("Token validation error:", e);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return <Navigate to="/login" replace />;
    }
  }
  
  // No token found, redirect to login
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;