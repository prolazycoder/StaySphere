import React, { useState } from "react";
import toast from "react-hot-toast";
import { addRoom } from "../../api/hotelApi";
import "./Hotel.css";

function AddRoom() {
    const token = localStorage.getItem("accessToken");

    const [hotelId, setHotelId] = useState("");
    const [room, setRoom] = useState({
        roomType: "DELUXE",
        basePrice: 2000,
        capacity: 2,
        totalRooms: 10
    });
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!hotelId) return toast.error("Hotel ID is required");

        try {
            setLoading(true);
            await addRoom(token, hotelId, room);
            toast.success("Room Type Added Successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to add room");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hotel-wrapper">
            <h2 className="hotel-title">Add Room Type</h2>

            <div className="hotel-card">
                <div className="hotel-field">
                    <label>Hotel ID</label>
                    <input
                        placeholder="Enter the ID you received upon registration"
                        value={hotelId}
                        onChange={(e) => setHotelId(e.target.value)}
                    />
                </div>

                <div className="hotel-field">
                    <label>Room Type</label>
                    <select
                        value={room.roomType}
                        onChange={(e) => setRoom({ ...room, roomType: e.target.value })}
                    >
                        <option value="DOUBLE">Double</option>
                        <option value="FAMILY">Family</option>
                        <option value="KING">King</option>
                        <option value="SUITE">Suite</option>
                        <option value="QUEEN">Queen</option>
                        <option value="DELUXE">Deluxe</option>
                        <option value="SINGLE">Single</option>
                    </select>
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    <div className="hotel-field" style={{ flex: 1 }}>
                        <label>Base Price (₹)</label>
                        <input
                            type="number"
                            value={room.basePrice}
                            onChange={(e) => setRoom({ ...room, basePrice: e.target.value })}
                        />
                    </div>

                    <div className="hotel-field" style={{ flex: 1 }}>
                        <label>Capacity (Persons)</label>
                        <input
                            type="number"
                            value={room.capacity}
                            onChange={(e) => setRoom({ ...room, capacity: e.target.value })}
                        />
                    </div>
                </div>

                <div className="hotel-field">
                    <label>Total Rooms Available</label>
                    <input
                        type="number"
                        value={room.totalRooms}
                        onChange={(e) => setRoom({ ...room, totalRooms: e.target.value })}
                    />
                </div>

                <button className="hotel-btn" onClick={handleAdd} disabled={loading} style={{ marginTop: "10px" }}>
                    {loading ? "Adding..." : "Add Room"}
                </button>
            </div>
        </div>
    );
}

export default AddRoom;
