import axios from 'axios';

// Create a standard Axios instance pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Change this if your backend runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT token to requests if the user is logged in
api.interceptors.request.use(
  (config) => {
    // Assuming you store your auth token in localStorage. 
    // Adjust this if you store it in sessionStorage or a cookie.
    const token = localStorage.getItem('token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;