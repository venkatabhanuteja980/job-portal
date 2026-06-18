import axiosClient from './axiosClient';

export const employerApi = {
  // Dashboard Analytics
  getDashboard: async () => {
    const response = await axiosClient.get('/employers/dashboard');
    return response.data;
  },

  // Employer Profile
  getProfile: async () => {
    const response = await axiosClient.get('/employers/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosClient.put('/employers/profile', data);
    return response.data;
  },

  // Company Details
  getCompany: async () => {
    const response = await axiosClient.get('/employers/company');
    return response.data;
  },

  createCompany: async (data) => {
    const response = await axiosClient.post('/employers/company', data);
    return response.data;
  },

  updateCompany: async (data) => {
    const response = await axiosClient.put('/employers/company', data);
    return response.data;
  },

  uploadLogo: async (formData) => {
    const response = await axiosClient.post('/employers/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Job Postings Management
  getMyJobs: async () => {
    const response = await axiosClient.get('/jobs/my-jobs/all');
    return response.data;
  },

  createJob: async (data) => {
    const response = await axiosClient.post('/jobs', data);
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await axiosClient.put(`/jobs/${id}`, data);
    return response.data;
  },

  updateJobStatus: async (id, status) => {
    const response = await axiosClient.patch(`/jobs/${id}/status`, { status });
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await axiosClient.delete(`/jobs/${id}`);
    return response.data;
  },

  // Applicant & Pipeline Management
  getJobApplicants: async (jobId) => {
    const response = await axiosClient.get(`/applications/job/${jobId}`);
    return response.data;
  },

  updateApplicationStatus: async (id, status, note = '') => {
    const response = await axiosClient.patch(`/applications/${id}/status`, { status, note });
    return response.data;
  },

  scheduleInterview: async (id, interviewData) => {
    const response = await axiosClient.post(`/applications/${id}/interview`, interviewData);
    return response.data;
  },
};

export default employerApi;
