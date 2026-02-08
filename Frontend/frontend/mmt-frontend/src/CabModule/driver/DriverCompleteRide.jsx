import React, { useState } from "react";
import "./DriverCompleteRide.css";
import { driverCompleteRide } from "../api/cabApi";

const DriverCompleteRide = () => {
    const [rideId, setRideId] = useState(localStorage.getItem("activeRideId") || "");
    const [actualDistanceKm, setActualDistanceKm] = useState("");
    const [actualMinutes, setActualMinutes] = useState("");
    const [loading, setLoading] = useState(false);

    const complete = async () => {
        if (!rideId || !actualDistanceKm || !actualMinutes) return alert("Fill all fields");

        try {
            setLoading(true);
            const res = await driverCompleteRide({
                rideId,
                actualDistanceKm: Number(actualDistanceKm),
                actualMinutes: Number(actualMinutes),
            });

            alert("✅ Ride Completed");
            localStorage.removeItem("activeRideId");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Complete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cmpWrap">
            <h2 className="cmpTitle">✅ Complete Ride</h2>

            <div className="cmpCard">
                <label>RideId</label>
                <input value={rideId} onChange={(e) => setRideId(e.target.value)} />

                <label>Actual Distance (KM)</label>
                <input value={actualDistanceKm} onChange={(e) => setActualDistanceKm(e.target.value)} />

                <label>Actual Time (Minutes)</label>
                <input value={actualMinutes} onChange={(e) => setActualMinutes(e.target.value)} />

                <button className="btnRed" onClick={complete} disabled={loading}>
                    Complete Ride
                </button>
            </div>
        </div>
    );
};

export default DriverCompleteRide;
