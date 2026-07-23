import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function PrivateRoute({ role }) {
  const { token, role: userRole } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    // If trying to access recruiter area as seeker, redirect to seeker dashboard
    if (userRole === 'seeker') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/recruiter" replace />;
    }
  }

  return <Outlet />;
}
