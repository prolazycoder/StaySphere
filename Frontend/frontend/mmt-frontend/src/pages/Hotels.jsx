import { useLocation } from "react-router-dom";

export default function Hotels() {
  const s = useLocation().state;

  return (
    <div className="page-wrapper">
      <h1>Hotels</h1>
      {s && (
        <p className="page-subtitle">
          Showing hotels in <b>{s.location}</b> from <b>{s.checkIn}</b> to{" "}
          <b>{s.checkOut}</b>, Guests: <b>{s.guests}</b>, Rooms:{" "}
          <b>{s.rooms}</b>
        </p>
      )}
    </div>
  );
}
