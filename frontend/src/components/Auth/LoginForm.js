// frontend/src/components/Auth/LoginForm.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const LoginForm = ({ onToggle, onNavigateToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        
        try {
            console.log('🔐 Attempting login from form...');
            await login(formData.email, formData.password);
            console.log('✅ Login successful, redirecting to dashboard...');
            navigate('/dashboard');
        } catch (err) {
            console.error('❌ Login error in form:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSignUpClick = (e) => {
        e.preventDefault();
        console.log('🔄 Navigating to register...');
        // Use both methods to ensure navigation works
        if (onNavigateToRegister) onNavigateToRegister();
        if (onToggle) onToggle();
        navigate('/register');
    };
    
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '1rem'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        margin: '0 0 0.5rem 0' 
                    }}>
                        Sign In to College Finder
                    </h2>
                    <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.875rem',
                        margin: 0 
                    }}>
                        Welcome back! Please sign in to your account.
                    </p>
                </div>
                
                {error && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        color: '#dc2626',
                        fontSize: '0.875rem'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            minLength="6"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? (
                            <span>Signing In...</span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
                
                {/* Fixed navigation to register */}
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }}>
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                        onClick={handleSignUpClick}
                    >
                        Sign up here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
