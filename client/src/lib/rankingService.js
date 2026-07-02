import api from './api';

export const rankingService = {
  getLeaderboard: async (jobId) => {
    const response = await api.get(`/rankings/job/${jobId}`);
    return response.data;
  },

  triggerRanking: async (jobId) => {
    const response = await api.post(`/rankings/trigger/${jobId}`);
    return response.data;
  },

  compareCandidates: async (ids) => {
    const response = await api.get('/rankings/compare', { params: { ids } });
    return response.data;
  }
};
