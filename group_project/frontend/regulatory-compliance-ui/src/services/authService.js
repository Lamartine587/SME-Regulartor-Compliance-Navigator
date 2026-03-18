// src/services/authService.js

// Register a new user
export const registerUser = async (email, phone, password) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone, password }),
  });
  return await res.json();
};

// Login
export const loginUser = async (email, password) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
};

// Forgot Password (send OTP)
export const forgotPassword = async (email) => {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.json();
};

// Verify OTP
export const verifyOTP = async (user_id, otp_code, verification_type) => {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, otp_code, verification_type }),
  });
  return await res.json();
};

// Reset Password
export const resetPassword = async (email, otp_code, new_password) => {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code, new_password }),
  });
  return await res.json();
};