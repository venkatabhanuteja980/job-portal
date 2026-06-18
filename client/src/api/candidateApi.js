import axiosClient from './axiosClient';

export const candidateApi = {
  getProfile: async () => {
    const response = await axiosClient.get('/candidates/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosClient.put('/candidates/profile', data);
    return response.data;
  },

  uploadResume: async (formData, onUploadProgress) => {
    const response = await axiosClient.post('/candidates/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress, // Passed progress callback
    });
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await axiosClient.post('/candidates/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await axiosClient.get('/candidates/saved-jobs');
    return response.data;
  },

  saveJob: async (jobId) => {
    const response = await axiosClient.post(`/candidates/saved-jobs/${jobId}`);
    return response.data;
  },

  unsaveJob: async (jobId) => {
    const response = await axiosClient.delete(`/candidates/saved-jobs/${jobId}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await axiosClient.get('/candidates/recommendations');
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosClient.get('/candidates/dashboard');
    return response.data;
  },

  getMyApplications: async () => {
    const response = await axiosClient.get('/applications/my-applications');
    return response.data;
  },

  withdrawApplication: async (id) => {
    const response = await axiosClient.patch(`/applications/${id}/withdraw`);
    return response.data;
  },
};

export default candidateApi;
