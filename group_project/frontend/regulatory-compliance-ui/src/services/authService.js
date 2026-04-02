const BASE_URL = "http://127.0.0.1:8000";

// --- GOOGLE AUTHENTICATION ---
export const googleLogin = async (googleToken) => {
  const res = await fetch(`${BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: googleToken }), 
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error("🚨 FASTAPI GOOGLE ERROR:", data.detail);
    const errorMessage = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    throw new Error(errorMessage || "Google Sign-In failed.");
  }
  return data;
};

// --- STANDARD REGISTRATION ---
export const registerUser = async (email, phone, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone, password }),
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error("🚨 FASTAPI REGISTRATION ERROR:", data.detail); 
    const errorMessage = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    throw new Error(errorMessage || "Registration failed.");
  }
  return data;
};

// --- STANDARD LOGIN ---
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }), 
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error("🚨 FASTAPI ERROR DETAIL:", data.detail); 
    const errorMessage = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    throw new Error(errorMessage || "Login failed.");
  }
  return data;
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.json();
};

// --- VERIFY OTP ---
export const verifyOTP = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error("🚨 FASTAPI VERIFY ERROR:", data.detail); 
    const errorMessage = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    throw new Error(errorMessage || "Verification failed.");
  }
  return data;
};

// --- RESET PASSWORD ---
export const resetPassword = async (email, otp_code, new_password) => {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code, new_password }),
  });
  return await res.json();
};

export const requestPhoneOTP = async () => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/api/auth/request-otp`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Could not request OTP.");
  return data;
};