// frontend/src/AuthContext.js - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from './apiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log('🔍 Checking authentication status...');
            const data = await apiService.getProfile();
            
            // Handle both success and 401 responses
            if (data.authenticated === false) {
                console.log('ℹ️ User not authenticated (401)');
                setUser(null);
            } else if (data.user) {
                setUser(data.user);
                console.log('✅ User is authenticated:', data.user.email);
            } else {
                console.log('ℹ️ No user data received');
                setUser(null);
            }
        } catch (error) {
            console.log('ℹ️ Authentication check failed:', error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('🔐 Logging in user:', email);
            const data = await apiService.login(email, password);
            setUser(data.user);
            console.log('✅ Login successful in context');
            return data.user;
        } catch (error) {
            console.error('❌ Login failed in context:', error.message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Registering user:', userData.email);
            const data = await apiService.register(userData);
            console.log('✅ Registration successful in context');
            // Don't auto-login after registration
            return data.user;
        } catch (error) {
            console.error('❌ Registration failed in context:', error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log('🚪 Logging out user...');
            await apiService.logout();
            setUser(null);
            console.log('✅ Logout successful in context');
        } catch (error) {
            console.error('❌ Logout error in context:', error);
            // Still clear user state even if API call fails
            setUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            console.log('📝 Updating user profile in context...');
            const data = await apiService.updateProfile(profileData);
            setUser(data.user);
            console.log('✅ Profile updated successfully in context');
            return data.user;
        } catch (error) {
            console.error('❌ Profile update failed in context:', error);
            throw error;
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        loading,
        isAuthenticated: !!user,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
