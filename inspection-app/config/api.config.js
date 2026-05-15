// API Configuration
// Base URL is read from the .env file: EXPO_PUBLIC_API_URL
// Example: http://192.168.0.168:8103

export const API_CONFIG = {
  // Base URL — set EXPO_PUBLIC_API_URL in your .env file
  BASE_URL: process.env.EXPO_PUBLIC_API_URL,

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // API version (appended to BASE_URL for versioned routes if needed)
  VERSION: "v1",

  // Endpoint paths (relative to BASE_URL)
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/v1/website/auth/inspector/login",
      LOGOUT: "/api/auth/logout",
      REFRESH: "/api/auth/refresh",
      ME: "/api/auth/me",
      FORGOT_PASSWORD: "/api/auth/forgot-password",
      RESET_PASSWORD: "/api/auth/reset-password",
      PROFILE: "/api/v1/website/vehicle/inspector/profile",
      UPDATE_PROFILE: "/api/v1/website/vehicle/inspector/profile",
      STATES: "/api/v1/website/util/address/states/101",
      CITIES: "/api/v1/website/util/address/cities/:stateId",
    },
    INSPECTIONS: {
      LIST: "/api/inspections",
      DETAIL: "/api/inspections/:id",
      CREATE: "/api/inspections",
      UPDATE: "/api/inspections/:id",
      DELETE: "/api/inspections/:id",
      SUBMIT: "/api/inspections/:id/submit",
      STATS: "/api/inspections/stats",
      ASSIGNED_LIST: "/api/v1/website/vehicle/inspector/assigned-inspections",
      ASSIGNED_DETAILS: "/api/v1/website/vehicle/inspector/assigned-inspections/:id",
      ACCEPT: "/api/v1/website/vehicle/inspector/assigned-inspections/:id/accept",
      REJECT: "/api/v1/website/vehicle/inspector/assigned-inspections/:id/reject",
    },
  },
};

// Environment-specific overrides (optional)
export const ENV_CONFIG = {
  development: {
    API_URL: "http://192.168.0.168:8103",
    DEBUG: true,
  },
  staging: {
    API_URL: "http://192.168.0.168:8103",
    DEBUG: true,
  },
  production: {
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    DEBUG: false,
  },
};

// Current environment
export const CURRENT_ENV = process.env.EXPO_PUBLIC_ENV || "development";

// Resolved base URL (use this anywhere you need the base URL directly)
export const BASE_URL = API_CONFIG.BASE_URL;
