import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },
  
  // Backend: POST /auth/verify-email  (body: { token })
  verifyEmail: async (token) => {
    const response = await axiosClient.post('/auth/verify-email', { token });
    return response.data;
  },
  
  resendVerification: async (email) => {
    const response = await axiosClient.post('/auth/resend-verification', { email });
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await axiosClient.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
  
  // Backend: PUT /auth/change-password
  changePassword: async (passwords) => {
    const response = await axiosClient.put('/auth/change-password', passwords);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};

export default authApi;
