import React, { useState } from "react";
import toast from "react-hot-toast";
import { registerHotel, addRoom, uploadHotelMedia, uploadHotelDocument } from "../../api/hotelApi";
import { useNavigate } from "react-router-dom";
import "./Hotel.css";

function RegisterHotel() {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const [step, setStep] = useState(1);
    const [hotelId, setHotelId] = useState(localStorage.getItem("hotelId") || "");

    // Step 1 State: KYC Documents
    const [docs, setDocs] = useState({
        PAN_CARD: null,
        AADHAR_CARD: null,
        GST_CERTIFICATE: null,
        HOTEL_LICENSE: null
    });
    const [docStatus, setDocStatus] = useState({
        PAN_CARD: false,
        AADHAR_CARD: false,
        GST_CERTIFICATE: false,
        HOTEL_LICENSE: false
    });

    // Step 2 State: Hotel Details
    const [hotel, setHotel] = useState({
        hotelOwnerId: localStorage.getItem("hotelOwnerId") || "",
        name: "", description: "Luxury hotel", city: "", state: "",
        country: "India", address: "", stars: 3, phone: "", email: "",
        latitude: 18.5204, longitude: 73.8567, amenities: ["WIFI", "POOL"]
    });

    // Step 3 State: Room Details
    const [room, setRoom] = useState({
        roomType: "DELUXE", basePrice: 2000, capacity: 2, totalRooms: 10
    });

    // Step 4 State: Media
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);

    // --- STEP 1 HANDLERS ---
    const handleDocUpload = async (docType) => {
        const fileToUpload = docs[docType];
        if (!fileToUpload) return toast.error(`Please select a file for ${docType.replace("_", " ")}`);

        try {
            setLoading(true);
            await uploadHotelDocument(token, docType, fileToUpload);
            toast.success(`${docType.replace("_", " ")} Uploaded! Auto-verification in progress...`);
            setDocStatus(prev => ({ ...prev, [docType]: true }));
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || `Failed to upload ${docType}`);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueToHotel = () => {
        const allUploaded = Object.values(docStatus).every(status => status === true);
        if (!allUploaded) {
            return toast.error("Please upload all 4 mandatory KYC documents first.");
        }
        setStep(2);
    };

    // --- STEP 2 HANDLER ---
    const handleRegisterHotel = async () => {
        if (!hotel.name || !hotel.city || !hotel.country || !hotel.hotelOwnerId) {
            return toast.error("Required: Name, City, Country, and HotelOwnerID");
        }
        try {
            setLoading(true);
            const res = await registerHotel(token, hotel);
            toast.success("Hotel Registered Successfully!");
            // Extract hotel ID
            const resData = res?.data || {};
            const potentialId = resData.id || resData.hotelId || (typeof resData === 'string' ? resData.replace(/\D/g, '') : "");

            if (potentialId) {
                setHotelId(potentialId);
                localStorage.setItem("hotelId", potentialId);
            }
            setStep(3);
        } catch (err) {
            console.error(err);
            // Catch verification errors if tried too soon
            const errorMsg = err?.response?.data?.message || err?.response?.data || "Failed to register hotel";
            if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes("verif")) {
                toast.error("Background KYC Verification is still running (takes ~30s). Please wait a few seconds and try clicking Next again.");
            } else {
                toast.error(typeof errorMsg === 'string' ? errorMsg : "Failed to register hotel. Ensure all KYC is verified.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 3 HANDLERS ---
    const handleAddRoom = async () => {
        if (!hotelId) return toast.error("Hotel ID is required.");
        try {
            setLoading(true);
            await addRoom(token, hotelId, room);
            toast.success("Room Type Added Successfully!");
            setStep(4);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to add room");
        } finally {
            setLoading(false);
        }
    };

    const handleSkipToMedia = () => setStep(4);

    // --- STEP 4 HANDLERS ---
    const handleUploadMedia = async () => {
        if (!hotelId) return toast.error("Hotel ID required");
        if (!file) return toast.error("Select an image to upload");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");

        try {
            setLoading(true);
            await uploadHotelMedia(token, hotelId, formData);
            toast.success("Image Uploaded Successfully! Setup Complete.");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        toast.success("Hotel Setup Complete!");
        navigate("/dashboard");
    };

    // --- RENDERERS ---
    const renderStep1 = () => {
        const requiredDocs = ["PAN_CARD", "AADHAR_CARD", "GST_CERTIFICATE", "HOTEL_LICENSE"];

        return (
            <div className="hotel-card">
                <h3 style={{ marginBottom: "20px" }}>Step 1: Owner KYC Verification</h3>
                <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "0.9rem" }}>
                    Security requires all hotel owners to upload valid verification documents before listing a property.
                    Uploaded documents are verified automatically in ~30 seconds.
                </p>

                {requiredDocs.map(doc => (
                    <div key={doc} className="hotel-field" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: docStatus[doc] ? "#f0fdf4" : "white" }}>
                        <div style={{ flex: 1, fontWeight: "600" }}>{doc.replace("_", " ")}</div>

                        {!docStatus[doc] ? (
                            <>
                                <input type="file" accept="image/*,.pdf" style={{ flex: 2, padding: "5px", border: "none" }} onChange={(e) => setDocs({ ...docs, [doc]: e.target.files[0] })} />
                                <button className="hotel-btn" style={{ flex: 1, padding: "8px 16px" }} onClick={() => handleDocUpload(doc)} disabled={loading}>
                                    Upload
                                </button>
                            </>
                        ) : (
                            <div style={{ color: "#166534", fontWeight: "700", display: "flex", gap: "8px", alignItems: "center" }}>
                                <span>✅ Uploaded</span>
                                <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: "normal" }}>(Auto-verifying in background...)</span>
                            </div>
                        )}
                    </div>
                ))}

                <button className="hotel-btn" onClick={handleContinueToHotel} disabled={loading} style={{ marginTop: "24px" }}>
                    Next: Hotel Details
                </button>
            </div>
        );
    };

    const renderStep2 = () => (
        <div className="hotel-card">
            <h3 style={{ marginBottom: "20px" }}>Step 2: Basic Information</h3>

            <div className="hotel-field">
                <label>System Owner ID (Auto-filled)</label>
                <input value={hotel.hotelOwnerId} disabled style={{ backgroundColor: "#f3f4f6" }} />
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>Hotel Name *</label>
                    <input name="name" placeholder="Grand Plaza" value={hotel.name} onChange={(e) => setHotel({ ...hotel, name: e.target.value })} />
                </div>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>Star Rating</label>
                    <select name="stars" value={hotel.stars} onChange={(e) => setHotel({ ...hotel, stars: parseInt(e.target.value) })}>
                        <option value={1}>1 Star ⭐</option>
                        <option value={2}>2 Star ⭐⭐</option>
                        <option value={3}>3 Star ⭐⭐⭐</option>
                        <option value={4}>4 Star ⭐⭐⭐⭐</option>
                        <option value={5}>5 Star ⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>Phone Number</label>
                    <input name="phone" placeholder="9876543210" value={hotel.phone} onChange={(e) => setHotel({ ...hotel, phone: e.target.value })} />
                </div>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>Email Address</label>
                    <input name="email" placeholder="contact@hotel.com" value={hotel.email} onChange={(e) => setHotel({ ...hotel, email: e.target.value })} />
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>City *</label>
                    <input name="city" placeholder="e.g. Mumbai" value={hotel.city} onChange={(e) => setHotel({ ...hotel, city: e.target.value })} />
                </div>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>State</label>
                    <input name="state" placeholder="e.g. Maharashtra" value={hotel.state} onChange={(e) => setHotel({ ...hotel, state: e.target.value })} />
                </div>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>Country *</label>
                    <input name="country" placeholder="e.g. India" value={hotel.country} onChange={(e) => setHotel({ ...hotel, country: e.target.value })} />
                </div>
            </div>

            <div className="hotel-field">
                <label>Full Address</label>
                <input name="address" placeholder="123 Main Street..." value={hotel.address} onChange={(e) => setHotel({ ...hotel, address: e.target.value })} />
            </div>

            <button className="hotel-btn" onClick={handleRegisterHotel} disabled={loading} style={{ marginTop: "10px" }}>
                {loading ? "Checking KYC & Saving..." : "Next: Add Rooms"}
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="hotel-card">
            <h3 style={{ marginBottom: "20px" }}>Step 3: Add Room Configuration</h3>
            <div className="hotel-field">
                <label>System Hotel ID (Auto-filled if generated)</label>
                <input placeholder="Hotel ID" value={hotelId} onChange={(e) => setHotelId(e.target.value)} />
            </div>

            <div className="hotel-field">
                <label>Room Type</label>
                <select value={room.roomType} onChange={(e) => setRoom({ ...room, roomType: e.target.value })}>
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
                    <input type="number" value={room.basePrice} onChange={(e) => setRoom({ ...room, basePrice: e.target.value })} />
                </div>
                <div className="hotel-field" style={{ flex: 1 }}>
                    <label>Capacity (Persons)</label>
                    <input type="number" value={room.capacity} onChange={(e) => setRoom({ ...room, capacity: e.target.value })} />
                </div>
            </div>

            <div className="hotel-field">
                <label>Total Rooms Available</label>
                <input type="number" value={room.totalRooms} onChange={(e) => setRoom({ ...room, totalRooms: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button className="hotel-btn" onClick={handleAddRoom} disabled={loading} style={{ flex: 2 }}>
                    {loading ? "Adding..." : "Add Room & Continue"}
                </button>
                <button className="hotel-btn" onClick={handleSkipToMedia} disabled={loading} style={{ flex: 1, background: "#6b7280" }}>
                    Skip
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="hotel-card">
            <h3 style={{ marginBottom: "20px" }}>Step 4: Upload Cover Media</h3>
            <div className="hotel-field">
                <label>System Hotel ID</label>
                <input placeholder="Hotel ID" value={hotelId} onChange={(e) => setHotelId(e.target.value)} />
            </div>

            <div className="hotel-field">
                <label>Select Cover Image</label>
                <input type="file" accept="image/*" style={{ padding: "10px 0", background: "transparent", border: "none" }} onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button className="hotel-btn" onClick={handleUploadMedia} disabled={loading} style={{ flex: 2 }}>
                    {loading ? "Uploading..." : "Upload & Finish"}
                </button>
                <button className="hotel-btn" onClick={handleFinish} disabled={loading} style={{ flex: 1, background: "#10b981" }}>
                    Finish without Image
                </button>
            </div>
        </div>
    );

    return (
        <div className="hotel-wrapper">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 className="hotel-title" style={{ margin: 0 }}>Register Hotel Setup</h2>
                <div style={{ fontSize: "1rem", fontWeight: "600", color: "#4f46e5", background: "#e0e7ff", padding: "8px 16px", borderRadius: "20px" }}>
                    Step {step} of 4
                </div>
            </div>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
}

export default RegisterHotel;
