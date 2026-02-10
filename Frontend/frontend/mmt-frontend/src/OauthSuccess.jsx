
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OauthSuccess() {
  const navigate = useNavigate();

  const parseJwt = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};


  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const pictureUrl = params.get("pictureUrl");

  // 🚨 HARD GUARD
  if (!accessToken || !refreshToken) {
    console.error("OAuth failed: tokens missing");
    navigate("/login", { replace: true });
    return;
  }

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  if (pictureUrl) {
    localStorage.setItem("profilePic", pictureUrl);
  }

  const decoded = parseJwt(accessToken);

  if (!decoded) {
    console.error("Invalid JWT");
    navigate("/login", { replace: true });
    return;
  }

  localStorage.setItem("fullName", decoded.name || "");
  localStorage.setItem("email", decoded.sub || "");
  localStorage.setItem("role", decoded.role || "");
  localStorage.setItem("userId", decoded.userID || "");
  localStorage.setItem("gender", decoded.gender || "");
  localStorage.setItem("country", decoded.country || "");
  localStorage.setItem("city", decoded.city || "");
  localStorage.setItem("dob", decoded.dob || "");

  navigate("/dashboard", { replace: true });
}, []);


  return <h2>Logging you in...</h2>;
}
