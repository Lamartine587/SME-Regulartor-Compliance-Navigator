const BASE_URL ="http://127.0.0.1:8000"

// Register a new user
export const registerUser = async (email, phone, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone, password }),
  });
  return res.json();
};

// Login
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }), 
  });
  
  const data = await res.json();

  // If the backend threw an error (like a 403 or 401)
  if (!res.ok) {
    console.error("🚨 FASTAPI ERROR DETAIL:", data.detail); // <--- This will tell us everything
    return { detail: data.detail || "Login failed. Please check your credentials." };
  }

  // Success
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }
  
  return data;
};

// Forgot Password (send OTP)
export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.json();
};

// Verify OTP
export const verifyOTP = async (user_id, otp_code, verification_type) => {
  const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, otp_code, verification_type }),
  });
  return await res.json();
};

// Reset Password
export const resetPassword = async (email, otp_code, new_password) => {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code, new_password }),
  });

  return await res.json();
};