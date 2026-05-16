import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "../../config/api.config";

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    // Only set Content-Type to application/json if not sending FormData
    if (!(options.body instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  async postMultipart(endpoint, formData) {
    return this.request(endpoint, {
      method: "POST",
      body: formData,
    });
  }

  async putMultipart(endpoint, formData) {
    return this.request(endpoint, {
      method: "PUT",
      body: formData,
    });
  }

  async handleError(response) {
    const error = new Error();
    error.status = response.status;

    try {
      const data = await response.json();
      error.message = data.message || response.statusText;
      error.data = data;
    } catch {
      error.message = response.statusText;
    }

    return error;
  }

  // ── Token Management ──────────────────────────────────────────────────────

  async getAuthToken() {
    try {
      return await SecureStore.getItemAsync("authToken");
    } catch {
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      await SecureStore.setItemAsync("authToken", token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  async clearAuthToken() {
    try {
      await SecureStore.deleteItemAsync("authToken");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  }

  // ── User Data (cached locally for offline display) ─────────────────────

  async setUserData(user) {
    try {
      await SecureStore.setItemAsync("userData", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  async getUserData() {
    try {
      const raw = await SecureStore.getItemAsync("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async clearUserData() {
    try {
      await SecureStore.deleteItemAsync("userData");
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  }

  // Convenience: check if user is logged in
  async isAuthenticated() {
    const token = await this.getAuthToken();
    return !!token;
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────

  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync("refreshToken");
    } catch {
      return null;
    }
  }

  async setRefreshToken(token) {
    try {
      await SecureStore.setItemAsync("refreshToken", token);
    } catch (error) {
      console.error("Error saving refresh token:", error);
    }
  }

  async clearRefreshToken() {
    try {
      await SecureStore.deleteItemAsync("refreshToken");
    } catch (error) {
      console.error("Error clearing refresh token:", error);
    }
  }

  // ── Clear All (logout helper) ─────────────────────────────────────────────

  async clearAll() {
    await Promise.all([
      this.clearAuthToken(),
      this.clearRefreshToken(),
      this.clearUserData(),
    ]);
  }
}

export const apiService = new ApiService();
