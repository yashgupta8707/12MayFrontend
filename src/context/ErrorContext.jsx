// context/ErrorContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkApiHealth, ERROR_TYPES } from '../services/ErrorHandlingService';

// Create context
const ErrorContext = createContext();

// Provider component
export const ErrorProvider = ({ children }) => {
  // State for app status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [errors, setErrors] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkApiStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setApiAvailable(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Custom offline event from our error handling
    window.addEventListener('app:offline', () => {
      setApiAvailable(false);
      startPolling();
    });
    
    // Check API status on mount
    checkApiStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('app:offline', () => {
        setApiAvailable(false);
        startPolling();
      });
    };
  }, []);
  
  // Check API health
  const checkApiStatus = async () => {
    const isHealthy = await checkApiHealth();
    setApiAvailable(isHealthy);
    return isHealthy;
  };
  
  // Start polling for API availability
  const startPolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    const poll = async () => {
      if (!isOnline) {
        return;
      }
      
      const isHealthy = await checkApiStatus();
      
      if (isHealthy) {
        setIsPolling(false);
        window.dispatchEvent(new CustomEvent('app:online'));
      } else {
        // Continue polling
        setTimeout(poll, 5000);
      }
    };
    
    poll();
  };
  
  // Add error to the log
  const addError = (error) => {
    setErrors((prev) => [error, ...prev].slice(0, 50)); // Keep last 50 errors
  };
  
  // Clear all errors
  const clearErrors = () => {
    setErrors([]);
  };
  
  // Clear a specific error
  const clearError = (errorId) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  };
  
  // Context value
  const contextValue = {
    // Status
    isOnline,
    apiAvailable,
    isPolling,
    
    // Loading state
    globalLoading,
    setGlobalLoading,
    
    // Error management
    errors,
    addError,
    clearErrors,
    clearError,
    
    // Actions
    checkApiStatus,
    startPolling,
  };
  
  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Render offline notification if offline */}
      {(!isOnline || !apiAvailable) && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center z-50">
          {!isOnline ? (
            <span>You are offline. Please check your internet connection.</span>
          ) : (
            <span>Server unavailable. Trying to reconnect...</span>
          )}
        </div>
      )}
      {/* Global loading overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

// Custom hook for using the context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;