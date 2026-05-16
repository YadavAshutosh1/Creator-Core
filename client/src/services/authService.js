import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth';

/**
 * Authentication Service
 * Handles user sessions and JWT tokens
 */
class AuthService {
  async register(userData) {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('creator-user', JSON.stringify(response.data.user));
      localStorage.setItem('creator-token', response.data.token);
    }
    return response.data;
  }

  async login(userData) {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
      localStorage.setItem('creator-user', JSON.stringify(response.data.user));
      localStorage.setItem('creator-token', response.data.token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('creator-user');
    localStorage.removeItem('creator-token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('creator-user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('creator-token');
  }

  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();
