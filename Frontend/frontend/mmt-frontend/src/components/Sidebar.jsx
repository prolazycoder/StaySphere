import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaHotel, FaTaxi, FaUser, FaBuilding, FaCarSide, FaHeadset } from "react-icons/fa";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">H</div>
                <div className="logo-text">
                    <span className="logo-title">StaySphere</span>
                    <span className="logo-subtitle">Stay &amp; Ride</span>
                </div>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-section-title">User Dashboard</p>
                <button
                    className={`sidebar-link ${location.pathname === "/" ? "sidebar-link-active" : ""}`}
                    onClick={() => navigate("/")}
                >
                    <FaHome /> Overview
                </button>
                <button
                    className={`sidebar-link ${location.pathname === "/hotels" ? "sidebar-link-active" : ""}`}
                    onClick={() => navigate("/hotels")}
                >
                    <FaHotel /> Hotels
                </button>
                <button
                    className={`sidebar-link ${location.pathname.startsWith("/cabs") ? "sidebar-link-active" : ""}`}
                    onClick={() => navigate("/cabs")}
                >
                    <FaTaxi /> Cabs
                </button>
                <button
                    className={`sidebar-link ${location.pathname === "/profile" ? "sidebar-link-active" : ""}`}
                    onClick={() => navigate("/profile")}
                >
                    <FaUser /> Profile
                </button>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-section-title">Owner Panel</p>
                <button className={`sidebar-cta ${location.pathname === "/register-hotel" ? "active-cta" : ""}`} onClick={() => navigate("/register-hotel")}>
                    <FaBuilding /> Register Hotel
                </button>
                <button className={`sidebar-cta secondary ${location.pathname === "/register-cab" ? "active-cta" : ""}`} onClick={() => navigate("/register-cab")}>
                    <FaCarSide /> Register Cab
                </button>
                {localStorage.getItem("role") === "DRIVER" && (
                    <button className={`sidebar-cta ${location.pathname === "/driver" ? "active-cta" : ""}`} onClick={() => navigate("/driver")}>
                        <FaTaxi /> Driver Panel
                    </button>
                )}
            </div>

            <div className="sidebar-footer">
                <p className="sidebar-footer-title">Need Help?</p>
                <button className="sidebar-help-btn" onClick={() => navigate("/support")}>
                    <FaHeadset /> Chat with us
                </button>
            </div>
        </aside>
    );
}
