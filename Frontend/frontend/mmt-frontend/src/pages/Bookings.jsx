import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { FaCalendarAlt, FaHotel, FaMoneyBillWave, FaMapMarkerAlt, FaBed, FaArrowLeft } from 'react-icons/fa';
import '../styles/Bookings.css'; // We'll create this CSS file

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-header">
            <h1>Your Bookings</h1>
            <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
              <FaArrowLeft /> Dashboard
            </button>
          </div>
          <div className="loading-state">Loading your trips...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-header">
            <h1>Your Bookings</h1>
            <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
              <FaArrowLeft /> Dashboard
            </button>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>Your Bookings</h1>
          <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> Dashboard
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any upcoming bookings yet.</p>
            <button className="search-btn" onClick={() => navigate('/hotels')}>Start Booking</button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-image">
                  {booking.hotelImage ? (
                    <img src={booking.hotelImage} alt={booking.hotelName} />
                  ) : (
                    <div className="placeholder-image"><FaHotel /></div>
                  )}
                  <span className={`status-badge ${booking.bookingStatus.toLowerCase()}`}>
                    {booking.bookingStatus}
                  </span>
                </div>

                <div className="booking-details">
                  <h2>{booking.hotelName}</h2>
                  <p className="location"><FaMapMarkerAlt /> {booking.hotelLocation}</p>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="label">Check-in</span>
                      <span className="value"><FaCalendarAlt /> {booking.checkIn}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Check-out</span>
                      <span className="value"><FaCalendarAlt /> {booking.checkOut}</span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="label">Room</span>
                      <span className="value"><FaBed /> {booking.roomType} x {booking.roomsBooked}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Total</span>
                      <span className="value price"><FaMoneyBillWave /> ₹{booking.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
