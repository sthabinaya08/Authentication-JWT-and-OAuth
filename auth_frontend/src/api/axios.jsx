import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/auth/";

const api = axios.create({ baseURL: BASE_URL });

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh");
        const res = await axios.post(BASE_URL + "token/refresh/", {
          refresh: refreshToken,
        });
        localStorage.setItem("access", res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        logoutLocal();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export function logoutLocal() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export { api };
