import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/animations.css";
import { getAccessToken } from "./services/tokenStore";
import { refreshAccessToken } from "./services/authService";

// Override global window.fetch to automatically include headers and handle token refreshing
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const isApiCall = typeof url === 'string' && (url.startsWith('/api') || url.includes('localhost:5000/api') || url.includes(apiUrl));

  if (isApiCall) {
    options.headers = options.headers || {};
    const headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
    
    // Always include credentials (cookies) in fetch
    options.credentials = options.credentials || 'include';

    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (options.headers instanceof Headers) {
      options.headers = headers;
    } else {
      options.headers = Object.fromEntries(headers.entries());
    }

    try {
      const response = await originalFetch(url, options);

      // Handle 401 Unauthorized transparently by refreshing access token
      if (response.status === 401 && !url.includes('/auth/refresh')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const retryHeaders = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          if (options.headers instanceof Headers) {
            options.headers = retryHeaders;
          } else {
            options.headers = Object.fromEntries(retryHeaders.entries());
          }
          return originalFetch(url, options);
        } else {
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  return originalFetch(url, options);
};

// Initialize application: attempt silent token refresh if session exists
const initApp = async () => {
  if (localStorage.getItem('user')) {
    try {
      await refreshAccessToken();
    } catch (e) {
      console.warn("Silent refresh failed on initialization:", e);
    }
  }
  
  createRoot(document.getElementById("root")).render(<App />);
};

initApp();
