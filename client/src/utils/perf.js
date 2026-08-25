/**
 * Debounces a function call by waiting for a specified timeout of inactivity.
 * Useful for search inputs, auto-saves, etc.
 * @param {Function} func The function to debounce.
 * @param {number} wait Timeout in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call so it is invoked at most once per specified duration.
 * Useful for scroll handlers, window resize handlers, rate-limiting user button clicks.
 * @param {Function} func The function to throttle.
 * @param {number} limit The throttling limit in milliseconds.
 * @returns {Function} The throttled function.
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
