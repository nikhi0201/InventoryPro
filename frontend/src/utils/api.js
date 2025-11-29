// frontend/src/utils/api.js
import axios from "axios";

const TOKEN_KEY = "inventorypro_token"; // must match your auth helper

// Base URL for backend (override with frontend/.env -> VITE_API_BASE)
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // set true only if you use cookie-based auth
});

// Attach token to every request if available
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler: log errors and auto-redirect on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const resp = error?.response;
    // helpful logging
    console.error("API error:", resp ? { status: resp.status, data: resp.data } : error);

    // If unauthorized, clear token and redirect to login
    if (resp && resp.status === 401) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch (e) {}
      // Avoid redirect during API calls from background scripts — check window
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
