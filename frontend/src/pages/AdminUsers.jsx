import { useEffect, useState } from "react";
import { userService } from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ FIX: Define the fetch logic INSIDE useEffect to avoid dependency/hoisting errors
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch data for the current page
        const response = await userService.getAllUsers(currentPage);
        console.log("Admin Data:", response.data);

        setUsers(response.data.data);
        setTotalPages(response.data.totalPages);
        setError(null); // Clear any previous errors on success
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response && err.response.status === 403) {
          setError("Access Denied: You are not a System Admin.");
        } else {
          setError("Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]); // Re-run whenever 'currentPage' changes

  // --- STYLES (Basic CSS) ---
  const styles = {
    container: { padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" },
    header: { marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "10px" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    th: { backgroundColor: "#007bff", color: "white", padding: "12px", textAlign: "left" },
    td: { padding: "12px", borderBottom: "1px solid #ddd", color: "#333" },
    badge: { padding: "4px 8px", borderRadius: "12px", fontSize: "0.85em", fontWeight: "bold" },
    btnContainer: { marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" },
    btn: { padding: "8px 16px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" },
    btnDisabled: { padding: "8px 16px", cursor: "not-allowed", backgroundColor: "#ccc", color: "#666", border: "none", borderRadius: "4px" },
    error: { color: "red", textAlign: "center", marginTop: "50px", fontSize: "1.2rem" }
  };

  // Helper for Role Colors
  const getRoleColor = (role) => {
    if (role === "SYS_ADMIN") return "#e3f2fd"; // Light Blue
    if (role === "HOTEL_OWNER") return "#fff3e0"; // Light Orange
    return "#e8f5e9"; // Light Green (User)
  };

  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>User Management</h1>
        <p>Total Pages: {totalPages}</p>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Gender</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}>
                    {user.fullName || "N/A"}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, backgroundColor: getRoleColor(user.role)}}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>{user.city || "-"}</td>
                  <td style={styles.td}>{user.gender || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Buttons */}
          <div style={styles.btnContainer}>
            <button 
              style={currentPage === 0 ? styles.btnDisabled : styles.btn} 
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button 
              style={currentPage + 1 >= totalPages ? styles.btnDisabled : styles.btn} 
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}