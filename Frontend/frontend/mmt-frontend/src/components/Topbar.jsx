import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/authUtils";

const navLinks = ["Home", "Bookings", "Support"];

export default function Topbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavClick = (link) => {
        if (link === "Home") navigate("/");
        if (link === "Bookings") navigate("/bookings");
        if (link === "Support") navigate("/support");
    };

    return (
        <header className="topbar">
            <nav className="topbar-left">
                {navLinks.map((link) => {
                    const isActive =
                        (link === "Home" && location.pathname === "/") ||
                        (link === "Bookings" && location.pathname === "/bookings") ||
                        (link === "Support" && location.pathname === "/support");

                    return (
                        <button
                            key={link}
                            className={`topbar-link ${isActive ? "topbar-link-active" : ""}`}
                            onClick={() => handleNavClick(link)}
                        >
                            {link}
                        </button>
                    );
                })}
            </nav>

            <div className="topbar-right">
                <div className="user-info" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                    <div className="user-avatar">
                        {localStorage.getItem("profilePic") ? (
                            <img src={localStorage.getItem("profilePic")} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                            (localStorage.getItem("fullName") || "U").charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <p className="user-name">{localStorage.getItem("fullName") || "User"}</p>
                        <p className="user-subtitle">{localStorage.getItem("role") || "Member"}</p>
                    </div>
                </div>
                <button className="topbar-btn ghost" onClick={logoutUser}>Logout</button>
            </div>
        </header>
    );
}
