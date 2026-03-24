import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bookHotel, verifyPayment } from "../../api/hotelApi";
import "./Hotel.css";

function BookHotel() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    // Get hotel ID from URL if redirected from search page
    const prefilledId = searchParams.get("id") || "";

    const [booking, setBooking] = useState({
        hotelId: prefilledId,
        roomType: "DELUXE",
        rooms: 1,
        checkIn: "",
        checkOut: ""
    });

    const [loading, setLoading] = useState(false);

    const handleBook = async () => {
        if (!booking.hotelId) return toast.error("Hotel ID is missing");
        if (!booking.checkIn || !booking.checkOut) return toast.error("Please select dates");
        if (booking.rooms < 1) return toast.error("At least 1 room required");

        try {
            setLoading(true);

            // Step 1: Create backend booking (which also creates pending payment and returns orderId/amount)
            const res = await bookHotel(token, booking);
            const { bookingId, amount, orderId } = res.data;

            if (!orderId) {
                toast.success("Booking Confirmed! ID: " + bookingId);
                navigate("/dashboard");
                return;
            }

            // Step 2: Open Razorpay checkout
            const options = {
                key: "rzp_test_RjuX4tT08FbRfO", // From user snippet
                amount: amount * 100, // amount in paisa
                currency: "INR",
                order_id: orderId,
                name: "Lovely Travels",
                description: "Hotel Room Reservation",
                handler: async function (response) {
                    try {
                        // Step 3: Verify payment with backend
                        const verifyRes = await verifyPayment(token, {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        if (verifyRes.data === true || verifyRes.data?.success) {
                            toast.success("Payment successful! Booking confirmed: " + bookingId);
                            navigate("/dashboard");
                        } else {
                            toast.error("Payment verification failed.");
                        }
                    } catch (err) {
                        console.error("Payment Verification Error:", err);
                        toast.error("Failed to verify payment status.");
                    }
                },
                theme: {
                    color: "#10b981"
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                toast.error("Payment Failed! Please try again.");
                console.error(response.error);
            });

            rzp.open();

        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to book hotel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hotel-wrapper">
            <h2 className="hotel-title">Complete Your Booking</h2>

            <div className="hotel-card">
                <div className="hotel-field">
                    <label>Hotel ID</label>
                    <input
                        placeholder="System Hotel ID"
                        value={booking.hotelId}
                        disabled={!!prefilledId} // disable if it came from the URL search automatically
                        onChange={(e) => setBooking({ ...booking, hotelId: e.target.value })}
                    />
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    <div className="hotel-field" style={{ flex: 1 }}>
                        <label>Room Category</label>
                        <select
                            value={booking.roomType}
                            onChange={(e) => setBooking({ ...booking, roomType: e.target.value })}
                        >
                            <option value="DOUBLE">Double</option>
                            <option value="FAMILY">Family</option>
                            <option value="KING">King</option>
                            <option value="SUITE">Suite</option>
                            <option value="QUEEN">Queen</option>
                            <option value="DELUXE">Deluxe</option>
                            <option value="SINGLE">Single</option>
                        </select>
                    </div>

                    <div className="hotel-field" style={{ flex: 1 }}>
                        <label>Number of Rooms</label>
                        <input
                            type="number"
                            min="1"
                            value={booking.rooms}
                            onChange={(e) => setBooking({ ...booking, rooms: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    <div className="hotel-field" style={{ flex: 1 }}>
                        <label>Check-in Date</label>
                        <input
                            type="date"
                            value={booking.checkIn}
                            onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                        />
                    </div>

                    <div className="hotel-field" style={{ flex: 1 }}>
                        <label>Check-out Date</label>
                        <input
                            type="date"
                            value={booking.checkOut}
                            onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    className="hotel-btn"
                    onClick={handleBook}
                    disabled={loading}
                    style={{ marginTop: "24px", padding: "16px", fontSize: "1.1rem", background: "#10b981" }}
                >
                    {loading ? "Processing Secure Payment..." : "Confirm & Pay"}
                </button>
            </div>
        </div>
    );
}

export default BookHotel;
