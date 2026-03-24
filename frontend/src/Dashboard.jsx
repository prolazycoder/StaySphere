// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createHotelOwner } from "./api/hotelApi";
import "./dashboard.css";
import { useUser } from "./context/UserContext";

const navLinks = ["Home", "Bookings", "Support"];

const trendingDestinations = [
  {
    id: 1,
    city: "Goa",
    country: "India",
    price: "₹2,799",
    tag: "Beach • Nightlife",
    image:
      "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 2,
    city: "Manali",
    country: "India",
    price: "₹3,499",
    tag: "Hills • Adventure",
    image:
      "https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 3,
    city: "Jaipur",
    country: "India",
    price: "₹2,399",
    tag: "Heritage • City",
    image:
      "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 4,
    city: "Bangkok",
    country: "Thailand",
    price: "₹5,299",
    tag: "City • Nightlife",
    image:
      "https://images.pexels.com/photos/2341830/pexels-photo-2341830.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  // ✅ GLOBAL USER
  const { user, setUser, loadUser } = useUser();

  // ✅ Dashboard load hote hi user fetch
  useEffect(() => {
    loadUser();
  }, []);

  // ✅ Role from token storage
  const userRole = (localStorage.getItem("userRole") || "").toUpperCase();
  const isDriver = userRole === "DRIVER";

  // ================================
  // STATE MANAGEMENT FOR BOOKING UI
  // ================================
  const [activeService, setActiveService] = useState(
    localStorage.getItem("search_service") || "Hotels"
  );
  const [location, setLocation] = useState(
    localStorage.getItem("search_location") || ""
  );
  const [checkIn, setCheckIn] = useState(
    localStorage.getItem("search_checkIn") || ""
  );
  const [checkOut, setCheckOut] = useState(
    localStorage.getItem("search_checkOut") || ""
  );
  const [guests, setGuests] = useState(
    localStorage.getItem("search_guests") || "2 Guests"
  );
  const [rooms, setRooms] = useState(
    localStorage.getItem("search_rooms") || "1 Room"
  );

  useEffect(() => {
    localStorage.setItem("search_service", activeService);
    localStorage.setItem("search_location", location);
    localStorage.setItem("search_checkIn", checkIn);
    localStorage.setItem("search_checkOut", checkOut);
    localStorage.setItem("search_guests", guests);
    localStorage.setItem("search_rooms", rooms);
  }, [activeService, location, checkIn, checkOut, guests, rooms]);

  // =============================
  // NAVIGATION SECTIONS
  // =============================
  const handleNavClick = (link) => {
    if (link === "Home") navigate("/dashboard");
    if (link === "Bookings") navigate("/bookings");
    if (link === "Support") navigate("/support");
  };

  const handleRegisterHotelClick = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    // Automatically attempt to upgrade user to a HotelOwner object
    // If it fails because they are already an owner, we can safely ignore the error 
    // and just send them to the setup wizard anyway.
    try {
      const response = await createHotelOwner(token);
      if (response && response.data && response.data.hotelOwnerId) {
        localStorage.setItem("hotelOwnerId", response.data.hotelOwnerId);
      }
    } catch (err) {
      // Ignoring 400 series errors (i.e. 'User is already an owner')
      // Still proceed to send them to the wizard.
      console.log("Owner creation note:", err?.response?.data || err.message);
    }

    navigate("/register-hotel");
  };

  // =============================
  // LOGOUT FUNCTION
  // =============================
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");

    try {
      if (accessToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/user/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (err) {
      console.log("Logout request failed (ignored)", err);
    }

    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    window.location.replace("/");
  };

  // =============================
  // SEARCH HANDLER FOR HOTELS / CABS
  // =============================
  const handleSearch = () => {
    if (activeService === "Hotels") {
      navigate("/hotel/search", {
        state: { location, checkIn, checkOut, guests, rooms },
      });
    } else {
      navigate("/cabs", {
        state: { location, date: checkIn, guests },
      });
    }
  };

  return (
    <div className="app-root">
      {/* ================================
          LEFT SIDEBAR
         ================================ */}
      <aside className="sidebar">
        {/* LOGO SECTION */}
        <div className="sidebar-logo">
          <div className="logo-icon">H</div>
          <div className="logo-text">
            <span className="logo-title">Lovely Travels</span>
            <span className="logo-subtitle"></span>
          </div>
        </div>

        {/* USER SIDEBAR LINKS */}
        <div className="sidebar-section">
          <p className="sidebar-section-title">User Dashboard</p>

          <button
            className="sidebar-link sidebar-link-active"
            onClick={() => navigate("/dashboard")}
          >
            <span className="sidebar-dot" />
            Overview
          </button>

          <button className="sidebar-link" onClick={() => navigate("/hotel/search")}>
            Hotels
          </button>

          <button className="sidebar-link" onClick={() => navigate("/cabs")}>
            Cabs
          </button>

          <button className="sidebar-link" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>

        {/* ✅ DRIVER PANEL (only if role DRIVER) */}
        {isDriver && (
          <div className="sidebar-section">
            <p className="sidebar-section-title">Driver Panel</p>

            <button
              className="sidebar-cta"
              onClick={() => navigate("/driver/dashboard")}
            >
              Driver Dashboard
            </button>
          </div>
        )}

        {/* OWNER SECTION */}
        <div className="sidebar-section">
          <p className="sidebar-section-title">Owner Panel</p>

          <button
            className="sidebar-cta"
            onClick={handleRegisterHotelClick}
          >
            Register Hotel
          </button>

          <button
            className="sidebar-cta secondary"
            onClick={() => navigate("/register-cab")}
            style={{ marginTop: "10px" }}
          >
            Register Cab
          </button>
        </div>

        {/* HELP */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-title">Need Help?</p>
          <p className="sidebar-footer-text">24x7 support available</p>

          <button
            className="sidebar-help-btn"
            onClick={() => navigate("/support")}
          >
            Chat with us
          </button>
        </div>
      </aside>

      {/* ================================
          MAIN AREA
         ================================ */}
      <div className="main-area">
        {/* TOP BAR */}
        <header className="topbar">
          <nav className="topbar-left">
            {navLinks.map((link) => (
              <button
                key={link}
                className={`topbar-link ${link === "Home" ? "topbar-link-active" : ""
                  }`}
                onClick={() => handleNavClick(link)}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="topbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 900 }}>
                    {(user?.fullName?.[0] || "U").toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <p className="user-name">{user?.fullName || "User"}</p>
                <p className="user-subtitle">{user?.email || "Member"}</p>
              </div>
            </div>

            <button className="topbar-btn ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="content">
          <section className="booking-row">
            <div className="booking-card">
              <div className="booking-card-header">
                <h2 className="booking-title">Book Your Stay or Ride</h2>
                <p className="booking-subtitle">
                  Find the best {activeService.toLowerCase()} at exclusive
                  prices.
                </p>

                <div className="booking-toggle">
                  <button
                    className={`toggle-pill ${activeService === "Hotels" ? "active" : ""
                      }`}
                    onClick={() => setActiveService("Hotels")}
                  >
                    Hotels
                  </button>

                  <button
                    className={`toggle-pill ${activeService === "Cabs" ? "active" : ""
                      }`}
                    onClick={() => setActiveService("Cabs")}
                  >
                    Cabs
                  </button>
                </div>
              </div>

              <div className="booking-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder={
                        activeService === "Hotels"
                          ? "City, landmark, or hotel name"
                          : "Pickup city or airport"
                      }
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      {activeService === "Hotels" ? "Check-in" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>

                  {activeService === "Hotels" && (
                    <div className="form-field">
                      <label>Check-out</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4+ Guests</option>
                    </select>
                  </div>

                  {activeService === "Hotels" && (
                    <div className="form-field">
                      <label>Rooms</label>
                      <select
                        value={rooms}
                        onChange={(e) => setRooms(e.target.value)}
                      >
                        <option>1 Room</option>
                        <option>2 Rooms</option>
                        <option>3 Rooms</option>
                      </select>
                    </div>
                  )}

                  <div className="form-field form-field-button">
                    <button className="search-btn" onClick={handleSearch}>
                      {activeService === "Hotels"
                        ? "Search Hotels"
                        : "Search Cabs"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="why-card">
              <h3>Why book with us?</h3>
              <ul className="why-list">
                <li>
                  <span className="why-icon">💸</span>
                  <div>
                    <p className="why-title">Best Prices Guaranteed</p>
                    <p className="why-text">
                      Get exclusive app-only deals and offers.
                    </p>
                  </div>
                </li>

                <li>
                  <span className="why-icon">✅</span>
                  <div>
                    <p className="why-title">Verified Stays</p>
                    <p className="why-text">
                      Every property is quality checked before listing.
                    </p>
                  </div>
                </li>

                <li>
                  <span className="why-icon">🕐</span>
                  <div>
                    <p className="why-title">24x7 Support</p>
                    <p className="why-text">
                      We’re here for you anytime, anywhere.
                    </p>
                  </div>
                </li>
              </ul>
            </aside>
          </section>

          <section className="trending-section">
            <div className="trending-head">
              <div>
                <h3 className="trending-title">Trending Destinations</h3>
                <p className="trending-subtitle">
                  Popular places people are booking right now.
                </p>
              </div>

              <button
                className="view-all-btn"
                onClick={() => navigate("/hotels")}
              >
                View all
              </button>
            </div>

            <div className="trending-list">
              {trendingDestinations.map((item) => (
                <article key={item.id} className="destination-card">
                  <div className="destination-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.city}
                      className="destination-image"
                    />
                    <span className="destination-badge">TOP PICK</span>
                  </div>

                  <div className="destination-content">
                    <div className="destination-text">
                      <p className="destination-city">{item.city}</p>
                      <p className="destination-country">{item.country}</p>
                    </div>

                    <p className="destination-tag">{item.tag}</p>

                    <div className="destination-footer">
                      <p className="destination-price">
                        From <span>{item.price}</span> / night
                      </p>

                      <button
                        className="small-btn"
                        onClick={() => navigate(`/book/${item.id}`)}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="footer">
            <button className="footer-link" onClick={() => navigate('/about-us')}>About Us</button>
            <button className="footer-link" onClick={() => navigate('/terms')}>Terms &amp; Conditions</button>
            <button className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
