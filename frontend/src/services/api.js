// API service layer for frontend-backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Only access localStorage in browser environment
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network error or other issues
      throw new ApiError('Network error occurred', 0, null);
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updatePassword(passwordData) {
    return this.request('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetData) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  // Appointment methods
  async getAppointments(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/appointments?${queryParams}`);
  }

  async getAppointmentById(id) {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, updates) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async cancelAppointment(id, reason) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getProviderAvailability(providerId, date, duration = 60) {
    const params = new URLSearchParams({ date, duration }).toString();
    return this.request(`/appointments/providers/${providerId}/availability?${params}`);
  }

  async setProviderAvailability(providerId, availabilityData) {
    return this.request(`/appointments/providers/${providerId}/availability`, {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  }

  async getMatchedProviders() {
    return this.request('/appointments/matched-providers');
  }

  // Waitlist methods
  async joinWaitlist(waitlistData) {
    return this.request('/waitlist/join', {
      method: 'POST',
      body: JSON.stringify(waitlistData),
    });
  }

  async getWaitlistStatus() {
    return this.request('/waitlist/status');
  }

  async updateWaitlistEntry(id, updates) {
    return this.request(`/waitlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async removeFromWaitlist(id) {
    return this.request(`/waitlist/${id}`, {
      method: 'DELETE',
    });
  }

  async getWaitlistPosition(id) {
    return this.request(`/waitlist/${id}/position`);
  }

  async notifyWaitlistPatients(providerId, notificationData) {
    return this.request(`/waitlist/providers/${providerId}/notify`, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiError };