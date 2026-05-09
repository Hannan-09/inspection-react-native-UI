// API Configuration
export const API_CONFIG = {
  // Base URL for API endpoints
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.example.com/v1",

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // API version
  VERSION: "v1",

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
      ME: "/auth/me",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
    },
    INSPECTIONS: {
      LIST: "/inspections",
      DETAIL: "/inspections/:id",
      CREATE: "/inspections",
      UPDATE: "/inspections/:id",
      DELETE: "/inspections/:id",
      SUBMIT: "/inspections/:id/submit",
      STATS: "/inspections/stats",
    },
  },
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_URL: "http://localhost:3000/api/v1",
    DEBUG: true,
  },
  staging: {
    API_URL: "https://staging-api.example.com/v1",
    DEBUG: true,
  },
  production: {
    API_URL: "https://api.example.com/v1",
    DEBUG: false,
  },
};
