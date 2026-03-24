import axios from "axios";

// Explicitly define the Spring Boot 8080 backend host
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const createHotelOwner = async (token) => {
    return await axios.post(`${API_URL}/api/v1/hotel-owner/create-owner`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const registerHotel = async (token, hotelData) => {
    return await axios.post(`${API_URL}/api/v1/hotel-owner/register-hotel`, hotelData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addRoom = async (token, hotelId, roomData) => {
    return await axios.post(`${API_URL}/api/v1/rooms/hotel/${hotelId}`, roomData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const uploadHotelMedia = async (token, hotelId, formData) => {
    return await axios.post(`${API_URL}/api/v1/hotel-media/${hotelId}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
};

export const uploadHotelDocument = async (token, documentType, file) => {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);
    return await axios.post(`${API_URL}/api/v1/document/upload`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
};

export const searchHotels = async (token, params) => {
    // Expected params: { city, state, country, minStars, maxStars, amenities, page, size }
    return await axios.get(`${API_URL}/api/v1/hotels/search`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        paramsSerializer: { indexes: null } // crucial for serializing amenities array ?amenities=WIFI&amenities=POOL
    });
};

export const bookHotel = async (token, bookingData) => {
    return await axios.post(`${API_URL}/api/bookings/book`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const verifyPayment = async (token, paymentData) => {
    return await axios.post(`${API_URL}/payments/verify`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
