import axiosClient from './axiosClient';

export const adminApi = {
  // ─── Platform Dashboard ────────────────────────────────────────────────────
  // Backend: GET /admin/dashboard/stats
  getDashboard: async () => {
    const response = await axiosClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // ─── User Management ───────────────────────────────────────────────────────
  // Backend: GET /admin/users
  getUsers: async (params = {}) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  // Backend: GET /admin/users/:id  (not in backend - use getUsers with filter)
  getUserById: async (id) => {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // Backend: PATCH /admin/users/:id/block  (toggles block status)
  // status param: 'active' | 'suspended' | 'banned'
  updateUserStatus: async (id, _status) => {
    // Backend uses toggle-block, maps to blocked=true/false
    const response = await axiosClient.patch(`/admin/users/${id}/block`, { status: _status });
    return response.data;
  },

  // NOTE: No dedicated DELETE /admin/users/:id on backend.
  // Using block endpoint with 'banned' status as closest equivalent.
  deleteUser: async (id) => {
    const response = await axiosClient.patch(`/admin/users/${id}/block`, { status: 'banned' });
    return response.data;
  },

  // ─── Employer Approvals ────────────────────────────────────────────────────
  // Backend: GET /admin/employers/pending
  getPendingEmployers: async (params = {}) => {
    const response = await axiosClient.get('/admin/employers/pending', { params });
    return response.data;
  },

  // Backend: No GET /admin/employers (all). Fallback to pending list.
  getAllEmployers: async (params = {}) => {
    const response = await axiosClient.get('/admin/employers/pending', { params });
    return response.data;
  },

  // Backend: PATCH /admin/employers/:id/approve
  approveEmployer: async (id) => {
    const response = await axiosClient.patch(`/admin/employers/${id}/approve`);
    return response.data;
  },

  // Backend: PATCH /admin/employers/:id/reject
  rejectEmployer: async (id, reason) => {
    const response = await axiosClient.patch(`/admin/employers/${id}/reject`, { reason });
    return response.data;
  },

  // ─── Job Moderation ────────────────────────────────────────────────────────
  // Backend: GET /admin/jobs
  getAllJobs: async (params = {}) => {
    const response = await axiosClient.get('/admin/jobs', { params });
    return response.data;
  },

  // Backend: PATCH /admin/jobs/:id/moderate  (not /status)
  updateJobStatus: async (id, status) => {
    const response = await axiosClient.patch(`/admin/jobs/${id}/moderate`, { status });
    return response.data;
  },

  // Backend: DELETE /jobs/:id  (shared employer+admin route)
  deleteJob: async (id) => {
    const response = await axiosClient.delete(`/jobs/${id}`);
    return response.data;
  },

  // ─── Reports ───────────────────────────────────────────────────────────────
  // Backend: GET /admin/reports
  getReports: async (params = {}) => {
    const response = await axiosClient.get('/admin/reports', { params });
    return response.data;
  },

  // Backend: PATCH /admin/reports/:id/resolve
  resolveReport: async (id, resolution) => {
    const response = await axiosClient.patch(`/admin/reports/${id}/resolve`, { resolution });
    return response.data;
  },

  // Backend: No dismiss endpoint. Use resolve with 'dismissed' resolution text.
  dismissReport: async (id) => {
    const response = await axiosClient.patch(`/admin/reports/${id}/resolve`, {
      resolution: 'Dismissed — no action required.',
    });
    return response.data;
  },

  // ─── Categories ────────────────────────────────────────────────────────────
  // Backend: GET /public/categories  (public read)
  getCategories: async () => {
    const response = await axiosClient.get('/public/categories');
    return response.data;
  },

  // Backend: POST /admin/categories
  createCategory: async (data) => {
    const response = await axiosClient.post('/admin/categories', data);
    return response.data;
  },

  // Backend: PUT /admin/categories/:id
  updateCategory: async (id, data) => {
    const response = await axiosClient.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  // Backend: DELETE /admin/categories/:id
  deleteCategory: async (id) => {
    const response = await axiosClient.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // ─── Skills ────────────────────────────────────────────────────────────────
  // Backend: GET /public/skills  (public read)
  getSkills: async (params = {}) => {
    const response = await axiosClient.get('/public/skills', { params });
    return response.data;
  },

  // Backend: POST /admin/skills
  createSkill: async (data) => {
    const response = await axiosClient.post('/admin/skills', data);
    return response.data;
  },

  // Backend: PUT /admin/skills/:id
  updateSkill: async (id, data) => {
    const response = await axiosClient.put(`/admin/skills/${id}`, data);
    return response.data;
  },

  // Backend: DELETE /admin/skills/:id
  deleteSkill: async (id) => {
    const response = await axiosClient.delete(`/admin/skills/${id}`);
    return response.data;
  },

  // ─── Platform Settings ─────────────────────────────────────────────────────
  // Backend: GET /admin/settings
  getSettings: async () => {
    const response = await axiosClient.get('/admin/settings');
    return response.data;
  },

  // Backend: PUT /admin/settings
  updateSettings: async (data) => {
    const response = await axiosClient.put('/admin/settings', data);
    return response.data;
  },

  // ─── Analytics ─────────────────────────────────────────────────────────────
  // Backend: GET /admin/dashboard/stats
  getPlatformStats: async (_range = '30d') => {
    const response = await axiosClient.get('/admin/dashboard/stats');
    return response.data;
  },
};

export default adminApi;
