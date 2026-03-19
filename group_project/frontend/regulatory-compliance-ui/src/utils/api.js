import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiRequest } from './utils/api';

// Importing your auth pages
import SignIn from './Auth/SignIn';
import Register from './Auth/Register';
import ForgotPassword from './Auth/ForgotPassword';
import ResetPassword from './Auth/ResetPassword';
import VerifyOTP from './Auth/VerifyOTP';

// Importing your main pages
import Dashboard from './pages/Dashboard';
import DocumentVault from './pages/DocumentVault';
import Permits from './pages/Permits';
import Reminders from './pages/Reminders';

// Importing route protectors
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');

  useEffect(() => {
    // Ping the FastAPI backend health check endpoint
    const checkConnection = async () => {
      try {
        // Assuming your FastAPI server is running on port 8000
        const data = await apiRequest('http://localhost:8000/api/health');
        setBackendStatus('🟢 ' + data.message);
      } catch (error) {
        console.error("Backend connection failed:", error);
        setBackendStatus('🔴 Backend is offline or unreachable. Check your FastAPI server.');
      }
    };

    checkConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        
        {/* Development Banner: Tells you immediately if the connection is working */}
        <div className="bg-slate-900 text-white text-center py-2 text-xs font-mono tracking-wide">
          API Status: {backendStatus}
        </div>

        <Routes>
          {/* Public Routes (Only accessible if NOT logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
          </Route>

          {/* Protected Routes (Require valid JWT token) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<DocumentVault />} />
            <Route path="/permits" element={<Permits />} />
            <Route path="/reminders" element={<Reminders />} />
          </Route>

          {/* Fallback Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;