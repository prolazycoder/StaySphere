import api from "./axiosConfig";

export const profileApi = {
  getProfileById: async (id) => {
    const res = await api.get(`/profile/user/${id}`);
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await api.put("/user/update", payload);
    return res.data;
  },

  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profile");

    const res = await api.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};
