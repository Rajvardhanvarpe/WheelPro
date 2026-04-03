import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-workshop-dark dark:text-white">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.warn('⚠️ ProtectedRoute: User not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
