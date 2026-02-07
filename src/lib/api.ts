// API configuration
const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const DEFAULT_BACKEND = "http://localhost:5000";
const resolvedBase =
  rawBase && rawBase.trim() !== "" ? rawBase : DEFAULT_BACKEND;
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