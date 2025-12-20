import { useLocation } from "react-router-dom";

export default function Cabs() {
  const locationState = useLocation().state;

  return (
    <div className="page-wrapper">
      <h1>Cabs</h1>
      {locationState && (
        <p className="page-subtitle">
          Showing cabs in <b>{locationState.location}</b>
          on <b>{locationState.date}</b> for <b>{locationState.guests}</b>
        </p>
      )}
    </div>
  );
}
