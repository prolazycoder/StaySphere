import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// ===================== ADD JWT TO EACH REQUEST =====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== HANDLE EXPIRED TOKEN =====================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If JWT expired → try refresh token once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post("http://localhost:8080/auth/refresh", {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem("accessToken", res.data.jwtToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // Update header and retry original API call
        api.defaults.headers.common["Authorization"] =
          "Bearer " + res.data.jwtToken;

        return api(originalRequest);
      } catch (ex) {
        // Refresh token failed → logout
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
