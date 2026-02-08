import React, { useEffect, useState } from "react";
import "./Cabs.css";
import "../dashboard.css"; // Use global dashboard styles
import "leaflet/dist/leaflet.css";
import { connectCabSocket, disconnectCabSocket } from "./socket/cabSocket";
import { riderSearchDrivers, riderCancelRide } from "./api/cabApi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authUtils";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

//  Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DropPicker({ onSelect }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onSelect(lat, lng);
        },
    });
    return null;
}

const Cabs = () => {
    const navigate = useNavigate();
    const riderId = localStorage.getItem("userId");
    const navLinks = ["Home", "Bookings", "Support"];

    const [form, setForm] = useState({
        pickupLocation: "",
        dropLocation: "",
        pickupLat: "",
        pickupLng: "",
        dropLat: "",
        dropLng: "",
    });

    const [ride, setRide] = useState(null);
    const [status, setStatus] = useState("IDLE");
    const [loading, setLoading] = useState(false);
    const [assignedDriver, setAssignedDriver] = useState(null);

    //  Get Current GPS for pickup
    const useMyLocation = React.useCallback((isManual = false) => {
        if (!navigator.geolocation) {
            if (isManual === true) alert("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                setForm((p) => ({
                    ...p,
                    pickupLat: lat.toFixed(6),
                    pickupLng: lng.toFixed(6),
                    pickupLocation: p.pickupLocation || "Current Location",
                }));

                if (isManual === true) alert("📍 Pickup updated from GPS");
            },
            (err) => {
                console.log(err);
                if (isManual === true) alert("Location permission denied / GPS error");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    //  auto load pickup lat/lng on page open
    useEffect(() => {
        useMyLocation(false);
    }, [useMyLocation]);

    //  rider socket listener
    useEffect(() => {
        if (!riderId) return;

        let riderSub = null;

        connectCabSocket({
            onConnect: (stomp) => {
                riderSub = stomp.subscribe(`/topic/rider/${riderId}`, (msg) => {
                    const data = JSON.parse(msg.body);

                    if (data.event === "DRIVER_ASSIGNED") {
                        setStatus("ASSIGNED");

                        setRide((prev) => ({
                            ...(prev || {}),
                            id: data.rideId,
                        }));

                        setAssignedDriver({
                            driverName: data.driverName,
                            vehicleModel: data.vehicleModel,
                            vehicleNumber: data.vehicleNumber,
                            otp: data.otp,
                            estimatedFare: data.estimatedFare,
                        });
                    }

                    if (data.event === "RIDE_STARTED") setStatus("STARTED");
                    if (data.event === "RIDE_COMPLETED") setStatus("COMPLETED");
                });
            },
        });

        return () => {
            try {
                if (riderSub) riderSub.unsubscribe();
            } catch { }
            disconnectCabSocket();
        };
    }, [riderId]);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const bookRide = async () => {
        if (!riderId) return alert("Please login first (userId missing)");

        if (!form.pickupLocation || !form.dropLocation) {
            return alert("Pickup & Drop required");
        }

        if (!form.pickupLat || !form.pickupLng) {
            return alert("Pickup lat/lng missing. Click 'Use My Location'");
        }

        if (!form.dropLat || !form.dropLng) {
            return alert("Drop lat/lng missing. Please select on map");
        }

        try {
            setLoading(true);
            setStatus("SEARCHING");
            setAssignedDriver(null);

            const payload = {
                pickupLocation: form.pickupLocation,
                dropLocation: form.dropLocation,
                pickupLat: Number(form.pickupLat || 0),
                pickupLng: Number(form.pickupLng || 0),
                dropLat: Number(form.dropLat || 0),
                dropLng: Number(form.dropLng || 0),
            };

            const rideRes = await riderSearchDrivers(payload);
            setRide(rideRes);

            alert("🔍 Searching Drivers...");
        } catch (err) {
            console.error(err);
            setStatus("IDLE");
            alert(err?.response?.data?.message || "Search driver failed");
        } finally {
            setLoading(false);
        }
    };

    const cancelRide = async () => {
        if (!ride?.id || !riderId) return;

        try {
            setLoading(true);
            await riderCancelRide({ rideId: ride.id, riderId });
            setStatus("CANCELLED");
            alert("🚫 Ride cancelled");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Cancel failed");
        } finally {
            setLoading(false);
        }
    };

    const pickupCenter = [
        Number(form.pickupLat || 22.7196),
        Number(form.pickupLng || 75.8577),
    ];

    const handleNavClick = (link) => {
        if (link === "Home") navigate("/");
        if (link === "Bookings") navigate("/bookings");
        if (link === "Support") navigate("/support");
    };

    return (
        <div className="app-root">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="main-area">
                {/* Top Bar */}
                <Topbar />

                <main className="content">
                    <div style={{ marginBottom: "16px" }}>
                        <button onClick={() => navigate("/")} className="back-btn">
                            ← Back to Dashboard
                        </button>
                    </div>

                    <h2 className="booking-title" style={{ marginBottom: "20px" }}>🚕 Book a Cab</h2>

                    <div className="cab-layout-grid">
                        {/* Booking Form Card */}
                        <div className="booking-card">
                            <div className="booking-card-header">
                                <h3 style={{ margin: 0 }}>Ride Details</h3>
                                <p className="booking-subtitle">Enter pickup and drop locations</p>
                            </div>

                            <div className="booking-form">
                                <div className="form-row" style={{ gridTemplateColumns: "1fr" }}>
                                    <div className="form-field">
                                        <label>Pickup Location</label>
                                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                            <span style={{ position: "absolute", left: "12px", fontSize: "16px" }}>📍</span>
                                            <input
                                                name="pickupLocation"
                                                value={form.pickupLocation}
                                                onChange={handleChange}
                                                placeholder="Enter pickup location"
                                                style={{ paddingLeft: "36px", flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => useMyLocation(true)}
                                                disabled={loading}
                                                style={{
                                                    position: "absolute",
                                                    right: "6px",
                                                    padding: "6px 10px",
                                                    background: "#ecfdf5",
                                                    color: "#059669",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                📍 GPS
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row" style={{ gridTemplateColumns: "1fr" }}>
                                    <div className="form-field">
                                        <label>Drop Location</label>
                                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                            <span style={{ position: "absolute", left: "12px", fontSize: "16px" }}>🏁</span>
                                            <input
                                                name="dropLocation"
                                                value={form.dropLocation}
                                                onChange={handleChange}
                                                placeholder="Enter drop location"
                                                style={{ paddingLeft: "36px", width: "100%" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Coordinates Section */}
                                <details style={{ marginTop: "10px", marginBottom: "10px" }}>
                                    <summary style={{ cursor: "pointer", fontSize: "12px", color: "var(--text-muted)" }}>
                                        Show Coordinates (Advanced)
                                    </summary>
                                    <div style={{ marginTop: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px" }}>
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Pickup Lat</label>
                                                <input name="pickupLat" value={form.pickupLat} onChange={handleChange} placeholder="18.5204" />
                                            </div>
                                            <div className="form-field">
                                                <label>Pickup Lng</label>
                                                <input name="pickupLng" value={form.pickupLng} onChange={handleChange} placeholder="73.8567" />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Drop Lat</label>
                                                <input name="dropLat" value={form.dropLat} onChange={handleChange} placeholder="Select on map" />
                                            </div>
                                            <div className="form-field">
                                                <label>Drop Lng</label>
                                                <input name="dropLng" value={form.dropLng} onChange={handleChange} placeholder="Select on map" />
                                            </div>
                                        </div>
                                    </div>
                                </details>

                                <div className="form-field" style={{ marginTop: '10px' }}>
                                    {ride?.id && status === "SEARCHING" ? (
                                        <button className="search-btn" style={{ background: '#ef4444', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }} onClick={cancelRide} disabled={loading}>
                                            Cancel Ride Search
                                        </button>
                                    ) : (
                                        <button className="search-btn" onClick={bookRide} disabled={loading}>
                                            {loading ? "Processing..." : "Search Nearby Drivers"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Status Section */}
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <b style={{ color: 'var(--text-muted)', fontSize: '13px' }}>RIDE STATUS</b>
                                    <span className={`cab-status-badge ${status}`}>{status}</span>
                                </div>

                                {ride?.id && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ride ID: <span style={{ fontFamily: 'monospace' }}>{ride.id}</span></p>}
                            </div>

                            {assignedDriver && (
                                <div className="destination-card" style={{ marginTop: '20px', padding: '15px', minWidth: 'auto', boxShadow: 'none', background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', background: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white' }}>
                                            🚖
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px', color: '#064e3b' }}>{assignedDriver.driverName}</h4>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                                                {assignedDriver.vehicleModel} • <b>{assignedDriver.vehicleNumber}</b>
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#047857', margin: 0 }}>OTP</p>
                                            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>{assignedDriver.otp}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '10px', color: '#047857', margin: 0 }}>FARE</p>
                                            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>₹{assignedDriver.estimatedFare}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Map Card */}
                        <div className="cab-map-card">
                            <MapContainer center={pickupCenter} zoom={13} className="cabMap">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />

                                <DropPicker
                                    onSelect={(lat, lng) => {
                                        setForm((p) => ({
                                            ...p,
                                            dropLat: lat.toFixed(6),
                                            dropLng: lng.toFixed(6),
                                            dropLocation: p.dropLocation || "Dropped Pin",
                                        }));
                                    }}
                                />

                                {form.pickupLat && form.pickupLng && (
                                    <Marker position={[Number(form.pickupLat), Number(form.pickupLng)]} />
                                )}

                                {form.dropLat && form.dropLng && (
                                    <Marker position={[Number(form.dropLat), Number(form.dropLng)]} />
                                )}
                            </MapContainer>
                            <div style={{ padding: '10px 15px', background: 'white', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                📍 Click on the map to set your <b>Drop Location</b>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Cabs;
