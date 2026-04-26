import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import api from "../utils/api"; // Using your api utility to hit the backend

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Securely grab the email and OTP code passed from the VerifyOTP page
  const email = location.state?.email;
  const otpCode = location.state?.otpCode;
  
  // Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Security Route Guard: If they didn't come from VerifyOTP, kick them out
  useEffect(() => {
    if (!email || !otpCode) {
      navigate("/Auth/SignIn");
    }
  }, [email, otpCode, navigate]);

  // Password Rules validation
  const passwordRules = {
    "at least 8 characters": password.length >= 8,
    "uppercase letter": /[A-Z]/.test(password),
    "lowercase letter": /[a-z]/.test(password),
    "one number": /[0-9]/.test(password),
    "one special character": /[!@#$%^&*]/.test(password),
  };

  const failedRules = Object.entries(passwordRules)
    .filter(([_, valid]) => !valid)
    .map(([rule]) => rule);

  const passwordValid = failedRules.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      return setError("Password must include: " + failedRules.join(", "));
    }
    
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      // Send the exact payload the FastAPI backend schema expects
      await api.post("/auth/reset-password", {
        email: email,
        otp_code: otpCode,
        new_password: password
      });
      
      // Success: Route back to login to test the new credentials
      navigate("/Auth/SignIn", { state: { message: "Password reset successfully! Please sign in." } });
      
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. The code may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otpCode) return null; // Prevent UI flicker during redirect

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 dark:from-slate-950 to-indigo-900 dark:to-indigo-950 p-4">
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">New Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Secure your SME Compliance Navigator account</p>
        </div>

        <div className="space-y-4">
          {/* New Password Field */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              {showPassword ? (<EyeSlashIcon className="h-5 w-5"/>) : (<EyeIcon className="h-5 w-5"/>)}
            </button>
          </div>
        
          {/* Confirm Password Field */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setShowPasswordError(true)}
              disabled={!passwordValid}
              className={`w-full border p-3 rounded-lg outline-none pr-10 transition-colors ${
                !passwordValid 
                  ? "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-gray-600 cursor-not-allowed text-gray-400 dark:text-gray-500" 
                  : "bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            /> 
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={!passwordValid}
              className="absolute right-3 top-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {/* Live Password Rules Feedback */}
        {password && !passwordValid && showPasswordError && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 p-3 rounded-lg text-sm">
            <span className="font-semibold block mb-1">Password must include:</span>
            <ul className="list-disc pl-5 space-y-1">
              {failedRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* General Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 p-3 rounded-lg text-center text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !passwordValid}
          className={`w-full p-3 rounded-lg text-white font-semibold tracking-wide transition-all ${
            loading || !passwordValid
              ? "bg-indigo-300 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

      </form>
    </div>
  );
}