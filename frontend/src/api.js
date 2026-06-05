import axios from "axios";
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "./authStorage";

const API_URL =
  process.env.REACT_APP_API_URL || "https://api.cardealership.fit";

const api = axios.create({
  baseURL: API_URL,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (
      !original ||
      original._retry ||
      status !== 401 ||
      original.url?.includes("/api/auth/refresh") ||
      original.url?.includes("/api/auth/login")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      if (!original._guestRetry) {
        original._guestRetry = true;
        localStorage.removeItem(TOKEN_KEY);

        if (original.headers) {
          delete original.headers.Authorization;
        }

        return api(original);
      }

      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_URL}/api/auth/refresh`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .finally(() => {
            refreshPromise = null;
          });
      }

      const { data } = await refreshPromise;

      const nextToken = data.accessToken || data.token;

      if (!nextToken) {
        return Promise.reject(error);
      }

      localStorage.setItem(TOKEN_KEY, nextToken);

      if (data.refreshToken) {
        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          data.refreshToken
        );
      }

      original._retry = true;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${nextToken}`;

      return api(original);
    } catch (refreshErr) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      if (!original._guestRetry) {
        original._guestRetry = true;

        if (original.headers) {
          delete original.headers.Authorization;
        }

        return api(original);
      }

      return Promise.reject(refreshErr);
    }
  }
);

export default api;