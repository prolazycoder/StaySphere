import React, { useEffect, useRef, useState } from "react";
import "./DriverPanel.css";
import { driverGoOnline, driverGoOffline, driverUpdateLocation } from "../api/cabApi";
import DriverRequests from "./DriverRequests";
import DriverRideOtp from "./DriverRideOtp";
import DriverCompleteRide from "./DriverCompleteRide";

const DriverPanel = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [loading, setLoading] = useState(false);

    const gpsIntervalRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

                    if (isOnline) {
                        await driverUpdateLocation({ lat, lng });
                    }
                });
            } catch (e) {
                console.log("gps update failed");
            }
        }, 3000);
    };

    const stopAutoGps = () => {
        if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
    };

    const goOnline = async () => {
        if (!coords.lat || !coords.lng) {
            alert("Location not detected");
            return;
        }

        try {
            setLoading(true);
            await driverGoOnline({ lat: coords.lat, lng: coords.lng });
            setIsOnline(true);
            startAutoGps();
            alert("✅ DRIVER ONLINE");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to go online");
        } finally {
            setLoading(false);
        }
    };

    const goOffline = async () => {
        try {
            setLoading(true);
            await driverGoOffline();
            setIsOnline(false);
            stopAutoGps();
            alert("✅ DRIVER OFFLINE");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to go offline");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="driverWrap">
            <h2 className="driverTitle">🚖 Driver Panel</h2>

            <div className="driverCard">
                <div className="driverRow">
                    <b>Status:</b>{" "}
                    <span className={isOnline ? "tag online" : "tag offline"}>
                        {isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                </div>

                <div className="driverRow">
                    <b>Lat:</b> {coords.lat ?? "Detecting..."}
                </div>
                <div className="driverRow">
                    <b>Lng:</b> {coords.lng ?? "Detecting..."}
                </div>

                <div className="driverBtns">
                    <button className="btnGreen" onClick={goOnline} disabled={loading || isOnline}>
                        Go Online
                    </button>
                    <button className="btnRed" onClick={goOffline} disabled={loading || !isOnline}>
                        Go Offline
                    </button>
                </div>

                <p className="hint">
                    ✅ When ONLINE, GPS auto update runs every 3 seconds.
                </p>
            </div>

            {/* RIDE COMPONENTS */}
            {isOnline && (
                <div style={{ marginTop: "20px" }}>
                    <DriverRequests />
                </div>
            )}

            <div style={{ marginTop: "20px" }}>
                <DriverRideOtp />
            </div>

            <div style={{ marginTop: "20px" }}>
                <DriverCompleteRide />
            </div>
        </div>
    );
};

export default DriverPanel;
