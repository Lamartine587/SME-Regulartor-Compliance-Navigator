const BASE_URL = "http://127.0.0.1:8000";

// Helper function to grab the token and format the header
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/profile/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch profile data.");
  }
  return await res.json();
};

export const updateProfile = async (profileData) => {
  const res = await fetch(`${BASE_URL}/api/profile/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  
  if (!res.ok) {
    throw new Error("Failed to update profile.");
  }
  return await res.json();
};