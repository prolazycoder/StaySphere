export default function RegisterCab() {
  return (
    <div className="page-wrapper">
      <h1>Register Your Cab</h1>
      <p className="page-subtitle">Partner with us and get ride bookings.</p>

      <form className="simple-form">
        <div className="form-row">
          <div className="form-field">
            <label>Driver Name</label>
            <input type="text" placeholder="Full name" />
          </div>
          <div className="form-field">
            <label>Car Model</label>
            <input type="text" placeholder="e.g. Swift Dzire" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Car Number</label>
            <input type="text" placeholder="DL 01 AB 1234" />
          </div>
          <div className="form-field">
            <label>City</label>
            <input type="text" placeholder="Operating city" />
          </div>
        </div>

        <button type="submit" className="search-btn">
          Register Cab
        </button>
      </form>
    </div>
  );
}
