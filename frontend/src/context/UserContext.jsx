import React, { createContext, useContext, useState } from "react";
import { profileApi } from "../api/profileApi";

const UserContext = createContext(null);

const decodeUserIdFromToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload?.userID;

    if (id) {
      localStorage.setItem("userId", id);
      return id;
    }
    return null;
  } catch {
    return null;
  }
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // ✅ this will load user without opening profile
  const loadUser = async () => {
    const storedId = localStorage.getItem("userId");
    const id = storedId || decodeUserIdFromToken();

    if (!id) return;

    try {
      const res = await profileApi.getProfileById(id);
      if (res?.status === false) return;

      const data = res?.data || {};
      setUser(data);
    } catch (e) {
      console.log("loadUser failed", e);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
