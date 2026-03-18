import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DocumentVault from "./pages/DocumentVault";
import Permits from "./pages/Permits";
import Reminders from "./pages/Reminders";
import Register from "./Auth/Register";
import VerifyOTP from "./Auth/VerifyOTP";
import SignIn from "./Auth/SignIn";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";








function App() {
  return (
    <Router>
      <Routes>
        <Route path="Register" element={<PublicRoute><Register /> </PublicRoute>} />
        <Route path="SignIn" element={<PublicRoute> <SignIn /> </PublicRoute>} />
        <Route path="ForgotPassword" element={<PublicRoute><ForgotPassword /> </PublicRoute>} />
        <Route path="VerifyOTP" element={<PublicRoute><VerifyOTP/> </PublicRoute>} />
        <Route path="ResetPassword" element={<PublicRoute><ResetPassword /></PublicRoute>} />
       
        
        {/*protected path*/ }
        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="Permits" element={<ProtectedRoute><Permits /> </ProtectedRoute>} />
        <Route path="Documents" element={<ProtectedRoute><DocumentVault /> </ProtectedRoute>} />
        <Route path="Reminders" element={<ProtectedRoute><Reminders /> </ProtectedRoute>} />

        {/* default redirect*/}
        <Route path="*" element={<SignIn/>}/>
        
      </Routes>
    </Router>
  );
}

export default App;