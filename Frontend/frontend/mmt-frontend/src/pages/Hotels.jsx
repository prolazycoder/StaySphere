import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../dashboard.css"; // Reuse dashboard styles

const Hotels = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, [state]); // Re-run if search params change

    const fetchHotels = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construct query params from Dashboard state or defaults
            const searchLocation = state?.location || "";
            // const checkIn = state?.checkIn;
            // const checkOut = state?.checkOut;

            let endpoint = "/api/v1/hotels/search";
            if (searchLocation) {
                endpoint += `?city=${encodeURIComponent(searchLocation)}`;
            }

            const response = await api.get(endpoint);
            // Backend returns { hotels: [...], count: ..., page: ... }
            if (response.data && Array.isArray(response.data.hotels)) {
                setHotels(response.data.hotels);
            } else if (Array.isArray(response.data)) {
                setHotels(response.data);
            } else {
                setHotels([]);
            }

        } catch (err) {
            console.error("Error fetching hotels:", err);
            setError("Failed to load hotels. Please try again.");
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
                    <div className="page-wrapper">
                        <div style={{ marginBottom: "16px" }}>
                            <button onClick={() => navigate("/")} className="back-btn">
                                ← Back to Dashboard
                            </button>
                        </div>

                        <h2 className="page-title">
                            {state?.location ? `Hotels in ${state.location}` : "Explore Hotels"}
                        </h2>
                        <p className="page-subtitle">Find the perfect stay for your journey</p>

                        {/* Search Summary / Filter Bar (Optional) */}
                        {state && (
                            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {state.location && <span className="amenity-tag">📍 {state.location}</span>}
                                {state.checkIn && <span className="amenity-tag">📅 {state.checkIn}</span>}
                                {state.guests && <span className="amenity-tag">👥 {state.guests}</span>}
                            </div>
                        )}

                        {loading && (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Finding best rates...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="error-state">
                                <p style={{ color: "#ef4444" }}>{error}</p>
                                <button className="retry-btn" onClick={fetchHotels}>Retry</button>
                            </div>
                        )}

                        {!loading && !error && hotels.length === 0 && (
                            <div className="empty-state">
                                <p>No hotels found matching your criteria.</p>
                            </div>
                        )}

                        <div className="hotel-list">
                            {hotels.map((hotel) => (
                                <div key={hotel.id} className="hotel-card">
                                    <div className="hotel-image-wrapper">
                                        {hotel.imageUrl ? (
                                            <img src={hotel.imageUrl} alt={hotel.name} className="hotel-card-img" />
                                        ) : (
                                            <div className="hotel-placeholder-img">No Image</div>
                                        )}
                                        <div className="hotel-rating-badge">⭐ {hotel.rating || "4.5"}</div>
                                    </div>
                                    <div className="hotel-card-content">
                                        <div className="hotel-header">
                                            <h3 className="hotel-name">{hotel.name}</h3>
                                            <p className="hotel-city">{hotel.city}, {hotel.country}</p>
                                        </div>
                                        <p className="hotel-address">{hotel.address}</p>

                                        <div className="hotel-amenities">
                                            {/* Mock amenities if not present */}
                                            {hotel.amenities ? (
                                                hotel.amenities.map(a => <span key={a} className="amenity-tag">{a}</span>)
                                            ) : (
                                                <>
                                                    <span className="amenity-tag">Free Wifi</span>
                                                    <span className="amenity-tag">Pool</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="hotel-card-footer">
                                            <div className="hotel-price">
                                                <span className="price-val">₹{hotel.pricePerNight}</span>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>per night</span>
                                            </div>
                                            <button
                                                className="book-btn"
                                                onClick={() => navigate(`/book/${hotel.id}`)}
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Hotels;
