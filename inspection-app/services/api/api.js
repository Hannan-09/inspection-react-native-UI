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
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

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

  async getAuthToken() {
    // TODO: Implement token retrieval from secure storage
    // Example: return await SecureStore.getItemAsync('authToken');
    return null;
  }

  setAuthToken(token) {
    // TODO: Implement token storage
    // Example: await SecureStore.setItemAsync('authToken', token);
  }

  clearAuthToken() {
    // TODO: Implement token removal
    // Example: await SecureStore.deleteItemAsync('authToken');
  }
}

export const apiService = new ApiService();
