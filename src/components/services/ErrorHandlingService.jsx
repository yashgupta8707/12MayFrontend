// services/ErrorHandlingService.js
import { toast } from "react-toastify";

// Constants for API endpoints
const API_BASE_URL = "https://server12may.onrender.com/api";
const ENDPOINTS = {
  QUOTATIONS: `${API_BASE_URL}/quotations`,
  PARTIES: `${API_BASE_URL}/parties`,
  COMPONENTS: `${API_BASE_URL}/components`,
};

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  SERVER: "SERVER_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  AUTH: "AUTHENTICATION_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// Error severity levels
export const ERROR_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

// Custom error class with additional properties
export class AppError extends Error {
  constructor(
    message,
    type = ERROR_TYPES.UNKNOWN,
    severity = ERROR_SEVERITY.ERROR,
    originalError = null
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.severity = severity;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

// Configuration for retry attempts
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  BACKOFF_FACTOR: 1.5, // Exponential backoff
};

// Retry a function with exponential backoff
export const retryWithBackoff = async (
  fn,
  retries = RETRY_CONFIG.MAX_RETRIES,
  delay = RETRY_CONFIG.RETRY_DELAY,
  backoffFactor = RETRY_CONFIG.BACKOFF_FACTOR
) => {
  try {
    return await fn();
  } catch (error) {
    // If we have no retries left, throw the error
    if (retries <= 0) {
      throw error;
    }

    console.log(`Retrying after ${delay}ms, ${retries} retries left`);

    // Wait for the specified delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry with one less retry and increased delay (exponential backoff)
    return retryWithBackoff(
      fn,
      retries - 1,
      delay * backoffFactor,
      backoffFactor
    );
  }
};

// Enhanced fetch with retry, timeout, and error handling
export const enhancedFetch = async (url, options = {}, retryConfig = {}) => {
  const {
    maxRetries = RETRY_CONFIG.MAX_RETRIES,
    retryDelay = RETRY_CONFIG.RETRY_DELAY,
    backoffFactor = RETRY_CONFIG.BACKOFF_FACTOR,
    timeout = 30000, // 30 seconds default timeout
  } = retryConfig;

  // Create an AbortController for the timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Add the signal to the options
    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };

    // Use retry with backoff for the fetch call
    const response = await retryWithBackoff(
      async () => {
        const resp = await fetch(url, fetchOptions);

        // If the response is not OK, throw an error
        if (!resp.ok) {
          // Try to get more details from the response
          let errorDetails;
          try {
            errorDetails = await resp.json();
          } catch (e) {
            errorDetails = await resp.text();
          }

          const error = new Error(`Request failed with status ${resp.status}`);
          error.status = resp.status;
          error.details = errorDetails;
          throw error;
        }

        return resp;
      },
      maxRetries,
      retryDelay,
      backoffFactor
    );

    // Parse the response based on content type
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    // Categorize the error
    let appError;

    if (error.name === "AbortError") {
      appError = new AppError(
        "Request timed out. The server took too long to respond.",
        ERROR_TYPES.NETWORK,
        ERROR_SEVERITY.WARNING,
        error
      );
    } else if (!navigator.onLine) {
      appError = new AppError(
        "You are offline. Please check your internet connection.",
        ERROR_TYPES.NETWORK,
        ERROR_SEVERITY.WARNING,
        error
      );
    } else if (error.message.includes("Failed to fetch")) {
      appError = new AppError(
        "Network error. Unable to connect to the server.",
        ERROR_TYPES.NETWORK,
        ERROR_SEVERITY.ERROR,
        error
      );
    } else if (error.status) {
      // Handle different HTTP error statuses
      switch (error.status) {
        case 400:
          appError = new AppError(
            "Invalid request. Please check your data and try again.",
            ERROR_TYPES.VALIDATION,
            ERROR_SEVERITY.WARNING,
            error
          );
          break;
        case 401:
        case 403:
          appError = new AppError(
            "Authentication error. Please log in again.",
            ERROR_TYPES.AUTH,
            ERROR_SEVERITY.WARNING,
            error
          );
          break;
        case 404:
          appError = new AppError(
            "Resource not found. The requested data may have been deleted.",
            ERROR_TYPES.SERVER,
            ERROR_SEVERITY.WARNING,
            error
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          appError = new AppError(
            "Server error. Please try again later.",
            ERROR_TYPES.SERVER,
            ERROR_SEVERITY.ERROR,
            error
          );
          break;
        default:
          appError = new AppError(
            `Request failed with status ${error.status}.`,
            ERROR_TYPES.UNKNOWN,
            ERROR_SEVERITY.ERROR,
            error
          );
      }
    } else {
      appError = new AppError(
        error.message || "An unknown error occurred.",
        ERROR_TYPES.UNKNOWN,
        ERROR_SEVERITY.ERROR,
        error
      );
    }

    // Log the error for debugging
    console.error("Enhanced fetch error:", {
      url,
      error: appError,
      original: error,
    });

    // Re-throw the categorized error
    throw appError;
  } finally {
    // Clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
};

// Error handler for async functions
export const asyncErrorHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Check if it's already an AppError, if not wrap it
      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              error.message || "An unexpected error occurred.",
              ERROR_TYPES.UNKNOWN,
              ERROR_SEVERITY.ERROR,
              error
            );

      // Handle the error based on severity
      handleError(appError);

      // Re-throw for component-level handling if needed
      throw appError;
    }
  };
};

// Central error handling function
export const handleError = (error) => {
  // Log all errors
  logError(error);

  // Notify the user based on severity
  notifyUser(error);

  // Additional actions based on error type
  switch (error.type) {
    case ERROR_TYPES.NETWORK:
      // Maybe trigger offline mode
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:offline", { detail: error }));
      }
      break;
    case ERROR_TYPES.AUTH:
      // Maybe redirect to login
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("app:auth:required", { detail: error })
        );
      }
      break;
    // Add more specific handlers as needed
  }
};

// Error logging function
export const logError = (error) => {
  // Log to console for development
  console.error("Application Error:", error);

  // In production, you could send to a logging service
  if (process.env.NODE_ENV === "production") {
    // Example: send to a logging endpoint
    try {
      const logData = {
        message: error.message,
        type: error.type,
        severity: error.severity,
        timestamp: error.timestamp,
        stack: error.stack,
        originalError: error.originalError
          ? {
              message: error.originalError.message,
              stack: error.originalError.stack,
            }
          : null,
      };

      // This could be an API call to your logging service
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData),
      // });
    } catch (e) {
      // Fail silently - we don't want errors in error handling
      console.error("Failed to log error to server:", e);
    }
  }
};

// User notification function
export const notifyUser = (error) => {
  // Use different notification styles based on severity
  switch (error.severity) {
    case ERROR_SEVERITY.INFO:
      toast.info(error.message);
      break;
    case ERROR_SEVERITY.WARNING:
      toast.warning(error.message);
      break;
    case ERROR_SEVERITY.ERROR:
      toast.error(error.message);
      break;
    case ERROR_SEVERITY.CRITICAL:
      toast.error(error.message, {
        autoClose: false,
        closeOnClick: false,
      });
      break;
    default:
      toast.error(error.message);
  }
};

// Function to check API health
export const checkApiHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    return false;
  }
};

// Generic API service with error handling
export const apiService = {
  // GET request
  get: async (endpoint, options = {}) => {
    try {
      return await enhancedFetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        ...options,
      });
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (endpoint, data, options = {}) => {
    try {
      return await enhancedFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (endpoint, data, options = {}) => {
    try {
      return await enhancedFetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (endpoint, options = {}) => {
    try {
      return await enhancedFetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        ...options,
      });
    } catch (error) {
      throw error;
    }
  },
};

// Export API endpoints for use elsewhere
export const API = {
  ENDPOINTS,
  QUOTATIONS: {
    getAll: () => apiService.get(ENDPOINTS.QUOTATIONS),
    getById: (id) => apiService.get(`${ENDPOINTS.QUOTATIONS}/${id}`),
    getByParty: (partyId) =>
      apiService.get(`${ENDPOINTS.QUOTATIONS}/party/${partyId}`),
    create: (data) => apiService.post(ENDPOINTS.QUOTATIONS, data),
    update: (id, data) => apiService.put(`${ENDPOINTS.QUOTATIONS}/${id}`, data),
    delete: (id) => apiService.delete(`${ENDPOINTS.QUOTATIONS}/${id}`),
    createRevision: (id, data) =>
      apiService.post(`${ENDPOINTS.QUOTATIONS}/${id}/revisions`, data),
    getRevisions: (id) =>
      apiService.get(`${ENDPOINTS.QUOTATIONS}/${id}/revisions`),
  },
  PARTIES: {
    getAll: () => apiService.get(ENDPOINTS.PARTIES),
    getById: (id) => apiService.get(`${ENDPOINTS.PARTIES}/${id}`),
    create: (data) => apiService.post(ENDPOINTS.PARTIES, data),
    update: (id, data) => apiService.put(`${ENDPOINTS.PARTIES}/${id}`, data),
    delete: (id) => apiService.delete(`${ENDPOINTS.PARTIES}/${id}`),
  },
  COMPONENTS: {
    getAll: () => apiService.get(ENDPOINTS.COMPONENTS),
  },
};

export default {
  API,
  ERROR_TYPES,
  ERROR_SEVERITY,
  AppError,
  retryWithBackoff,
  enhancedFetch,
  asyncErrorHandler,
  handleError,
  apiService,
  checkApiHealth,
};
