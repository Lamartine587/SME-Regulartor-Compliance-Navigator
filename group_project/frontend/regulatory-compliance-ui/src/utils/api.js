import { getToken } from "./auth";

// General API request helper
export const apiRequest = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  // Automatically throw for errors
  if(!res.ok) throw data;

  return data;
};