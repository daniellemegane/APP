import axios from "axios";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Jeton stocké localement : les navigateurs mobiles bloquent le cookie tiers du backend.
const TOKEN_KEY = "access_token";

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export const clearToken = () => setToken(null);

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      // Les appels /auth/* (mauvais mot de passe, /auth/me au démarrage) gèrent eux-mêmes leur 401.
      const isAuthCall = (error.config?.url || "").startsWith("/auth/");
      if (!isAuthCall && window.location.pathname !== "/connexion") {
        window.location.assign("/connexion");
      }
    }
    return Promise.reject(error);
  }
);

export const fileUrl = (id) => (id ? `${API}/files/${id}` : null);

export const buildDocUrl = (docId) => `${API}/files/${docId}`;

export const formatPrice = (n) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
};

export const formatApiError = (e) => {
  const detail = e?.response?.data?.detail;
  if (!detail) return e?.message || "Une erreur est survenue";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || JSON.stringify(d)).join(" · ");
  if (detail?.msg) return detail.msg;
  return String(detail);
};
