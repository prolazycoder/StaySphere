import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Hotels.css";
import api from "../api/axiosConfig";
import BookingModal from "../components/BookingModal";

export default function Hotels() {
  const routerState = useLocation().state || {};

  const initialCity = routerState.location || localStorage.getItem("search_location") || "";

  const [filters, setFilters] = useState({
    city: initialCity,
    state: "",
    country: "India",
    minStars: "",
    maxStars: "",
    amenities: [],
  });

  const [page, setPage] = useState(0);
  const size = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [hotels, setHotels] = useState([]);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const amenitiesList = ["WiFi", "Parking", "Pool", "Gym", "Spa", "Bar", "AC", "Restaurant"];

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.city.trim()) params.set("city", filters.city.trim());
    if (filters.state.trim()) params.set("state", filters.state.trim());
    if (filters.country.trim()) params.set("country", filters.country.trim());

    if (filters.minStars !== "") params.set("minStars", filters.minStars);
    if (filters.maxStars !== "") params.set("maxStars", filters.maxStars);

    filters.amenities.forEach((a) => params.append("amenities", a));

    params.set("page", page);
    params.set("size", size);

    return params.toString();
  }, [filters, page]);

  const fetchHotels = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/api/v1/hotels/search?${queryString}`);
      setHotels(res.data?.hotels || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line
  }, [queryString]);

  const toggleAmenity = (amenity) => {
    setPage(0);
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((x) => x !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const openBookingModal = (hotel) => {
    setSelectedHotel(hotel);
    setBookingOpen(true);
  };

  return (
    <div className="hotels-page">
      <div className="hotels-header">
        <div>
          <h1 className="hotels-title">Search Hotels</h1>
          <p className="hotels-subtitle">Find verified stays and book instantly.</p>
        </div>

        <button className="hotels-btn dark" onClick={fetchHotels}>
          Refresh
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="hotels-filters">
        <div className="filters-grid">
          <div className="field">
            <label>City</label>
            <input
              placeholder="Goa"
              value={filters.city}
              onChange={(e) => {
                setPage(0);
                setFilters((p) => ({ ...p, city: e.target.value }));
              }}
            />
          </div>

          <div className="field">
            <label>State</label>
            <input
              placeholder="Maharashtra"
              value={filters.state}
              onChange={(e) => {
                setPage(0);
                setFilters((p) => ({ ...p, state: e.target.value }));
              }}
            />
          </div>

          <div className="field">
            <label>Country</label>
            <input
              placeholder="India"
              value={filters.country}
              onChange={(e) => {
                setPage(0);
                setFilters((p) => ({ ...p, country: e.target.value }));
              }}
            />
          </div>

          <div className="field">
            <label>Min Stars</label>
            <input
              type="number"
              min="0"
              max="5"
              placeholder="1"
              value={filters.minStars}
              onChange={(e) => {
                setPage(0);
                setFilters((p) => ({ ...p, minStars: e.target.value }));
              }}
            />
          </div>

          <div className="field">
            <label>Max Stars</label>
            <input
              type="number"
              min="0"
              max="5"
              placeholder="5"
              value={filters.maxStars}
              onChange={(e) => {
                setPage(0);
                setFilters((p) => ({ ...p, maxStars: e.target.value }));
              }}
            />
          </div>

          <div className="field actions">
            <button
              className="hotels-btn light"
              onClick={() => {
                setPage(0);
                setFilters({
                  city: "",
                  state: "",
                  country: "India",
                  minStars: "",
                  maxStars: "",
                  amenities: [],
                });
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="amenities">
          <p className="amenities-title">Amenities</p>
          <div className="amenities-wrap">
            {amenitiesList.map((a) => (
              <button
                key={a}
                className={`chip ${filters.amenities.includes(a) ? "active" : ""}`}
                onClick={() => toggleAmenity(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="hotels-results-head">
        <p className="results-meta">
          Page <b>{page}</b> • Showing <b>{hotels.length}</b> hotels
        </p>
      </div>

      {loading && <div className="state-box">Loading hotels...</div>}
      {error && <div className="state-box error">{error}</div>}

      {!loading && !error && hotels.length === 0 && (
        <div className="state-box empty">No hotels found for your search.</div>
      )}

      <div className="hotels-grid">
        {hotels.map((h) => (
          <div className="hotel-card" key={h.id}>
            <div className="hotel-head">
              <h3 className="hotel-name">{h.name}</h3>
              <span className="hotel-stars">{renderStars(h.stars)}</span>
            </div>

            <p className="hotel-address">
              {h.address}, {h.city}, {h.state}, {h.country}
            </p>

            <p className="hotel-desc">{h.description || "No description"}</p>

            <div className="hotel-amenities">
              {(h.amenities || []).slice(0, 4).map((a) => (
                <span key={a} className="badge">
                  {a}
                </span>
              ))}
              {(h.amenities || []).length > 4 && (
                <span className="badge more">+{h.amenities.length - 4}</span>
              )}
            </div>

            <div className="hotel-footer">
              <div className="hotel-contact">
                <div>📞 {h.phone || "N/A"}</div>
                <div>✉️ {h.email || "N/A"}</div>
              </div>

              <button className="hotels-btn dark" onClick={() => openBookingModal(h)}>
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          className="hotels-btn light"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          ← Prev
        </button>

        <button className="hotels-btn dark" onClick={() => setPage((p) => p + 1)}>
          Next →
        </button>
      </div>

      {/* BOOKING MODAL */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        hotel={selectedHotel}
      />
    </div>
  );
}

function renderStars(stars = 0) {
  const n = Math.max(0, Math.min(5, Number(stars)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}
