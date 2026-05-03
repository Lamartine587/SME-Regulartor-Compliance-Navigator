import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import AdminRoute from "./components/AdminRoute";
import AdminErrors from "./pages/AdminErrors";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings"; 

import Register from "./Auth/Register";
import VerifyOTP from "./Auth/VerifyOTP";
import SignIn from "./Auth/SignIn";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Transactions from './pages/Transactions';
import PersonalVault from './pages/PersonalVault';

import Information from "./pages/PermitRequirements"

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* CHANGED: Path matched to sidebar /login redirect */}
          <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} /> 
          
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOTP/></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
         
          {/* Protected Vault Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/permits" element={<ProtectedRoute><Permits /></ProtectedRoute>} />
          
          {/* FIXED: Changed /document-vault to /documents to match Sidebar.jsx */}
          <Route path="/documents" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
          
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><PersonalVault /></ProtectedRoute>} />
          
          {/* Profile & Settings */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/*More infor for users */}
          <Route path="/info" element={<ProtectedRoute><Information /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/errors" element={<AdminErrors />} />
          </Route>

          {/* Wildcard Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;