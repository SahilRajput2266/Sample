import api from './client';
export const automationApi = {
  profile: () => api.get('/automation/profile'),
  saveProfile: (data) => api.put('/automation/profile', data),
  stats: () => api.get('/automation/stats'),
  runs: (params) => api.get('/automation/runs', { params }),
  run: (id) => api.get(`/automation/runs/${id}`),
  create: (data) => api.post('/automation/runs', data),
  action: (id, action, data = {}) => api.post(`/automation/runs/${id}/${action}`, data),
  review: (id) => api.get(`/automation/runs/${id}/review`),
  steps: (id) => api.get(`/automation/runs/${id}/steps`),
  screenshots: (id) => api.get(`/automation/runs/${id}/screenshots`),
  answers: () => api.get('/automation/answers'),
  saveAnswer: (data) => api.post('/automation/answers', data),
  updateAnswer: (id, data) => api.put(`/automation/answers/${id}`, data),
  deleteAnswer: (id) => api.delete(`/automation/answers/${id}`),
};