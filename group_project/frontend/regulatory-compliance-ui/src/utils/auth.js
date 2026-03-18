const TOKEN_KEY = "access_token";

// Save token to localStorage
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token (logout)
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check if user is logged in
export const isLoggedIn = () => !!getToken();