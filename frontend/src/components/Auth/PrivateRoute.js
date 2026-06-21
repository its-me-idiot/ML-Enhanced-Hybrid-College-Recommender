// frontend/src/components/Auth/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

/**
 * PrivateRoute Component - Protects routes that require authentication
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.redirectTo - Path to redirect to if not authenticated (default: '/login')
 * @param {Function} props.fallback - Custom fallback component while loading
 * @param {boolean} props.requireAdmin - Whether admin privileges are required
 * @returns {React.ReactElement} Protected route component
 */
const PrivateRoute = ({ 
    children, 
    redirectTo = '/login', 
    fallback = null, 
    requireAdmin = false 
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while authentication is being checked
    if (loading) {
        return fallback || (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{ textAlign: 'center' }}>
                    {/* Loading Spinner */}
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    
                    <p style={{ 
                        marginTop: '1rem', 
                        color: '#6b7280',
                        fontSize: '1rem',
                        fontWeight: '500'
                    }}>
                        Checking authentication...
                    </p>
                    
                    <p style={{ 
                        marginTop: '0.5rem', 
                        color: '#9ca3af',
                        fontSize: '0.875rem'
                    }}>
                        Please wait while we verify your session.
                    </p>
                </div>

                {/* CSS Animation for spinner */}
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user) {
        console.log('🔒 User not authenticated, redirecting to:', redirectTo);
        return <Navigate 
            to={redirectTo} 
            state={{ 
                from: location,
                message: 'Please log in to access this page'
            }} 
            replace 
        />;
    }

    // Check if admin privileges are required
    if (requireAdmin && !user.is_admin) {
        console.log('🚫 User lacks admin privileges, redirecting to dashboard');
        return <Navigate 
            to="/dashboard" 
            state={{ 
                from: location,
                message: 'Admin privileges required'
            }} 
            replace 
        />;
    }

    // User is authenticated (and has admin privileges if required)
    console.log('✅ User authenticated, rendering protected content:', user.email);
    return children;
};

export default PrivateRoute;
