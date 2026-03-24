import React, { useState } from "react";
import { searchHotels } from "../../api/hotelApi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Hotel.css";

function SearchHotels() {
    // Advanced Search State
    const [searchParams, setSearchParams] = useState({
        city: "",
        state: "",
        country: "",
        minStars: 1,
        maxStars: 5,
        amenities: [] // e.g., ["WIFI", "POOL", "GYM"]
    });

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Available basic amenities for checkboxes
    const commonAmenities = ["WIFI", "POOL", "GYM", "SPA", "PARKING", "RESTAURANT"];

    const handleParamChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const toggleAmenity = (amenity) => {
        setSearchParams(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSearch = async () => {
        // Build clean query object (remove empty strings)
        const queryParams = {};
        if (searchParams.city.trim()) queryParams.city = searchParams.city.trim();
        if (searchParams.state.trim()) queryParams.state = searchParams.state.trim();
        if (searchParams.country.trim()) queryParams.country = searchParams.country.trim();

        queryParams.minStars = searchParams.minStars;
        queryParams.maxStars = searchParams.maxStars;

        if (searchParams.amenities.length > 0) {
            queryParams.amenities = searchParams.amenities;
        }

        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.error("Please log in to search hotels");
            return;
        }

        try {
            setLoading(true);
            const res = await searchHotels(token, queryParams);
            // new API wrapper is Map.of("hotels", hotels, "count", X)
            const resolvedHotels = res.data?.hotels || res.data || [];
            setHotels(resolvedHotels);
            setSearched(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch hotels");
        } finally {
            setLoading(false);
        }
    };

    const getStars = (count) => {
        return Array.from({ length: count || 3 }, (_, i) => "⭐").join("");
    };

    return (
        <div className="hotel-wrapper" style={{ maxWidth: "1200px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", marginBottom: "16px" }}>
                    Find Your Perfect Stay
                </h1>
                <p style={{ fontSize: "1.1rem", color: "#6b7280", maxWidth: "600px", margin: "0 auto" }}>
                    Discover amazing hotels, compare prices, and book the perfect room for your next adventure.
                </p>
            </div>

            {/* ADVANCED SEARCH PANEL */}
            <div className="hotel-card" style={{ padding: "24px", marginBottom: "30px", background: "#f8fafc" }}>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
                    <div className="hotel-field" style={{ flex: 1, minWidth: "200px" }}>
                        <label>City</label>
                        <input name="city" placeholder="e.g. Mumbai" value={searchParams.city} onChange={handleParamChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                    </div>
                    <div className="hotel-field" style={{ flex: 1, minWidth: "200px" }}>
                        <label>State</label>
                        <input name="state" placeholder="e.g. Maharashtra" value={searchParams.state} onChange={handleParamChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                    </div>
                    <div className="hotel-field" style={{ flex: 1, minWidth: "200px" }}>
                        <label>Country</label>
                        <input name="country" placeholder="e.g. India" value={searchParams.country} onChange={handleParamChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="hotel-field" style={{ width: "120px" }}>
                        <label>Min Stars</label>
                        <select name="minStars" value={searchParams.minStars} onChange={handleParamChange}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                        </select>
                    </div>
                    <div className="hotel-field" style={{ width: "120px" }}>
                        <label>Max Stars</label>
                        <select name="maxStars" value={searchParams.maxStars} onChange={handleParamChange}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                        </select>
                    </div>

                    <div className="hotel-field" style={{ flex: 1, minWidth: "300px" }}>
                        <label>Amenities</label>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "10px 0" }}>
                            {commonAmenities.map(am => (
                                <label key={am} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", cursor: "pointer", background: searchParams.amenities.includes(am) ? "#e0e7ff" : "white", padding: "5px 10px", borderRadius: "15px", border: "1px solid #d1d5db" }}>
                                    <input type="checkbox" style={{ display: "none" }} checked={searchParams.amenities.includes(am)} onChange={() => toggleAmenity(am)} />
                                    {searchParams.amenities.includes(am) && "✅"} {am}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="hotel-btn" style={{ width: "180px", alignSelf: "center", marginTop: "10px" }} onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching..." : "Search Hotels"}
                    </button>
                </div>
            </div>

            {/* RESULTS RENDERING */}
            {searched && hotels.length === 0 && !loading && (
                <div style={{ textAlign: "center", marginTop: "40px", color: "#6b7280" }}>
                    <h3 style={{ fontSize: "1.5rem", color: "#374151" }}>No hotels matched your filters.</h3>
                    <p>Try broadening your search or deselecting a few amenities.</p>
                </div>
            )}

            {hotels.length > 0 && (
                <div className="hotel-grid">
                    {hotels.map((hotel) => (
                        <div key={hotel.id || hotel.hotelId} className="hotel-item">
                            <div style={{ marginBottom: "12px" }}>
                                <span className="stars-badge">{hotel.stars} {getStars(hotel.stars)}</span>
                            </div>
                            <h3>{hotel.name}</h3>
                            <p style={{ color: "#4f46e5", fontWeight: "600", fontSize: "0.85rem" }}>
                                📍 {hotel.city}, {hotel.state} {hotel.country}
                            </p>

                            {hotel.amenities && hotel.amenities.length > 0 && (
                                <p style={{ marginTop: "8px", fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>
                                    {hotel.amenities.join(" • ")}
                                </p>
                            )}

                            <p style={{ marginTop: "12px", fontSize: "0.95rem" }}>
                                {hotel.address || hotel.description || "Premium accommodation"}
                            </p>

                            <Link to={`/hotel/book?id=${hotel.id || hotel.hotelId}`}>
                                <button className="hotel-btn" style={{ marginTop: "20px", background: "#10b981", padding: "10px" }}>
                                    View Rooms
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchHotels;
