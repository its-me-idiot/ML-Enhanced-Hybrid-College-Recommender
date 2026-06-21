// frontend/src/components/Auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '', full_name: '',
        phone: '', city: '', state: '', preferred_branch: '', max_budget: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await register({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone,
                city: formData.city,
                state: formData.state,
                preferred_branch: formData.preferred_branch,
                max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null
            });
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
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
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#111827' }}>
                    Create Your Account
                </h2>
                
                {error && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        color: '#dc2626'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {/* Form fields - simplified for space */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Password *</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm Password *</label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    
                    {/* Add other form fields as needed */}
                    
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
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        Sign in
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
    fontSize: '1rem'
};

export default Register;
