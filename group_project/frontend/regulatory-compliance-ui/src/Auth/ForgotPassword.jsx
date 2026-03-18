import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(email);

      if (data.detail && Array.isArray(data.detail) && data.detail.length > 0) {
        setError(data.detail[0].msg);
      } else {
        // Success
        sessionStorage.setItem("resetEmail", email);
        navigate("/verify-otp");
      }
    } catch (err) {
      setError("Network error, please try again");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={!email || loading}
          className={`w-full p-2 rounded text-white ${
            !email || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">{error}</div>}
      </form>
    </div>
  );
}