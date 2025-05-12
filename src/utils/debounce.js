/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to invoke the function on the leading edge instead of trailing
 * @returns {Function} - The debounced function
 */
const debounce = (func, wait = 300, immediate = false) => {
  let timeout;
  
  return function(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
};

/**
 * Creates a throttled function that only invokes the provided function at most
 * once per every specified wait period.
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to wait between invocations
 * @returns {Function} - The throttled function
 */
const throttle = (func, wait = 300) => {
  let timeout = null;
  let lastCall = 0;
  
  return function(...args) {
    const context = this;
    const now = Date.now();
    
    if (now - lastCall >= wait) {
      lastCall = now;
      func.apply(context, args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = now;
        func.apply(context, args);
      }, wait - (now - lastCall));
    }
  };
};

export { debounce, throttle };