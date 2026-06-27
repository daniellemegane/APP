import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const fileUrl = (id) => (id ? `${API}/files/${id}` : null);

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
