import axiosClient from './axiosClient';

export const jobApi = {
  getJobs: async (params = {}) => {
    // Construct query parameters string dynamically
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const response = await axiosClient.get(`/jobs?${query.toString()}`);
    return response.data;
  },

  getJobDetails: async (id) => {
    const response = await axiosClient.get(`/jobs/${id}`);
    return response.data;
  },

  applyForJob: async (applicationData) => {
    const response = await axiosClient.post('/applications', applicationData);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await axiosClient.get('/candidates/recommendations');
    return response.data;
  },
};

export default jobApi;
