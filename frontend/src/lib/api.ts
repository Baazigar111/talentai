import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const authAPI = {
    register: (data: { email: string; password: string; full_name: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
};

export const resumeAPI = {
    upload: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/resume/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    get: (id: number) => api.get(`/resume/${id}`),
    delete: (id: number) => api.delete(`/resume/${id}`),
};

export const jobsAPI = {
    create: (data: any) => api.post('/jobs/create', data),
    getAll: () => api.get('/jobs/'),
    get: (id: number) => api.get(`/jobs/${id}`),
    rankCandidates: (jobId: number) => api.get(`/jobs/${jobId}/rank-candidates`),
};

export const aiAPI = {
    search: (query: string, top_k = 5) =>
        api.post('/ai/search', { query, top_k }),
    match: (data: any) => api.post('/ai/match', data),
    chat: (message: string) => api.post('/ai/chat', { message }),
    status: () => api.get('/ai/status'),
};

export default api;