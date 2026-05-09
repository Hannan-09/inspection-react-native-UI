// Validation utilities

export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
  password: (value) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(value);
  },

  // Phone number validation
  phone: (value) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(value) && value.replace(/\D/g, "").length >= 10;
  },

  // Required field validation
  required: (value) => {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Minimum length validation
  minLength: (value, min) => {
    return value.length >= min;
  },

  // Maximum length validation
  maxLength: (value, max) => {
    return value.length <= max;
  },

  // Number validation
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // URL validation
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
};

// Validation error messages
export const validationMessages = {
  email: "Please enter a valid email address",
  password:
    "Password must be at least 8 characters with uppercase, lowercase, and number",
  phone: "Please enter a valid phone number",
  required: "This field is required",
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be no more than ${max} characters`,
  number: "Please enter a valid number",
  url: "Please enter a valid URL",
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    for (const rule of fieldRules) {
      if (rule.validator && !rule.validator(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
