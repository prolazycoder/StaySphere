export default function Support() {
  return (
    <div className="page-wrapper">
      <h1>Support</h1>
      <p className="page-subtitle">
        Chat support will be integrated here.
      </p>
      <textarea
        className="support-textarea"
        placeholder="Describe your issue..."
        rows={5}
      />
      <br />
      <button className="search-btn">Submit Ticket</button>
    </div>
  );
}
