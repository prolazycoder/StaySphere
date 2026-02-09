import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css"; // Global styles
import { logoutUser } from "../utils/authUtils";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function RegisterCab() {
    const navigate = useNavigate();
    const navLinks = ["Home", "Bookings", "Support"];

    const [form, setForm] = useState({
        driverName: "",
        vehicleModel: "",
        vehicleNumber: "",
        city: "",
        licenseNumber: "",
        vehicleType: "SEDAN",
        seatingCapacity: 4,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                alert("Please login first");
                return;
            }

            const authHeader = `Bearer ${token}`;

            // 1. Register Driver
            const registerRes = await fetch(`${import.meta.env.VITE_API_URL}/api/driver/register`, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json"
                }
            });

            if (!registerRes.ok) throw new Error("Failed to register driver profile");

            const registerData = await registerRes.json();
            console.log("Driver Registered:", registerData);

            // 2. Register Vehicle
            const vehiclePayload = {
                vehicleModel: form.vehicleModel,
                vehicleNumber: form.vehicleNumber,
                seatingCapacity: parseInt(form.seatingCapacity),
                vehicleType: form.vehicleType
            };

            const vehicleRes = await fetch(`${import.meta.env.VITE_API_URL}/api/driver/vehicle-register`, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(vehiclePayload)
            });

            if (!vehicleRes.ok) throw new Error("Failed to register vehicle");

            const vehicleData = await vehicleRes.json();
            console.log("Vehicle Registered:", vehicleData);

            // Update role in local storage if needed
            // The backend returns a new token in registerDriver response, we should probably use that
            if (registerData.jwtToken) {
                localStorage.setItem("accessToken", registerData.jwtToken);
                localStorage.setItem("refreshToken", registerData.refreshToken);
                localStorage.setItem("role", "DRIVER");
            }

            alert("Registration Successful! You are now a driver.");
            navigate("/driver"); // Redirect to driver panel

        } catch (error) {
            console.error("Registration Error:", error);
            alert("Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavClick = (link) => {
        if (link === "Home") navigate("/");
        if (link === "Bookings") navigate("/bookings");
        if (link === "Support") navigate("/support");
    };

    return (
        <div className="app-root">
            <Sidebar />

            {/* Main Content */}
            <div className="main-area">
                {/* Top Bar */}
                <Topbar />

                <main className="content">
                    <div style={{ marginBottom: "16px" }}>
                        <button onClick={() => navigate("/cabs")} className="back-btn">
                            ← Back to Cabs
                        </button>
                    </div>

                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <h2 className="booking-title" style={{ marginBottom: "10px" }}>🚖 Partner with Us</h2>
                        <p className="booking-subtitle" style={{ marginBottom: "30px" }}>Register your cab and start earning with StaySphere.</p>

                        <div className="booking-card">
                            <div className="booking-card-header">
                                <h3 style={{ margin: 0 }}>Vehicle & Driver Details</h3>
                                <p className="booking-subtitle">Please provide accurate information for verification.</p>
                            </div>

                            <form className="booking-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Driver Full Name</label>
                                        <input
                                            name="driverName"
                                            value={form.driverName}
                                            onChange={handleChange}
                                            placeholder="e.g. Rahul Sharma"
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Driving License Number</label>
                                        <input
                                            name="licenseNumber"
                                            value={form.licenseNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. MH14 20180000000"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>City</label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="e.g. Pune"
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Vehicle Number</label>
                                        <input
                                            name="vehicleNumber"
                                            value={form.vehicleNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. MH12 AB 1234"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Vehicle Model</label>
                                        <input
                                            name="vehicleModel"
                                            value={form.vehicleModel}
                                            onChange={handleChange}
                                            placeholder="e.g. Swift Dzire"
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Vehicle Type</label>
                                        <select
                                            name="vehicleType"
                                            value={form.vehicleType}
                                            onChange={handleChange}
                                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                                        >
                                            <option value="MICRO">Micro</option>
                                            <option value="MINI">Mini</option>
                                            <option value="SEDAN">Sedan</option>
                                            <option value="SUV">SUV</option>
                                            <option value="LUXURY">Luxury</option>
                                            <option value="AUTO">Auto</option>
                                            <option value="BIKE">Bike</option>
                                            <option value="ELECTRIC">Electric</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Seating Capacity</label>
                                        <input
                                            type="number"
                                            name="seatingCapacity"
                                            value={form.seatingCapacity}
                                            onChange={handleChange}
                                            min="1"
                                            max="10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field" style={{ marginTop: '20px' }}>
                                    <button type="submit" className="search-btn" disabled={loading}>
                                        {loading ? "Registering..." : "Submit Registration"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
