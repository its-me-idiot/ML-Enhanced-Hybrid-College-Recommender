// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import AuthContext and useAuth hook
import { AuthProvider, useAuth } from './AuthContext';

// Import components for routing
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import UserProfile from './components/Profile/UserProfile';
import AdminPanel from './components/Admin/AdminPanel';

// AppRoutes component to handle routing based on authentication state
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Register forms

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f9fafb' 
      }}>
        <div style={{ 
          textAlign: 'center' 
        }}>
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
            color: '#6b7280' 
          }}>
            Loading...
          </p>
        </div>
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

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm 
              onToggle={() => setIsLogin(false)} 
              onNavigateToRegister={() => setIsLogin(false)}
            />
          )
        } 
      />
      
      <Route 
        path="/register" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterForm 
              onToggle={() => setIsLogin(true)}
              onNavigateToLogin={() => setIsLogin(true)}
            />
          )
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          user ? (
            <UserProfile />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Admin Protected Route */}
      <Route 
        path="/admin" 
        element={
          user && user.is_admin ? (
            <AdminPanel />
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Home route */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Catch-all route */}
      <Route 
        path="*" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

// Root Component for the entire application
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
