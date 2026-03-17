import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { saveToken } from "../utils/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignIn() {
  const navigate = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async(e)=>{
    e.preventDefault();
    setError("");

    if(!validateEmail(email)){
      setError("Please enter a valid email");
      return;
    }
    if(!password){
      setError("Password cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email,password);

      if(data.access_token){
        saveToken(data.access_token);
        navigate("/dashboard");
      } else if(data.detail && Array.isArray(data.detail) && data.detail.length > 0){
        setError(data.detail[0].msg);
      } else {
        setError("Login failed");
      }

    } catch(err){
      setError("Network error, please try again");
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">

        <h2 className="text-2xl font-bold text-center">Sign In</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={()=>setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-500"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
          </button>
        </div>

        <button
          type="submit"
          disabled={!email || !password || loading}
          className={`w-full p-2 rounded text-white ${!email || !password || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {loading ? "Signing In..." : "Login"}
        </button>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">
            {error}
          </div>
        )}

        <p className="text-sm text-blue-500 text-center cursor-pointer" onClick={()=>navigate("/ForgotPassword")}>
          Forgot Password?
        </p>

        <p className="text-sm text-center">
          Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={()=>navigate("/Register")}>Register</span>
        </p>

      </form>

    </div>
  )
}