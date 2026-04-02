import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile"; // <-- ADDED THIS IMPORT

// Auth Components
import Register from "./Auth/Register";
import VerifyOTP from "./Auth/VerifyOTP";
import SignIn from "./Auth/SignIn";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";

// Route Protectors
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* PUBLIC AUTH ROUTES (Bypassed if already logged in) */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} /> 
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP/></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
       
        {/* PROTECTED ROUTES (Require Login) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/permits" element={<ProtectedRoute><Permits /></ProtectedRoute>} />
        <Route path="/document-vault" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
        
        {/* <-- ADDED THE PROFILE ROUTE HERE --> */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* DEFAULT REDIRECT (Catches 404s and sends them home) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;