import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
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
      const requestTimeout = options.timeout || this.timeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 && !options._retry && endpoint !== API_CONFIG.ENDPOINTS.AUTH.REFRESH && endpoint !== API_CONFIG.ENDPOINTS.AUTH.LOGIN) {
          const refreshToken = await this.getRefreshToken();
          if (refreshToken) {
            try {
              const refreshUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`;
              // Try refreshing token. Usually passed as query param or in body depending on backend.
              // We'll pass it in header and body just in case, but typically the backend reads a Bearer token or a specific body field.
              const refreshResponse = await fetch(refreshUrl, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${refreshToken}`
                },
                body: JSON.stringify({ refreshToken })
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                // The new token is typically in data.accessToken or directly in accessToken
                const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
                const newRefreshToken = refreshData.data?.refreshToken || refreshData.refreshToken;

                if (newAccessToken) {
                  await this.setAuthToken(newAccessToken);
                  if (newRefreshToken) await this.setRefreshToken(newRefreshToken);

                  // Retry original request
                  const retryConfig = { ...config, _retry: true };
                  retryConfig.headers["Authorization"] = `Bearer ${newAccessToken}`;
                  
                  const retryController = new AbortController();
                  const retryTimeoutId = setTimeout(() => retryController.abort(), requestTimeout);
                  const retryResponse = await fetch(url, { ...retryConfig, signal: retryController.signal });
                  clearTimeout(retryTimeoutId);

                  if (!retryResponse.ok) throw await this.handleError(retryResponse);
                  return await retryResponse.json();
                }
              } else {
                // If refresh fails, clear tokens
                await this.clearAll();
              }
            } catch (refreshErr) {
              console.error("Token refresh failed", refreshErr);
              await this.clearAll();
            }
          } else {
             // No refresh token available
             await this.clearAll();
          }
        }
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

  async postMultipart(endpoint, formData, customOptions = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: formData,
      timeout: 300000, // 5 minutes timeout for uploads
      ...customOptions
    });
  }

  async putMultipart(endpoint, formData, customOptions = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: formData,
      timeout: 300000, // 5 minutes timeout for uploads
      ...customOptions
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

  // ── Helper ──────────────────────────────────────────────────────────────

  async _getItem(key) {
    if (Platform.OS === "web") return await AsyncStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  }

  async _setItem(key, value) {
    if (Platform.OS === "web") await AsyncStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  }

  async _removeItem(key) {
    if (Platform.OS === "web") await AsyncStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  }

  // ── Token Management ──────────────────────────────────────────────────────

  async getAuthToken() {
    try {
      return await this._getItem("authToken");
    } catch {
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      await this._setItem("authToken", token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  async clearAuthToken() {
    try {
      await this._removeItem("authToken");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  }

  // ── User Data (cached locally for offline display) ─────────────────────

  async setUserData(user) {
    try {
      await this._setItem("userData", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  async getUserData() {
    try {
      const raw = await this._getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async clearUserData() {
    try {
      await this._removeItem("userData");
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
      return await this._getItem("refreshToken");
    } catch {
      return null;
    }
  }

  async setRefreshToken(token) {
    try {
      await this._setItem("refreshToken", token);
    } catch (error) {
      console.error("Error saving refresh token:", error);
    }
  }

  async clearRefreshToken() {
    try {
      await this._removeItem("refreshToken");
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
