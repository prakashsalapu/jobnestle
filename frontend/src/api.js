// api.js

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:10000'
  : (import.meta.env.VITE_API_URL || 'https://jobnestle-backend-bi85.onrender.com');

// ================= SAFE HANDLER =================
const handleResponse = async (res) => {
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("❌ Non-JSON response:", text);
    throw new Error("Server returned invalid response");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// ================= REGISTER (email verification flow; no token until verify + login) =================
export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

// ================= LOGIN =================
export const loginUser = async (data) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

// ================= GET ME =================
export const getMe = async (token) => {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(res);
};

export default API_BASE;