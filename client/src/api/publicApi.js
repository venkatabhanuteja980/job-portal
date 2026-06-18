import axiosClient from './axiosClient';

export const publicApi = {
  getCompanies: async () => {
    const response = await axiosClient.get('/public/companies');
    return response.data;
  },

  getCompanyDetails: async (identifier) => {
    const response = await axiosClient.get(`/public/companies/${identifier}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosClient.get('/public/categories');
    return response.data;
  },

  getSkills: async () => {
    const response = await axiosClient.get('/public/skills');
    return response.data;
  },

  getPlatformStats: async () => {
    const response = await axiosClient.get('/public/stats');
    return response.data;
  },
};

export default publicApi;
