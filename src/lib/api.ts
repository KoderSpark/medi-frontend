// API configuration
// Use VITE_API_BASE_URL if set (e.g. in production).
// In development, fall back to "" so requests use relative paths and go through the Vite proxy.
const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const resolvedBase = rawBase && rawBase.trim() !== "" ? rawBase : "";
const BASE = resolvedBase.replace(/\/+$/, "");

export const apiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BASE}/${cleanEndpoint}`;
};

export const API_CONFIG = {
  baseURL: BASE,
  timeout: 10000,
};