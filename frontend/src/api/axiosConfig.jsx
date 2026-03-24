import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

        if (!refreshToken) {
          localStorage.clear();
          window.location.replace("/");
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              "Refresh-Token": refreshToken,
            },
          }
        );

        if (res.data.success === false) {
          throw new Error(res.data.message || "Refresh token expired");
        }

        const newAccessToken = res.data.jwtToken || res.data.accessToken;

        // Save new tokens
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // Update header for next calls
        api.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;

        // Update this failed request token too (important)
        originalRequest.headers.Authorization = "Bearer " + newAccessToken;

        // retry original request
        return api(originalRequest);
      } catch (ex) {
        // Refresh token failed → logout
        localStorage.clear();
        window.location.replace("/");
        return Promise.reject(ex);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
