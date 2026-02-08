import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { FaCalendarAlt, FaHotel, FaMoneyBillWave, FaMapMarkerAlt, FaBed, FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../dashboard.css'; // Global Styles
import '../styles/Bookings.css';

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

  return (
    <div className="app-root">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="content">
          <div className="bookings-page">
            <div className="bookings-container">
              <div className="bookings-header">
                <h1>Your Bookings</h1>
                <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
                  <FaArrowLeft /> Dashboard
                </button>
              </div>

              {loading && <div className="loading-state">Loading your trips...</div>}

              {error && <div className="error-message">{error}</div>}

              {!loading && !error && (
                bookings.length === 0 ? (
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
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
