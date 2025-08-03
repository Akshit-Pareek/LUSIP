// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const { role } = jwtDecode(token);
    if (allowedRoles.includes(role)) {
      return children;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  } catch (err) {
    console.error('Invalid token', err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
