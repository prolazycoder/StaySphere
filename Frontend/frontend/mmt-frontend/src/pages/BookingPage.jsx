import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaHotel, FaCalendarAlt, FaUsers } from "react-icons/fa";
import api from "../api/axiosConfig";
import "../dashboard.css";

// Room types matching backend enum
const ROOM_TYPES = [
  { value: "SINGLE", label: "Single Room" },
  { value: "DOUBLE", label: "Double Room" },
  { value: "DELUXE", label: "Deluxe Room" },
  { value: "SUITE", label: "Suite" },
  { value: "FAMILY", label: "Family Room" },
  { value: "KING", label: "King Room" },
  { value: "QUEEN", label: "Queen Room" },
];

export default function BookingPage() {
  const { id } = useParams(); // hotelId
  const navigate = useNavigate();
  const location = useLocation();

  // State from search (defaults)
  const searchState = location.state || {};
  const [checkIn, setCheckIn] = useState(searchState.checkIn || "");
  const [checkOut, setCheckOut] = useState(searchState.checkOut || "");
  const [rooms, setRooms] = useState(searchState.rooms || 1);
  const [selectedRoomType, setSelectedRoomType] = useState("SINGLE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      setLoading(false);
      return;
    }

    const payload = {
      hotelId: id,
      roomType: selectedRoomType,
      checkIn: checkIn,
      checkOut: checkOut,
      rooms: parseInt(rooms, 10),
    };

    try {
      const response = await api.post("/api/bookings/book", payload);
      console.log("Booking successful:", response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate("/bookings"); // redirect to bookings list
      }, 2000);
    } catch (err) {
      console.error("Booking failed", err);
      // Extract error message if available
      const msg = err.response?.data?.message || "Booking failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "50px" }}>
        <div style={{ color: "green", fontSize: "48px", marginBottom: "20px" }}>✔</div>
        <h2>Booking Confirmed!</h2>
        <p>Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="registration-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </button>

        <h1 className="page-title">Confirm Your Booking</h1>
        <p className="page-subtitle">
          Review your details and confirm your stay with StaySphere.
        </p>

        {error && (
          <div className="status-message error">
            {error}
          </div>
        )}

        <form className="registration-form" onSubmit={handleSubmit}>

          {/* Section 1: Stay Dates */}
          <div className="form-section">
            <h3 className="section-title"><FaCalendarAlt /> Stay Dates</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Check-in Date</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Check-out Date</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Room Details */}
          <div className="form-section">
            <h3 className="section-title"><FaHotel /> Room Details</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Rooms Required</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Room Category</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Guest Info Placeholder (could be expanded) */}
          <div className="form-section">
            <h3 className="section-title"><FaUsers /> Guest Information</h3>
            <p className="section-desc">Booking will be made in your name.</p>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
