import { apiService } from "./api";

class AuthAPI {
  // Login
  async login(email, password) {
    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      if (response.token) {
        await apiService.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await apiService.post("/auth/register", userData);

      if (response.token) {
        await apiService.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await apiService.post("/auth/logout");
      await apiService.clearAuthToken();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Clear token even if API call fails
      await apiService.clearAuthToken();
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiService.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
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
}

export const authAPI = new AuthAPI();
