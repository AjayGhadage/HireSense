import api from './api';

export const resumeService = {
  uploadResumes: async (jobId, files) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    files.forEach(file => {
      formData.append('resumes', file);
    });

    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getAllResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },
  
  getResumesByJob: async (jobId) => {
    const response = await api.get(`/resumes/job/${jobId}`);
    return response.data;
  },
  
  getResumeById: async (id) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },
  
  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  }
};
