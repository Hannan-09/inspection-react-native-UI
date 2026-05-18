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
      REFRESH: "/api/v1/website/auth/refresh",
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
      START: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/start",
      SECTION_ENGINE: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/engine",
      SECTION_EV_BATTERY: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/ev-battery",
      SECTION_MECHANICAL: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/mechanical",
      SECTION_EXTERIOR_PANELS: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/exterior-panels",
      SECTION_GLASS_EXTERIOR: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/glass-exterior",
      SECTION_INTERIOR_CABIN: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/interior-cabin",
      SECTION_STRUCTURAL_HISTORY: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/structural-history",
      SECTION_TYRES: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/tyres",
      SECTION_OBD: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/obd-diagnostics",
      SECTION_MODIFICATIONS: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/modifications",
      SECTION_MEDIA: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/section/media",
      SUBMIT: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/submit",
      GET_REPORT: "/api/v1/website/vehicle/inspector/inspection/four-wheeler/:id/report",
    },
    INSPECTIONS_2W: {
      START: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/start",
      SECTION_ENGINE: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/engine",
      SECTION_EV_BATTERY: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/ev-battery",
      SECTION_MECHANICAL: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/mechanical",
      SECTION_EXTERIOR_PANELS: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/exterior-panels",
      SECTION_GLASS_EXTERIOR: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/glass-exterior",
      SECTION_COMFORT_ELECTRONICS: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/comfort-electronics",
      SECTION_STRUCTURAL_HISTORY: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/structural-history",
      SECTION_TYRES: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/tyres",
      SECTION_OBD: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/obd-diagnostics",
      SECTION_MODIFICATIONS: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/modifications",
      SECTION_MEDIA: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/section/media",
      SUBMIT: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/submit",
      GET_REPORT: "/api/v1/website/vehicle/inspector/inspection/two-wheeler/:id/report",
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
