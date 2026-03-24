import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "./Cabs.css";
import { connectCabSocket, disconnectCabSocket } from "../socket/cabSocket";
import { riderSearchDrivers, riderCancelRide } from "../api/cabApi";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

//  Fix leaflet marker icons (important in React)
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

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([Number(lat), Number(lng)], 14);
    }
  }, [lat, lng, map]);
  return null;
}

const Cabs = () => {
  const routerState = useLocation().state || {};
  const initialLocation = routerState.location || localStorage.getItem("search_location") || "";

  const riderId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    pickupLocation: initialLocation,
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
  const [completedRideData, setCompletedRideData] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchingMap, setSearchingMap] = useState(false);
  const [activeField, setActiveField] = useState("drop");

  const searchMapLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];

        if (activeField === "pickup") {
          setForm(p => ({
            ...p,
            pickupLat: parseFloat(first.lat).toFixed(6),
            pickupLng: parseFloat(first.lon).toFixed(6),
            pickupLocation: first.display_name.split(",")[0]
          }));
        } else {
          setForm(p => ({
            ...p,
            dropLat: parseFloat(first.lat).toFixed(6),
            dropLng: parseFloat(first.lon).toFixed(6),
            dropLocation: first.display_name.split(",")[0]
          }));
        }

        toast.success(`Location found on map for ${activeField}!`);
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch (e) {
      toast.error("Failed to search location");
    } finally {
      setSearchingMap(false);
    }
  };

  //  Get Current GPS for pickup
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const fixedLat = lat.toFixed(6);
        const fixedLng = lng.toFixed(6);

        // Optimistic update
        setForm((p) => ({
          ...p,
          pickupLat: fixedLat,
          pickupLng: fixedLng,
          pickupLocation: p.pickupLocation || "Current Location",
        }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${fixedLat}&lon=${fixedLng}`);
          const data = await res.json();
          const locName = data?.display_name ? data.display_name.split(",")[0] : "Current Location";

          setForm((p) => ({ ...p, pickupLocation: locName }));
          toast.success("Pickup location updated from GPS!");
        } catch (e) {
          toast.error("Got coordinates, but failed to fetch address name");
        }
      },
      (err) => {
        console.log(err);
        toast.error("Location permission denied / GPS error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  //  auto load pickup lat/lng on page open
  useEffect(() => {
    useMyLocation();
    // eslint-disable-next-line
  }, []);

  //  rider socket listener
  useEffect(() => {
    if (!riderId) return;

    let riderSub = null;

    connectCabSocket({
      onConnect: (stomp) => {
        riderSub = stomp.subscribe(`/topic/rider/${riderId}`, (msg) => {
          const data = JSON.parse(msg.body);

          if (data.event === "DRIVER_ASSIGNED") {
            console.log("🚕 [CABS] Received DRIVER_ASSIGNED payload:", data);
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
          if (data.event === "RIDE_COMPLETED") {
            console.log("✅ [CABS] Received RIDE_COMPLETED payload:", data);
            setStatus("COMPLETED");
            setCompletedRideData({
              finalFare: data.finalFare || data.fare || data.estimatedFare, // Fallbacks in case backend names it differently
              distanceKm: data.distanceKm || data.actualDistanceKm,
              timeMinutes: data.timeMinutes || data.actualMinutes
            });
          }
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
    if (!riderId) return toast.error("Please login first (userId missing)");

    if (!form.pickupLocation || !form.dropLocation) {
      return toast.error("Pickup & Drop required");
    }

    if (!form.pickupLat || !form.pickupLng) {
      return toast.error("Pickup lat/lng missing. Click 'Use My Location'");
    }

    if (!form.dropLat || !form.dropLng) {
      return toast.error("Drop lat/lng missing. Please select on map");
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

      toast.success("Searching Drivers...");
    } catch (err) {
      console.error(err);
      setStatus("IDLE");
      toast.error(err?.response?.data?.message || "Search driver failed");
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
      toast.success("Ride cancelled");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  const pickupCenter = [
    Number(form.pickupLat || 22.7196),
    Number(form.pickupLng || 75.8577),
  ];

  return (
    <div className="cabPage">
      <h2 className="cabTitle">Reserve Your Ride</h2>

      {/* STATUS */}
      {status !== "IDLE" && (
        <div className="cabStatus">
          <span>Booking Status:</span>
          <span className={`badge ${status.toLowerCase()}`}>{status}</span>
        </div>
      )}

      <div className="cabLayout">
        {/* FORM LEFT COLUMN */}
        <div>
          <div className="cabCard">
            <h3>📍 Route Details</h3>
            <div className="cabGrid">
              <div className="cabField" style={{ gridColumn: "1 / -1" }}>
                <label>Pickup Location</label>
                <div className="pickupRow">
                  <input
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleChange}
                    onFocus={() => setActiveField("pickup")}
                    placeholder="e.g. Pune Station or current location..."
                    style={{ border: activeField === "pickup" ? "2px solid #4f46e5" : "1px solid #e5e7eb" }}
                  />
                  <button
                    type="button"
                    className="btnGps"
                    onClick={useMyLocation}
                    disabled={loading}
                    title="Get Current Location"
                  >
                    Current Location
                  </button>
                </div>
              </div>

              <div className="cabField" style={{ gridColumn: "1 / -1" }}>
                <label>Drop Location</label>
                <input
                  name="dropLocation"
                  value={form.dropLocation}
                  onChange={handleChange}
                  onFocus={() => setActiveField("drop")}
                  placeholder="e.g. Hinjewadi Phase 3 (Select on Map)"
                  style={{ border: activeField === "drop" ? "2px solid #4f46e5" : "1px solid #e5e7eb" }}
                />
              </div>

              <div className="cabField">
                <label>Pickup Lat</label>
                <input
                  name="pickupLat"
                  value={form.pickupLat}
                  onChange={handleChange}
                  placeholder="18.5204"
                  readOnly
                  style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                />
              </div>

              <div className="cabField">
                <label>Pickup Lng</label>
                <input
                  name="pickupLng"
                  value={form.pickupLng}
                  onChange={handleChange}
                  placeholder="73.8567"
                  readOnly
                  style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                />
              </div>

              <div className="cabField">
                <label>Drop Lat</label>
                <input
                  name="dropLat"
                  value={form.dropLat}
                  onChange={handleChange}
                  placeholder="Waiting for pin..."
                  readOnly
                  style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                />
              </div>

              <div className="cabField">
                <label>Drop Lng</label>
                <input
                  name="dropLng"
                  value={form.dropLng}
                  onChange={handleChange}
                  placeholder="Waiting for pin..."
                  readOnly
                  style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                />
              </div>
            </div>

            <div className="cabActions">
              <button className="btnPrimary" onClick={bookRide} disabled={loading}>
                {loading ? "Searching..." : "Request Ride"}
              </button>

              {ride?.id && status === "SEARCHING" && (
                <button className="btnDanger" onClick={cancelRide} disabled={loading}>
                  Cancel Request
                </button>
              )}
            </div>
          </div>

          {assignedDriver && (
            <div className="driverInfoCard">
              <h3>🚘 Driver Assigned!</h3>

              <div className="driverDetail">
                <span>Driver Name</span>
                <span>{assignedDriver.driverName}</span>
              </div>

              <div className="driverDetail">
                <span>Vehicle</span>
                <span>{assignedDriver.vehicleModel} ({assignedDriver.vehicleNumber})</span>
              </div>

              <div className="driverDetail" style={{
                background: "#f0fdf4",
                padding: "16px",
                borderRadius: "12px",
                marginTop: "16px",
                border: "2px dashed #16a34a"
              }}>
                <span style={{ fontWeight: "800", color: "#166534", fontSize: "1.2rem" }}>💰 Estimated Fare</span>
                <span style={{ fontWeight: "900", color: "#15803d", fontSize: "1.4rem" }}>
                  ₹{assignedDriver.estimatedFare || "0.00"}
                </span>
              </div>

              <div className="driverDetail" style={{ marginTop: "20px", alignItems: "center" }}>
                <span>Share OTP to Start</span>
                <span className="otpHighlight">{assignedDriver.otp}</span>
              </div>
            </div>
          )}

          {status === "STARTED" && (
            <div className="driverInfoCard" style={{ borderTop: "4px solid #3b82f6" }}>
              <h3>🚖 Ride in Progress!</h3>
              <p style={{ color: "#4b5563" }}>Your ride has started. Enjoy the journey safely!</p>
            </div>
          )}

          {status === "COMPLETED" && completedRideData && (
            <div className="driverInfoCard" style={{ borderTop: "4px solid #10b981", background: "#f0fdf4" }}>
              <h3 style={{ color: "#166534" }}>✅ Ride Completed</h3>

              <div className="driverDetail">
                <span>Distance Traveled</span>
                <span>{completedRideData.distanceKm} km</span>
              </div>
              <div className="driverDetail">
                <span>Time Taken</span>
                <span>{completedRideData.timeMinutes} mins</span>
              </div>

              <div className="driverDetail" style={{
                background: "#d1fae5",
                padding: "16px",
                borderRadius: "12px",
                marginTop: "16px",
                border: "2px dashed #059669"
              }}>
                <span style={{ fontWeight: "800", color: "#065f46", fontSize: "1.2rem" }}>💳 Final Total Fare</span>
                <span style={{ fontWeight: "900", color: "#047857", fontSize: "1.6rem" }}>
                  ₹{completedRideData.finalFare || "0.00"}
                </span>
              </div>

              <button
                className="btnPrimary"
                onClick={() => window.location.reload()}
                style={{ width: "100%", marginTop: "20px" }}
              >
                Book Another Ride
              </button>
            </div>
          )}
        </div>

        {/* MAP RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="cabCard" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
            <h3 style={{ marginBottom: "16px", marginTop: 0 }}>
              🗺️ Select Location on Map
            </h3>
            <div style={{ marginBottom: "16px", fontSize: "0.95rem", color: "#4f46e5", fontWeight: "600" }}>
              Currently Selecting: {activeField === "pickup" ? "Pickup Location" : "Drop-off Location"}
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Search map for destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchMapLocation()}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "0.95rem" }}
              />
              <button
                onClick={searchMapLocation}
                disabled={searchingMap}
                style={{ padding: "10px 20px", background: "#4f46e5", color: "white", borderRadius: "10px", border: "none", fontWeight: "600", cursor: "pointer" }}
              >
                {searchingMap ? "..." : "Search"}
              </button>
            </div>

            <div style={{ flex: 1, minHeight: "400px", position: "relative" }}>
              <MapContainer
                center={pickupCenter}
                zoom={13}
                className="cabMap"
                style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                />

                <DropPicker
                  onSelect={async (lat, lng) => {
                    const fixedLat = lat.toFixed(6);
                    const fixedLng = lng.toFixed(6);

                    // Optimistic update of lat/lng
                    if (activeField === "pickup") {
                      setForm((p) => ({ ...p, pickupLat: fixedLat, pickupLng: fixedLng }));
                    } else {
                      setForm((p) => ({ ...p, dropLat: fixedLat, dropLng: fixedLng }));
                    }

                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${fixedLat}&lon=${fixedLng}`);
                      const data = await res.json();
                      const locName = data?.display_name ? data.display_name.split(",")[0] : "Selected Map Pin";

                      if (activeField === "pickup") {
                        setForm((p) => ({ ...p, pickupLocation: locName }));
                      } else {
                        setForm((p) => ({ ...p, dropLocation: locName }));
                      }
                      toast.success(`Set ${activeField} location!`);
                    } catch (e) {
                      toast.error("Could not fetch location name");
                      // fallback
                      if (activeField === "pickup") setForm((p) => ({ ...p, pickupLocation: "Selected Pickup Pin" }));
                      else setForm((p) => ({ ...p, dropLocation: "Selected Destination Pin" }));
                    }
                  }}
                />

                <MapRecenter
                  lat={activeField === "pickup" ? (form.pickupLat || form.dropLat) : (form.dropLat || form.pickupLat)}
                  lng={activeField === "pickup" ? (form.pickupLng || form.dropLng) : (form.dropLng || form.pickupLng)}
                />

                {/* Pickup marker */}
                {form.pickupLat && form.pickupLng && (
                  <Marker position={[Number(form.pickupLat), Number(form.pickupLng)]} />
                )}

                {/* Drop marker */}
                {form.dropLat && form.dropLng && (
                  <Marker position={[Number(form.dropLat), Number(form.dropLng)]} />
                )}
              </MapContainer>
            </div>
            <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "#6b7280", textAlign: "center", marginBottom: 0 }}>
              Click inside the Pickup or Drop fields to switch which location the map updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cabs;
