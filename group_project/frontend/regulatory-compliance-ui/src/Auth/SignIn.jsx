import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { saveToken } from "../utils/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!password) {
      setError("Password cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email, password);

      // FastAPI OAuth2 endpoint typically returns access_token
      if (data?.access_token) {
        saveToken(data.access_token);
        navigate("/dashboard"); 
      } else if (data?.detail) {
        // Handle both string errors (HTTPException) and array errors (Validation)
        const errorMessage = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
        setError(errorMessage || "Invalid credentials.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.message || "Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Wire this to your FastAPI Google OAuth endpoint
    // Typically, this looks like redirecting the user to your backend:
    // window.location.href = "http://localhost:8000/api/auth/google/login";
    console.log("Initiating Google Sign-In flow...");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500">Sign in to the SME Regulatory Compliance Navigator</p>
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

          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-indigo-600 hover:underline"
                tabIndex="-1"
              >
                Forgot Password?
              </Link>
            </div>
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
              {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!email || !password || loading}
          className={`w-full p-3 rounded-lg text-white font-semibold tracking-wide transition-all mt-2 ${
            !email || !password || loading 
              ? "bg-indigo-300 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* --- Divider --- */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* --- Google Button --- */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg text-gray-700 font-semibold tracking-wide transition-all bg-white hover:bg-gray-50 shadow-sm active:scale-[0.98]"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </form>
    </div>
  );
}