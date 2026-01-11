import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authUtils";
import api from "../api/axiosConfig";
import "../dashboard.css"; // Correct path to CSS

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    country: "",
    city: "",
    profilePic: "",
    phoneNumber: "",
    gender: "",
    dob: "", // Added dob
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/user/get/current-user");
        if (response.data && response.data.success) {
          const userData = response.data.data;
          setUser({
            name: userData.fullName || "",
            email: userData.email || "",
            role: userData.role || "",
            country: userData.country || "",
            city: userData.city || "",
            profilePic: userData.profilePic || "",
            phoneNumber: userData.phoneNumber || "",
            gender: userData.gender || "",
            dob: userData.dob || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setError("Failed to load user data.");
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  const handleEditClick = () => {
    setFormData({ ...user });
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({});
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClick = async () => {
    try {
      setError(null);
      setSuccessMsg(null);

      const payload = {
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender || null,
        city: formData.city,
        country: formData.country,
        dob: formData.dob || null,
      };

      const response = await api.put("/user/update", payload);

      if (response.data && response.data.status) {
        setUser({ ...formData });
        setIsEditing(false);
        setSuccessMsg("Profile updated successfully!");
      } else {
        setError(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update failed", err);
      setError("An error occurred while updating backend.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="profile-container">

        {/* Navigation Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="profile-action-btn secondary"
          >
            ← Home
          </button>
          <div className="profile-actions">
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="profile-action-btn primary"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={handleLogout}
              className="profile-action-btn danger"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="profile-header">
          {error && <div className="notification-popup error">{error}</div>}
          {successMsg && <div className="notification-popup success">{successMsg}</div>}

          <div className="profile-avatar-wrapper">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name || "User"}</h1>
            <p className="profile-email">{user.email || "No Email"}</p>
            {user.role && <span className="profile-role">{user.role}</span>}
          </div>
        </div>

        <div className="profile-details-card">
          <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
            {isEditing ? "Edit Details" : "Personal Details"}
          </h3>

          {/* Name */}
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <span className="detail-value">{user.name || "N/A"}</span>
            )}
          </div>

          {/* Email */}
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <span className="detail-value">{user.email || "N/A"}</span>
            )}
          </div>

          {/* Role (Always Read-Only) */}
          <div className="detail-row">
            <span className="detail-label">Role:</span>
            <span className="detail-value" style={{ opacity: 0.7 }}>{user.role || "N/A"}</span>
          </div>

          {/* Phone */}
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            {isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <span className="detail-value">{user.phoneNumber || "N/A"}</span>
            )}
          </div>

          {/* Gender */}
          <div className="detail-row">
            <span className="detail-label">Gender:</span>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                className="edit-input"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            ) : (
              <span className="detail-value">{user.gender || "N/A"}</span>
            )}
          </div>

          {/* City */}
          <div className="detail-row">
            <span className="detail-label">City:</span>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <span className="detail-value">{user.city || "N/A"}</span>
            )}
          </div>

          {/* Country */}
          <div className="detail-row">
            <span className="detail-label">Country:</span>
            {isEditing ? (
              <input
                type="text"
                name="country"
                value={formData.country || ""}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <span className="detail-value">{user.country || "N/A"}</span>
            )}
          </div>

          {/* Action Buttons for Edit Mode */}
          {isEditing && (
            <div className="edit-actions">
              <button
                onClick={handleCancelClick}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                className="save-btn"
              >
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
