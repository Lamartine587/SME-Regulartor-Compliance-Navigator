import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();
  
  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Validation Helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10,15}$/.test(phone);

  // Password Rules
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

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number (10-15 digits).");
      return;
    }
    
    if (!passwordValid) {
      setError("Password must include: " + failedRules.join(", "));
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(email, phone, password);
      
      if (data?.detail) {
        setError(data.detail[0]?.msg || "Registration failed. Please try again.");
        return;
      }

      // SUCCESS: Route to the OTP page and pass the email behind the scenes
      navigate("/verify-otp", { state: { email } });

    } catch (err) {
      setError(err.message || "Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Replaced the plain bg-gray-100 with a modern, dark gradient
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      
      {/* Upgraded the card styling with better padding, softer borders, and a larger shadow */}
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500">Join the SME Regulatory Compliance Navigator</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              required
              type="text"
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none bg-gray-50"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none bg-gray-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (<EyeSlashIcon className="h-5 w-5"/>) : (<EyeIcon className ="h-5 w-5"/>)}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
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
                  ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400" 
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={!passwordValid}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              {showConfirmPassword ? (<EyeSlashIcon className="h-5 w-5"/>) : (<EyeIcon className ="h-5 w-5"/>)}
            </button>
          </div>
        </div>

        {/* Live Password Rules Feedback */}
        {password && !passwordValid && showPasswordError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm">
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
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-semibold tracking-wide transition-all ${
            loading 
              ? "bg-indigo-400 cursor-wait" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign in here
          </button>
        </p>

      </form>
    </div>
  );
}