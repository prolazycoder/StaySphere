import React, { useState } from "react";
import "./DriverRideOtp.css";
import { driverVerifyOtp, driverStartRide } from "../api/cabApi";

const DriverRideOtp = () => {
    const [rideId, setRideId] = useState(localStorage.getItem("activeRideId") || "");
    const [otp, setOtp] = useState("");
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const verify = async () => {
        if (!rideId || !otp) return alert("RideId & OTP required");

        try {
            setLoading(true);
            await driverVerifyOtp({ rideId, otp });
            setVerified(true);
            alert("✅ OTP Verified");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "OTP invalid");
        } finally {
            setLoading(false);
        }
    };

    const start = async () => {
        if (!rideId) return alert("RideId missing");
        try {
            setLoading(true);
            await driverStartRide(rideId);
            alert("✅ Ride Started");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Start ride failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otpWrap">
            <h2 className="otpTitle">🔐 OTP Verify & Start Ride</h2>

            <div className="otpCard">
                <label>RideId</label>
                <input value={rideId} onChange={(e) => setRideId(e.target.value)} placeholder="Ride UUID" />

                <label>OTP</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />

                <button className="btnDark" onClick={verify} disabled={loading}>
                    Verify OTP
                </button>

                <button className="btnGreen" onClick={start} disabled={loading || !verified}>
                    Start Ride
                </button>
            </div>
        </div>
    );
};

export default DriverRideOtp;
