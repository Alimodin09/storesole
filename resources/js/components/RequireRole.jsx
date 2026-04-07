import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthUser } from '../utils/auth.js';

export default function RequireRole({ role, children, redirectTo }) {
    const authUser = getAuthUser();

    if (!authUser?.token || authUser?.user?.role !== role) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
