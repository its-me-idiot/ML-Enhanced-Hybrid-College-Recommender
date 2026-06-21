// frontend/src/components/Auth/RegisterForm.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const RegisterForm = ({ onToggle, onNavigateToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        city: '',
        state: '',
        preferred_branch: '',
        max_budget: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { register: registerUser, user } = useAuth();
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
        setSuccess('');

        // Validation
        if (!formData.email || !formData.password || !formData.full_name) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }
        
        try {
            console.log('📝 Attempting registration from form...');
            const userData = {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone || null,
                city: formData.city || null,
                state: formData.state || null,
                preferred_branch: formData.preferred_branch || null,
                max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null
            };

            await registerUser(userData);
            setSuccess('Registration successful! Redirecting to login...');
            console.log('✅ Registration successful, redirecting to login...');
            
            // Redirect to login after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('❌ Registration error in form:', err);
            setError(err.message || 'Registration failed. Please try again.');
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
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        console.log('🔄 Navigating to login...');
        // Use both methods to ensure navigation works
        if (onNavigateToLogin) onNavigateToLogin();
        if (onToggle) onToggle();
        navigate('/login');
    };
    
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '500px',
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
                        Create Your Account
                    </h2>
                    <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.875rem',
                        margin: 0 
                    }}>
                        Join College Finder to discover your perfect college!
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

                {success && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        color: '#166534',
                        fontSize: '0.875rem'
                    }}>
                        <strong>Success:</strong> {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Password *</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password (min 6 chars)"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                style={inputStyle}
                            />
                        </div>
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
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                {/* Fixed navigation to login */}
                <div style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }}>
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                        onClick={handleLoginClick}
                    >
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    outline: 'none'
};

export default RegisterForm;
