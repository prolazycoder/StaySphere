import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { driverRegister, driverVehicleRegister, uploadCabImage } from "../api/cabApi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function RegisterCab() {
  const navigate = useNavigate();
  const { loadUser } = useUser();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Store the new tokens temporarily
  const [newTokens, setNewTokens] = useState(null);

  const [form, setForm] = useState({
    vehicleModel: "",
    vehicleNumber: "",
    vehicleType: "SEDAN",
    seatingCapacity: 4,
    vehicleImage: ""
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Step 1: Register Driver & Update Tokens
  const handleDriverRegister = async () => {
    try {
      setLoading(true);
      toast.success("Registering as Driver...", { id: "driver-reg" });

      const res = await driverRegister();

      // Save tokens temporarily in state, do NOT update localStorage yet
      setNewTokens({
        jwtToken: res?.jwtToken,
        refreshToken: res?.refreshToken,
        driverId: res?.driverId
      });

      toast.success("Driver profile created! Now add vehicle details.", { id: "driver-reg" });
      setStep(2);

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Driver registration failed", { id: "driver-reg" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Image Upload
  const uploadImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max image size is 2MB");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadCabImage(file);
      setForm((prev) => ({ ...prev, vehicleImage: url }));
      toast.success("Cab image uploaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Step 2 Submission
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("User ID missing. Please login again.");
      return;
    }

    if (!form.vehicleModel || !form.vehicleNumber || !form.seatingCapacity) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      toast.success("Registering Vehicle...", { id: "veh-reg" });

      const vehicleData = {
        vehicleModel: form.vehicleModel,
        vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType,
        seatingCapacity: Number(form.seatingCapacity),
        vehicleImage: form.vehicleImage
      };

      const res = await driverVehicleRegister(userId, vehicleData);

      if (res?.message === "TRUE") {
        // Successfully registered vehicle!
        // Admin verification is required, so we update the tokens but force a logout immediately.
        if (newTokens?.jwtToken) localStorage.setItem("accessToken", newTokens.jwtToken);
        if (newTokens?.refreshToken) localStorage.setItem("refreshToken", newTokens.refreshToken);
        if (newTokens?.driverId) localStorage.setItem("driverId", newTokens.driverId);
        localStorage.setItem("userRole", "DRIVER");

        toast.success("Admin team will verify your credentials and activate your account.", {
          id: "veh-reg",
          duration: 5000
        });

        setTimeout(() => {
          // Auto logout
          localStorage.clear();
          window.location.href = "/";
        }, 3500);
      } else {
        toast.error(res?.message || "Vehicle registration failed or needs manual review.", { id: "veh-reg", duration: 5000 });
      }

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Vehicle registration failed", { id: "veh-reg" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>

        {step === 1 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h1 style={{ marginBottom: "12px", fontSize: "2rem", color: "#111" }}>Become a Driver</h1>
            <p style={{ color: "#666", marginBottom: "40px", fontSize: "1.05rem" }}>
              Join our network of drivers to start receiving ride requests. By registering, your account will be upgraded with new driver permissions.
            </p>
            <button
              onClick={handleDriverRegister}
              disabled={loading}
              style={{
                padding: "16px 32px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "1.1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)"
              }}
            >
              {loading ? "Processing..." : "Register as Driver"}
            </button>
          </div>
        )}

        {step === 2 && (
          <>
            <h1 style={{ marginBottom: "8px", fontSize: "2rem", color: "#111" }}>Vehicle Details</h1>
            <p style={{ color: "#666", marginBottom: "30px" }}>Step 2: Add your cab details to complete registration.</p>

            <form onSubmit={handleVehicleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Image Upload Row */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
                <div style={{
                  width: "100px", height: "100px", borderRadius: "12px", background: "#f3f4f6",
                  border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                }}>
                  {form.vehicleImage ? (
                    <img src={form.vehicleImage} alt="Vehicle" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "2rem", color: "#a1a1aa" }}>🚙</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Cab Photo</label>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #111", background: "white", cursor: "pointer", fontWeight: "600" }}
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                  <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>JPG, PNG up to 2MB</p>
                  <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Vehicle Model</label>
                <input
                  name="vehicleModel"
                  value={form.vehicleModel}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. Swift Dzire, Innova"
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Vehicle Number</label>
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  type="text"
                  placeholder="DL 01 AB 1234"
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", textTransform: "uppercase" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}
                >
                  <option value="SEDAN">SEDAN</option>
                  <option value="SUV">SUV</option>
                  <option value="MINI">MINI</option>
                  <option value="AUTO">AUTO</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Seating Capacity</label>
                <input
                  name="seatingCapacity"
                  value={form.seatingCapacity}
                  onChange={handleChange}
                  type="number"
                  min="1"
                  placeholder="4"
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "10px",
                  padding: "14px",
                  background: "#111",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Registering..." : "Register Vehicle"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
