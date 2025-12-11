const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || error.detail || 'API request failed');
    }

    return response.json();
};

// Authentication
export const authAPI = {
    login: (email, password) =>
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    
    logout: () =>
        apiCall('/auth/logout', { method: 'POST' }),
};

// User Details
export const userAPI = {
    getDetails: (vendorId) =>
        apiCall(`/users/${vendorId}`),
    
    updateDetails: (vendorId, data) =>
        apiCall(`/users/${vendorId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// Bank Details
export const bankAPI = {
    getDetails: (vendorId) =>
        apiCall(`/bank-details/${vendorId}`),
    
    updateDetails: (vendorId, data) =>
        apiCall(`/bank-details/${vendorId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// Payment History
export const paymentAPI = {
    getHistory: (vendorId, year = null) => {
        const yearParam = year ? `?year=${year}` : '';
        return apiCall(`/payment-history/${vendorId}${yearParam}`);
    },
    
    getSummary: (vendorId) =>
        apiCall(`/payment-history/${vendorId}/summary`),
};

// Upcoming Payments
export const upcomingPaymentsAPI = {
    getPayments: (vendorId) =>
        apiCall(`/upcoming-payments/${vendorId}`),
    
    getAgreementBreakdown: (vendorId, agreementNumber) =>
        apiCall(`/upcoming-payments/${vendorId}/agreement/${agreementNumber}`),
};

export default {
    auth: authAPI,
    user: userAPI,
    bank: bankAPI,
    payment: paymentAPI,
    upcomingPayments: upcomingPaymentsAPI,
};
