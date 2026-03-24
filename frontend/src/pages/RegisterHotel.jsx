export default function RegisterHotel() {
  return (
    <div className="page-wrapper">
      <h1>Register Your Hotel</h1>
      <p className="page-subtitle">Add your property and start getting bookings.</p>

      <form className="simple-form">
        <div className="form-row">
          <div className="form-field">
            <label>Hotel Name</label>
            <input type="text" placeholder="Enter hotel name" />
          </div>
          <div className="form-field">
            <label>City</label>
            <input type="text" placeholder="City" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Address</label>
            <input type="text" placeholder="Full address" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Starting Price / Night</label>
            <input type="number" placeholder="e.g. 2499" />
          </div>
          <div className="form-field">
            <label>Contact Number</label>
            <input type="tel" placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>

        <button type="submit" className="search-btn">
          Submit for Review
        </button>
      </form>
    </div>
  );
}
