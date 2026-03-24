import React, { useEffect, useRef, useState, useMemo } from "react";
import toast from "react-hot-toast";
import "./DriverDashboard.css";
import {
    driverGoOnline, driverGoOffline, driverUpdateLocation,
    driverAcceptRide, driverRejectRide,
    driverVerifyOtp, driverStartRide, driverCompleteRide
} from "../../api/cabApi";
import { connectCabSocket, disconnectCabSocket } from "../../socket/cabSocket";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import RoutingMachine from "./RoutingMachine";

// Fix Leaflet marker icons natively
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper component to smoothly pan map 
function MapRecenter({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([Number(lat), Number(lng)], 14);
        }
    }, [lat, lng, map]);
    return null;
}

export default function DriverDashboard() {
    const userId = localStorage.getItem("userId");

    // Panel State
    const [isOnline, setIsOnline] = useState(false);
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [locationName, setLocationName] = useState("");
    const [appLoading, setAppLoading] = useState(false);

    // Active Ride State (if a ride is accepted, hide requests, show OTP/Complete UI)
    const [activeRideId, setActiveRideId] = useState(localStorage.getItem("activeRideId") || null);

    // Storing active ride data locally if needed for routing
    const [activeRideData, setActiveRideData] = useState(null);

    // Storing the actual Dijkstra driven distance from the map
    const [routedData, setRoutedData] = useState(null);

    // Requests State
    const [connected, setConnected] = useState(false);
    const [requests, setRequests] = useState([]);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // OTP / Complete State
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);

    const gpsIntervalRef = useRef(null);
    const topic = useMemo(() => userId ? `/topic/driver/${userId}` : null, [userId]);

    // ============================
    // GPS Tracking Logic
    // ============================
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoords({ lat, lng });

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setLocationName(data.display_name);
                    }
                } catch (e) {
                    console.log("Failed to reverse geocode", e);
                }
            },
            (err) => console.log("Geo Error:", err)
        );
    }, []);

    const startAutoGps = () => {
        if (gpsIntervalRef.current) return;
        gpsIntervalRef.current = setInterval(async () => {
            try {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setCoords({ lat, lng });

                    // Only send updates if we are online and don't have an active ride holding us up
                    // (Usually drivers still broadcast location during ride, so we let it happen)
                    if (isOnline) {
                        await driverUpdateLocation({ lat, lng });
                    }
                });
            } catch (e) {
                console.log("gps update failed");
            }
        }, 5000);
    };

    const stopAutoGps = () => {
        if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
    };

    const handleGoOnline = async () => {
        if (!coords.lat) return toast.error("Wait for GPS...");
        try {
            setAppLoading(true);
            await driverGoOnline({ lat: coords.lat, lng: coords.lng });
            setIsOnline(true);
            startAutoGps();
            toast.success("You are now ONLINE 🟢");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to go online");
        } finally {
            setAppLoading(false);
        }
    };

    const handleGoOffline = async () => {
        try {
            setAppLoading(true);
            await driverGoOffline();
            setIsOnline(false);
            stopAutoGps();
            toast.success("You are now OFFLINE 🔴");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to go offline");
        } finally {
            setAppLoading(false);
        }
    };

    // ============================
    // Socket Logic
    // ============================
    useEffect(() => {
        if (!userId || !isOnline || activeRideId) return; // Only listen if online and not busy

        let sub = null;
        connectCabSocket({
            onConnect: (stomp) => {
                setConnected(true);
                sub = stomp.subscribe(topic, (msg) => {
                    const data = JSON.parse(msg.body);
                    if (data?.event === "NEW_RIDE_REQUEST") {
                        setRequests((prev) => {
                            if (prev.some((x) => x.rideId === data.rideId)) return prev;
                            return [{ ...data }, ...prev];
                        });
                        toast("New Ride Request!", { icon: "🚖" });
                    }
                });
            },
        });

        return () => {
            try { if (sub) sub.unsubscribe(); } catch { }
            disconnectCabSocket();
            setConnected(false);
        };
    }, [userId, topic, isOnline, activeRideId]);


    // ============================
    // Request Actions
    // ============================
    const acceptRide = async (rideId, rideData) => {
        try {
            setActionLoadingId(rideId);
            await driverAcceptRide(rideId);
            localStorage.setItem("activeRideId", rideId);
            setActiveRideId(rideId);
            setActiveRideData(rideData); // Save current ride details for map routing
            toast.success("Ride Accepted! Proceed to pickup.");
            setRequests([]); // Clear requests
        } catch (err) {
            toast.error(err?.response?.data?.message || "Accept failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    const rejectRide = async (rideId) => {
        try {
            setActionLoadingId(rideId);
            await driverRejectRide({ driverId: userId, rideId });
            toast.success("Ride Rejected");
            setRequests((p) => p.filter((x) => x.rideId !== rideId));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Reject failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    // ============================
    // Active Ride Actions
    // ============================
    const handleVerifyOtp = async () => {
        if (!otp) return toast.error("Enter OTP");
        try {
            setAppLoading(true);
            await driverVerifyOtp({ rideId: activeRideId, otp });
            setOtpVerified(true);
            toast.success("OTP Verified! Start the ride.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "OTP invalid");
        } finally {
            setAppLoading(false);
        }
    };

    const handleStartRide = async () => {
        try {
            setAppLoading(true);
            await driverStartRide(activeRideId);
            toast.success("Ride Started!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to start ride");
        } finally {
            setAppLoading(false);
        }
    };

    // --- Helper for calculating physical distance ---
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return parseFloat(d.toFixed(2));
    };

    const handleCompleteRide = async () => {
        try {
            setAppLoading(true);

            // Fetch final distance using Dijkstra algorithm from Leaflet Map Route
            // (If map routing is missing somehow, fallback to 5km default for safety)
            let finalDistanceKm = 5.0;
            let finalDurationMin = 15;

            if (routedData && routedData.totalDistanceKm) {
                finalDistanceKm = Number(routedData.totalDistanceKm);
                finalDurationMin = Number(routedData.totalTimeMinutes);
            } else if (activeRideData && activeRideData.pickupLat && activeRideData.dropLat) {
                // Absolute worst case fallback to straight-line if routedData failed to load
                finalDistanceKm = calculateDistance(
                    activeRideData.pickupLat, activeRideData.pickupLng,
                    activeRideData.dropLat, activeRideData.dropLng
                );
                finalDurationMin = Math.ceil(finalDistanceKm * 3);
            }

            await driverCompleteRide({
                rideId: activeRideId,
                actualDistanceKm: finalDistanceKm,
                actualMinutes: finalDurationMin,
            });
            toast.success(`Ride Completed! Distance: ${finalDistanceKm}km, Time: ${finalDurationMin} mins`);

            // Cleanup
            localStorage.removeItem("activeRideId");
            setActiveRideId(null);
            setActiveRideData(null);
            setRoutedData(null);
            setOtpVerified(false);
            setOtp("");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to complete ride");
        } finally {
            setAppLoading(false);
        }
    };

    return (
        <div className="driver-dash-wrapper">
            <div className="driver-dash-header">
                <h1 className="driver-dash-title">Driver Dashboard</h1>
            </div>

            <div className="driver-dash-container">
                <div className="driver-dash-grid">

                    {/* TOP STATUS CARD */}
                    <div className="dash-card status-card">
                        <div className="status-row">
                            <div>
                                <h3 style={{ fontSize: "1.4rem", marginBottom: "4px" }}>Driver Status</h3>
                                <p className="coords-text" style={{ fontSize: "1rem", color: "#4b5563", marginTop: "8px", maxWidth: "600px", lineHeight: "1.5" }}>
                                    📍 <b>Current Location:</b> {locationName ? locationName : coords.lat ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Detecting GPS location..."}
                                </p>
                            </div>
                            <span className={`status-badge ${isOnline ? "online" : "offline"}`}>
                                {isOnline ? "ONLINE 🟢" : "OFFLINE 🔴"}
                            </span>
                        </div>

                        <div className="btn-group">
                            <button className="btn-primary" onClick={handleGoOnline} disabled={appLoading || isOnline || activeRideId}>
                                Go Online
                            </button>
                            <button className="btn-danger" onClick={handleGoOffline} disabled={appLoading || !isOnline || activeRideId}>
                                Go Offline
                            </button>
                        </div>
                        <p className="hint-text">You must be ONLINE to receive ride requests. Socket: {connected ? "Connected" : "Idle"}</p>
                    </div>

                    {/* REQUESTS CARD */}
                    <div className="dash-card">
                        <h3>📩 Incoming Requests</h3>
                        {!isOnline ? (
                            <p style={{ color: "#6b7280", fontStyle: "italic" }}>🔴 You are offline. Go Online to receive ride requests.</p>
                        ) : activeRideId ? (
                            <p style={{ color: "#10b981", fontWeight: "600" }}>🚖 You are currently on an active ride. Complete it to receive new requests.</p>
                        ) : requests.length === 0 ? (
                            <p style={{ color: "#6b7280", fontStyle: "italic" }}>Waiting for passengers near your location...</p>
                        ) : (
                            <div className="req-list">
                                {requests.map(r => (
                                    <div key={r.rideId} className="req-item">
                                        <p className="req-id">ID: {r.rideId}</p>
                                        <div className="req-coords">
                                            <span><b>Pickup:</b> {r.pickupLat.toFixed(4)}, {r.pickupLng.toFixed(4)}</span>
                                            <span><b>Drop:</b> {r.dropLat.toFixed(4)}, {r.dropLng.toFixed(4)}</span>
                                        </div>
                                        <div className="btn-group">
                                            <button className="btn-action" disabled={actionLoadingId} onClick={() => acceptRide(r.rideId)}>Accept</button>
                                            <button className="btn-danger" disabled={actionLoadingId} onClick={() => rejectRide(r.rideId)}>Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ACTIVE RIDE CARD */}
                    <div className="dash-card" style={activeRideId ? { border: "2px solid #10b981" } : { opacity: 0.7 }}>
                        <h3>🚖 Active Ride</h3>
                        {!activeRideId ? (
                            <p style={{ color: "#6b7280", fontStyle: "italic" }}>No active ride currently. Accept a request to begin.</p>
                        ) : (
                            <>
                                <p className="req-id">Ride ID: {activeRideId}</p>

                                <div className="active-ride-form" style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #eee" }}>
                                    <label>1. Verify Passenger OTP</label>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <input
                                            type="text"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            disabled={otpVerified || appLoading}
                                        />
                                        <button className="btn-primary" onClick={handleVerifyOtp} disabled={otpVerified || appLoading}>
                                            {otpVerified ? "Verified ✅" : "Verify"}
                                        </button>
                                    </div>
                                    <button
                                        className="btn-action"
                                        onClick={handleStartRide}
                                        disabled={!otpVerified || appLoading}
                                        style={{ alignSelf: "flex-start", marginTop: "8px" }}
                                    >
                                        Start Ride Journey
                                    </button>
                                </div>

                                <div className="active-ride-form">
                                    <label>2. Finish Journey</label>
                                    <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "12px" }}>
                                        Upon reaching the destination, click the button below to end the ride.
                                        Fare, distance, and time will be automatically calculated.
                                    </p>
                                    <button
                                        className="btn-danger"
                                        onClick={handleCompleteRide}
                                        disabled={appLoading}
                                        style={{ alignSelf: "flex-start", marginTop: "8px" }}
                                    >
                                        End & Complete Ride
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                </div>

                {/* MAP COLUMN */}
                <div className="driver-dash-map-col">
                    <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", background: "#f9fafb" }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>📍 Live Navigation</h3>
                        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                            {activeRideId
                                ? otpVerified
                                    ? "Navigating to Drop-off..."
                                    : "Navigating to Passenger Pickup..."
                                : isOnline
                                    ? "Waiting for ride requests..."
                                    : "Map offline."}
                        </p>
                    </div>
                    <div className="driver-map-container">
                        <MapContainer
                            center={coords.lat ? [coords.lat, coords.lng] : [20.5937, 78.9629]}
                            zoom={14}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            />

                            {coords.lat && <MapRecenter lat={coords.lat} lng={coords.lng} />}

                            {/* Driver Current Location Marker */}
                            {coords.lat && (
                                <Marker position={[coords.lat, coords.lng]}>
                                    <Popup>Your Current Location</Popup>
                                </Marker>
                            )}

                            {/* Pickup Marker if active ride */}
                            {activeRideData?.pickupLat && !otpVerified && (
                                <Marker position={[activeRideData.pickupLat, activeRideData.pickupLng]}>
                                    <Popup>Passenger Pickup</Popup>
                                </Marker>
                            )}

                            {/* Dropoff Marker if active ride */}
                            {activeRideData?.dropLat && (
                                <Marker position={[activeRideData.dropLat, activeRideData.dropLng]}>
                                    <Popup>Ride Drop-off</Popup>
                                </Marker>
                            )}

                            {/* Routing Machine */}
                            {/* If riding to passenger (OTP not verified), build route from Driver to Pickup */}
                            {activeRideData?.pickupLat && coords.lat && !otpVerified && (
                                <RoutingMachine
                                    start={{ lat: coords.lat, lng: coords.lng }}
                                    end={{ lat: activeRideData.pickupLat, lng: activeRideData.pickupLng }}
                                    onRouteFound={setRoutedData}
                                />
                            )}

                            {/* If OTP verified, build route from Driver to Dropoff */}
                            {activeRideData?.dropLat && coords.lat && otpVerified && (
                                <RoutingMachine
                                    start={{ lat: coords.lat, lng: coords.lng }}
                                    end={{ lat: activeRideData.dropLat, lng: activeRideData.dropLng }}
                                    onRouteFound={setRoutedData}
                                />
                            )}

                        </MapContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
