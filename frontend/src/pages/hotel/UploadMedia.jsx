import React, { useState } from "react";
import toast from "react-hot-toast";
import { uploadHotelMedia } from "../../api/hotelApi";
import "./Hotel.css";

function UploadMedia() {
    const token = localStorage.getItem("accessToken");

    const [file, setFile] = useState(null);
    const [hotelId, setHotelId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!hotelId) return toast.error("Hotel ID required");
        if (!file) return toast.error("Select an image to upload");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");

        try {
            setLoading(true);
            await uploadHotelMedia(token, hotelId, formData);
            toast.success("Image Uploaded Successfully!");
            setFile(null); // reset file input visually by clearing state
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hotel-wrapper" style={{ maxWidth: "600px" }}>
            <h2 className="hotel-title">Upload Hotel Media</h2>

            <div className="hotel-card">
                <div className="hotel-field">
                    <label>Hotel ID</label>
                    <input
                        placeholder="Enter your Hotel ID"
                        value={hotelId}
                        onChange={(e) => setHotelId(e.target.value)}
                    />
                </div>

                <div className="hotel-field">
                    <label>Select Image File</label>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ padding: "10px 0", background: "transparent", border: "none" }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                <button className="hotel-btn" onClick={handleUpload} disabled={loading} style={{ marginTop: "10px" }}>
                    {loading ? "Uploading..." : "Upload Image"}
                </button>
            </div>
        </div>
    );
}

export default UploadMedia;
