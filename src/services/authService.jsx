// src/services/authService.js

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||        // fallback for your older env name
  "";

const API_KEY = process.env.REACT_APP_API_KEY;

/** Build default headers (adds x-api-key and bearer token if present) */
function buildHeaders(extra = {}) {
  const h = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };
  if (API_KEY) h["x-api-key"] = API_KEY;
  const token = localStorage.getItem("token");
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

/** Robust JSON request helper with content-type guard */
async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: buildHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      (payload && payload.error) ||
      (payload && payload.message) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return payload;
}

/** Register a new user */
export async function registerUser(user) {
  if (!user?.username && !user?.email) {
    throw new Error("Username or email is required");
  }
  if (!user?.password) {
    throw new Error("Password is required");
  }

  // send both fields; backend can accept either
  const body = {
    username: user.username || user.email,
    email: user.email || user.username,
    password: user.password,
  };

  const data = await request("/api/auth/signup", { method: "POST", body });
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

/** Login a user (accepts username OR email) */
export async function loginUser(usernameOrEmail, password) {
  if (!usernameOrEmail || !password) {
    throw new Error("Username/email and password are required");
  }

  const body = {
    username: usernameOrEmail,
    email: usernameOrEmail,
    password,
  };

  const data = await request("/api/auth/login", { method: "POST", body });
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

/** Logout */
export function logoutUser() {
  localStorage.removeItem("token");
}

/** Check if user is authenticated */
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
