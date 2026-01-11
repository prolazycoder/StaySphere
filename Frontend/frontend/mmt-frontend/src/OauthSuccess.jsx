
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OauthSuccess() {
  const navigate = useNavigate();

  const parseJwt = (token) => {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const pictureUrl = params.get("pictureUrl");

    // Save tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    if (pictureUrl) {
      localStorage.setItem("profilePic", pictureUrl);
    } else {
      console.warn("No pictureUrl found in URL parameters!");
    }

    // Decode and store user details from JWT
    const decoded = parseJwt(accessToken);

    if (decoded) {
      localStorage.setItem("fullName", decoded.name || "");
      localStorage.setItem("email", decoded.sub || "");
      localStorage.setItem("role", decoded.role || "");
      localStorage.setItem("userID", decoded.userID || "");
      localStorage.setItem("gender", decoded.gender || "");
      localStorage.setItem("country", decoded.country || "");
      localStorage.setItem("city", decoded.city || "");
      localStorage.setItem("dob", decoded.dob || "");
    }

    // Smooth redirect
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 100);

  }, []);

  return <h2>Logging you in...</h2>;
}
