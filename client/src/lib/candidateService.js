import api from './api';

export const candidateService = {
  getAllCandidates: async () => {
    const response = await api.get(`/candidates`);
    return response.data;
  },
  
  getCandidatesByJob: async (jobId) => {
    const response = await api.get(`/candidates/job/${jobId}`);
    return response.data;
  },
  
  getCandidateById: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/candidates/${id}/status`, { status });
    return response.data;
  },
  
  updateNotes: async (id, notes) => {
    const response = await api.patch(`/candidates/${id}/notes`, { notes });
    return response.data;
  }
};
