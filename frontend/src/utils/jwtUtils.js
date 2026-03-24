// src/utils/jwtUtils.js

export const decodeJwtPayload = (token) => {
  try {
    if (!token) return null;

    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    // base64url -> base64
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const storeUserFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // ✅ backend claim keys
  const userId = payload.userID; // IMPORTANT key

  if (userId) localStorage.setItem("userId", userId);

  // ✅ optional: store more details for dashboard UI
  if (payload.name) localStorage.setItem("userName", payload.name);
  if (payload.sub) localStorage.setItem("userEmail", payload.sub);
  if (payload.role) localStorage.setItem("userRole", payload.role);

  if (payload.country) localStorage.setItem("country", payload.country);
  if (payload.city) localStorage.setItem("city", payload.city);
  if (payload.gender) localStorage.setItem("gender", payload.gender);

  return userId || null;
};
