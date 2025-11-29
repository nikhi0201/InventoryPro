// frontend/src/utils/auth.js

const TOKEN_KEY = "inventorypro_token";
const USER_KEY = "inventorypro_user";

// Save token
export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

// Get token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Save user (optional, used after signup/login)
export function saveUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Get user object
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Logout and redirect to login page
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login";
}
