import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

// Dynamically determine the API URL based on the current hostname
// This allows mobile devices on the network to connect to the PC's backend
const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return BASE_URL;
    }
    return `http://${window.location.hostname}:8081/api`;
};

const API_URL = getApiUrl();

// Helper to get auth headers
const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const bookingService = {
    // ── User Endpoints ──────────────────────────────────────────────────────────

    /**
     * Create a new booking request
     */
    createBooking: async (bookingData) => {
        const response = await axios.post(`${API_URL}/bookings`, bookingData, {
            headers: authHeaders(),
        });
        return response.data;
    },

    /**
     * Update an existing PENDING booking (owner only)
     */
    updateBooking: async (id, bookingData) => {
        const response = await axios.put(`${API_URL}/bookings/${id}`, bookingData, {
            headers: authHeaders(),
        });
        return response.data;
    },

    /**
     * Get own bookings (optionally filter by status)
     */
    getMyBookings: async (status = null) => {
        const params = status ? { status } : {};
        const response = await axios.get(`${API_URL}/bookings/my`, {
            headers: authHeaders(),
            params,
        });
        return response.data;
    },

    /**
     * Get a single booking by ID
     */
    getBookingById: async (id) => {
        const response = await axios.get(`${API_URL}/bookings/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    },

    /**
     * Cancel own booking
     */
    cancelBooking: async (id) => {
        const response = await axios.patch(`${API_URL}/bookings/${id}/cancel`, {}, {
            headers: authHeaders(),
        });
        return response.data;
    },

    /**
     * Check if a time slot is available (no conflict)
     */
    checkConflict: async (resourceId, date, startTime, endTime) => {
        const response = await axios.get(`${API_URL}/bookings/check-conflict`, {
            headers: authHeaders(),
            params: { resourceId, date, startTime, endTime },
        });
        return response.data;
    },

    // ── Admin Endpoints ─────────────────────────────────────────────────────────

    /**
     * Get all bookings (admin)
     */
    getAllBookings: async (status = null, resourceId = null) => {
        const params = {};
        if (status) params.status = status;
        if (resourceId) params.resourceId = resourceId;
        const response = await axios.get(`${API_URL}/bookings`, {
            headers: authHeaders(),
            params,
        });
        return response.data;
    },

    /**
     * Admin: approve / reject / cancel a booking
     */
    updateBookingStatus: async (id, status, reason = null) => {
        const response = await axios.patch(`${API_URL}/bookings/${id}/status`,
            { status, reason },
            { headers: authHeaders() }
        );
        return response.data;
    },

    /**
     * Admin: delete a booking record
     */
    deleteBooking: async (id) => {
        const response = await axios.delete(`${API_URL}/bookings/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    },

    /**
     * Scan check-in (Admin only)
     */
    checkIn: async (id) => {
        const response = await axios.post(`${API_URL}/bookings/${id}/check-in`, {}, {
            headers: authHeaders(),
        });
        return response.data;
    },

    /**
     * Public Check-in (for phone scanning without login)
     */
    checkInPublic: async (id, token, pin) => {
        const response = await axios.post(`${API_URL}/bookings/public/check-in/${id}`, null, {
            params: { token, pin }
        });
        return response.data;
    },

    /**
     * Get aggregated booking analytics (Admin only)
     */
    getAnalytics: async () => {
        const response = await axios.get(`${API_URL}/bookings/analytics`, {
            headers: authHeaders(),
        });
        return response.data;
    },
};

export default bookingService;