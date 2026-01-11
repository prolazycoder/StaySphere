import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../dashboard.css";

export default function Hotels() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = location.state || {}; // { city, checkIn, checkOut, guests, rooms }

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                // Default to showing all hotels if no specific search city, or search by city if provided
                const params = {};
                if (searchParams.location) {
                    params.city = searchParams.location;
                }

                const response = await api.get("/api/v1/hotels/search", { params });

                if (response.data && response.data.hotels) {
                    setHotels(response.data.hotels);
                } else {
                    setHotels([]);
                }
            } catch (err) {
                console.error("Failed to fetch hotels", err);
                setError("Failed to load hotels. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [searchParams.location]);

    const handleBookNow = (hotelId) => {
        navigate(`/book/${hotelId}`, { state: { ...searchParams } });
    };

    return (
        <div className="page-wrapper">
            {/* Header Section */}
            <div style={{ marginBottom: "24px" }}>
                <button onClick={() => navigate("/dashboard")} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1 className="page-title">
                    {searchParams.location ? `Hotels in ${searchParams.location}` : "Explore Hotels"}
                </h1>
                {searchParams.checkIn && (
                    <p className="page-subtitle">
                        {searchParams.checkIn} — {searchParams.checkOut} • {searchParams.guests} Guests • {searchParams.rooms} Rooms
                    </p>
                )}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Finding the best stays for you...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Retry
                    </button>
                </div>
            ) : hotels.length === 0 ? (
                <div className="empty-state">
                    <h3>No hotels found in this location.</h3>
                    <p>Try searching for a different city or explore all hotels.</p>
                    <button onClick={() => navigate("/dashboard")} className="primary-btn">
                        New Search
                    </button>
                </div>
            ) : (
                <div className="hotel-list">
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="hotel-card">
                            <div className="hotel-image-wrapper">
                                {hotel.images && hotel.images.length > 0 ? (
                                    <img
                                        src={hotel.images[0]}
                                        alt={hotel.name}
                                        className="hotel-card-img"
                                    />
                                ) : (
                                    <div className="hotel-placeholder-img">
                                        <span>No Image</span>
                                    </div>
                                )}
                                <div className="hotel-rating-badge">
                                    ★ {hotel.stars || "N/A"}
                                </div>
                            </div>

                            <div className="hotel-card-content">
                                <div className="hotel-header">
                                    <h3 className="hotel-name">{hotel.name}</h3>
                                    <span className="hotel-city">{hotel.city}, {hotel.country}</span>
                                </div>

                                <p className="hotel-address">{hotel.address}</p>

                                <div className="hotel-amenities">
                                    {hotel.amenities && hotel.amenities.slice(0, 3).map((am, idx) => (
                                        <span key={idx} className="amenity-tag">{am}</span>
                                    ))}
                                    {hotel.amenities && hotel.amenities.length > 3 && (
                                        <span className="amenity-tag">+{hotel.amenities.length - 3} more</span>
                                    )}
                                </div>

                                <div className="hotel-card-footer">
                                    <div className="hotel-price">
                                        <span className="price-val">Contact for Price</span>
                                        {/* Price is not in entity yet, using placeholder or could be added later */}
                                    </div>
                                    <button
                                        className="book-btn"
                                        onClick={() => handleBookNow(hotel.id)}
                                    >
                                        Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
