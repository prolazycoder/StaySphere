import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authUtils";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../dashboard.css"; // Reuse dashboard styles

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("details"); // details | support

    const user = {
        fullName: localStorage.getItem("fullName") || "User Name",
        email: localStorage.getItem("email") || "user@example.com",
        role: localStorage.getItem("role") || "USER",
        profilePic: localStorage.getItem("profilePic"),
    };

    return (
        <div className="app-root">
            <Sidebar />
            <div className="main-area">
                <Topbar />
                <main className="content">
                    <div className="page-wrapper">
                        <div style={{ marginBottom: "16px" }}>
                            <button onClick={() => navigate("/")} className="back-btn">
                                ← Back to Dashboard
                            </button>
                        </div>

                        <div className="profile-container">
                            <div className="profile-header">
                                <div className="profile-avatar-wrapper">
                                    {user.profilePic ? (
                                        <img src={user.profilePic} alt="Profile" className="profile-avatar-img" />
                                    ) : (
                                        <div className="profile-avatar-placeholder">
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="profile-info">
                                    <h2 className="profile-name">{user.fullName}</h2>
                                    <p className="profile-email">{user.email}</p>
                                    <span className="profile-role">{user.role}</span>
                                </div>
                                <div className="profile-actions">
                                    <button className="profile-action-btn secondary" onClick={logoutUser}>
                                        Logout
                                    </button>
                                </div>
                            </div>

                            <div className="profile-details-card">
                                <h3>Personal Information</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Full Name</span>
                                    <span className="detail-value">{user.fullName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email Address</span>
                                    <span className="detail-value">{user.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Account Type</span>
                                    <span className="detail-value" style={{ textTransform: 'capitalize' }}>{user.role.toLowerCase()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Member Since</span>
                                    <span className="detail-value">Jan 2024</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "40px" }}>
                                <h3>Account Settings</h3>
                                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                                    <button className="profile-action-btn primary">Edit Profile</button>
                                    <button className="profile-action-btn secondary">Change Password</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
