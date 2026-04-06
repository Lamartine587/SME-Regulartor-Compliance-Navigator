import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../services/authService";
import { saveToken } from "../utils/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Success handler for Google
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const data = await googleLogin(credentialResponse.credential);
      
      if (data?.access_token) {
        saveToken(data.access_token);
        localStorage.setItem("user_id", data.user_id);
        
        // Save the role and route accordingly
        const userRole = data.role || "customer";
        localStorage.setItem("user_role", userRole);

        if (userRole === "admin") {
          navigate("/admin/errors"); 
        } else {
          navigate("/dashboard"); 
        }
      }
    } catch (err) {
      setError(err.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      
      if (data?.access_token) {
        saveToken(data.access_token);
        localStorage.setItem("user_id", data.user_id);
        
        // Save the role and route accordingly
        const userRole = data.role || "customer";
        localStorage.setItem("user_role", userRole);

        if (userRole === "admin") {
          navigate("/admin/errors"); 
        } else {
          navigate("/dashboard"); 
        }
      }
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
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
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg outline-none bg-gray-50" />
          </div>

          <div className="relative">
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" title="reset" className="text-xs font-semibold text-indigo-600 hover:underline">Forgot Password?</Link>
            </div>
            <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg outline-none bg-gray-50 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
              {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center text-sm font-medium">{error}</div>}

        <button type="submit" disabled={loading} className="w-full p-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-xs text-gray-400 font-medium uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed")}
            useOneTap
            theme="outline"
            size="large"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
}