import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./Dashboard";
import LoginPage from "./LoginPage";
import OauthSuccess from "./OauthSuccess";

// Pages
import Hotels from "./pages/Hotels";
import Cabs from "./pages/Cabs";
import Profile from "./pages/Profile";
import RegisterHotel from "./pages/RegisterHotel";
import RegisterCab from "./pages/RegisterCab";
import BookingPage from "./pages/BookingPage";
import Support from "./pages/Support";
import Bookings from "./pages/Bookings";

import "./App.css";

// ================== JWT PARSER ==================
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

// ================== LOCAL TOKEN CHECK ==================
const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;

  return decoded.exp * 1000 > Date.now();
};

// ================== PROTECTED ROUTE ==================
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
  return children;
};

// ================== APP ROUTER ==================
export default function App() {
  return (
    <Router>
      <Routes>
        
        {/* LOGIN PAGE */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* OAuth Callback Handler */}
        <Route path="/oauth-success" element={<OauthSuccess />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED PAGES */}
        <Route
          path="/hotels"
          element={
            <ProtectedRoute>
              <Hotels />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cabs"
          element={
            <ProtectedRoute>
              <Cabs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register-hotel"
          element={
            <ProtectedRoute>
              <RegisterHotel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register-cab"
          element={
            <ProtectedRoute>
              <RegisterCab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}
