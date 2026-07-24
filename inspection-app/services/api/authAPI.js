import { apiService } from "./api";
import { API_CONFIG } from "../../config/api.config";

class AuthAPI {
  // Login — parses: response.data.accessToken + refreshToken + inspectorId + username
  async login(username, password) {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });
      console.log("login endpoint",API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log("login",response);

      // Actual response shape:
      // { status, statusCode, message, data: { accessToken, refreshToken, inspectorId, username } }
      const tokenData = response.data;

      if (tokenData?.accessToken) {
        await apiService.setAuthToken(tokenData.accessToken);
      }

      if (tokenData?.refreshToken) {
        await apiService.setRefreshToken(tokenData.refreshToken);
      }

      // Store inspector profile for offline display
      if (tokenData) {
        await apiService.setUserData({
          inspectorId: tokenData.inspectorId,
          username: tokenData.username,
        });
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout — clears access token, refresh token, and user data
  async logout() {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Clear locally even if the API call fails
    } finally {
      await apiService.clearAll();
    }
    return true;
  }

  // Get current user (inspector profile) from API
  async getCurrentUser() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      const profile = response.data;
      // Refresh cached user data
      if (profile) {
        await apiService.setUserData(profile);
      }
      return profile;
    } catch (error) {
      console.error("Error fetching current user:", error);
      // Fall back to locally cached data
      return await apiService.getUserData();
    }
  }

  // Explicit alias for fetching profile
  async getProfile() {
    return this.getCurrentUser();
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiService.post("/auth/refresh");

      if (response.token) {
        await apiService.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post("/auth/forgot-password", {
        email,
      });
      return response;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }
  // Update inspector profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
      if (response.data) {
        await apiService.setUserData(response.data);
      }
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Send FCM Token
  async sendFCMToken(token) {
    console.log("FCM api call");
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.FCM, { token });
      console.log("FCM api call response : ", response);
      return response;
    } catch (error) {
      console.error("Send FCM token error:", error);
      throw error;
    }
  }

  // Send Device Info
  async sendDeviceInfo(deviceInfo) {
    try {
      const response = await apiService.post("/api/v1/website/users/profile/device-info", deviceInfo);
      return response;
    } catch (error) {
      console.error("Send device info error:", error);
      throw error;
    }
  }

  // Address Utilities
  async getStates() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.STATES);
      return response.data || response;
    } catch (error) {
      console.error("Get states error:", error);
      throw error;
    }
  }

  async getCities(stateId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.AUTH.CITIES.replace(":stateId", stateId);
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Get cities error:", error);
      throw error;
    }
  }
}

export const authAPI = new AuthAPI();
