import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserFromToken } from '../utils/auth';

export function PrivateRoute({ children }) {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return children;
}

export function AdminRoute({ children }) {
    const user = getUserFromToken();
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    if (!user?.is_admin) return <Navigate to="/homepage" replace />;
    return children;
}
