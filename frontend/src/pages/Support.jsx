import { useState } from "react";
import { FiMessageSquare, FiPhoneCall, FiMail, FiCheckCircle } from "react-icons/fi";

export default function Support() {
  const [ticketText, setTicketText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!ticketText.trim()) return;

    // Simulate API call
    setSubmitted(true);
    setTicketText("");

    // Hide success message after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="page-wrapper" style={{ padding: "40px", backgroundColor: "#f8f9fa", minHeight: "calc(100vh - 70px)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "12px" }}>
            How can we help you?
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
            Whether you have a question about bookings, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>

          {/* Contact Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "#eef2ff", color: "#4f46e5", padding: "12px", borderRadius: "12px", fontSize: "24px" }}>
                <FiMessageSquare />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "#1a1a1a" }}>Chat with Us</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "0.95rem" }}>Our friendly team is here to help you 24/7.</p>
                <a href="#" style={{ display: "inline-block", marginTop: "12px", color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>Start a chat →</a>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "#ecfeff", color: "#0891b2", padding: "12px", borderRadius: "12px", fontSize: "24px" }}>
                <FiPhoneCall />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "#1a1a1a" }}>Call Support</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "0.95rem" }}>Mon-Fri from 8am to 8pm.</p>
                <a href="tel:+11234567890" style={{ display: "inline-block", marginTop: "12px", color: "#0891b2", fontWeight: "600", textDecoration: "none" }}>+1 (123) 456-7890</a>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "#fdf4ff", color: "#c026d3", padding: "12px", borderRadius: "12px", fontSize: "24px" }}>
                <FiMail />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "#1a1a1a" }}>Email Us</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "0.95rem" }}>Drop us a line and we'll reply within 2 hours.</p>
                <a href="mailto:support@lovelytravels.com" style={{ display: "inline-block", marginTop: "12px", color: "#c026d3", fontWeight: "600", textDecoration: "none" }}>support@lovelytravels.com</a>
              </div>
            </div>

          </div>

          {/* Form Card */}
          <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>Send a Ticket</h2>
            <p style={{ color: "#666", marginBottom: "24px" }}>We'll get back to you as soon as possible.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Description <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                  value={ticketText}
                  onChange={(e) => setTicketText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => { e.target.style.border = "1px solid #4f46e5"; e.target.style.boxShadow = "0 0 0 4px rgba(79, 70, 229, 0.1)"; e.target.style.backgroundColor = "#fff"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid #e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#f9fafb"; }}
                />
              </div>

              {submitted ? (
                <div style={{ padding: "16px", backgroundColor: "#ecfdf5", color: "#059669", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "500", animation: "fadeIn 0.3s ease-in-out" }}>
                  <FiCheckCircle size={20} />
                  Your ticket was successfully submitted!
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!ticketText.trim()}
                  style={{
                    width: "100%",
                    padding: "16px",
                    backgroundColor: !ticketText.trim() ? "#e5e7eb" : "#1a1a1a",
                    color: !ticketText.trim() ? "#9ca3af" : "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: !ticketText.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: ticketText.trim() ? "0 4px 12px rgba(26, 26, 26, 0.2)" : "none"
                  }}
                  onMouseOver={(e) => { if (ticketText.trim()) e.target.style.backgroundColor = "#333" }}
                  onMouseOut={(e) => { if (ticketText.trim()) e.target.style.backgroundColor = "#1a1a1a" }}
                  onMouseDown={(e) => { if (ticketText.trim()) e.target.style.transform = "scale(0.98)" }}
                  onMouseUp={(e) => { if (ticketText.trim()) e.target.style.transform = "scale(1)" }}
                >
                  Submit Ticket
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
