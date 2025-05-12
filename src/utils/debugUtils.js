// Debug utilities for monitoring component state changes and API calls

// Enable or disable debug mode
const DEBUG = true;

/**
 * Log component render
 * @param {string} componentName - Name of the component
 * @param {Object} props - Component props
 */
export const logRender = (componentName, props = {}) => {
  if (!DEBUG) return;
  console.log(`[${componentName}] Rendering with props:`, Object.keys(props));
};

/**
 * Log state change
 * @param {string} componentName - Name of the component
 * @param {string} stateName - Name of the state variable
 * @param {any} prevValue - Previous value
 * @param {any} newValue - New value
 */
export const logStateChange = (componentName, stateName, prevValue, newValue) => {
  if (!DEBUG) return;
  console.log(`[${componentName}] State change - ${stateName}:`, { prev: prevValue, new: newValue });
};

/**
 * Log effect execution
 * @param {string} componentName - Name of the component
 * @param {Array} dependencies - Effect dependencies
 */
export const logEffect = (componentName, effectName = 'useEffect', dependencies = []) => {
  if (!DEBUG) return;
  console.log(`[${componentName}] ${effectName} running with dependencies:`, dependencies);
};

/**
 * Debug fetch - wrapper for fetch that logs requests and responses
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const debugFetch = async (url, options = {}) => {
  if (!DEBUG) return fetch(url, options);
  
  console.log(`[API] Fetching ${options.method || 'GET'} ${url}`, { 
    headers: options.headers,
    body: options.body ? JSON.parse(options.body) : undefined
  });
  
  try {
    const startTime = performance.now();
    const response = await fetch(url, options);
    const endTime = performance.now();
    
    console.log(`[API] Response from ${url} (${Math.round(endTime - startTime)}ms):`, { 
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    // Clone the response so we can log its contents without consuming it
    const clonedResponse = response.clone();
    
    try {
      // Try to parse as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await clonedResponse.json();
        console.log(`[API] JSON response data:`, data);
      } else {
        // Log as text if not JSON
        const text = await clonedResponse.text();
        console.log(`[API] Text response (first 500 chars):`, text.substring(0, 500));
      }
    } catch (e) {
      console.log(`[API] Error parsing response:`, e);
    }
    
    return response;
  } catch (error) {
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
};

/**
 * Create a debuggable hook for useEffect
 * @param {Function} effect - Effect function
 * @param {Array} dependencies - Effect dependencies
 * @param {string} componentName - Name of the component
 * @param {string} effectName - Name of the effect
 * @returns {Function} - useEffect hook
 */
export const createDebugEffect = (effect, dependencies, componentName, effectName = 'effect') => {
  return () => {
    if (DEBUG) {
      console.log(`[${componentName}] ${effectName} running with dependencies:`, dependencies);
    }
    return effect();
  };
};

export default {
  logRender,
  logStateChange,
  logEffect,
  debugFetch,
  createDebugEffect
};