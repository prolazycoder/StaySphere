import React, { useMemo, useState } from "react";
import "./BookingModal.css";
import api from "../api/axiosConfig"; // ✅ your axios config

export default function BookingModal({ open, onClose, hotel }) {
  const [roomType, setRoomType] = useState("DELUXE");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const isValid = useMemo(() => {
    if (!hotel?.id) return false;
    if (!checkIn || !checkOut) return false;
    if (new Date(checkOut) <= new Date(checkIn)) return false;
    if (rooms < 1) return false;
    return true;
  }, [hotel?.id, checkIn, checkOut, rooms]);

  if (!open) return null;

  const handleBook = async () => {
    setErr("");
    setSuccess("");

    if (!isValid) {
      setErr("Please fill valid check-in/check-out and rooms.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        hotelId: hotel.id,
        roomType,
        checkIn,
        checkOut,
        rooms: Number(rooms),
      };

      const res = await api.post("/api/bookings/book", payload);

      setSuccess(
        `Booking Successful ✅ BookingId: ${res.data.bookingId} | Amount: ${res.data.amount}`
      );
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Booking failed, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-backdrop" onClick={onClose}>
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bm-header">
          <div>
            <h2 className="bm-title">Confirm Booking</h2>
            <p className="bm-subtitle">{hotel?.name}</p>
          </div>

          <button className="bm-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bm-grid">
          <div className="bm-field">
            <label>Room Type</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="DOUBLE">DOUBLE</option>
              <option value="FAMILY">FAMILY</option>
              <option value="KING">KING</option>
              <option value="SUITE">SUITE</option>
              <option value="QUEEN">QUEEN</option>
              <option value="DELUXE">DELUXE</option>
              <option value="SINGLE">SINGLE</option>
            </select>
          </div>

          <div className="bm-field">
            <label>Rooms</label>
            <input
              type="number"
              min={1}
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
          </div>

          <div className="bm-field">
            <label>Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="bm-field">
            <label>Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        {err && <div className="bm-alert bm-error">{err}</div>}
        {success && <div className="bm-alert bm-success">{success}</div>}

        <div className="bm-footer">
          <button className="bm-btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button className="bm-btn primary" onClick={handleBook} disabled={loading}>
            {loading ? "Booking..." : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
