import { useParams, useNavigate } from "react-router-dom";

const dummyDestinationMap = {
  1: "Goa",
  2: "Manali",
  3: "Jaipur",
  4: "Bangkok",
};

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = dummyDestinationMap[id] || "Selected Destination";

  return (
    <div className="page-wrapper">
      <h1>Confirm Your Booking</h1>
      <p className="page-subtitle">
        You are booking a stay in <b>{name}</b>.
      </p>

      <form className="simple-form">
        <div className="form-row">
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="form-field">
            <label>Mobile Number</label>
            <input type="tel" placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
        </div>

        <button
          type="button"
          className="search-btn"
          onClick={() => navigate("/bookings")}
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
