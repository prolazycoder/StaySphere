import api from "../../api/axiosConfig";

// ===========================
// RIDER APIs
// ===========================
export const riderSearchDrivers = async (payload) => {
    // POST /api/rider/search-drivers
    const res = await api.post("/api/rider/search-drivers", payload);
    return res.data; // Ride entity returned
};

export const riderCancelRide = async ({ rideId, riderId }) => {
    const res = await api.post(`/api/rider/cancel-ride?rideId=${rideId}&riderId=${riderId}`);
    return res.data;
};

// ===========================
// DRIVER APIs
// ===========================
export const driverGoOnline = async ({ lat, lng }) => {
    const res = await api.post("/api/driver/go-online", { lat, lng });
    return res.data;
};

export const driverGoOffline = async () => {
    const res = await api.post("/api/driver/go-offline");
    return res.data;
};

export const driverUpdateLocation = async ({ lat, lng }) => {
    const res = await api.post("/api/driver/location", { lat, lng });
    return res.data;
};

export const driverAcceptRide = async (rideId) => {
    const res = await api.post(`/api/driver/accept-ride?rideId=${rideId}`);
    return res.data;
};

export const driverRejectRide = async ({ driverId, rideId }) => {
    const res = await api.post(`/api/driver/reject-ride`, { driverId, rideId });
    return res.data;
};

export const driverVerifyOtp = async ({ rideId, otp }) => {
    const res = await api.post(`/api/driver/verify-otp?rideId=${rideId}&otp=${otp}`);
    return res.data;
};

export const driverStartRide = async (rideId) => {
    const res = await api.post(`/api/driver/start-ride/${rideId}`);
    return res.data;
};

export const driverCompleteRide = async ({ rideId, actualDistanceKm, actualMinutes }) => {
    const res = await api.post(
        `/api/driver/complete-ride?rideId=${rideId}&actualDistanceKm=${actualDistanceKm}&actualMinutes=${actualMinutes}`
    );
    return res.data;
};
