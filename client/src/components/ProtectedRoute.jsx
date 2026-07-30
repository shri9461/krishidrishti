import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = ['farmer', 'admin'] }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // If trying to access admin pages, redirect to admin-login
    if (allowedRoles.includes('admin') && !allowedRoles.includes('farmer')) {
      return <Navigate to="/admin-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Unauthorized role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
