import React, { useState, useEffect, useRef } from "react";
import "./LoginPage.css";
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import bgImage from "./assets/Lovely_tavel.login.png";

export default function LoginPage() {
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailToken, setEmailToken] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneToken, setPhoneToken] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [mode, emailToken, phoneToken]);

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
  };

  // ================= EMAIL OTP (UPDATED FIX) =================
  const sendEmailOtp = async () => {
    setError("");
    setLoading(true);

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      // fix slow backend timeout issue
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/otp/send?email=${email}`,
        { method: "POST", signal: controller.signal }
      );

      clearTimeout(timeout);

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send OTP.");
      } else {
        setEmailToken(data.otpToken);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Server is slow. OTP may still arrive. Please check your email.");
      } else {
        setError("Cannot connect to the server.");
      }
    }

    setLoading(false);
  };

  // ================== JWT HELPER ==================
  const parseJwt = (token) => {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  };

  const verifyEmailOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken: emailToken, otp: emailOtp }),
      });

      const data = await res.json();

      if (!data.jwtToken) {
        setError(data.message || "Invalid OTP.");
      } else {
        localStorage.setItem("accessToken", data.jwtToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Extract and save userId
        const decoded = parseJwt(data.jwtToken);
        if (decoded?.userID) {
          localStorage.setItem("userId", decoded.userID);
        }
        if (decoded?.role) {
          localStorage.setItem("role", decoded.role);
        }

        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Server error.");
    }

    setLoading(false);
  };

  // ================= PHONE FLOW =================
  const sendPhoneOtp = async () => {
    setError("");
    setLoading(true);

    if (phone.length !== 10) {
      setError("Phone number must be 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/phone/send?phone=${phone}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send OTP.");
      } else {
        setPhoneToken(data.otpToken);
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }

    setLoading(false);
  };

  const verifyPhoneOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken: phoneToken, otp: phoneOtp }),
      });

      const data = await res.json();

      if (!data.jwtToken) {
        setError(data.message || "Incorrect OTP.");
      } else {
        localStorage.setItem("accessToken", data.jwtToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Extract and save userId
        const decoded = parseJwt(data.jwtToken);
        if (decoded?.userID) {
          localStorage.setItem("userId", decoded.userID);
        }
        if (decoded?.role) {
          localStorage.setItem("role", decoded.role);
        }

        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Server error.");
    }

    setLoading(false);
  };

  // ================= RESET =================
  const goBack = () => {
    setMode(null);
    setEmailToken("");
    setPhoneToken("");
    setEmail("");
    setPhone("");
    setEmailOtp("");
    setPhoneOtp("");
    setError("");
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="glass-card">

        <h1 className="title">Lovely Travels</h1>

        {error && <p className="error-msg">{error}</p>}

        {/* LOGIN OPTIONS */}
        {mode === null && (
          <div className="options">
            <div className="option" onClick={handleGoogleLogin}>
              <FcGoogle size={40} />
              <span>Continue with Google</span>
            </div>

            <div className="option" onClick={() => setMode("phone")}>
              <FaPhoneAlt size={34} color="#333" />
              <span>Login with Phone</span>
            </div>

            <div className="option" onClick={() => setMode("email")}>
              <MdEmail size={40} color="#333" />
              <span>Login with Email</span>
            </div>
          </div>
        )}

        {/* EMAIL UI */}
        {mode === "email" && (
          <div className="input-panel">
            {!emailToken && (
              <>
                <input
                  ref={inputRef}
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-box"
                />

                <button className="action-btn" onClick={sendEmailOtp}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {emailToken && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="input-box"
                />

                <button className="action-btn" onClick={verifyEmailOtp}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            <button className="back-btn" onClick={goBack}>← Back</button>
          </div>
        )}

        {/* PHONE UI */}
        {mode === "phone" && (
          <div className="input-panel">
            {!phoneToken && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-box"
                />

                <button className="action-btn" onClick={sendPhoneOtp}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {phoneToken && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter OTP"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="input-box"
                />

                <button className="action-btn" onClick={verifyPhoneOtp}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            <button className="back-btn" onClick={goBack}>← Back</button>
          </div>
        )}

      </div>
    </div>
  );
}
