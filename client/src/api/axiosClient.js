import axios from 'axios';
import { store } from '../store';
import { loginSuccess, logoutSuccess } from '../store/authSlice';

const apiBaseURL = import.meta.env.VITE_API_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for automatic cookie transfer (refreshToken cookie)
});

// Request Interceptor: Attach the access token if available in the Redux store
axiosClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 errors, attempt silent token refresh, and retry
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite retry loop or retry on auth endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      
      try {
        // Request a new access token via refresh-token endpoint
        // Using a fresh axios request to avoid global interceptor conflicts
        const refreshResponse = await axios.post(`${apiBaseURL}/auth/refresh-token`, {}, {
          withCredentials: true,
        });
        
        const { accessToken, user } = refreshResponse.data.data;
        
        // Update Redux state with new credentials
        store.dispatch(loginSuccess({ accessToken, user }));
        
        // Re-run the failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired, revoked, etc.), log user out
        store.dispatch(logoutSuccess());
        return Promise.reject(refreshError);
      }
    }
    
    // Format error response to consistent format
    const formattedError = {
      message: error.response?.data?.message || 'Something went wrong',
      errors: error.response?.data?.errors || null,
      status: error.response?.status || 500,
    };
    
    return Promise.reject(formattedError);
  }
);

export default axiosClient;
