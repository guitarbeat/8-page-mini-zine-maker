// Modern utility functions for the PDF Zine Maker

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
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
 * Check if a value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a number
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!isNumber(bytes)) {return '0 B';}

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Create a promise that resolves after a delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe DOM element getter with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (defaults to document)
 * @returns {Element|null} Found element or null
 */
export function $(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safe DOM elements getter with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (defaults to document)
 * @returns {NodeList} Found elements
 */
export function $$(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Check if an element has a CSS class
 * @param {Element} element - DOM element
 * @param {string} className - CSS class name
 * @returns {boolean} True if element has the class
 */
export function hasClass(element, className) {
  return element?.classList?.contains(className) ?? false;
}

/**
 * Add CSS class to element
 * @param {Element} element - DOM element
 * @param {string} className - CSS class name
 */
export function addClass(element, className) {
  element?.classList?.add(className);
}

/**
 * Remove CSS class from element
 * @param {Element} element - DOM element
 * @param {string} className - CSS class name
 */
export function removeClass(element, className) {
  element?.classList?.remove(className);
}

/**
 * Toggle CSS class on element
 * @param {Element} element - DOM element
 * @param {string} className - CSS class name
 */
export function toggleClass(element, className) {
  element?.classList?.toggle(className);
}