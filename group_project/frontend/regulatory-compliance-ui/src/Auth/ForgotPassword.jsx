import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(email);

      if (data?.detail && Array.isArray(data.detail) && data.detail.length > 0) {
        setError(data.detail[0].msg || "Failed to send OTP. Please try again.");
      } else {
        // Success: Store the email so VerifyOTP can grab it, then navigate
        sessionStorage.setItem("resetEmail", email);
        navigate("/verify-otp");
      }
    } catch (err) {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password</h2>
          <p className="text-sm text-gray-500">
            Enter your email address and we will send you a 6-digit verification code.
          </p>
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!email || loading}
          className={`w-full p-3 rounded-lg text-white font-semibold tracking-wide transition-all ${
            !email || loading 
              ? "bg-indigo-300 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          {loading ? "Sending Code..." : "Send OTP"}
        </button>

        <div className="pt-4 text-center border-t border-gray-100">
          <Link
            to="/login"
            className="text-sm text-indigo-600 font-semibold hover:underline"
          >
            &larr; Back to Sign In
          </Link>
        </div>

      </form>
    </div>
  );
}