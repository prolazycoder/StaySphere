import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
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
import RegisterCab from "./pages/RegisterCab";
import BookingPage from "./pages/BookingPage";
import Support from "./pages/Support";
import Bookings from "./pages/Bookings";
// Info Pages
import AboutUs from "./pages/AboutUs";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Hotel Provider & Booking Pages
import SearchHotels from "./pages/hotel/SearchHotels";
import RegisterHotel from "./pages/hotel/RegisterHotel";
import AddRoom from "./pages/hotel/AddRoom";
import UploadMedia from "./pages/hotel/UploadMedia";
import BookHotel from "./pages/hotel/BookHotel";

// Driver Pages
import DriverDashboard from "./pages/driver/DriverDashboard";

import { storeUserFromToken } from "./utils/jwtUtils";

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
  // ✅ MUST BE HERE (not inside Routes)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      storeUserFromToken(token); // ✅ ensures userId exists for socket topics
    }
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
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
            path="/hotel/search"
            element={
              <ProtectedRoute>
                <SearchHotels />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/book"
            element={
              <ProtectedRoute>
                <BookHotel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/add-room"
            element={
              <ProtectedRoute>
                <AddRoom />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/upload-media"
            element={
              <ProtectedRoute>
                <UploadMedia />
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

          {/* Info Pages (Public or Protected, assuming protected to match layout) */}
          <Route
            path="/about-us"
            element={
              <ProtectedRoute>
                <AboutUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms"
            element={
              <ProtectedRoute>
                <TermsConditions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <ProtectedRoute>
                <PrivacyPolicy />
              </ProtectedRoute>
            }
          />

          {/* ✅ DRIVER ROUTE */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}
