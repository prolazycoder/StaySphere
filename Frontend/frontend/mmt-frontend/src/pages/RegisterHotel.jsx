import React, { useState } from "react";
import { FaCloudUploadAlt, FaHotel, FaUserTie, FaFileContract, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../dashboard.css";

export default function RegisterHotel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotelName: "",
    description: "",
    city: "",
    address: "",
    pricePerNight: "",
    contactNumber: "",
    email: "",
    ownerName: "",
  });

  const [files, setFiles] = useState({
    panCard: null,
    aadhaarCard: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // NOTE: Backend currently requires JSON and does not support file upload on this endpoint.
    // Files are validated but not sent in the payload.
    if (!files.panCard || !files.aadhaarCard) {
      setMessage("Please upload both PAN and Aadhaar cards.");
      setLoading(false);
      return;
    }

    const requestData = {
      ...formData,
    };

    try {
      // Using configured axios instance which handles the Bearer token automatically
      const response = await api.post("/api/v1/hotel-owner/register-hotel", requestData);

      if (response.status === 200 || response.status === 201) {
        setMessage("Hotel registered successfully! We will review it shortly.");
        // Reset form
        setFormData({
          hotelName: "", description: "", city: "", address: "",
          pricePerNight: "", contactNumber: "", email: "", ownerName: ""
        });
        setFiles({ panCard: null, aadhaarCard: null });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.response?.data?.message || "Failed to submit application.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="registration-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="page-title">Register Your Hotel</h1>
        <p className="page-subtitle">Partner with StaySphere and grow your business today.</p>

        {message && (
          <div className={`status-message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form className="registration-form" onSubmit={handleSubmit}>

          {/* Section 1: Hotel Details */}
          <div className="form-section">
            <h3 className="section-title"><FaHotel /> Hotel Details</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Hotel Name</label>
                <input
                  type="text"
                  name="hotelName"
                  placeholder="e.g. Grand Palace"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label>Full Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your hotel..."
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="form-section">
            <h3 className="section-title"><FaUserTie /> Contact & Ownership</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Owner Full Name"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Business Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="hotel@business.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Starting Price (₹)</label>
                <input
                  type="number"
                  name="pricePerNight"
                  placeholder="e.g. 2499"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Legal Documents */}
          <div className="form-section">
            <h3 className="section-title"><FaFileContract /> Legal Documents</h3>
            <p className="section-desc">Please upload the owner's valid ID proof for verification.</p>

            <div className="file-upload-grid">
              {/* PAN Card Upload */}
              <div className="file-upload-box">
                <label htmlFor="panCard" className="file-label">
                  <FaCloudUploadAlt className="upload-icon" />
                  <span>Upload PAN Card</span>
                  <small>{files.panCard ? files.panCard.name : "Supported: JPG, PNG, PDF"}</small>
                </label>
                <input
                  type="file"
                  id="panCard"
                  name="panCard"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              {/* Aadhaar Card Upload */}
              <div className="file-upload-box">
                <label htmlFor="aadhaarCard" className="file-label">
                  <FaCloudUploadAlt className="upload-icon" />
                  <span>Upload Aadhaar Card</span>
                  <small>{files.aadhaarCard ? files.aadhaarCard.name : "Supported: JPG, PNG, PDF"}</small>
                </label>
                <input
                  type="file"
                  id="aadhaarCard"
                  name="aadhaarCard"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
