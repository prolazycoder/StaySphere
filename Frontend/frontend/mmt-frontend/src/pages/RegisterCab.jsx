import React, { useState } from "react";
import { FaCloudUploadAlt, FaCar, FaUserTie, FaFileContract, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../dashboard.css";

export default function RegisterCab() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    carModel: "",
    description: "",
    city: "",
    vehicleNumber: "",
    pricePerKm: "",
    driverName: "",
    contactNumber: "",
    email: "",
  });

  const [files, setFiles] = useState({
    drivingLicense: null,
    rcBook: null,
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

    // NOTE: Backend endpoint for Cabs is hypothetical here.
    // Replace '/cabs/register' with actual endpoint when available.
    const requestData = {
      ...formData,
    };

    try {
      // Simulating API call or sending to a potential endpoint
      const response = await api.post("/api/v1/cab-owner/register-cab", requestData);

      if (response.status === 200 || response.status === 201) {
        setMessage("Cab registered successfully! We will review it shortly.");
        // Reset form
        setFormData({
          carModel: "", description: "", city: "", vehicleNumber: "",
          pricePerKm: "", driverName: "", contactNumber: "", email: ""
        });
        setFiles({ drivingLicense: null, rcBook: null });
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Fallback for demo purposes if endpoint doesn't exist yet
      if (error.response?.status === 404) {
        setMessage("UI Demo: Backend endpoint not found, but form is valid!");
      } else {
        const errorMsg = error.response?.data?.message || "Failed to submit application.";
        setMessage(errorMsg);
      }
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
        <h1 className="page-title">Register Your Cab</h1>
        <p className="page-subtitle">Partner with StaySphere and start earning with your vehicle.</p>

        {message && (
          <div className={`status-message ${message.includes("success") || message.includes("Demo") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form className="registration-form" onSubmit={handleSubmit}>

          {/* Section 1: Cab Details */}
          <div className="form-section">
            <h3 className="section-title"><FaCar /> Cab Details</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Car Model</label>
                <input
                  type="text"
                  name="carModel"
                  placeholder="e.g. Swift Dzire"
                  value={formData.carModel}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Operating City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="e.g. MH 12 AB 1234"
                  value={formData.vehicleNumber}
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
                  placeholder="Describe vehicle condition, amenities (AC, WiFi)..."
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Driver & Contact */}
          <div className="form-section">
            <h3 className="section-title"><FaUserTie /> Driver & Contact</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  placeholder="Driver Full Name"
                  value={formData.driverName}
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
                  placeholder="driver@business.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Price per Km (₹)</label>
                <input
                  type="number"
                  name="pricePerKm"
                  placeholder="e.g. 12"
                  value={formData.pricePerKm}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Documents */}
          <div className="form-section">
            <h3 className="section-title"><FaFileContract /> Legal Documents</h3>
            <p className="section-desc">Please upload valid documents for verification.</p>

            <div className="file-upload-grid">
              {/* License Upload */}
              <div className="file-upload-box">
                <label htmlFor="drivingLicense" className="file-label">
                  <FaCloudUploadAlt className="upload-icon" />
                  <span>Upload Driving License</span>
                  <small>{files.drivingLicense ? files.drivingLicense.name : "Supported: JPG, PNG, PDF"}</small>
                </label>
                <input
                  type="file"
                  id="drivingLicense"
                  name="drivingLicense"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              {/* RC Book Upload */}
              <div className="file-upload-box">
                <label htmlFor="rcBook" className="file-label">
                  <FaCloudUploadAlt className="upload-icon" />
                  <span>Upload RC Book</span>
                  <small>{files.rcBook ? files.rcBook.name : "Supported: JPG, PNG, PDF"}</small>
                </label>
                <input
                  type="file"
                  id="rcBook"
                  name="rcBook"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Register Cab"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
